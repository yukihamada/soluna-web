const express = require("express");
const compression = require("compression");
const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const { execFile } = require("child_process");

// ── Optional: Solana anchoring ───────────────────────────────────────────────
let solanaKeypair = null;
let solanaConnection = null;
try {
  const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
  const SOLANA_ANCHOR_KEY = process.env.SOLANA_ANCHOR_KEY;
  const SOLANA_RPC = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";
  if (SOLANA_ANCHOR_KEY) {
    solanaKeypair = Keypair.fromSecretKey(Buffer.from(SOLANA_ANCHOR_KEY, "base64"));
    solanaConnection = new Connection(SOLANA_RPC, "confirmed");
    console.log("✓ Solana anchoring enabled. Wallet:", solanaKeypair.publicKey.toBase58());
  } else {
    console.log("ℹ Solana anchoring disabled (set SOLANA_ANCHOR_KEY to enable)");
  }
} catch (e) {
  console.log("ℹ @solana/web3.js not available:", e.message);
}

// ── S3 (Tigris) storage ──────────────────────────────────────────────────────
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const S3_BUCKET = process.env.BUCKET_NAME || "";
const s3 = S3_BUCKET ? new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint: process.env.AWS_ENDPOINT_URL_S3 || "https://fly.storage.tigris.dev",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
}) : null;

async function s3Put(key, body, contentType) {
  if (!s3) throw new Error("S3 not configured");
  await s3.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: body, ContentType: contentType }));
}
async function s3Get(key) {
  if (!s3) return null;
  try {
    const resp = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    return resp;
  } catch (e) { if (e.name === "NoSuchKey") return null; throw e; }
}
async function s3Head(key) {
  if (!s3) return null;
  try {
    return await s3.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  } catch { return null; }
}

if (s3) console.log("✓ S3 storage enabled (Tigris bucket:", S3_BUCKET, ")");
else console.log("ℹ S3 not configured, using local /data/ storage");

// ── Local fallback dirs (for migration period + non-S3 environments) ─────────
const AUDIO_DIR = process.env.AUDIO_DIR || "/data/audio";
try { fs.mkdirSync(AUDIO_DIR, { recursive: true }); } catch {}
const COVERS_DIR = path.join("/data", "covers");
try { fs.mkdirSync(COVERS_DIR, { recursive: true }); } catch {}

// multer: temporarily store to disk, then upload to S3
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, AUDIO_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".mp3";
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".mp3", ".m4a", ".wav", ".ogg", ".flac", ".aac"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname, "out");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const RESEND_API_KEY    = process.env.RESEND_API_KEY    || "";
const ADMIN_KEY         = process.env.ADMIN_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ADMIN_EMAIL       = "info@solun.art";

if (!ADMIN_KEY) console.warn("⚠ ADMIN_KEY not set — admin endpoints will reject all requests");

const DATABASE_URL = process.env.DATABASE_URL
  || (process.env.DB_PATH ? `file:${process.env.DB_PATH}` : "file:/data/contracts.db");
const db = createClient({ url: DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });

async function sendAdminEmail(subject, html) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: "ZAMNA HAWAII <noreply@solun.art>", to: [ADMIN_EMAIL], subject, html }),
    });
  } catch (e) {
    console.error("Resend error:", e.message);
  }
}

// ── DB setup ─────────────────────────────────────────────────────────────────
async function initDb() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS submissions (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      contract_type     TEXT NOT NULL,
      name              TEXT,
      company           TEXT,
      email             TEXT,
      amount            TEXT,
      structure         TEXT,
      return_type       TEXT,
      sponsor_package   TEXT,
      contact_person    TEXT,
      signature         TEXT NOT NULL,
      lang              TEXT DEFAULT 'ja',
      paid              INTEGER DEFAULT 0,
      stripe_session_id TEXT,
      created_at        TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS email_signups (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT NOT NULL UNIQUE,
      locale     TEXT DEFAULT 'en',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS meeting_requests (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_type TEXT NOT NULL,
      name         TEXT,
      company      TEXT,
      email        TEXT,
      phone        TEXT,
      date         TEXT,
      time_slot    TEXT,
      message      TEXT,
      lang         TEXT DEFAULT 'ja',
      created_at   TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS task_overrides (
      task_key    TEXT PRIMARY KEY,
      status      TEXT NOT NULL,
      updated_by  TEXT,
      updated_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS admin_views (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      member    TEXT NOT NULL,
      viewed_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS nft_passes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      pass_type   TEXT NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      image_url   TEXT,
      claimed_by  TEXT,
      claimed_name TEXT,
      claimed_at  TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS vip_inquiries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      tier       TEXT NOT NULL,
      name       TEXT,
      email      TEXT NOT NULL,
      phone      TEXT,
      message    TEXT,
      lang       TEXT DEFAULT 'ja',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS activity_feed (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      member      TEXT NOT NULL,
      action_type TEXT NOT NULL,
      title       TEXT NOT NULL,
      description TEXT,
      category    TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS budget_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category    TEXT NOT NULL,
      item_ja     TEXT NOT NULL,
      item_en     TEXT NOT NULL,
      amount      REAL DEFAULT 0,
      currency    TEXT DEFAULT 'USD',
      type        TEXT NOT NULL,
      status      TEXT DEFAULT 'estimate',
      notes       TEXT,
      updated_by  TEXT,
      updated_at  TEXT DEFAULT (datetime('now')),
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS partners (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT,
      contact     TEXT NOT NULL,
      type_ja     TEXT,
      type_en     TEXT,
      status      TEXT DEFAULT 'pending',
      notes_ja    TEXT,
      notes_en    TEXT,
      email       TEXT,
      phone       TEXT,
      who         TEXT,
      instagram   TEXT,
      link        TEXT,
      updated_at  TEXT DEFAULT (datetime('now')),
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS feedback (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      page        TEXT,
      member      TEXT,
      category    TEXT,
      message     TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS task_comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      task_key    TEXT NOT NULL,
      member      TEXT NOT NULL,
      message     TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    // ── Music platform tables ──
    `CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT NOT NULL UNIQUE,
      password    TEXT NOT NULL,
      name        TEXT,
      plan        TEXT DEFAULT 'free',
      track_limit INTEGER DEFAULT 30,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS api_keys (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      key_hash    TEXT NOT NULL,
      name        TEXT DEFAULT 'default',
      last_used   TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS tracks (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      title       TEXT NOT NULL,
      artist      TEXT,
      duration_sec INTEGER,
      file_path   TEXT NOT NULL,
      file_size   INTEGER DEFAULT 0,
      format      TEXT DEFAULT 'mp3',
      genre       TEXT,
      bpm         INTEGER,
      public      INTEGER DEFAULT 1,
      play_count  INTEGER DEFAULT 0,
      isrc        TEXT UNIQUE,
      rights_status TEXT DEFAULT 'draft',
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS radios (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      name        TEXT NOT NULL,
      description TEXT,
      slug        TEXT UNIQUE,
      shuffle     INTEGER DEFAULT 0,
      public      INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS radio_tracks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      radio_id    TEXT NOT NULL REFERENCES radios(id),
      track_id    TEXT NOT NULL REFERENCES tracks(id),
      position    INTEGER DEFAULT 0,
      UNIQUE(radio_id, track_id)
    )`,
    // ── Rights & Royalty tables ──
    `CREATE TABLE IF NOT EXISTS rights_holders (
      id            TEXT PRIMARY KEY,
      user_id       TEXT REFERENCES users(id),
      name          TEXT NOT NULL,
      email         TEXT,
      email_verified INTEGER DEFAULT 0,
      verify_token  TEXT,
      payout_method TEXT DEFAULT 'pending',
      payout_info   TEXT,
      id_verified   INTEGER DEFAULT 0,
      balance       REAL DEFAULT 0,
      total_earned  REAL DEFAULT 0,
      escrow_balance REAL DEFAULT 0,
      created_at    TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS track_rights (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id        TEXT NOT NULL REFERENCES tracks(id),
      rights_holder_id TEXT NOT NULL REFERENCES rights_holders(id),
      role            TEXT DEFAULT 'creator',
      share_pct       REAL NOT NULL,
      status          TEXT DEFAULT 'pending',
      confirm_token   TEXT,
      confirmed_at    TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      UNIQUE(track_id, rights_holder_id)
    )`,
    `CREATE TABLE IF NOT EXISTS rights_disputes (
      id              TEXT PRIMARY KEY,
      track_id        TEXT NOT NULL REFERENCES tracks(id),
      filed_by_email  TEXT NOT NULL,
      filed_by_name   TEXT,
      reason          TEXT NOT NULL,
      evidence_url    TEXT,
      status          TEXT DEFAULT 'open',
      resolution      TEXT,
      resolved_at     TEXT,
      created_at      TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS rights_audit_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id    TEXT NOT NULL,
      action      TEXT NOT NULL,
      actor       TEXT,
      details     TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS royalty_events (
      id          TEXT PRIMARY KEY,
      track_id    TEXT NOT NULL REFERENCES tracks(id),
      event_type  TEXT NOT NULL,
      total_amount REAL NOT NULL,
      currency    TEXT DEFAULT 'JPY',
      metadata    TEXT,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS royalty_splits (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id        TEXT NOT NULL REFERENCES royalty_events(id),
      rights_holder_id TEXT NOT NULL REFERENCES rights_holders(id),
      amount          REAL NOT NULL,
      share_pct       REAL NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS payouts (
      id              TEXT PRIMARY KEY,
      rights_holder_id TEXT NOT NULL REFERENCES rights_holders(id),
      amount          REAL NOT NULL,
      currency        TEXT DEFAULT 'JPY',
      method          TEXT NOT NULL,
      status          TEXT DEFAULT 'pending',
      reference       TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      completed_at    TEXT
    )`,
    // ── Ticket system tables ──
    `CREATE TABLE IF NOT EXISTS ticket_types (
      id            TEXT PRIMARY KEY,
      name          TEXT NOT NULL,
      description   TEXT,
      price         INTEGER NOT NULL,
      currency      TEXT DEFAULT 'USD',
      quantity_total INTEGER DEFAULT 0,
      quantity_sold  INTEGER DEFAULT 0,
      sale_start    TEXT,
      sale_end      TEXT,
      max_per_order INTEGER DEFAULT 4,
      metadata      TEXT,
      active        INTEGER DEFAULT 1,
      created_at    TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS tickets (
      id              TEXT PRIMARY KEY,
      ticket_type_id  TEXT NOT NULL REFERENCES ticket_types(id),
      order_id        TEXT,
      owner_email     TEXT NOT NULL,
      owner_name      TEXT,
      owner_user_id   TEXT REFERENCES users(id),
      status          TEXT DEFAULT 'valid',
      qr_code         TEXT UNIQUE,
      checked_in      INTEGER DEFAULT 0,
      checked_in_at   TEXT,
      checked_in_by   TEXT,
      transferred_from TEXT,
      transfer_note   TEXT,
      stripe_session_id TEXT,
      metadata        TEXT,
      created_at      TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS ticket_orders (
      id              TEXT PRIMARY KEY,
      email           TEXT NOT NULL,
      name            TEXT,
      user_id         TEXT REFERENCES users(id),
      total_amount    INTEGER NOT NULL,
      currency        TEXT DEFAULT 'USD',
      stripe_session_id TEXT,
      stripe_payment_intent TEXT,
      status          TEXT DEFAULT 'pending',
      items           TEXT,
      created_at      TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS ticket_transfers (
      id              TEXT PRIMARY KEY,
      ticket_id       TEXT NOT NULL REFERENCES tickets(id),
      from_email      TEXT NOT NULL,
      to_email        TEXT NOT NULL,
      to_name         TEXT,
      status          TEXT DEFAULT 'pending',
      token           TEXT UNIQUE,
      message         TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      accepted_at     TEXT
    )`,
  ]);

  // Migrate existing DBs (idempotent)
  try { await db.execute("ALTER TABLE submissions ADD COLUMN paid INTEGER DEFAULT 0"); } catch {}
  try { await db.execute("ALTER TABLE submissions ADD COLUMN stripe_session_id TEXT"); } catch {}
  // Rights system migrations
  try { await db.execute("ALTER TABLE tracks ADD COLUMN isrc TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN rights_status TEXT DEFAULT 'draft'"); } catch {}
  try { await db.execute("ALTER TABLE track_rights ADD COLUMN status TEXT DEFAULT 'pending'"); } catch {}
  try { await db.execute("ALTER TABLE track_rights ADD COLUMN confirm_token TEXT"); } catch {}
  try { await db.execute("ALTER TABLE track_rights ADD COLUMN confirmed_at TEXT"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN email_verified INTEGER DEFAULT 0"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN verify_token TEXT"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN id_verified INTEGER DEFAULT 0"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN escrow_balance REAL DEFAULT 0"); } catch {}
  // Verification system migrations
  try { await db.execute("ALTER TABLE tracks ADD COLUMN audio_hash TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN fingerprint TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN anchor_tx TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN anchor_time TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN attested INTEGER DEFAULT 0"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN pro_org TEXT"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN pro_id TEXT"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN ipi_number TEXT"); } catch {}
  try { await db.execute("ALTER TABLE rights_holders ADD COLUMN isni TEXT"); } catch {}
  // Migrate existing free users to new limit
  try { await db.execute("UPDATE users SET track_limit = 30 WHERE plan = 'free' AND track_limit <= 10"); } catch {}
  // Metadata enrichment migrations
  try { await db.execute("ALTER TABLE tracks ADD COLUMN lyrics TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN album TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN release_year INTEGER"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN label TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN cover_url TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN tags TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN mb_id TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN acoustid TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN key_signature TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN time_signature TEXT"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN energy REAL"); } catch {}
  try { await db.execute("ALTER TABLE tracks ADD COLUMN language TEXT"); } catch {}

  // Seed initial passes if empty
  const count = (await db.execute("SELECT COUNT(*) as c FROM nft_passes")).rows[0];
  if (count.c === 0) {
    const passes = [
      ["artist", "Artist Pass #1", "Backstage access, rider info, production contacts", "/api/nft-image/artist/1"],
      ["artist", "Artist Pass #2", "Backstage access, rider info, production contacts", "/api/nft-image/artist/2"],
      ["artist", "Artist Pass #3", "Backstage access, rider info, production contacts", "/api/nft-image/artist/3"],
      ["artist", "Artist Pass #4", "Backstage access, rider info, production contacts", "/api/nft-image/artist/4"],
      ["artist", "Artist Pass #5", "Backstage access, rider info, production contacts", "/api/nft-image/artist/5"],
      ["vip", "VIP Pass #1", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/1"],
      ["vip", "VIP Pass #2", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/2"],
      ["vip", "VIP Pass #3", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/3"],
      ["vip", "VIP Pass #4", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/4"],
      ["vip", "VIP Pass #5", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/5"],
    ];
    for (const [type, name, desc, img] of passes) {
      await db.execute({ sql: "INSERT INTO nft_passes (pass_type, name, description, image_url) VALUES (?, ?, ?, ?)", args: [type, name, desc, img] });
    }
  }

  // Seed ticket types if empty
  const ticketCount = (await db.execute("SELECT COUNT(*) as c FROM ticket_types")).rows[0];
  if (ticketCount.c === 0) {
    const types = [
      { id: "ga-1day", name: "General Admission — 1 Day", description: "Single day access to all main stages", price: 12000, quantity_total: 5000, max_per_order: 6 },
      { id: "ga-2day", name: "General Admission — 2 Day Pass", description: "Full weekend access to all main stages", price: 20000, quantity_total: 3000, max_per_order: 6 },
      { id: "vip-1day", name: "VIP — 1 Day", description: "VIP lounge, premium viewing area, complimentary drinks, priority entry", price: 50000, quantity_total: 500, max_per_order: 4 },
      { id: "vip-2day", name: "VIP — 2 Day Pass", description: "Full weekend VIP with lounge, premium viewing, open bar, meet & greet", price: 85000, quantity_total: 300, max_per_order: 4 },
      { id: "backstage", name: "Backstage Experience", description: "All VIP perks + backstage access, artist meet & greet, exclusive after-party", price: 200000, quantity_total: 50, max_per_order: 2 },
    ];
    for (const t of types) {
      await db.execute({
        sql: "INSERT INTO ticket_types (id, name, description, price, currency, quantity_total, max_per_order) VALUES (?, ?, ?, ?, 'JPY', ?, ?)",
        args: [t.id, t.name, t.description, t.price, t.quantity_total, t.max_per_order],
      });
    }
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json());

// ── www → apex redirect ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.hostname === "www.solun.art") {
    return res.redirect(301, `https://solun.art${req.originalUrl}`);
  }
  next();
});

// ── API: Email signup ─────────────────────────────────────────────────────────
app.post("/api/email", async (req, res) => {
  const { email, locale } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }
  try {
    const result = await db.execute({ sql: "INSERT OR IGNORE INTO email_signups (email, locale) VALUES (?, ?)", args: [email.toLowerCase().trim(), locale || "en"] });
    if (result.rowsAffected > 0) {
      const isJa = (locale || "en") === "ja";
      sendAdminEmail(
        `[ZAMNA] 新規メール登録 — ${email}`,
        `<p>新しいメール登録がありました。</p><ul><li>メール: ${email}</li><li>言語: ${locale || "en"}</li></ul>`
      );
      // Confirmation to subscriber
      if (RESEND_API_KEY) {
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "ZAMNA HAWAII <noreply@solun.art>",
            to: [email],
            subject: isJa ? "ZAMNA HAWAII 2026 — ラインナップ通知に登録しました" : "ZAMNA HAWAII 2026 — You're on the list!",
            html: isJa
              ? `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">ZAMNA HAWAII 2026</p><h1 style="font-size:28px;margin:16px 0">ラインナップ通知に<br/>登録しました</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">アーティストラインナップが発表され次第、最初にお知らせします。<br/><br/>日程: 2026年9月4〜5日<br/>会場: モアナルアガーデン（Moanalua Gardens）, Oahu</p><a href="https://solun.art" style="display:inline-block;margin-top:28px;padding:12px 28px;background:#C9A962;color:#000;text-decoration:none;font-weight:700;border-radius:999px">公式サイトを見る</a><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:32px">© 2026 ZAMNA HAWAII · Powered by SOLUNA</p></div>`
              : `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">ZAMNA HAWAII 2026</p><h1 style="font-size:28px;margin:16px 0">You're on the list!</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">You'll be the first to know when the lineup drops.<br/><br/>Date: September 4–5, 2026<br/>Venue: Moanalua Gardens, Oahu, HI</p><a href="https://solun.art" style="display:inline-block;margin-top:28px;padding:12px 28px;background:#C9A962;color:#000;text-decoration:none;font-weight:700;border-radius:999px">Visit Official Site</a><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:32px">© 2026 ZAMNA HAWAII · Powered by SOLUNA</p></div>`,
          }),
        }).catch(() => {});
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: VIP Inquiry ──────────────────────────────────────────────────────────
app.post("/api/vip-inquiry", async (req, res) => {
  const { tier, name, email, phone, message, lang } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const result = await db.execute({
      sql: "INSERT INTO vip_inquiries (tier, name, email, phone, message, lang) VALUES (?,?,?,?,?,?)",
      args: [tier || "diamond", name || null, email, phone || null, message || null, lang || "ja"],
    });
    const isJa = (lang || "ja") === "ja";
    sendAdminEmail(
      `[ZAMNA] Diamond VIP お問い合わせ — ${name || email}`,
      `<p>Diamond VIP のお問い合わせが届きました。</p><ul><li>名前: ${name || "-"}</li><li>メール: ${email}</li><li>電話: ${phone || "-"}</li><li>メッセージ: ${message || "-"}</li></ul><p>管理画面: https://solun.art/admin</p>`
    );
    if (RESEND_API_KEY) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "ZAMNA HAWAII <noreply@solun.art>",
          to: [email],
          subject: isJa ? "ZAMNA HAWAII 2026 — Diamond VIP お問い合わせを受け付けました" : "ZAMNA HAWAII 2026 — Diamond VIP Inquiry Received",
          html: isJa
            ? `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">ZAMNA HAWAII 2026</p><h1 style="font-size:26px;margin:16px 0">Diamond VIP<br/>お問い合わせ受付</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">お問い合わせありがとうございます。<br/>24時間以内に担当者よりご連絡いたします。<br/><br/>Diamond VIPは限定10名様のプレミアムパッケージです。</p><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:32px">© 2026 ZAMNA HAWAII · Powered by SOLUNA</p></div>`
            : `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">ZAMNA HAWAII 2026</p><h1 style="font-size:26px;margin:16px 0">Diamond VIP<br/>Inquiry Received</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">Thank you for your interest in Diamond VIP.<br/>Our team will be in touch within 24 hours.<br/><br/>Diamond VIP is limited to 10 guests only.</p><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:32px">© 2026 ZAMNA HAWAII · Powered by SOLUNA</p></div>`,
        }),
      }).catch(() => {});
    }
    res.json({ ok: true, id: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Get email signups (admin) ────────────────────────────────────────────
app.get("/api/emails", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT * FROM email_signups ORDER BY created_at DESC");
  res.json(result.rows);
});

// ── API: Email blast (admin) ──────────────────────────────────────────────────
app.post("/api/email-blast", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  if (!RESEND_API_KEY) return res.status(503).json({ error: "RESEND_API_KEY not set" });

  const { subject, body_ja, body_en, test_email } = req.body;
  if (!subject || (!body_ja && !body_en)) {
    return res.status(400).json({ error: "subject and body required" });
  }

  // テスト送信モード
  if (test_email) {
    const html = makeBlastHtml(subject, body_ja || body_en, body_en || body_ja);
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ from: "ZAMNA HAWAII <noreply@solun.art>", to: [test_email], subject: `[TEST] ${subject}`, html }),
      });
      return res.json({ ok: true, sent: 1, mode: "test" });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // 全登録者へ送信
  const result = await db.execute("SELECT email, locale FROM email_signups");
  const rows = result.rows;
  let sent = 0, failed = 0;
  for (const row of rows) {
    const isJa = row.locale === "ja";
    const html = makeBlastHtml(subject, isJa ? (body_ja || body_en) : (body_en || body_ja), null);
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ from: "ZAMNA HAWAII <noreply@solun.art>", to: [row.email], subject, html }),
      });
      if (r.ok) sent++; else failed++;
    } catch { failed++; }
    // レート制限対策: 100ms待機
    await new Promise(r => setTimeout(r, 100));
  }
  res.json({ ok: true, sent, failed, total: rows.length });
});

function makeBlastHtml(subject, body, bodyEn) {
  return `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px 32px;max-width:520px;margin:0 auto">
  <p style="color:rgba(201,169,98,0.8);letter-spacing:0.3em;font-size:10px;text-transform:uppercase;margin-bottom:20px">ZAMNA HAWAII 2026</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 24px;line-height:1.3;color:#fff">${subject}</h1>
  <div style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.8;white-space:pre-line">${body}</div>
  ${bodyEn ? `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0"/>
  <div style="color:rgba(255,255,255,0.45);font-size:14px;line-height:1.8;white-space:pre-line">${bodyEn}</div>` : ""}
  <div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.07)">
    <a href="https://zamnahawaii.ticketblox.com" style="display:inline-block;padding:12px 28px;background:rgba(201,169,98,0.9);color:#000;font-weight:700;text-decoration:none;border-radius:999px;font-size:13px;letter-spacing:0.06em">チケットを取る / Get Tickets →</a>
  </div>
  <p style="color:rgba(255,255,255,0.12);font-size:10px;margin-top:28px;letter-spacing:0.06em">© 2026 ZAMNA HAWAII · Powered by SOLUNA · solun.art</p>
</div>`;
}

// ── API: Welcome email for new team member ───────────────────────────────────
app.post("/api/welcome-email", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  if (!RESEND_API_KEY) return res.status(503).json({ error: "RESEND_API_KEY not set" });

  const { member, email } = req.body;
  if (!member || !email || !email.includes("@")) {
    return res.status(400).json({ error: "member and valid email required" });
  }

  const MESSAGES = {
    "Sean Tsai": {
      greeting: "Sean, aloha!",
      message: "As the local lead and production manager, you're the backbone of ZAMNA HAWAII on the ground. From venue scouting with Sid to building political connections and managing Hawaii Stage & Lighting — your network is making this happen. Keep driving the production forward!",
      message_ja: "Seanさん、現地統括としてZAMNA HAWAIIの地上作戦の要です。Sidとの会場視察、政治ネットワークの構築、Hawaii Stage & Lightingとの交渉 — あなたのネットワークがこのイベントを実現させています。引き続きプロダクションを推進してください！",
    },
    "Sid": {
      greeting: "Sid, welcome aboard!",
      message: "Your venue assessment of Moanalua Gardens was outstanding — the detailed pros/cons analysis, the relationship with JP Damon, and the political strategy are exactly what we need. The Letter of Intent and city council approval are the critical next steps. Let's make this venue a reality!",
      message_ja: "Sidさん、Moanalua Gardensの会場評価は素晴らしかったです。詳細な長所/短所の分析、JP Damonとの関係構築、政治戦略 — まさに必要なものでした。Letter of Intentと市議会承認が次の重要ステップです。この会場を実現させましょう！",
    },
    "Vakas": {
      greeting: "Dr. Sial, welcome!",
      message: "Your investment and medical expertise bring a unique dimension to ZAMNA HAWAII. With your background spanning medicine, music conferences, and strategic partnerships — you're the perfect bridge between our business vision and execution. Your new role in artist relations will be key as we move into booking phase.",
      message_ja: "Vakasさん、あなたの投資と医療の専門知識はZAMNA HAWAIIにユニークな価値をもたらします。医学、音楽カンファレンス、戦略パートナーシップにまたがる経歴 — ビジネスビジョンと実行の橋渡し役として最適です。ブッキングフェーズに入るにあたり、アーティスト関係の新しい役割が鍵になります。",
    },
    "Keyanna": {
      greeting: "Keyanna, hey!",
      message: "You're the operational glue holding this team together — setting up accounts, coordinating schedules, documenting contacts, and keeping everyone connected. The Google Drive, partner spreadsheet, and team meetings all flow through you. Keep that coordination magic going!",
      message_ja: "Keyannaさん、あなたはこのチームをつなぐオペレーションの要です。アカウント設定、スケジュール調整、連絡先管理、チーム全体の連携 — Google Drive、パートナーシート、チームミーティングはすべてあなたを通じて機能しています。その調整力を引き続き発揮してください！",
    },
    "Yuki": {
      greeting: "Yuki, welcome to your own system!",
      message: "You built this entire platform — the admin dashboard, partner portal, document hub, and all the tech infrastructure. The solun.art site is now live on Fly.io with full SSR. Keep pushing the technology forward!",
      message_ja: "Yukiさん、管理ダッシュボード、パートナーポータル、ドキュメントハブ、全てのテクインフラを構築しました。solun.artはFly.ioでフルSSR稼働中。テクノロジーを引き続き前進させてください！",
    },
  };

  const m = MESSAGES[member] || {
    greeting: `Hey ${member}!`,
    message: `Welcome to the ZAMNA HAWAII team! We're building something incredible — a world-class electronic music festival in Oahu, September 4-5, 2026. Check out the admin dashboard to see the full project status.`,
    message_ja: `${member}さん、ZAMNA HAWAIIチームへようこそ！2026年9月4-5日、オアフ島で世界クラスのエレクトロニックミュージックフェスティバルを作り上げています。管理ダッシュボードでプロジェクトの全体状況をご確認ください。`,
  };

  const html = `<div style="background:#080808;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;padding:48px 32px;max-width:540px;margin:0 auto">
  <p style="color:rgba(201,169,98,0.8);letter-spacing:0.35em;font-size:10px;text-transform:uppercase;margin-bottom:28px">ZAMNA HAWAII 2026 · OPERATIONS</p>

  <h1 style="font-size:26px;font-weight:700;margin:0 0 24px;line-height:1.3;color:#fff">${m.greeting}</h1>

  <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.8;margin-bottom:24px">${m.message}</p>
  <p style="color:rgba(255,255,255,0.45);font-size:14px;line-height:1.8;margin-bottom:32px">${m.message_ja}</p>

  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0"/>

  <h2 style="font-size:16px;color:rgba(201,169,98,0.9);margin-bottom:16px">🐕 Solunadog からのご挨拶</h2>
  <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin-bottom:20px">
    Hi ${member}! I'm <strong style="color:rgba(201,169,98,0.9)">Solunadog</strong>, the AI assistant for ZAMNA HAWAII — part of the <a href="https://github.com/yukihamada/rustydog" style="color:rgba(201,169,98,0.8)">rustydog</a> AI dog pack. Here's what I can help with:
  </p>

  <div style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:18px 20px;margin-bottom:12px">
    <p style="color:rgba(74,222,128,0.85);font-size:12px;font-weight:700;letter-spacing:0.15em;margin-bottom:10px">✅ WHAT I CAN DO</p>
    <ul style="color:rgba(255,255,255,0.6);font-size:13px;line-height:2;margin:0;padding-left:18px">
      <li>Track project progress across 15 categories & 100+ tasks</li>
      <li>Generate & export documents (PDF: production plan, safety, budget, contracts)</li>
      <li>Manage partner contacts & CRM status</li>
      <li>Send email blasts to subscribers via Resend</li>
      <li>Process contract signatures (NDA, investment, sponsor)</li>
      <li>Show project timeline & Gantt chart</li>
      <li>Handle ticket links & VIP inquiries</li>
    </ul>
  </div>

  <div style="background:rgba(255,80,80,0.04);border:1px solid rgba(255,80,80,0.12);border-radius:12px;padding:18px 20px;margin-bottom:28px">
    <p style="color:rgba(255,80,80,0.85);font-size:12px;font-weight:700;letter-spacing:0.15em;margin-bottom:10px">⚠ WHAT I CAN'T DO (YET)</p>
    <ul style="color:rgba(255,255,255,0.6);font-size:13px;line-height:2;margin:0;padding-left:18px">
      <li>Process payments directly (Stripe checkout links only)</li>
      <li>Manage artist bookings or send offers (handled by JC ZAMNA)</li>
      <li>Access external systems (Ticketblox sales data, hotel inventory)</li>
      <li>Make phone calls or send SMS</li>
      <li>Manage social media accounts</li>
    </ul>
  </div>

  <a href="https://solun.art/admin" style="display:inline-block;padding:14px 32px;background:rgba(201,169,98,0.9);color:#000;font-weight:700;text-decoration:none;border-radius:999px;font-size:14px;letter-spacing:0.06em">Open Admin Dashboard →</a>

  <div style="margin-top:36px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)">
    <p style="color:rgba(255,255,255,0.25);font-size:11px;line-height:1.6">
      Quick links:
      <a href="https://drive.google.com/drive/folders/0AFx6F488-MxQUk9PVA" style="color:rgba(201,169,98,0.5)">Google Drive</a> ·
      <a href="https://docs.google.com/spreadsheets/d/1vcUVIE7CX4Lvb_MJphHPy2ZJ8_Z3RZv_A3vwZ3ybUsA/edit?gid=1147233400#gid=1147233400" style="color:rgba(201,169,98,0.5)">Partner List</a> ·
      <a href="https://zamnahawaii.ticketblox.com" style="color:rgba(201,169,98,0.5)">Tickets</a> ·
      <a href="https://solun.art/budget" style="color:rgba(201,169,98,0.5)">Budget</a>
    </p>
    <p style="color:rgba(255,255,255,0.12);font-size:10px;margin-top:16px;letter-spacing:0.06em">
      © 2026 ZAMNA HAWAII · Powered by SOLUNA · solun.art<br/>
      🐕 Sent by Solunadog (rustydog AI pack)
    </p>
  </div>
</div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "ZAMNA HAWAII <noreply@solun.art>",
        to: [email],
        subject: `Welcome to ZAMNA HAWAII Operations — ${member}`,
        html,
      }),
    });
    if (r.ok) {
      sendAdminEmail(
        `[ZAMNA] チームメンバー初回ログイン — ${member}`,
        `<p><strong>${member}</strong> が管理画面に初回ログインし、ウェルカムメールを送信しました。</p><ul><li>メール: ${email}</li></ul>`
      );
      res.json({ ok: true });
    } else {
      const err = await r.text();
      res.status(500).json({ error: err });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: NFT Passes ──────────────────────────────────────────────────────────
// List available (unclaimed) passes
app.get("/api/nft-passes", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT id, pass_type, name, description, image_url FROM nft_passes WHERE claimed_by IS NULL ORDER BY pass_type, id");
  res.json(result.rows);
});

// List claimed passes (for admin view)
app.get("/api/nft-passes/claimed", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT id, pass_type, name, claimed_by, claimed_name, claimed_at FROM nft_passes WHERE claimed_by IS NOT NULL ORDER BY claimed_at DESC");
  res.json(result.rows);
});

// Claim a pass
app.post("/api/nft-passes/:id/claim", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

  const { wallet, member } = req.body;
  if (!wallet) return res.status(400).json({ error: "wallet address required" });

  const passResult = await db.execute({ sql: "SELECT * FROM nft_passes WHERE id = ?", args: [req.params.id] });
  const pass = passResult.rows[0];
  if (!pass) return res.status(404).json({ error: "Pass not found" });
  if (pass.claimed_by) return res.status(409).json({ error: "Already claimed" });

  await db.execute({
    sql: "UPDATE nft_passes SET claimed_by = ?, claimed_name = ?, claimed_at = datetime('now') WHERE id = ?",
    args: [wallet, member || null, req.params.id],
  });

  sendAdminEmail(
    `[ZAMNA] NFT Pass Claimed — ${pass.name}`,
    `<p><strong>${member || "Unknown"}</strong> claimed <strong>${pass.name}</strong></p><ul><li>Wallet: ${wallet}</li><li>Type: ${pass.pass_type}</li></ul>`
  );

  res.json({ ok: true, pass: { ...pass, claimed_by: wallet, claimed_name: member } });
});

// SVG-based NFT pass image
app.get("/api/nft-image/:type/:num", (req, res) => {
  const { type, num } = req.params;
  const isArtist = type === "artist";
  const color = isArtist ? "#4ade80" : "#C9A962";
  const title = isArtist ? "ARTIST PASS" : "VIP PASS";
  const symbol = isArtist ? "ZART" : "ZVIP";

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a0a0a"/><stop offset="100%" stop-color="#1a1a2e"/></linearGradient></defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <rect x="20" y="20" width="360" height="360" rx="24" fill="none" stroke="${color}" stroke-width="1" opacity="0.3"/>
  <text x="200" y="100" text-anchor="middle" fill="${color}" font-family="sans-serif" font-size="11" letter-spacing="8" opacity="0.6">ZAMNA HAWAII</text>
  <text x="200" y="170" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="36" font-weight="700" letter-spacing="4">${title}</text>
  <text x="200" y="210" text-anchor="middle" fill="${color}" font-family="monospace" font-size="48" font-weight="700">#${num}</text>
  <text x="200" y="260" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="sans-serif" font-size="12" letter-spacing="3">${symbol} · SEP 4-5, 2026</text>
  <text x="200" y="290" text-anchor="middle" fill="rgba(255,255,255,0.2)" font-family="sans-serif" font-size="10" letter-spacing="2">MOANALUA GARDENS · OAHU</text>
  <text x="200" y="350" text-anchor="middle" fill="rgba(255,255,255,0.15)" font-family="sans-serif" font-size="9" letter-spacing="4">SOLANA · DEVNET</text>
</svg>`);
});

// ── API: Meeting request ──────────────────────────────────────────────────────
app.post("/api/meeting", async (req, res) => {
  const { meetingType, name, company, email, phone, date, timeSlot, message, lang } = req.body;
  if (!meetingType || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = await db.execute({
      sql: "INSERT INTO meeting_requests (meeting_type, name, company, email, phone, date, time_slot, message, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [meetingType, name || null, company || null, email, phone || null, date || null, timeSlot || null, message || null, lang || "ja"],
    });
    sendAdminEmail(
      `[ZAMNA] ミーティング予約 — ${meetingType}`,
      `<p>新しいミーティングリクエストが届きました。</p><ul><li>種別: ${meetingType}</li><li>名前: ${name || "-"}</li><li>会社: ${company || "-"}</li><li>メール: ${email}</li><li>日付: ${date || "-"} ${timeSlot || ""}</li></ul><p>管理画面: https://solun.art/admin</p>`
    );
    res.json({ ok: true, id: Number(result.lastInsertRowid) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Get meetings (admin) ─────────────────────────────────────────────────
app.get("/api/meetings", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT * FROM meeting_requests ORDER BY created_at DESC");
  res.json(result.rows);
});

// ── API: Submit contract ──────────────────────────────────────────────────────
app.post("/api/submit", async (req, res) => {
  const {
    contractType, name, company, email, amount,
    structure, returnType, sponsorPackage, contactPerson, signature, lang,
  } = req.body;

  if (!contractType || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const result = await db.execute({
    sql: `INSERT INTO submissions
      (contract_type, name, company, email, amount, structure, return_type,
       sponsor_package, contact_person, signature, lang)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      contractType,
      name || null, company || null, email || null, amount || null,
      structure || null, returnType || null, sponsorPackage || null,
      contactPerson || null, signature, lang || "ja",
    ],
  });

  const submissionId = Number(result.lastInsertRowid);
  const isJa = (lang || "ja") === "ja";
  const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  const TYPE_LABELS = {
    nda:        { ja: "秘密保持契約（NDA）", en: "Non-Disclosure Agreement (NDA)" },
    investment: { ja: "投資契約", en: "Investment Agreement" },
    sponsor:    { ja: "スポンサー契約", en: "Sponsorship Agreement" },
  };
  const typeLabel = TYPE_LABELS[contractType] || { ja: contractType, en: contractType };

  // Admin notification
  sendAdminEmail(
    `[ZAMNA] 新しい契約申込 — ${contractType}`,
    `<p>新しい契約申込が届きました。</p><ul><li>種別: ${contractType}</li><li>会社: ${company || "-"}</li><li>名前: ${name || "-"}</li><li>メール: ${email || "-"}</li><li>金額: ${amount || "-"}</li><li>署名: ${signature}</li><li>日時: ${now}</li><li>ID: #${submissionId}</li></ul><p>管理画面: <a href="https://solun.art/admin">solun.art/admin</a></p>`
  );

  // Confirmation email to signer
  if (email && email.includes("@") && RESEND_API_KEY) {
    const detailRows = [
      { label: isJa ? "契約種別" : "Contract Type", value: isJa ? typeLabel.ja : typeLabel.en },
      { label: isJa ? "署名者" : "Signed by", value: signature },
      name ? { label: isJa ? "氏名" : "Name", value: name } : null,
      company ? { label: isJa ? "会社名" : "Company", value: company } : null,
      amount ? { label: isJa ? "金額" : "Amount", value: amount } : null,
      structure ? { label: isJa ? "投資構造" : "Structure", value: structure } : null,
      returnType ? { label: isJa ? "リターン方式" : "Return Type", value: returnType } : null,
      sponsorPackage ? { label: isJa ? "スポンサーパッケージ" : "Sponsor Package", value: sponsorPackage } : null,
      contactPerson ? { label: isJa ? "担当者" : "Contact Person", value: contactPerson } : null,
      { label: isJa ? "契約日時" : "Date & Time", value: now },
      { label: isJa ? "契約番号" : "Contract ID", value: `#${submissionId}` },
    ].filter(Boolean);

    const detailHtml = detailRows.map(r =>
      `<tr><td style="padding:8px 12px;color:rgba(255,255,255,0.4);font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06);white-space:nowrap">${r.label}</td><td style="padding:8px 12px;color:#fff;font-size:13px;font-weight:500;border-bottom:1px solid rgba(255,255,255,0.06)">${r.value}</td></tr>`
    ).join("");

    const confirmHtml = `<div style="background:#080808;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;padding:48px 28px;max-width:540px;margin:0 auto">
  <p style="color:rgba(201,169,98,0.8);letter-spacing:0.35em;font-size:10px;text-transform:uppercase;margin-bottom:24px">ZAMNA HAWAII 2026</p>
  <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;color:#fff">${isJa ? "契約受付完了" : "Contract Received"}</h1>
  <p style="color:rgba(255,255,255,0.5);font-size:14px;margin-bottom:28px">${isJa ? "以下の内容で契約を受け付けました。本メールが正式な受付証明となります。" : "Your contract has been received. This email serves as your official confirmation."}</p>

  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;margin-bottom:24px">
    <div style="padding:14px 16px;background:rgba(201,169,98,0.08);border-bottom:1px solid rgba(201,169,98,0.15)">
      <p style="color:rgba(201,169,98,0.9);font-size:12px;font-weight:700;letter-spacing:0.1em">${isJa ? typeLabel.ja : typeLabel.en}</p>
    </div>
    <table style="width:100%;border-collapse:collapse">${detailHtml}</table>
  </div>

  <div style="background:rgba(74,222,128,0.05);border:1px solid rgba(74,222,128,0.15);border-radius:12px;padding:16px 18px;margin-bottom:24px">
    <p style="color:rgba(74,222,128,0.85);font-size:12px;font-weight:700;margin-bottom:6px">${isJa ? "✅ 法的記録" : "✅ Legal Record"}</p>
    <p style="color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6">${isJa
      ? "本契約はサーバー側でタイムスタンプ付きで記録されており、法的証拠として有効です。契約内容に関するお問い合わせは info@solun.art までご連絡ください。"
      : "This contract is recorded server-side with timestamps and serves as a legal record. For questions, contact info@solun.art."}</p>
  </div>

  <p style="color:rgba(255,255,255,0.3);font-size:12px;line-height:1.6;margin-bottom:20px">${isJa
    ? "24時間以内に担当者からご連絡いたします。"
    : "Our team will follow up within 24 hours."}</p>

  <a href="https://solun.art/investor" style="display:inline-block;padding:12px 28px;background:rgba(201,169,98,0.9);color:#000;text-decoration:none;font-weight:700;border-radius:999px;font-size:13px">${isJa ? "投資家ページを見る" : "View Investor Page"} →</a>

  <div style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06)">
    <p style="color:rgba(255,255,255,0.12);font-size:10px;letter-spacing:0.06em">© 2026 ZAMNA HAWAII · Powered by SOLUNA · solun.art</p>
  </div>
</div>`;

    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "ZAMNA HAWAII <noreply@solun.art>",
        to: [email],
        subject: isJa
          ? `【ZAMNA HAWAII】${typeLabel.ja} — 受付完了 (#${submissionId})`
          : `ZAMNA HAWAII — ${typeLabel.en} Confirmation (#${submissionId})`,
        html: confirmHtml,
      }),
    }).catch(() => {});
  }

  res.json({ ok: true, id: submissionId });
});

// ── API: Stripe Checkout ──────────────────────────────────────────────────────
app.post("/api/checkout", async (req, res) => {
  if (!STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Payment not configured" });
  }
  const stripe = require("stripe")(STRIPE_SECRET_KEY);
  const { contractType, sponsorPackage, submissionId } = req.body;

  // Amount in cents (USD)
  const AMOUNTS = {
    investment:        20000000, // $200,000
    sponsor_presenting: 10000000, // $100,000
    sponsor_artist:     5000000, // $50,000
    sponsor_vip:        2000000, // $20,000
  };
  const NAMES = {
    investment:        "ZAMNA HAWAII 2026 — Investment Partner",
    sponsor_presenting: "ZAMNA HAWAII 2026 — Presenting Partner ($100K+)",
    sponsor_artist:    "ZAMNA HAWAII 2026 — Artist Stage Partner ($50K)",
    sponsor_vip:       "ZAMNA HAWAII 2026 — VIP Lounge Partner ($20K)",
  };

  const key = contractType === "investment" ? "investment" : `sponsor_${sponsorPackage}`;
  const unitAmount = AMOUNTS[key];
  if (!unitAmount) {
    return res.status(400).json({ error: "Custom amount: please contact us directly" });
  }

  const origin = `${req.protocol}://${req.headers.host}`;
  const successUrl = `${origin}/contract?paid=true&session_id={CHECKOUT_SESSION_ID}${submissionId ? `&sid=${submissionId}` : ""}`;
  const cancelUrl  = `${origin}/contract?cancelled=true`;

  // $20K (2000000 cents) → card only; $50K+ → card + ACH bank account
  const paymentMethods = unitAmount >= 5000000
    ? ["card", "us_bank_account"]
    : ["card"];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: NAMES[key] },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        submissionId: String(submissionId || ""),
        contractType,
        sponsorPackage: sponsorPackage || "",
      },
    });
    res.json({ url: session.url, amount: unitAmount, paymentMethods });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── API: Verify payment ───────────────────────────────────────────────────────
app.get("/api/verify-payment", async (req, res) => {
  if (!STRIPE_SECRET_KEY) return res.status(503).json({ error: "Payment not configured" });
  const stripe = require("stripe")(STRIPE_SECRET_KEY);
  const { session_id, sid } = req.query;
  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";
    if (paid && sid) {
      await db.execute({
        sql: "UPDATE submissions SET paid = 1, stripe_session_id = ? WHERE id = ?",
        args: [session_id, Number(sid)],
      });
    }
    res.json({ paid, amount: session.amount_total, currency: session.currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Get submissions (admin) ──────────────────────────────────────────────
app.get("/api/submissions", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const result = await db.execute("SELECT * FROM submissions ORDER BY created_at DESC");
  res.json(result.rows);
});

// ── API: Task overrides (admin) ──────────────────────────────────────────────
app.get("/api/task-overrides", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT * FROM task_overrides");
  res.json(result.rows);
});

app.put("/api/task-overrides/:taskKey", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { status, updated_by } = req.body;
  if (!status) return res.status(400).json({ error: "status required" });
  await db.execute({
    sql: `INSERT INTO task_overrides (task_key, status, updated_by, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(task_key) DO UPDATE SET status=excluded.status, updated_by=excluded.updated_by, updated_at=excluded.updated_at`,
    args: [req.params.taskKey, status, updated_by || null],
  });
  res.json({ ok: true });
});

// ── API: Admin views (admin) ────────────────────────────────────────────────
app.post("/api/admin-views", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { member } = req.body;
  if (!member) return res.status(400).json({ error: "member required" });
  await db.execute({ sql: "INSERT INTO admin_views (member) VALUES (?)", args: [member] });
  res.json({ ok: true });
});

app.get("/api/admin-views", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute(
    `SELECT member, MAX(viewed_at) as last_viewed
     FROM admin_views GROUP BY member ORDER BY last_viewed DESC`
  );
  res.json(result.rows);
});

// ── API: Admin DB cleanup ────────────────────────────────────────────────────
app.post("/api/admin/cleanup", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { table, where } = req.body;
  const allowed = ["submissions", "email_signups", "meeting_requests", "vip_inquiries", "nft_passes"];
  if (!allowed.includes(table)) return res.status(400).json({ error: "Invalid table" });
  if (!where || typeof where !== "object") return res.status(400).json({ error: "where clause required" });

  const keys = Object.keys(where);
  const clause = keys.map(k => `${k} = ?`).join(" AND ");
  const vals = keys.map(k => where[k]);
  const result = await db.execute({ sql: `DELETE FROM ${table} WHERE ${clause}`, args: vals });
  res.json({ ok: true, deleted: result.rowsAffected });
});

app.post("/api/admin/reset-nft", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "id required" });
  await db.execute({ sql: "UPDATE nft_passes SET claimed_by=NULL, claimed_name=NULL, claimed_at=NULL WHERE id=?", args: [id] });
  res.json({ ok: true });
});

// ── API: Activity Feed ──────────────────────────────────────────────────────
app.get("/api/activity", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const result = await db.execute({ sql: "SELECT * FROM activity_feed ORDER BY created_at DESC LIMIT ?", args: [limit] });
  res.json(result.rows);
});

app.post("/api/activity", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { member, action_type, title, description, category } = req.body;
  if (!member || !title) return res.status(400).json({ error: "member and title required" });
  const result = await db.execute({
    sql: "INSERT INTO activity_feed (member, action_type, title, description, category) VALUES (?,?,?,?,?)",
    args: [member, action_type || "update", title, description || null, category || null],
  });
  res.json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.delete("/api/activity/:id", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  await db.execute({ sql: "DELETE FROM activity_feed WHERE id = ?", args: [req.params.id] });
  res.json({ ok: true });
});

// ── API: Budget Items ───────────────────────────────────────────────────────
app.get("/api/budget", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT * FROM budget_items ORDER BY category, id");
  res.json(result.rows);
});

app.post("/api/budget", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { category, item_ja, item_en, amount, currency, type, status, notes, updated_by } = req.body;
  if (!category || !item_ja || !type) return res.status(400).json({ error: "category, item_ja, type required" });
  const result = await db.execute({
    sql: `INSERT INTO budget_items (category, item_ja, item_en, amount, currency, type, status, notes, updated_by)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [category, item_ja, item_en || item_ja, amount || 0, currency || "USD", type, status || "estimate", notes || null, updated_by || null],
  });
  res.json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.put("/api/budget/:id", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { category, item_ja, item_en, amount, currency, type, status, notes, updated_by } = req.body;
  await db.execute({
    sql: `UPDATE budget_items SET category=?, item_ja=?, item_en=?, amount=?, currency=?, type=?, status=?, notes=?, updated_by=?, updated_at=datetime('now') WHERE id=?`,
    args: [category, item_ja, item_en, amount, currency, type, status, notes, updated_by || null, req.params.id],
  });
  res.json({ ok: true });
});

app.delete("/api/budget/:id", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  await db.execute({ sql: "DELETE FROM budget_items WHERE id = ?", args: [req.params.id] });
  res.json({ ok: true });
});

// ── API: Partners (CRUD) ────────────────────────────────────────────────────
app.get("/api/partners", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT * FROM partners ORDER BY status, name");
  res.json(result.rows);
});

app.post("/api/partners", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { name, contact, type_ja, type_en, status, notes_ja, notes_en, email, phone, who, instagram, link } = req.body;
  if (!contact) return res.status(400).json({ error: "contact required" });
  const result = await db.execute({
    sql: `INSERT INTO partners (name, contact, type_ja, type_en, status, notes_ja, notes_en, email, phone, who, instagram, link)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [name||null, contact, type_ja||null, type_en||null, status||"pending", notes_ja||null, notes_en||null, email||null, phone||null, who||null, instagram||null, link||null],
  });
  res.json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.put("/api/partners/:id", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { name, contact, type_ja, type_en, status, notes_ja, notes_en, email, phone, who, instagram, link } = req.body;
  await db.execute({
    sql: `UPDATE partners SET name=?, contact=?, type_ja=?, type_en=?, status=?, notes_ja=?, notes_en=?, email=?, phone=?, who=?, instagram=?, link=?, updated_at=datetime('now') WHERE id=?`,
    args: [name, contact, type_ja, type_en, status, notes_ja, notes_en, email, phone, who, instagram, link, req.params.id],
  });
  res.json({ ok: true });
});

app.delete("/api/partners/:id", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  await db.execute({ sql: "DELETE FROM partners WHERE id = ?", args: [req.params.id] });
  res.json({ ok: true });
});

// ── API: Task Comments ──────────────────────────────────────────────────────
app.get("/api/task-comments", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT * FROM task_comments ORDER BY created_at DESC");
  res.json(result.rows);
});

app.post("/api/task-comments", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { task_key, member, message } = req.body;
  if (!task_key || !member || !message) return res.status(400).json({ error: "task_key, member, message required" });
  const result = await db.execute({
    sql: "INSERT INTO task_comments (task_key, member, message) VALUES (?,?,?)",
    args: [task_key, member, message],
  });
  res.json({ ok: true, id: Number(result.lastInsertRowid) });
});

app.delete("/api/task-comments/:id", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  await db.execute({ sql: "DELETE FROM task_comments WHERE id = ?", args: [req.params.id] });
  res.json({ ok: true });
});

// ── API: Feedback ───────────────────────────────────────────────────────────
app.get("/api/feedback", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const result = await db.execute("SELECT * FROM feedback ORDER BY created_at DESC LIMIT 100");
  res.json(result.rows);
});

app.post("/api/feedback", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { page, member, category, message } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });
  const result = await db.execute({
    sql: "INSERT INTO feedback (page, member, category, message) VALUES (?,?,?,?)",
    args: [page || null, member || null, category || "general", message],
  });
  res.json({ ok: true, id: Number(result.lastInsertRowid) });
});

// ── API: Agent Chat ─────────────────────────────────────────────────────────
app.post("/api/agent/chat", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  if (!ANTHROPIC_API_KEY) return res.status(503).json({ error: "ANTHROPIC_API_KEY not set" });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages required" });

  // Gather DB context
  let dbContext = "";
  let sqlResults = "";
  try {
    const [partners, tasks, activity, budget, comments] = await Promise.all([
      db.execute("SELECT name, contact, type_en, status, notes_en, who FROM partners ORDER BY status LIMIT 40"),
      db.execute("SELECT task_key, status, updated_by, updated_at FROM task_overrides ORDER BY updated_at DESC LIMIT 30"),
      db.execute("SELECT member, action_type, title, description, created_at FROM activity_feed ORDER BY created_at DESC LIMIT 20"),
      db.execute("SELECT category, item_en, amount, type, status FROM budget_items ORDER BY category LIMIT 30"),
      db.execute("SELECT task_key, member, message, created_at FROM task_comments ORDER BY created_at DESC LIMIT 20"),
    ]);
    dbContext = `
## Current DB State
### Partners (${partners.rows.length}): ${JSON.stringify(partners.rows.map(r => `${r.contact}(${r.status})`).join(", "))}
### Recent Task Updates: ${JSON.stringify(tasks.rows.slice(0, 10))}
### Recent Activity: ${JSON.stringify(activity.rows.slice(0, 10))}
### Budget Items: ${JSON.stringify(budget.rows)}
### Recent Comments: ${JSON.stringify(comments.rows.slice(0, 10))}`;
  } catch (e) { dbContext = "(DB query failed: " + e.message + ")"; }

  // Check if user is asking to query/update DB
  const lastMsg = messages[messages.length - 1]?.content || "";
  if (/SELECT|INSERT|UPDATE|DELETE|sql/i.test(lastMsg) && /partner|task|budget|activity|comment/i.test(lastMsg)) {
    // Extract and run safe SELECT queries only
    const sqlMatch = lastMsg.match(/```sql\s*(SELECT[^`]+)```/i);
    if (sqlMatch) {
      try {
        const result = await db.execute(sqlMatch[1].trim());
        sqlResults = JSON.stringify(result.rows.slice(0, 50));
      } catch (e) { sqlResults = "SQL Error: " + e.message; }
    }
  }

  const systemPrompt = `You are the ZAMNA HAWAII 2026 AI assistant (Solunadog). You help the operations team manage the festival.
Event: ZAMNA HAWAII, Sep 4-5 2026, Moanalua Gardens, Oahu. Capacity 9,000/day.
Team: Sean Tsai (local lead), Sid (venue/gov), Dr. Vakas Sial (finance/artists), Keyanna (ops), Yuki (tech).
Key partners: JP Damon (venue owner), JC/Enzo/Victor (ZAMNA talent), Gabe (F&B), Ticketblox/Anup (tickets), Kuhio Lewis (stage/lighting/council).
Respond concisely in the same language as the user (Japanese or English). Use the DB data below to answer questions accurately.
${dbContext}
${sqlResults ? "\n### SQL Query Result:\n" + sqlResults : ""}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await r.json();
    if (data.content && data.content[0]) {
      res.json({ response: data.content[0].text, sql_results: sqlResults || null });
    } else {
      res.json({ error: data.error?.message || "No response from AI" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── OG image (static export generates extensionless file) ────────────────────
app.get("/opengraph-image", (_req, res) => {
  const img = path.join(STATIC_DIR, "opengraph-image");
  if (fs.existsSync(img)) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(img);
  } else {
    res.status(404).send("Not found");
  }
});

// ── Static assets ─────────────────────────────────────────────────────────────
app.use("/_next",  express.static(path.join(STATIC_DIR, "_next"), { maxAge: "365d", immutable: true }));
app.use("/assets", express.static(path.join(STATIC_DIR, "assets")));
app.use("/videos", express.static(path.join(STATIC_DIR, "videos"), { maxAge: "1d" }));
app.use("/audio",  express.static(path.join(STATIC_DIR, "audio"),  { maxAge: "1d" }));
app.use("/images", express.static(path.join(STATIC_DIR, "images"), { maxAge: "7d" }));
// Uploaded audio files are served via /api/v1/tracks/:id/stream (with range support)

// AudioWorklet — must be served as application/javascript, no long cache
app.get("/soluna-worklet.js", (_req, res) => {
  const f = path.join(STATIC_DIR, "soluna-worklet.js");
  if (fs.existsSync(f)) {
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(f);
  } else {
    res.status(404).json({ error: "worklet not found" });
  }
});

// ── Radio player page (/radio/:slug) — server-rendered ───────────────────────
app.get(["/radio/:slug", "/radio/:slug/"], async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT * FROM radios WHERE slug = ?",
    args: [req.params.slug],
  })).rows[0];
  if (!radio || (!radio.public && !req.headers["x-admin-key"])) {
    return res.status(404).send("Radio not found");
  }

  let tracks = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, t.genre, t.duration_sec, t.cover_url, t.album, t.bpm,
                 t.rights_status, t.isrc, t.audio_hash, t.anchor_tx, rt.position
          FROM radio_tracks rt JOIN tracks t ON t.id = rt.track_id
          WHERE rt.radio_id = ? ORDER BY rt.position`,
    args: [radio.id],
  })).rows;

  const tracksJson = JSON.stringify(tracks.map(t => ({
    id: t.id, title: t.title, artist: t.artist, genre: t.genre || "",
    stream_url: `/api/v1/tracks/${t.id}/stream?via=radio`,
    proof_url: `/api/v1/tracks/${t.id}/proof`,
    lyrics_url: `/api/v1/tracks/${t.id}/lyrics`,
    cover_url: t.cover_url || null,
    album: t.album || null,
    bpm: t.bpm || null,
    isrc: t.isrc,
    rights_status: t.rights_status || "draft",
    has_hash: !!t.audio_hash,
    on_chain: !!t.anchor_tx,
  })));

  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${radio.name} — SOLUNA</title>
<meta name="theme-color" content="#050608">
<meta property="og:title" content="${radio.name} — SOLUNA">
<meta property="og:description" content="${radio.description || "Listen on SOLUNA"}">
<meta property="og:type" content="music.radio_station">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--gold:#C9A962;--gold-dim:rgba(201,169,98,.15);--bg:#050608;--surface:rgba(255,255,255,.03);--border:rgba(255,255,255,.06)}
body{background:var(--bg);color:#fff;font-family:'Inter',-apple-system,sans-serif;min-height:100vh;min-height:100dvh;display:grid;grid-template-columns:1fr minmax(0,440px) 1fr;grid-template-rows:auto 1fr auto}
@media(max-width:600px){body{grid-template-columns:0 1fr 0}}
header{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;padding:18px 28px;border-bottom:1px solid var(--border)}
header a{color:var(--gold);text-decoration:none;font-size:12px;letter-spacing:5px;font-weight:700}
.share-btn{background:rgba(201,169,98,.1);border:1px solid rgba(201,169,98,.2);color:var(--gold);font-size:11px;padding:6px 14px;border-radius:20px;cursor:pointer;letter-spacing:1px;transition:all .2s}
.share-btn:hover{background:rgba(201,169,98,.2)}
.share-btn.copied{background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.3);color:#4ade80}
main{grid-column:2;padding:32px 20px 40px}
.now-playing{text-align:center;margin-bottom:28px}
.art{width:min(260px,70vw);height:min(260px,70vw);border-radius:24px;background:linear-gradient(135deg,rgba(201,169,98,.07),rgba(139,92,246,.05));border:1px solid rgba(201,169,98,.12);margin:0 auto 24px;position:relative;overflow:hidden;transition:box-shadow .6s}
.art.active{box-shadow:0 24px 80px rgba(201,169,98,.12),0 0 0 1px rgba(201,169,98,.15)}
.ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(201,169,98,.05);top:50%;left:50%;transform:translate(-50%,-50%)}
.art.active .ring:nth-child(1){width:70%;height:70%;animation:spin 12s linear infinite}
.art.active .ring:nth-child(2){width:90%;height:90%;animation:spin 18s linear infinite reverse}
.art.active .ring:nth-child(3){width:110%;height:110%;animation:spin 24s linear infinite}
.art-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
#cur-title{font-size:18px;font-weight:700;line-height:1.2;margin-bottom:6px;text-align:center}
#cur-artist{font-size:13px;color:rgba(255,255,255,.4)}
#cur-genre{font-size:9px;letter-spacing:2px;text-transform:uppercase;background:var(--gold-dim);color:var(--gold);padding:3px 10px;border-radius:20px;margin-top:8px;display:none}
.prog-wrap{padding:0 4px;margin-bottom:4px;cursor:pointer}
.prog-bg{height:3px;background:rgba(255,255,255,.06);border-radius:2px;position:relative}
.prog-fill{position:absolute;left:0;top:0;height:100%;background:linear-gradient(90deg,var(--gold),rgba(201,169,98,.6));border-radius:2px;width:0;transition:width .15s linear}
.times{display:flex;justify-content:space-between;font-size:9px;color:rgba(255,255,255,.2);font-family:monospace;padding:0 4px;margin-bottom:20px}
.controls{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:8px}
.ctrl{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.4);padding:8px;border-radius:50%;transition:all .15s;display:flex}
.ctrl:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.05)}
.ctrl-play{width:54px;height:54px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,var(--gold),#a88b3d);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(201,169,98,.3);transition:transform .1s,box-shadow .2s}
.ctrl-play:hover{transform:scale(1.04);box-shadow:0 8px 32px rgba(201,169,98,.4)}
.ctrl-play:active{transform:scale(.96)}
.vol{display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:28px;opacity:.6}
.vol input{width:80px;accent-color:var(--gold);height:3px}
.tracklist-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:0 2px}
.tracklist-label{font-size:9px;letter-spacing:3px;color:rgba(255,255,255,.2);text-transform:uppercase}
.tracklist-count{font-size:11px;color:rgba(255,255,255,.2)}
.track{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;border:none;width:100%;background:none;color:#fff;text-align:left;transition:background .1s;position:relative}
.track:hover{background:var(--surface)}
.track.active{background:rgba(201,169,98,.06)}
.track.active::before{content:"";position:absolute;left:0;top:20%;height:60%;width:2px;background:var(--gold);border-radius:0 2px 2px 0}
.t-num{width:22px;text-align:center;font-size:10px;color:rgba(255,255,255,.15);font-family:monospace;flex-shrink:0}
.track.active .t-num{color:var(--gold)}
.t-info{flex:1;min-width:0}
.t-title{font-size:13px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.track.active .t-title{font-weight:600;color:var(--gold)}
.t-artist{font-size:11px;color:rgba(255,255,255,.25);margin-top:1px}
.t-badge{font-size:9px;padding:2px 7px;border-radius:4px;flex-shrink:0;letter-spacing:.5px;font-weight:500}
.badge-confirmed{background:rgba(74,222,128,.08);color:#4ade80}
.badge-chain{background:rgba(167,139,250,.08);color:#a78bfa;font-size:11px;padding:1px 4px}
.t-proof{font-size:9px;color:rgba(255,255,255,.12);text-decoration:none;padding:2px 6px;border-radius:3px;border:1px solid rgba(255,255,255,.06);flex-shrink:0;white-space:nowrap}
.t-proof:hover{color:rgba(255,255,255,.4);border-color:rgba(255,255,255,.1)}
footer{grid-column:1/-1;border-top:1px solid var(--border);padding:20px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
.footer-links{display:flex;gap:16px}
.footer-links a{color:rgba(255,255,255,.12);text-decoration:none;font-size:11px}
.footer-links a:hover{color:rgba(255,255,255,.4)}
.royalty-badge{font-size:10px;color:rgba(255,255,255,.15);letter-spacing:1px}
.royalty-badge span{color:var(--gold);font-weight:600}
.eq{display:flex;gap:2px;align-items:flex-end;height:12px}
.eq b{width:3px;border-radius:1px;background:var(--gold)}
@keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes eq1{0%,100%{height:3px}50%{height:11px}}
@keyframes eq2{0%,100%{height:7px}50%{height:4px}}
@keyframes eq3{0%,100%{height:5px}50%{height:12px}}
</style>
</head>
<body>
<header>
  <a href="/">SOLUNA</a>
  <button class="share-btn" id="shareBtn" onclick="shareChannel()">SHARE CHANNEL</button>
</header>
<main>
  <div class="now-playing">
    <div class="art" id="art">
      <div class="ring"></div><div class="ring"></div><div class="ring"></div>
      <div class="art-inner">
        <div id="cur-title" style="font-size:clamp(13px,4vw,18px)">${radio.name}</div>
        <div id="cur-artist" style="margin-top:6px">${radio.description || ""}</div>
        <div id="cur-genre"></div>
      </div>
    </div>

    <div class="prog-wrap" id="progWrap">
      <div class="prog-bg"><div class="prog-fill" id="progFill"></div></div>
    </div>
    <div class="times"><span id="tNow">0:00</span><span id="tDur">0:00</span></div>

    <div class="controls">
      <button class="ctrl" onclick="prev()" title="Previous">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
      </button>
      <button class="ctrl-play" onclick="togglePlay()" id="playBtn">
        <svg id="playIco" width="22" height="22" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <button class="ctrl" onclick="next()" title="Next">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
    </div>

    <div class="vol">
      <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
      <input type="range" id="vol" min="0" max="1" step="0.02" value="0.85" oninput="audio.volume=this.value">
    </div>
    <div style="text-align:center;margin-top:12px">
      <button onclick="if(cur>=0)loadLyrics(queue[cur]);else document.getElementById('lyricsPanel').style.display='block'" style="background:rgba(201,169,98,0.08);border:1px solid rgba(201,169,98,0.2);color:#C9A962;padding:6px 18px;border-radius:20px;font-size:11px;letter-spacing:2px;cursor:pointer;font-weight:600">LYRICS</button>
    </div>
  </div>

  <div class="tracklist-header">
    <span class="tracklist-label">Tracklist</span>
    <span class="tracklist-count">${tracks.length} tracks</span>
  </div>
  <div id="list"></div>

  <!-- Lyrics panel -->
  <div id="lyricsPanel" style="display:none;max-width:540px;margin:24px auto 0;padding:0 16px">
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span id="lyricsTitleEl" style="font-size:12px;letter-spacing:2px;color:#C9A962;font-weight:600">LYRICS</span>
        <button onclick="document.getElementById('lyricsPanel').style.display='none'" style="background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:18px;line-height:1">×</button>
      </div>
      <pre id="lyricsText" style="white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.8;color:rgba(255,255,255,.8);margin:0"></pre>
    </div>
  </div>
</main>
<footer>
  <div class="footer-links">
    <a href="/artist">Upload</a>
    <a href="/music">Discover</a>
    <a href="/rights">Rights</a>
    <a href="/api/v1/radios/${radio.slug}/listen">API</a>
  </div>
  <div class="royalty-badge" title="Beta pricing — artist payouts launching soon">${radio.shuffle ? "Shuffle · " : ""}Royalty <span>¥1.0</span>/play · β · SOLUNA</div>
</footer>
<audio id="audio" preload="auto"></audio>
<script>
const TRACKS=${tracksJson};
let queue=[...TRACKS];
if(${radio.shuffle ? "true" : "false"}){for(let i=queue.length-1;i>0;i--){const j=0|Math.random()*(i+1);[queue[i],queue[j]]=[queue[j],queue[i]]}}
let cur=-1,playing=false;
const audio=document.getElementById("audio"),
  art=document.getElementById("art"),
  tTitle=document.getElementById("cur-title"),
  tArtist=document.getElementById("cur-artist"),
  tGenre=document.getElementById("cur-genre"),
  progFill=document.getElementById("progFill"),
  tNow=document.getElementById("tNow"),
  tDur=document.getElementById("tDur"),
  playIco=document.getElementById("playIco"),
  list=document.getElementById("list");

audio.volume=0.85;
const fmt=s=>\`\${0|s/60}:\${("0"+(0|s%60)).slice(-2)}\`;

audio.addEventListener("timeupdate",()=>{
  if(!audio.duration)return;
  progFill.style.width=(audio.currentTime/audio.duration*100)+"%";
  tNow.textContent=fmt(audio.currentTime);
  tDur.textContent=fmt(audio.duration);
});
audio.addEventListener("ended",()=>next());
audio.addEventListener("error",()=>setTimeout(next,800));

document.getElementById("progWrap").addEventListener("click",e=>{
  if(!audio.duration)return;
  const r=e.currentTarget.getBoundingClientRect();
  audio.currentTime=(e.clientX-r.left)/r.width*audio.duration;
});

// Touch support for progress bar
let touching=false;
document.getElementById("progWrap").addEventListener("touchstart",e=>{touching=true},{ passive:true });
document.addEventListener("touchmove",e=>{
  if(!touching||!audio.duration)return;
  const r=document.getElementById("progWrap").getBoundingClientRect();
  audio.currentTime=Math.max(0,Math.min(1,(e.touches[0].clientX-r.left)/r.width))*audio.duration;
},{ passive:true });
document.addEventListener("touchend",()=>touching=false);

function setPlayIco(p){
  playIco.innerHTML=p
    ?'<rect x="6" y="4" width="4" height="16" rx="1" fill="#000"/><rect x="14" y="4" width="4" height="16" rx="1" fill="#000"/>'
    :'<path d="M8 5v14l11-7z" fill="#000"/>';
}

function playIdx(i){
  if(i<0||i>=queue.length)i=0;
  cur=i;const t=queue[i];
  audio.src=t.stream_url;
  audio.play().catch(()=>{});
  playing=true;
  tTitle.textContent=t.title;
  tArtist.textContent=(t.artist||"")+(t.album?" · "+t.album:"")+(t.bpm?" · "+t.bpm+"BPM":"");
  tGenre.style.display=t.genre?"inline-block":"none";
  tGenre.textContent=t.genre;
  // Cover art
  const artInner=art.querySelector(".art-inner");
  if(t.cover_url){
    art.style.backgroundImage=\`url('\${t.cover_url}')\`;
    art.style.backgroundSize="cover";
    art.style.backgroundPosition="center";
    artInner.style.background="rgba(0,0,0,0.5)";
    artInner.style.backdropFilter="blur(8px)";
  } else {
    art.style.backgroundImage="";
    artInner.style.background="";
    artInner.style.backdropFilter="";
  }
  art.classList.add("active");
  setPlayIco(true);
  document.title=t.title+" — SOLUNA";
  if("mediaSession" in navigator){
    const msm={title:t.title,artist:t.artist,album:"${radio.name}"};
    if(t.cover_url)msm.artwork=[{src:t.cover_url,sizes:"600x600",type:"image/jpeg"}];
    navigator.mediaSession.metadata=new MediaMetadata(msm);
    navigator.mediaSession.setActionHandler("previoustrack",prev);
    navigator.mediaSession.setActionHandler("nexttrack",next);
  }
  // Auto-load lyrics if panel is open
  const panel=document.getElementById("lyricsPanel");
  if(panel.style.display!=="none") loadLyrics(t);
  // 30-second play timer (industry standard for royalty-qualifying play)
  clearTimeout(window._playTimer);
  window._playTimer=setTimeout(()=>{
    fetch("/api/v1/tracks/"+t.id+"/played",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({via:"radio"})}).catch(()=>{});
  },30000);
  render();
}

let lyricsCache={};
async function loadLyrics(t){
  const panel=document.getElementById("lyricsPanel");
  const el=document.getElementById("lyricsText");
  const titleEl=document.getElementById("lyricsTitleEl");
  panel.style.display="block";
  titleEl.textContent="LYRICS — "+t.title.toUpperCase();
  if(lyricsCache[t.id]!==undefined){
    el.textContent=lyricsCache[t.id]||"(Lyrics not available)";
    return;
  }
  el.textContent="Loading…";
  try{
    const r=await fetch(t.lyrics_url);
    const d=await r.json();
    lyricsCache[t.id]=d.lyrics||null;
    el.textContent=d.lyrics||(t.artist&&t.title?"(Lyrics not found for this track)":"(Unknown track)");
  }catch{el.textContent="(Failed to load lyrics)";}
}

function togglePlay(){
  if(cur===-1){playIdx(0);return}
  if(playing){audio.pause();playing=false;art.classList.remove("active");setPlayIco(false);clearTimeout(window._playTimer);}
  else{audio.play();playing=true;art.classList.add("active");setPlayIco(true);}
  render();
}
function next(){clearTimeout(window._playTimer);playIdx(cur+1>=queue.length?0:cur+1)}
function prev(){clearTimeout(window._playTimer);if(audio.currentTime>3){audio.currentTime=0;return}playIdx(cur-1<0?queue.length-1:cur-1)}

// Keyboard
document.addEventListener("keydown",e=>{
  if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
  if(e.code==="Space"){e.preventDefault();togglePlay()}
  else if(e.code==="ArrowRight")next();
  else if(e.code==="ArrowLeft")prev();
});

function render(){
  list.innerHTML="";
  queue.forEach((t,i)=>{
    const d=document.createElement("div");
    d.className="track"+(i===cur?" active":"");
    const numHtml=i===cur&&playing
      ?'<span class="eq"><b style="animation:eq1 .45s ease-in-out infinite alternate"></b><b style="animation:eq2 .55s ease-in-out infinite alternate"></b><b style="animation:eq3 .38s ease-in-out infinite alternate"></b></span>'
      :(i+1);
    const badge=t.rights_status==="confirmed"
      ?'<span class="t-badge badge-confirmed">✓</span>'
      :"";
    const chain=t.on_chain?'<span class="badge-chain">⛓</span>':"";
    d.innerHTML=\`
      <span class="t-num">\${numHtml}</span>
      <div class="t-info">
        <div class="t-title">\${t.title}</div>
        <div class="t-artist">\${t.artist||""}\${t.isrc?' · <span style="font-family:monospace;font-size:9px;opacity:.4" title="ISRC (platform)">'+t.isrc+'</span>':''}</div>
      </div>
      \${badge}\${chain}
      <a class="t-proof" href="\${t.proof_url}" target="_blank" onclick="event.stopPropagation()">Proof</a>
    \`;
    d.onclick=()=>playIdx(i);
    list.appendChild(d);
  });
}

function shareChannel(){
  const url=location.href;
  if(navigator.share){navigator.share({title:"${radio.name} — SOLUNA",url}).catch(()=>{})}
  else{navigator.clipboard.writeText(url).then(()=>{
    const btn=document.getElementById("shareBtn");
    btn.textContent="COPIED!";btn.classList.add("copied");
    setTimeout(()=>{btn.textContent="SHARE CHANNEL";btn.classList.remove("copied")},2000);
  })}
}

render();
</script>
</body></html>`);
});

// ── Channel radio pages (/c/:channel) ────────────────────────────────────────
const channelHtml = (() => {
  const p = path.join(STATIC_DIR, 'c/index.html');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
})();
if (channelHtml) {
  app.get(['/c/:channel', '/c/:channel/'], (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; " +
      "connect-src 'self' wss://relay.solun.art https://relay.solun.art https://relay.solun.art:4443 ws://localhost:* http://localhost:*; " +
      "media-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:;"
    );
    res.send(channelHtml);
  });
}

// ── Custom Next.js pages ──────────────────────────────────────────────────────
// ── Artist public profile page (/artists/:slug) ───────────────────────────────
app.get(["/artists/:slug", "/artists/:slug/"], async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT * FROM radios WHERE slug = ? AND public = 1",
    args: [req.params.slug],
  })).rows[0];
  if (!radio) return res.status(404).send("Artist not found");

  const tracks = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, t.genre, t.duration_sec, t.cover_url, t.album,
                 t.bpm, t.play_count, t.rights_status, t.isrc
          FROM radio_tracks rt JOIN tracks t ON t.id = rt.track_id
          WHERE rt.radio_id = ? AND t.public = 1 ORDER BY rt.position`,
    args: [radio.id],
  })).rows;

  const totalPlays = tracks.reduce((s, t) => s + (t.play_count || 0), 0);
  const firstCover = tracks.find(t => t.cover_url)?.cover_url || null;
  const genres = [...new Set(tracks.map(t => t.genre).filter(Boolean))].slice(0, 3);

  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send(`<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${radio.name} — SOLUNA</title>
<meta property="og:title" content="${radio.name} — SOLUNA">
<meta property="og:description" content="${tracks.length} tracks · ${totalPlays.toLocaleString()} plays">
${firstCover ? `<meta property="og:image" content="${firstCover}">` : ""}
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#05060a;color:#fff;font-family:'Inter',-apple-system,sans-serif;min-height:100vh}
a{text-decoration:none;color:inherit}
.hdr{padding:16px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.05)}
.logo{color:#C9A962;font-size:13px;letter-spacing:5px;font-weight:700}
.hero{padding:48px 24px 32px;max-width:760px;margin:0 auto;display:flex;gap:32px;align-items:flex-start}
.hero-art{width:160px;height:160px;border-radius:16px;flex-shrink:0;overflow:hidden;background:rgba(255,255,255,.05)}
.hero-art img{width:100%;height:100%;object-fit:cover}
.hero-info{flex:1;min-width:0}
.hero-name{font-size:clamp(24px,5vw,40px);font-weight:800;line-height:1.1;margin-bottom:8px}
.hero-meta{font-size:13px;color:rgba(255,255,255,.4);margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap}
.genre-tag{font-size:10px;letter-spacing:2px;color:#C9A962;background:rgba(201,169,98,.08);border:1px solid rgba(201,169,98,.15);padding:3px 9px;border-radius:20px}
.btn{display:inline-flex;align-items:center;gap:7px;padding:10px 20px;border-radius:24px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .15s}
.btn-primary{background:linear-gradient(135deg,#C9A962,#a88b3d);color:#000}
.btn-secondary{background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1)}
.tracks{max-width:760px;margin:0 auto;padding:0 24px 80px}
.section-label{font-size:10px;letter-spacing:3px;color:rgba(255,255,255,.25);margin-bottom:14px;margin-top:8px}
.track{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.015);cursor:pointer;transition:all .12s;margin-bottom:4px}
.track:hover{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
.track.active{background:rgba(201,169,98,.05);border-color:rgba(201,169,98,.2)}
.t-art{width:48px;height:48px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,.05);flex-shrink:0}
.t-art img{width:100%;height:100%;object-fit:cover}
.t-info{flex:1;min-width:0}
.t-title{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t-sub{font-size:11px;color:rgba(255,255,255,.3);margin-top:2px;display:flex;gap:8px}
.t-right{display:flex;gap:8px;align-items:center;flex-shrink:0}
.play-btn{width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .12s;background:rgba(255,255,255,.06);color:rgba(255,255,255,.6)}
.play-btn.playing{background:#C9A962;color:#000}
.badge-rights{font-size:9px;color:#4ade80}
.badge-chain{font-size:11px;color:#a78bfa}
.isrc{font-size:9px;color:rgba(255,255,255,.18);font-family:monospace}
@media(max-width:600px){.hero{flex-direction:column;align-items:center;text-align:center}.hero-art{width:140px;height:140px}.hero-meta{justify-content:center}}
</style>
</head><body>
<header class="hdr">
  <a href="/" class="logo">SOLUNA</a>
  <a href="/radio/${radio.slug}" class="btn btn-secondary" style="font-size:11px;padding:6px 14px">▶ Play Channel</a>
</header>

<div class="hero">
  <div class="hero-art">${firstCover ? `<img src="${firstCover}" alt="${radio.name}">` : ""}</div>
  <div class="hero-info">
    <div class="hero-name">${radio.name}</div>
    <div class="hero-meta">
      <span>${tracks.length} tracks</span>
      <span>${totalPlays.toLocaleString()} plays</span>
      ${genres.map(g => `<span class="genre-tag">${g}</span>`).join("")}
    </div>
    ${radio.description ? `<div style="font-size:13px;color:rgba(255,255,255,.45);line-height:1.6;margin-bottom:16px;max-width:400px">${radio.description}</div>` : ""}
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a href="/radio/${radio.slug}" class="btn btn-primary">▶ Play All</a>
      <button class="btn btn-secondary" onclick="share()">Share</button>
    </div>
  </div>
</div>

<div class="tracks">
  <div class="section-label">TRACKS</div>
  <div id="list">
  ${tracks.map((t, i) => `
    <div class="track" id="t-${t.id}" onclick="play('${t.id}','${(t.title||"").replace(/'/g,"\\'")}','${(t.artist||"").replace(/'/g,"\\'")}')" >
      <div class="t-art">${t.cover_url ? `<img src="${t.cover_url}" alt="">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px">🎵</div>`}</div>
      <div class="t-info">
        <div class="t-title">${t.title}</div>
        <div class="t-sub">
          ${t.genre ? `<span>${t.genre}</span>` : ""}
          ${t.album ? `<span>${t.album}</span>` : ""}
          ${t.play_count ? `<span>${t.play_count.toLocaleString()} plays</span>` : ""}
        </div>
      </div>
      <div class="t-right">
        ${t.rights_status === "confirmed" ? '<span class="badge-rights">✓</span>' : ""}
        ${t.isrc ? `<span class="isrc">${t.isrc}</span>` : ""}
        <button class="play-btn" id="pb-${t.id}">▶</button>
      </div>
    </div>
  `).join("")}
  </div>
</div>

<audio id="audio"></audio>
<script>
let curId=null,playing=false,playTimer=null;
const audio=document.getElementById("audio");
audio.addEventListener("ended",()=>{setPlaying(null,false)});

function play(id,title,artist){
  if(curId===id&&playing){audio.pause();setPlaying(id,false);return}
  audio.src="/api/v1/tracks/"+id+"/stream";
  audio.play().catch(()=>{});
  setPlaying(id,true);
  clearTimeout(playTimer);
  playTimer=setTimeout(()=>fetch("/api/v1/tracks/"+id+"/played",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({via:"profile"})}).catch(()=>{}),30000);
}
function setPlaying(id,p){
  if(curId){document.getElementById("pb-"+curId)&&(document.getElementById("pb-"+curId).className="play-btn",document.getElementById("pb-"+curId).textContent="▶")}
  if(id&&document.getElementById("pb-"+id)){document.getElementById("pb-"+id).className="play-btn playing";document.getElementById("pb-"+id).textContent="⏸"}
  curId=id;playing=p;
}
function share(){
  const url=location.href;
  if(navigator.share)navigator.share({title:"${radio.name} — SOLUNA",url}).catch(()=>{});
  else navigator.clipboard.writeText(url).then(()=>alert("Link copied!"));
}
</script>
</body></html>`);
});

const customRoutes = ["/sponsor", "/investor", "/deal", "/contract", "/login", "/admin", "/schedule", "/vip", "/lineup", "/info", "/privacy", "/terms", "/guide", "/artist-lounge", "/vip-lounge", "/mint", "/production", "/safety", "/staff", "/venue-agreement", "/artist-contract", "/budget", "/press", "/hotel-plan", "/music", "/tickets", "/tickets/success", "/rights", "/developers", "/artist"];
const pageCache = {};
customRoutes.forEach((route) => {
  const htmlPath = path.join(STATIC_DIR, `${route}/index.html`);
  if (fs.existsSync(htmlPath)) pageCache[route] = fs.readFileSync(htmlPath, "utf8");
  app.get([route, `${route}/`], (_req, res) => {
    if (pageCache[route]) {
      res.setHeader("Content-Type", "text/html; charset=UTF-8");
      res.send(pageCache[route]);
    } else {
      res.status(404).send("Not found");
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ── MUSIC PLATFORM API ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Royalty rates (JPY per event)
const ROYALTY_RATES = {
  stream: 0.5,       // ¥0.5 per stream
  radio_play: 1.0,   // ¥1.0 per radio play
  download: 5.0,     // ¥5.0 per download
};

// ── Stream rate limiting (in-memory, IP+track cooldown 30s) ──────────────────
const streamCooldown = new Map(); // key: `${ip}:${trackId}` → timestamp
function canCountPlay(ip, trackId) {
  const key = `${ip}:${trackId}`;
  const last = streamCooldown.get(key) || 0;
  if (Date.now() - last < 30000) return false;
  streamCooldown.set(key, Date.now());
  // Clean up old entries every 1000 plays
  if (streamCooldown.size > 5000) {
    const cutoff = Date.now() - 60000;
    for (const [k, v] of streamCooldown) if (v < cutoff) streamCooldown.delete(k);
  }
  return true;
}

// ── Verification helpers ─────────────────────────────────────────────────────

// SHA256 hash of a file (for duplicate detection & blockchain proof)
function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", d => hash.update(d));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

// Chromaprint audio fingerprint via fpcalc
function getAudioFingerprint(filePath) {
  return new Promise((resolve) => {
    execFile("fpcalc", ["-json", filePath], { timeout: 30000 }, (err, stdout) => {
      if (err) { resolve(null); return; }
      try {
        const data = JSON.parse(stdout);
        resolve({ fingerprint: data.fingerprint, duration: data.duration });
      } catch { resolve(null); }
    });
  });
}

// Anchor track proof on Solana blockchain (async, non-blocking)
async function anchorOnSolana(trackId, audioHash, title) {
  if (!solanaKeypair || !solanaConnection) return null;
  try {
    const { Transaction, TransactionInstruction, PublicKey, sendAndConfirmTransaction } = require("@solana/web3.js");
    const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
    const memo = JSON.stringify({
      app: "SOLUNA", v: 1,
      track_id: trackId,
      sha256: audioHash,
      title: (title || "").slice(0, 50),
      ts: new Date().toISOString(),
    });
    const tx = new Transaction().add(new TransactionInstruction({
      keys: [{ pubkey: solanaKeypair.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, "utf8"),
    }));
    const sig = await sendAndConfirmTransaction(solanaConnection, tx, [solanaKeypair]);
    return sig;
  } catch (e) {
    console.error("Solana anchor failed:", e.message);
    return null;
  }
}

// ── Gemini AI cover art generation ───────────────────────────────────────────
async function generateCoverWithGemini(trackId, title, artist, genre) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const prompt = `Professional music album cover art for a ${genre || "music"} track called "${(title||"").slice(0,40)}" by "${(artist||"").slice(0,30)}". Abstract, atmospheric, absolutely no text or letters or words, cinematic lighting, dark moody aesthetic, high quality digital art. Square format.`;
  try {
    const r = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      },
      45000
    );
    if (!r || !r.ok) return null;
    const d = await r.json();
    const parts = d.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData);
    const b64 = imgPart?.inlineData?.data;
    if (!b64) return null;
    const filename = `cover_${trackId}.jpg`;
    const imgBuf = Buffer.from(b64, "base64");
    // Save to S3 if available, also keep local fallback
    if (s3) {
      try { await s3Put(`covers/${filename}`, imgBuf, "image/jpeg"); } catch (e) { console.error("S3 cover upload failed:", e.message); }
    }
    fs.writeFileSync(path.join(COVERS_DIR, filename), imgBuf);
    return `/covers/${filename}`;
  } catch (e) { console.error("Gemini cover failed:", e.message); return null; }
}

// ── SVG cover art generator ───────────────────────────────────────────────────
function generateSvgCover(title, artist, genre) {
  const palettes = {
    "J-Pop": ["#FF6B9D", "#C44569"], "Electronic": ["#6C63FF", "#3F3D56"],
    "Hip-Hop/Rap": ["#F7971E", "#FFD200"], "Rock": ["#ED213A", "#93291E"],
    "Jazz": ["#2193b0", "#6dd5ed"], "R&B": ["#f953c6", "#b91d73"],
    "Classical": ["#834d9b", "#d04ed6"], "Pop": ["#FF9A9E", "#a18cd1"],
    "Worldwide": ["#43cea2", "#185a9d"], "Soundtrack": ["#434343", "#000000"],
    "default": ["#C9A962", "#3a2c1a"],
  };
  const [c1, c2] = palettes[genre] || palettes["default"];
  let h = 0;
  for (const c of (title + (artist || "")).toLowerCase()) h = Math.imul(31, h) + c.charCodeAt(0) | 0;
  h = Math.abs(h);
  const cx = 150 + (h % 100) - 50, cy = 150 + ((h >> 8) % 80) - 40;
  const r1 = 80 + (h % 60), r2 = 55 + ((h >> 4) % 45);
  const sx = (t, max) => t.length > max ? t.slice(0, max - 1) + "…" : t;
  const esc = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
</linearGradient>
<radialGradient id="hl" cx="${cx / 4}" cy="${cy / 4}" r=".7">
  <stop offset="0%" stop-color="rgba(255,255,255,.2)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/>
</radialGradient>
</defs>
<rect width="400" height="400" fill="url(#bg)"/>
<rect width="400" height="400" fill="url(#hl)"/>
<circle cx="${cx}" cy="${cy}" r="${r1}" fill="rgba(255,255,255,.06)"/>
<circle cx="${400 - cx}" cy="${400 - cy}" r="${r2}" fill="rgba(255,255,255,.04)"/>
<text x="24" y="48" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="rgba(255,255,255,.35)" letter-spacing="3">SOLUNA</text>
<text x="24" y="330" font-family="Arial,sans-serif" font-size="17" fill="rgba(255,255,255,.65)" letter-spacing="1">${esc(sx(artist || "", 22).toUpperCase())}</text>
<text x="24" y="366" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="rgba(255,255,255,.95)">${esc(sx(title || "", 20))}</text>
</svg>`;
}

// ── Metadata enrichment helpers ───────────────────────────────────────────────

// Fetch with timeout
async function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal,
      headers: { "User-Agent": "SOLUNA/1.0 (music rights platform; https://solun.art)", ...(opts.headers||{}) } });
    clearTimeout(tid);
    return r;
  } catch { clearTimeout(tid); return null; }
}

// Lyrics: lyrics.ovh (free, no key) → fallback musicmatch-style pattern
async function fetchLyrics(artist, title) {
  if (!artist || !title) return null;
  // Clean up title (remove feat., remix tags for better matching)
  const cleanTitle = title.replace(/\s*[\(\[].*?[\)\]]/g, "").trim();
  const cleanArtist = artist.replace(/\s*feat\..*$/i, "").trim();
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;
  const r = await fetchWithTimeout(url);
  if (!r || !r.ok) return null;
  try {
    const d = await r.json();
    return d.lyrics || null;
  } catch { return null; }
}

// iTunes Search API — artwork, genre, release date, album (free, no key)
async function fetchItunesMeta(artist, title) {
  if (!artist || !title) return {};
  const q = encodeURIComponent(`${artist} ${title}`);
  const url = `https://itunes.apple.com/search?term=${q}&entity=song&limit=5`;
  const r = await fetchWithTimeout(url);
  if (!r || !r.ok) return {};
  try {
    const d = await r.json();
    const results = d.results || [];
    // Find best match
    const lTitle = title.toLowerCase(), lArtist = artist.toLowerCase();
    const match = results.find(x =>
      x.trackName?.toLowerCase().includes(lTitle) || lTitle.includes(x.trackName?.toLowerCase() || "")
    ) || results[0];
    if (!match) return {};
    return {
      cover_url: match.artworkUrl100?.replace("100x100", "600x600"),
      album: match.collectionName,
      release_year: match.releaseDate ? new Date(match.releaseDate).getFullYear() : null,
      genre: match.primaryGenreName,
      label: match.artistName,
      itunes_id: match.trackId,
      itunes_url: match.trackViewUrl,
      bpm: null, // iTunes doesn't provide BPM
    };
  } catch { return {}; }
}

// MusicBrainz — MB recording ID, label, official ISRC, tags (free, no key; 1 req/sec)
async function fetchMusicBrainzMeta(artist, title) {
  if (!artist || !title) return {};
  const q = encodeURIComponent(`recording:"${title}" AND artist:"${artist}"`);
  const url = `https://musicbrainz.org/ws/2/recording/?query=${q}&limit=5&fmt=json`;
  const r = await fetchWithTimeout(url, {}, 10000);
  if (!r || !r.ok) return {};
  try {
    const d = await r.json();
    const rec = (d.recordings || [])[0];
    if (!rec) return {};
    const release = (rec.releases || [])[0] || {};
    const labelInfo = (release["label-info"] || [])[0] || {};
    return {
      mb_id: rec.id,
      mb_score: rec.score,
      album: release.title,
      release_year: release.date ? parseInt(release.date) : null,
      label: labelInfo.label?.name || null,
      tags: (rec.tags || []).map(t => t.name).slice(0, 10).join(","),
      mb_isrc: ((rec.isrcs || [])[0]) || null,
    };
  } catch { return {}; }
}

// AcoustID — identify track by fingerprint (free API key needed; ACOUSTID_KEY env)
async function fetchAcoustId(fingerprint, duration) {
  const key = process.env.ACOUSTID_KEY;
  if (!key || !fingerprint || !duration) return {};
  const params = new URLSearchParams({
    client: key,
    meta: "recordings+releasegroups+compress",
    duration: Math.round(duration),
    fingerprint,
  });
  const r = await fetchWithTimeout(`https://api.acoustid.org/v2/lookup?${params}`, {}, 12000);
  if (!r || !r.ok) return {};
  try {
    const d = await r.json();
    const result = (d.results || [])[0];
    if (!result) return {};
    const rec = (result.recordings || [])[0] || {};
    return {
      acoustid: result.id,
      mb_id: rec.id,
      acoustid_title: rec.title,
      acoustid_artist: ((rec.artists || [])[0] || {}).name,
    };
  } catch { return {}; }
}

// Master enrichment: runs all sources in parallel, merges results
async function enrichTrackMetadata(trackId, artist, title, fingerprint, duration) {
  try {
    const [lyrics, itunes, mb, acoustid] = await Promise.allSettled([
      fetchLyrics(artist, title),
      fetchItunesMeta(artist, title),
      fetchMusicBrainzMeta(artist, title),
      fetchAcoustId(fingerprint, duration),
    ]);

    const lyricsVal = lyrics.status === "fulfilled" ? lyrics.value : null;
    const it = itunes.status === "fulfilled" ? itunes.value : {};
    const mbVal = mb.status === "fulfilled" ? mb.value : {};
    const acVal = acoustid.status === "fulfilled" ? acoustid.value : {};

    // Merge: prefer MusicBrainz for accuracy, iTunes for artwork
    const updates = {};
    if (lyricsVal) updates.lyrics = lyricsVal;
    if (it.cover_url) updates.cover_url = it.cover_url;
    if (it.album || mbVal.album) updates.album = mbVal.album || it.album;
    if (it.release_year || mbVal.release_year) updates.release_year = mbVal.release_year || it.release_year;
    if (it.genre) updates.genre = it.genre;
    if (mbVal.label || it.label) updates.label = mbVal.label || null;
    if (mbVal.tags) updates.tags = mbVal.tags;
    if (mbVal.mb_id || acVal.mb_id) updates.mb_id = mbVal.mb_id || acVal.mb_id;
    if (acVal.acoustid) updates.acoustid = acVal.acoustid;
    // If still no cover: try Gemini AI, then fall back to SVG endpoint
    if (!updates.cover_url) {
      const existing = (await db.execute({ sql: "SELECT cover_url, title, artist, genre FROM tracks WHERE id = ?", args: [trackId] })).rows[0];
      if (!existing?.cover_url) {
        const track = existing || {};
        const aiCover = await generateCoverWithGemini(trackId, track.title, track.artist, track.genre || updates.genre);
        updates.cover_url = aiCover || `/api/v1/tracks/${trackId}/cover`;
        if (aiCover) console.log(`🎨 AI cover generated for ${trackId}`);
      }
    }

    const cols = Object.keys(updates);
    if (cols.length === 0) return;

    const setClauses = cols.map(c => `${c} = ?`).join(", ");
    const vals = cols.map(c => updates[c]);
    await db.execute({
      sql: `UPDATE tracks SET ${setClauses} WHERE id = ?`,
      args: [...vals, trackId],
    });
    console.log(`🎵 Enriched track ${trackId}: ${cols.join(", ")}`);
  } catch (e) {
    console.error("enrichTrackMetadata failed:", e.message);
  }
}

// Generate ISRC code: CC-XXX-YY-NNNNN (SOLUNA registrant)
let isrcCounter = 0;
function generateISRC() {
  const year = new Date().getFullYear().toString().slice(-2);
  const seq = (++isrcCounter).toString().padStart(5, "0");
  return `JP-SOL-${year}-${seq}`;
}

// Record a royalty event and split to rights holders
// Confirmed rights → balance (payable), Unconfirmed → escrow (held)
async function recordRoyalty(trackId, eventType, metadata) {
  const rate = ROYALTY_RATES[eventType] || 0;
  if (rate === 0) return;

  // Check if track has open disputes — all royalties go to escrow
  const disputes = (await db.execute({
    sql: "SELECT id FROM rights_disputes WHERE track_id = ? AND status = 'open'",
    args: [trackId],
  })).rows;
  const isDisputed = disputes.length > 0;

  const rights = (await db.execute({
    sql: "SELECT tr.rights_holder_id, tr.share_pct, tr.status FROM track_rights tr WHERE tr.track_id = ?",
    args: [trackId],
  })).rows;
  if (rights.length === 0) return;

  const eventId = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO royalty_events (id, track_id, event_type, total_amount, metadata) VALUES (?, ?, ?, ?, ?)",
    args: [eventId, trackId, eventType, rate, metadata ? JSON.stringify(metadata) : null],
  });

  for (const r of rights) {
    const amount = rate * (r.share_pct / 100);
    await db.execute({
      sql: "INSERT INTO royalty_splits (event_id, rights_holder_id, amount, share_pct) VALUES (?, ?, ?, ?)",
      args: [eventId, r.rights_holder_id, amount, r.share_pct],
    });

    if (isDisputed || r.status !== "confirmed") {
      // Unconfirmed or disputed → escrow
      await db.execute({
        sql: "UPDATE rights_holders SET escrow_balance = escrow_balance + ?, total_earned = total_earned + ? WHERE id = ?",
        args: [amount, amount, r.rights_holder_id],
      });
    } else {
      // Confirmed → payable balance
      await db.execute({
        sql: "UPDATE rights_holders SET balance = balance + ?, total_earned = total_earned + ? WHERE id = ?",
        args: [amount, amount, r.rights_holder_id],
      });
    }
  }
}

// Helper: authenticate via API key (Bearer token) or session
async function authApiKey(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const rawKey = header.slice(7);
  // API keys are "sk_<id>_<secret>" format
  const parts = rawKey.split("_");
  if (parts.length < 3 || parts[0] !== "sk") return null;
  const keyId = parts[1];
  const secret = parts.slice(2).join("_");
  const row = (await db.execute({ sql: "SELECT * FROM api_keys WHERE id = ?", args: [keyId] })).rows[0];
  if (!row) return null;
  const valid = await bcrypt.compare(secret, row.key_hash);
  if (!valid) return null;
  await db.execute({ sql: "UPDATE api_keys SET last_used = datetime('now') WHERE id = ?", args: [keyId] });
  const user = (await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [row.user_id] })).rows[0];
  return user || null;
}

function requireAuth(handler) {
  return async (req, res) => {
    const user = await authApiKey(req);
    if (!user) return res.status(401).json({ error: "Invalid or missing API key. Use Authorization: Bearer sk_..." });
    req.user = user;
    return handler(req, res);
  };
}

// ── Auth: Register ───────────────────────────────────────────────────────────
app.post("/api/v1/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    if (password.length < 8) return res.status(400).json({ error: "password must be >= 8 chars" });

    const existing = (await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] })).rows[0];
    if (existing) return res.status(409).json({ error: "email already registered" });

    const userId = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    await db.execute({
      sql: "INSERT INTO users (id, email, password, name) VALUES (?, ?, ?, ?)",
      args: [userId, email.toLowerCase(), hash, name || null],
    });

    // Auto-generate first API key
    const keyId = crypto.randomBytes(8).toString("hex");
    const keySecret = crypto.randomBytes(24).toString("base64url");
    const keyHash = await bcrypt.hash(keySecret, 10);
    await db.execute({
      sql: "INSERT INTO api_keys (id, user_id, key_hash, name) VALUES (?, ?, ?, 'default')",
      args: [keyId, userId, keyHash],
    });

    const apiKey = `sk_${keyId}_${keySecret}`;
    res.json({ ok: true, user_id: userId, api_key: apiKey, plan: "free", track_limit: 30 });
  } catch (e) {
    console.error("register error:", e);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ── Auth: Login ──────────────────────────────────────────────────────────────
app.post("/api/v1/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const user = (await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email.toLowerCase()] })).rows[0];
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "invalid credentials" });

    // Return existing API keys (or create one if none exist or new_key requested)
    let keys = (await db.execute({ sql: "SELECT id FROM api_keys WHERE user_id = ?", args: [user.id] })).rows;
    let apiKey = null;
    if (keys.length === 0 || req.body.new_key) {
      const keyId = crypto.randomBytes(8).toString("hex");
      const keySecret = crypto.randomBytes(24).toString("base64url");
      const keyHash = await bcrypt.hash(keySecret, 10);
      await db.execute({
        sql: "INSERT INTO api_keys (id, user_id, key_hash, name) VALUES (?, ?, ?, 'default')",
        args: [keyId, user.id, keyHash],
      });
      apiKey = `sk_${keyId}_${keySecret}`;
    }

    res.json({
      ok: true,
      user_id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      track_limit: user.track_limit,
      api_key: apiKey, // only set on first login or if no keys exist
      message: apiKey ? undefined : "Use your existing API key. Generate a new one at POST /api/v1/keys",
    });
  } catch (e) {
    console.error("login error:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── API Keys: Generate new key ──────────────────────────────────────────────
app.post("/api/v1/keys", requireAuth(async (req, res) => {
  const { name } = req.body;
  const keyId = crypto.randomBytes(8).toString("hex");
  const keySecret = crypto.randomBytes(24).toString("base64url");
  const keyHash = await bcrypt.hash(keySecret, 10);
  await db.execute({
    sql: "INSERT INTO api_keys (id, user_id, key_hash, name) VALUES (?, ?, ?, ?)",
    args: [keyId, req.user.id, keyHash, name || "default"],
  });
  res.json({ ok: true, api_key: `sk_${keyId}_${keySecret}`, name: name || "default" });
}));

// ── API Keys: List ──────────────────────────────────────────────────────────
app.get("/api/v1/keys", requireAuth(async (req, res) => {
  const keys = (await db.execute({
    sql: "SELECT id, name, last_used, created_at FROM api_keys WHERE user_id = ?",
    args: [req.user.id],
  })).rows;
  res.json({ ok: true, keys });
}));

// ── API Keys: Delete ────────────────────────────────────────────────────────
app.delete("/api/v1/keys/:id", requireAuth(async (req, res) => {
  await db.execute({
    sql: "DELETE FROM api_keys WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  });
  res.json({ ok: true });
}));

// ── User: Profile & Plan ────────────────────────────────────────────────────
app.get("/api/v1/me", requireAuth(async (req, res) => {
  const trackCount = (await db.execute({
    sql: "SELECT COUNT(*) as c FROM tracks WHERE user_id = ?",
    args: [req.user.id],
  })).rows[0].c;
  res.json({
    ok: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      plan: req.user.plan,
      track_limit: req.user.track_limit,
      tracks_used: trackCount,
    },
  });
}));

// ── User: Upgrade to Pro ────────────────────────────────────────────────────
app.post("/api/v1/me/upgrade", requireAuth(async (req, res) => {
  // For now: direct upgrade. Stripe integration can be added later.
  await db.execute({
    sql: "UPDATE users SET plan = 'pro', track_limit = 100 WHERE id = ?",
    args: [req.user.id],
  });
  res.json({ ok: true, plan: "pro", track_limit: 100 });
}));

// ── Tracks: Upload ──────────────────────────────────────────────────────────
app.post("/api/v1/tracks", requireAuth(async (req, res) => {
  // Check track limit
  const count = (await db.execute({
    sql: "SELECT COUNT(*) as c FROM tracks WHERE user_id = ?",
    args: [req.user.id],
  })).rows[0].c;
  if (count >= req.user.track_limit) {
    return res.status(403).json({
      error: `Track limit reached (${req.user.track_limit}). Upgrade to Pro for 100 tracks.`,
      plan: req.user.plan,
      track_limit: req.user.track_limit,
      tracks_used: count,
    });
  }

  upload.single("file")(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large (max 50MB)" });
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: "No audio file provided. Use multipart/form-data with field 'file'" });

    const trackId = crypto.randomUUID();
    const { title, artist, genre, bpm, attested, album, release_year, label, cover_url: clientCoverUrl } = req.body;
    if (!title) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "title is required" });
    }

    const filePath = path.join(AUDIO_DIR, req.file.filename);
    const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
    const isrc = generateISRC();

    // ── Step 1: SHA256 hash (duplicate detection) ──────────────────────────
    let audioHash = null;
    try { audioHash = await sha256File(filePath); } catch {}

    if (audioHash) {
      const dup = (await db.execute({
        sql: "SELECT id, title FROM tracks WHERE audio_hash = ?",
        args: [audioHash],
      })).rows[0];
      if (dup) {
        fs.unlinkSync(filePath);
        // Fetch full duplicate track info to show to user
        const dupFull = (await db.execute({
          sql: "SELECT id, title, artist, genre, isrc, cover_url, album, rights_status FROM tracks WHERE id = ?",
          args: [dup.id],
        })).rows[0];
        return res.status(409).json({
          error: "Duplicate track detected",
          duplicate_track_id: dup.id,
          duplicate_title: dup.title,
          sha256: audioHash,
          duplicate_track: dupFull || null,
          stream_url: `/api/v1/tracks/${dup.id}/stream`,
          proof_url: `/api/v1/tracks/${dup.id}/proof`,
        });
      }
    }

    // ── Step 2: Chromaprint fingerprint ─────────────────────────────────────
    let fingerprint = null;
    let detectedDuration = null;
    const fpResult = await getAudioFingerprint(filePath);
    if (fpResult) {
      fingerprint = fpResult.fingerprint;
      detectedDuration = fpResult.duration ? Math.round(fpResult.duration) : null;
    }

    // ── Step 2b: Upload to S3 (streaming) ──────────────────────────────────
    if (s3) {
      try {
        const mimeMap = { mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac", aac: "audio/aac" };
        await s3.send(new PutObjectCommand({
          Bucket: S3_BUCKET, Key: `audio/${req.file.filename}`,
          Body: fs.createReadStream(filePath),
          ContentType: mimeMap[ext] || "audio/mpeg",
          ContentLength: req.file.size,
        }));
        console.log(`☁ Uploaded audio/${req.file.filename} to S3 (${(req.file.size/1024/1024).toFixed(1)}MB)`);
      } catch (e) { console.error("S3 audio upload failed (keeping local):", e.message); }
    }

    // ── Step 3: Insert track ─────────────────────────────────────────────────
    await db.execute({
      sql: `INSERT INTO tracks (id, user_id, title, artist, file_path, file_size, format, genre, bpm, isrc,
                               audio_hash, fingerprint, attested, duration_sec, album, release_year, label, cover_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        trackId, req.user.id, title, artist || null, req.file.filename, req.file.size,
        ext || "mp3", genre || null, bpm ? parseInt(bpm) : null, isrc,
        audioHash, fingerprint, attested === "true" || attested === true ? 1 : 0,
        detectedDuration,
        album || null, release_year ? parseInt(release_year) : null, label || null, clientCoverUrl || null,
      ],
    });

    // ── Step 4: Auto-rights (100% to uploader, auto-confirmed) ──────────────
    let finalRightsStatus = "draft";
    if (req.body.auto_rights === "true" || req.body.auto_rights === true) {
      // Find or create a rights holder for this user
      let rh = (await db.execute({
        sql: "SELECT id FROM rights_holders WHERE user_id = ? AND email = ?",
        args: [req.user.id, req.user.email],
      })).rows[0];

      if (!rh) {
        const rhId = crypto.randomUUID();
        await db.execute({
          sql: `INSERT INTO rights_holders (id, user_id, name, email, email_verified, payout_method)
                VALUES (?, ?, ?, ?, 1, 'pending')`,
          args: [rhId, req.user.id, req.user.name || req.user.email.split("@")[0], req.user.email],
        });
        rh = { id: rhId };
      }

      // Set 100% composer rights, auto-confirmed (uploader = rights holder)
      await db.execute({
        sql: `INSERT OR REPLACE INTO track_rights
              (track_id, rights_holder_id, role, share_pct, status, confirm_token, confirmed_at)
              VALUES (?, ?, 'composer', 100, 'confirmed', ?, datetime('now'))`,
        args: [trackId, rh.id, crypto.randomBytes(16).toString("hex")],
      });
      await db.execute({
        sql: "UPDATE tracks SET rights_status = 'confirmed' WHERE id = ?",
        args: [trackId],
      });
      await db.execute({
        sql: "INSERT INTO rights_audit_log (track_id, action, actor, details) VALUES (?, 'auto_rights_assigned', ?, ?)",
        args: [trackId, req.user.email, JSON.stringify({ share_pct: 100, role: "composer", auto: true })],
      });
      finalRightsStatus = "confirmed";
    }

    // ── Step 5: Metadata enrichment (async — don't block response) ───────────
    enrichTrackMetadata(trackId, artist, title, fingerprint, detectedDuration).catch(() => {});

    // ── Step 6: Solana anchor (async — don't block response) ─────────────────
    if (audioHash) {
      anchorOnSolana(trackId, audioHash, title).then(async (sig) => {
        if (sig) {
          await db.execute({
            sql: "UPDATE tracks SET anchor_tx = ?, anchor_time = datetime('now') WHERE id = ?",
            args: [sig, trackId],
          });
          console.log(`⛓ Anchored ${trackId} on Solana: ${sig}`);
        }
      });
    }

    res.json({
      ok: true,
      track: {
        id: trackId,
        title,
        artist: artist || null,
        format: ext || "mp3",
        file_size: req.file.size,
        isrc,
        audio_hash: audioHash,
        fingerprint_captured: !!fingerprint,
        duration_sec: detectedDuration,
        stream_url: `/api/v1/tracks/${trackId}/stream`,
        proof_url: `/api/v1/tracks/${trackId}/proof`,
        rights_status: finalRightsStatus,
        anchoring: audioHash && solanaKeypair ? "pending" : "disabled",
      },
    });
  });
}));

// ── Tracks: Proof (public verification) ─────────────────────────────────────
app.get("/api/v1/tracks/:id/proof", async (req, res) => {
  const track = (await db.execute({
    sql: `SELECT id, title, artist, isrc, audio_hash, fingerprint, anchor_tx, anchor_time,
                 rights_status, attested, created_at, lyrics, album, release_year, label,
                 cover_url, tags, mb_id, acoustid, genre, bpm, duration_sec
          FROM tracks WHERE id = ? AND public = 1`,
    args: [req.params.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const rights = (await db.execute({
    sql: `SELECT rh.name, rh.email, rh.pro_org, rh.pro_id, rh.ipi_number, rh.isni,
                 tr.share_pct, tr.role, tr.status, tr.confirmed_at
          FROM track_rights tr JOIN rights_holders rh ON tr.rights_holder_id = rh.id
          WHERE tr.track_id = ?`,
    args: [track.id],
  })).rows;

  const proof = {
    ok: true,
    verification: {
      track_id: track.id,
      title: track.title,
      artist: track.artist,
      isrc: track.isrc,
      rights_status: track.rights_status,
      registered_at: track.created_at,
    },
    metadata: {
      album: track.album || null,
      release_year: track.release_year || null,
      genre: track.genre || null,
      label: track.label || null,
      bpm: track.bpm || null,
      duration_sec: track.duration_sec || null,
      cover_url: track.cover_url || null,
      tags: track.tags ? track.tags.split(",").filter(Boolean) : [],
      mb_id: track.mb_id || null,
      acoustid: track.acoustid || null,
      mb_url: track.mb_id ? `https://musicbrainz.org/recording/${track.mb_id}` : null,
      lyrics_available: !!track.lyrics,
    },
    integrity: {
      sha256: track.audio_hash,
      fingerprint_captured: !!track.fingerprint,
      attested: !!track.attested,
    },
    blockchain: track.anchor_tx ? {
      network: "Solana Mainnet",
      transaction: track.anchor_tx,
      anchored_at: track.anchor_time,
      explorer_url: `https://solscan.io/tx/${track.anchor_tx}`,
    } : null,
    rights_holders: rights.map(r => ({
      name: r.name,
      role: r.role,
      share_pct: r.share_pct,
      status: r.status,
      confirmed_at: r.confirmed_at,
      pro: r.pro_org ? { org: r.pro_org, id: r.pro_id } : null,
      ipi: r.ipi_number || null,
      isni: r.isni || null,
    })),
  };

  // Return HTML if browser, JSON otherwise
  const wantsHtml = req.headers.accept && req.headers.accept.includes("text/html") && !req.query.json;
  if (wantsHtml) {
    const statusColor = { confirmed: "#4ade80", pending_confirmation: "#fbbf24", disputed: "#f87171", draft: "#888" };
    const sc = statusColor[track.rights_status] || "#888";
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Proof of Rights — ${track.title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#05060a;color:#fff;font-family:'Inter',-apple-system,sans-serif;min-height:100vh;padding:40px 24px}
  .wrap{max-width:640px;margin:0 auto}
  .logo{color:#C9A962;font-size:13px;letter-spacing:5px;font-weight:700;text-decoration:none;display:block;margin-bottom:48px}
  h1{font-size:28px;font-weight:800;margin-bottom:4px}
  .artist{font-size:15px;color:rgba(255,255,255,0.4);margin-bottom:32px}
  .section{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:24px;margin-bottom:16px}
  .label{font-size:10px;letter-spacing:3px;color:#C9A962;margin-bottom:12px;font-weight:600}
  .row{display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;gap:12px}
  .row:last-child{border-bottom:none}
  .key{color:rgba(255,255,255,0.35);flex-shrink:0}
  .val{color:#fff;text-align:right;word-break:break-all;font-family:monospace;font-size:12px}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:0.5px}
  .chain{background:rgba(168,139,250,0.1);border:1px solid rgba(168,139,250,0.2);border-radius:14px;padding:20px 24px;margin-bottom:16px}
  .chain a{color:#a78bfa;text-decoration:none;font-size:12px;font-family:monospace;word-break:break-all}
  .holder{background:rgba(0,0,0,0.2);border-radius:10px;padding:14px 16px;margin-top:8px}
</style></head><body><div class="wrap">
<a href="/" class="logo">SOLUNA</a>
<h1>${track.title}</h1>
<div class="artist">${track.artist || "Unknown Artist"}</div>

<div class="section">
  <div class="label">TRACK IDENTITY</div>
  <div class="row"><span class="key">ISRC</span><span class="val">${track.isrc || "—"}</span></div>
  <div class="row"><span class="key">Rights Status</span><span class="val"><span class="badge" style="background:${sc}20;color:${sc}">${track.rights_status}</span></span></div>
  <div class="row"><span class="key">Registered</span><span class="val">${track.created_at}</span></div>
  <div class="row"><span class="key">Attested</span><span class="val">${track.attested ? "✓ Yes" : "—"}</span></div>
</div>

<div class="section">
  <div class="label">INTEGRITY</div>
  <div class="row"><span class="key">SHA-256</span><span class="val">${track.audio_hash ? track.audio_hash.slice(0,16)+"…"+track.audio_hash.slice(-8) : "—"}</span></div>
  <div class="row"><span class="key">Chromaprint</span><span class="val">${track.fingerprint ? "✓ Captured" : "—"}</span></div>
</div>

${track.anchor_tx ? `<div class="chain">
  <div class="label" style="color:#a78bfa">⛓ SOLANA BLOCKCHAIN PROOF</div>
  <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:8px">Anchored: ${track.anchor_time}</div>
  <a href="https://solscan.io/tx/${track.anchor_tx}" target="_blank">${track.anchor_tx}</a>
</div>` : `<div class="section" style="opacity:0.4">
  <div class="label">BLOCKCHAIN</div>
  <div style="font-size:13px;color:rgba(255,255,255,0.3)">Pending anchoring…</div>
</div>`}

<div class="section">
  <div class="label">RIGHTS HOLDERS</div>
  ${rights.length === 0 ? '<div style="font-size:13px;color:rgba(255,255,255,0.3)">No rights registered</div>' :
    rights.map(r => `<div class="holder">
    <div style="font-size:14px;font-weight:600">${r.name} <span style="font-size:11px;color:#C9A962">${r.share_pct}%</span> <span style="font-size:10px;color:rgba(255,255,255,0.3)">${r.role}</span></div>
    ${r.pro_org ? `<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px">${r.pro_org}: ${r.pro_id}</div>` : ""}
    ${r.ipi_number ? `<div style="font-size:11px;color:rgba(255,255,255,0.3)">IPI: ${r.ipi_number}</div>` : ""}
    <div style="font-size:11px;color:${r.status==='confirmed'?'#4ade80':'#fbbf24'};margin-top:4px">${r.status === 'confirmed' ? '✓ Confirmed '+r.confirmed_at.slice(0,10) : '⏳ Pending'}</div>
  </div>`).join("")}
</div>

<div style="margin-top:32px;text-align:center;font-size:11px;color:rgba(255,255,255,0.15);letter-spacing:2px">SOLUNA RIGHTS REGISTRY · solun.art</div>
</div></body></html>`;
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    return res.send(html);
  }

  res.json(proof);
});

// ── Tracks: List (own) ──────────────────────────────────────────────────────
app.get("/api/v1/tracks", requireAuth(async (req, res) => {
  const rows = (await db.execute({
    sql: "SELECT id, title, artist, duration_sec, format, genre, bpm, public, play_count, rights_status, isrc, audio_hash, anchor_tx, cover_url, album, release_year, label, created_at FROM tracks WHERE user_id = ? ORDER BY created_at DESC",
    args: [req.user.id],
  })).rows;
  res.json({ ok: true, tracks: rows });
}));

// ── Tracks: Get single ─────────────────────────────────────────────────────
app.get("/api/v1/tracks/:id", async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id, user_id, title, artist, duration_sec, format, genre, bpm, public, play_count, created_at FROM tracks WHERE id = ?",
    args: [req.params.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  // Public tracks are accessible by anyone, private require auth
  if (!track.public) {
    const user = await authApiKey(req);
    if (!user || user.id !== track.user_id) return res.status(403).json({ error: "Private track" });
  }

  res.json({ ok: true, track: { ...track, stream_url: `/api/v1/tracks/${track.id}/stream` } });
});

// ── Tracks: Lyrics ──────────────────────────────────────────────────────────
app.get("/api/v1/tracks/:id/lyrics", async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id, title, artist, lyrics FROM tracks WHERE id = ? AND public = 1",
    args: [req.params.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  // If lyrics cached in DB, return immediately
  if (track.lyrics) return res.json({ ok: true, track_id: track.id, lyrics: track.lyrics, source: "cached" });

  // Otherwise fetch live and cache
  const lyrics = await fetchLyrics(track.artist, track.title);
  if (lyrics) {
    await db.execute({ sql: "UPDATE tracks SET lyrics = ? WHERE id = ?", args: [lyrics, track.id] });
    return res.json({ ok: true, track_id: track.id, lyrics, source: "fetched" });
  }
  res.json({ ok: true, track_id: track.id, lyrics: null, source: "not_found" });
});

// ── Static: AI-generated covers (S3 → local fallback) ───────────────────────
app.get("/covers/:filename", async (req, res, next) => {
  if (!s3) return next(); // fall through to express.static
  const key = `covers/${req.params.filename}`;
  try {
    const s3Resp = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
    res.set("Content-Type", s3Resp.ContentType || "image/jpeg");
    res.set("Content-Length", s3Resp.ContentLength);
    res.set("Cache-Control", "public, max-age=604800");
    s3Resp.Body.transformToWebStream().pipeTo(
      new WritableStream({ write(chunk) { res.write(chunk); }, close() { res.end(); } })
    ).catch(() => res.end());
  } catch { next(); } // fallback to local
});
app.use("/covers", express.static(COVERS_DIR, { maxAge: "7d" }));

// ── Tracks: Cover art (SVG generated) ───────────────────────────────────────
app.get("/api/v1/tracks/:id/cover", async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT title, artist, genre FROM tracks WHERE id = ?",
    args: [req.params.id],
  })).rows[0];
  if (!track) return res.status(404).send("Not found");
  const svg = generateSvgCover(track.title, track.artist, track.genre);
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(svg);
});

// ── Tracks: PATCH metadata ───────────────────────────────────────────────────
app.patch("/api/v1/tracks/:id", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const allowed = ["title", "artist", "genre", "bpm", "album", "release_year", "label", "cover_url", "lyrics"];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }
  if (Object.keys(updates).length === 0) return res.json({ ok: true });

  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(", ");
  await db.execute({
    sql: `UPDATE tracks SET ${setClauses} WHERE id = ?`,
    args: [...Object.values(updates), req.params.id],
  });
  res.json({ ok: true, updated: Object.keys(updates) });
}));

// ── Tracks: Mark as played (called by client after 30s of actual playback) ──
app.post("/api/v1/tracks/:id/played", async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id, user_id FROM tracks WHERE id = ? AND public = 1",
    args: [req.params.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;
  const via = req.body?.via || req.query.via || "direct";

  if (canCountPlay(clientIp, track.id)) {
    await db.execute({ sql: "UPDATE tracks SET play_count = play_count + 1 WHERE id = ?", args: [track.id] });
    const eventType = via === "radio" ? "radio_play" : "stream";
    recordRoyalty(track.id, eventType, { ip: clientIp, via }).catch(() => {});
    return res.json({ ok: true, counted: true });
  }
  res.json({ ok: true, counted: false, reason: "cooldown" });
});

// ── Tracks: Generate AI cover art ───────────────────────────────────────────
app.post("/api/v1/tracks/:id/cover/generate", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id, title, artist, genre FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  // Try Gemini AI first, fall back to SVG
  const aiCover = await generateCoverWithGemini(track.id, track.title, track.artist, track.genre);
  const coverUrl = aiCover || `/api/v1/tracks/${track.id}/cover`;

  await db.execute({ sql: "UPDATE tracks SET cover_url = ? WHERE id = ?", args: [coverUrl, track.id] });
  res.json({ ok: true, cover_url: coverUrl, source: aiCover ? "gemini" : "svg" });
}));

// ── Tracks: Stream audio ────────────────────────────────────────────────────
app.get("/api/v1/tracks/:id/stream", async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT * FROM tracks WHERE id = ?",
    args: [req.params.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  if (!track.public) {
    const user = await authApiKey(req);
    if (!user || user.id !== track.user_id) return res.status(403).json({ error: "Private track" });
  }

  const mimeMap = { mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac", aac: "audio/aac" };
  const mime = mimeMap[track.format] || "audio/mpeg";
  const s3Key = `audio/${track.file_path}`;
  const localPath = path.join(AUDIO_DIR, track.file_path);

  // ── Try S3 first ──────────────────────────────────────────────────────────
  if (s3) {
    const head = await s3Head(s3Key);
    if (head) {
      const totalSize = head.ContentLength;
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
        const s3Resp = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key, Range: `bytes=${start}-${end}` }));
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${totalSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
          "Content-Type": mime,
        });
        s3Resp.Body.transformToWebStream().pipeTo(
          new WritableStream({ write(chunk) { res.write(chunk); }, close() { res.end(); } })
        ).catch(() => res.end());
        return;
      }
      const s3Resp = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: s3Key }));
      res.writeHead(200, {
        "Content-Length": totalSize,
        "Content-Type": mime,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
      });
      s3Resp.Body.transformToWebStream().pipeTo(
        new WritableStream({ write(chunk) { res.write(chunk); }, close() { res.end(); } })
      ).catch(() => res.end());
      return;
    }
  }

  // ── Fallback: local file ──────────────────────────────────────────────────
  if (!fs.existsSync(localPath)) return res.status(404).json({ error: "Audio file missing" });
  const stat = fs.statSync(localPath);
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": mime,
    });
    fs.createReadStream(localPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": stat.size,
      "Content-Type": mime,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=86400",
    });
    fs.createReadStream(localPath).pipe(res);
  }
});

// ── Tracks: Update ──────────────────────────────────────────────────────────
app.patch("/api/v1/tracks/:id", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const fields = [];
  const args = [];
  for (const key of ["title", "artist", "genre", "public"]) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(key === "public" ? (req.body[key] ? 1 : 0) : req.body[key]);
    }
  }
  if (req.body.bpm !== undefined) { fields.push("bpm = ?"); args.push(parseInt(req.body.bpm) || null); }
  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

  args.push(req.params.id);
  await db.execute({ sql: `UPDATE tracks SET ${fields.join(", ")} WHERE id = ?`, args });
  res.json({ ok: true });
}));

// ── Tracks: Delete ──────────────────────────────────────────────────────────
app.delete("/api/v1/tracks/:id", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT file_path FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  // Remove from all radios first
  await db.execute({ sql: "DELETE FROM radio_tracks WHERE track_id = ?", args: [req.params.id] });
  await db.execute({ sql: "DELETE FROM tracks WHERE id = ?", args: [req.params.id] });

  // Delete file from S3 + local
  if (s3) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: `audio/${track.file_path}` }));
    } catch {}
  }
  const filePath = path.join(AUDIO_DIR, track.file_path);
  try { fs.unlinkSync(filePath); } catch {}

  res.json({ ok: true });
}));

// ── Radios: Create ──────────────────────────────────────────────────────────
app.post("/api/v1/radios", requireAuth(async (req, res) => {
  const { name, description, slug, shuffle } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const radioId = crypto.randomUUID();
  const radioSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Check slug uniqueness
  const existing = (await db.execute({ sql: "SELECT id FROM radios WHERE slug = ?", args: [radioSlug] })).rows[0];
  if (existing) return res.status(409).json({ error: "slug already taken" });

  await db.execute({
    sql: "INSERT INTO radios (id, user_id, name, description, slug, shuffle) VALUES (?, ?, ?, ?, ?, ?)",
    args: [radioId, req.user.id, name, description || null, radioSlug, shuffle ? 1 : 0],
  });
  res.json({
    ok: true,
    radio: { id: radioId, name, slug: radioSlug, listen_url: `/api/v1/radios/${radioSlug}/listen` },
  });
}));

// ── Radios: List (own) ──────────────────────────────────────────────────────
app.get("/api/v1/radios", requireAuth(async (req, res) => {
  const rows = (await db.execute({
    sql: `SELECT r.*, COUNT(rt.id) as track_count
          FROM radios r LEFT JOIN radio_tracks rt ON rt.radio_id = r.id
          WHERE r.user_id = ? GROUP BY r.id ORDER BY r.created_at DESC`,
    args: [req.user.id],
  })).rows;
  res.json({ ok: true, radios: rows });
}));

// ── Radios: Get by slug (public) ────────────────────────────────────────────
app.get("/api/v1/radios/:slug", async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT * FROM radios WHERE slug = ?",
    args: [req.params.slug],
  })).rows[0];
  if (!radio) return res.status(404).json({ error: "Radio not found" });

  if (!radio.public) {
    const user = await authApiKey(req);
    if (!user || user.id !== radio.user_id) return res.status(403).json({ error: "Private radio" });
  }

  const tracks = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, t.duration_sec, t.format, t.genre, t.bpm, rt.position
          FROM radio_tracks rt JOIN tracks t ON t.id = rt.track_id
          WHERE rt.radio_id = ? ORDER BY rt.position`,
    args: [radio.id],
  })).rows.map(t => ({ ...t, stream_url: `/api/v1/tracks/${t.id}/stream` }));

  res.json({ ok: true, radio: { ...radio, tracks, listen_url: `/api/v1/radios/${radio.slug}/listen` } });
});

// ── Radios: Add track ───────────────────────────────────────────────────────
app.post("/api/v1/radios/:id/tracks", requireAuth(async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT id FROM radios WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!radio) return res.status(404).json({ error: "Radio not found" });

  const { track_id, position } = req.body;
  if (!track_id) return res.status(400).json({ error: "track_id required" });

  // Verify track belongs to user
  const track = (await db.execute({
    sql: "SELECT id FROM tracks WHERE id = ? AND user_id = ?",
    args: [track_id, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const maxPos = (await db.execute({
    sql: "SELECT COALESCE(MAX(position), -1) as m FROM radio_tracks WHERE radio_id = ?",
    args: [radio.id],
  })).rows[0].m;

  try {
    await db.execute({
      sql: "INSERT INTO radio_tracks (radio_id, track_id, position) VALUES (?, ?, ?)",
      args: [radio.id, track_id, position !== undefined ? position : maxPos + 1],
    });
    res.json({ ok: true });
  } catch (e) {
    if (e.message?.includes("UNIQUE")) return res.status(409).json({ error: "Track already in this radio" });
    throw e;
  }
}));

// ── Radios: Remove track ────────────────────────────────────────────────────
app.delete("/api/v1/radios/:id/tracks/:trackId", requireAuth(async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT id FROM radios WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!radio) return res.status(404).json({ error: "Radio not found" });

  await db.execute({
    sql: "DELETE FROM radio_tracks WHERE radio_id = ? AND track_id = ?",
    args: [radio.id, req.params.trackId],
  });
  res.json({ ok: true });
}));

// ── Radios: Update ──────────────────────────────────────────────────────────
app.patch("/api/v1/radios/:id", requireAuth(async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT id FROM radios WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!radio) return res.status(404).json({ error: "Radio not found" });

  const fields = [];
  const args = [];
  for (const key of ["name", "description", "public", "shuffle"]) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(["public", "shuffle"].includes(key) ? (req.body[key] ? 1 : 0) : req.body[key]);
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

  args.push(req.params.id);
  await db.execute({ sql: `UPDATE radios SET ${fields.join(", ")} WHERE id = ?`, args });
  res.json({ ok: true });
}));

// ── Radios: Delete ──────────────────────────────────────────────────────────
app.delete("/api/v1/radios/:id", requireAuth(async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT id FROM radios WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!radio) return res.status(404).json({ error: "Radio not found" });

  await db.execute({ sql: "DELETE FROM radio_tracks WHERE radio_id = ?", args: [radio.id] });
  await db.execute({ sql: "DELETE FROM radios WHERE id = ?", args: [radio.id] });
  res.json({ ok: true });
}));

// ── Radios: Listen (continuous playlist JSON) ───────────────────────────────
app.get("/api/v1/radios/:slug/listen", async (req, res) => {
  const radio = (await db.execute({
    sql: "SELECT * FROM radios WHERE slug = ?",
    args: [req.params.slug],
  })).rows[0];
  if (!radio) return res.status(404).json({ error: "Radio not found" });
  if (!radio.public) {
    const user = await authApiKey(req);
    if (!user || user.id !== radio.user_id) return res.status(403).json({ error: "Private radio" });
  }

  let tracks = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, t.duration_sec, t.format, rt.position
          FROM radio_tracks rt JOIN tracks t ON t.id = rt.track_id
          WHERE rt.radio_id = ? ORDER BY rt.position`,
    args: [radio.id],
  })).rows.map(t => ({ ...t, stream_url: `/api/v1/tracks/${t.id}/stream?via=radio` }));

  if (radio.shuffle) {
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
  }

  res.json({
    radio: { name: radio.name, slug: radio.slug, description: radio.description, shuffle: !!radio.shuffle },
    tracks,
    player_url: `/radio/${radio.slug}`,
    embed_url: `/api/v1/radios/${radio.slug}/embed`,
  });
});

// ── Public: Browse radios ───────────────────────────────────────────────────
app.get("/api/v1/explore/radios", async (_req, res) => {
  const rows = (await db.execute({
    sql: `SELECT r.id, r.name, r.description, r.slug, u.name as creator,
          COUNT(rt.id) as track_count, r.created_at
          FROM radios r
          JOIN users u ON u.id = r.user_id
          LEFT JOIN radio_tracks rt ON rt.radio_id = r.id
          WHERE r.public = 1
          GROUP BY r.id ORDER BY r.created_at DESC LIMIT 50`,
  })).rows;
  res.json({ ok: true, radios: rows.map(r => ({ ...r, listen_url: `/api/v1/radios/${r.slug}/listen` })) });
});

// ── Public: Browse tracks ───────────────────────────────────────────────────
app.get("/api/v1/explore/tracks", async (_req, res) => {
  const rows = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, t.duration_sec, t.format, t.genre, t.play_count,
                 t.rights_status, t.isrc, t.cover_url, t.album, t.bpm, t.created_at
          FROM tracks t WHERE t.public = 1 ORDER BY t.play_count DESC LIMIT 50`,
  })).rows.map(t => ({ ...t, stream_url: `/api/v1/tracks/${t.id}/stream` }));
  res.json({ ok: true, tracks: rows });
});

// ══════════════════════════════════════════════════════════════════════════════
// ── RIGHTS & ROYALTY API ─────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// ── Rights Holders: Create ──────────────────────────────────────────────────
app.post("/api/v1/rights-holders", requireAuth(async (req, res) => {
  const { name, email, payout_method, payout_info } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO rights_holders (id, user_id, name, email, payout_method, payout_info) VALUES (?, ?, ?, ?, ?, ?)",
    args: [id, req.user.id, name, email || null, payout_method || "pending", payout_info || null],
  });
  res.json({ ok: true, rights_holder: { id, name, email, payout_method: payout_method || "pending" } });
}));

// ── Rights Holders: List (own) ──────────────────────────────────────────────
app.get("/api/v1/rights-holders", requireAuth(async (req, res) => {
  const rows = (await db.execute({
    sql: "SELECT id, name, email, email_verified, payout_method, balance, escrow_balance, total_earned, created_at FROM rights_holders WHERE user_id = ?",
    args: [req.user.id],
  })).rows;
  res.json({ ok: true, rights_holders: rows });
}));

// ── Rights Holders: Update ──────────────────────────────────────────────────
app.patch("/api/v1/rights-holders/:id", requireAuth(async (req, res) => {
  const rh = (await db.execute({
    sql: "SELECT id FROM rights_holders WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!rh) return res.status(404).json({ error: "Rights holder not found" });

  const fields = [];
  const args = [];
  for (const key of ["name", "email", "payout_method", "payout_info"]) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(req.body[key]);
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

  args.push(req.params.id);
  await db.execute({ sql: `UPDATE rights_holders SET ${fields.join(", ")} WHERE id = ?`, args });
  res.json({ ok: true });
}));

// ── Track Rights: Set rights with confirmation flow ─────────────────────────
// Uploader declares splits → each rights holder gets email → must confirm
app.put("/api/v1/tracks/:trackId/rights", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id, title, artist FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.trackId, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const { rights } = req.body;
  if (!Array.isArray(rights) || rights.length === 0) {
    return res.status(400).json({ error: "rights array required: [{rights_holder_id, share_pct, role?}]" });
  }

  const total = rights.reduce((sum, r) => sum + (r.share_pct || 0), 0);
  if (total > 100) return res.status(400).json({ error: `Total share is ${total}% — must be <= 100%` });

  // Validate all rights holders exist and belong to user
  const rhDetails = [];
  for (const r of rights) {
    if (!r.rights_holder_id || !r.share_pct) {
      return res.status(400).json({ error: "Each right needs rights_holder_id and share_pct" });
    }
    const rh = (await db.execute({
      sql: "SELECT * FROM rights_holders WHERE id = ? AND user_id = ?",
      args: [r.rights_holder_id, req.user.id],
    })).rows[0];
    if (!rh) return res.status(404).json({ error: `Rights holder ${r.rights_holder_id} not found` });
    rhDetails.push({ ...r, rh });
  }

  // Replace all rights (resets confirmation status)
  await db.execute({ sql: "DELETE FROM track_rights WHERE track_id = ?", args: [req.params.trackId] });

  const confirmations = [];
  for (const r of rhDetails) {
    const token = crypto.randomBytes(20).toString("hex");
    // Auto-confirm if the rights holder's email matches the uploader's email
    const isSelf = r.rh.email && r.rh.email.toLowerCase() === req.user.email.toLowerCase();
    await db.execute({
      sql: `INSERT INTO track_rights (track_id, rights_holder_id, role, share_pct, status, confirm_token, confirmed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        req.params.trackId, r.rights_holder_id, r.role || "creator", r.share_pct,
        isSelf ? "confirmed" : "pending", isSelf ? null : token, isSelf ? new Date().toISOString() : null,
      ],
    });

    if (!isSelf && r.rh.email) {
      // Send confirmation email
      const origin = `${req.protocol}://${req.get("host")}`;
      const confirmUrl = `${origin}/api/v1/rights/confirm/${token}`;
      if (RESEND_API_KEY) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: "SOLUNA Rights <noreply@solun.art>",
              to: [r.rh.email],
              subject: `Confirm your rights: "${track.title}"`,
              html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0d14;color:#fff;border-radius:12px;">
                  <h2 style="color:#C9A962;margin:0 0 16px">Rights Confirmation</h2>
                  <p>You've been listed as a rights holder for:</p>
                  <div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:8px;margin:16px 0">
                    <strong>${track.title}</strong>${track.artist ? ` by ${track.artist}` : ""}<br/>
                    <span style="color:#C9A962">Role: ${r.role || "creator"} — ${r.share_pct}% share</span>
                  </div>
                  <p>Click below to confirm your rights. Royalties will be held in escrow until confirmed.</p>
                  <a href="${confirmUrl}" style="display:inline-block;background:#C9A962;color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
                    Confirm My Rights
                  </a>
                  <p style="font-size:12px;color:rgba(255,255,255,0.3);margin-top:24px">
                    If you don't recognize this, you can ignore this email or
                    <a href="${origin}/api/v1/rights/dispute/${req.params.trackId}" style="color:#C9A962">file a dispute</a>.
                  </p>
                </div>`,
            }),
          });
        } catch (e) { console.error("Rights email error:", e.message); }
      }
      confirmations.push({ name: r.rh.name, email: r.rh.email, status: "pending", confirm_url: `${origin}/api/v1/rights/confirm/${token}` });
    } else {
      confirmations.push({ name: r.rh.name, status: "confirmed" });
    }
  }

  // Update track rights_status
  const allConfirmed = confirmations.every(c => c.status === "confirmed");
  await db.execute({
    sql: "UPDATE tracks SET rights_status = ? WHERE id = ?",
    args: [allConfirmed ? "confirmed" : "pending_confirmation", req.params.trackId],
  });

  // Audit log
  await db.execute({
    sql: "INSERT INTO rights_audit_log (track_id, action, actor, details) VALUES (?, 'rights_set', ?, ?)",
    args: [req.params.trackId, req.user.email, JSON.stringify({ total_pct: total, holders: rights.length })],
  });

  res.json({
    ok: true,
    total_share_pct: total,
    rights_count: rights.length,
    track_rights_status: allConfirmed ? "confirmed" : "pending_confirmation",
    confirmations,
  });
}));

// ── Rights: Confirm (via email token) ───────────────────────────────────────
app.get("/api/v1/rights/confirm/:token", async (req, res) => {
  const tr = (await db.execute({
    sql: `SELECT tr.*, t.title, t.artist, rh.name as holder_name
          FROM track_rights tr
          JOIN tracks t ON t.id = tr.track_id
          JOIN rights_holders rh ON rh.id = tr.rights_holder_id
          WHERE tr.confirm_token = ? AND tr.status = 'pending'`,
    args: [req.params.token],
  })).rows[0];
  if (!tr) {
    return res.setHeader("Content-Type", "text/html").send(`
      <html><body style="font-family:sans-serif;background:#0a0d14;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
        <div style="text-align:center">
          <h2 style="color:#C9A962">Link Invalid or Already Used</h2>
          <p style="color:rgba(255,255,255,0.4)">This confirmation link has expired or was already confirmed.</p>
        </div>
      </body></html>`);
  }

  // Mark as confirmed
  await db.execute({
    sql: "UPDATE track_rights SET status = 'confirmed', confirmed_at = datetime('now'), confirm_token = NULL WHERE confirm_token = ?",
    args: [req.params.token],
  });

  // Release escrow to balance for this rights holder
  const escrowed = (await db.execute({
    sql: "SELECT escrow_balance FROM rights_holders WHERE id = ?",
    args: [tr.rights_holder_id],
  })).rows[0];
  if (escrowed && escrowed.escrow_balance > 0) {
    await db.execute({
      sql: "UPDATE rights_holders SET balance = balance + escrow_balance, escrow_balance = 0 WHERE id = ?",
      args: [tr.rights_holder_id],
    });
  }

  // Check if all rights for this track are now confirmed
  const pending = (await db.execute({
    sql: "SELECT COUNT(*) as c FROM track_rights WHERE track_id = ? AND status != 'confirmed'",
    args: [tr.track_id],
  })).rows[0].c;
  if (pending === 0) {
    await db.execute({ sql: "UPDATE tracks SET rights_status = 'confirmed' WHERE id = ?", args: [tr.track_id] });
  }

  // Audit log
  await db.execute({
    sql: "INSERT INTO rights_audit_log (track_id, action, actor, details) VALUES (?, 'rights_confirmed', ?, ?)",
    args: [tr.track_id, tr.holder_name, JSON.stringify({ share_pct: tr.share_pct, role: tr.role })],
  });

  res.setHeader("Content-Type", "text/html").send(`
    <html><body style="font-family:sans-serif;background:#0a0d14;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
      <div style="text-align:center;max-width:400px">
        <div style="font-size:48px;margin-bottom:16px">&#10003;</div>
        <h2 style="color:#C9A962;margin:0 0 12px">Rights Confirmed!</h2>
        <p style="color:rgba(255,255,255,0.6)">
          <strong>${tr.holder_name}</strong> — ${tr.share_pct}% ${tr.role} on<br/>
          "${tr.title}"${tr.artist ? ` by ${tr.artist}` : ""}
        </p>
        <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:24px">
          Royalties will now flow to your account. Any previously escrowed earnings have been released.
        </p>
        <a href="/" style="display:inline-block;margin-top:16px;color:#C9A962;text-decoration:none">Back to SOLUNA</a>
      </div>
    </body></html>`);
});

// ── Rights: File a dispute ──────────────────────────────────────────────────
app.post("/api/v1/rights/dispute", async (req, res) => {
  const { track_id, email, name, reason, evidence_url } = req.body;
  if (!track_id || !email || !reason) {
    return res.status(400).json({ error: "track_id, email, and reason required" });
  }

  const track = (await db.execute({
    sql: "SELECT id, title FROM tracks WHERE id = ?",
    args: [track_id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const disputeId = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO rights_disputes (id, track_id, filed_by_email, filed_by_name, reason, evidence_url)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [disputeId, track_id, email.toLowerCase(), name || null, reason, evidence_url || null],
  });

  // Freeze track rights — move all balances to escrow for this track's holders
  await db.execute({
    sql: "UPDATE tracks SET rights_status = 'disputed' WHERE id = ?",
    args: [track_id],
  });

  // Audit log
  await db.execute({
    sql: "INSERT INTO rights_audit_log (track_id, action, actor, details) VALUES (?, 'dispute_filed', ?, ?)",
    args: [track_id, email, JSON.stringify({ reason, dispute_id: disputeId })],
  });

  // Notify admin
  if (RESEND_API_KEY) {
    sendAdminEmail(
      `Rights Dispute Filed: "${track.title}"`,
      `<p><strong>${name || email}</strong> filed a dispute for track "${track.title}".</p>
       <p>Reason: ${reason}</p>
       <p>Dispute ID: ${disputeId}</p>
       <p>All royalties for this track are now frozen.</p>`
    ).catch(() => {});
  }

  res.json({
    ok: true,
    dispute: {
      id: disputeId,
      track_id,
      status: "open",
      message: "Dispute filed. All royalties for this track are now held in escrow until resolved.",
    },
  });
});

// ── Rights: Resolve dispute (admin) ─────────────────────────────────────────
app.patch("/api/v1/admin/disputes/:id", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  (async () => {
    const dispute = (await db.execute({
      sql: "SELECT * FROM rights_disputes WHERE id = ? AND status = 'open'",
      args: [req.params.id],
    })).rows[0];
    if (!dispute) return res.status(404).json({ error: "Dispute not found or already resolved" });

    const { resolution, new_rights } = req.body;
    if (!resolution) return res.status(400).json({ error: "resolution required" });

    await db.execute({
      sql: "UPDATE rights_disputes SET status = 'resolved', resolution = ?, resolved_at = datetime('now') WHERE id = ?",
      args: [resolution, dispute.id],
    });

    // If new_rights provided, update track rights
    if (new_rights && Array.isArray(new_rights)) {
      await db.execute({ sql: "DELETE FROM track_rights WHERE track_id = ?", args: [dispute.track_id] });
      for (const r of new_rights) {
        await db.execute({
          sql: `INSERT INTO track_rights (track_id, rights_holder_id, role, share_pct, status, confirmed_at)
                VALUES (?, ?, ?, ?, 'confirmed', datetime('now'))`,
          args: [dispute.track_id, r.rights_holder_id, r.role || "creator", r.share_pct],
        });
      }
    }

    // Check if any more open disputes for this track
    const otherDisputes = (await db.execute({
      sql: "SELECT COUNT(*) as c FROM rights_disputes WHERE track_id = ? AND status = 'open'",
      args: [dispute.track_id],
    })).rows[0].c;

    if (otherDisputes === 0) {
      // Unfreeze — release escrow for all holders of this track
      const holders = (await db.execute({
        sql: "SELECT rights_holder_id FROM track_rights WHERE track_id = ?",
        args: [dispute.track_id],
      })).rows;
      for (const h of holders) {
        await db.execute({
          sql: "UPDATE rights_holders SET balance = balance + escrow_balance, escrow_balance = 0 WHERE id = ?",
          args: [h.rights_holder_id],
        });
      }
      await db.execute({
        sql: "UPDATE tracks SET rights_status = 'confirmed' WHERE id = ?",
        args: [dispute.track_id],
      });
    }

    await db.execute({
      sql: "INSERT INTO rights_audit_log (track_id, action, actor, details) VALUES (?, 'dispute_resolved', 'admin', ?)",
      args: [dispute.track_id, JSON.stringify({ resolution, dispute_id: dispute.id })],
    });

    res.json({ ok: true, status: "resolved", remaining_disputes: otherDisputes });
  })().catch(e => {
    console.error("dispute resolve error:", e);
    res.status(500).json({ error: "Failed" });
  });
});

// ── Rights: Verify email (rights holder) ────────────────────────────────────
app.post("/api/v1/rights-holders/:id/verify-email", requireAuth(async (req, res) => {
  const rh = (await db.execute({
    sql: "SELECT * FROM rights_holders WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!rh) return res.status(404).json({ error: "Rights holder not found" });
  if (!rh.email) return res.status(400).json({ error: "No email set" });
  if (rh.email_verified) return res.json({ ok: true, message: "Already verified" });

  const token = crypto.randomBytes(20).toString("hex");
  await db.execute({
    sql: "UPDATE rights_holders SET verify_token = ? WHERE id = ?",
    args: [token, rh.id],
  });

  const origin = `${req.protocol}://${req.get("host")}`;
  if (RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <noreply@solun.art>",
        to: [rh.email],
        subject: "Verify your email — SOLUNA Rights",
        html: `<p>Click to verify: <a href="${origin}/api/v1/rights-holders/verify/${token}">Verify Email</a></p>`,
      }),
    });
  }

  res.json({ ok: true, message: `Verification email sent to ${rh.email}`, verify_url: `${origin}/api/v1/rights-holders/verify/${token}` });
}));

// ── Rights: Email verification callback ─────────────────────────────────────
app.get("/api/v1/rights-holders/verify/:token", async (req, res) => {
  const rh = (await db.execute({
    sql: "SELECT id, name FROM rights_holders WHERE verify_token = ?",
    args: [req.params.token],
  })).rows[0];
  if (!rh) return res.status(404).send("Invalid or expired verification link.");

  await db.execute({
    sql: "UPDATE rights_holders SET email_verified = 1, verify_token = NULL WHERE id = ?",
    args: [rh.id],
  });

  res.setHeader("Content-Type", "text/html").send(`
    <html><body style="font-family:sans-serif;background:#0a0d14;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
      <div style="text-align:center">
        <div style="font-size:48px;margin-bottom:16px">&#10003;</div>
        <h2 style="color:#C9A962">Email Verified!</h2>
        <p style="color:rgba(255,255,255,0.5)">${rh.name} — your email is now verified.</p>
      </div>
    </body></html>`);
});

// ── Track Rights: Get (with confirmation status) ────────────────────────────
app.get("/api/v1/tracks/:trackId/rights", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id, title, rights_status, isrc FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.trackId, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const rights = (await db.execute({
    sql: `SELECT tr.rights_holder_id, rh.name, rh.email, rh.email_verified,
          tr.role, tr.share_pct, tr.status, tr.confirmed_at
          FROM track_rights tr JOIN rights_holders rh ON rh.id = tr.rights_holder_id
          WHERE tr.track_id = ?`,
    args: [req.params.trackId],
  })).rows;

  const disputes = (await db.execute({
    sql: "SELECT id, filed_by_email, reason, status, created_at FROM rights_disputes WHERE track_id = ? ORDER BY created_at DESC",
    args: [req.params.trackId],
  })).rows;

  const auditLog = (await db.execute({
    sql: "SELECT action, actor, details, created_at FROM rights_audit_log WHERE track_id = ? ORDER BY created_at DESC LIMIT 20",
    args: [req.params.trackId],
  })).rows;

  res.json({
    ok: true,
    track: { id: track.id, title: track.title, rights_status: track.rights_status, isrc: track.isrc },
    rights,
    disputes,
    audit_log: auditLog,
  });
}));

// ── Rights: Get audit log for a track ───────────────────────────────────────
app.get("/api/v1/tracks/:trackId/audit-log", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.trackId, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const log = (await db.execute({
    sql: "SELECT * FROM rights_audit_log WHERE track_id = ? ORDER BY created_at DESC",
    args: [req.params.trackId],
  })).rows;
  res.json({ ok: true, audit_log: log });
}));

// ── Royalties: Dashboard for a rights holder ────────────────────────────────
app.get("/api/v1/rights-holders/:id/royalties", requireAuth(async (req, res) => {
  const rh = (await db.execute({
    sql: "SELECT * FROM rights_holders WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!rh) return res.status(404).json({ error: "Rights holder not found" });

  // Summary by event type
  const summary = (await db.execute({
    sql: `SELECT re.event_type, COUNT(*) as event_count, SUM(rs.amount) as total
          FROM royalty_splits rs
          JOIN royalty_events re ON re.id = rs.event_id
          WHERE rs.rights_holder_id = ?
          GROUP BY re.event_type`,
    args: [req.params.id],
  })).rows;

  // Recent events
  const recent = (await db.execute({
    sql: `SELECT re.event_type, rs.amount, rs.share_pct, t.title, t.artist, re.created_at
          FROM royalty_splits rs
          JOIN royalty_events re ON re.id = rs.event_id
          JOIN tracks t ON t.id = re.track_id
          WHERE rs.rights_holder_id = ?
          ORDER BY re.created_at DESC LIMIT 50`,
    args: [req.params.id],
  })).rows;

  // Per-track breakdown
  const byTrack = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, SUM(rs.amount) as earned, COUNT(*) as events
          FROM royalty_splits rs
          JOIN royalty_events re ON re.id = rs.event_id
          JOIN tracks t ON t.id = re.track_id
          WHERE rs.rights_holder_id = ?
          GROUP BY t.id ORDER BY earned DESC`,
    args: [req.params.id],
  })).rows;

  res.json({
    ok: true,
    rights_holder: { name: rh.name, balance: rh.balance, total_earned: rh.total_earned },
    summary,
    by_track: byTrack,
    recent_events: recent,
  });
}));

// ── Royalties: Track-level report ───────────────────────────────────────────
app.get("/api/v1/tracks/:trackId/royalties", requireAuth(async (req, res) => {
  const track = (await db.execute({
    sql: "SELECT id, title, artist, play_count FROM tracks WHERE id = ? AND user_id = ?",
    args: [req.params.trackId, req.user.id],
  })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found" });

  const rights = (await db.execute({
    sql: `SELECT rh.name, tr.role, tr.share_pct, rh.balance, rh.total_earned
          FROM track_rights tr JOIN rights_holders rh ON rh.id = tr.rights_holder_id
          WHERE tr.track_id = ?`,
    args: [req.params.trackId],
  })).rows;

  const events = (await db.execute({
    sql: `SELECT event_type, COUNT(*) as count, SUM(total_amount) as total
          FROM royalty_events WHERE track_id = ? GROUP BY event_type`,
    args: [req.params.trackId],
  })).rows;

  const totalRevenue = events.reduce((s, e) => s + (e.total || 0), 0);

  res.json({
    ok: true,
    track: { id: track.id, title: track.title, artist: track.artist, play_count: track.play_count },
    total_revenue_jpy: totalRevenue,
    events_summary: events,
    rights_holders: rights,
    rates: ROYALTY_RATES,
  });
}));

// ── Payouts: Request payout ─────────────────────────────────────────────────
app.post("/api/v1/rights-holders/:id/payouts", requireAuth(async (req, res) => {
  const rh = (await db.execute({
    sql: "SELECT * FROM rights_holders WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!rh) return res.status(404).json({ error: "Rights holder not found" });

  if (rh.payout_method === "pending") {
    return res.status(400).json({ error: "Set payout_method first (bank_transfer, paypal, crypto)" });
  }
  if (!rh.email_verified) {
    return res.status(400).json({ error: "Email must be verified before payout. Use POST /api/v1/rights-holders/:id/verify-email" });
  }

  const { amount } = req.body;
  const payoutAmount = amount || rh.balance;
  if (payoutAmount <= 0) return res.status(400).json({ error: "No balance to pay out" });
  if (payoutAmount > rh.balance) return res.status(400).json({ error: `Insufficient balance (¥${rh.balance})` });

  // Minimum payout ¥1,000
  if (payoutAmount < 1000) {
    return res.status(400).json({ error: "Minimum payout is ¥1,000" });
  }

  const payoutId = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO payouts (id, rights_holder_id, amount, method, status) VALUES (?, ?, ?, ?, 'pending')",
    args: [payoutId, rh.id, payoutAmount, rh.payout_method],
  });

  // Deduct from balance
  await db.execute({
    sql: "UPDATE rights_holders SET balance = balance - ? WHERE id = ?",
    args: [payoutAmount, rh.id],
  });

  res.json({
    ok: true,
    payout: {
      id: payoutId,
      amount: payoutAmount,
      currency: "JPY",
      method: rh.payout_method,
      status: "pending",
    },
  });
}));

// ── Payouts: List for a rights holder ───────────────────────────────────────
app.get("/api/v1/rights-holders/:id/payouts", requireAuth(async (req, res) => {
  const rh = (await db.execute({
    sql: "SELECT id FROM rights_holders WHERE id = ? AND user_id = ?",
    args: [req.params.id, req.user.id],
  })).rows[0];
  if (!rh) return res.status(404).json({ error: "Rights holder not found" });

  const payouts = (await db.execute({
    sql: "SELECT * FROM payouts WHERE rights_holder_id = ? ORDER BY created_at DESC",
    args: [req.params.id],
  })).rows;
  res.json({ ok: true, payouts });
}));

// ── Admin: Process payout (mark as completed) ───────────────────────────────
app.patch("/api/v1/admin/payouts/:id", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  const { status, reference } = req.body;
  if (!["completed", "failed", "cancelled"].includes(status)) {
    return res.status(400).json({ error: "status must be completed, failed, or cancelled" });
  }

  (async () => {
    const payout = (await db.execute({
      sql: "SELECT * FROM payouts WHERE id = ?",
      args: [req.params.id],
    })).rows[0];
    if (!payout) return res.status(404).json({ error: "Payout not found" });

    if (status === "failed" || status === "cancelled") {
      // Refund balance
      await db.execute({
        sql: "UPDATE rights_holders SET balance = balance + ? WHERE id = ?",
        args: [payout.amount, payout.rights_holder_id],
      });
    }

    await db.execute({
      sql: "UPDATE payouts SET status = ?, reference = ?, completed_at = datetime('now') WHERE id = ?",
      args: [status, reference || null, req.params.id],
    });
    res.json({ ok: true, status });
  })().catch(e => {
    console.error("payout update error:", e);
    res.status(500).json({ error: "Failed" });
  });
});

// ── Admin: Backfill verification data for existing tracks ───────────────────
app.post("/api/v1/admin/backfill-verification", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  const tracks = (await db.execute({
    sql: "SELECT id, title, file_path FROM tracks WHERE audio_hash IS NULL",
  })).rows;

  res.json({ ok: true, queued: tracks.length });

  // Process asynchronously
  (async () => {
    let updated = 0, failed = 0;
    for (const track of tracks) {
      const filePath = path.join(AUDIO_DIR, track.file_path);
      if (!fs.existsSync(filePath)) { failed++; continue; }

      try {
        const hash = await sha256File(filePath);
        const fp = await getAudioFingerprint(filePath);
        await db.execute({
          sql: "UPDATE tracks SET audio_hash = ?, fingerprint = ?, duration_sec = COALESCE(duration_sec, ?) WHERE id = ?",
          args: [hash, fp?.fingerprint || null, fp?.duration ? Math.round(fp.duration) : null, track.id],
        });
        if (hash && solanaKeypair) {
          const sig = await anchorOnSolana(track.id, hash, track.title);
          if (sig) {
            await db.execute({
              sql: "UPDATE tracks SET anchor_tx = ?, anchor_time = datetime('now') WHERE id = ?",
              args: [sig, track.id],
            });
          }
        }
        updated++;
        console.log(`✓ Backfilled: ${track.title} (${hash?.slice(0,8)})`);
      } catch (e) {
        console.error(`✗ Backfill failed: ${track.title}`, e.message);
        failed++;
      }
    }
    console.log(`Backfill complete: ${updated} updated, ${failed} failed`);
  })();
});

// ── Admin: Bulk AI cover generation ─────────────────────────────────────────
app.post("/api/v1/admin/generate-covers", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  const tracks = (await db.execute({
    sql: "SELECT id, title, artist, genre FROM tracks WHERE cover_url IS NULL OR cover_url LIKE '/api/v1/tracks/%/cover'",
  })).rows;

  res.json({ ok: true, queued: tracks.length });

  (async () => {
    let ok = 0, fail = 0;
    for (const track of tracks) {
      try {
        const aiCover = await generateCoverWithGemini(track.id, track.title, track.artist, track.genre);
        const url = aiCover || `/api/v1/tracks/${track.id}/cover`;
        await db.execute({ sql: "UPDATE tracks SET cover_url = ? WHERE id = ?", args: [url, track.id] });
        if (aiCover) { ok++; console.log(`🎨 Cover: ${track.title} → ${aiCover}`); }
        else fail++;
      } catch (e) { fail++; }
      await new Promise(r => setTimeout(r, 2000)); // 2s between Gemini calls
    }
    console.log(`Cover generation done: ${ok} AI, ${fail} SVG fallback`);
  })();
});

// ── Admin: Backfill metadata (lyrics, iTunes, MusicBrainz) ──────────────────
app.post("/api/v1/admin/backfill-metadata", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  const tracks = (await db.execute({
    sql: "SELECT id, title, artist, fingerprint, duration_sec FROM tracks WHERE lyrics IS NULL OR cover_url IS NULL",
  })).rows;

  res.json({ ok: true, queued: tracks.length });

  (async () => {
    for (const track of tracks) {
      await enrichTrackMetadata(track.id, track.artist, track.title, track.fingerprint, track.duration_sec);
      await new Promise(r => setTimeout(r, 1200)); // 1.2s between requests (MusicBrainz rate limit)
    }
    console.log(`Metadata backfill complete: ${tracks.length} tracks processed`);
  })();
});

// ── Admin: Migrate local files to S3 ─────────────────────────────────────────
app.post("/api/v1/admin/migrate-s3", async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });
  if (!s3) return res.status(400).json({ error: "S3 not configured" });

  let audioMigrated = 0, coverMigrated = 0, audioSkipped = 0, coverSkipped = 0, errors = 0;

  // Migrate audio files
  const tracks = (await db.execute("SELECT id, file_path, format FROM tracks")).rows;
  res.json({ ok: true, queued_audio: tracks.length, message: "Migration started in background" });

  (async () => {
    for (const track of tracks) {
      const s3Key = `audio/${track.file_path}`;
      const localPath = path.join(AUDIO_DIR, track.file_path);
      try {
        const exists = await s3Head(s3Key);
        if (exists) { audioSkipped++; continue; }
        if (!fs.existsSync(localPath)) { continue; }
        const mimeMap = { mp3: "audio/mpeg", m4a: "audio/mp4", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac", aac: "audio/aac" };
        // Stream upload to avoid loading entire file into memory
        const stream = fs.createReadStream(localPath);
        const stat = fs.statSync(localPath);
        await s3.send(new PutObjectCommand({
          Bucket: S3_BUCKET, Key: s3Key, Body: stream,
          ContentType: mimeMap[track.format] || "audio/mpeg", ContentLength: stat.size,
        }));
        audioMigrated++;
        console.log(`☁ Migrated audio: ${track.file_path} (${(stat.size/1024/1024).toFixed(1)}MB)`);
      } catch (e) { errors++; console.error(`Migration failed: ${track.file_path}: ${e.message}`); }
    }

    // Migrate cover files
    try {
      const coverFiles = fs.readdirSync(COVERS_DIR).filter(f => f.endsWith(".jpg"));
      for (const file of coverFiles) {
        const s3Key = `covers/${file}`;
        try {
          const exists = await s3Head(s3Key);
          if (exists) { coverSkipped++; continue; }
          const coverPath = path.join(COVERS_DIR, file);
          const stat = fs.statSync(coverPath);
          await s3.send(new PutObjectCommand({
            Bucket: S3_BUCKET, Key: s3Key, Body: fs.createReadStream(coverPath),
            ContentType: "image/jpeg", ContentLength: stat.size,
          }));
          coverMigrated++;
          console.log(`☁ Migrated cover: ${file}`);
        } catch (e) { errors++; console.error(`Cover migration failed: ${file}: ${e.message}`); }
      }
    } catch {}

    console.log(`✓ S3 migration done: audio=${audioMigrated} new / ${audioSkipped} skipped, covers=${coverMigrated} new / ${coverSkipped} skipped, errors=${errors}`);
  })();
});

// ── Public: Royalty rates ───────────────────────────────────────────────────
app.get("/api/v1/royalty-rates", (_req, res) => {
  res.json({
    ok: true,
    rates: ROYALTY_RATES,
    currency: "JPY",
    minimum_payout: 1000,
    payout_methods: ["bank_transfer", "paypal", "crypto"],
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ── TICKET SYSTEM API ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function generateQR() {
  return `SOL-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
}

// ── Ticket Types: List available ────────────────────────────────────────────
app.get("/api/v1/tickets/types", async (_req, res) => {
  const types = (await db.execute(
    "SELECT id, name, description, price, currency, quantity_total, quantity_sold, max_per_order, sale_start, sale_end, active FROM ticket_types WHERE active = 1"
  )).rows.map(t => ({
    ...t,
    available: t.quantity_total - t.quantity_sold,
    sold_out: t.quantity_sold >= t.quantity_total,
  }));
  res.json({ ok: true, ticket_types: types });
});

// ── Tickets: Purchase (Stripe Checkout) ─────────────────────────────────────
app.post("/api/v1/tickets/checkout", async (req, res) => {
  if (!STRIPE_SECRET_KEY) return res.status(503).json({ error: "Payments not configured" });
  const stripe = require("stripe")(STRIPE_SECRET_KEY);

  const { items, email, name } = req.body;
  // items: [{type_id, quantity}]
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items required: [{type_id, quantity}]" });
  }
  if (!email) return res.status(400).json({ error: "email required" });

  const lineItems = [];
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const tt = (await db.execute({
      sql: "SELECT * FROM ticket_types WHERE id = ? AND active = 1",
      args: [item.type_id],
    })).rows[0];
    if (!tt) return res.status(404).json({ error: `Ticket type ${item.type_id} not found` });

    const qty = Math.min(item.quantity || 1, tt.max_per_order);
    const available = tt.quantity_total - tt.quantity_sold;
    if (qty > available) return res.status(409).json({ error: `Only ${available} tickets remaining for ${tt.name}` });

    lineItems.push({
      price_data: {
        currency: tt.currency.toLowerCase(),
        product_data: {
          name: tt.name,
          description: tt.description || undefined,
          images: ["https://solun.art/assets/og-image.png"],
        },
        unit_amount: tt.price,
      },
      quantity: qty,
    });
    totalAmount += tt.price * qty;
    orderItems.push({ type_id: tt.id, name: tt.name, quantity: qty, unit_price: tt.price });
  }

  const orderId = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO ticket_orders (id, email, name, total_amount, currency, status, items) VALUES (?, ?, ?, ?, 'JPY', 'pending', ?)",
    args: [orderId, email.toLowerCase(), name || null, totalAmount, JSON.stringify(orderItems)],
  });

  const origin = `${req.protocol}://${req.get("host")}`;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lineItems,
    metadata: { order_id: orderId },
    success_url: `${origin}/tickets/success?order_id=${orderId}`,
    cancel_url: `${origin}/tickets?cancelled=true`,
    locale: "auto",
    payment_intent_data: {
      description: `SOLUNA FEST HAWAII 2026 — Order ${orderId.slice(0, 8)}`,
    },
  });

  await db.execute({
    sql: "UPDATE ticket_orders SET stripe_session_id = ? WHERE id = ?",
    args: [session.id, orderId],
  });

  res.json({ ok: true, order_id: orderId, checkout_url: session.url });
});

// ── Tickets: Stripe Webhook ─────────────────────────────────────────────────
app.post("/api/v1/tickets/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  if (!STRIPE_SECRET_KEY) return res.status(503).end();
  const stripe = require("stripe")(STRIPE_SECRET_KEY);

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).end();
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!orderId) return res.json({ ok: true });

    const order = (await db.execute({
      sql: "SELECT * FROM ticket_orders WHERE id = ?",
      args: [orderId],
    })).rows[0];
    if (!order || order.status === "completed") return res.json({ ok: true });

    // Mark order completed
    await db.execute({
      sql: "UPDATE ticket_orders SET status = 'completed', stripe_payment_intent = ? WHERE id = ?",
      args: [session.payment_intent, orderId],
    });

    // Issue tickets
    const orderItems = JSON.parse(order.items || "[]");
    for (const item of orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketId = crypto.randomUUID();
        const qr = generateQR();
        await db.execute({
          sql: `INSERT INTO tickets (id, ticket_type_id, order_id, owner_email, owner_name, status, qr_code, stripe_session_id)
                VALUES (?, ?, ?, ?, ?, 'valid', ?, ?)`,
          args: [ticketId, item.type_id, orderId, order.email, order.name, qr, session.id],
        });
        // Update sold count
        await db.execute({
          sql: "UPDATE ticket_types SET quantity_sold = quantity_sold + 1 WHERE id = ?",
          args: [item.type_id],
        });
      }
    }

    console.log(`Tickets issued for order ${orderId} (${order.email})`);
  }
  res.json({ ok: true });
});

// ── Tickets: Order status (after payment) ───────────────────────────────────
app.get("/api/v1/tickets/orders/:orderId", async (req, res) => {
  const order = (await db.execute({
    sql: "SELECT id, email, name, total_amount, currency, status, items, created_at FROM ticket_orders WHERE id = ?",
    args: [req.params.orderId],
  })).rows[0];
  if (!order) return res.status(404).json({ error: "Order not found" });

  const tickets = (await db.execute({
    sql: `SELECT t.id, t.qr_code, t.status, t.checked_in, tt.name as type_name, tt.description
          FROM tickets t JOIN ticket_types tt ON tt.id = t.ticket_type_id
          WHERE t.order_id = ?`,
    args: [order.id],
  })).rows;

  res.json({ ok: true, order: { ...order, items: JSON.parse(order.items || "[]") }, tickets });
});

// ── Tickets: My tickets (by email) ──────────────────────────────────────────
app.get("/api/v1/tickets/mine", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "email query param required" });

  const tickets = (await db.execute({
    sql: `SELECT t.id, t.qr_code, t.status, t.checked_in, t.checked_in_at,
          t.owner_name, t.transferred_from, t.created_at,
          tt.name as type_name, tt.description as type_description
          FROM tickets t JOIN ticket_types tt ON tt.id = t.ticket_type_id
          WHERE t.owner_email = ? AND t.status = 'valid'
          ORDER BY t.created_at DESC`,
    args: [email.toLowerCase()],
  })).rows;
  res.json({ ok: true, tickets });
});

// ── Tickets: Get single (by QR code or ID) ─────────────────────────────────
app.get("/api/v1/tickets/:idOrQr", async (req, res) => {
  const param = req.params.idOrQr;
  const ticket = (await db.execute({
    sql: `SELECT t.*, tt.name as type_name, tt.description as type_description
          FROM tickets t JOIN ticket_types tt ON tt.id = t.ticket_type_id
          WHERE t.id = ? OR t.qr_code = ?`,
    args: [param, param],
  })).rows[0];
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  res.json({
    ok: true,
    ticket: {
      id: ticket.id,
      qr_code: ticket.qr_code,
      type_name: ticket.type_name,
      type_description: ticket.type_description,
      owner_email: ticket.owner_email,
      owner_name: ticket.owner_name,
      status: ticket.status,
      checked_in: !!ticket.checked_in,
      checked_in_at: ticket.checked_in_at,
      created_at: ticket.created_at,
    },
  });
});

// ── Tickets: Transfer (initiate) ────────────────────────────────────────────
app.post("/api/v1/tickets/:id/transfer", async (req, res) => {
  const { from_email, to_email, to_name, message } = req.body;
  if (!from_email || !to_email) return res.status(400).json({ error: "from_email and to_email required" });

  const ticket = (await db.execute({
    sql: "SELECT * FROM tickets WHERE id = ? AND owner_email = ? AND status = 'valid'",
    args: [req.params.id, from_email.toLowerCase()],
  })).rows[0];
  if (!ticket) return res.status(404).json({ error: "Ticket not found or not owned by this email" });
  if (ticket.checked_in) return res.status(400).json({ error: "Cannot transfer a checked-in ticket" });

  const transferId = crypto.randomUUID();
  const token = crypto.randomBytes(16).toString("hex");

  await db.execute({
    sql: "INSERT INTO ticket_transfers (id, ticket_id, from_email, to_email, to_name, status, token, message) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)",
    args: [transferId, ticket.id, from_email.toLowerCase(), to_email.toLowerCase(), to_name || null, token, message || null],
  });

  const origin = `${req.protocol}://${req.get("host")}`;
  const acceptUrl = `${origin}/api/v1/tickets/transfers/${token}/accept`;

  // Send email if Resend is configured
  if (RESEND_API_KEY) {
    await sendAdminEmail(
      `Ticket Transfer: ${ticket.qr_code}`,
      `<p>${from_email} wants to transfer a ticket to ${to_email}.</p>
       <p>Transfer ID: ${transferId}</p>`
    ).catch(() => {});
  }

  res.json({
    ok: true,
    transfer: {
      id: transferId,
      ticket_id: ticket.id,
      to_email,
      status: "pending",
      accept_url: acceptUrl,
      token,
    },
  });
});

// ── Tickets: Accept transfer ────────────────────────────────────────────────
app.post("/api/v1/tickets/transfers/:token/accept", async (req, res) => {
  const transfer = (await db.execute({
    sql: "SELECT * FROM ticket_transfers WHERE token = ? AND status = 'pending'",
    args: [req.params.token],
  })).rows[0];
  if (!transfer) return res.status(404).json({ error: "Transfer not found or already processed" });

  // Update ticket ownership
  await db.execute({
    sql: `UPDATE tickets SET owner_email = ?, owner_name = ?, transferred_from = ?, transfer_note = ?
          WHERE id = ?`,
    args: [transfer.to_email, transfer.to_name, transfer.from_email, transfer.message, transfer.ticket_id],
  });

  // Mark transfer as completed
  await db.execute({
    sql: "UPDATE ticket_transfers SET status = 'accepted', accepted_at = datetime('now') WHERE id = ?",
    args: [transfer.id],
  });

  // Generate new QR code for security
  const newQr = generateQR();
  await db.execute({
    sql: "UPDATE tickets SET qr_code = ? WHERE id = ?",
    args: [newQr, transfer.ticket_id],
  });

  res.json({ ok: true, new_qr_code: newQr, message: "Ticket transferred successfully" });
});

// ── Tickets: Cancel transfer ────────────────────────────────────────────────
app.post("/api/v1/tickets/transfers/:token/cancel", async (req, res) => {
  const transfer = (await db.execute({
    sql: "SELECT * FROM ticket_transfers WHERE token = ? AND status = 'pending'",
    args: [req.params.token],
  })).rows[0];
  if (!transfer) return res.status(404).json({ error: "Transfer not found or already processed" });

  await db.execute({
    sql: "UPDATE ticket_transfers SET status = 'cancelled' WHERE id = ?",
    args: [transfer.id],
  });
  res.json({ ok: true });
});

// ── Tickets: Check-in (event ops) ──────────────────────────────────────────
app.post("/api/v1/tickets/checkin", async (req, res) => {
  const key = req.headers["x-admin-key"] || req.headers.authorization?.replace("Bearer ", "");
  // Allow admin key or API key auth
  let staffName = "staff";
  if (ADMIN_KEY && key === ADMIN_KEY) {
    staffName = "admin";
  } else {
    const user = await authApiKey(req);
    if (!user) return res.status(403).json({ error: "Admin key or API key required" });
    staffName = user.name || user.email;
  }

  const { qr_code } = req.body;
  if (!qr_code) return res.status(400).json({ error: "qr_code required" });

  const ticket = (await db.execute({
    sql: `SELECT t.*, tt.name as type_name FROM tickets t
          JOIN ticket_types tt ON tt.id = t.ticket_type_id
          WHERE t.qr_code = ?`,
    args: [qr_code],
  })).rows[0];
  if (!ticket) return res.json({ ok: false, result: "INVALID", message: "Ticket not found" });
  if (ticket.status !== "valid") return res.json({ ok: false, result: "INVALID", message: `Ticket status: ${ticket.status}` });
  if (ticket.checked_in) {
    return res.json({
      ok: false,
      result: "ALREADY_CHECKED_IN",
      message: `Already checked in at ${ticket.checked_in_at}`,
      ticket: { owner_name: ticket.owner_name, type_name: ticket.type_name },
    });
  }

  await db.execute({
    sql: "UPDATE tickets SET checked_in = 1, checked_in_at = datetime('now'), checked_in_by = ? WHERE id = ?",
    args: [staffName, ticket.id],
  });

  res.json({
    ok: true,
    result: "SUCCESS",
    message: "Welcome to SOLUNA FEST!",
    ticket: {
      id: ticket.id,
      owner_name: ticket.owner_name,
      owner_email: ticket.owner_email,
      type_name: ticket.type_name,
    },
  });
});

// ── Tickets: Stats (admin) ──────────────────────────────────────────────────
app.get("/api/v1/tickets/stats", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!ADMIN_KEY || key !== ADMIN_KEY) return res.status(403).json({ error: "Forbidden" });

  (async () => {
    const types = (await db.execute(
      "SELECT id, name, price, quantity_total, quantity_sold FROM ticket_types"
    )).rows;

    const totalRevenue = (await db.execute(
      "SELECT SUM(total_amount) as total FROM ticket_orders WHERE status = 'completed'"
    )).rows[0].total || 0;

    const checkedIn = (await db.execute(
      "SELECT COUNT(*) as c FROM tickets WHERE checked_in = 1"
    )).rows[0].c;

    const totalTickets = (await db.execute(
      "SELECT COUNT(*) as c FROM tickets WHERE status = 'valid'"
    )).rows[0].c;

    const transfers = (await db.execute(
      "SELECT status, COUNT(*) as c FROM ticket_transfers GROUP BY status"
    )).rows;

    res.json({
      ok: true,
      revenue_jpy: totalRevenue,
      tickets_issued: totalTickets,
      checked_in: checkedIn,
      check_in_rate: totalTickets > 0 ? `${Math.round((checkedIn / totalTickets) * 100)}%` : "0%",
      by_type: types,
      transfers,
    });
  })().catch(e => {
    console.error("stats error:", e);
    res.status(500).json({ error: "Failed" });
  });
});

// ── API 404 (prevent catch-all from returning HTML for unknown API routes) ────
app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Root: SPA fallback (catches everything else) ─────────────────────────────
const indexHtml = fs.readFileSync(path.join(STATIC_DIR, "index.html"), "utf8");
app.get("*", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send(indexHtml);
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`ZAMNA server listening on :${PORT}`));
}).catch(err => {
  console.error("DB init failed:", err);
  process.exit(1);
});
