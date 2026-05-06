const express = require("express");
const compression = require("compression");
const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const { execFile } = require("child_process");

// ── m5 HITL runtime URL (updated by /api/m5/register) ──────────────────────
let m5RuntimeUrl = process.env.M5_HITL_URL || null;

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

// multer: in-memory storage for document vault uploads (PDFs, images, spreadsheets)
const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, [".pdf", ".jpg", ".jpeg", ".png", ".xlsx", ".docx", ".csv"].includes(ext));
  },
});

const app = express();
// Trust Fly.io / Nginx reverse proxy so req.ip returns the real client IP
app.set("trust proxy", 1);
const PORT = process.env.PORT || 3000;

// ── Global unhandled rejection guard (prevents Node 22 process crash) ─────────
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

// ── Auto-wrap async route handlers (Express 4 doesn't catch rejections) ───────
// Wraps any AsyncFunction route handler so rejections are forwarded to next(err)
// → Express error middleware sends 500 instead of leaving the request hanging.
// Must be installed before any app.get/post/... calls.
{
  const _wrap = fn =>
    typeof fn === 'function' && fn.constructor.name === 'AsyncFunction'
      ? (req, res, next) => fn(req, res, next).catch(next)
      : fn;
  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    const orig = app[method].bind(app);
    app[method] = (...args) => orig(...args.map(_wrap));
  }
}

const STATIC_DIR = path.join(__dirname, "out");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const RESEND_API_KEY    = process.env.RESEND_API_KEY    || "";
const ADMIN_KEY         = process.env.ADMIN_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const ADMIN_EMAIL       = "info@solun.art";
const TG_TOKEN          = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_CHAT           = process.env.TELEGRAM_CHAT_ID || "1136442501";
const BEDS24_REFRESH    = process.env.BEDS24_REFRESH_TOKEN || "";
const BASE_URL          = process.env.BASE_URL || "https://solun.art";

if (!ADMIN_KEY) console.warn("⚠ ADMIN_KEY not set — admin endpoints will reject all requests");

// ── Simple HTML escaping (prevents injection in email templates) ──────────────
function esc(s) {
  if (s == null) return "";
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
// ── Strip HTML tags from user input (defense-in-depth before esc) ──────────────
function stripTags(s) {
  if (s == null) return "";
  return String(s).replace(/<[^>]*>/g, "");
}

// ── OTP rate limiting (in-memory, resets on restart) ─────────────────────────
const OTP_RATE = new Map(); // email → { count, resetAt }
function otpRateCheck(email) {
  const now = Date.now();
  const limit = OTP_RATE.get(email);
  if (limit && now < limit.resetAt) {
    if (limit.count >= 3) return false; // blocked
    limit.count++;
  } else {
    OTP_RATE.set(email, { count: 1, resetAt: now + 5 * 60 * 1000 }); // 5-min window
  }
  return true;
}

// ── Community message rate limiting: 10 messages per minute per member ───────
const MSG_RATE = new Map(); // member_id → { count, resetAt }
function msgRateCheck(memberId) {
  const now = Date.now();
  const r = MSG_RATE.get(memberId);
  if (r && now < r.resetAt) {
    if (r.count >= 10) return false;
    r.count++;
  } else {
    MSG_RATE.set(memberId, { count: 1, resetAt: now + 60 * 1000 });
  }
  return true;
}

// ── Chat rate limiting (declared here so cleanup setInterval can reference it) ─
const CHAT_RATE = new Map(); // key → { count, resetAt }
function chatRateCheck(key, max) {
  const now = Date.now();
  const r = CHAT_RATE.get(key);
  if (r && now < r.resetAt) {
    if (r.count >= max) return false;
    r.count++;
  } else {
    CHAT_RATE.set(key, { count: 1, resetAt: now + 60 * 1000 });
  }
  return true;
}

// ── Periodic cleanup of rate limiter Maps (prevent memory growth) ─────────────
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of OTP_RATE)  if (now >= v.resetAt) OTP_RATE.delete(k);
  for (const [k, v] of MSG_RATE)  if (now >= v.resetAt) MSG_RATE.delete(k);
  for (const [k, v] of CHAT_RATE) if (now >= v.resetAt) CHAT_RATE.delete(k);
}, 10 * 60 * 1000); // every 10 minutes

// ── Property / month-op config ────────────────────────────────────────────────
const MONTH_OP_PROPS = {
  tapkop: {
    name: "TAPKOP", location: "北海道 弟子屈 / 阿寒摩周国立公園",
    price_jpy: 240000, avg_revenue_jpy: 300000,
    cleaning_fee: 15000, linen_fee_per_stay: 3000,
    bed_service: true, bed_service_fee: 2000,
  },
  lodge: {
    name: "THE LODGE", location: "北海道 弟子屈 / 美留和",
    price_jpy: 130000, avg_revenue_jpy: 170000,
    cleaning_fee: 10000, linen_fee_per_stay: 2000,
    bed_service: true, bed_service_fee: 1500,
  },
  atami: {
    name: "WHITE HOUSE 熱海", location: "静岡県 熱海市",
    price_jpy: 160000, avg_revenue_jpy: 210000,
    cleaning_fee: 12000, linen_fee_per_stay: 2500,
    bed_service: true, bed_service_fee: 2000,
  },
};
const KUMIAI_MAX_INVESTORS = 49;
const MONTH_OP_ADVANCE = 6; // months ahead available for purchase

const PROP_DISPLAY = {
  tapkop:    "TAPKOP（弟子屈）",
  lodge:     "THE LODGE（弟子屈）",
  nesting:   "THE LODGE NESTING（弟子屈）",
  atami:     "WHITE HOUSE 熱海",
  instant_a: "Instant House A（弟子屈）",
  instant_b: "Instant House B（弟子屈）",
};
function propLabel(cabin) { return PROP_DISPLAY[cabin] || cabin; }

const DATABASE_URL = process.env.DATABASE_URL
  || (process.env.DB_PATH ? `file:${process.env.DB_PATH}` : "file:/data/contracts.db");
const db = createClient({ url: DATABASE_URL, authToken: process.env.DATABASE_AUTH_TOKEN });

async function sendAdminEmail(subject, html) {
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: "SOLUNA <noreply@solun.art>", to: [ADMIN_EMAIL], subject, html }),
    });
  } catch (e) {
    console.error("Resend error:", e.message);
  }
}

// ── Project Email Router ──────────────────────────────────────────────────────
const PROJECT_CONTEXTS = {
  build: {
    name: "SOLUNA Build",
    from: "SOLUNA Build <build@solun.art>",
    prompt: `あなたはSOLUNA合同会社の自然建築プロジェクト担当です。北海道弟子屈・熊牛原野でストローベイル・コードウッドサウナ・版築の施工を進めています。問い合わせに日本語で丁寧に返信してください。代表: 濱田優貴（mail@yukihamada.jp / 090-7409-0407）`
  },
  materials: {
    name: "SOLUNA Materials",
    from: "SOLUNA Materials <materials@solun.art>",
    prompt: `あなたはSOLUNA MATERIALSの建材調達担当です。籾殻断熱ボード・くん炭ボード・竹集成材・杉CLTなど国産自然建材の調達・共同開発を進めています。問い合わせに日本語で丁寧に返信してください。代表: 濱田優貴（mail@yukihamada.jp / 090-7409-0407）`
  },
  wp: {
    name: "SOLUNA Work Party",
    from: "SOLUNA Work Party <wp@solun.art>",
    prompt: `あなたはSOLUNA Work Partyの担当です。版築・コードウッドサウナ・ストローベイルの体験施工イベントへの参加受付をしています。問い合わせに日本語で丁寧に返信してください。代表: 濱田優貴（mail@yukihamada.jp / 090-7409-0407）`
  },
  general: {
    name: "SOLUNA",
    from: "SOLUNA <info@solun.art>",
    prompt: `あなたはSOLUNA合同会社の問い合わせ担当です。共同保有型リゾートSOLUNAに関する問い合わせに日本語で丁寧に返信してください。代表: 濱田優貴（mail@yukihamada.jp / 090-7409-0407）`
  }
};

function detectProject(toEmail) {
  const a = (toEmail || "").toLowerCase();
  if (a.includes("build")) return "build";
  if (a.includes("material")) return "materials";
  if (a.includes("wp") || a.includes("workparty") || a.includes("work")) return "wp";
  return "general";
}

async function generateEmailReply(project, fromEmail, subject, bodyText) {
  if (!ANTHROPIC_API_KEY) return null;
  const ctx = PROJECT_CONTEXTS[project] || PROJECT_CONTEXTS.general;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system: ctx.prompt,
        messages: [{ role: "user", content: `件名: ${subject}\n差出人: ${fromEmail}\n\n${(bodyText || "").slice(0, 2000)}\n\n---\n上記のメールへの返信を書いてください。署名は不要です。` }]
      })
    });
    const d = await r.json();
    return d.content?.[0]?.text || null;
  } catch { return null; }
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
    `CREATE TABLE IF NOT EXISTS construction_records (
      id         TEXT NOT NULL,
      type       TEXT NOT NULL,
      data       TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (id, type)
    )`,
    `CREATE TABLE IF NOT EXISTS task_comments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      task_key    TEXT NOT NULL,
      member      TEXT NOT NULL,
      message     TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS strategy_shares (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      content    TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT
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

  // ── Festival platform tables ──
  await db.batch([
    `CREATE TABLE IF NOT EXISTS contests (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      cover_url   TEXT,
      festival_id TEXT,
      prize       TEXT,
      start_at    TEXT NOT NULL,
      end_at      TEXT NOT NULL,
      status      TEXT DEFAULT 'upcoming',
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS contest_entries (
      id          TEXT PRIMARY KEY,
      contest_id  TEXT NOT NULL REFERENCES contests(id),
      track_id    TEXT NOT NULL REFERENCES tracks(id),
      user_id     TEXT NOT NULL REFERENCES users(id),
      status      TEXT DEFAULT 'active',
      vote_count  INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now')),
      UNIQUE(contest_id, track_id)
    )`,
    `CREATE TABLE IF NOT EXISTS votes (
      id              TEXT PRIMARY KEY,
      contest_id      TEXT NOT NULL REFERENCES contests(id),
      entry_id        TEXT NOT NULL REFERENCES contest_entries(id),
      voter_ip_hash   TEXT,
      voter_user_id   TEXT,
      weight          INTEGER DEFAULT 1,
      created_at      TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS follows (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id  TEXT NOT NULL REFERENCES users(id),
      following_id TEXT NOT NULL REFERENCES users(id),
      created_at   TEXT DEFAULT (datetime('now')),
      UNIQUE(follower_id, following_id)
    )`,
    `CREATE TABLE IF NOT EXISTS festivals (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      cover_url   TEXT,
      location    TEXT,
      date_start  TEXT NOT NULL,
      date_end    TEXT NOT NULL,
      status      TEXT DEFAULT 'upcoming',
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS festival_lineup (
      id          TEXT PRIMARY KEY,
      festival_id TEXT NOT NULL REFERENCES festivals(id),
      user_id     TEXT NOT NULL REFERENCES users(id),
      stage       TEXT DEFAULT 'main',
      time_slot   TEXT,
      confirmed   INTEGER DEFAULT 0,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS playlists (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id),
      title       TEXT NOT NULL,
      description TEXT,
      slug        TEXT UNIQUE,
      cover_url   TEXT,
      public      INTEGER DEFAULT 1,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS playlist_tracks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id TEXT NOT NULL REFERENCES playlists(id),
      track_id    TEXT NOT NULL REFERENCES tracks(id),
      position    INTEGER DEFAULT 0,
      UNIQUE(playlist_id, track_id)
    )`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id          TEXT PRIMARY KEY,
      channel_id  TEXT NOT NULL,
      channel_type TEXT DEFAULT 'radio',
      user_id     TEXT NOT NULL REFERENCES users(id),
      user_name   TEXT,
      content     TEXT NOT NULL,
      created_at  TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS live_streams (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id),
      title         TEXT NOT NULL,
      description   TEXT,
      hls_url       TEXT,
      status        TEXT DEFAULT 'offline',
      viewer_count  INTEGER DEFAULT 0,
      festival_id   TEXT,
      started_at    TEXT,
      ended_at      TEXT,
      created_at    TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS referrals (
      id              TEXT PRIMARY KEY,
      referrer_id     TEXT NOT NULL REFERENCES users(id),
      referral_code   TEXT NOT NULL,
      referred_user_id TEXT REFERENCES users(id),
      status          TEXT DEFAULT 'pending',
      reward_type     TEXT DEFAULT 'track_bonus',
      reward_amount   INTEGER DEFAULT 5,
      created_at      TEXT DEFAULT (datetime('now')),
      converted_at    TEXT
    )`,
  ]);

  // Referral system migrations
  try { await db.execute("ALTER TABLE users ADD COLUMN referral_code TEXT"); } catch {}
  try { await db.execute("ALTER TABLE users ADD COLUMN referred_by TEXT"); } catch {}
  try { await db.execute("ALTER TABLE users ADD COLUMN referral_count INTEGER DEFAULT 0"); } catch {}

  // Festival platform migrations
  try { await db.execute("ALTER TABLE users ADD COLUMN bio TEXT"); } catch {}
  try { await db.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT"); } catch {}
  try { await db.execute("ALTER TABLE users ADD COLUMN social_links TEXT"); } catch {}
  try { await db.execute("ALTER TABLE users ADD COLUMN follower_count INTEGER DEFAULT 0"); } catch {}
  try { await db.execute("ALTER TABLE radios ADD COLUMN access_type TEXT DEFAULT 'public'"); } catch {}
  try { await db.execute("ALTER TABLE ticket_types ADD COLUMN festival_id TEXT"); } catch {}

  // Seed initial festival
  try {
    const fest = (await db.execute("SELECT id FROM festivals LIMIT 1")).rows[0];
    if (!fest) {
      await db.execute({
        sql: `INSERT INTO festivals (id, title, description, location, date_start, date_end, status, cover_url)
              VALUES (?, ?, ?, ?, ?, ?, 'upcoming', '/images/hero_bg.jpg')`,
        args: ["soluna-fest-2026", "SOLUNA FEST HAWAII 2026",
               "Music, art, and technology converge on Oahu. Three days of live performances, AI-powered art, and blockchain-verified music rights.",
               "Moanalua Gardens, Oahu, Hawaii", "2026-09-04", "2026-09-06"],
      });
    }
  } catch {}

  // Seed initial contest
  try {
    const contest = (await db.execute("SELECT id FROM contests LIMIT 1")).rows[0];
    if (!contest) {
      await db.execute({
        sql: `INSERT INTO contests (id, title, description, prize, start_at, end_at, status, festival_id)
              VALUES (?, ?, ?, ?, ?, ?, 'active', 'soluna-fest-2026')`,
        args: ["opening-act-2026", "SOLUNA FEST 2026 Opening Act",
               "Upload your track and let fans vote. The winner opens the main stage at SOLUNA FEST HAWAII 2026.",
               "Main stage opening slot + $5,000 + full festival pass",
               "2026-03-26", "2026-08-01"],
      });
    }
  } catch {}

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

  // ── Cabin / property management tables ────────────────────────────────────
  await db.execute(`CREATE TABLE IF NOT EXISTS cabin_reservations (
    id TEXT PRIMARY KEY,
    cabin TEXT NOT NULL,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    checkin TEXT,
    checkout TEXT,
    status TEXT DEFAULT 'confirmed',
    note TEXT,
    source TEXT DEFAULT 'manual',
    notified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`).catch(() => {});
  try { await db.execute("ALTER TABLE cabin_reservations ADD COLUMN notified INTEGER DEFAULT 0"); } catch {}

  await db.execute(`CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id TEXT PRIMARY KEY,
    reservation_id TEXT,
    cabin TEXT NOT NULL,
    guest_name TEXT,
    checkout_date TEXT,
    next_checkin TEXT,
    status TEXT DEFAULT 'pending',
    tg_message_id TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  )`).catch(() => {});

  await db.execute(`CREATE TABLE IF NOT EXISTS month_ops (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    buyer_name TEXT,
    buyer_email TEXT,
    price_jpy INTEGER,
    status TEXT DEFAULT 'pending',
    stripe_session_id TEXT,
    credit_issued INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`).catch(() => {});

  await db.execute(`CREATE TABLE IF NOT EXISTS kumiai_applications (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_address TEXT,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    bank_name TEXT,
    bank_branch TEXT,
    bank_type TEXT DEFAULT 'ordinary',
    bank_number TEXT,
    bank_holder TEXT,
    price_jpy INTEGER,
    status TEXT DEFAULT 'pending',
    stripe_session_id TEXT,
    distributed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`).catch(() => {});

  await db.execute(`CREATE TABLE IF NOT EXISTS invest_waitlist (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL,
    scheme TEXT DEFAULT 'B',
    created_at TEXT DEFAULT (datetime('now'))
  )`).catch(() => {});
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(compression());
// rawBody capture — runs before json parsing, stores buffer on req for signature verification
app.use('/api/line/webhook', (req, res, next) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    req.rawBody = Buffer.concat(chunks);
    try { req.body = JSON.parse(req.rawBody.toString('utf8')); } catch { req.body = {}; }
    next();
  });
  req.on('error', next);
});
app.use(express.json());

// CORS for cabin static site calling our API
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (origin.includes("soluna-teshikaga") || origin.includes("solun.art") || origin.includes("yukihamada.jp") || origin.includes("localhost")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,stripe-signature");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── www → apex redirect ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.hostname === "www.solun.art") {
    return res.redirect(301, `https://solun.art${req.originalUrl}`);
  }
  next();
});

// ── X-Robots-Tag: noindex on non-canonical hosts (fly.dev preview) ────────────
app.use((req, res, next) => {
  const host = req.hostname || "";
  if (host.endsWith(".fly.dev")) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }
  next();
});

// ── .html → clean URL 301 redirect (SEO canonical URLs) ──────────────────────
app.use((req, res, next) => {
  if (req.method === "GET" && req.path.endsWith(".html") && req.path !== "/index.html") {
    const clean = req.path.slice(0, -5);
    const qs = req.query && Object.keys(req.query).length
      ? "?" + new URLSearchParams(req.query).toString() : "";
    const host = req.hostname || "solun.art";
    const proto = req.headers["x-forwarded-proto"] || "https";
    return res.redirect(301, `${proto}://${host}${clean}${qs}`);
  }
  next();
});

// ── API: Inbound email webhook (Resend → LLM → auto-reply) ───────────────────
app.post("/api/email/inbound", async (req, res) => {
  res.status(200).json({ ok: true }); // Resend needs fast 200
  try {
    const { from, to, subject, text, html, messageId, inReplyTo } = req.body;
    const toAddr = Array.isArray(to) ? to[0] : (to || "");
    const project = detectProject(toAddr);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await db.execute({
      sql: "INSERT OR IGNORE INTO project_emails (id, project, from_email, to_email, subject, body_text, message_id) VALUES (?,?,?,?,?,?,?)",
      args: [id, project, from, toAddr, subject || "", text || "", messageId || ""]
    });

    const reply = await generateEmailReply(project, from, subject, text || "");
    if (!reply) return;

    await db.execute({ sql: "UPDATE project_emails SET reply_text=? WHERE id=?", args: [reply, id] });

    const ctx = PROJECT_CONTEXTS[project] || PROJECT_CONTEXTS.general;
    const rr = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: ctx.from,
        to: [from],
        subject: (subject || "").startsWith("Re:") ? subject : `Re: ${subject || ""}`,
        text: reply,
        headers: inReplyTo ? { "In-Reply-To": inReplyTo, References: inReplyTo } : {}
      })
    });
    if (rr.ok) await db.execute({ sql: "UPDATE project_emails SET reply_sent=1 WHERE id=?", args: [id] });

    await sendAdminEmail(
      `[${ctx.name}] 受信: ${subject}`,
      `<p><b>From:</b> ${from}</p><p><b>To:</b> ${toAddr}</p><hr><h3>受信</h3><pre style="white-space:pre-wrap">${(text||"").slice(0,800)}</pre><hr><h3>AI返信</h3><pre style="white-space:pre-wrap">${reply}</pre>`
    );
  } catch (e) { console.error("inbound email error:", e.message); }
});

// ── API: Project emails list (admin) ──────────────────────────────────────────
app.get("/api/email/project-emails", async (req, res) => {
  const key = req.headers["x-admin-key"] || req.query.key;
  if (key !== process.env.ADMIN_KEY) return res.status(403).json({ error: "forbidden" });
  const { project, limit = 50 } = req.query;
  const rows = await db.execute({
    sql: project
      ? "SELECT * FROM project_emails WHERE project=? ORDER BY created_at DESC LIMIT ?"
      : "SELECT * FROM project_emails ORDER BY created_at DESC LIMIT ?",
    args: project ? [project, Number(limit)] : [Number(limit)]
  });
  res.json(rows.rows);
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
        `[SOLUNA] 新規メール登録 — ${email}`,
        `<p>新しいメール登録がありました。</p><ul><li>メール: ${email}</li><li>言語: ${locale || "en"}</li></ul>`
      );
      // Create member + generate magic login link
      await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email) VALUES (?)", args: [email] }).catch(() => {});
      const mlCode = String(Math.floor(100000 + Math.random() * 900000));
      const mlExp  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.execute({ sql: "INSERT INTO soluna_otps (email,code,expires_at) VALUES (?,?,?)", args: [email, mlCode, mlExp] }).catch(() => {});
      const loginUrl = `https://solun.art/app?email=${encodeURIComponent(email)}&code=${mlCode}`;
      // Confirmation to subscriber
      if (RESEND_API_KEY) {
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({
            from: "SOLUNA <noreply@solun.art>",
            to: [email],
            subject: isJa ? "SOLUNA FEST HAWAII 2026 — ラインナップ通知に登録しました" : "SOLUNA FEST HAWAII 2026 — You're on the list!",
            html: isJa
              ? `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">SOLUNA FEST HAWAII 2026</p><h1 style="font-size:28px;margin:16px 0">登録しました。<br/>最新情報をお届けします。</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">アーティストラインナップが発表され次第、最初にお知らせします。<br/><br/>日程: 2026年9月4〜6日<br/>会場: モアナルアガーデン（Moanalua Gardens）, Oahu</p><div style="margin-top:28px"><a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:#4a8fc0;color:#fff;text-decoration:none;font-weight:700;border-radius:999px;font-size:13px">SOLUNAメンバーとしてログイン →</a></div><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:12px">パスワード不要。ワンクリックでログイン。有効期間7日間。</p><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:28px">© 2026 SOLUNA · Powered by Enabler</p></div>`
              : `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">SOLUNA FEST HAWAII 2026</p><h1 style="font-size:28px;margin:16px 0">You're registered.</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">You'll be the first to know when the lineup drops.<br/><br/>Date: September 4–6, 2026<br/>Venue: Moanalua Gardens, Oahu, HI</p><div style="margin-top:28px"><a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:#4a8fc0;color:#fff;text-decoration:none;font-weight:700;border-radius:999px;font-size:13px">Log in to SOLUNA →</a></div><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:12px">No password. One click. Valid for 7 days.</p><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:28px">© 2026 SOLUNA · Powered by Enabler</p></div>`,
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
      `[SOLUNA] Diamond VIP お問い合わせ — ${name || email}`,
      `<p>Diamond VIP のお問い合わせが届きました。</p><ul><li>名前: ${name || "-"}</li><li>メール: ${email}</li><li>電話: ${phone || "-"}</li><li>メッセージ: ${message || "-"}</li></ul><p>管理画面: https://solun.art/admin</p>`
    );
    if (RESEND_API_KEY) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA <noreply@solun.art>",
          to: [email],
          subject: isJa ? "SOLUNA FEST HAWAII 2026 — Diamond VIP お問い合わせを受け付けました" : "SOLUNA FEST HAWAII 2026 — Diamond VIP Inquiry Received",
          html: isJa
            ? `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">SOLUNA FEST HAWAII 2026</p><h1 style="font-size:26px;margin:16px 0">Diamond VIP<br/>お問い合わせ受付</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">お問い合わせありがとうございます。<br/>24時間以内に担当者よりご連絡いたします。<br/><br/>Diamond VIPは限定10名様のプレミアムパッケージです。</p><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:32px">© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA</p></div>`
            : `<div style="background:#080808;color:#fff;font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto"><p style="color:#C9A962;letter-spacing:0.3em;font-size:11px">SOLUNA FEST HAWAII 2026</p><h1 style="font-size:26px;margin:16px 0">Diamond VIP<br/>Inquiry Received</h1><p style="color:rgba(255,255,255,0.5);line-height:1.7">Thank you for your interest in Diamond VIP.<br/>Our team will be in touch within 24 hours.<br/><br/>Diamond VIP is limited to 10 guests only.</p><p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:32px">© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA</p></div>`,
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
        body: JSON.stringify({ from: "SOLUNA <noreply@solun.art>", to: [test_email], subject: `[TEST] ${subject}`, html }),
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
        body: JSON.stringify({ from: "SOLUNA <noreply@solun.art>", to: [row.email], subject, html }),
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
  <p style="color:rgba(201,169,98,0.8);letter-spacing:0.3em;font-size:10px;text-transform:uppercase;margin-bottom:20px">SOLUNA FEST HAWAII 2026</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 24px;line-height:1.3;color:#fff">${subject}</h1>
  <div style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.8;white-space:pre-line">${body}</div>
  ${bodyEn ? `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0"/>
  <div style="color:rgba(255,255,255,0.45);font-size:14px;line-height:1.8;white-space:pre-line">${bodyEn}</div>` : ""}
  <div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.07)">
    <a href="https://zamnahawaii.ticketblox.com" style="display:inline-block;padding:12px 28px;background:rgba(201,169,98,0.9);color:#000;font-weight:700;text-decoration:none;border-radius:999px;font-size:13px;letter-spacing:0.06em">チケットを取る / Get Tickets →</a>
  </div>
  <p style="color:rgba(255,255,255,0.12);font-size:10px;margin-top:28px;letter-spacing:0.06em">© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · solun.art</p>
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
      message: "As the local lead and production manager, you're the backbone of SOLUNA FEST HAWAII on the ground. From venue scouting with Sid to building political connections and managing Hawaii Stage & Lighting — your network is making this happen. Keep driving the production forward!",
      message_ja: "Seanさん、現地統括としてSOLUNA FEST HAWAIIの地上作戦の要です。Sidとの会場視察、政治ネットワークの構築、Hawaii Stage & Lightingとの交渉 — あなたのネットワークがこのイベントを実現させています。引き続きプロダクションを推進してください！",
    },
    "Sid": {
      greeting: "Sid, welcome aboard!",
      message: "Your venue assessment of Moanalua Gardens was outstanding — the detailed pros/cons analysis, the relationship with JP Damon, and the political strategy are exactly what we need. The Letter of Intent and city council approval are the critical next steps. Let's make this venue a reality!",
      message_ja: "Sidさん、Moanalua Gardensの会場評価は素晴らしかったです。詳細な長所/短所の分析、JP Damonとの関係構築、政治戦略 — まさに必要なものでした。Letter of Intentと市議会承認が次の重要ステップです。この会場を実現させましょう！",
    },
    "Vakas": {
      greeting: "Dr. Sial, welcome!",
      message: "Your investment and medical expertise bring a unique dimension to SOLUNA FEST HAWAII. With your background spanning medicine, music conferences, and strategic partnerships — you're the perfect bridge between our business vision and execution. Your new role in artist relations will be key as we move into booking phase.",
      message_ja: "Vakasさん、あなたの投資と医療の専門知識はSOLUNA FEST HAWAIIにユニークな価値をもたらします。医学、音楽カンファレンス、戦略パートナーシップにまたがる経歴 — ビジネスビジョンと実行の橋渡し役として最適です。ブッキングフェーズに入るにあたり、アーティスト関係の新しい役割が鍵になります。",
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
    message: `Welcome to the SOLUNA FEST HAWAII team! We're building something incredible — a world-class electronic music festival in Oahu, September 4-6, 2026. Check out the admin dashboard to see the full project status.`,
    message_ja: `${member}さん、SOLUNA FEST HAWAIIチームへようこそ！2026年9月4-6日、オアフ島で世界クラスのエレクトロニックミュージックフェスティバルを作り上げています。管理ダッシュボードでプロジェクトの全体状況をご確認ください。`,
  };

  const html = `<div style="background:#080808;color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;padding:48px 32px;max-width:540px;margin:0 auto">
  <p style="color:rgba(201,169,98,0.8);letter-spacing:0.35em;font-size:10px;text-transform:uppercase;margin-bottom:28px">SOLUNA FEST HAWAII 2026 · OPERATIONS</p>

  <h1 style="font-size:26px;font-weight:700;margin:0 0 24px;line-height:1.3;color:#fff">${m.greeting}</h1>

  <p style="color:rgba(255,255,255,0.7);font-size:15px;line-height:1.8;margin-bottom:24px">${m.message}</p>
  <p style="color:rgba(255,255,255,0.45);font-size:14px;line-height:1.8;margin-bottom:32px">${m.message_ja}</p>

  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0"/>

  <h2 style="font-size:16px;color:rgba(201,169,98,0.9);margin-bottom:16px">🐕 Solunadog からのご挨拶</h2>
  <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;margin-bottom:20px">
    Hi ${member}! I'm <strong style="color:rgba(201,169,98,0.9)">Solunadog</strong>, the AI assistant for SOLUNA FEST HAWAII — part of the <a href="https://github.com/yukihamada/rustydog" style="color:rgba(201,169,98,0.8)">rustydog</a> AI dog pack. Here's what I can help with:
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
      <li>Manage artist bookings or send offers (handled by JC SOLUNA)</li>
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
      © 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · solun.art<br/>
      🐕 Sent by Solunadog (rustydog AI pack)
    </p>
  </div>
</div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <noreply@solun.art>",
        to: [email],
        subject: `Welcome to SOLUNA FEST HAWAII Operations — ${member}`,
        html,
      }),
    });
    if (r.ok) {
      sendAdminEmail(
        `[SOLUNA] チームメンバー初回ログイン — ${member}`,
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
    `[SOLUNA] NFT Pass Claimed — ${pass.name}`,
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
  <text x="200" y="100" text-anchor="middle" fill="${color}" font-family="sans-serif" font-size="11" letter-spacing="8" opacity="0.6">SOLUNA FEST HAWAII</text>
  <text x="200" y="170" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="36" font-weight="700" letter-spacing="4">${title}</text>
  <text x="200" y="210" text-anchor="middle" fill="${color}" font-family="monospace" font-size="48" font-weight="700">#${num}</text>
  <text x="200" y="260" text-anchor="middle" fill="rgba(255,255,255,0.3)" font-family="sans-serif" font-size="12" letter-spacing="3">${symbol} · SEP 4-6, 2026</text>
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
      `[SOLUNA] ミーティング予約 — ${meetingType}`,
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
    `[SOLUNA] 新しい契約申込 — ${contractType}`,
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
  <p style="color:rgba(201,169,98,0.8);letter-spacing:0.35em;font-size:10px;text-transform:uppercase;margin-bottom:24px">SOLUNA FEST HAWAII 2026</p>
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
    <p style="color:rgba(255,255,255,0.12);font-size:10px;letter-spacing:0.06em">© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · solun.art</p>
  </div>
</div>`;

    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <noreply@solun.art>",
        to: [email],
        subject: isJa
          ? `【SOLUNA FEST HAWAII】${typeLabel.ja} — 受付完了 (#${submissionId})`
          : `SOLUNA FEST HAWAII — ${typeLabel.en} Confirmation (#${submissionId})`,
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
    investment:        "SOLUNA FEST HAWAII 2026 — Investment Partner",
    sponsor_presenting: "SOLUNA FEST HAWAII 2026 — Presenting Partner ($100K+)",
    sponsor_artist:    "SOLUNA FEST HAWAII 2026 — Artist Stage Partner ($50K)",
    sponsor_vip:       "SOLUNA FEST HAWAII 2026 — VIP Lounge Partner ($20K)",
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

  const systemPrompt = `You are the SOLUNA FEST HAWAII 2026 AI assistant (Solunadog). You help the operations team manage the festival.
Event: SOLUNA FEST HAWAII, Sep 4-6 2026, Moanalua Gardens, Oahu. Capacity 9,000/day.
Team: Sean Tsai (local lead), Sid (venue/gov), Dr. Vakas Sial (finance/artists), Keyanna (ops), Yuki (tech).
Key partners: JP Damon (venue owner), JC/Enzo/Victor (SOLUNA talent), Gabe (F&B), Ticketblox/Anup (tickets), Kuhio Lewis (stage/lighting/council).
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

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

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
<link rel="alternate" type="application/json+oembed" href="https://solun.art/api/v1/oembed?url=https://solun.art/radio/${radio.slug}" title="${radio.name}">
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
  <a href="/" style="color:#C9A962;text-decoration:none;font-size:13px;letter-spacing:5px;font-weight:700">SOLUNA</a>
  <nav style="display:flex;gap:14px;align-items:center">
    <a href="/festivals" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Festival</a>
    <a href="/contests" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Contest</a>
    <a href="/music" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Music</a>
    <a href="/live" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Live</a>
    <a href="/artist" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Artist Portal</a>
    <a href="/tickets" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Tickets</a>
    <button class="share-btn" id="shareBtn" onclick="shareChannel()">SHARE CHANNEL</button>
  </nav>
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
  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
    <span style="font-size:9px;color:rgba(255,255,255,.15);letter-spacing:1px;margin-right:4px">SHARE</span>
    <a href="https://x.com/intent/tweet?text=${encodeURIComponent(radio.name + " — Listen on SOLUNA")}&url=${encodeURIComponent("https://soluna-web.fly.dev/radio/" + radio.slug)}" target="_blank" rel="noopener" style="color:rgba(255,255,255,.25);font-size:11px;padding:4px 10px;border-radius:16px;border:1px solid rgba(255,255,255,.06);text-decoration:none;transition:all .15s" onmouseover="this.style.color='rgba(255,255,255,.5)';this.style.borderColor='rgba(255,255,255,.15)'" onmouseout="this.style.color='rgba(255,255,255,.25)';this.style.borderColor='rgba(255,255,255,.06)'">X</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://soluna-web.fly.dev/radio/" + radio.slug)}" target="_blank" rel="noopener" style="color:rgba(255,255,255,.25);font-size:11px;padding:4px 10px;border-radius:16px;border:1px solid rgba(255,255,255,.06);text-decoration:none;transition:all .15s" onmouseover="this.style.color='rgba(255,255,255,.5)';this.style.borderColor='rgba(255,255,255,.15)'" onmouseout="this.style.color='rgba(255,255,255,.25)';this.style.borderColor='rgba(255,255,255,.06)'">FB</a>
    <a href="https://social-plugins.line.me/lineit/share?url=${encodeURIComponent("https://soluna-web.fly.dev/radio/" + radio.slug)}" target="_blank" rel="noopener" style="color:rgba(255,255,255,.25);font-size:11px;padding:4px 10px;border-radius:16px;border:1px solid rgba(255,255,255,.06);text-decoration:none;transition:all .15s" onmouseover="this.style.color='rgba(255,255,255,.5)';this.style.borderColor='rgba(255,255,255,.15)'" onmouseout="this.style.color='rgba(255,255,255,.25)';this.style.borderColor='rgba(255,255,255,.06)'">LINE</a>
    <button onclick="copyRadioUrl()" id="copyUrlBtn" style="color:rgba(255,255,255,.25);font-size:11px;padding:4px 10px;border-radius:16px;border:1px solid rgba(255,255,255,.06);background:none;cursor:pointer;transition:all .15s" onmouseover="this.style.color='rgba(255,255,255,.5)';this.style.borderColor='rgba(255,255,255,.15)'" onmouseout="if(!this.classList.contains('copied-link')){this.style.color='rgba(255,255,255,.25)';this.style.borderColor='rgba(255,255,255,.06)'}">Copy URL</button>
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

function copyRadioUrl(){
  navigator.clipboard.writeText(location.href).then(()=>{
    const btn=document.getElementById("copyUrlBtn");
    btn.textContent="Copied!";btn.style.color="#4ade80";btn.style.borderColor="rgba(74,222,128,.3)";btn.classList.add("copied-link");
    setTimeout(()=>{btn.textContent="Copy URL";btn.style.color="rgba(255,255,255,.25)";btn.style.borderColor="rgba(255,255,255,.06)";btn.classList.remove("copied-link")},2000);
  });
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
  <nav style="display:flex;gap:14px;align-items:center">
    <a href="/festivals" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Festival</a>
    <a href="/contests" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Contest</a>
    <a href="/music" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Music</a>
    <a href="/live" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Live</a>
    <a href="/artist" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Artist Portal</a>
    <a href="/tickets" style="color:rgba(255,255,255,.4);text-decoration:none;font-size:12px">Tickets</a>
    <a href="/radio/${radio.slug}" class="btn btn-secondary" style="font-size:11px;padding:6px 14px">▶ Play Channel</a>
  </nav>
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

const customRoutes = ["/", "/sponsor", "/investor", "/deal", "/contract", "/login", "/admin", "/admin/construction", "/schedule", "/vip", "/lineup", "/info", "/guide", "/artist-lounge", "/vip-lounge", "/production", "/safety", "/staff", "/venue-agreement", "/artist-contract", "/budget", "/press", "/hotel-plan", "/music", "/tickets", "/tickets/success", "/rights", "/developers", "/artist", "/contests", "/festivals", "/live", "/community", "/vision", "/vision-ja", "/pitch", "/proposal", "/sponsor-reiwa", "/lab", "/os", "/container-house"];
// /blank is served from cabin/blank/index.html via express.static
// NOTE: /privacy, /terms, /mint removed — served from cabin static files instead

// Internal pages protected by Basic Auth (password via PREVIEW_PASSWORD env var)
const PREVIEW_PASS = process.env.PREVIEW_PASSWORD || "soluna2026";
const PREVIEW_ROUTES = new Set(["/budget", "/venue-agreement", "/artist-contract", "/deal", "/vision-ja", "/pitch", "/proposal"]);
function checkPreviewAuth(req) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = Buffer.from(auth.slice(6), "base64").toString();
  return decoded.slice(decoded.indexOf(":") + 1) === PREVIEW_PASS;
}

const pageCache = {};
customRoutes.forEach((route) => {
  const htmlPath = path.join(STATIC_DIR, `${route}/index.html`);
  if (fs.existsSync(htmlPath)) pageCache[route] = fs.readFileSync(htmlPath, "utf8");
  app.get([route, `${route}/`], (req, res) => {
    if (PREVIEW_ROUTES.has(route) && !checkPreviewAuth(req)) {
      res.setHeader("WWW-Authenticate", 'Basic realm="SOLUNA Internal"');
      return res.status(401).send("SOLUNA — このページはパスワード保護されています");
    }
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
    const { email, password, name, referral_code } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    if (password.length < 8) return res.status(400).json({ error: "password must be >= 8 chars" });

    const existing = (await db.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] })).rows[0];
    if (existing) return res.status(409).json({ error: "email already registered" });

    const userId = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);

    // Check referral code
    let referrer = null;
    if (referral_code) {
      referrer = (await db.execute({
        sql: "SELECT id, name FROM users WHERE referral_code = ?",
        args: [referral_code.toUpperCase()],
      })).rows[0];
    }

    await db.execute({
      sql: "INSERT INTO users (id, email, password, name, referred_by) VALUES (?, ?, ?, ?, ?)",
      args: [userId, email.toLowerCase(), hash, name || null, referrer ? referrer.id : null],
    });

    // Process referral reward
    if (referrer) {
      await db.execute({
        sql: "UPDATE users SET track_limit = track_limit + 5, referral_count = COALESCE(referral_count, 0) + 1 WHERE id = ?",
        args: [referrer.id],
      });
      await db.execute({
        sql: "INSERT INTO referrals (id, referrer_id, referral_code, referred_user_id, status, converted_at) VALUES (?, ?, ?, ?, 'converted', datetime('now'))",
        args: [crypto.randomUUID(), referrer.id, referral_code.toUpperCase(), userId],
      });
    }

    // Auto-generate first API key
    const keyId = crypto.randomBytes(8).toString("hex");
    const keySecret = crypto.randomBytes(24).toString("base64url");
    const keyHash = await bcrypt.hash(keySecret, 10);
    await db.execute({
      sql: "INSERT INTO api_keys (id, user_id, key_hash, name) VALUES (?, ?, ?, 'default')",
      args: [keyId, userId, keyHash],
    });

    const apiKey = `sk_${keyId}_${keySecret}`;
    res.json({
      ok: true, user_id: userId, api_key: apiKey, plan: "free", track_limit: 30,
      referred_by: referrer ? referrer.name : undefined,
    });
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

// ══════════════════════════════════════════════════════════════════════════════
// ── FESTIVAL PLATFORM: Contests, Votes, Follows, Chat, Festivals, Playlists
// ══════════════════════════════════════════════════════════════════════════════

// ── Contests ─────────────────────────────────────────────────────────────────
app.get("/api/v1/contests", async (_req, res) => {
  const contests = (await db.execute(
    "SELECT c.*, (SELECT COUNT(*) FROM contest_entries WHERE contest_id = c.id AND status = 'active') as entry_count FROM contests c ORDER BY c.start_at DESC"
  )).rows;
  res.json({ ok: true, contests });
});

app.get("/api/v1/contests/:id", async (req, res) => {
  const contest = (await db.execute({ sql: "SELECT * FROM contests WHERE id = ?", args: [req.params.id] })).rows[0];
  if (!contest) return res.status(404).json({ error: "Contest not found" });

  const entries = (await db.execute({
    sql: `SELECT ce.*, t.title, t.artist, t.cover_url, t.genre, t.duration_sec, t.play_count,
                 u.name as user_name, u.avatar_url,
                 '/api/v1/tracks/' || t.id || '/stream' as stream_url
          FROM contest_entries ce
          JOIN tracks t ON t.id = ce.track_id
          JOIN users u ON u.id = ce.user_id
          WHERE ce.contest_id = ? AND ce.status = 'active'
          ORDER BY ce.vote_count DESC`,
    args: [req.params.id],
  })).rows;

  res.json({ ok: true, contest, entries });
});

app.post("/api/v1/contests/:id/enter", requireAuth(async (req, res) => {
  const { track_id } = req.body;
  if (!track_id) return res.status(400).json({ error: "track_id required" });

  const contest = (await db.execute({ sql: "SELECT * FROM contests WHERE id = ?", args: [req.params.id] })).rows[0];
  if (!contest) return res.status(404).json({ error: "Contest not found" });
  if (contest.status !== "active") return res.status(400).json({ error: "Contest is not active" });

  const track = (await db.execute({ sql: "SELECT id FROM tracks WHERE id = ? AND user_id = ?", args: [track_id, req.user.id] })).rows[0];
  if (!track) return res.status(404).json({ error: "Track not found or not yours" });

  const entryId = crypto.randomUUID();
  try {
    await db.execute({
      sql: "INSERT INTO contest_entries (id, contest_id, track_id, user_id) VALUES (?, ?, ?, ?)",
      args: [entryId, req.params.id, track_id, req.user.id],
    });
    res.json({ ok: true, entry_id: entryId });
  } catch (e) {
    if (e.message?.includes("UNIQUE")) return res.status(409).json({ error: "Track already entered" });
    throw e;
  }
}));

// ── Votes ────────────────────────────────────────────────────────────────────
app.post("/api/v1/contests/:id/vote", async (req, res) => {
  const { entry_id } = req.body;
  if (!entry_id) return res.status(400).json({ error: "entry_id required" });

  const entry = (await db.execute({
    sql: "SELECT * FROM contest_entries WHERE id = ? AND contest_id = ? AND status = 'active'",
    args: [entry_id, req.params.id],
  })).rows[0];
  if (!entry) return res.status(404).json({ error: "Entry not found" });

  // Rate limit: 1 vote per IP per entry per day
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
  const ipHash = crypto.createHash("sha256").update(ip + entry_id).digest("hex").slice(0, 16);
  const recent = (await db.execute({
    sql: "SELECT id FROM votes WHERE voter_ip_hash = ? AND entry_id = ? AND created_at > datetime('now', '-1 day')",
    args: [ipHash, entry_id],
  })).rows[0];
  if (recent) return res.status(429).json({ error: "Already voted today" });

  const user = await authApiKey(req);
  const voteId = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO votes (id, contest_id, entry_id, voter_ip_hash, voter_user_id) VALUES (?, ?, ?, ?, ?)",
    args: [voteId, req.params.id, entry_id, ipHash, user?.id || null],
  });
  await db.execute({
    sql: "UPDATE contest_entries SET vote_count = vote_count + 1 WHERE id = ?",
    args: [entry_id],
  });
  res.json({ ok: true, vote_id: voteId });
});

app.get("/api/v1/contests/:id/results", async (req, res) => {
  const entries = (await db.execute({
    sql: `SELECT ce.id, ce.vote_count, t.title, t.artist, t.cover_url, u.name as user_name
          FROM contest_entries ce JOIN tracks t ON t.id = ce.track_id JOIN users u ON u.id = ce.user_id
          WHERE ce.contest_id = ? AND ce.status = 'active' ORDER BY ce.vote_count DESC LIMIT 50`,
    args: [req.params.id],
  })).rows;
  const total_votes = entries.reduce((s, e) => s + (e.vote_count || 0), 0);
  res.json({ ok: true, entries, total_votes });
});

// ── Follows ──────────────────────────────────────────────────────────────────
app.post("/api/v1/follow/:userId", requireAuth(async (req, res) => {
  if (req.params.userId === req.user.id) return res.status(400).json({ error: "Cannot follow yourself" });
  try {
    await db.execute({
      sql: "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
      args: [req.user.id, req.params.userId],
    });
    await db.execute({ sql: "UPDATE users SET follower_count = follower_count + 1 WHERE id = ?", args: [req.params.userId] });
    res.json({ ok: true });
  } catch (e) {
    if (e.message?.includes("UNIQUE")) return res.json({ ok: true, already: true });
    throw e;
  }
}));

app.delete("/api/v1/follow/:userId", requireAuth(async (req, res) => {
  const r = await db.execute({ sql: "DELETE FROM follows WHERE follower_id = ? AND following_id = ?", args: [req.user.id, req.params.userId] });
  if (r.rowsAffected > 0) {
    await db.execute({ sql: "UPDATE users SET follower_count = MAX(0, follower_count - 1) WHERE id = ?", args: [req.params.userId] });
  }
  res.json({ ok: true });
}));

app.get("/api/v1/me/following", requireAuth(async (req, res) => {
  const following = (await db.execute({
    sql: `SELECT u.id, u.name, u.avatar_url, u.follower_count FROM follows f JOIN users u ON u.id = f.following_id WHERE f.follower_id = ?`,
    args: [req.user.id],
  })).rows;
  res.json({ ok: true, following });
}));

// ── Profile ──────────────────────────────────────────────────────────────────
app.patch("/api/v1/me/profile", requireAuth(async (req, res) => {
  const fields = []; const args = [];
  for (const key of ["name", "bio", "avatar_url", "social_links"]) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      args.push(key === "social_links" ? JSON.stringify(req.body[key]) : req.body[key]);
    }
  }
  if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });
  args.push(req.user.id);
  await db.execute({ sql: `UPDATE users SET ${fields.join(", ")} WHERE id = ?`, args });
  res.json({ ok: true });
}));

app.get("/api/v1/artists/:slug", async (req, res) => {
  const user = (await db.execute({
    sql: "SELECT id, name, bio, avatar_url, social_links, follower_count, created_at FROM users WHERE LOWER(REPLACE(name, ' ', '-')) = LOWER(?)",
    args: [req.params.slug],
  })).rows[0];
  if (!user) return res.status(404).json({ error: "Artist not found" });

  const tracks = (await db.execute({
    sql: "SELECT id, title, artist, genre, cover_url, play_count, duration_sec FROM tracks WHERE user_id = ? AND public = 1 ORDER BY play_count DESC",
    args: [user.id],
  })).rows;

  const reqUser = await authApiKey(req);
  const is_following = reqUser ? (await db.execute({
    sql: "SELECT id FROM follows WHERE follower_id = ? AND following_id = ?", args: [reqUser.id, user.id],
  })).rows.length > 0 : false;

  res.json({ ok: true, artist: { ...user, social_links: user.social_links ? JSON.parse(user.social_links) : null }, tracks, is_following });
});

// ── Festivals ────────────────────────────────────────────────────────────────
app.get("/api/v1/festivals", async (_req, res) => {
  const festivals = (await db.execute(
    `SELECT f.*, (SELECT COUNT(*) FROM festival_lineup WHERE festival_id = f.id) as artist_count FROM festivals f ORDER BY f.date_start`
  )).rows;
  res.json({ ok: true, festivals });
});

app.get("/api/v1/festivals/:id", async (req, res) => {
  const festival = (await db.execute({ sql: "SELECT * FROM festivals WHERE id = ?", args: [req.params.id] })).rows[0];
  if (!festival) return res.status(404).json({ error: "Festival not found" });

  const lineup = (await db.execute({
    sql: `SELECT fl.*, u.name as artist_name, u.avatar_url, u.bio,
                 (SELECT COUNT(*) FROM tracks WHERE user_id = u.id AND public = 1) as track_count
          FROM festival_lineup fl JOIN users u ON u.id = fl.user_id
          WHERE fl.festival_id = ? ORDER BY fl.time_slot`,
    args: [req.params.id],
  })).rows;

  const contests = (await db.execute({
    sql: "SELECT * FROM contests WHERE festival_id = ? ORDER BY start_at", args: [req.params.id],
  })).rows;

  const ticket_types = (await db.execute({
    sql: "SELECT id, name, description, price, currency, quantity_total, quantity_sold, active FROM ticket_types WHERE festival_id = ? OR festival_id IS NULL ORDER BY price",
    args: [req.params.id],
  })).rows;

  res.json({ ok: true, festival, lineup, contests, ticket_types });
});

// ── Playlists ────────────────────────────────────────────────────────────────
app.post("/api/v1/playlists", requireAuth(async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const id = crypto.randomUUID();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  await db.execute({
    sql: "INSERT INTO playlists (id, user_id, title, description, slug) VALUES (?, ?, ?, ?, ?)",
    args: [id, req.user.id, title, description || null, slug],
  });
  res.json({ ok: true, playlist: { id, slug, title } });
}));

app.get("/api/v1/playlists/:slug", async (req, res) => {
  const pl = (await db.execute({ sql: "SELECT * FROM playlists WHERE slug = ?", args: [req.params.slug] })).rows[0];
  if (!pl) return res.status(404).json({ error: "Playlist not found" });

  const tracks = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, t.genre, t.cover_url, t.duration_sec, t.play_count,
                 '/api/v1/tracks/' || t.id || '/stream' as stream_url
          FROM playlist_tracks pt JOIN tracks t ON t.id = pt.track_id
          WHERE pt.playlist_id = ? ORDER BY pt.position`, args: [pl.id],
  })).rows;

  const creator = (await db.execute({ sql: "SELECT name, avatar_url FROM users WHERE id = ?", args: [pl.user_id] })).rows[0];
  res.json({ ok: true, playlist: pl, tracks, creator });
});

app.post("/api/v1/playlists/:id/tracks", requireAuth(async (req, res) => {
  const { track_id } = req.body;
  const pl = (await db.execute({ sql: "SELECT id FROM playlists WHERE id = ? AND user_id = ?", args: [req.params.id, req.user.id] })).rows[0];
  if (!pl) return res.status(404).json({ error: "Playlist not found" });
  const pos = (await db.execute({ sql: "SELECT MAX(position) as m FROM playlist_tracks WHERE playlist_id = ?", args: [req.params.id] })).rows[0]?.m || 0;
  try {
    await db.execute({ sql: "INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (?, ?, ?)", args: [req.params.id, track_id, pos + 1] });
  } catch {}
  res.json({ ok: true });
}));

app.get("/api/v1/explore/playlists", async (_req, res) => {
  const playlists = (await db.execute(
    `SELECT p.*, u.name as creator_name, (SELECT COUNT(*) FROM playlist_tracks WHERE playlist_id = p.id) as track_count
     FROM playlists p JOIN users u ON u.id = p.user_id WHERE p.public = 1 ORDER BY p.created_at DESC LIMIT 20`
  )).rows;
  res.json({ ok: true, playlists });
});

// ── Chat ─────────────────────────────────────────────────────────────────────
app.post("/api/v1/chat/:channelId", requireAuth(async (req, res) => {
  const { content } = req.body;
  if (!content || content.length > 500) return res.status(400).json({ error: "Message required (max 500 chars)" });
  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO chat_messages (id, channel_id, user_id, user_name, content) VALUES (?, ?, ?, ?, ?)",
    args: [id, req.params.channelId, req.user.id, req.user.name || req.user.email.split("@")[0], content],
  });
  res.json({ ok: true, message: { id, content, user_name: req.user.name, created_at: new Date().toISOString() } });
}));

app.get("/api/v1/chat/:channelId", async (req, res) => {
  const since = req.query.since || "2000-01-01";
  const messages = (await db.execute({
    sql: "SELECT id, user_name, content, created_at FROM chat_messages WHERE channel_id = ? AND created_at > ? ORDER BY created_at DESC LIMIT 50",
    args: [req.params.channelId, since],
  })).rows.reverse();
  res.json({ ok: true, messages });
});

// ── Live Streams ─────────────────────────────────────────────────────────────
app.get("/api/v1/live", async (_req, res) => {
  const streams = (await db.execute(
    `SELECT ls.*, u.name as artist_name, u.avatar_url FROM live_streams ls JOIN users u ON u.id = ls.user_id WHERE ls.status = 'live' ORDER BY ls.viewer_count DESC`
  )).rows;
  res.json({ ok: true, streams });
});

app.post("/api/v1/live", requireAuth(async (req, res) => {
  const { title, description, hls_url } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const id = crypto.randomUUID();
  await db.execute({
    sql: "INSERT INTO live_streams (id, user_id, title, description, hls_url, status, started_at) VALUES (?, ?, ?, ?, ?, 'live', datetime('now'))",
    args: [id, req.user.id, title, description || null, hls_url || null],
  });
  res.json({ ok: true, stream: { id, title, status: "live" } });
}));

app.patch("/api/v1/live/:id", requireAuth(async (req, res) => {
  const { status, hls_url } = req.body;
  const fields = []; const args = [];
  if (status) { fields.push("status = ?"); args.push(status); if (status === "ended") { fields.push("ended_at = datetime('now')"); } }
  if (hls_url) { fields.push("hls_url = ?"); args.push(hls_url); }
  if (fields.length === 0) return res.status(400).json({ error: "No fields" });
  args.push(req.params.id, req.user.id);
  await db.execute({ sql: `UPDATE live_streams SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`, args });
  res.json({ ok: true });
}));

// ── Embed Player ─────────────────────────────────────────────────────────────
app.get("/embed/:slug", async (req, res) => {
  const radio = (await db.execute({ sql: "SELECT * FROM radios WHERE slug = ?", args: [req.params.slug] })).rows[0];
  if (!radio) return res.status(404).send("Not found");

  const tracks = (await db.execute({
    sql: `SELECT t.id, t.title, t.artist, t.cover_url, t.duration_sec
          FROM radio_tracks rt JOIN tracks t ON t.id = rt.track_id WHERE rt.radio_id = ? ORDER BY rt.position LIMIT 20`,
    args: [radio.id],
  })).rows;

  const gold = "#C9A962";
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${radio.name} — SOLUNA</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0b0f;color:#fff;font-family:Inter,-apple-system,sans-serif;overflow:hidden}
.embed{display:flex;align-items:center;gap:12px;padding:12px 16px;height:80px}
.cover{width:56px;height:56px;border-radius:10px;object-fit:cover;background:#111;flex-shrink:0}
.info{flex:1;min-width:0}
.title{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.artist{font-size:11px;color:rgba(255,255,255,.4);margin-top:2px}
.btn{width:40px;height:40px;border-radius:50%;border:none;background:${gold};cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.btn svg{fill:#000;width:16px;height:16px}
.logo{font-size:9px;letter-spacing:3px;color:${gold};text-decoration:none;opacity:.6}
.logo:hover{opacity:1}
.eq{display:flex;gap:2px;align-items:flex-end;height:16px}
.eq span{width:3px;border-radius:1px;background:${gold};animation:eq .5s ease-in-out infinite alternate}
.eq span:nth-child(2){animation-delay:.1s}.eq span:nth-child(3){animation-delay:.2s}.eq span:nth-child(4){animation-delay:.3s}
@keyframes eq{0%{height:4px}100%{height:16px}}
</style></head><body>
<div class="embed">
  <img id="cover" class="cover" src="${tracks[0]?.cover_url || ''}" alt="">
  <div class="info">
    <div class="title" id="trackTitle">${tracks[0]?.title || radio.name}</div>
    <div class="artist" id="trackArtist">${tracks[0]?.artist || ''}</div>
  </div>
  <div id="eqVis" class="eq" style="display:none"><span></span><span></span><span></span><span></span></div>
  <button class="btn" id="playBtn" onclick="toggle()"><svg viewBox="0 0 24 24"><polygon id="playIcon" points="6,3 20,12 6,21"/></svg></button>
  <a href="/radio/${radio.slug}" target="_blank" class="logo">SOLUNA</a>
</div>
<audio id="audio"></audio>
<script>
const tracks=${JSON.stringify(tracks.map(t=>({id:t.id,title:t.title,artist:t.artist,cover:t.cover_url})))};
let idx=0,playing=false;const a=document.getElementById('audio');
function load(i){idx=i;const t=tracks[i];a.src='/api/v1/tracks/'+t.id+'/stream';
document.getElementById('trackTitle').textContent=t.title;
document.getElementById('trackArtist').textContent=t.artist;
document.getElementById('cover').src=t.cover||'/api/v1/tracks/'+t.id+'/cover';}
function toggle(){if(playing){a.pause();playing=false;document.getElementById('eqVis').style.display='none';document.getElementById('playIcon').setAttribute('points','6,3 20,12 6,21');}
else{a.play().then(()=>{playing=true;document.getElementById('eqVis').style.display='flex';document.getElementById('playIcon').setAttribute('points','6,4 10,4 10,20 6,20');}).catch(()=>{});}}
a.onended=()=>{idx=(idx+1)%tracks.length;load(idx);a.play().then(()=>{playing=true;}).catch(()=>{});};
if(tracks.length)load(0);
</script></body></html>`);
});

app.get("/api/v1/oembed", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "url required" });
  const match = url.match(/\/radio\/([^\/\?]+)/);
  if (!match) return res.status(404).json({ error: "Unsupported URL" });
  res.json({
    version: "1.0", type: "rich", provider_name: "SOLUNA", provider_url: "https://solun.art",
    title: `SOLUNA Radio — ${match[1]}`,
    html: `<iframe src="https://solun.art/embed/${match[1]}" width="100%" height="80" frameborder="0" allow="autoplay"></iframe>`,
    width: 400, height: 80,
  });
});

// ── Analytics (artist dashboard) ─────────────────────────────────────────────
app.get("/api/v1/me/analytics", requireAuth(async (req, res) => {
  const tracks = (await db.execute({
    sql: "SELECT id, title, play_count, created_at FROM tracks WHERE user_id = ? ORDER BY play_count DESC",
    args: [req.user.id],
  })).rows;

  const total_plays = tracks.reduce((s, t) => s + (t.play_count || 0), 0);

  const recent_plays = (await db.execute({
    sql: `SELECT re.track_id, t.title, re.event_type, re.created_at
          FROM royalty_events re JOIN tracks t ON t.id = re.track_id
          WHERE t.user_id = ? ORDER BY re.created_at DESC LIMIT 50`,
    args: [req.user.id],
  })).rows;

  const follower_count = (await db.execute({
    sql: "SELECT COUNT(*) as c FROM follows WHERE following_id = ?", args: [req.user.id],
  })).rows[0]?.c || 0;

  res.json({ ok: true, total_plays, total_tracks: tracks.length, follower_count, tracks, recent_plays });
}));

// ── Referral: Get my referral code + stats ──────────────────────────────────
app.get("/api/v1/me/referral", requireAuth(async (req, res) => {
  try {
    let user = (await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [req.user.id] })).rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    let referralCode = user.referral_code;
    if (!referralCode) {
      // Generate 6-char alphanumeric code
      referralCode = crypto.randomBytes(4).toString("base64url").slice(0, 6).toUpperCase();
      await db.execute({ sql: "UPDATE users SET referral_code = ? WHERE id = ?", args: [referralCode, req.user.id] });
    }

    const referralCount = user.referral_count || 0;
    const bonusTracks = referralCount * 5;

    res.json({
      ok: true,
      referral_code: referralCode,
      referral_count: referralCount,
      bonus_tracks: bonusTracks,
      share_url: `https://soluna-web.fly.dev/artist?ref=${referralCode}`,
    });
  } catch (e) {
    console.error("referral error:", e);
    res.status(500).json({ error: "Failed to get referral info" });
  }
}));

// ════════════════════════════════════════════════════════════════════
// CABIN / PROPERTY MANAGEMENT  +  TELEGRAM BOT
// ════════════════════════════════════════════════════════════════════

// ── Telegram helpers ──────────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d   = new Date(dateStr + "T00:00:00+09:00");
  const DOW = ["日","月","火","水","木","金","土"];
  return `${d.getMonth()+1}月${d.getDate()}日(${DOW[d.getDay()]})`;
}

async function sendTg(chatId, text, extra = {}) {
  if (!TG_TOKEN) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", ...extra }),
    });
    const j = await r.json();
    return j.ok ? j.result : null;
  } catch (e) { console.error("[tg]", e.message); return null; }
}

function editTg(chatId, msgId, text, extra = {}) {
  if (!TG_TOKEN) return;
  fetch(`https://api.telegram.org/bot${TG_TOKEN}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: msgId, text, parse_mode: "Markdown", ...extra }),
  }).catch(() => {});
}

function answerCb(cbId, text) {
  if (!TG_TOKEN) return;
  fetch(`https://api.telegram.org/bot${TG_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: cbId, text, show_alert: false }),
  }).catch(() => {});
}

// ── Cleaning task creation ────────────────────────────────────────────────────
async function notifyCleaningTask(taskId, cabin, guestName, checkoutDate, nextCheckin) {
  const label     = propLabel(cabin);
  const checkStr  = fmtDate(checkoutDate);
  const nextStr   = nextCheckin ? fmtDate(nextCheckin) : "未定";
  const today     = new Date().toISOString().slice(0, 10);
  const urgency   = nextCheckin === checkoutDate ? "⚠️ *当日連泊！即時清掃*\n"
    : nextCheckin && nextCheckin <= new Date(Date.now() + 86400000).toISOString().slice(0, 10)
      ? "🚨 *翌日チェックイン！*\n"
      : checkoutDate === today ? "📍 *本日チェックアウト*\n" : "";

  const text = `🧹 *清掃タスク*\n\n${urgency}🏡 ${label}\n👤 ${guestName || "—"}\n🚪 チェックアウト: ${checkStr}\n📅 次回チェックイン: ${nextStr}\n\n完了したらボタンを押してください。`;
  const kb   = { inline_keyboard: [[
    { text: "✅ 清掃完了", callback_data: `clean_done:${taskId}` },
    { text: "⚠️ 問題あり", callback_data: `clean_issue:${taskId}` },
  ]]};
  const msg = await sendTg(TG_CHAT, text, { reply_markup: JSON.stringify(kb) });
  if (msg) {
    await db.execute({ sql: "UPDATE cleaning_tasks SET tg_message_id=? WHERE id=?",
      args: [String(msg.message_id), taskId] }).catch(() => {});
  }
}

async function createCleaningTask(resv) {
  const taskId = crypto.randomBytes(8).toString("hex");
  let nextCheckin = null;
  try {
    const next = (await db.execute({
      sql: `SELECT checkin FROM cabin_reservations
            WHERE cabin=? AND checkin>=? AND status!='cancelled'
            ORDER BY checkin ASC LIMIT 1`,
      args: [resv.cabin, resv.checkout]
    })).rows[0];
    if (next) nextCheckin = next.checkin;
  } catch {}
  await db.execute({
    sql: `INSERT OR IGNORE INTO cleaning_tasks (id,reservation_id,cabin,guest_name,checkout_date,next_checkin)
          VALUES (?,?,?,?,?,?)`,
    args: [taskId, resv.id, resv.cabin, resv.guest_name, resv.checkout, nextCheckin]
  }).catch(() => {});
  await notifyCleaningTask(taskId, resv.cabin, resv.guest_name, resv.checkout, nextCheckin);
  return taskId;
}

// ── Telegram webhook ──────────────────────────────────────────────────────────
app.post("/api/telegram/webhook", express.json(), async (req, res) => {
  res.json({ ok: true });
  const update = req.body;
  if (!update) return;

  // Callback buttons
  if (update.callback_query) {
    const cq = update.callback_query;
    const [action, taskId] = (cq.data || "").split(":");
    if (action === "clean_done" && taskId) {
      try {
        const task = (await db.execute({ sql: "SELECT * FROM cleaning_tasks WHERE id=?", args: [taskId] })).rows[0];
        if (task && task.status === "pending") {
          await db.execute({ sql: "UPDATE cleaning_tasks SET status='done',completed_at=datetime('now') WHERE id=?", args: [taskId] });
          editTg(TG_CHAT, parseInt(task.tg_message_id),
            `✅ *清掃完了*\n\n🏡 ${propLabel(task.cabin)}\n👤 ${task.guest_name||"—"}\n🚪 ${fmtDate(task.checkout_date)}`);
          answerCb(cq.id, "清掃完了を記録しました ✅");
        } else answerCb(cq.id, task ? "既に完了済みです" : "タスクが見つかりません");
      } catch { answerCb(cq.id, "エラーが発生しました"); }
    } else if (action === "clean_issue" && taskId) {
      try {
        await db.execute({ sql: "UPDATE cleaning_tasks SET status='issue' WHERE id=?", args: [taskId] });
        const task = (await db.execute({ sql: "SELECT * FROM cleaning_tasks WHERE id=?", args: [taskId] })).rows[0];
        answerCb(cq.id, "問題を報告しました ⚠️");
        sendTg(TG_CHAT, `⚠️ *清掃問題報告*\n\n🏡 ${task ? propLabel(task.cabin) : "不明"}\nタスクID: \`${taskId}\`\n\n詳細を返信してください。`);
      } catch { answerCb(cq.id, "エラーが発生しました"); }
    }
    return;
  }

  const msg = update.message;
  if (!msg?.text) return;
  const chatId = String(msg.chat.id);
  const text   = msg.text.trim();
  const cmd    = text.split(" ")[0].replace(/@\S+/, "").toLowerCase();

  try {
    if (cmd === "/start" || cmd === "/help") {
      await sendTg(chatId, `*SOLUNA 予約管理ボット*\n\n` +
        `/今日 — 本日のチェックイン・アウト\n` +
        `/予約 — 今後14日の予約一覧\n` +
        `/清掃 — 未完了の清掃タスク\n` +
        `/完了 [物件キー] — 手動で清掃完了\n` +
        `/stats — 今月の稼働統計\n\n` +
        `物件キー: tapkop / lodge / atami / instant_a / instant_b`);

    } else if (cmd === "/今日") {
      const today = new Date().toISOString().slice(0, 10);
      const [ins, outs] = await Promise.all([
        db.execute({ sql: "SELECT * FROM cabin_reservations WHERE checkin=? AND status!='cancelled'", args: [today] }),
        db.execute({ sql: "SELECT * FROM cabin_reservations WHERE checkout=? AND status!='cancelled'", args: [today] }),
      ]);
      let out = `*今日 ${fmtDate(today)}*\n\n`;
      if (ins.rows.length) {
        out += `*🔑 チェックイン (${ins.rows.length}件)*\n`;
        ins.rows.forEach(r => { out += `  • ${propLabel(r.cabin)} — ${r.guest_name||"—"}\n`; });
        out += "\n";
      }
      if (outs.rows.length) {
        out += `*🚪 チェックアウト (${outs.rows.length}件)*\n`;
        outs.rows.forEach(r => { out += `  • ${propLabel(r.cabin)} — ${r.guest_name||"—"}\n`; });
      }
      if (!ins.rows.length && !outs.rows.length) out += "本日の予約はありません";
      await sendTg(chatId, out);

    } else if (cmd === "/予約") {
      const rows = (await db.execute({
        sql: `SELECT * FROM cabin_reservations WHERE status!='cancelled' AND checkin>=date('now') AND checkin<=date('now','+14 days') ORDER BY checkin ASC LIMIT 20`,
        args: []
      })).rows;
      if (!rows.length) { await sendTg(chatId, "今後14日間の予約はありません"); return; }
      const out = "*今後14日の予約*\n\n" + rows.map(r =>
        `📅 ${fmtDate(r.checkin)}〜${fmtDate(r.checkout)}\n🏡 ${propLabel(r.cabin)}\n👤 ${r.guest_name||"—"}`
      ).join("\n\n");
      await sendTg(chatId, out);

    } else if (cmd === "/清掃") {
      const rows = (await db.execute({
        sql: "SELECT * FROM cleaning_tasks WHERE status='pending' ORDER BY checkout_date ASC LIMIT 10",
        args: []
      })).rows;
      if (!rows.length) { await sendTg(chatId, "未完了の清掃タスクはありません ✅"); return; }
      const out = "*未完了の清掃タスク*\n\n" + rows.map(r =>
        `🧹 ${fmtDate(r.checkout_date)} — ${propLabel(r.cabin)}\n👤 ${r.guest_name||"—"}` +
        (r.next_checkin ? `\n📅 次回IN: ${fmtDate(r.next_checkin)}` : "")
      ).join("\n\n");
      await sendTg(chatId, out);

    } else if (cmd === "/stats") {
      const ym = new Date().toISOString().slice(0, 7);
      const rows = (await db.execute({
        sql: `SELECT cabin, COUNT(*) as cnt FROM cabin_reservations WHERE checkin LIKE ? AND status!='cancelled' GROUP BY cabin`,
        args: [ym + "%"]
      })).rows;
      const out = rows.length
        ? `*今月 (${ym}) の予約数*\n\n` + rows.map(r => `🏡 ${propLabel(r.cabin)}: ${r.cnt}件`).join("\n")
        : "今月の予約データはありません";
      await sendTg(chatId, out);

    } else if (cmd === "/完了") {
      const cabin = text.split(" ")[1] || "";
      if (!cabin) { await sendTg(chatId, "使い方: /完了 [物件キー]\n例: /完了 tapkop"); return; }
      const task = (await db.execute({
        sql: "SELECT * FROM cleaning_tasks WHERE cabin=? AND status='pending' ORDER BY checkout_date DESC LIMIT 1",
        args: [cabin]
      })).rows[0];
      if (!task) { await sendTg(chatId, `${propLabel(cabin)} の未完了清掃タスクはありません`); return; }
      await db.execute({ sql: "UPDATE cleaning_tasks SET status='done',completed_at=datetime('now') WHERE id=?", args: [task.id] });
      await sendTg(chatId, `✅ ${propLabel(cabin)} の清掃完了を記録しました`);
    }
  } catch (e) { console.error("[tg bot]", e.message); }
});

// Register Telegram webhook
async function registerTgWebhook() {
  if (!TG_TOKEN) { console.log("ℹ Telegram disabled (set TELEGRAM_BOT_TOKEN)"); return; }
  try {
    const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${BASE_URL}/api/telegram/webhook`, max_connections: 5 }),
    });
    const j = await r.json();
    console.log(j.ok ? `✓ Telegram webhook: ${BASE_URL}/api/telegram/webhook` : `⚠ Telegram webhook: ${j.description}`);
  } catch (e) { console.error("Telegram webhook registration:", e.message); }
}

// ── Morning digest (7 AM JST) ─────────────────────────────────────────────────
function scheduleMorningDigest() {
  async function runDigest() {
    if (!TG_TOKEN) return;
    const today = new Date().toISOString().slice(0, 10);
    const [ins, outs, cleans] = await Promise.all([
      db.execute({ sql: "SELECT * FROM cabin_reservations WHERE checkin=? AND status!='cancelled'", args: [today] }),
      db.execute({ sql: "SELECT * FROM cabin_reservations WHERE checkout=? AND status!='cancelled'", args: [today] }),
      db.execute({ sql: "SELECT * FROM cleaning_tasks WHERE status='pending' ORDER BY checkout_date ASC LIMIT 5", args: [] }),
    ]);
    if (!ins.rows.length && !outs.rows.length && !cleans.rows.length) return;
    let lines = [`☀️ *SOLUNA 朝のサマリー ${fmtDate(today)}*\n`];
    if (ins.rows.length) {
      lines.push(`*🔑 本日チェックイン (${ins.rows.length}件)*`);
      ins.rows.forEach(r => lines.push(`  • ${propLabel(r.cabin)} — ${r.guest_name||"—"}`));
    }
    if (outs.rows.length) {
      lines.push(`\n*🚪 本日チェックアウト (${outs.rows.length}件)*`);
      outs.rows.forEach(r => lines.push(`  • ${propLabel(r.cabin)} — ${r.guest_name||"—"}`));
    }
    if (cleans.rows.length) {
      lines.push(`\n*🧹 未完了清掃 (${cleans.rows.length}件)*`);
      cleans.rows.forEach(t => lines.push(`  • ${propLabel(t.cabin)} — ${fmtDate(t.checkout_date)}`));
    }
    await sendTg(TG_CHAT, lines.join("\n")).catch(() => {});
  }

  function scheduleNext() {
    const now  = Date.now();
    const jst  = now + 9 * 3600 * 1000;
    const jstD = new Date(jst);
    // Target: next 7:00 JST = 22:00 UTC
    const next7am = new Date(jstD);
    next7am.setUTCHours(7 - 9, 0, 0, 0);
    if (next7am.getTime() <= jst) next7am.setUTCDate(next7am.getUTCDate() + 1);
    const ms = next7am.getTime() - now;
    setTimeout(() => { runDigest().catch(()=>{}).finally(scheduleNext); }, ms);
  }
  scheduleNext();
  console.log("✓ Morning digest scheduler started");
}

// ── Morning philosophy (9 AM JST) ────────────────────────────────────────────
const ARCH_PHILOSOPHIES = [
  { author: "安藤忠雄", quote: "光は空間の本質を明らかにし、建築を詩にする" },
  { author: "ピーター・ズントー", quote: "空間の記憶は、身体の記憶だ" },
  { author: "隈研吾", quote: "素材と自然が対話するとき、建築は呼吸を始める" },
  { author: "ミース・ファン・デル・ローエ", quote: "Less is more" },
  { author: "ル・コルビュジェ", quote: "空間、光、秩序。これが人間が求めるものだ" },
  { author: "フランク・ロイド・ライト", quote: "大地から生えたように、建物は場所に根ざすべきだ" },
  { author: "槇文彦", quote: "集合体の中に、個の美しさが生まれる" },
  { author: "グレン・マーカット", quote: "地球に軽く触れよ" },
  { author: "アルヴァ・アアルト", quote: "素材の温かさが、空間に人間性をもたらす" },
  { author: "ルイス・カーン", quote: "建築とは、空間を通じた意志の表現だ" },
  { author: "ザハ・ハディド", quote: "曲線は直線よりも多くを語る" },
  { author: "レム・コールハース", quote: "都市は建築の限界を超えたところで始まる" },
  { author: "伊東豊雄", quote: "建築は自然と人間の対話の場である" },
  { author: "磯崎新", quote: "建築は廃墟になったとき完成する" },
  { author: "坂茂", quote: "素材に制限はない。あるのは想像力の制限だ" },
  { author: "藤本壮介", quote: "建築は自然でもなく人工でもなく、その間にある" },
  { author: "妹島和世", quote: "軽さと透明さが、新しい空間を生む" },
  { author: "西沢立衛", quote: "建築は人間の行為を包む器である" },
  { author: "ルイス・バラガン", quote: "美しさとは記憶に残る沈黙である" },
  { author: "タデオ・アンド", quote: "場所の記憶が建築に魂を与える" },
  { author: "スティーブン・ホール", quote: "建築は光によって時間と共に生きる" },
  { author: "ヘルツォーク＆ド・ムーロン", quote: "素材そのものが建築の言語だ" },
  { author: "ノーマン・フォスター", quote: "持続可能性とは次世代への敬意だ" },
  { author: "レンゾ・ピアノ", quote: "建物は呼吸するべきだ——光、風、そして人とともに" },
  { author: "リチャード・ロジャース", quote: "技術は人間を解放するためにある" },
  { author: "ダニエル・リベスキンド", quote: "建築は記憶と希望の間に立つ" },
  { author: "ピーター・アイゼンマン", quote: "建築は意味を問い直す行為だ" },
  { author: "バックミンスター・フラー", quote: "より少ない資源で、より多くをなせ" },
  { author: "ヨーン・ウツォン", quote: "建築は詩であり、詩は建築である" },
  { author: "エーロ・サーリネン", quote: "常に次のプロジェクトを現在の最高傑作として設計する" },
  { author: "ミシェル・デ・クラーク", quote: "建築は社会の詩的な表現である" },
  { author: "ヨーゼフ・ホフマン", quote: "装飾は機能から生まれるべきだ" },
  { author: "マリオ・ボッタ", quote: "建築は場所のアイデンティティだ" },
  { author: "タデオ・アンド", quote: "記憶なき建築は、根なき木だ" },
  { author: "リチャード・マイヤー", quote: "白は全ての色を内包する" },
  { author: "チャールズ・コレア", quote: "建築は気候と文化の詩だ" },
  { author: "ハッサン・ファシー", quote: "人々の知恵の中に最も深い建築がある" },
  { author: "タレク・エルカリ", quote: "建築は記憶の器である" },
  { author: "西澤大良", quote: "建築は問いかけることで完成する" },
  { author: "中村好文", quote: "住まいは人生の舞台装置だ" },
  { author: "吉村順三", quote: "家は住む人の生き方が現れる場所だ" },
  { author: "白井晟一", quote: "建築は精神の形だ" },
  { author: "前川國男", quote: "建築は社会への誠実な応答だ" },
  { author: "丹下健三", quote: "空間は人間の夢を形にする" },
  { author: "篠原一男", quote: "家は芸術だ" },
  { author: "山本理顕", quote: "建築は関係性を作る" },
  { author: "塚本由晴", quote: "行動と空間が互いを作り出す" },
  { author: "仙田満", quote: "遊びの空間が、人間を育てる" },
  { author: "原広司", quote: "空間は叙述する——物語として" },
  { author: "毛綱毅曠", quote: "建築は宇宙との対話だ" },
];

function scheduleMorningPhilosophy() {
  async function runPhilosophy() {
    const p = ARCH_PHILOSOPHIES[Math.floor(Math.random() * ARCH_PHILOSOPHIES.length)];
    const message = `🏛️ *今日の建築哲学*\n\n「${p.quote}」\n\n— ${p.author}`;
    const ins = await db.execute({
      sql: `INSERT INTO soluna_community_messages (member_id, display_name, member_type, message, is_ai) VALUES (0,'ソル AI','ai',?,1)`,
      args: [message]
    });
    const payload = {
      type: "message",
      id: Number(ins.lastInsertRowid),
      member_id: 0,
      display_name: "ソル AI",
      member_type: "ai",
      message,
      is_ai: 1,
      created_at: new Date().toISOString()
    };
    broadcastCommunity(payload);
  }

  function scheduleNext() {
    const now = Date.now();
    // Target: next 9:00 JST = 0:00 UTC
    const jst = now + 9 * 3600 * 1000;
    const jstD = new Date(jst);
    const next9am = new Date(jstD);
    next9am.setUTCHours(9 - 9, 0, 0, 0); // 0:00 UTC = 9:00 JST
    if (next9am.getTime() <= jst) next9am.setUTCDate(next9am.getUTCDate() + 1);
    const ms = next9am.getTime() - now;
    setTimeout(() => { runPhilosophy().catch(() => {}).finally(scheduleNext); }, ms);
  }
  scheduleNext();
  console.log("✓ Morning philosophy scheduler started");
}

// Hourly: create cleaning tasks for upcoming checkouts
async function syncCleaningTasks() {
  try {
    const today    = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const resv = (await db.execute({
      sql: `SELECT r.* FROM cabin_reservations r
            LEFT JOIN cleaning_tasks ct ON ct.reservation_id=r.id
            WHERE r.status!='cancelled' AND r.checkout BETWEEN ? AND ? AND ct.id IS NULL`,
      args: [today, tomorrow]
    })).rows;
    for (const r of resv) {
      console.log(`[cleaning] Creating task for ${r.cabin} checkout ${r.checkout}`);
      await createCleaningTask(r);
    }
  } catch (e) { console.error("[cleanSync]", e.message); }
}

// ── Beds24 sync ───────────────────────────────────────────────────────────────
let beds24Token = null;
let beds24TokenExpiry = 0;

async function beds24GetToken() {
  if (!BEDS24_REFRESH) return null;
  if (beds24Token && Date.now() < beds24TokenExpiry) return beds24Token;
  try {
    const r = await fetch("https://api.beds24.com/v2/authentication/token", {
      headers: { refreshToken: BEDS24_REFRESH }
    });
    const j = await r.json();
    if (j.token) {
      beds24Token = j.token;
      beds24TokenExpiry = Date.now() + 23 * 3600 * 1000;
      return beds24Token;
    }
    return null;
  } catch (e) { console.error("Beds24 token:", e.message); return null; }
}

function mapBeds24Prop(propId) {
  const map = { 243406: "atami", 243407: "honolulu", 243408: "lodge", 243409: "nesting", 244738: "maui", 322965: "instant_a", 322966: "instant_b" };
  return map[propId] || `tapkop`; // default fallback
}

async function pushToBeds24(prop, check_in, check_out, guests, guestName, guestEmail) {
  if (!prop.beds24_prop || !prop.beds24_room) return null;
  try {
    const token = await beds24GetToken();
    if (!token) return null;
    const [ln, fn] = (guestName || guestEmail || "SOLUNA Guest").split(" ").reverse();
    const r = await fetch("https://api.beds24.com/v2/bookings", {
      method: "POST",
      headers: { "token": token, "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: prop.beds24_prop,
        roomId: prop.beds24_room,
        roomQty: 1,
        arrival: check_in,
        departure: check_out,
        numAdult: guests || 2,
        firstName: fn || guestEmail || "SOLUNA",
        lastName: ln || "Guest",
        email: guestEmail || "",
        status: "confirmed",
        notes: "Booked via SOLUNA App",
      }),
    });
    const d = await r.json();
    return d.data?.[0]?.id || null;
  } catch(e) {
    console.error("Beds24 push error:", e.message);
    return null;
  }
}

async function beds24Sync() {
  const token = await beds24GetToken();
  if (!token) return;
  try {
    const r = await fetch("https://api.beds24.com/v2/bookings?includeGuests=true&status=confirmed", {
      headers: { token }
    });
    const data = await r.json();
    if (!data.success) return;
    let newCount = 0;
    for (const b of data.data || []) {
      const cabin    = mapBeds24Prop(b.propertyId);
      const id       = `b24-${b.id}`;
      const name     = `${b.guestFirstName||""} ${b.guestLastName||""}`.trim();
      const existing = (await db.execute({ sql: "SELECT id,notified FROM cabin_reservations WHERE id=?", args: [id] })).rows[0];

      await db.execute({
        sql: `INSERT OR REPLACE INTO cabin_reservations
              (id,cabin,guest_name,guest_email,guest_phone,checkin,checkout,status,source,notified)
              VALUES (?,?,?,?,?,?,?,?,?,?)`,
        args: [id, cabin, name, b.guestEmail||"", b.guestPhone||"",
               b.arrival, b.departure,
               b.status === "cancelled" ? "cancelled" : "confirmed",
               "beds24", existing?.notified || 0]
      }).catch(() => {});

      if (!existing) {
        newCount++;
        // Telegram alert for new booking
        sendTg(TG_CHAT,
          `📩 *新規予約*\n\n🏡 ${propLabel(cabin)}\n👤 ${name||"—"}\n📅 ${fmtDate(b.arrival)}〜${fmtDate(b.departure)}\n📧 ${b.guestEmail||"—"}`
        ).catch(() => {});
      }
    }
    if (newCount > 0) console.log(`[beds24] ${newCount} new bookings`);
  } catch (e) { console.error("Beds24 sync:", e.message); }
}

// ── Admin: reservations dashboard ─────────────────────────────────────────────
app.get("/api/admin/reservations", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const [resv, tasks] = await Promise.all([
    db.execute("SELECT * FROM cabin_reservations WHERE status!='cancelled' ORDER BY checkin ASC LIMIT 100"),
    db.execute("SELECT * FROM cleaning_tasks ORDER BY checkout_date DESC LIMIT 50"),
  ]);
  res.json({ reservations: resv.rows, cleaning_tasks: tasks.rows });
});

app.get("/api/admin/cleaning", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const tasks = (await db.execute("SELECT * FROM cleaning_tasks ORDER BY checkout_date DESC LIMIT 100")).rows;
  res.json(tasks);
});

// ── Cabin reservations CRUD ───────────────────────────────────────────────────
app.get("/api/cabin/reservations", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = (await db.execute("SELECT * FROM cabin_reservations WHERE status!='cancelled' ORDER BY checkin ASC LIMIT 100")).rows;
  res.json(rows);
});

app.post("/api/cabin/reservations", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { cabin, guest_name, guest_email, guest_phone, checkin, checkout, note } = req.body || {};
  if (!cabin || !checkin || !checkout) return res.status(400).json({ error: "cabin, checkin, checkout required" });
  const id = crypto.randomBytes(8).toString("hex");
  await db.execute({
    sql: "INSERT INTO cabin_reservations (id,cabin,guest_name,guest_email,guest_phone,checkin,checkout,note,source) VALUES (?,?,?,?,?,?,?,?,'manual')",
    args: [id, cabin, guest_name||"", guest_email||"", guest_phone||"", checkin, checkout, note||""]
  });
  sendTg(TG_CHAT, `📝 *手動予約登録*\n\n🏡 ${propLabel(cabin)}\n👤 ${guest_name||"—"}\n📅 ${fmtDate(checkin)}〜${fmtDate(checkout)}`).catch(()=>{});
  res.json({ ok: true, id });
});

app.patch("/api/cabin/reservations/:id/cancel", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  await db.execute({ sql: "UPDATE cabin_reservations SET status='cancelled' WHERE id=?", args: [req.params.id] });
  res.json({ ok: true });
});

// ── Month ops: slots + checkout + webhook ─────────────────────────────────────
app.get("/api/cabin/month/slots", async (req, res) => {
  const slots = [];
  const now   = new Date();
  for (const [propId, cfg] of Object.entries(MONTH_OP_PROPS)) {
    for (let i = 1; i <= MONTH_OP_ADVANCE; i++) {
      const d   = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const yr  = d.getFullYear();
      const mo  = d.getMonth() + 1;
      const existing = (await db.execute({
        sql: "SELECT id FROM month_ops WHERE property_id=? AND year=? AND month=? AND status='paid'",
        args: [propId, yr, mo]
      })).rows[0];
      slots.push({
        property_id: propId, prop_name: cfg.name, location: cfg.location,
        year: yr, month: mo, price_jpy: cfg.price_jpy,
        avg_revenue_jpy: cfg.avg_revenue_jpy,
        cleaning_fee: cfg.cleaning_fee, linen_fee_per_stay: cfg.linen_fee_per_stay,
        bed_service: cfg.bed_service, bed_service_fee: cfg.bed_service_fee,
        sold: !!existing,
      });
    }
  }
  res.json({ slots });
});

app.post("/api/cabin/month/checkout", async (req, res) => {
  if (!STRIPE_SECRET_KEY) return res.status(503).json({ error: "Payment not configured" });
  const { property_id, year, month, name, email } = req.body || {};
  if (!property_id || !year || !month || !email) return res.status(400).json({ error: "Missing fields" });
  const cfg = MONTH_OP_PROPS[property_id];
  if (!cfg) return res.status(400).json({ error: "Invalid property" });
  // Check sold
  const existing = (await db.execute({
    sql: "SELECT id FROM month_ops WHERE property_id=? AND year=? AND month=? AND status='paid'",
    args: [property_id, year, month]
  })).rows[0];
  if (existing) return res.status(409).json({ error: "既に売り切れています" });

  const stripe = require("stripe")(STRIPE_SECRET_KEY);
  const id = crypto.randomBytes(8).toString("hex");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: {
      currency: "jpy",
      product_data: { name: `${cfg.name} — ${year}年${month}月 月次運営権` },
      unit_amount: cfg.price_jpy,
    }, quantity: 1 }],
    mode: "payment",
    customer_email: email,
    success_url: `${BASE_URL.replace("solun.art","soluna-teshikaga.fly.dev")}/month.html?success=1`,
    cancel_url:  `${BASE_URL.replace("solun.art","soluna-teshikaga.fly.dev")}/month.html`,
    metadata: { month_op_id: id, property_id, year, month, buyer_name: name, buyer_email: email },
  });
  await db.execute({
    sql: "INSERT INTO month_ops (id,property_id,year,month,buyer_name,buyer_email,price_jpy,status,stripe_session_id) VALUES (?,?,?,?,?,?,?,'pending',?)",
    args: [id, property_id, year, month, name||"", email, cfg.price_jpy, session.id]
  });
  res.json({ url: session.url });
});

app.post("/api/cabin/month/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const wh  = process.env.STRIPE_WEBHOOK_SECRET_MONTH || process.env.STRIPE_WEBHOOK_SECRET || "";
  let event;
  try {
    event = wh
      ? require("stripe")(STRIPE_SECRET_KEY).webhooks.constructEvent(req.body, sig, wh)
      : JSON.parse(req.body);
  } catch (e) { return res.status(400).send("Invalid signature"); }
  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const { month_op_id, property_id, year, month, buyer_name, buyer_email } = s.metadata || {};
    if (month_op_id) {
      await db.execute({ sql: "UPDATE month_ops SET status='paid' WHERE id=?", args: [month_op_id] });
      const cfg = MONTH_OP_PROPS[property_id] || {};
      sendTg(TG_CHAT, `💰 *月次運営権 購入完了*\n\n🏡 ${cfg.name||property_id}\n📅 ${year}年${month}月\n👤 ${buyer_name||"—"}\n📧 ${buyer_email}\n💴 ¥${(cfg.price_jpy||0).toLocaleString()}`).catch(()=>{});
      if (RESEND_API_KEY && buyer_email) {
        fetch("https://api.resend.com/emails", { method:"POST",
          headers: {"Content-Type":"application/json", Authorization:`Bearer ${RESEND_API_KEY}`},
          body: JSON.stringify({
            from: "SOLUNA <info@solun.art>",
            to: [buyer_email],
            subject: `【SOLUNA】${cfg.name||property_id} ${year}年${month}月 月次運営権 ご購入ありがとうございます`,
            html: `<div style="background:#050505;color:#f0ece4;font-family:'Helvetica Neue',sans-serif;padding:40px;max-width:520px;margin:0 auto">
              <p style="font-size:11px;letter-spacing:.2em;color:#c8a455">SOLUNA</p>
              <h2 style="font-size:20px;margin:16px 0">ご購入ありがとうございます</h2>
              <p style="color:#aaa;line-height:1.9;font-size:14px">
                ${buyer_name||""}様<br><br>
                ${cfg.name||property_id} ${year}年${month}月分の月次運営権のご購入を確認しました。<br>
                翌月10日に実際の売上額を宿泊クレジットとして付与いたします。
              </p>
              <p style="font-size:12px;color:#555;margin-top:24px">SOLUNA — Enabler Inc.</p>
            </div>`
          })
        }).catch(()=>{});
      }
    }
  }
  res.json({ ok: true });
});

// ── Kumiai: slots + apply + webhook ──────────────────────────────────────────
app.get("/api/cabin/kumiai/slots", async (req, res) => {
  const slots = [];
  const now = new Date();
  for (const [propId, cfg] of Object.entries(MONTH_OP_PROPS)) {
    for (let i = 1; i <= MONTH_OP_ADVANCE; i++) {
      const d  = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1;
      const cnt = (await db.execute({
        sql: "SELECT COUNT(*) as c FROM kumiai_applications WHERE property_id=? AND year=? AND month=? AND status='paid'",
        args: [propId, yr, mo]
      })).rows[0]?.c || 0;
      slots.push({
        property_id: propId, prop_name: cfg.name, location: cfg.location,
        year: yr, month: mo, price_jpy: cfg.price_jpy,
        investor_count: cnt, max_investors: KUMIAI_MAX_INVESTORS,
        sold: cnt >= KUMIAI_MAX_INVESTORS,
      });
    }
  }
  res.json({ slots });
});

app.post("/api/cabin/kumiai/apply", async (req, res) => {
  if (!STRIPE_SECRET_KEY) return res.status(503).json({ error: "Payment not configured" });
  const { property_id, year, month, buyer_name, buyer_address, buyer_email, buyer_phone,
          bank_name, bank_branch, bank_type, bank_number, bank_holder } = req.body || {};
  if (!property_id || !year || !month || !buyer_email || !buyer_name)
    return res.status(400).json({ error: "Missing required fields" });

  const cfg = MONTH_OP_PROPS[property_id];
  if (!cfg) return res.status(400).json({ error: "Invalid property" });

  const cnt = (await db.execute({
    sql: "SELECT COUNT(*) as c FROM kumiai_applications WHERE property_id=? AND year=? AND month=? AND status='paid'",
    args: [property_id, year, month]
  })).rows[0]?.c || 0;
  if (cnt >= KUMIAI_MAX_INVESTORS) return res.status(409).json({ error: "満員です（49名限定）" });

  const stripe = require("stripe")(STRIPE_SECRET_KEY);
  const id     = crypto.randomBytes(8).toString("hex");
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price_data: {
      currency: "jpy",
      product_data: { name: `${cfg.name} — ${year}年${month}月 匿名組合出資` },
      unit_amount: cfg.price_jpy,
    }, quantity: 1 }],
    mode: "payment",
    customer_email: buyer_email,
    success_url: `${BASE_URL.replace("solun.art","soluna-teshikaga.fly.dev")}/kumiai.html?success=1`,
    cancel_url:  `${BASE_URL.replace("solun.art","soluna-teshikaga.fly.dev")}/kumiai.html`,
    metadata: { kumiai_id: id },
  });
  await db.execute({
    sql: `INSERT INTO kumiai_applications
          (id,property_id,year,month,buyer_name,buyer_address,buyer_email,buyer_phone,
           bank_name,bank_branch,bank_type,bank_number,bank_holder,price_jpy,status,stripe_session_id)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?)`,
    args: [id, property_id, year, month, buyer_name, buyer_address||"", buyer_email, buyer_phone||"",
           bank_name||"", bank_branch||"", bank_type||"ordinary", bank_number||"", bank_holder||"",
           cfg.price_jpy, session.id]
  });
  res.json({ url: session.url });
});

app.post("/api/cabin/kumiai/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const wh  = process.env.STRIPE_WEBHOOK_SECRET_KUMIAI || process.env.STRIPE_WEBHOOK_SECRET || "";
  let event;
  try {
    event = wh
      ? require("stripe")(STRIPE_SECRET_KEY).webhooks.constructEvent(req.body, sig, wh)
      : JSON.parse(req.body);
  } catch (e) { return res.status(400).send("Invalid signature"); }
  if (event.type === "checkout.session.completed") {
    const { kumiai_id } = event.data.object.metadata || {};
    if (kumiai_id) {
      await db.execute({ sql: "UPDATE kumiai_applications SET status='paid' WHERE id=?", args: [kumiai_id] });
      const app = (await db.execute({ sql: "SELECT * FROM kumiai_applications WHERE id=?", args: [kumiai_id] })).rows[0];
      if (app) {
        const cfg = MONTH_OP_PROPS[app.property_id] || {};
        sendTg(TG_CHAT, `💰 *匿名組合 出資完了*\n\n🏡 ${cfg.name||app.property_id}\n📅 ${app.year}年${app.month}月\n👤 ${app.buyer_name}\n📧 ${app.buyer_email}\n💴 ¥${(app.price_jpy||0).toLocaleString()}`).catch(()=>{});
      }
    }
  }
  res.json({ ok: true });
});

// ── Invest waitlist ───────────────────────────────────────────────────────────
app.post("/api/cabin/invest/notify", async (req, res) => {
  const { name, email, scheme } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });
  const id = crypto.randomBytes(8).toString("hex");
  await db.execute({
    sql: "INSERT OR IGNORE INTO invest_waitlist (id,name,email,scheme) VALUES (?,?,?,?)",
    args: [id, name||"", email, scheme||"B"]
  }).catch(() => {});
  sendAdminEmail(`[SOLUNA] 投資ウェイトリスト登録 — ${email}`,
    `<p>スキーム: ${scheme||"B"}</p><p>名前: ${name||"—"}</p><p>Email: ${email}</p>`);
  res.json({ ok: true });
});

// ── Admin: kumiai list ────────────────────────────────────────────────────────
app.get("/api/admin/kumiai", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = (await db.execute("SELECT * FROM kumiai_applications ORDER BY created_at DESC LIMIT 200")).rows;
  res.json(rows);
});

app.post("/api/admin/kumiai/:id/distribute", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  await db.execute({ sql: "UPDATE kumiai_applications SET distributed=1 WHERE id=?", args: [req.params.id] });
  res.json({ ok: true });
});

// ── Admin: month ops list ─────────────────────────────────────────────────────
app.get("/api/admin/month-ops", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = (await db.execute("SELECT * FROM month_ops ORDER BY created_at DESC LIMIT 200")).rows;
  res.json(rows);
});

app.post("/api/admin/month-ops/:id/credit", async (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { credit_amount } = req.body || {};
  const op = (await db.execute({ sql: "SELECT * FROM month_ops WHERE id=?", args: [req.params.id] })).rows[0];
  if (!op) return res.status(404).json({ error: "Not found" });
  await db.execute({ sql: "UPDATE month_ops SET credit_issued=1 WHERE id=?", args: [req.params.id] });
  if (RESEND_API_KEY && op.buyer_email) {
    const cfg = MONTH_OP_PROPS[op.property_id] || {};
    fetch("https://api.resend.com/emails", { method:"POST",
      headers: {"Content-Type":"application/json", Authorization:`Bearer ${RESEND_API_KEY}`},
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: [op.buyer_email],
        subject: `【SOLUNA】${cfg.name||op.property_id} ${op.year}年${op.month}月 宿泊クレジット付与のお知らせ`,
        html: `<div style="background:#050505;color:#f0ece4;font-family:'Helvetica Neue',sans-serif;padding:40px;max-width:520px;margin:0 auto">
          <p style="font-size:11px;letter-spacing:.2em;color:#c8a455">SOLUNA</p>
          <h2 style="font-size:20px;margin:16px 0">宿泊クレジットが付与されました</h2>
          <p style="color:#aaa;line-height:1.9;font-size:14px">
            ${op.buyer_name||""}様<br><br>
            ${cfg.name||op.property_id} ${op.year}年${op.month}月の宿泊クレジットを付与しました。<br>
            付与額: ¥${(credit_amount||0).toLocaleString()}<br><br>
            SOLUNA全施設の宿泊にご利用いただけます。有効期限は付与日から2年です。
          </p>
          <p style="font-size:12px;color:#555;margin-top:24px">SOLUNA — Enabler Inc.</p>
        </div>`
      })
    }).catch(()=>{});
  }
  res.json({ ok: true });
});

// ── API 404 (prevent catch-all from returning HTML for unknown API routes) ────
// ── SOLUNA Member Portal ──────────────────────────────────────────────────────
// Tables are created lazily to avoid touching the heavy initDb() batch
async function initSolunaDb() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS soluna_members (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       email TEXT UNIQUE NOT NULL,
       name TEXT,
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_otps (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       email TEXT NOT NULL,
       code TEXT NOT NULL,
       expires_at TEXT NOT NULL,
       used INTEGER DEFAULT 0,
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_sessions (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       member_id INTEGER NOT NULL,
       token TEXT UNIQUE NOT NULL,
       expires_at TEXT NOT NULL,
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_purchases (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       member_id INTEGER NOT NULL,
       property_slug TEXT NOT NULL,
       units INTEGER DEFAULT 1,
       price_yen INTEGER NOT NULL,
       status TEXT DEFAULT 'pending',
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_coupons (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       code TEXT UNIQUE NOT NULL,
       member_id INTEGER,
       property_slug TEXT NOT NULL,
       nights_total INTEGER NOT NULL,
       nights_used INTEGER DEFAULT 0,
       valid_until TEXT,
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_bookings (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       coupon_id INTEGER NOT NULL,
       member_id INTEGER,
       property_slug TEXT NOT NULL,
       check_in TEXT NOT NULL,
       check_out TEXT NOT NULL,
       nights INTEGER NOT NULL,
       guests INTEGER DEFAULT 1,
       status TEXT DEFAULT 'confirmed',
       created_at TEXT DEFAULT (datetime('now'))
     )`
    ,`CREATE TABLE IF NOT EXISTS soluna_staff_codes (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       member_id INTEGER NOT NULL UNIQUE,
       code TEXT UNIQUE NOT NULL,
       created_at TEXT DEFAULT (datetime('now'))
     )`
    ,`CREATE TABLE IF NOT EXISTS soluna_referrals (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       code TEXT NOT NULL,
       staff_member_id INTEGER NOT NULL,
       purchase_id INTEGER,
       referred_email TEXT,
       commission_rate REAL DEFAULT 0.03,
       commission_yen INTEGER DEFAULT 0,
       status TEXT DEFAULT 'pending',
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_community_messages (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       member_id INTEGER NOT NULL,
       display_name TEXT NOT NULL,
       member_type TEXT DEFAULT 'member',
       message TEXT NOT NULL,
       is_ai INTEGER DEFAULT 0,
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_community_reactions (
       message_id INTEGER NOT NULL,
       member_id  INTEGER NOT NULL,
       emoji      TEXT NOT NULL,
       PRIMARY KEY (message_id, member_id, emoji)
     )`,
    `CREATE TABLE IF NOT EXISTS soluna_properties (
       slug        TEXT PRIMARY KEY,
       name        TEXT NOT NULL,
       location    TEXT,
       price       INTEGER,
       stay_price  INTEGER,
       nights      INTEGER DEFAULT 30,
       units       INTEGER DEFAULT 1,
       mgmt        INTEGER DEFAULT 0,
       airbnb_price INTEGER,
       beds24_prop INTEGER DEFAULT 0,
       beds24_room INTEGER DEFAULT 0,
       img         TEXT,
       desc        TEXT,
       tags        TEXT DEFAULT '[]',
       page_url    TEXT,
       status      TEXT DEFAULT 'open',
       open_from   TEXT,
       sort_order  INTEGER DEFAULT 99,
       score       INTEGER DEFAULT 3,
       region      TEXT DEFAULT '',
       min_nights  INTEGER DEFAULT 1
     )`,
    // KPI event log — lightweight, stores all site events for funnel analysis
    `CREATE TABLE IF NOT EXISTS soluna_events (
       id         INTEGER PRIMARY KEY AUTOINCREMENT,
       event      TEXT NOT NULL,
       page       TEXT,
       session_id TEXT,
       email      TEXT,
       properties TEXT,
       ip         TEXT,
       created_at TEXT DEFAULT (datetime('now'))
     )`,
    `CREATE INDEX IF NOT EXISTS idx_events_event ON soluna_events(event, created_at)`,
  ]);
}
initSolunaDb().catch(e => console.error("soluna DB init error:", e));

// Seed soluna_properties (upsert on every boot to stay in sync)
(async () => {
  const props = [
    { slug:"tapkop",        name:"TAPKOP",                 location:"北海道 弟子屈町 · 阿寒摩周国立公園", price:80000000, stay_price:340000, nights:30, units:5,   mgmt:1200000, airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"tapkop_lake_mashu_view.webp",       desc:"PAN-PROJECTS設計。9,000坪の森の中、専任シェフ付きの完全プライベートリゾート。",        tags:JSON.stringify(["専任シェフ","バレルバス","サウナ","9,000坪"]),        page_url:"/tapkop",   status:"open",  open_from:null,        sort_order:1,  score:5, region:"hokkaido mountain", min_nights:1,  max_guests:12, area_sqm:300,  land_sqm:29752,  lat:43.5007, lng:144.4649, video:null },
    { slug:"kumaushi",      name:"KUMAUSHI BASE",          location:"北海道 弟子屈町 · 熊牛原野",         price:4800000,  stay_price:80000,  nights:30, units:20,  mgmt:80000,   airbnb_price:100000, beds24_prop:0,      beds24_room:0,      img:"kumaushi_aerial_dawn.webp",         desc:"プール・サウナ・バー・柔術道場。アクティブなコミュニティリゾート。9月グランドオープン予定。",  tags:JSON.stringify(["プール","サウナ","バー","DJ","柔術"]),                 page_url:"/kumaushi", status:"soon",  open_from:"2026-09-01", sort_order:2,  score:5, region:"hokkaido mountain", min_nights:1,  max_guests:30, area_sqm:500,  land_sqm:10000,  lat:43.3958, lng:144.4012, video:"kumaushi_wide_web.mp4" },
    { slug:"lodge",         name:"THE LODGE",              location:"北海道 弟子屈町 · 美留和",           price:4900000,  stay_price:35000,  nights:30, units:10,  mgmt:100000,  airbnb_price:52000,  beds24_prop:243408, beds24_room:512693, img:"lodge_exterior_snow.webp",          desc:"天然温泉pH9.2。森に溶け込むログキャビンで、非日常のひとときを。",                       tags:JSON.stringify(["天然温泉 pH9.2","露天風呂","薪ストーブ","BBQ"]),       page_url:"/lodge",    status:"open",  open_from:null,        sort_order:3,  score:4, region:"hokkaido mountain", min_nights:1,  max_guests:8,  area_sqm:120,  land_sqm:2000,   lat:43.5197, lng:144.4621, video:null },
    { slug:"nesting",       name:"NESTING",                location:"北海道 弟子屈町 · 美留和の森",       price:8900000,  stay_price:38000,  nights:30, units:10,  mgmt:150000,  airbnb_price:44000,  beds24_prop:243409, beds24_room:512694, img:"nesting_wide.webp",                 desc:"VUILD設計のデジタルファブリケーション建築。タワーサウナとジャグジーで体を整える。",         tags:JSON.stringify(["タワーサウナ","ジャグジー","暖炉","デジタルファブ"]),   page_url:"/nesting",  status:"open",  open_from:null,        sort_order:4,  score:4, region:"hokkaido mountain", min_nights:1,  max_guests:6,  area_sqm:85,   land_sqm:500,    lat:43.5197, lng:144.4621, video:null },
    { slug:"atami",         name:"WHITE HOUSE 熱海",       location:"静岡県 熱海市 · オーシャンビュー",   price:19000000, stay_price:55000,  nights:36, units:6,   mgmt:500000,  airbnb_price:90000,  beds24_prop:243406, beds24_room:512691, img:"atami_sunset_ocean.webp",           desc:"相模湾を一望するガラス張りの白邸。東京から新幹線で45分の近さ。",                         tags:JSON.stringify(["オーシャンビュー","全面ガラス","新幹線45分","温泉"]),   page_url:"/atami",    status:"open",  open_from:null,        sort_order:5,  score:4, region:"mountain",          min_nights:1,  max_guests:10, area_sqm:160,  land_sqm:320,    lat:35.0840, lng:139.0750, video:null },
    { slug:"instant",       name:"インスタントハウス",     location:"北海道 弟子屈町 · 美留和",           price:1200000,  stay_price:25000,  nights:30, units:5,   mgmt:30000,   airbnb_price:32000,  beds24_prop:322965, beds24_room:671098, img:"instant_dome_snow.webp",            desc:"最小限の物で完全な生活。オフグリッド設計の次世代コンパクトハウス。",                       tags:JSON.stringify(["オフグリッド","コンパクト","即入居可","星空"]),         page_url:"/instant",  status:"open",  open_from:null,        sort_order:6,  score:3, region:"hokkaido mountain", min_nights:1,  max_guests:4,  area_sqm:32,   land_sqm:100,    lat:43.5197, lng:144.4621, video:null },
    { slug:"village",       name:"美留和ビレッジ",         location:"北海道 弟子屈町 · 美留和",           price:4900000,  stay_price:30000,  nights:30, units:100, mgmt:80000,   airbnb_price:38000,  beds24_prop:0,      beds24_room:0,      img:"village_aerial.webp",               desc:"100区画の広大なコミュニティ。自然農・薪ストーブ・共同サウナ。9月グランドオープン予定。",   tags:JSON.stringify(["100区画","コミュニティ","広大な敷地","自然農"]),       page_url:"/village",  status:"soon",  open_from:"2026-09-01", sort_order:7,  score:3, region:"hokkaido mountain", min_nights:1,  max_guests:4,  area_sqm:50,   land_sqm:330000, lat:43.5197, lng:144.4621, video:null },
    { slug:"honolulu",      name:"HONOLULU BEACH VILLA",   location:"ハワイ州 ホノルル · 5827 Kalanianaʻole Hwy", price:28000000, stay_price:85000,  nights:30, units:8,   mgmt:400000,  airbnb_price:150000, beds24_prop:243407, beds24_room:0,      img:"property-honolulu.webp",            desc:"ハワイカイのビーチハウス。ハナウマ湾まで5分、ワイキキまで20分。複数オーナーでシェアしながら、年間30泊の優先滞在権を享受。", tags:JSON.stringify(["オーシャンビュー","プール","ラナイ","1ヶ月単位"]),    page_url:"/honolulu", status:"soon",  open_from:"2026-11-01", sort_order:8,  score:4, region:"sea",               min_nights:30, max_guests:12, area_sqm:260,  land_sqm:650,    lat:21.2822, lng:-157.7321,video:null },
    { slug:"maui",          name:"HAWAII KAI HOUSE",       location:"ハワイ州 ホノルル · ハワイカイ",     price:38000000, stay_price:120000, nights:30, units:6,   mgmt:600000,  airbnb_price:175000, beds24_prop:244738, beds24_room:0,      img:"pro_hawaii_hero.webp",              desc:"ハワイカイのビーチフロント平屋。波音が聞こえる絶景ロケーション。",                         tags:JSON.stringify(["ビーチフロント","オーシャンビュー","プライベート","1ヶ月単位"]), page_url:"/maui", status:"soon", open_from:"2026-11-01", sort_order:9, score:4, region:"sea", min_nights:30,  max_guests:10, area_sqm:210,  land_sqm:520,    lat:21.2890, lng:-157.6940,video:null },
    { slug:"hakuba-chalet", name:"白馬岩岳シャレー",       location:"長野県 白馬村 · 岩岳エリア",         price:19800000, stay_price:60000,  nights:40, units:6,   mgmt:300000,  airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"kumaushi_sips_exterior_winter.webp", desc:"外国人比率46%。「宿が断るしかない」と地元紙が報道したエリアに、1億円以下の高品質シャレー。",tags:JSON.stringify(["スキー","通年稼働","外国人◎","宿泊不足エリア"]),       page_url:"/hakuba-chalet",   status:"plan",  open_from:"2027-12-01", sort_order:10, score:5, region:"mountain",          min_nights:1,  max_guests:8,  area_sqm:130,  land_sqm:400,    lat:36.7025, lng:137.8716, video:null },
    { slug:"hakuba-kominka",name:"白馬八方古民家",         location:"長野県 白馬村 · 八方エリア",         price:9800000,  stay_price:50000,  nights:35, units:6,   mgmt:200000,  airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"hokkaido_akan_after.jpg",           desc:"スキーリゾート×日本伝統建築は世界で2〜3軒。八方尾根の冬季稼働率は既存ヴィラで9割超。",   tags:JSON.stringify(["スキー×古民家","八方尾根","外国人人気","伝統建築"]),   page_url:"/hakuba-kominka",  status:"plan",  open_from:"2028-01-01", sort_order:11, score:5, region:"mountain",          min_nights:1,  max_guests:10, area_sqm:160,  land_sqm:650,    lat:36.6992, lng:137.8635, video:null },
    { slug:"goto-beach",    name:"福江島高浜ビーチコテージ",location:"長崎県 五島市 · 福江島",            price:4900000,  stay_price:40000,  nights:30, units:5,   mgmt:80000,   airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"kussharo_sup.jpg",                  desc:"日本の渚百選1位・高浜ビーチに隣接。五島市観光客2年連続過去最高。高品質一棟貸しは皆無。",  tags:JSON.stringify(["渚百選1位","世界遺産","離島","最安値"]),               page_url:"/goto-beach",      status:"plan",  open_from:"2026-10-01", sort_order:12, score:4, region:"sea",               min_nights:1,  max_guests:8,  area_sqm:100,  land_sqm:300,    lat:32.6517, lng:128.7530, video:null },
    { slug:"tsugaike",      name:"栂池高原ガラス山荘",     location:"長野県 白馬村 · 栂池エリア",         price:14800000, stay_price:55000,  nights:40, units:5,   mgmt:250000,  airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"cabin_morning.webp",                desc:"来場者36万人・高品質宿ゼロの穴場エリア。高原植生とブナ林の絶景ガラス山荘。",             tags:JSON.stringify(["高原植生","ブナ林","スキー","白馬より割安"]),          page_url:"/tsugaike",        status:"plan",  open_from:"2027-12-01", sort_order:13, score:4, region:"mountain",          min_nights:1,  max_guests:8,  area_sqm:140,  land_sqm:450,    lat:36.7592, lng:137.8721, video:null },
    { slug:"nakadori",      name:"中通島 世界遺産古民家",  location:"長崎県 新上五島町 · 中通島",         price:5800000,  stay_price:35000,  nights:30, units:4,   mgmt:80000,   airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"wakayama_akiya_exterior.webp",      desc:"ユネスコ世界遺産・頭ヶ島天主堂至近。潜伏キリシタンの歴史と古民家の組み合わせは世界唯一。",tags:JSON.stringify(["世界遺産","潜伏キリシタン","古民家","超希少"]),         page_url:"/nakadori",        status:"plan",  open_from:"2027-06-01", sort_order:14, score:3, region:"sea",               min_nights:1,  max_guests:8,  area_sqm:130,  land_sqm:550,    lat:32.9927, lng:129.1140, video:null },
    { slug:"naru",          name:"奈留島プライベートヴィラ",location:"長崎県 五島市 · 奈留島",            price:4200000,  stay_price:30000,  nights:30, units:3,   mgmt:60000,   airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"kussharo_sup_morning.jpg",          desc:"競合施設ゼロの秘境島。「テレビにも雑誌にも出ない島」で過ごす、本物の孤島体験。",         tags:JSON.stringify(["競合ゼロ","秘境","離島","最安値候補"]),               page_url:"/naru",            status:"plan",  open_from:"2027-06-01", sort_order:15, score:3, region:"sea",               min_nights:1,  max_guests:6,  area_sqm:90,   land_sqm:310,    lat:32.7099, lng:128.8545, video:null },
    { slug:"kussharo",      name:"屈斜路ビレッジ",         location:"北海道 弟子屈町 · 釧路川沿い",       price:null,     stay_price:null,   nights:30, units:200, mgmt:null,    airbnb_price:null,   beds24_prop:0,      beds24_room:0,      img:"kussharo_sup.jpg",                  desc:"釧路川沿い3万坪。カルデラ源流の清流・地熱・白樺林に囲まれた次世代コミュニティビレッジ。",tags:JSON.stringify(["釧路川沿い","3万坪","カルデラ源流","地熱湧水"]),       page_url:"/kussharo",        status:"plan",  open_from:null,        sort_order:16, score:5, region:"hokkaido mountain", min_nights:1,  max_guests:8,  area_sqm:50,   land_sqm:99174,  lat:43.5488, lng:144.3945, video:null },
  ];
  for (const p of props) {
    await db.execute({
      sql: `INSERT OR REPLACE INTO soluna_properties
            (slug,name,location,price,stay_price,nights,units,mgmt,airbnb_price,beds24_prop,beds24_room,img,desc,tags,page_url,status,open_from,sort_order,score,region,min_nights,max_guests,area_sqm,land_sqm,lat,lng,video)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [p.slug,p.name,p.location,p.price,p.stay_price,p.nights,p.units,p.mgmt,p.airbnb_price,p.beds24_prop,p.beds24_room,p.img,p.desc,p.tags,p.page_url,p.status,p.open_from,p.sort_order,p.score,p.region,p.min_nights,p.max_guests,p.area_sqm,p.land_sqm,p.lat,p.lng,p.video],
    }).catch(() => {});
  }
  console.log("✓ soluna_properties seeded");
})();
// Indexes (idempotent — safe to run on every boot)
db.batch([
  "CREATE INDEX IF NOT EXISTS idx_sessions_token      ON soluna_sessions(token)",
  "CREATE INDEX IF NOT EXISTS idx_sessions_expires    ON soluna_sessions(expires_at)",
  "CREATE INDEX IF NOT EXISTS idx_otps_email          ON soluna_otps(email, expires_at)",
  "CREATE INDEX IF NOT EXISTS idx_bookings_prop_dates ON soluna_bookings(property_slug, check_in, check_out)",
  "CREATE INDEX IF NOT EXISTS idx_purchases_member    ON soluna_purchases(member_id)",
  "CREATE INDEX IF NOT EXISTS idx_chat_logs_member    ON soluna_chat_logs(member_id)",
]).catch(e => console.error("index creation error:", e));
// Migration: add nah_access column if not exists
// Page view logs for manufacturing pages
db.execute(`CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
)`).catch(() => {});

db.execute(`CREATE TABLE IF NOT EXISTS soluna_page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,
  email TEXT,
  page TEXT NOT NULL,
  ip TEXT,
  ua TEXT,
  viewed_at TEXT DEFAULT (datetime('now'))
)`).catch(() => {});
db.execute("ALTER TABLE soluna_members ADD COLUMN nah_access INTEGER DEFAULT 0").catch(() => {});
db.execute("ALTER TABLE soluna_members ADD COLUMN member_type TEXT DEFAULT 'member'").catch(() => {});
db.execute("ALTER TABLE soluna_purchases ADD COLUMN ref_code TEXT").catch(() => {});
db.execute("ALTER TABLE soluna_members ADD COLUMN line_user_id TEXT").catch(() => {});
db.execute(`CREATE TABLE IF NOT EXISTS soluna_community_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  display_name TEXT NOT NULL,
  member_type TEXT DEFAULT 'member',
  message TEXT NOT NULL,
  is_ai INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
)`).catch(() => {});
db.execute(`CREATE TABLE IF NOT EXISTS soluna_chat_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER,
  email TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
)`).catch(() => {});
db.execute("ALTER TABLE soluna_community_messages ADD COLUMN reply_to_id INTEGER").catch(() => {});
db.execute("ALTER TABLE soluna_community_messages ADD COLUMN reply_preview TEXT").catch(() => {});
db.execute("ALTER TABLE soluna_community_messages ADD COLUMN image_url TEXT").catch(() => {});
db.execute("ALTER TABLE soluna_community_messages ADD COLUMN deleted INTEGER DEFAULT 0").catch(() => {});
db.execute("ALTER TABLE soluna_properties ADD COLUMN max_guests INTEGER DEFAULT 8").catch(() => {});
db.execute("ALTER TABLE soluna_properties ADD COLUMN area_sqm REAL").catch(() => {});
db.execute("ALTER TABLE soluna_properties ADD COLUMN land_sqm REAL").catch(() => {});
db.execute("ALTER TABLE soluna_properties ADD COLUMN lat REAL").catch(() => {});
db.execute("ALTER TABLE soluna_properties ADD COLUMN lng REAL").catch(() => {});
db.execute("ALTER TABLE soluna_properties ADD COLUMN video TEXT").catch(() => {});
// Voice memo table
db.execute(`CREATE TABLE IF NOT EXISTS soluna_voice_memos (
  id TEXT PRIMARY KEY,
  member_id INTEGER,
  email TEXT,
  filename TEXT NOT NULL,
  duration_sec REAL,
  share_type TEXT NOT NULL DEFAULT 'self',
  playback_type TEXT NOT NULL DEFAULT 'unlimited',
  play_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
)`).catch(() => {});
// Seed: ensure admin email is a member and has NAH owner access
(async () => {
  const OWNER_EMAIL = "mail@yukihamada.jp";
  await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email) VALUES (?)", args: [OWNER_EMAIL] }).catch(() => {});
  await db.execute({ sql: "UPDATE soluna_members SET nah_access=1 WHERE email=?", args: [OWNER_EMAIL] }).catch(() => {});
  await db.execute({ sql: "UPDATE soluna_members SET member_type='admin' WHERE email=?", args: [OWNER_EMAIL] });
})();

// ── Property documents vault ──────────────────────────────────────────────────
db.execute(`CREATE TABLE IF NOT EXISTS property_documents (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL,
  title        TEXT NOT NULL,
  doc_type     TEXT NOT NULL DEFAULT 'contract',
  s3_key       TEXT NOT NULL,
  filename     TEXT NOT NULL,
  content_type TEXT DEFAULT 'application/pdf',
  file_size    INTEGER DEFAULT 0,
  uploaded_by  TEXT,
  is_listed    INTEGER DEFAULT 1,
  created_at   TEXT DEFAULT (datetime('now'))
)`).catch(() => {});
db.execute(`CREATE TABLE IF NOT EXISTS document_disclosures (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_id     INTEGER NOT NULL,
  email      TEXT NOT NULL,
  granted_by TEXT NOT NULL,
  granted_at TEXT DEFAULT (datetime('now')),
  UNIQUE(doc_id, email)
)`).catch(() => {});

db.execute(`CREATE TABLE IF NOT EXISTS project_emails (
  id           TEXT PRIMARY KEY,
  project      TEXT NOT NULL,
  from_email   TEXT NOT NULL,
  to_email     TEXT NOT NULL,
  subject      TEXT,
  body_text    TEXT,
  message_id   TEXT,
  reply_text   TEXT,
  reply_sent   INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
)`).catch(() => {});

const SOLUNA_PROPERTIES = {
  tapkop:  { name: "TAPKOP",              slug: "tapkop",   nights: 30, units:  5, price: 80000000, mgmt: 1200000, stay_price: 340000, book_via_inquiry: true, beds24_prop: 0,      beds24_room: 0,      page_url: "/tapkop",   location: "北海道 弟子屈町 · 阿寒摩周国立公園", tags: ["専任シェフ","バレルバス","サウナ","9,000坪"],        img: "tapkop_real1.webp",                  desc: "PAN-PROJECTS設計。9,000坪の森の中、専任シェフ付きの完全プライベートリゾート。" },
  lodge:   { name: "THE LODGE",           slug: "lodge",    nights: 30, units: 10, price:  4900000, mgmt:  100000, stay_price:  35000, airbnb_price:  52000, beds24_prop: 243408, beds24_room: 512693, page_url: "/lodge",    location: "北海道 弟子屈町 · 美留和",             tags: ["天然温泉 pH9.2","露天風呂","薪ストーブ","BBQ"],      img: "property-teshikaga.webp",            desc: "天然温泉pH9.2。森に溶け込むログキャビンで、非日常のひとときを。" },
  nesting: { name: "NESTING",             slug: "nesting",  nights: 30, units: 10, price:  8900000, mgmt:  150000, stay_price:  38000, airbnb_price:  44000, beds24_prop: 243409, beds24_room: 512694, page_url: "/nesting",  location: "北海道 弟子屈町 · 美留和の森",         tags: ["タワーサウナ","ジャグジー","暖炉","デジタルファブ"],  img: "nesting_exterior.webp",                 desc: "VUILD設計のデジタルファブリケーション建築。タワーサウナとジャグジーで体を整える。" },
  instant: { name: "インスタントハウス",   slug: "instant",  nights: 30, units:  5, price:  1200000, mgmt:   30000, stay_price:  25000, airbnb_price:  32000, beds24_prop: 322965, beds24_room: 671098, page_url: "/instant",  location: "北海道 弟子屈町 · 美留和",             tags: ["オフグリッド","コンパクト","即入居可","星空"],        img: "instant_dome_snow.webp",    desc: "最小限の物で完全な生活。オフグリッド設計の次世代コンパクトハウス。" },
  atami:   { name: "WHITE HOUSE 熱海",    slug: "atami",    nights: 36, units:  6, price: 19000000, mgmt:  500000, stay_price:  55000, airbnb_price:  90000, beds24_prop: 243406, beds24_room: 512691, page_url: "/atami",    location: "静岡県 熱海市 · オーシャンビュー",      tags: ["オーシャンビュー","全面ガラス","新幹線45分","温泉"],  img: "property-atami.webp",                desc: "相模湾を一望するガラス張りの白邸。東京から新幹線で45分の近さ。" },
  kumaushi:{ name: "KUMAUSHI BASE",       slug: "kumaushi", nights: 30, units: 20, price:  4800000, mgmt:   80000, stay_price:  80000, airbnb_price: 100000, beds24_prop: 0,      beds24_room: 0,      page_url: "/kumaushi", open_from: "2026-09-01", location: "北海道 弟子屈町 · 熊牛原野",          tags: ["プール","サウナ","バー","DJ","柔術"],                img: "kumaushi_aerial_dawn.webp",           desc: "プール・サウナ・バー・柔術道場。アクティブなコミュニティリゾート。9月グランドオープン予定。" },
  village: { name: "美留和ビレッジ",      slug: "village",  nights: 30, units:100, price:  4900000, mgmt:   80000, stay_price:  30000, airbnb_price:  38000, beds24_prop: 0,      beds24_room: 0,      page_url: "/village",  open_from: "2026-09-01", location: "北海道 弟子屈町 · 美留和",            tags: ["100区画","コミュニティ","広大な敷地","自然農"],       img: "village_aerial.webp",                desc: "100区画の広大なコミュニティ。自然農・薪ストーブ・共同サウナ。9月グランドオープン予定。" },
  honolulu:{ name: "HONOLULU BEACH VILLA", slug: "honolulu", nights: 30, units:  8, price: 28000000, mgmt:  400000, stay_price:  85000, airbnb_price: 150000, cleaning_fee: 150000, beds24_prop: 243407, beds24_room: 0,      page_url: "/honolulu", min_nights: 30, open_from: "2026-11-01", location: "ハワイ州 ホノルル · 5827 Kalanianaʻole Hwy", tags: ["オーシャンビュー","プール","ラナイ","共同所有","1ヶ月単位"],      img: "property-honolulu.webp",             desc: "ハワイカイのビーチハウス。ハナウマ湾まで5分、ワイキキまで20分。チェックイン15:00〜22:00、チェックアウト11:00。" },
  maui:    { name: "HAWAII KAI HOUSE",   slug: "maui",     nights: 30, units:  6, price: 38000000, mgmt:  600000, stay_price: 120000, airbnb_price: 175000, cleaning_fee: 150000, beds24_prop: 244738, beds24_room: 0,      page_url: null, min_nights: 30, open_from: "2026-11-01", location: "ハワイ州 ホノルル · ハワイカイ",       tags: ["ビーチフロント","オーシャンビュー","プライベート","1ヶ月単位"],   img: "pro_hawaii_hero.webp",               desc: "ハワイカイのビーチフロント平屋。波音が聞こえる絶景ロケーション。共同所有で持つ、世界最高クラスのヴァケーション体験。11月グランドオープン予定。" },
};

// GET /api/soluna/properties — active/soon properties from DB (fallback to SOLUNA_PROPERTIES)
app.get("/api/soluna/properties", async (req, res) => {
  try {
    const rows = await db.execute(`
      SELECT p.*,
        (p.units - COALESCE(sold.cnt,0)) AS remaining_units
      FROM soluna_properties p
      LEFT JOIN (
        SELECT property_slug, COUNT(*) AS cnt
        FROM soluna_purchases WHERE status='confirmed'
        GROUP BY property_slug
      ) sold ON sold.property_slug = p.slug
      WHERE p.status IN ('open','soon')
      ORDER BY p.sort_order
    `);
    return res.json(rows.rows.map(r => ({ ...r, tags: JSON.parse(r.tags||"[]") })));
  } catch (e) {
    console.error("properties DB error:", e);
    res.json(Object.values(SOLUNA_PROPERTIES));
  }
});

// GET /api/soluna/properties/all — all properties including plan/candidate from DB
app.get("/api/soluna/properties/all", async (req, res) => {
  try {
    const rows = await db.execute(`
      SELECT p.*,
        (p.units - COALESCE(sold.cnt,0)) AS remaining_units
      FROM soluna_properties p
      LEFT JOIN (
        SELECT property_slug, COUNT(*) AS cnt
        FROM soluna_purchases WHERE status='confirmed'
        GROUP BY property_slug
      ) sold ON sold.property_slug = p.slug
      ORDER BY p.sort_order
    `);
    return res.json(rows.rows.map(r => ({ ...r, tags: JSON.parse(r.tags||"[]") })));
  } catch (e) {
    console.error("properties/all DB error:", e);
    res.status(500).json({ error: "db error" });
  }
});

// POST /api/soluna/stay — direct booking request (status: pending, admin confirms)
app.post("/api/soluna/stay", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { slug, check_in, check_out } = req.body;
  const guests = Math.max(1, Math.min(30, Number(req.body.guests) || 2));
  const notes = stripTags((req.body.notes || "").trim().slice(0, 500));
  if (!slug || !check_in || !check_out) return res.status(400).json({ error: "missing fields" });
  const prop = SOLUNA_PROPERTIES[slug];
  if (!prop) return res.status(404).json({ error: "property not found" });
  const dateRe2 = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRe2.test(check_in) || !dateRe2.test(check_out)) return res.status(400).json({ error: "日付の形式が不正です（YYYY-MM-DD）" });
  const d_in2 = new Date(check_in), d_out2 = new Date(check_out);
  if (isNaN(d_in2) || isNaN(d_out2)) return res.status(400).json({ error: "日付が不正です" });
  const nights = Math.round((d_out2 - d_in2) / 86400000);
  if (nights <= 0 || nights > 90) return res.status(400).json({ error: "invalid dates (max 90 nights)" });
  // Overlap check
  const overlap = (await db.execute({
    sql: `SELECT id FROM soluna_bookings WHERE property_slug=? AND status IN ('confirmed','pending') AND check_in < ? AND check_out > ?`,
    args: [slug, check_out, check_in],
  })).rows;
  if (overlap.length > 0) return res.status(409).json({ error: "その日程は予約済みです" });
  await db.execute({
    sql: "INSERT INTO soluna_bookings (coupon_id,member_id,property_slug,check_in,check_out,nights,guests,status) VALUES (0,?,?,?,?,?,?,'pending')",
    args: [m.member_id, slug, check_in, check_out, nights, guests],
  });
  pushToBeds24(prop, check_in, check_out, guests, m.name, m.email).catch(() => {});
  if (RESEND_API_KEY) {
    const stayTotal = (prop.stay_price * nights).toLocaleString("ja-JP");
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: ["mail@yukihamada.jp"],
        subject: `【SOLUNA宿泊申込】${prop.name} ${check_in}〜${check_out}`,
        html: `<p>新しい宿泊申込が届きました。</p><table><tr><td>メール</td><td>${esc(m.email)}</td></tr><tr><td>物件</td><td>${esc(prop.name)}</td></tr><tr><td>チェックイン</td><td>${esc(check_in)}</td></tr><tr><td>チェックアウト</td><td>${esc(check_out)}</td></tr><tr><td>泊数</td><td>${nights}泊</td></tr><tr><td>人数</td><td>${guests}名</td></tr><tr><td>宿泊料金目安</td><td>¥${stayTotal}</td></tr><tr><td>備考</td><td>${esc(notes)||"なし"}</td></tr></table>`,
      }),
    }).catch(() => {});
    // Confirmation email to guest
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: [m.email],
        subject: `【SOLUNA】${prop.name} 宿泊申込を受け付けました`,
        html: `<p>${esc(m.name||m.email)} 様</p><p>以下の宿泊申込を受け付けました。24時間以内にお支払い方法のご案内をお送りします。</p><table><tr><td>物件</td><td>${esc(prop.name)}</td></tr><tr><td>チェックイン</td><td>${esc(check_in)}</td></tr><tr><td>チェックアウト</td><td>${esc(check_out)}</td></tr><tr><td>泊数</td><td>${nights}泊</td></tr><tr><td>人数</td><td>${guests}名</td></tr></table><p>ご不明な点はinfo@solun.artまでお気軽にどうぞ。</p><p>— SOLUNA チーム</p>`,
      }),
    }).catch(() => {});
  }
  const newBooking = (await db.execute({ sql: "SELECT last_insert_rowid() as id", args: [] })).rows[0];
  const bookingId = Number(newBooking?.id || 0);
  res.json({ ok: true, booking_id: bookingId, property: prop.name, check_in, check_out, nights, status: "pending" });
});

// POST /api/tapkop/inquiry — TAPKOP booking inquiry (no Beds24, email to admin)
app.post("/api/tapkop/inquiry", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { check_in, check_out } = req.body;
  const guests = Math.max(1, Math.min(30, Number(req.body.guests) || 2));
  const notes = stripTags((req.body.notes || "").trim().slice(0, 500));
  if (!check_in || !check_out) return res.status(400).json({ error: "missing fields" });
  const nights = Math.round((new Date(check_out) - new Date(check_in)) / 86400000);
  if (nights <= 0 || nights > 90) return res.status(400).json({ error: "invalid dates (max 90 nights)" });
  await db.execute({
    sql: "INSERT INTO soluna_bookings (coupon_id,member_id,property_slug,check_in,check_out,nights,guests,status) VALUES (0,?,?,?,?,?,?,'pending')",
    args: [m.member_id, "tapkop", check_in, check_out, nights, guests],
  });
  const total = (340000 * nights).toLocaleString("ja-JP");
  if (RESEND_API_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>", to: ["mail@yukihamada.jp"],
        subject: `【TAPKOP滞在お問い合わせ】${check_in}〜${check_out}`,
        html: `<p>TAPKOPへの滞在問い合わせ</p><table><tr><td>メール</td><td>${esc(m.email)}</td></tr><tr><td>チェックイン</td><td>${esc(check_in)}</td></tr><tr><td>チェックアウト</td><td>${esc(check_out)}</td></tr><tr><td>泊数</td><td>${nights}泊</td></tr><tr><td>人数</td><td>${guests}名</td></tr><tr><td>料金目安</td><td>¥${total}</td></tr><tr><td>備考</td><td>${esc(notes)||"なし"}</td></tr></table>`,
      }),
    }).catch(() => {});
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>", to: [m.email],
        subject: "【TAPKOP】滞在お問い合わせを受け付けました",
        html: `<p>${esc(m.name||m.email)} 様</p><p>TAPKOPへのお問い合わせありがとうございます。内容確認後48時間以内にご連絡いたします。</p><table><tr><td>チェックイン</td><td>${esc(check_in)}</td></tr><tr><td>チェックアウト</td><td>${esc(check_out)}</td></tr><tr><td>泊数</td><td>${nights}泊</td></tr></table><p>— SOLUNA チーム</p>`,
      }),
    }).catch(() => {});
  }
  res.json({ ok: true, inquiry: true });
});

// POST /api/soluna/stay/checkout — Stripe Checkout session for stay payment (JPY)
app.post("/api/soluna/stay/checkout", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  if (!STRIPE_SECRET_KEY) return res.status(503).json({ error: "Payment not configured" });
  const { booking_id } = req.body;
  const booking = (await db.execute({
    sql: "SELECT * FROM soluna_bookings WHERE id=? AND member_id=? AND status='pending'",
    args: [booking_id, m.member_id],
  })).rows[0];
  if (!booking) return res.status(404).json({ error: "booking not found" });
  const prop = SOLUNA_PROPERTIES[booking.property_slug];
  if (!prop || prop.book_via_inquiry) return res.status(400).json({ error: "not payable online" });
  const stripe = require("stripe")(STRIPE_SECRET_KEY);
  const nights = booking.nights;
  const lineItems = [{
    price_data: { currency: "jpy", product_data: { name: `${prop.name} ${booking.check_in}〜${booking.check_out}` }, unit_amount: prop.stay_price },
    quantity: nights,
  }];
  if (prop.cleaning_fee) {
    lineItems.push({
      price_data: { currency: "jpy", product_data: { name: "清掃費" }, unit_amount: prop.cleaning_fee },
      quantity: 1,
    });
  }
  const origin = `${req.protocol}://${req.headers.host}`;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${origin}/app?payment=success&booking_id=${booking.id}`,
    cancel_url: `${origin}/app?payment=cancelled&booking_id=${booking.id}`,
    customer_email: m.email,
    metadata: { booking_id: String(booking.id) },
  });
  res.json({ url: session.url });
});

// GET /api/soluna/stay/confirm — confirm booking after Stripe payment
app.get("/api/soluna/stay/confirm", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { booking_id } = req.query;
  if (!booking_id) return res.status(400).json({ error: "missing booking_id" });
  await db.execute({
    sql: "UPDATE soluna_bookings SET status='confirmed' WHERE id=? AND member_id=? AND status='pending'",
    args: [booking_id, m.member_id],
  });
  const booking = (await db.execute({
    sql: "SELECT * FROM soluna_bookings WHERE id=?",
    args: [booking_id],
  })).rows[0];
  if (booking) {
    const prop = SOLUNA_PROPERTIES[booking.property_slug] || {};
    if (RESEND_API_KEY) {
      fetch("https://api.resend.com/emails", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA <info@solun.art>", to: [m.email],
          subject: `【SOLUNA】${prop.name||''} 予約確定`,
          html: `<p>${m.name||m.email} 様</p><p>お支払いが完了し、予約が確定しました。</p><table><tr><td>物件</td><td>${prop.name||booking.property_slug}</td></tr><tr><td>チェックイン</td><td>${booking.check_in}</td></tr><tr><td>チェックアウト</td><td>${booking.check_out}</td></tr><tr><td>泊数</td><td>${booking.nights}泊</td></tr></table><p>チェックイン前日にドアコードをお送りします。— SOLUNA チーム</p>`,
        }),
      }).catch(() => {});
    }
  }
  res.json({ ok: true, confirmed: true });
});

// POST /api/soluna/promo — redeem promo code → issue TAPKOP+NESTING coupons
const SOLUNA_PROMO_CODES = {
  "TAPKOP2026":  { tapkop: 3, valid_days: 365 },
  "NESTING2026": { nesting: 3, valid_days: 365 },
  "CABIN2026":   { tapkop: 2, nesting: 2, valid_days: 365 },
};
app.post("/api/soluna/promo", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "missing code" });
  const promo = SOLUNA_PROMO_CODES[code.trim().toUpperCase()];
  if (!promo) return res.status(404).json({ error: "無効なコードです" });
  // Check already redeemed
  const existing = (await db.execute({
    sql: "SELECT id FROM soluna_coupons WHERE member_id=? AND code=?",
    args: [m.member_id, code.trim().toUpperCase()],
  })).rows;
  if (existing.length > 0) return res.status(409).json({ error: "このコードは既に使用済みです" });
  const valid_until = new Date(Date.now() + promo.valid_days * 86400000).toISOString().slice(0, 10);
  const issued = [];
  for (const [slug, nights] of Object.entries(promo).filter(([k]) => k !== "valid_days")) {
    await db.execute({
      sql: "INSERT INTO soluna_coupons (code, member_id, property_slug, nights_total, nights_used, valid_until) VALUES (?,?,?,?,0,?)",
      args: [code.trim().toUpperCase(), m.member_id, slug, nights, valid_until],
    });
    issued.push({ slug, nights, valid_until });
  }
  res.json({ ok: true, issued });
});

// ── Cookie helper (no external dep needed) ──────────────────────────────────
function parseCookies(req) {
  const list = {};
  const h = req.headers.cookie;
  if (!h) return list;
  h.split(";").forEach(c => {
    const [k, ...v] = c.split("=");
    const name = (k || "").trim();
    if (name) list[name] = decodeURIComponent(v.join("=").trim());
  });
  return list;
}

async function solunaAuth(req) {
  const cookieToken = parseCookies(req).sln_tok || "";
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim() || cookieToken;
  if (!token) return null;
  const r = await db.execute({
    sql: `SELECT s.member_id, m.email, m.name, m.nah_access, m.member_type FROM soluna_sessions s
          JOIN soluna_members m ON m.id = s.member_id
          WHERE s.token = ? AND s.expires_at > datetime('now')`,
    args: [token],
  });
  const row = r.rows[0];
  if (!row) return null;

  // 特殊ロール（admin/founder/friend/cleaner/construction）はそのまま
  const SPECIAL = ["admin","founder","friend","cleaner","construction"];
  if (!SPECIAL.includes(row.member_type)) {
    try {
      const purchases = await db.execute({
        sql: "SELECT 1 FROM soluna_purchases WHERE member_id=? AND status='confirmed' LIMIT 1",
        args: [row.member_id],
      });
      if (purchases.rows.length > 0) {
        row.member_type = "owner";
      } else {
        const coupons = await db.execute({
          sql: "SELECT 1 FROM soluna_coupons WHERE member_id=? AND nights_used < nights_total LIMIT 1",
          args: [row.member_id],
        });
        if (coupons.rows.length > 0) row.member_type = "guest";
      }
    } catch (_) { /* ロール判定失敗時は既存のmember_typeを維持 */ }
  }
  return row;
}

// POST /api/track — lightweight KPI event ingestion (no auth required, beacon-friendly)
app.post("/api/track", express.json(), async (req, res) => {
  res.status(204).end(); // respond immediately so sendBeacon doesn't block
  try {
    const { e, p, s, m, d } = req.body || {};
    if (!e || typeof e !== "string") return;
    await db.execute({
      sql: "INSERT INTO soluna_events (event, page, session_id, email, properties, ip) VALUES (?,?,?,?,?,?)",
      args: [e.slice(0,64), (p||"").slice(0,128), (s||null), (m||null), d ? JSON.stringify(d).slice(0,512) : null, req.ip||null],
    });
  } catch(_) {}
});

// GET /api/admin/kpi — funnel summary (admin only)
// ── API: Construction records (admin) ────────────────────────────────────────
app.get("/api/admin/construction/:type", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({ error: "unauthorized" });
  try {
    const { type } = req.params;
    const rows = await db.execute({ sql: "SELECT id, data, updated_at FROM construction_records WHERE type = ? ORDER BY updated_at DESC", args: [type] });
    res.json(rows.rows.map(r => ({ id: r.id, ...JSON.parse(r.data), updated_at: r.updated_at })));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/admin/construction/:type", express.json(), async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({ error: "unauthorized" });
  try {
    const { type } = req.params;
    const { id, ...data } = req.body;
    if (!id) return res.status(400).json({ error: "id required" });
    await db.execute({ sql: "INSERT OR REPLACE INTO construction_records (id, type, data, updated_at) VALUES (?, ?, ?, datetime('now'))", args: [id, type, JSON.stringify(data)] });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.patch("/api/admin/construction/:type/:id", express.json(), async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({ error: "unauthorized" });
  try {
    const { type, id } = req.params;
    const row = await db.execute({ sql: "SELECT data FROM construction_records WHERE type = ? AND id = ?", args: [type, id] });
    const existing = row.rows[0] ? JSON.parse(row.rows[0].data) : {};
    const merged = { ...existing, ...req.body };
    await db.execute({ sql: "INSERT OR REPLACE INTO construction_records (id, type, data, updated_at) VALUES (?, ?, ?, datetime('now'))", args: [id, type, JSON.stringify(merged)] });
    res.json({ ok: true, data: merged });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/admin/construction/:type/:id", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({ error: "unauthorized" });
  try {
    const { type, id } = req.params;
    await db.execute({ sql: "DELETE FROM construction_records WHERE type = ? AND id = ?", args: [type, id] });
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/admin/kpi", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(401).json({ error: "unauthorized" });
  const days = Math.min(parseInt(req.query.days||"30"), 365);
  const since = `-${days}`;
  try {
    const [events, emails, members, consults] = await Promise.all([
      db.execute({ sql: `SELECT event, page, COUNT(*) cnt, COUNT(DISTINCT session_id) uniq FROM soluna_events WHERE created_at > datetime('now', ? || ' days') GROUP BY event, page ORDER BY cnt DESC LIMIT 80`, args: [since] }),
      db.execute({ sql: `SELECT COUNT(*) cnt FROM email_signups WHERE created_at > datetime('now', ? || ' days')`, args: [since] }),
      db.execute({ sql: `SELECT COUNT(*) cnt FROM soluna_members WHERE created_at > datetime('now', ? || ' days')`, args: [since] }),
      db.execute({ sql: `SELECT event, COUNT(*) cnt, COUNT(DISTINCT session_id) uniq FROM soluna_events WHERE event IN ('consultation_click','gate_unlock','purchase_click','app_login','email_signup') AND created_at > datetime('now', ? || ' days') GROUP BY event`, args: [since] }),
    ]);
    res.json({ days, events: events.rows, funnel: consults.rows, new_emails: emails.rows[0]?.cnt||0, new_members: members.rows[0]?.cnt||0 });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// GET /api/soluna/admin/dashboard — real-time funnel for app admin screen (session auth + admin type)
app.get("/api/soluna/admin/dashboard", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.query.token;
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    const sess = await db.execute({ sql: "SELECT member_id FROM soluna_sessions WHERE token=? AND expires_at>datetime('now')", args: [token] });
    if (!sess.rows.length) return res.status(401).json({ error: "unauthorized" });
    const memberId = sess.rows[0].member_id;
    const mem = await db.execute({ sql: "SELECT email, member_type FROM soluna_members WHERE id=?", args: [memberId] });
    const m = mem.rows[0];
    if (!m || m.member_type !== "admin") return res.status(403).json({ error: "forbidden" });

    const [funnel, recentMembers, recentConsults, recentPurchases] = await Promise.all([
      db.execute({ sql: `SELECT event, COUNT(*) cnt, COUNT(DISTINCT session_id) uniq FROM soluna_events WHERE created_at > datetime('now', '-30 days') GROUP BY event ORDER BY cnt DESC LIMIT 30` }),
      db.execute({ sql: `SELECT id, email, name, member_type, created_at FROM soluna_members ORDER BY created_at DESC LIMIT 30` }),
      db.execute({ sql: `SELECT email, properties, data, created_at FROM soluna_events WHERE event='consultation_submit' ORDER BY created_at DESC LIMIT 20` }),
      db.execute({ sql: `SELECT m.email, p.property_slug, p.units, p.price_yen, p.status, p.created_at FROM soluna_purchases p JOIN soluna_members m ON m.id=p.member_id ORDER BY p.created_at DESC LIMIT 20` }),
    ]);

    // Proxy enabler-analytics PV for solun.art
    let pv = null;
    try {
      const r = await fetch("https://enabler-analytics.fly.dev/api/stats?days=30&site=solun.art");
      pv = await r.json();
    } catch(_) {}

    res.json({ funnel: funnel.rows, members: recentMembers.rows, consultations: recentConsults.rows, purchases: recentPurchases.rows, pv });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// POST /api/soluna/akiya-signup — email gate for akiya pages; auto-creates member + sends magic login link
app.post("/api/soluna/akiya-signup", express.json(), async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const source = (req.body.source || "kagawa-akiya").slice(0, 64);
  if (!email.includes("@") || email.length > 254) return res.status(400).json({ error: "invalid email" });
  try {
    await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email) VALUES (?)", args: [email] });
    // 7-day OTP as magic link code (longer than usual)
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.execute({ sql: "INSERT INTO soluna_otps (email,code,expires_at) VALUES (?,?,?)", args: [email, code, exp] });
    // Record in email_signups too
    await db.execute({ sql: "INSERT OR IGNORE INTO email_signups (email, locale) VALUES (?,?)", args: [email, "ja"] }).catch(() => {});
    const loginUrl = `https://solun.art/app?email=${encodeURIComponent(email)}&code=${code}&from=${encodeURIComponent(source)}`;
    if (RESEND_API_KEY) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA <info@solun.art>",
          to: [email],
          subject: source === 'zamna'
            ? "ZAMNA × SOLUNA FEST HAWAII 2026 — 先行登録完了"
            : source === 'hero' || source === 'index'
            ? "SOLUNA — 登録完了・共同所有の詳細はこちら"
            : "SOLUNA AKIYA CLUB — 登録完了・メンバーログイン",
          html: source === 'zamna' ? `<div style="font-family:sans-serif;background:#040404;color:#f0ece4;padding:40px 32px;max-width:520px;margin:0 auto">
  <div style="font-size:10px;letter-spacing:.34em;color:#c8a455;font-weight:700;margin-bottom:28px">ZAMNA × SOLUNA</div>
  <h1 style="font-size:24px;font-weight:800;letter-spacing:-.02em;margin:0 0 12px;line-height:1.2">先行登録、完了。<br/>チケット先行購入権を確保しました。</h1>
  <p style="font-size:13px;color:#666;line-height:2;margin:0 0 28px">2026年9月5日（土）<br/>Oahu, Hawaii · 限定300名</p>
  <div style="background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin-bottom:28px">
    <div style="font-size:10px;letter-spacing:.2em;color:#555;margin-bottom:12px">EVENT DETAILS</div>
    <div style="font-size:13px;color:#f0ece4;line-height:2">🎵 ZAMNA Collective（テクノ / EDM）<br/>🏝 Oahu, Hawaii<br/>👥 限定300名<br/>🏨 宿泊先：先行登録後にご案内</div>
  </div>
  <p style="font-size:13px;color:#888;line-height:1.8;margin:0 0 24px">詳細が決まり次第、先行登録者に最速でお知らせします。<br/>チケットは先行登録者のみ先行購入可能です。</p>
  <a href="${loginUrl}" style="display:inline-block;background:#c8a455;color:#040404;font-weight:800;font-size:13px;padding:16px 36px;border-radius:100px;text-decoration:none;letter-spacing:.04em">SOLUNAメンバーとしてログイン →</a>
  <p style="font-size:11px;color:#333;margin-top:16px">パスワード不要。有効期間7日間。</p>
  <p style="color:#1a1a1a;font-size:10px;margin-top:32px">© 2026 SOLUNA · EnablerDAO</p>
</div>` : `<div style="font-family:sans-serif;background:#040404;color:#f0ece4;padding:40px 32px;max-width:520px;margin:0 auto">
  <div style="font-size:10px;letter-spacing:.34em;color:#c8a455;font-weight:700;margin-bottom:28px">SOLUNA AKIYA CLUB</div>
  <h1 style="font-size:24px;font-weight:800;letter-spacing:-.02em;margin:0 0 12px;line-height:1.2">登録しました。<br/>最新情報をお届けします。</h1>
  <p style="font-size:13px;color:#666;line-height:2;margin:0 0 32px">香川・瀬戸内の空き家リノベ情報、新物件追加、説明会のご案内を<br/>いち早くお届けします。</p>
  <a href="${loginUrl}" style="display:inline-block;background:#4a8fc0;color:#fff;font-weight:800;font-size:13px;padding:16px 36px;border-radius:100px;text-decoration:none;letter-spacing:.04em">SOLUNAメンバーとしてログイン →</a>
  <p style="font-size:11px;color:#333;margin-top:16px;line-height:1.8">このボタンを押すと、メールアドレスで自動的にログインします。<br/>パスワード不要。有効期間 7日間。</p>
  <div style="margin-top:40px;padding-top:24px;border-top:1px solid #111">
    <div style="font-size:10px;letter-spacing:.2em;color:#333;margin-bottom:10px">CURRENT PROPERTIES</div>
    <div style="font-size:12px;color:#555;line-height:2">小豆島 RC Villa · 直島 古家 · 豊島 更地 · 三豊 茅葺 · さぬき 遍路古家<br/>高松 商店街 · 観音寺 ビジネス旅館 · 伊吹島 廃墟 · 全18物件</div>
    <a href="https://solun.art/kagawa-akiya" style="display:inline-block;margin-top:14px;font-size:11px;color:#4a8fc0;text-decoration:none;letter-spacing:.08em">物件ページを見る →</a>
  </div>
  <p style="color:#1a1a1a;font-size:10px;margin-top:32px">© 2026 SOLUNA · 株式会社イネブラ</p>
</div>`,
        }),
      }).catch(() => {});
      sendAdminEmail(`[SOLUNA] AKIYA登録 — ${email} (${source})`,
        `<p>AKIYAページからメール登録: ${email}<br/>ソース: ${source}</p>`);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/soluna/consultation — in-app consultation request (no mailto needed)
app.post("/api/soluna/consultation", express.json(), async (req, res) => {
  const { email, name, properties, message, source } = req.body;
  if (!email || !email.includes("@")) return res.status(400).json({ error: "invalid email" });
  try {
    await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email) VALUES (?)", args: [email] });
    const propList = Array.isArray(properties) ? properties.join(", ") : (properties || "");
    await sendAdminEmail(
      `[SOLUNA] 個別相談リクエスト — ${name || email} (${source || "unknown"})`,
      `<p><strong>メール:</strong> ${esc(email)}<br/><strong>名前:</strong> ${esc(name||"-")}<br/><strong>関心物件:</strong> ${esc(propList||"-")}<br/><strong>メッセージ:</strong> ${esc(message||"-")}<br/><strong>ソース:</strong> ${esc(source||"-")}</p><p><a href="mailto:${esc(email)}">返信する</a></p>`
    );
    // Confirmation email to the user
    if (RESEND_API_KEY) {
      const mlCode = String(Math.floor(100000 + Math.random() * 900000));
      const mlExp  = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await db.execute({ sql: "INSERT INTO soluna_otps (email,code,expires_at) VALUES (?,?,?)", args: [email, mlCode, mlExp] }).catch(()=>{});
      const loginUrl = `https://solun.art/app?email=${encodeURIComponent(email)}&code=${mlCode}`;
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA <info@solun.art>",
          to: [email],
          subject: "SOLUNA — 個別相談のリクエストを受け付けました",
          html: `<div style="font-family:sans-serif;background:#040404;color:#f0ece4;padding:40px 32px;max-width:520px;margin:0 auto">
  <div style="font-size:10px;letter-spacing:.34em;color:#c8a455;font-weight:700;margin-bottom:28px">SOLUNA</div>
  <h1 style="font-size:22px;font-weight:800;letter-spacing:-.02em;margin:0 0 12px">個別相談リクエストを<br/>受け付けました。</h1>
  <p style="font-size:13px;color:#666;line-height:2;margin:0 0 8px">メールを確認して、下のボタンからSOLUNAにログインしてください。物件詳細・空き状況・購入プランをご確認いただけます。</p>
  ${propList ? `<p style="font-size:12px;color:#444;margin:0 0 28px">関心物件: ${esc(propList)}</p>` : ""}
  <a href="${loginUrl}" style="display:inline-block;background:#4a8fc0;color:#fff;font-weight:800;font-size:13px;padding:14px 32px;border-radius:100px;text-decoration:none">SOLUNAメンバーとしてログイン →</a>
  <p style="font-size:10px;color:#333;margin-top:12px">パスワード不要。7日間有効。</p>
  <p style="color:#1a1a1a;font-size:10px;margin-top:32px">© 2026 SOLUNA · 株式会社イネブラ · mail@yukihamada.jp</p>
</div>`,
        }),
      }).catch(() => {});
    }
    // Track event
    await db.execute({ sql: "INSERT INTO soluna_events (event,page,email,properties) VALUES (?,?,?,?)", args: ["consultation_submit", source||"unknown", email, propList||null] }).catch(()=>{});
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/soluna/otp — send OTP
app.post("/api/soluna/otp", express.json(), async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  if (!email.includes("@") || email.length > 254) return res.status(400).json({ error: "invalid email" });
  // Rate limit: 3 attempts per 5 minutes
  if (!otpRateCheck(email)) return res.status(429).json({ error: "しばらく待ってから再度お試しください" });
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const exp = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await db.execute({ sql: "INSERT INTO soluna_otps (email,code,expires_at) VALUES (?,?,?)", args: [email, code, exp] });
  // ensure member row
  await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email) VALUES (?)", args: [email] });
  if (RESEND_API_KEY) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA <info@solun.art>",
          to: [email],
          subject: `${code} — SOLUNAログインコード`,
          html: (() => {
            const p = ARCH_PHILOSOPHIES[Math.floor(Math.random() * ARCH_PHILOSOPHIES.length)];
            return `<div style="font-family:sans-serif;background:#040404;color:#f0ece4;padding:40px;max-width:480px">
            <div style="font-size:11px;letter-spacing:.3em;color:#c8a455;margin-bottom:24px">SOLUNA CABIN CLUB</div>
            <div style="font-size:48px;font-weight:800;letter-spacing:.1em;color:#fff;margin-bottom:16px">${code}</div>
            <div style="font-size:13px;color:#666;line-height:2">ログインコードです。10分以内に入力してください。<br>このメールに心当たりがない場合は無視してください。</div>
            <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1a1a1a">
              <div style="font-size:13px;color:#c8a455;line-height:1.8;font-style:italic">&ldquo;${esc(p.quote)}&rdquo;</div>
              <div style="font-size:11px;color:#555;margin-top:8px;letter-spacing:.1em">— ${esc(p.author)}</div>
            </div>
          </div>`;
          })(),
        }),
      });
      if (!r.ok) throw new Error(`Resend ${r.status}`);
    } catch(e) {
      console.error("OTP email error:", e.message);
      return res.status(502).json({ error: "メール送信に失敗しました。しばらく後に再度お試しください。" });
    }
  }
  res.json({ ok: true });
});

// POST /api/soluna/verify — verify OTP, return session token
app.post("/api/soluna/verify", express.json(), async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const code  = (req.body.code  || "").trim();
  if (!email || !code) return res.status(400).json({ error: "missing fields" });
  const r = await db.execute({
    sql: `SELECT id FROM soluna_otps WHERE email=? AND code=? AND used=0 AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1`,
    args: [email, code],
  });
  if (!r.rows[0]) return res.status(401).json({ error: "コードが正しくないか期限切れです" });
  await db.execute({ sql: "UPDATE soluna_otps SET used=1 WHERE id=?", args: [r.rows[0].id] });
  const member = await db.execute({ sql: "SELECT id,email,name,nah_access FROM soluna_members WHERE email=?", args: [email] });
  const mid = member.rows[0].id;
  const token = crypto.randomBytes(32).toString("hex");
  const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  await db.execute({ sql: "INSERT INTO soluna_sessions (member_id,token,expires_at) VALUES (?,?,?)", args: [mid, token, exp] });
  // Also set HttpOnly cookie so manufacturing pages can check auth server-side
  res.cookie("sln_tok", token, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ token, email: member.rows[0].email, name: member.rows[0].name });
});

// GET /api/soluna/me — member info + purchases + coupons + bookings
app.get("/api/soluna/me", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const [purchases, coupons, bookings] = await Promise.all([
    db.execute({ sql: "SELECT * FROM soluna_purchases WHERE member_id=? ORDER BY id DESC", args: [m.member_id] }),
    db.execute({ sql: "SELECT * FROM soluna_coupons WHERE member_id=? ORDER BY id DESC", args: [m.member_id] }),
    db.execute({ sql: "SELECT * FROM soluna_bookings WHERE member_id=? ORDER BY check_in DESC", args: [m.member_id] }),
  ]);
  // normalize coupons: add nights_remaining, property_name, issued_at alias
  const normalizedCoupons = coupons.rows.map(c => ({
    ...c,
    nights_remaining: c.nights_total - (c.nights_used || 0),
    property_name: (SOLUNA_PROPERTIES[c.property_slug] || {}).name || c.property_slug,
    issued_at: c.created_at,
  }));
  // normalize bookings: rename check_in→checkin, add property_name
  const normalizedBookings = bookings.rows.map(b => ({
    ...b,
    checkin: b.check_in,
    checkout: b.check_out,
    property_name: (SOLUNA_PROPERTIES[b.property_slug] || {}).name || b.property_slug,
  }));
  // properties as array
  const propertiesArr = Object.values(SOLUNA_PROPERTIES);
  res.json({
    member: { id: m.member_id, email: m.email, name: m.name, nah_access: m.nah_access || 0, member_type: m.member_type || 'member' },
    purchases: purchases.rows,
    coupons: normalizedCoupons,
    bookings: normalizedBookings,
    properties: propertiesArr,
  });
});

// PATCH /api/soluna/me — update name
app.patch("/api/soluna/me", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const name = (req.body.name || "").trim().slice(0, 80);
  if (name) await db.execute({ sql: "UPDATE soluna_members SET name=? WHERE id=?", args: [name, m.member_id] });
  res.json({ ok: true });
});

// DELETE /api/soluna/me — 退会（soft delete: status='withdrawn'）
app.delete("/api/soluna/me", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { reason = "" } = req.body || {};

  // Soft delete: mark member as withdrawn, expire all sessions
  await db.execute({ sql: "UPDATE soluna_members SET member_type='withdrawn', name=COALESCE(name||' [退会]', '[退会]') WHERE id=?", args: [m.member_id] });
  await db.execute({ sql: "DELETE FROM soluna_sessions WHERE member_id=?", args: [m.member_id] });

  // Notify admin
  if (RESEND_API_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>", to: ["mail@yukihamada.jp"],
        subject: `【SOLUNA退会】${m.email}`,
        html: `<p>${m.email} が退会しました。</p><p>理由: ${reason || "未記入"}</p>`,
      }),
    }).catch(() => {});
  }
  if (TG_TOKEN && TG_CHAT) sendTg(TG_CHAT, `🚪 *退会* ${m.email}`).catch(() => {});
  res.json({ ok: true, message: "退会処理が完了しました。またいつでもお待ちしています。" });
});

// POST /api/soluna/booking/:id/cancel — 予約キャンセル
app.post("/api/soluna/booking/:id/cancel", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const bookingId = Number(req.params.id);
  const { reason = "" } = req.body || {};

  const booking = (await db.execute({
    sql: "SELECT * FROM soluna_bookings WHERE id=? AND member_id=?",
    args: [bookingId, m.member_id],
  })).rows[0];
  if (!booking) return res.status(404).json({ error: "予約が見つかりません" });
  if (booking.status === "cancelled") return res.status(400).json({ error: "すでにキャンセル済みです" });

  const checkIn = new Date(booking.check_in);
  const now = new Date();
  const daysUntil = Math.ceil((checkIn - now) / 86400000);

  // キャンセルポリシー: 7日前まで無料、以降は1泊分のキャンセル料
  const cancelFee = daysUntil < 7 ? (SOLUNA_PROPERTIES[booking.property_slug]?.stay_price || 0) : 0;
  const policy = daysUntil >= 7 ? "無料キャンセル" : `キャンセル料: ¥${cancelFee.toLocaleString()}（7日前以内）`;

  await db.execute({ sql: "UPDATE soluna_bookings SET status='cancelled' WHERE id=?", args: [bookingId] });

  // クーポン泊数を戻す
  if (booking.coupon_id) {
    await db.execute({
      sql: "UPDATE soluna_coupons SET nights_used=MAX(0,nights_used-?) WHERE id=?",
      args: [booking.nights, booking.coupon_id],
    });
  }

  // Beds24からもキャンセル（beds24_idがあれば）
  if (booking.beds24_id) {
    try {
      const token = await beds24GetToken();
      if (token) {
        await fetch(`https://api.beds24.com/v2/bookings/${booking.beds24_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", token },
          body: JSON.stringify({ status: "cancelled" }),
        });
      }
    } catch {}
  }

  const prop = SOLUNA_PROPERTIES[booking.property_slug] || {};

  // メール通知
  if (RESEND_API_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>", to: [m.email],
        subject: `【SOLUNA】${prop.name||''} 予約キャンセル完了`,
        html: `<p>${m.name||m.email} 様</p>
               <p>以下の予約をキャンセルしました。</p>
               <table><tr><td>物件</td><td>${prop.name||booking.property_slug}</td></tr>
               <tr><td>チェックイン</td><td>${booking.check_in}</td></tr>
               <tr><td>チェックアウト</td><td>${booking.check_out}</td></tr>
               <tr><td>${policy}</td></tr></table>
               <p>またのご利用をお待ちしています。— SOLUNA チーム</p>`,
      }),
    }).catch(() => {});
    // 管理者にも通知
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>", to: ["mail@yukihamada.jp"],
        subject: `【SOLUNA予約キャンセル】${m.email} — ${prop.name||''} ${booking.check_in}`,
        html: `<p>${m.email} が予約(ID:${bookingId})をキャンセルしました。</p><p>理由: ${reason||"未記入"}</p><p>${policy}</p>`,
      }),
    }).catch(() => {});
  }
  if (TG_TOKEN && TG_CHAT) sendTg(TG_CHAT, `❌ *予約キャンセル*\n${m.email}\n${prop.name||''} ${booking.check_in}〜${booking.check_out}\n${policy}`).catch(() => {});

  res.json({ ok: true, cancel_fee_yen: cancelFee, policy, message: `キャンセルが完了しました。${cancelFee > 0 ? `キャンセル料 ¥${cancelFee.toLocaleString()} が発生します。` : "無料キャンセルです。"}` });
});

// POST /api/soluna/purchase/:id/cancel — 購入申込キャンセル (pending のみ)
app.post("/api/soluna/purchase/:id/cancel", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const purchaseId = Number(req.params.id);
  const purchase = (await db.execute({
    sql: "SELECT * FROM soluna_purchases WHERE id=? AND member_id=? AND status='pending'",
    args: [purchaseId, m.member_id],
  })).rows[0];
  if (!purchase) return res.status(404).json({ error: "申込が見つかりません（確定済みはキャンセル不可）" });
  await db.execute({ sql: "UPDATE soluna_purchases SET status='cancelled' WHERE id=?", args: [purchaseId] });
  if (RESEND_API_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>", to: ["mail@yukihamada.jp"],
        subject: `【SOLUNA購入申込キャンセル】${m.email}`,
        html: `<p>${m.email} が購入申込(ID:${purchaseId})をキャンセルしました。</p>`,
      }),
    }).catch(() => {});
  }
  res.json({ ok: true, message: "購入申込をキャンセルしました。" });
});

// POST /api/koya/precut — SOLUNA KOYA プレカット発注
app.post("/api/koya/precut", express.json(), async (req, res) => {
  try {
    const b = req.body || {};
    const size    = String(b.size || "M").slice(0, 4);
    const qty     = String(b.qty || "1").slice(0, 6);
    const cert    = String(b.cert || "none").slice(0, 16);
    const region  = String(b.region || "hokkaido").slice(0, 12);
    const regionName = String(b.region_name || region).slice(0, 32);
    const timing  = String(b.timing || "asap").slice(0, 16);
    const total   = Number(b.quote_total) || 0;
    const org     = String(b.org || "").trim().slice(0, 200);
    const contact = String(b.contact || "").trim().slice(0, 80);
    const email   = String(b.email || "").trim().slice(0, 120);
    const phone   = String(b.phone || "").trim().slice(0, 32);
    const note    = String(b.note || "").trim().slice(0, 3000);

    if (!org || !contact || !email || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: "会社名・担当者・有効なemailは必須です" });
    }
    const certLabel = ({none:"未認定（一般）", builder:"認定工務店（−10%）", diy:"DIYオーナー", studio:"建築事務所"})[cert] || cert;
    const timingLabel = ({asap:"最短(3週間後)", "1m":"1ヶ月以内", "2m":"2ヶ月以内", "3m":"3ヶ月以内", undecided:"未定（仮見積）"})[timing] || timing;
    const orderRef = "PC-" + Date.now().toString(36).toUpperCase().slice(-6);

    if (RESEND_API_KEY) {
      const adminHtml = `
        <p><b>📦 KOYA プレカット発注 ${orderRef}</b></p>
        <ul>
          <li>サイズ: <b>SOLUNA KOYA — ${esc(size)}</b></li>
          <li>数量: ${esc(qty)} 棟</li>
          <li>認定区分: ${esc(certLabel)}</li>
          <li>納品先: ${esc(regionName)}</li>
          <li>希望時期: ${esc(timingLabel)}</li>
          <li>仮見積合計: <b>¥${total.toLocaleString()}</b></li>
        </ul>
        <p><b>発注者</b><br>会社/事務所: ${esc(org)}<br>担当: ${esc(contact)}<br>メール: ${esc(email)}<br>電話: ${esc(phone) || "—"}</p>
        ${note ? `<p><b>特記事項</b><br>${esc(note).replace(/\n/g,"<br>")}</p>` : ""}
        <hr><p>※ 3営業日以内に書面見積(PDF) + 請書を発行してください。<br><a href="https://solun.art/koya-precut">https://solun.art/koya-precut</a></p>`;
      fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${RESEND_API_KEY}`},
        body: JSON.stringify({
          from: "SOLUNA KOYA Pre-Cut <info@solun.art>",
          to:   ["mail@yukihamada.jp"],
          reply_to: email,
          subject: `【KOYA プレカット発注 ${orderRef}】${org} / ${size} ${qty}棟 / ¥${total.toLocaleString()}`,
          html: adminHtml,
        }),
      }).catch(() => {});
      fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${RESEND_API_KEY}`},
        body: JSON.stringify({
          from: "SOLUNA KOYA Pre-Cut <info@solun.art>",
          to:   [email],
          subject: `【SOLUNA KOYA】プレカット発注を受け付けました [${orderRef}]`,
          html: `
            <p>${esc(contact)} 様 (${esc(org)})</p>
            <p>SOLUNA KOYA プレカット発注をお受けいたしました。<br><b>受注番号: ${orderRef}</b></p>
            <hr>
            <p><b>発注内容</b><br>サイズ: SOLUNA KOYA — ${esc(size)}<br>数量: ${esc(qty)} 棟<br>認定区分: ${esc(certLabel)}<br>納品先: ${esc(regionName)}<br>希望時期: ${esc(timingLabel)}<br>仮見積合計（税込）: <b>¥${total.toLocaleString()}</b></p>
            <hr>
            <p><b>今後の流れ</b><br>
            ① <b>3営業日以内</b>: 担当（弟子屈本社・濱田）から書面見積（PDF）と請書をメール送付<br>
            ② <b>請書ご捺印・前金50%入金</b>後、製造ライン投入<br>
            ③ <b>10営業日</b>でプレカット完了 → 配送<br>
            ④ <b>配送当日</b>: 残金50%のお支払い（または認定工務店契約者は出荷後請求）</p>
            <hr>
            <p>木材市況の変動により、最終見積が±5%以内で変動する場合がございます。<br>ご不明点は <a href="mailto:info@solun.art">info@solun.art</a> までお問い合わせください。</p>
            <p>— SOLUNA / 濱田優貴<br><a href="https://solun.art/koya-precut">solun.art/koya-precut</a></p>`,
        }),
      }).catch(() => {});
    }
    if (typeof linePushAdmin === "function") {
      linePushAdmin(`📦 KOYA プレカット発注 ${orderRef}\n${org} / ${size} ${qty}棟\n${contact} <${email}>\n¥${total.toLocaleString()} (${regionName})`).catch(() => {});
    }
    res.json({ ok:true, ref: orderRef, message:"発注書を受け付けました。3営業日以内に書面見積を送付します。" });
  } catch (e) {
    console.error("[koya/precut]", e);
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /api/koya/builder — SOLUNA KOYA Builder/工務店/事務所/DIY 登録
app.post("/api/koya/builder", express.json(), async (req, res) => {
  try {
    const b = req.body || {};
    const plan    = String(b.plan || "builder").slice(0, 20);
    const org     = String(b.org || "").trim().slice(0, 200);
    const contact = String(b.contact || "").trim().slice(0, 80);
    const email   = String(b.email || "").trim().slice(0, 120);
    const phone   = String(b.phone || "").trim().slice(0, 32);
    const region  = String(b.region || "").trim().slice(0, 120);
    const trade   = String(b.trade || "").slice(0, 32);
    const volume  = String(b.volume || "").slice(0, 16);
    const timing  = String(b.timing || "").slice(0, 16);
    const note    = String(b.note || "").trim().slice(0, 3000);

    if (!org || !contact || !email || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: "会社名・氏名・有効なemailは必須です" });
    }

    const planLabel = {
      diy:"DIYオーナー", builder:"認定工務店", studio:"建築事務所", govt:"自治体・大型"
    }[plan] || plan;
    const tradeLabel = {
      builder:"工務店・施工", architect:"建築設計事務所", developer:"不動産・デベロッパー",
      hospitality:"宿泊・グランピング", govt:"自治体・公共", academic:"大学・研究機関", individual:"個人施主"
    }[trade] || trade;

    if (RESEND_API_KEY) {
      const adminHtml = `
        <p><b>🏗 SOLUNA KOYA Builder 登録</b></p>
        <ul>
          <li>プラン: <b>${esc(planLabel)}</b></li>
          <li>会社/氏名: ${esc(org)}</li>
          <li>担当: ${esc(contact)}</li>
          <li>メール: ${esc(email)}</li>
          <li>電話: ${esc(phone) || "—"}</li>
          <li>所在地: ${esc(region)}</li>
          <li>業種: ${esc(tradeLabel)}</li>
          <li>想定棟数(年): ${esc(volume)}</li>
          <li>開始時期: ${esc(timing)}</li>
        </ul>
        ${note ? `<p><b>事業内容・興味:</b><br>${esc(note).replace(/\n/g,"<br>")}</p>` : ""}
        <hr>
        <p><a href="https://solun.art/koya-builder">https://solun.art/koya-builder</a></p>
      `;
      fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${RESEND_API_KEY}`},
        body: JSON.stringify({
          from: "SOLUNA KOYA Builder <info@solun.art>",
          to:   ["mail@yukihamada.jp"],
          reply_to: email,
          subject: `【KOYA Builder ${planLabel}】${org} (${region})`,
          html: adminHtml,
        }),
      }).catch(() => {});
      // auto-reply
      fetch("https://api.resend.com/emails", {
        method:"POST",
        headers:{"Content-Type":"application/json", Authorization:`Bearer ${RESEND_API_KEY}`},
        body: JSON.stringify({
          from: "SOLUNA KOYA Builder <info@solun.art>",
          to:   [email],
          subject: `【SOLUNA KOYA Builder】お問い合わせを受け付けました（${planLabel}）`,
          html: `
            <p>${esc(contact)} 様 (${esc(org)})</p>
            <p>SOLUNA KOYA Builder プログラムにご関心をお寄せいただき、ありがとうございます。<br>
            下記の内容で受け付けました。担当（弟子屈本社・濱田優貴）から 24 時間以内にご連絡いたします。</p>
            <hr>
            <p><b>選択プラン:</b> ${esc(planLabel)}<br>
            <b>業種:</b> ${esc(tradeLabel)}<br>
            <b>想定棟数(年):</b> ${esc(volume)}<br>
            <b>開始時期:</b> ${esc(timing)}<br>
            <b>所在地:</b> ${esc(region)}</p>
            <hr>
            <p>気密性能の核心はSOLUNA工場で完結し、現場はあなたの腕で。<br>
            C値0.2の保証書はSOLUNA本部が発行します。<br><br>
            — SOLUNA / 濱田優貴<br>
            <a href="https://solun.art/koya-builder">solun.art/koya-builder</a></p>
          `,
        }),
      }).catch(() => {});
    }
    if (typeof linePushAdmin === "function") {
      linePushAdmin(`🏗 KOYA Builder ${planLabel}\n${org} (${region})\n${contact} <${email}>\n年${volume}棟 / ${timing}`).catch(() => {});
    }

    res.json({ ok:true, message:"受け付けました。24時間以内にメールでご連絡します。" });
  } catch (e) {
    console.error("[koya/builder]", e);
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /api/koya/inquiry — SOLUNA KOYA カスタマイザーからの問い合わせ
//   ノーオース。フォーム送信のみ。レート制限はリバースプロキシ層に委ねる。
app.post("/api/koya/inquiry", express.json(), async (req, res) => {
  try {
    const b = req.body || {};
    const name  = String(b.name || "").trim().slice(0, 80);
    const email = String(b.email || "").trim().slice(0, 120);
    const phone = String(b.phone || "").trim().slice(0, 32);
    const intent= String(b.intent || "inquiry").slice(0, 32);
    const timing= String(b.timing || "undecided").slice(0, 32);
    const note  = String(b.note || "").trim().slice(0, 2000);
    const cfg   = (b.config && typeof b.config === "object") ? b.config : {};

    if (!name || !email || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: "name と有効な email が必要です" });
    }

    const total = Number(cfg.total_price) || 0;
    const opts  = Array.isArray(cfg.options) ? cfg.options.join("・") : "";
    const intentLabel = {
      reserve: "在庫確保 (48hホールド)", visit: "ショールーム見学",
      quote:   "正式見積",                loan:  "住宅ローン事前審査",
      hotel:   "運用代行 SOLUNA Hotel"
    }[intent] || intent;
    const timingLabel = {
      asap:"2週間以内", "3m":"3ヶ月以内", "6m":"半年以内", "1y":"1年以内", undecided:"未定"
    }[timing] || timing;

    if (RESEND_API_KEY) {
      const html = `
        <p><b>🏠 SOLUNA KOYA からの問い合わせ</b></p>
        <ul>
          <li>お名前: ${esc(name)}</li>
          <li>メール: ${esc(email)}</li>
          <li>電話: ${esc(phone) || "—"}</li>
          <li>ご希望: <b>${esc(intentLabel)}</b></li>
          <li>時期: ${esc(timingLabel)}</li>
        </ul>
        <p><b>構成</b><br>
          サイズ: ${esc(cfg.size || "")} / 外装: ${esc(cfg.exterior || "")} / 内装: ${esc(cfg.interior || "")}<br>
          オプション: ${esc(opts || "なし")}<br>
          設置: ${esc(cfg.region || "")} (輸送 ¥${Number(cfg.shipping||0).toLocaleString()})<br>
          本体: ¥${Number(cfg.base_price||0).toLocaleString()} / <b>合計: ¥${total.toLocaleString()}</b>
        </p>
        ${note ? `<p><b>補足</b><br>${esc(note).replace(/\n/g,"<br>")}</p>` : ""}
        <hr>
        <p><a href="https://solun.art/koya">https://solun.art/koya</a></p>
      `;
      // 管理者通知
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA KOYA <info@solun.art>",
          to: ["mail@yukihamada.jp"],
          reply_to: email,
          subject: `【KOYA ${intentLabel}】${name} — ${cfg.size||""} ¥${total.toLocaleString()}`,
          html,
        }),
      }).catch(() => {});
      // 自動返信
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA KOYA <info@solun.art>",
          to: [email],
          subject: `【SOLUNA KOYA】お問い合わせを受け付けました`,
          html: `
            <p>${esc(name)} 様</p>
            <p>SOLUNA KOYA にご関心をお寄せいただき、ありがとうございます。<br>
            下記の内容で受け付けました。担当（弟子屈・濱田）から 24 時間以内にご連絡いたします。</p>
            <hr>
            <p><b>ご希望:</b> ${esc(intentLabel)}（${esc(timingLabel)}）<br>
            <b>構成:</b> SOLUNA KOYA ${esc(cfg.size||"")} / ${esc(cfg.exterior||"")} × ${esc(cfg.interior||"")}<br>
            ${opts ? `<b>オプション:</b> ${esc(opts)}<br>` : ""}
            <b>設置:</b> ${esc(cfg.region||"")}<br>
            <b>合計:</b> ¥${total.toLocaleString()}</p>
            <hr>
            <p>数値で買う、感性で住む。<br>
            — SOLUNA / 濱田優貴<br>
            <a href="https://solun.art/koya">solun.art/koya</a></p>
          `,
        }),
      }).catch(() => {});
    }
    if (typeof linePushAdmin === "function") {
      linePushAdmin(`🏠 KOYA ${intentLabel}\n${name} <${email}>\n${cfg.size||""} ¥${total.toLocaleString()}`).catch(() => {});
    }

    res.json({ ok: true, message: "受け付けました。24時間以内にメールでご連絡します。" });
  } catch (e) {
    console.error("[koya/inquiry]", e);
    res.status(500).json({ error: "internal_error" });
  }
});

// POST /api/soluna/register — purchase intent (creates pending purchase + notifies admin)
app.post("/api/soluna/register", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { property_slug, ref_code } = req.body;
  const prop = SOLUNA_PROPERTIES[property_slug];
  if (!prop) return res.status(400).json({ error: "invalid property" });
  const units = Math.max(1, Math.min(Number(req.body.units) || 1, prop.units || 100));
  const price = prop.price * units;
  // Prevent duplicate pending purchases within 24 hours
  const existing = await db.execute({
    sql: "SELECT id FROM soluna_purchases WHERE member_id=? AND property_slug=? AND status='pending' AND created_at > datetime('now','-1 day')",
    args: [m.member_id, property_slug],
  });
  if (existing.rows[0]) return res.status(409).json({ error: "申込済みです。担当者からの連絡をお待ちください。", purchase_id: existing.rows[0].id });
  const r = await db.execute({
    sql: "INSERT INTO soluna_purchases (member_id,property_slug,units,price_yen,status) VALUES (?,?,?,?,'pending') RETURNING id",
    args: [m.member_id, property_slug, units, price],
  });
  const purchaseId = r.rows[0].id;
  // Record referral if ref_code provided
  if (ref_code) {
    const staffCode = await db.execute({ sql: "SELECT member_id FROM soluna_staff_codes WHERE code=?", args: [ref_code.toUpperCase()] });
    if (staffCode.rows[0]) {
      const commissionYen = Math.floor(price * COMMISSION_RATE);
      await db.execute({
        sql: "UPDATE soluna_purchases SET ref_code=? WHERE id=?",
        args: [ref_code.toUpperCase(), purchaseId],
      });
      await db.execute({
        sql: "INSERT INTO soluna_referrals (code,staff_member_id,purchase_id,referred_email,commission_rate,commission_yen,status) VALUES (?,?,?,?,?,?,'pending')",
        args: [ref_code.toUpperCase(), staffCode.rows[0].member_id, purchaseId, m.email, COMMISSION_RATE, commissionYen],
      });
    }
  }
  // Notify admin by email
  if (RESEND_API_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: ["mail@yukihamada.jp"],
        subject: `【SOLUNA購入申込】${m.email} — ${prop.name} ${units}口${ref_code ? ' (紹介: '+ref_code+')' : ''}`,
        html: `<p><b>購入申込</b></p>
               <p>メール: ${esc(m.email)}<br>物件: ${esc(prop.name)}<br>口数: ${units}口<br>金額: ¥${price.toLocaleString()}<br>購入ID: ${purchaseId}</p>
               <p><a href="${esc(BASE_URL)}/cabin/portal.html">管理: ${esc(BASE_URL)}/cabin/portal.html</a></p>`,
      }),
    }).catch(() => {});
    linePushAdmin(`🏠 新規購入申込\n${m.email}\n${prop.name} ${units}口 ¥${price.toLocaleString()}`).catch(() => {});
  }
  // 支払い方法に応じてレスポンスを変える
  const paymentMethod = req.body.payment_method || "inquiry"; // "stripe" | "bank_transfer" | "inquiry"
  let stripeUrl = null;

  if (paymentMethod === "stripe" && STRIPE_SECRET_KEY) {
    try {
      const stripe = require("stripe")(STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price_data: { currency: "jpy", product_data: { name: `${prop.name} ${units}口 購入申込` }, unit_amount: price }, quantity: 1 }],
        mode: "payment",
        success_url: `${BASE_URL}/app?purchase=success&purchase_id=${purchaseId}`,
        cancel_url: `${BASE_URL}/app?purchase=cancelled`,
        customer_email: m.email,
        metadata: { purchase_id: String(purchaseId), type: "purchase" },
      });
      stripeUrl = session.url;
      await db.execute({ sql: "UPDATE soluna_purchases SET status='payment_pending' WHERE id=?", args: [purchaseId] });
    } catch(e) { console.error("Stripe purchase error:", e.message); }
  } else if (paymentMethod === "bank_transfer") {
    await db.execute({ sql: "UPDATE soluna_purchases SET status='bank_transfer_pending' WHERE id=?", args: [purchaseId] });
    if (RESEND_API_KEY) {
      fetch("https://api.resend.com/emails", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA <info@solun.art>", to: [m.email],
          subject: `【SOLUNA】${prop.name} 銀行振込のご案内`,
          html: `<p>${m.name||m.email} 様</p>
                 <p>以下の口座に${price.toLocaleString()}円をお振込みください。</p>
                 <table border="1" cellpadding="8" style="border-collapse:collapse">
                   <tr><td>銀行名</td><td>三井住友銀行</td></tr>
                   <tr><td>支店名</td><td>渋谷支店（251）</td></tr>
                   <tr><td>口座種別</td><td>普通</td></tr>
                   <tr><td>口座番号</td><td>1234567</td></tr>
                   <tr><td>口座名義</td><td>カ）イネブラ</td></tr>
                   <tr><td>金額</td><td>¥${price.toLocaleString()}</td></tr>
                   <tr><td>振込期限</td><td>申込から7日以内</td></tr>
                 </table>
                 <p>※振込名義に「${m.name||m.email}」とご入力ください。</p>
                 <p>入金確認後、担当者よりご連絡いたします。— SOLUNA チーム</p>`,
        }),
      }).catch(() => {});
    }
  }

  res.json({ ok: true, purchase_id: purchaseId, status: "pending", payment_method: paymentMethod,
    stripe_url: stripeUrl,
    bank_info: paymentMethod === "bank_transfer" ? {
      bank: "三井住友銀行", branch: "渋谷支店（251）", type: "普通", number: "1234567",
      name: "カ）イネブラ", amount: price, deadline_days: 7
    } : null,
    message: paymentMethod === "bank_transfer"
      ? `銀行振込情報をメール（${m.email}）に送信しました。7日以内にお振込みください。`
      : "申込を受け付けました。担当者よりご連絡いたします。"
  });
});

// ── SOLUNA Staff Referral System ───────────────────────────────────────────────
const COMMISSION_RATE = 0.03; // 3%

// POST /api/soluna/admin/staff/issue-code — admin issues staff code to member
app.post("/api/soluna/admin/staff/issue-code", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "email required" });
  await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email) VALUES (?)", args: [email] });
  const member = await db.execute({ sql: "SELECT id FROM soluna_members WHERE email=?", args: [email] });
  const mid = member.rows[0]?.id;
  if (!mid) return res.status(404).json({ error: "member not found" });
  // Check existing
  const existing = await db.execute({ sql: "SELECT code FROM soluna_staff_codes WHERE member_id=?", args: [mid] });
  if (existing.rows[0]) return res.json({ ok: true, code: existing.rows[0].code, existing: true });
  // Generate new code: first 4 chars of name + 4 random hex
  const nameBase = email.split("@")[0].replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase();
  const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
  const code = (nameBase || "REF") + suffix;
  await db.execute({ sql: "INSERT INTO soluna_staff_codes (member_id,code) VALUES (?,?)", args: [mid, code] });
  // Set member_type to friend if not already elevated
  await db.execute({
    sql: "UPDATE soluna_members SET member_type=CASE WHEN member_type IN ('member') THEN 'friend' ELSE member_type END WHERE id=?",
    args: [mid]
  });
  res.json({ ok: true, code, existing: false });
});

// GET /api/soluna/staff/dashboard — staff sees their own referral stats
app.get("/api/soluna/staff/dashboard", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  // Get staff code
  const codeRow = await db.execute({ sql: "SELECT code FROM soluna_staff_codes WHERE member_id=?", args: [m.member_id] });
  const code = codeRow.rows[0]?.code || null;
  if (!code) return res.json({ has_code: false });
  // Get referrals
  const refs = await db.execute({
    sql: `SELECT r.*, p.price_yen, p.property_slug, p.status as purchase_status, p.created_at as purchase_date
          FROM soluna_referrals r
          LEFT JOIN soluna_purchases p ON p.id = r.purchase_id
          WHERE r.code = ? ORDER BY r.created_at DESC`,
    args: [code],
  });
  const referrals = refs.rows;
  const totalCommission = referrals.reduce((sum, r) => sum + (r.commission_yen || 0), 0);
  const confirmedCommission = referrals.filter(r => r.status === 'confirmed').reduce((sum, r) => sum + (r.commission_yen || 0), 0);
  const paidCommission = referrals.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.commission_yen || 0), 0);
  res.json({
    has_code: true,
    code,
    referral_url: `https://solun.art/buy?ref=${code}`,
    stats: {
      total: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      confirmed: referrals.filter(r => r.status === 'confirmed').length,
      paid: referrals.filter(r => r.status === 'paid').length,
      total_commission: totalCommission,
      confirmed_commission: confirmedCommission,
      paid_commission: paidCommission,
    },
    referrals: referrals.map(r => ({
      id: r.id,
      referred_email: r.referred_email ? r.referred_email.replace(/(.{2}).*(@.*)/, '$1***$2') : '—',
      property_slug: r.property_slug,
      property_name: (SOLUNA_PROPERTIES[r.property_slug] || {}).name || r.property_slug || '—',
      commission_yen: r.commission_yen || 0,
      status: r.status,
      created_at: r.created_at,
    })),
  });
});

// GET /api/soluna/admin/staff/referrals — admin sees all referrals
app.get("/api/soluna/admin/staff/referrals", async (req, res) => {
  const m = await solunaAuth(req);
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  const r = await db.execute(`
    SELECT sc.code, mem.email as staff_email, mem.name as staff_name,
           COUNT(ref.id) as total_refs,
           SUM(CASE WHEN ref.status='confirmed' THEN ref.commission_yen ELSE 0 END) as confirmed_commission,
           SUM(CASE WHEN ref.status='paid' THEN ref.commission_yen ELSE 0 END) as paid_commission
    FROM soluna_staff_codes sc
    JOIN soluna_members mem ON mem.id = sc.member_id
    LEFT JOIN soluna_referrals ref ON ref.code = sc.code
    GROUP BY sc.code ORDER BY total_refs DESC
  `);
  res.json({ staff: r.rows });
});

// PATCH /api/soluna/admin/referral/:id — update referral status (confirm/pay)
app.patch("/api/soluna/admin/referral/:id", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  const { status } = req.body;
  if (!['pending','confirmed','paid'].includes(status)) return res.status(400).json({ error: "invalid status" });
  await db.execute({ sql: "UPDATE soluna_referrals SET status=? WHERE id=?", args: [status, req.params.id] });
  res.json({ ok: true });
});

// POST /api/soluna/coupon/issue — admin: issue coupon to member
app.post("/api/soluna/coupon/issue", express.json(), async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(403).json({ error: "forbidden" });
  const { email, property_slug, nights_total, valid_until } = req.body;
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  const member = await db.execute({ sql: "SELECT id FROM soluna_members WHERE email=?", args: [email] });
  const mid = member.rows[0]?.id || null;
  await db.execute({
    sql: "INSERT INTO soluna_coupons (code,member_id,property_slug,nights_total,valid_until) VALUES (?,?,?,?,?)",
    args: [code, mid, property_slug, nights_total, valid_until || null],
  });
  if (RESEND_API_KEY && mid) {
    const propName = SOLUNA_PROPERTIES[property_slug]?.name || property_slug;
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: [email],
        subject: `【SOLUNA】滞在クーポンが発行されました — ${propName}`,
        html: `<div style="font-family:sans-serif;background:#040404;color:#f0ece4;padding:36px 28px;max-width:480px;margin:0 auto">
  <div style="font-size:10px;letter-spacing:.34em;color:#c8a455;font-weight:700;margin-bottom:20px">SOLUNA</div>
  <h2 style="font-size:20px;font-weight:800;margin:0 0 16px">クーポンが発行されました</h2>
  <div style="background:#111;border:1px solid #222;border-radius:10px;padding:18px;margin-bottom:24px">
    <div style="font-size:10px;color:#555;letter-spacing:.2em;margin-bottom:10px">COUPON DETAILS</div>
    <table style="width:100%;font-size:13px;border-collapse:collapse">
      <tr><td style="color:#666;padding:4px 0;width:80px">物件</td><td style="color:#f0ece4;font-weight:700">${esc(propName)}</td></tr>
      <tr><td style="color:#666;padding:4px 0">コード</td><td style="color:#c8a455;font-weight:700;letter-spacing:.1em">${esc(code)}</td></tr>
      <tr><td style="color:#666;padding:4px 0">泊数</td><td style="color:#f0ece4">${nights_total}泊</td></tr>
      ${valid_until ? `<tr><td style="color:#666;padding:4px 0">有効期限</td><td style="color:#f0ece4">${esc(valid_until)}</td></tr>` : ''}
    </table>
  </div>
  <a href="https://solun.art/app" style="display:inline-block;background:#c8a455;color:#040404;font-weight:800;font-size:13px;padding:14px 28px;border-radius:100px;text-decoration:none">アプリで予約する →</a>
</div>`,
      }),
    }).catch(() => {});
  }
  res.json({ ok: true, code });
});

// POST /api/soluna/coupon/redeem — member redeems coupon by code
app.post("/api/soluna/coupon/redeem", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const code = (req.body.code || "").trim().toUpperCase();
  const r = await db.execute({
    sql: `SELECT * FROM soluna_coupons WHERE code=? AND (member_id IS NULL OR member_id=?)`,
    args: [code, m.member_id],
  });
  const coupon = r.rows[0];
  if (!coupon) return res.status(404).json({ error: "クーポンが見つかりません" });
  if (coupon.valid_until && coupon.valid_until < new Date().toISOString()) return res.status(400).json({ error: "クーポンの有効期限が切れています" });
  const remaining = coupon.nights_total - coupon.nights_used;
  if (remaining <= 0) return res.status(400).json({ error: "このクーポンの利用可能泊数は使い切っています" });
  // assign to member if unassigned
  if (!coupon.member_id) {
    await db.execute({ sql: "UPDATE soluna_coupons SET member_id=? WHERE id=?", args: [m.member_id, coupon.id] });
  }
  const prop = SOLUNA_PROPERTIES[coupon.property_slug] || {};
  res.json({ ok: true, coupon_id: coupon.id, property_slug: coupon.property_slug,
    property_name: prop.name || coupon.property_slug, nights_remaining: remaining });
});

// GET /api/soluna/coupon/:id/availability — blocked dates for a property
app.get("/api/soluna/coupon/:id/availability", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const coupon = (await db.execute({ sql: "SELECT * FROM soluna_coupons WHERE id=? AND member_id=?", args: [req.params.id, m.member_id] })).rows[0];
  if (!coupon) return res.status(404).json({ error: "not found" });
  const bookings = await db.execute({
    sql: "SELECT check_in, check_out FROM soluna_bookings WHERE property_slug=? AND status='confirmed' AND check_out >= date('now')",
    args: [coupon.property_slug],
  });
  res.json({ booked_ranges: bookings.rows, nights_remaining: coupon.nights_total - coupon.nights_used });
});

// POST /api/soluna/booking — create booking using coupon
app.post("/api/soluna/booking", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { coupon_id } = req.body;
  const guests = Math.max(1, Math.min(30, Number(req.body.guests) || 1));
  const check_in  = req.body.check_in  || req.body.checkin;
  const check_out = req.body.check_out || req.body.checkout;
  if (!coupon_id || !check_in || !check_out) return res.status(400).json({ error: "missing fields" });
  // Validate date format YYYY-MM-DD
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRe.test(check_in) || !dateRe.test(check_out)) return res.status(400).json({ error: "日付の形式が不正です（YYYY-MM-DD）" });
  const d_in = new Date(check_in), d_out = new Date(check_out);
  if (isNaN(d_in) || isNaN(d_out)) return res.status(400).json({ error: "日付が不正です" });
  const coupon = (await db.execute({ sql: "SELECT * FROM soluna_coupons WHERE id=? AND member_id=?", args: [coupon_id, m.member_id] })).rows[0];
  if (!coupon) return res.status(404).json({ error: "クーポンが見つかりません" });
  // Block booking before property open date
  const propCheck = SOLUNA_PROPERTIES[coupon.property_slug];
  if (propCheck?.open_from && check_in < propCheck.open_from) {
    return res.status(400).json({ error: `この物件は${propCheck.open_from}以降の予約が可能です` });
  }
  const nights = Math.round((d_out - d_in) / 86400000);
  if (nights <= 0 || nights > 90) return res.status(400).json({ error: "日程が不正です（最大90泊）" });
  const remaining = coupon.nights_total - coupon.nights_used;
  if (nights > remaining) return res.status(400).json({ error: `残り${remaining}泊しか使えません` });
  // check overlap
  const overlap = (await db.execute({
    sql: `SELECT id FROM soluna_bookings WHERE property_slug=? AND status='confirmed'
          AND check_in < ? AND check_out > ?`,
    args: [coupon.property_slug, check_out, check_in],
  })).rows;
  if (overlap.length > 0) return res.status(409).json({ error: "その日程はすでに予約が入っています" });
  await db.execute({
    sql: "INSERT INTO soluna_bookings (coupon_id,member_id,property_slug,check_in,check_out,nights,guests) VALUES (?,?,?,?,?,?,?)",
    args: [coupon_id, m.member_id, coupon.property_slug, check_in, check_out, nights, guests],
  });
  await db.execute({ sql: "UPDATE soluna_coupons SET nights_used=nights_used+? WHERE id=?", args: [nights, coupon_id] });
  const propData = SOLUNA_PROPERTIES[coupon.property_slug];
  if (propData) pushToBeds24(propData, check_in, check_out, guests, m.name, m.email).catch(() => {});
  if (RESEND_API_KEY) {
    const propLabel = propData2.name || coupon.property_slug;
    // member confirmation
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: [m.email],
        subject: `【SOLUNA予約確定】${propLabel} ${check_in}〜${check_out}`,
        html: `<div style="font-family:sans-serif;background:#040404;color:#f0ece4;padding:36px 28px;max-width:480px;margin:0 auto">
  <div style="font-size:10px;letter-spacing:.34em;color:#c8a455;font-weight:700;margin-bottom:20px">SOLUNA</div>
  <h2 style="font-size:20px;font-weight:800;margin:0 0 20px">予約が確定しました</h2>
  <div style="background:#111;border:1px solid #222;border-radius:10px;padding:18px;margin-bottom:24px">
    <div style="font-size:10px;color:#555;letter-spacing:.2em;margin-bottom:10px">BOOKING DETAILS</div>
    <table style="width:100%;font-size:13px;border-collapse:collapse">
      <tr><td style="color:#666;padding:4px 0;width:80px">物件</td><td style="color:#f0ece4;font-weight:700">${esc(propLabel)}</td></tr>
      <tr><td style="color:#666;padding:4px 0">チェックイン</td><td style="color:#f0ece4">${esc(check_in)}</td></tr>
      <tr><td style="color:#666;padding:4px 0">チェックアウト</td><td style="color:#f0ece4">${esc(check_out)}</td></tr>
      <tr><td style="color:#666;padding:4px 0">泊数</td><td style="color:#f0ece4">${nights}泊</td></tr>
      <tr><td style="color:#666;padding:4px 0">人数</td><td style="color:#f0ece4">${guests}名</td></tr>
    </table>
  </div>
  <a href="https://solun.art/app" style="display:inline-block;background:#c8a455;color:#040404;font-weight:800;font-size:13px;padding:14px 28px;border-radius:100px;text-decoration:none">チェックインガイドを確認 →</a>
  <p style="font-size:11px;color:#333;margin-top:24px">ご不明な点は info@solun.art までお問い合わせください。</p>
</div>`,
      }),
    }).catch(() => {});
    // admin notification
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: ["mail@yukihamada.jp"],
        subject: `【SOLUNA予約】${propLabel} ${check_in}〜${check_out}`,
        html: `<p><b>予約確定</b></p><p>メール: ${esc(m.email)}<br>物件: ${esc(propLabel)}<br>チェックイン: ${esc(check_in)}<br>チェックアウト: ${esc(check_out)}<br>泊数: ${nights}泊<br>人数: ${guests}名</p>`,
      }),
    }).catch(() => {});
  }
  const propData2 = SOLUNA_PROPERTIES[coupon.property_slug] || {};
  linePushAdmin(`📅 新規予約\n${m.email}\n${propData2.name || coupon.property_slug}\n${check_in}〜${check_out} ${nights}泊`).catch(() => {});
  res.json({ ok: true, check_in, check_out, nights, property_slug: coupon.property_slug });
});

// ── Property Guide ──────────────────────────────────────────────────────────────
// Static supplement (WiFi, contacts, tips) not stored in Beds24
const PROPERTY_GUIDE_STATIC = {
  atami:   { wifi_ssid: "WhiteHouseAtami",     wifi_pass: "室内の書類を参照",         map_url: "https://maps.google.com/?q=35.0840416,139.0750427", notes: "熱海駅から車10分。駐車場あり（無料）。冬季でも温暖。" },
  lodge:   { wifi_ssid: "THE_LODGE_Biruwa",    wifi_pass: "室内書類参照",              map_url: "https://maps.google.com/?q=北海道川上郡弟子屈町美留和361", notes: "冬季（11〜4月）はスタッドレスタイヤ必須。食材は釧路・弟子屈で調達を。" },
  nesting: { wifi_ssid: "NESTING_Biruwa",      wifi_pass: "室内書類参照",              map_url: "https://maps.google.com/?q=北海道川上郡弟子屈町美留和361", notes: "タワーサウナ・ジャグジーの使い方は室内マニュアル参照。冬季スタッドレス必須。" },
  instant: { wifi_ssid: "InstantHouse_Biruwa", wifi_pass: "室内書類参照",              map_url: "https://maps.google.com/?q=北海道川上郡弟子屈町美留和", notes: "オフグリッド設計。電力はソーラー＋バッテリー。節電にご協力ください。" },
  tapkop:  { wifi_ssid: "TAPKOP_Forest",       wifi_pass: "チェックイン時にご案内",    map_url: "https://maps.google.com/?q=北海道弟子屈町", notes: "9,000坪の完全プライベート。専任シェフが食事を提供。食材アレルギーは事前にご連絡を。" },
  kumaushi:{ wifi_ssid: "KUMAUSHI_BASE",        wifi_pass: "受付にてご案内",            map_url: "https://maps.google.com/?q=北海道弟子屈町熊牛", notes: "プール・サウナ・柔術道場完備。共用施設の利用時間は受付でご確認を。" },
  village: { wifi_ssid: "Biruwa_Village",       wifi_pass: "管理棟にてご案内",          map_url: "https://maps.google.com/?q=北海道弟子屈町美留和", notes: "100区画のコミュニティ。農作業・薪割り体験あり。近隣住民への配慮を。" },
  honolulu:{ wifi_ssid: "BeachHouse_HNL",       wifi_pass: "室内書類参照",              map_url: "https://maps.google.com/?q=5827+Kalanianaole+Hwy,Honolulu,HI+96821", checkin_start:"15:00", checkin_end:"22:00", checkout_end:"11:00", notes: "ハワイカイ、5827 Kalanianaʻole Highway。ハナウマ湾5分・ワイキキ20分。近隣スーパー：Times、Safeway(車3分)。ドアコードはチェックイン当日にメールでお送りします。" },
  maui:    { wifi_ssid: "HawaiiKai_House",      wifi_pass: "室内書類参照",              map_url: "https://maps.google.com/?q=5827+Kalanianaole+Highway+Honolulu", notes: "ハワイカイのビーチフロント平屋。波音が聞こえる絶景ロケーション。サンゴ礁保護のため日焼け止めはリーフセーフを。" },
};

// GET /api/soluna/guide/:slug — property guide (auth required; door codes for owners only)
app.get("/api/soluna/guide/:slug", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const slug = req.params.slug;
  const prop = SOLUNA_PROPERTIES[slug];
  if (!prop) return res.status(404).json({ error: "not found" });

  // Is user an owner of this specific property? (has coupon for this slug)
  const ownerCheck = await db.execute({
    sql: "SELECT id FROM soluna_coupons WHERE member_id=? AND property_slug=? LIMIT 1",
    args: [m.member_id, slug],
  });
  const isOwner = ownerCheck.rows.length > 0 || m.nah_access === 1;

  // Fetch Beds24 data if property has beds24_prop
  let beds24Data = null;
  if (prop.beds24_prop) {
    try {
      const token = await beds24GetToken();
      const r = await fetch(`https://api.beds24.com/v2/properties/${prop.beds24_prop}`, {
        headers: { token },
      });
      if (r.ok) {
        const d = await r.json();
        beds24Data = d.data || d;
      }
    } catch (e) { /* ignore */ }
  }

  const staticInfo = PROPERTY_GUIDE_STATIC[slug] || {};

  // Build guide response
  const guide = {
    slug,
    name: prop.name,
    location: prop.location,
    is_owner: isOwner,
    checkin_start: beds24Data?.checkInStart || "16:00",
    checkin_end: beds24Data?.checkInEnd || "—",
    checkout_end: beds24Data?.checkOutEnd || "10:00",
    address: beds24Data ? [beds24Data.address, beds24Data.city, beds24Data.state].filter(Boolean).join(", ") : prop.location,
    map_url: staticInfo.map_url || "",
    wifi_ssid: staticInfo.wifi_ssid || "",
    wifi_pass: staticInfo.wifi_pass || "",
    notes: staticInfo.notes || "",
    contact_email: beds24Data?.email || "info@solun.art",
    contact_phone: "090-7409-0407",
    // Templates: checkin_info always visible, door_code for owners only
    checkin_info: beds24Data?.templates?.template1 || "",
    checkout_info: isOwner ? (beds24Data?.templates?.template2 || "") : "",
    door_code_template: isOwner ? (beds24Data?.templates?.template4 || "") : "",
  };

  res.json(guide);
});

// Property coordinates for KAGI deep links
const PROPERTY_COORDS = {
  atami:   { lat: 35.0840416, lon: 139.0750427 },
  lodge:   { lat: 43.5260,    lon: 144.5480 },
  nesting: { lat: 43.5260,    lon: 144.5480 },
  instant: { lat: 43.5260,    lon: 144.5480 },
  tapkop:  { lat: 43.4800,    lon: 144.4620 },
  kumaushi:{ lat: 43.4780,    lon: 144.4570 },
  village: { lat: 43.5260,    lon: 144.5480 },
  honolulu:{ lat: 21.2850,    lon: -157.7280 },
  maui:    { lat: 21.2850,    lon: -157.7280 },
};

// GET /api/soluna/kagi-link — generate KAGI deep link for property (SOLUNA auth)
app.get("/api/soluna/kagi-link", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const slug = (req.query.prop || "").toLowerCase();
  const prop = SOLUNA_PROPERTIES[slug];
  if (!prop) return res.status(404).json({ error: "not found" });

  // Check ownership: confirmed purchase OR active coupon OR nah_access/admin
  const PRIVILEGED = ["admin", "founder", "friend"];
  let isOwner = m.nah_access === 1 || PRIVILEGED.includes(m.member_type);
  if (!isOwner) {
    const [pur, cup] = await Promise.all([
      db.execute({ sql: "SELECT 1 FROM soluna_purchases WHERE member_id=? AND property_slug=? AND status='confirmed' LIMIT 1", args: [m.member_id, slug] }),
      db.execute({ sql: "SELECT 1 FROM soluna_coupons WHERE member_id=? AND property_slug=? LIMIT 1", args: [m.member_id, slug] }),
    ]);
    isOwner = pur.rows.length > 0 || cup.rows.length > 0;
  }
  if (!isOwner) return res.status(403).json({ error: "not_owner" });

  const rawToken = (req.headers.authorization || "").replace("Bearer ", "").trim();
  const coords = PROPERTY_COORDS[slug] || { lat: 0, lon: 0 };
  const params = new URLSearchParams({
    prop: slug,
    name: prop.name,
    address: prop.location,
    lat: coords.lat,
    lon: coords.lon,
    email: m.email,
    token: rawToken,
  });
  res.json({ deeplink: `kacha://soluna?${params.toString()}` });
});

// GET /api/soluna/kagi/upcoming — KAGI app: upcoming bookings + coupon balances
app.get("/api/soluna/kagi/upcoming", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });

  const bookings = await db.execute({
    sql: `SELECT b.*, c.property_slug as coupon_prop_slug
          FROM soluna_bookings b
          LEFT JOIN soluna_coupons c ON c.id = b.coupon_id
          WHERE b.member_id = ? AND b.check_out >= date('now')
          ORDER BY b.check_in ASC LIMIT 10`,
    args: [m.member_id]
  });

  const coupons = await db.execute({
    sql: "SELECT id, property_slug, nights_total, nights_used FROM soluna_coupons WHERE member_id=?",
    args: [m.member_id]
  });

  res.json({
    bookings: bookings.rows.map(r => ({
      id: r.id,
      property_slug: r.property_slug,
      check_in: r.check_in,
      check_out: r.check_out,
      nights: r.nights,
      guests: r.guests,
      status: r.status
    })),
    coupons: coupons.rows.map(r => ({
      id: r.id,
      property_slug: r.property_slug,
      nights_remaining: (r.nights_total || 0) - (r.nights_used || 0)
    }))
  });
});

// GET /api/soluna/kagi/music — music preset for property
const MUSIC_PRESETS = {
  lodge:   { name: "Forest Cabin",    spotify: "spotify:playlist:37i9dQZF1DX1s9knjP51Oa", apple: "https://music.apple.com/jp/playlist/pl.u-oZylNZgT89rvNr" },
  nesting: { name: "Sauna & Chill",   spotify: "spotify:playlist:37i9dQZF1DXdwTUxmGKrdN", apple: "https://music.apple.com/jp/playlist/pl.u-oZylNZgT89rvNr" },
  atami:   { name: "Ocean View",      spotify: "spotify:playlist:37i9dQZF1DX0MLFaUdXnjA", apple: "https://music.apple.com/jp/playlist/pl.u-oZylNZgT89rvNr" },
  tapkop:  { name: "Private Forest",  spotify: "spotify:playlist:37i9dQZF1DX1s9knjP51Oa", apple: "https://music.apple.com/jp/playlist/pl.u-oZylNZgT89rvNr" },
  honolulu:{ name: "Aloha Vibes",     spotify: "spotify:playlist:37i9dQZF1DX0Yxoavh5qJV", apple: "https://music.apple.com/jp/playlist/pl.u-oZylNZgT89rvNr" },
  maui:    { name: "Hawaii Sunset",   spotify: "spotify:playlist:37i9dQZF1DX0Yxoavh5qJV", apple: "https://music.apple.com/jp/playlist/pl.u-oZylNZgT89rvNr" },
  default: { name: "SOLUNA Ambience", spotify: "spotify:playlist:37i9dQZF1DX1s9knjP51Oa", apple: "https://music.apple.com/jp/playlist/pl.u-oZylNZgT89rvNr" },
};

app.get("/api/soluna/kagi/music", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const slug = (req.query.prop || "").toLowerCase();
  const preset = MUSIC_PRESETS[slug] || MUSIC_PRESETS.default;
  res.json(preset);
});

// POST /api/soluna/kagi/share-token — issue guest share token for a property
app.post("/api/soluna/kagi/share-token", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const { prop, nights = 1, guest_name = "" } = req.body;
  if (!prop) return res.status(400).json({ error: "prop required" });

  // Verify ownership
  const [pur, cup] = await Promise.all([
    db.execute({ sql: "SELECT 1 FROM soluna_purchases WHERE member_id=? AND property_slug=? AND status='confirmed' LIMIT 1", args: [m.member_id, prop] }),
    db.execute({ sql: "SELECT 1 FROM soluna_coupons WHERE member_id=? AND property_slug=? LIMIT 1", args: [m.member_id, prop] }),
  ]);
  const PRIVILEGED_SHARE = ["admin", "founder", "friend"];
  const isOwner = m.nah_access === 1 || PRIVILEGED_SHARE.includes(m.member_type) || pur.rows.length > 0 || cup.rows.length > 0;
  if (!isOwner) return res.status(403).json({ error: "not_owner" });

  // Generate short-lived share token (24h)
  const shareToken = require('crypto').randomBytes(16).toString('hex');
  const exp = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO soluna_otps (email, code, expires_at) VALUES (?, ?, ?)",
    args: [`share:${prop}:${m.email}`, shareToken, exp]
  });

  const propInfo = SOLUNA_PROPERTIES[prop] || {};
  const coords = PROPERTY_COORDS[prop] || { lat: 0, lon: 0 };
  const params = new URLSearchParams({
    prop,
    name: propInfo.name || prop,
    address: propInfo.location || "",
    lat: coords.lat,
    lon: coords.lon,
    role: "guest",
    share_token: shareToken,
  });

  res.json({
    share_link: `kacha://soluna?${params.toString()}`,
    web_link: `https://soluna-web.fly.dev/guest?token=${shareToken}&prop=${prop}`,
    expires_in: 86400,
  });
});

// GET /api/soluna/kagi/all-props — all accessible properties for KAGI batch import
app.get("/api/soluna/kagi/all-props", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  const rawToken = (req.headers.authorization || "").replace("Bearer ", "").trim();

  const PRIVILEGED = ["admin", "founder", "friend"];
  const isPriv = m.nah_access === 1 || PRIVILEGED.includes(m.member_type);

  const [purchases, coupons] = await Promise.all([
    db.execute({ sql: "SELECT DISTINCT property_slug FROM soluna_purchases WHERE member_id=? AND status='confirmed'", args: [m.member_id] }),
    db.execute({ sql: "SELECT DISTINCT property_slug FROM soluna_coupons WHERE member_id=?", args: [m.member_id] }),
  ]);

  const accessibleSlugs = new Set([
    ...purchases.rows.map(r => r.property_slug),
    ...coupons.rows.map(r => r.property_slug),
  ]);
  if (isPriv) Object.keys(SOLUNA_PROPERTIES).forEach(s => accessibleSlugs.add(s));

  const props = Array.from(accessibleSlugs)
    .filter(slug => SOLUNA_PROPERTIES[slug])
    .map(slug => {
      const prop = SOLUNA_PROPERTIES[slug];
      const coords = PROPERTY_COORDS[slug] || { lat: 0, lon: 0 };
      return { slug, name: prop.name, address: prop.location, lat: coords.lat, lon: coords.lon };
    });

  res.json({ token: rawToken, email: m.email, props });
});

// GET /api/soluna/bookings — current user's bookings + Beds24 bookings for owned properties
app.get("/api/soluna/bookings", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });

  const [localBookings, coupons] = await Promise.all([
    db.execute({ sql: "SELECT * FROM soluna_bookings WHERE member_id=? AND check_out >= date('now') ORDER BY check_in", args: [m.member_id] }),
    db.execute({ sql: "SELECT property_slug FROM soluna_coupons WHERE member_id=? GROUP BY property_slug", args: [m.member_id] }),
  ]);

  // Fetch upcoming Beds24 bookings for properties this user owns
  const ownedSlugs = coupons.rows.map(r => r.property_slug);
  const beds24Bookings = [];
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 365);
  const futureDateStr = futureDate.toISOString().slice(0, 10).replace(/-/g, '');

  if (ownedSlugs.length > 0) {
    try {
      const token = await beds24GetToken();
      if (token) {
        const propIds = ownedSlugs.map(s => SOLUNA_PROPERTIES[s]?.beds24_prop).filter(Boolean);
        for (const propId of propIds) {
          const r = await fetch(`https://api.beds24.com/v2/bookings?status=confirmed&dateFrom=${today}&dateTo=${futureDateStr}`, {
            headers: { token }
          });
          if (r.ok) {
            const d = await r.json();
            const slug = Object.keys(SOLUNA_PROPERTIES).find(k => SOLUNA_PROPERTIES[k].beds24_prop === propId);
            (d.data || []).filter(b => b.propertyId === propId).forEach(b => {
              beds24Bookings.push({
                source: 'beds24',
                beds24_id: b.id,
                property_slug: slug || String(propId),
                property_name: (SOLUNA_PROPERTIES[slug] || {}).name || slug,
                check_in: b.arrival,
                check_out: b.departure,
                nights: Math.round((new Date(b.departure) - new Date(b.arrival)) / 86400000),
                guests: (b.numAdult || 1) + (b.numChild || 0),
                guest_name: [b.firstName, b.lastName].filter(Boolean).join(' '),
                guest_email: b.email || '',
                status: b.status,
                channel: b.channelLabel || b.referer || 'Direct',
              });
            });
          }
        }
      }
    } catch(e) { console.error("Beds24 bookings fetch:", e.message); }
  }

  const local = localBookings.rows.map(b => ({
    source: 'soluna',
    id: b.id,
    property_slug: b.property_slug,
    property_name: (SOLUNA_PROPERTIES[b.property_slug] || {}).name || b.property_slug,
    check_in: b.check_in,
    check_out: b.check_out,
    nights: b.nights,
    guests: b.guests,
    status: b.status,
  }));

  const all = [...local, ...beds24Bookings].sort((a, b) => a.check_in.localeCompare(b.check_in));
  res.json({ bookings: all });
});

// ── SOLUNA Member Types ────────────────────────────────────────────────────────
const MEMBER_TYPES = ['admin','founder','friend','owner','cleaner','construction','member'];
const MEMBER_TYPE_LABELS = {
  admin: '管理者', founder: 'ファウンダー', friend: '友達',
  owner: 'オーナー', cleaner: '清掃スタッフ', construction: '工事スタッフ', member: '一般会員',
};

function isSolunaAdmin(m) {
  return m && m.member_type === 'admin';
}

// GET /api/soluna/admin/members — list all members (admin only)
app.get("/api/soluna/admin/members", async (req, res) => {
  const m = await solunaAuth(req);
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  const r = await db.execute(
    `SELECT id, email, name, member_type, nah_access, created_at FROM soluna_members ORDER BY created_at DESC`
  );
  res.json({ members: r.rows.map(row => ({
    ...row,
    member_type: row.member_type || 'member',
    label: MEMBER_TYPE_LABELS[row.member_type] || row.member_type || '一般会員',
  }))});
});

// PATCH /api/soluna/admin/members/:id — update member type (admin only)
app.patch("/api/soluna/admin/members/:id", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  const { member_type } = req.body;
  if (!MEMBER_TYPES.includes(member_type)) return res.status(400).json({ error: "invalid member_type" });
  const id = parseInt(req.params.id);
  await db.execute({ sql: "UPDATE soluna_members SET member_type=? WHERE id=?", args: [member_type, id] });
  res.json({ ok: true, member_type, label: MEMBER_TYPE_LABELS[member_type] });
});

// GET /api/soluna/admin/chat-logs — all chat logs (admin)
app.get("/api/soluna/admin/chat-logs", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m || m.member_type !== "admin") return res.status(403).json({ error: "forbidden" });
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Number(req.query.offset) || 0;
  const [r, cnt] = await Promise.all([
    db.execute({
      sql: `SELECT id, member_id, email, question, answer, created_at FROM soluna_chat_logs ORDER BY id DESC LIMIT ? OFFSET ?`,
      args: [limit, offset]
    }),
    db.execute(`SELECT COUNT(*) as total FROM soluna_chat_logs`)
  ]);
  res.json({ logs: r.rows, total: Number(cnt.rows[0]?.total ?? 0) });
});

// GET /api/soluna/admin/bookings — all upcoming bookings (admin)
app.get("/api/soluna/admin/bookings", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(403).json({ error: "forbidden" });
  const r = await db.execute(`SELECT b.*, m.email FROM soluna_bookings b LEFT JOIN soluna_members m ON m.id=b.member_id ORDER BY b.check_in`);
  res.json(r.rows);
});

// GET /api/soluna/admin/beds24-bookings — all Beds24 bookings (admin)
app.get("/api/soluna/admin/beds24-bookings", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(403).json({ error: "forbidden" });
  try {
    const token = await beds24GetToken();
    if (!token) return res.status(502).json({ error: "Beds24 unavailable" });
    const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const future = new Date(); future.setDate(future.getDate() + 180);
    const futureStr = future.toISOString().slice(0,10).replace(/-/g,'');
    const r = await fetch(`https://api.beds24.com/v2/bookings?status=confirmed&dateFrom=${today}&dateTo=${futureStr}&includeGuests=true`, {
      headers: { token }
    });
    const d = await r.json();
    const bookings = (d.data || []).map(b => {
      const slug = Object.keys(SOLUNA_PROPERTIES).find(k => SOLUNA_PROPERTIES[k].beds24_prop === b.propertyId);
      return {
        beds24_id: b.id,
        property_slug: slug,
        property_name: (SOLUNA_PROPERTIES[slug] || {}).name || `Prop ${b.propertyId}`,
        check_in: b.arrival,
        check_out: b.departure,
        nights: Math.round((new Date(b.departure) - new Date(b.arrival)) / 86400000),
        guests: (b.numAdult||0)+(b.numChild||0),
        guest_name: [b.firstName, b.lastName].filter(Boolean).join(' '),
        guest_email: b.email,
        status: b.status,
        channel: b.channelLabel || b.referer || 'Direct',
        total: b.totalPrice,
      };
    });
    res.json({ bookings });
  } catch(e) {
    res.status(502).json({ error: e.message });
  }
});

// GET /api/soluna/admin/booking-analytics — channel & property breakdown (admin)
app.get("/api/soluna/admin/booking-analytics", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(403).json({ error: "forbidden" });
  try {
    const token = await beds24GetToken();
    if (!token) return res.status(502).json({ error: "Beds24 unavailable" });
    const monthsBack = Math.min(24, Math.max(1, parseInt(req.query.months || '6')));
    const past = new Date(); past.setMonth(past.getMonth() - monthsBack);
    const future = new Date(); future.setMonth(future.getMonth() + 3);
    const fromStr = past.toISOString().slice(0,10).replace(/-/g,'');
    const toStr   = future.toISOString().slice(0,10).replace(/-/g,'');
    const r = await fetch(`https://api.beds24.com/v2/bookings?dateFrom=${fromStr}&dateTo=${toStr}`, { headers: { token } });
    const d = await r.json();
    const all = (d.data || []).filter(b => b.status !== 'cancelled');

    const propNames = {243406:'WHITE HOUSE 熱海',243407:'HONOLULU VILLA',243408:'THE LODGE',243409:'NESTING',322965:'インスタントハウス A',322966:'インスタントハウス B'};
    const normalizeChannel = (b) => {
      const ch = (b.channelLabel || b.channel || b.apiSource || b.referer || '').toLowerCase();
      if (ch.includes('airbnb')) return 'Airbnb';
      if (ch.includes('booking')) return 'Booking.com';
      if (ch === 'direct' || ch.length === 8) return 'Direct / SOLUNA';
      return ch || 'その他';
    };
    const calcNights = (arrival, departure) => {
      if (!arrival || !departure) return 0;
      return Math.max(0, Math.round((new Date(departure) - new Date(arrival)) / 86400000));
    };

    const todayStr = new Date().toISOString().slice(0,10);
    const byChannel = {}, byProp = {}, byMonth = {}, byPropChannel = {}, recent = [];
    let totalNights = 0, totalLeadDays = 0, leadCount = 0;

    for (const b of all) {
      const ch = normalizeChannel(b);
      const prop = propNames[b.propertyId] || `propId ${b.propertyId}`;
      const month = (b.arrival || '').slice(0,7);
      const price = b.price || 0;
      const nights = calcNights(b.arrival, b.departure);
      totalNights += nights;

      if (!byChannel[ch]) byChannel[ch] = { count:0, revenue:0, nights:0 };
      byChannel[ch].count++; byChannel[ch].revenue += price; byChannel[ch].nights += nights;

      if (!byProp[prop]) byProp[prop] = { count:0, revenue:0, nights:0 };
      byProp[prop].count++; byProp[prop].revenue += price; byProp[prop].nights += nights;

      if (!byMonth[month]) byMonth[month] = { count:0, revenue:0, nights:0 };
      byMonth[month].count++; byMonth[month].revenue += price; byMonth[month].nights += nights;

      if (!byPropChannel[prop]) byPropChannel[prop] = {};
      byPropChannel[prop][ch] = (byPropChannel[prop][ch] || 0) + 1;

      if (b.arrival && b.bookingTime) {
        const ld = Math.round((new Date(b.arrival) - new Date(b.bookingTime.slice(0,10))) / 86400000);
        if (ld >= 0 && ld <= 365) { totalLeadDays += ld; leadCount++; }
      }

      recent.push({ id:b.id, prop, check_in:b.arrival, check_out:b.departure, nights,
        guest:`${b.firstName||''} ${b.lastName||''}`.trim(), channel:ch,
        status:b.status, revenue:price, booked_at:b.bookingTime });
    }

    recent.sort((a,b) => (b.booked_at||'') > (a.booked_at||'') ? 1 : -1);

    // Stay distribution (all bookings)
    const stayDist = {'1泊':0,'2泊':0,'3〜5泊':0,'6〜14泊':0,'15泊+':0};
    for (const b of all) {
      const n = calcNights(b.arrival, b.departure);
      const k = n<=1?'1泊':n===2?'2泊':n<=5?'3〜5泊':n<=14?'6〜14泊':'15泊+';
      stayDist[k]++;
    }

    // Weekly booking velocity (past 8 weeks, ALL bookings)
    const vel8 = Array(8).fill(0);
    for (const b of all) {
      if (!b.bookingTime) continue;
      const wk = Math.floor((Date.now() - new Date(b.bookingTime)) / (7*86400000));
      if (wk >= 0 && wk < 8) vel8[7-wk]++;
    }

    // Status breakdown
    const convStats = {};
    for (const b of (d.data||[])) { // include cancelled for full funnel
      convStats[b.status||'unknown'] = (convStats[b.status||'unknown']||0)+1;
    }

    const upcoming = all
      .filter(b => b.arrival && b.arrival >= todayStr)
      .map(b => ({
        id:b.id, prop:propNames[b.propertyId]||`propId ${b.propertyId}`,
        check_in:b.arrival, check_out:b.departure,
        nights:calcNights(b.arrival,b.departure),
        guest:`${b.firstName||''} ${b.lastName||''}`.trim(),
        channel:normalizeChannel(b), status:b.status, revenue:b.price||0
      }))
      .sort((a,b) => a.check_in > b.check_in ? 1 : -1)
      .slice(0,30);

    const avgLeadDays = leadCount ? Math.round(totalLeadDays / leadCount) : 0;
    const pastDays = Math.round((new Date() - past) / 86400000);
    const periodDays = Math.round((future - past) / 86400000);

    res.json({ byChannel, byProp, byPropChannel, byMonth, recent: recent.slice(0,50),
      upcoming, total: all.length, totalNights, periodDays, pastDays, monthsBack,
      avgLeadDays, stayDist, vel8, convStats,
      periodFrom: past.toISOString().slice(0,10), periodTo: future.toISOString().slice(0,10) });
  } catch(e) {
    res.status(502).json({ error: e.message });
  }
});

// ── NOT A HOTEL booking proxy ──────────────────────────────────────────────────
const KAGI_URL = "https://kagi-server.fly.dev";

// POST /api/soluna/nah/reserve — proxy reservation to KAGI (owners + invited)
app.post("/api/soluna/nah/reserve", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  // Check eligibility: has coupons (owner) or has purchases or has nah_access flag
  const [coupons, purchases] = await Promise.all([
    db.execute({ sql: "SELECT id FROM soluna_coupons WHERE member_id=? LIMIT 1", args: [m.member_id] }),
    db.execute({ sql: "SELECT id FROM soluna_purchases WHERE member_id=? AND status='confirmed' LIMIT 1", args: [m.member_id] }),
  ]);
  const eligible = coupons.rows.length > 0 || purchases.rows.length > 0 || m.nah_access === 1;
  if (!eligible) return res.status(403).json({ error: "NOT A HOTELの予約はオーナーまたは招待者のみ可能です" });

  const { property, guest_name, guest_email, check_in, check_out, guests, note } = req.body;
  if (!property || !check_in || !check_out) return res.status(400).json({ error: "missing fields" });

  try {
    const r = await fetch(`${KAGI_URL}/api/v1/soluna/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property,
        guest_name: guest_name || m.name || m.email,
        guest_email: guest_email || m.email,
        check_in,
        check_out,
        guests: guests || 2,
        note: note || "",
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    // notify admin
    if (RESEND_API_KEY) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: "SOLUNA <info@solun.art>",
          to: ["mail@yukihamada.jp"],
          subject: `【NAH予約】${property} ${check_in}〜${check_out}`,
          html: `<p><b>NOT A HOTEL予約</b></p><p>メール: ${m.email}<br>物件: ${property}<br>チェックイン: ${check_in}<br>チェックアウト: ${check_out}<br>予約ID: ${data.reservation_id}</p>`,
        }),
      }).catch(() => {});
    }
    res.json(data);
  } catch (e) {
    console.error("NAH reserve error:", e.message);
    res.status(502).json({ error: e.message });
  }
});

// POST /api/soluna/nah/grant — owner grants nah_access to another email
app.post("/api/soluna/nah/grant", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  // Only owners can grant (nah_access=1 OR confirmed purchase)
  const canGrant = m.nah_access === 1 || (await db.execute({
    sql: "SELECT id FROM soluna_purchases WHERE member_id=? AND status='confirmed' LIMIT 1",
    args: [m.member_id],
  })).rows.length > 0;
  if (!canGrant) return res.status(403).json({ error: "オーナーのみ招待できます" });

  const targetEmail = (req.body.email || "").trim().toLowerCase();
  if (!targetEmail) return res.status(400).json({ error: "email required" });

  // Ensure target member exists
  await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email) VALUES (?)", args: [targetEmail] });
  await db.execute({ sql: "UPDATE soluna_members SET nah_access=1 WHERE email=?", args: [targetEmail] });
  res.json({ ok: true, granted_to: targetEmail });
});

// ── Beds24 General Proxy (admin only, CORS workaround) ───────────────────────
// GET /api/soluna/admin/beds24/proxy?path=v2/properties
app.get("/api/soluna/admin/beds24/proxy", async (req, res) => {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) return res.status(403).json({ error:"forbidden" });
  try {
    const token = await beds24GetToken();
    if (!token) return res.status(502).json({ error:"Beds24 unavailable" });
    const path = req.query.path || "v2/properties";
    const qs = Object.entries(req.query).filter(([k])=>k!=="path").map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join("&");
    const url = `https://api.beds24.com/${path}${qs?"?"+qs:""}`;
    const r = await fetch(url, { headers: { token } });
    res.json(await r.json());
  } catch(e) { res.status(502).json({ error: e.message }); }
});

// GET /api/beds24/bookings?propId=&dateFrom=&dateTo=
app.get("/api/beds24/bookings", async (req, res) => {
  try {
    const token = await beds24GetToken();
    if (!token) return res.status(502).json({ error: "Beds24 token unavailable" });
    const { propId, dateFrom, dateTo } = req.query;
    // Beds24 v2 doesn't filter by propId via query param — fetch all and filter here
    const params = new URLSearchParams({ includeGuests: "true" });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const r = await fetch("https://api.beds24.com/v2/bookings?" + params.toString(), {
      headers: { "token": token },
    });
    const data = await r.json();
    if (propId && data.data) {
      const pid = parseInt(propId);
      data.data = data.data.filter(b => b.propertyId === pid);
      data.count = data.data.length;
    }
    res.status(r.status).json(data);
  } catch (e) {
    console.error("Beds24 proxy GET error:", e.message);
    res.status(502).json({ error: e.message });
  }
});

// POST /api/beds24/bookings
app.post("/api/beds24/bookings", express.json(), async (req, res) => {
  try {
    const token = await beds24GetToken();
    if (!token) return res.status(502).json({ error: "Beds24 token unavailable" });
    const r = await fetch("https://api.beds24.com/v2/bookings", {
      method: "POST",
      headers: { "token": token, "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    console.error("Beds24 proxy POST error:", e.message);
    res.status(502).json({ error: e.message });
  }
});

// POST /api/soluna/inquiry — send inquiry to admin
app.post("/api/soluna/inquiry", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  const message = stripTags((req.body.message || "").trim().slice(0, 2000));
  const { property_slug, email } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });
  const fromEmail = (m && m.email) || (email || "").trim().slice(0, 254) || "unknown";
  const propName = property_slug ? (SOLUNA_PROPERTIES[property_slug] || {}).name || property_slug : "一般";
  if (RESEND_API_KEY) {
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: ["mail@yukihamada.jp"],
        subject: `【SOLUNA相談】${esc(propName)} — ${esc(fromEmail)}`,
        html: `<p><b>物件:</b> ${esc(propName)}</p><p><b>送信者:</b> ${esc(fromEmail)}</p><p><b>メッセージ:</b></p><p style="white-space:pre-wrap">${esc(message)}</p>`,
      }),
    }).catch(() => {});
  }
  res.json({ ok: true });
});

// POST /api/soluna/founders-apply — founders pack application form
app.post("/api/soluna/founders-apply", express.json(), async (req, res) => {
  const { name, email, plan, message } = req.body;
  const safeName    = stripTags((name    || "").trim().slice(0, 100));
  const safeEmail   = stripTags((email   || "").trim().slice(0, 254));
  const safePlan    = ["full","standard"].includes(plan) ? plan : "full";
  const safeMessage = stripTags((message || "").trim().slice(0, 3000));
  if (!safeEmail || !safeEmail.includes("@")) return res.status(400).json({ error: "email required" });
  const planLabel = safePlan === "full" ? "フルパック（¥1億）" : "スタンダードパック（¥3,500万）";

  if (RESEND_API_KEY) {
    // Admin notification
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: ["mail@yukihamada.jp"],
        subject: `【創業者パック申込】${esc(safePlan === "full" ? "フルパック" : "スタンダード")} — ${esc(safeEmail)}`,
        html: `<p><b>氏名:</b> ${esc(safeName)}</p><p><b>メール:</b> ${esc(safeEmail)}</p><p><b>プラン:</b> ${esc(planLabel)}</p><p><b>メッセージ:</b></p><p style="white-space:pre-wrap">${esc(safeMessage)}</p>`,
      }),
    }).catch(() => {});
    // Applicant confirmation
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <info@solun.art>",
        to: [safeEmail],
        subject: "【SOLUNA】創業者パック申込を受け付けました",
        html: `<p>${esc(safeName || "お客様")} 様</p><p>SOLUNA 創業者パックへのご申込ありがとうございます。</p><p><b>プラン:</b> ${esc(planLabel)}</p><p>担当より3営業日以内にご連絡いたします。</p><p>— SOLUNA チーム<br>info@solun.art</p>`,
      }),
    }).catch(() => {});
  }
  res.json({ ok: true });
});

// POST /api/soluna/product-order — materials product inquiry (yakiita, komenuka, etc.)
app.post("/api/soluna/product-order", express.json(), async (req, res) => {
  const { name, email, product, quantity, pref, message } = req.body;
  if (!email || !product || !quantity) return res.status(400).json({ error: "required fields missing" });
  const safeEmail = String(email).trim().slice(0, 254);
  const safeName = String(name || "").trim().slice(0, 100);
  const safeProduct = String(product).trim().slice(0, 100);
  const safeQuantity = String(quantity).trim().slice(0, 50);
  const safePref = String(pref || "").trim().slice(0, 50);
  const safeMsg = stripTags(String(message || "").trim().slice(0, 1000));
  if (RESEND_API_KEY) {
    // Notify admin
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA Materials <info@solun.art>",
        to: ["mail@yukihamada.jp"],
        subject: `【建材注文】${esc(safeProduct)} × ${esc(safeQuantity)} — ${esc(safeName || safeEmail)}`,
        html: `<div style="font-family:sans-serif;max-width:480px"><p><b>商品:</b> ${esc(safeProduct)}</p><p><b>数量:</b> ${esc(safeQuantity)}</p><p><b>お名前:</b> ${esc(safeName)}</p><p><b>メール:</b> ${esc(safeEmail)}</p><p><b>配送先都道府県:</b> ${esc(safePref)}</p>${safeMsg ? `<p><b>備考:</b></p><p style="white-space:pre-wrap">${esc(safeMsg)}</p>` : ""}</div>`,
      }),
    }).catch(() => {});
    // Auto-reply to customer
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA Materials <info@solun.art>",
        to: [safeEmail],
        subject: `ご注文を承りました — ${esc(safeProduct)}`,
        html: `<div style="background:#050505;color:#f0ece4;font-family:sans-serif;padding:40px;max-width:480px"><p style="color:#c8a455;letter-spacing:0.3em;font-size:11px">SOLUNA MATERIALS</p><h2 style="font-size:22px;margin:16px 0 8px">ご注文ありがとうございます</h2><p style="color:rgba(240,236,228,0.6);line-height:1.8;font-size:14px">以下の内容でご注文を承りました。2営業日以内にお支払い方法と配送日程をご連絡いたします。</p><table style="width:100%;margin:24px 0;border-collapse:collapse"><tr><td style="padding:10px 0;color:rgba(240,236,228,0.4);font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">商品</td><td style="padding:10px 0;font-size:13px;font-weight:700;border-bottom:1px solid rgba(255,255,255,0.06)">${esc(safeProduct)}</td></tr><tr><td style="padding:10px 0;color:rgba(240,236,228,0.4);font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">数量</td><td style="padding:10px 0;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.06)">${esc(safeQuantity)}</td></tr><tr><td style="padding:10px 0;color:rgba(240,236,228,0.4);font-size:13px">配送先</td><td style="padding:10px 0;font-size:13px">${esc(safePref) || "—"}</td></tr></table><p style="color:rgba(240,236,228,0.4);font-size:12px">ご不明点は <a href="mailto:info@solun.art" style="color:#c8a455">info@solun.art</a> までご連絡ください。</p></div>`,
      }),
    }).catch(() => {});
  }
  res.json({ ok: true });
});

// GET /api/soluna/availability/next — next available date per property (Beds24)
// MUST be registered before /:slug to avoid "next" matching as a slug param
let _availCache = null; // { data, expiresAt }
app.get("/api/soluna/availability/next", async (req, res) => {
  if (_availCache && Date.now() < _availCache.expiresAt) {
    return res.json(_availCache.data);
  }
  try {
    const token = await beds24GetToken();
    if (!token) return res.json({ available: {} });
    const today = new Date().toISOString().slice(0,10).replace(/-/g,'');
    const future = new Date(); future.setDate(future.getDate() + 90);
    const futureStr = future.toISOString().slice(0,10).replace(/-/g,'');
    // Fetch all bookings for next 90 days
    const r = await fetch(`https://api.beds24.com/v2/bookings?status=confirmed&dateFrom=${today}&dateTo=${futureStr}`, {
      headers: { token }
    });
    const d = await r.json();
    const bookings = d.data || [];
    // Build blocked date ranges per propId
    const blocked = {}; // propId -> Set of "YYYY-MM-DD"
    bookings.forEach(b => {
      if (!blocked[b.propertyId]) blocked[b.propertyId] = new Set();
      const ci = new Date(b.arrival);
      const co = new Date(b.departure);
      for (let dt = new Date(ci); dt < co; dt.setDate(dt.getDate()+1)) {
        blocked[b.propertyId].add(dt.toISOString().slice(0,10));
      }
    });
    // Find next available date for each property
    const available = {};
    const todayDate = new Date(); todayDate.setHours(0,0,0,0);
    for (const [slug, prop] of Object.entries(SOLUNA_PROPERTIES)) {
      if (!prop.beds24_prop || prop.open_from > new Date().toISOString().slice(0,10)) continue;
      const propBlocked = blocked[prop.beds24_prop] || new Set();
      for (let i = 1; i <= 90; i++) {
        const dt = new Date(todayDate); dt.setDate(dt.getDate() + i);
        const ds = dt.toISOString().slice(0,10);
        if (!propBlocked.has(ds)) {
          available[slug] = ds;
          break;
        }
      }
    }
    const result = { available };
    _availCache = { data: result, expiresAt: Date.now() + 5 * 60 * 1000 };
    res.json(result);
  } catch(e) {
    res.json({ available: {} });
  }
});

// GET /api/soluna/availability/:slug — blocked date ranges for a property (Beds24 + SOLUNA DB merged)
app.get("/api/soluna/availability/:slug", async (req, res) => {
  const slug = req.params.slug;
  const prop = SOLUNA_PROPERTIES[slug];
  if (!prop) return res.status(404).json({ error: "property not found" });

  const now = new Date();
  const from = now.toISOString().slice(0,7).replace('-','') + '01';
  const toDate = new Date(now.getFullYear(), now.getMonth() + 6, 0);
  const to = toDate.toISOString().slice(0,10).replace(/-/g,'');

  const blocked = {}; // "YYYY-MM-DD" -> true

  // 1) Beds24
  if (prop.beds24_prop) {
    try {
      const bToken = await beds24GetToken();
      if (bToken) {
        const r = await fetch(`https://api.beds24.com/v2/bookings?propertyId=${prop.beds24_prop}&status=confirmed&dateFrom=${from}&dateTo=${to}`, {
          headers: { token: bToken }
        });
        if (r.ok) {
          const d = await r.json();
          (d.data || []).forEach(b => {
            for (let dt = new Date(b.arrival); dt < new Date(b.departure); dt.setDate(dt.getDate()+1)) {
              blocked[dt.toISOString().slice(0,10)] = true;
            }
          });
        }
      }
    } catch(e) {}
  }

  // 2) SOLUNA DB confirmed bookings
  try {
    const rows = (await db.execute({
      sql: "SELECT check_in, check_out FROM soluna_bookings WHERE property_slug=? AND status='confirmed' AND check_out >= date('now')",
      args: [slug]
    })).rows;
    rows.forEach(b => {
      for (let dt = new Date(b.check_in); dt < new Date(b.check_out); dt.setDate(dt.getDate()+1)) {
        blocked[dt.toISOString().slice(0,10)] = true;
      }
    });
  } catch(e) {}

  res.json({ blocked: Object.keys(blocked).sort() });
});

// GET /api/soluna/owner/revenue — revenue summary for owned properties (owner only)
app.get("/api/soluna/owner/revenue", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });
  try {
    // Get owner's properties (from purchases confirmed + coupons)
    const [purchases, coupons] = await Promise.all([
      db.execute({ sql: "SELECT property_slug FROM soluna_purchases WHERE member_id=? AND status='confirmed'", args: [m.member_id] }),
      db.execute({ sql: "SELECT DISTINCT property_slug FROM soluna_coupons WHERE member_id=?", args: [m.member_id] }),
    ]);
    const ownedSlugs = [...new Set([
      ...purchases.rows.map(r => r.property_slug),
      ...coupons.rows.map(r => r.property_slug),
    ])];
    if (!ownedSlugs.length) return res.json({ revenue: [], total_yen: 0 });
    // Fetch Beds24 bookings for these properties (last 12 months + next 3 months)
    const token = await beds24GetToken();
    if (!token) return res.json({ revenue: [], total_yen: 0, note: "Beds24 unavailable" });
    const from = new Date(); from.setFullYear(from.getFullYear() - 1);
    const to = new Date(); to.setMonth(to.getMonth() + 3);
    const fromStr = from.toISOString().slice(0,10).replace(/-/g,'');
    const toStr = to.toISOString().slice(0,10).replace(/-/g,'');
    const r = await fetch(`https://api.beds24.com/v2/bookings?status=confirmed&dateFrom=${fromStr}&dateTo=${toStr}`, {
      headers: { token }
    });
    const d = await r.json();
    const bookings = (d.data || []).filter(b => {
      const slug = Object.keys(SOLUNA_PROPERTIES).find(k => SOLUNA_PROPERTIES[k].beds24_prop === b.propertyId);
      return ownedSlugs.includes(slug);
    });
    // Group by month
    const byMonth = {};
    let totalYen = 0;
    bookings.forEach(b => {
      const slug = Object.keys(SOLUNA_PROPERTIES).find(k => SOLUNA_PROPERTIES[k].beds24_prop === b.propertyId);
      const month = (b.arrival || '').slice(0,7);
      if (!byMonth[month]) byMonth[month] = { month, bookings: 0, revenue: 0, slugs: new Set() };
      byMonth[month].bookings++;
      byMonth[month].revenue += b.totalPrice || 0;
      byMonth[month].slugs.add(slug);
      totalYen += b.totalPrice || 0;
    });
    const revenue = Object.values(byMonth)
      .sort((a,b) => b.month.localeCompare(a.month))
      .slice(0, 12)
      .map(r => ({ ...r, slugs: [...r.slugs] }));
    // Units owned (approximate share for revenue)
    const propDetails = ownedSlugs.map(slug => ({
      slug,
      name: (SOLUNA_PROPERTIES[slug] || {}).name || slug,
      units_total: (SOLUNA_PROPERTIES[slug] || {}).units || 1,
    }));
    res.json({ revenue, total_yen: totalYen, owned_props: propDetails, bookings_count: bookings.length });
  } catch(e) {
    res.json({ revenue: [], total_yen: 0, error: e.message });
  }
});

// POST /api/soluna/chat — AI chatbot with SOLUNA knowledge base
app.post("/api/soluna/chat", express.json(), async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(503).json({ error: "AI unavailable" });

  const m = await solunaAuth(req);
  const clientIp = req.headers["fly-client-ip"] || req.ip;
  const rateKey = m ? `member:${m.member_id}` : `ip:${clientIp}`;
  const rateMax  = m ? 20 : 10;
  if (!chatRateCheck(rateKey, rateMax)) return res.status(429).json({ error: "しばらく待ってから再度お試しください" });

  // Sanitise inputs to cap token spend
  const safeMsg = (message || "").slice(0, 1000);
  const safeHistory = history.slice(-6).map(h => ({
    role: h.role === "assistant" ? "assistant" : "user",
    content: String(h.content || "").slice(0, 1000),
  }));

  const memberInfo = m ? `ログインユーザー: ${m.email}（${m.member_type || 'member'}）` : '未ログインユーザー';

  const KNOWLEDGE_BASE = `
あなたはSOLUNA（ソルナ）のAIアシスタントです。SOLUNAは「帰れる場所がある、という感覚」を提供する共同所有型リゾートクラブです。

## SOLUNAとは
北海道・熱海・ハワイなどの物件を複数人で共同所有し、オーナーは年間一定泊数の優先滞在権を持つサービス。NFTで所有権を記録。投資ではなく「帰れる場所を持つ」ことが目的。運営: EnablerDAO（東京都港区）、代表: 濱田優貴（元Mercari US CEO）。

## 物件一覧

### THE LODGE（弟子屈・美留和）※現存・予約可
- 価格: ¥490万/口（10口制）
- 年間: 30泊の滞在権
- 特徴: pH9.2アルカリ性温泉・露天風呂付き、薪ストーブ、BBQ、北海道の森の中
- 場所: 北海道川上郡弟子屈町（屈斜路湖と摩周湖の間）
- 実績: 稼働率53.4%、年間売上¥872万、平均単価¥44,727/泊
- 問い合わせ: /lodge ページまたはこのチャット

### NESTING（弟子屈・美留和の森）※現存・予約可
- 価格: ¥890万/口（10口制）
- 年間: 30泊の滞在権
- 特徴: VUILD設計デジタルファブリケーション建築、タワーサウナ、ジャグジー、暖炉
- 稼働実績あり（Airbnb比40%オフでオーナー利用可）

### インスタントハウス（弟子屈・美留和）※現存・予約可
- 価格: ¥120万/口（5口制）
- 年間: 30泊の滞在権
- 特徴: オフグリッド設計・コンパクトハウス・星空・最もリーズナブルな入口

### WHITE HOUSE 熱海（静岡県熱海市）※現存・予約可
- 価格: ¥1,900万/口（6口制）
- 年間: 36泊の滞在権
- 特徴: 相模湾オーシャンビュー・全面ガラス・東京から新幹線45分・温泉・サウナ
- 実績: 稼働率40%・年間売上¥1,502万・平均単価¥102,851/泊

### TAPKOP（弟子屈・阿寒摩周国立公園）
- 価格: ¥8,000万/口（5口制）
- 年間: 30泊の滞在権
- 特徴: PAN-PROJECTS設計・9,000坪の森・専任シェフ付き・完全プライベート・バレルバス・サウナ
- アイヌ語で「丘」という意味

### KUMAUSHI BASE（弟子屈・熊牛原野）2026年9月オープン予定
- 価格: ¥480万/口（20口制）
- 特徴: プール・サウナ・バー・DJ・柔術道場
- 早期申込で最安値

### 美留和ビレッジ（弟子屈・美留和）2026年9月オープン予定
- 価格: ¥490万/口（100口制）
- 特徴: 100区画のコミュニティ型・自然農・薪ストーブ・共同サウナ

### BEACH HOUSE（ハワイ・ホノルル）2026年11月オープン予定
- 価格: ¥2,800万/口（8口制）・月単位滞在
- 特徴: ハワイカイ・オーシャンビュー・プール・ラナイ

### HAWAII KAI HOUSE（ハワイ・ホノルル）2026年11月オープン予定
- 価格: ¥3,800万/口（6口制）・月単位滞在
- 特徴: ビーチフロント・波音が聞こえる平屋

## よくある質問と回答

## ZAMNA × SOLUNA FEST HAWAII 2026
日時: 2026年9月5日（土）/ 場所: オアフ島ハワイ / 定員: 限定300名
音楽: ZAMNA Collective（テクノ / EDM）/ 宿泊: 先行登録後に案内（HONOLULU VILLAは11月オープンのためフェスト時期は別途手配）
先行登録（チケット先行購入権）: https://solun.art/zamna
ZAMNAはメキシコ・トゥルム発のテクノ/EDMフェスティバル。自然×音楽のコンセプトでSOLUNAとコラボ。

## Work Party（自然建築体験）
直近: **2026年6月6日(土)〜7日(日)** / 場所: 北海道・弟子屈町美留和 / **無料**（作業が参加費）/ 定員8名（先着）
内容: サウナ煙突接続・バレルバス配管・デッキ板貼り・Hue照明セットアップ・KAGIスマートロック設定
2日目の夜は完成した棟に全員で試泊。道具・食事は全て提供。
SIPsパネル素材: 杉CLT + 籾殻断熱ボード + 竹集成材。スクリューパイル基礎・H鋼フレーム・Starlink・太陽光パネル設置済み。
申込: https://solun.art/workparty（残り少ない）

## 投資・リターン実績
- East Ventures 5,000万円出資済み / 登記所有 / 2020年創業
- THE LODGE: ¥490万購入で年間¥35,000×30泊=¥105万収益（表面利回り約21%）
- インスタントハウス: ¥120万購入で年間¥25,000×30泊=¥75万収益（表面利回り約62%）
- TAPKOP: ¥8,000万/口で年間¥340,000×30泊=最大¥1,020万収益
- ローン対応可能（THE LODGE実績あり）/ 銀行ローン対象

**Q: 投資として儲かりますか？**
A: 値上がり目的のサービスではありません。「帰れる場所を持つ」ことが目的です。ただし使わない夜はAirbnbで収益化でき、オーナーには収益を分配しています（THE LODGE実績：年間配当¥62万相当）。インスタントハウスは表面利回り約62%。East Ventures 5,000万円出資済み。

**Q: 売却できますか？**
A: NFTとして二次流通できます。欲しい人に渡すことができます。

**Q: ローンは使えますか？**
A: 銀行ローン対応可能です（THE LODGEは実績あり）。詳細はお問い合わせください。

**Q: 維持費はかかりますか？**
A: 月額管理費があります（物件により¥3万〜¥12万/月）。管理費からAirbnb収益で一部賄われます。

**Q: 何人で持つんですか？**
A: 物件により5〜100口。THE LODGEは10口（10人で持つ）、TAPKOPは5口です。

**Q: 予約が取れないのでは？**
A: 年30泊（または36泊）の優先予約権があります。シーズン中の人気日程は早めに押さえることを推奨します。

**Q: 宿泊だけでなく購入もできますか？**
A: はい。まず1泊体験してから購入を検討することもできます。

**Q: 弟子屈ってどこですか？**
A: 北海道東部・釧路管内の町。屈斜路湖・摩周湖・阿寒湖を擁する国立公園エリア。東京から飛行機+レンタカーで約3時間。

**Q: 申込方法は？**
A: /buy ページから申し込めます。ログイン後、物件を選んで申込ボタンを押すだけです。担当者からご連絡します。

## コミッション制度
友人を紹介した場合、成約価格の3%が紹介者に支払われます。紹介コードは /staff ページで取得できます。

## 購入後のフロー
1. 購入申込（/buy）→ pending ステータス
2. 担当者が内容確認・決済処理（1〜3営業日）
3. confirmed になると滞在クーポン（年間泊数分）が発行される
4. クーポンをアプリで認証 → 予約可能になる
5. メールでクーポンコード・詳細が届く

## 空き家・地方リノベプロジェクト
- 香川・瀬戸内「AKIYA CLUB」: 小豆島RC Villa・直島古家・豊島更地・三豊茅葺など全18物件
  詳細: solun.art/kagawa-akiya
- 和歌山リノベ: 計画中（詳細は solun.art/wakayama-akiya）

## NOT A HOTEL (NAH) 連携
- SOLUNA購入オーナーはNOT A HOTELの全施設も利用可能
- アプリの「検索」タブで NAH 物件を予約可能
- アクセス条件: 確定済み購入またはクーポン所持

## 月額管理費（目安）
- インスタントハウス: ¥3万/月
- THE LODGE: ¥10万/月
- NESTING: ¥15万/月
- TAPKOP: ¥120万/月（全体）
- WHITE HOUSE 熱海: ¥50万/月（全体）
- ローン対応可能（THE LODGE実績あり・銀行融資）

## 現在地: ${memberInfo}
`;

  try {
    // 1. Try m5 HITL first (long timeout for 待つ + edit flow)
    const m5Url = m5RuntimeUrl;
    let reply = null;
    if (m5Url) {
      try {
        const histCtx = safeHistory.map(h => `${h.role}: ${h.content.slice(0,200)}`).join("\n");
        const context = `${KNOWLEDGE_BASE}\n\n# 直近の会話\n${histCtx}`;
        const m5r = await fetch(m5Url.replace(/\/$/, "") + "/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            question: safeMsg, context, site: "soluna",
            user_id: m?.member_id ? `soluna-m${m.member_id}` : null,
            user_label: m?.email || null,
          }),
          signal: AbortSignal.timeout(700000),
        });
        if (m5r.ok) {
          const md = await m5r.json();
          if (md?.text && md.text.trim()) reply = md.text;
        }
      } catch (_) { /* fall through */ }
    }

    // 2. Fallback: Anthropic
    if (!reply) {
      const messages = [...safeHistory, { role: "user", content: safeMsg }];
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
          system: KNOWLEDGE_BASE,
          messages,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message || "AI error");
      reply = data.content?.[0]?.text || "すみません、回答できませんでした。";
    }

    db.execute({
      sql: `INSERT INTO soluna_chat_logs (member_id, email, question, answer) VALUES (?,?,?,?)`,
      args: [m?.member_id || null, m?.email || null, safeMsg, reply]
    }).catch(() => {});
    res.json({ ok: true, reply });
  } catch(e) {
    console.error("Chat error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── SOLUNA Community Chat ──────────────────────────────────────────────────────
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

// ── LINE Flex Message helpers ──────────────────────────────────────────────────
function lineFlexProperty(prop) {
  return {
    type: "bubble",
    size: "kilo",
    hero: {
      type: "image",
      url: `https://solun.art/img/${prop.img || 'og.jpg'}`,
      size: "full", aspectRatio: "20:13", aspectMode: "cover",
    },
    body: {
      type: "box", layout: "vertical", spacing: "sm", paddingAll: "16px",
      contents: [
        { type: "text", text: prop.name, weight: "bold", size: "md", color: "#f0ece4" },
        { type: "text", text: prop.location || "", size: "xxs", color: "#666666", margin: "xs" },
        {
          type: "box", layout: "horizontal", margin: "md", spacing: "sm",
          contents: [
            { type: "box", layout: "vertical", contents: [
              { type: "text", text: "滞在", size: "xxs", color: "#555555" },
              { type: "text", text: `¥${(prop.stay_price||0).toLocaleString()}/泊`, size: "sm", weight: "bold", color: "#c8a455" }
            ]},
            { type: "box", layout: "vertical", contents: [
              { type: "text", text: "年間", size: "xxs", color: "#555555" },
              { type: "text", text: `${prop.nights || 30}泊`, size: "sm", weight: "bold", color: "#f0ece4" }
            ]},
            { type: "box", layout: "vertical", contents: [
              { type: "text", text: "購入", size: "xxs", color: "#555555" },
              { type: "text", text: prop.price >= 10000000 ? `¥${(prop.price/10000).toFixed(0)}万` : `¥${(prop.price/10000).toFixed(0)}万`, size: "sm", weight: "bold", color: "#f0ece4" }
            ]},
          ]
        }
      ]
    },
    footer: {
      type: "box", layout: "vertical", spacing: "sm", paddingAll: "12px",
      contents: [{
        type: "button", action: { type: "uri", label: "詳細を見る", uri: `https://solun.art/${prop.slug}` },
        style: "primary", color: "#c8a455", height: "sm"
      }]
    },
    styles: { body: { backgroundColor: "#0a0a0a" }, footer: { backgroundColor: "#0a0a0a" } }
  };
}

function lineFlexBooking(b, propName) {
  const statusColor = b.status === 'confirmed' ? '#5ab55a' : '#f5c842';
  const statusLabel = b.status === 'confirmed' ? '確定' : b.status === 'cancelled' ? 'キャンセル済' : '申込中';
  return {
    type: "bubble", size: "kilo",
    body: {
      type: "box", layout: "vertical", paddingAll: "16px",
      contents: [
        { type: "text", text: "🏔 予約情報", size: "xs", color: "#c8a455", weight: "bold" },
        { type: "text", text: propName || b.property_slug, weight: "bold", size: "md", color: "#f0ece4", margin: "sm" },
        { type: "separator", margin: "md", color: "#1a1a1a" },
        { type: "box", layout: "vertical", margin: "md", spacing: "xs", contents: [
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "チェックイン", size: "xs", color: "#555555", flex: 2 },
            { type: "text", text: b.check_in || "-", size: "xs", color: "#f0ece4", flex: 3 }
          ]},
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "チェックアウト", size: "xs", color: "#555555", flex: 2 },
            { type: "text", text: b.check_out || "-", size: "xs", color: "#f0ece4", flex: 3 }
          ]},
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "泊数", size: "xs", color: "#555555", flex: 2 },
            { type: "text", text: `${b.nights || 0}泊`, size: "xs", color: "#f0ece4", flex: 3 }
          ]},
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "ステータス", size: "xs", color: "#555555", flex: 2 },
            { type: "text", text: statusLabel, size: "xs", color: statusColor, flex: 3, weight: "bold" }
          ]},
        ]},
      ]
    },
    footer: b.status !== 'cancelled' && b.id ? {
      type: "box", layout: "vertical", paddingAll: "12px",
      contents: [{
        type: "button", action: { type: "message", label: `キャンセル ${b.id}`, text: `キャンセル ${b.id}` },
        style: "secondary", height: "sm", color: "#1a1a1a"
      }]
    } : { type: "box", layout: "vertical", contents: [] },
    styles: { body: { backgroundColor: "#0a0a0a" }, footer: { backgroundColor: "#0a0a0a" } }
  };
}

function lineQuickReply(items) {
  return {
    items: items.map(([label, text]) => ({
      type: "action",
      action: { type: "message", label, text }
    }))
  };
}

// LINE Rich Menu の作成・設定（起動時に1回実行）
async function setupLineRichMenu() {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return;
  try {
    // 既存のデフォルトリッチメニューを確認
    const existingRes = await fetch("https://api.line.me/v2/bot/user/all/richmenu", {
      headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
    });
    if (existingRes.ok) {
      const existing = await existingRes.json();
      if (existing.richMenuId) {
        console.log("✓ LINE Rich Menu already set:", existing.richMenuId);
        return; // すでに設定済み
      }
    }

    // Rich Menu を作成
    const menuRes = await fetch("https://api.line.me/v2/bot/richmenu", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
      body: JSON.stringify({
        size: { width: 2500, height: 843 },
        selected: true,
        name: "SOLUNA メニュー",
        chatBarText: "メニューを開く",
        areas: [
          {
            bounds: { x: 0, y: 0, width: 833, height: 843 },
            action: { type: "message", label: "物件一覧", text: "物件" }
          },
          {
            bounds: { x: 833, y: 0, width: 834, height: 843 },
            action: { type: "message", label: "予約確認", text: "予約状況" }
          },
          {
            bounds: { x: 1667, y: 0, width: 833, height: 843 },
            action: { type: "message", label: "ヘルプ", text: "ヘルプ" }
          }
        ]
      })
    });
    if (!menuRes.ok) { const e = await menuRes.text(); console.error("Rich menu create failed:", e); return; }
    const menu = await menuRes.json();
    const richMenuId = menu.richMenuId;

    // デフォルトに設定
    await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
      method: "POST", headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
    });

    console.log("✓ LINE Rich Menu created:", richMenuId);
    console.log(`  Upload image: POST https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`);
    // 画像URLをログ（管理者が手動アップロードできるように）
  } catch(e) {
    console.error("LINE Rich Menu setup error:", e.message);
  }
}

// SSE clients for real-time push: Map<res, { member_id, name }>
const communityClients = new Map();

// Reaction store in memory: Map<msgId, Map<emoji, Set<memberId>>>
// Backed by soluna_community_reactions table — loaded on boot, written async on change
const msgReactions = new Map();
(async () => {
  try {
    const rows = (await db.execute(
      "SELECT message_id, member_id, emoji FROM soluna_community_reactions"
    )).rows;
    for (const { message_id, member_id, emoji } of rows) {
      if (!msgReactions.has(message_id)) msgReactions.set(message_id, new Map());
      const rm = msgReactions.get(message_id);
      if (!rm.has(emoji)) rm.set(emoji, new Set());
      rm.get(emoji).add(member_id);
    }
    if (rows.length) console.log(`Loaded ${rows.length} reactions from DB`);
  } catch(e) { console.error("reactions load error:", e.message); }
})();

// GET /api/soluna/community/stream — SSE for real-time messages
app.get("/api/soluna/community/stream", async (req, res) => {
  // EventSource can't set headers — accept token via query param too
  if (req.query.token && !req.headers.authorization) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "login required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Accel-Buffering", "no"); // disable Fly.io/Nginx proxy buffering
  res.flushHeaders();

  // Send current online count immediately
  const onlineCount = communityClients.size + 1;
  res.write(`data: ${JSON.stringify({ type: "online", count: onlineCount })}\n\n`);
  if (res.flush) res.flush(); // flush compression buffer

  // Send heartbeat every 25s to keep connection alive
  const hb = setInterval(() => { res.write(": ping\n\n"); if (res.flush) res.flush(); }, 25000);
  communityClients.set(res, { member_id: m.member_id, name: m.name || m.email.split("@")[0] });

  // Broadcast updated online count to everyone
  broadcastCommunity({ type: "online", count: onlineCount });

  req.on("close", () => {
    communityClients.delete(res);
    clearInterval(hb);
    broadcastCommunity({ type: "online", count: communityClients.size });
  });
});

// Broadcast to all SSE clients
function broadcastCommunity(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const [client] of communityClients) {
    try { client.write(data); if (client.flush) client.flush(); } catch {}
  }
}

// GET /api/soluna/community/online — current online count
app.get("/api/soluna/community/online", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.json({ count: 0 });
  res.json({ count: communityClients.size });
});

// GET /api/soluna/community/messages — recent 80 messages
app.get("/api/soluna/community/messages", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "login required" });
  const before = req.query.before ? Number(req.query.before) : null;
  try {
    const sql = before
      ? `SELECT id, member_id, display_name, member_type, message, is_ai, created_at, reply_to_id, reply_preview, image_url, deleted
         FROM soluna_community_messages WHERE id < ? AND deleted=0 ORDER BY id DESC LIMIT 40`
      : `SELECT id, member_id, display_name, member_type, message, is_ai, created_at, reply_to_id, reply_preview, image_url, deleted
         FROM soluna_community_messages WHERE deleted=0 ORDER BY id DESC LIMIT 80`;
    const r = await db.execute(before ? { sql, args: [before] } : sql);
    res.json({ messages: r.rows.reverse() });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/soluna/community/message — send message (supports reply_to_id, image_url)
app.post("/api/soluna/community/message", express.json({ limit: "4mb" }), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "login required" });
  if (!msgRateCheck(m.member_id)) return res.status(429).json({ error: "送信が速すぎます。少し待ってから再試行してください。" });

  const { message, reply_to_id, image_url } = req.body;
  const text = (message || "").trim().slice(0, 1000);
  if (!text && !image_url) return res.status(400).json({ error: "message or image required" });

  const displayName = m.name || m.email.split("@")[0];
  const memberType = m.member_type || "member";

  // Resolve reply preview
  let replyPreview = null;
  let replyToIdNum = reply_to_id ? Number(reply_to_id) : null;
  if (replyToIdNum) {
    const orig = (await db.execute({ sql: "SELECT display_name, message FROM soluna_community_messages WHERE id=?", args: [replyToIdNum] })).rows[0];
    if (orig) replyPreview = JSON.stringify({ name: orig.display_name, text: (orig.message || "").slice(0, 100) });
  }

  // image_url: accept data URI (base64) or external URL, store in S3 if base64
  let storedImageUrl = image_url || null;
  if (image_url && image_url.startsWith("data:image/")) {
    try {
      const [header, b64] = image_url.split(",");
      const mime = header.match(/data:([^;]+)/)?.[1] || "image/png";
      const ext = mime.split("/")[1].replace("jpeg", "jpg");
      const buf = Buffer.from(b64, "base64");
      if (buf.length > 3 * 1024 * 1024) throw new Error("image too large (max 3MB)");
      const key = `chat/${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
      await s3Put(key, buf, mime);
      const endpoint = process.env.AWS_ENDPOINT_URL_S3 || "https://fly.storage.tigris.dev";
      storedImageUrl = `${endpoint}/${S3_BUCKET}/${key}`;
    } catch(imgErr) {
      return res.status(400).json({ error: imgErr.message });
    }
  }

  try {
    const ins = await db.execute({
      sql: `INSERT INTO soluna_community_messages (member_id, display_name, member_type, message, is_ai, reply_to_id, reply_preview, image_url)
            VALUES (?,?,?,?,0,?,?,?)`,
      args: [m.member_id, displayName, memberType, text, replyToIdNum, replyPreview, storedImageUrl]
    });
    const msgId = Number(ins.lastInsertRowid);
    const payload = {
      id: msgId, member_id: m.member_id, display_name: displayName, member_type: memberType,
      message: text, is_ai: 0, created_at: new Date().toISOString(),
      reply_to_id: replyToIdNum, reply_preview: replyPreview, image_url: storedImageUrl
    };
    broadcastCommunity({ type: "message", ...payload });
    res.json({ ok: true, message: payload });

    if (TG_TOKEN && TG_CHAT) {
      sendTg(TG_CHAT, `💬 *SOLUNA Chat*\n*${displayName}*: ${text.slice(0, 200)}`).catch(() => {});
    }
    lineBroadcastCommunity(displayName, text).catch(() => {});

    const shouldReply = /AI|ソル|sol|どう|教え|知りたい|？|\?/i.test(text);
    if (shouldReply) setTimeout(() => aiCommunityReply(text, displayName), 1800);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/soluna/community/message/:id — soft-delete own message
app.delete("/api/soluna/community/message/:id", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "login required" });
  const id = Number(req.params.id);
  const msg = (await db.execute({ sql: "SELECT member_id FROM soluna_community_messages WHERE id=?", args: [id] })).rows[0];
  if (!msg) return res.status(404).json({ error: "not found" });
  if (msg.member_id !== m.member_id && m.member_type !== "admin") return res.status(403).json({ error: "forbidden" });
  await db.execute({ sql: "UPDATE soluna_community_messages SET deleted=1, message='[削除されました]' WHERE id=?", args: [id] });
  broadcastCommunity({ type: "delete", message_id: id });
  res.json({ ok: true });
});

// POST /api/soluna/community/react — emoji reaction
app.post("/api/soluna/community/react", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "login required" });
  const { message_id, emoji } = req.body;
  const msgIdNum = Number(message_id);
  const allowed = ["❤️","🔥","👍","🏔","🌊","✨","😂","🙌","🎉","👏","🤔","😮"];
  if (!Number.isInteger(msgIdNum) || msgIdNum <= 0 || !allowed.includes(emoji)) return res.status(400).json({ error: "invalid" });
  // Cap Map size to prevent unbounded growth (keep newest 500 reacted messages)
  if (!msgReactions.has(msgIdNum) && msgReactions.size >= 500) {
    const firstKey = msgReactions.keys().next().value;
    msgReactions.delete(firstKey);
  }
  if (!msgReactions.has(msgIdNum)) msgReactions.set(msgIdNum, new Map());
  const reactMap = msgReactions.get(msgIdNum);
  if (!reactMap.has(emoji)) reactMap.set(emoji, new Set());
  const members = reactMap.get(emoji);

  // Toggle (in-memory + persist to DB in background)
  if (members.has(m.member_id)) {
    members.delete(m.member_id);
    db.execute({
      sql: "DELETE FROM soluna_community_reactions WHERE message_id=? AND member_id=? AND emoji=?",
      args: [msgIdNum, m.member_id, emoji],
    }).catch(() => {});
  } else {
    members.add(m.member_id);
    db.execute({
      sql: "INSERT OR IGNORE INTO soluna_community_reactions (message_id, member_id, emoji) VALUES (?,?,?)",
      args: [msgIdNum, m.member_id, emoji],
    }).catch(() => {});
  }

  // Build reaction summary
  const reactions = {};
  for (const [e, s] of reactMap) {
    if (s.size > 0) reactions[e] = { count: s.size, mine: s.has(m.member_id) };
  }

  broadcastCommunity({ type: "reaction", message_id: msgIdNum, reactions });
  res.json({ ok: true, reactions });
});

// LINE: broadcast community message to linked users (Flex card)
async function lineBroadcastCommunity(senderName, text) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return;
  try {
    const r = await db.execute(`SELECT line_user_id FROM soluna_members WHERE line_user_id IS NOT NULL AND line_user_id != ''`);
    if (!r.rows.length) return;
    const userIds = r.rows.map(row => row.line_user_id);
    const short = text.slice(0, 120) + (text.length > 120 ? "…" : "");
    await fetch("https://api.line.me/v2/bot/message/multicast", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
      body: JSON.stringify({
        to: userIds.slice(0, 150),
        messages: [{
          type: "flex", altText: `${senderName}: ${short}`,
          contents: {
            type: "bubble", size: "kilo",
            body: {
              type: "box", layout: "vertical", paddingAll: "14px", spacing: "sm",
              contents: [
                { type: "box", layout: "horizontal", spacing: "sm", contents: [
                  { type: "text", text: "💬", size: "sm", flex: 0 },
                  { type: "text", text: senderName, weight: "bold", size: "sm", color: "#c8a455", flex: 1 },
                  { type: "text", text: "コミュニティ", size: "xxs", color: "#444", align: "end", flex: 0 }
                ]},
                { type: "text", text: short, size: "sm", color: "#d0c8bc", wrap: true, margin: "sm" },
              ]
            },
            footer: {
              type: "box", layout: "vertical", paddingAll: "10px",
              contents: [{
                type: "button", action: { type: "uri", label: "チャットを開く", uri: "https://solun.art/chat" },
                style: "primary", color: "#c8a455", height: "sm"
              }]
            },
            styles: { body: { backgroundColor: "#0d0d0d" }, footer: { backgroundColor: "#0a0a0a" } }
          }
        }]
      })
    });
  } catch {}
}

// LINE signature verification middleware
function verifyLineSignature(req, res, buf) {
  // Store raw body for signature verification
  req.rawBody = buf;
}

// LINE Webhook — receives messages from LINE users
app.post("/api/line/webhook", async (req, res) => {
  // Verify LINE signature (required — reject if secret missing or sig mismatch)
  if (!LINE_CHANNEL_SECRET) return res.status(503).end();
  const sig = req.headers["x-line-signature"];
  if (!sig || !req.rawBody) return res.status(401).json({ error: "missing signature" });
  const crypto = require("crypto");
  const expected = crypto.createHmac("SHA256", LINE_CHANNEL_SECRET).update(req.rawBody).digest("base64");
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return res.status(401).json({ error: "invalid signature" });
  res.status(200).json({ ok: true });
  const events = req.body?.events || [];
  for (const ev of events) {
    if (ev.type === "follow") {
      // User followed the bot — need to link LINE user ID to a member
      const lineUserId = ev.source.userId;
      // We'll reply asking them to enter their SOLUNA email
      if (LINE_CHANNEL_ACCESS_TOKEN) {
        await fetch(`https://api.line.me/v2/bot/message/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
          body: JSON.stringify({
            replyToken: ev.replyToken,
            messages: [{
              type: "flex", altText: "SOLUNAへようこそ！",
              contents: {
                type: "bubble",
                hero: {
                  type: "box", layout: "vertical", paddingAll: "24px", backgroundColor: "#0a0a0a",
                  contents: [
                    { type: "text", text: "◐ SOLUNA", size: "xs", color: "#c8a455", weight: "bold", letterSpacing: "4px" },
                    { type: "text", text: "ようこそ", size: "xxl", weight: "bold", color: "#f4f0ea", margin: "sm" },
                    { type: "text", text: "共同所有型リゾートクラブ", size: "xs", color: "#666", margin: "xs" }
                  ]
                },
                body: {
                  type: "box", layout: "vertical", paddingAll: "20px", spacing: "sm", backgroundColor: "#111",
                  contents: [
                    { type: "text", text: "何に興味がありますか？", size: "sm", color: "#888", margin: "none" },
                    { type: "separator", margin: "md", color: "#222" },
                    { type: "button", action: { type: "message", label: "🏔 物件を見る（北海道・熱海・ハワイ）", text: "物件" }, style: "secondary", height: "sm", margin: "md" },
                    { type: "button", action: { type: "message", label: "🎵 ZAMNA FEST HAWAII 2026", text: "フェス" }, style: "secondary", height: "sm", margin: "sm" },
                    { type: "button", action: { type: "message", label: "🔨 Work Party（自然建築体験）", text: "ワークパーティ" }, style: "secondary", height: "sm", margin: "sm" },
                    { type: "button", action: { type: "message", label: "💰 投資・利回りについて", text: "利回りについて教えてください" }, style: "secondary", height: "sm", margin: "sm" },
                  ]
                },
                footer: {
                  type: "box", layout: "vertical", paddingAll: "14px", backgroundColor: "#0a0a0a",
                  contents: [
                    { type: "text", text: "アカウント連携: メールアドレスを送ってください", size: "xs", color: "#444", wrap: true, align: "center" }
                  ]
                },
                styles: { hero: { backgroundColor: "#0a0a0a" }, body: { backgroundColor: "#111" }, footer: { backgroundColor: "#0a0a0a" } }
              }
            }]
          })
        }).catch(() => {});
      }
    } else if (ev.type === "message" && ev.message.type === "text") {
      const lineUserId = ev.source.userId;
      const text = ev.message.text.trim();
      // Check if it looks like an email for linking
      if (text.includes("@") && text.includes(".")) {
        const email = text.toLowerCase();
        try {
          const member = (await db.execute({ sql: "SELECT id, email FROM soluna_members WHERE email=?", args: [email] })).rows[0];
          if (member) {
            // Send OTP to email for verification before linking
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const exp = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            await db.execute({ sql: "INSERT INTO soluna_otps (email, code, expires_at) VALUES (?,?,?)", args: [`line:${lineUserId}:${member.email}`, otp, exp] }).catch(() => {});
            if (RESEND_API_KEY) {
              fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
                body: JSON.stringify({ from: "SOLUNA <info@solun.art>", to: [member.email], subject: "LINE連携の確認コード", html: `<p>LINEアカウントとの連携を確認します。</p><p>確認コード: <b>${otp}</b></p><p>LINEで上記6桁を送信してください。10分間有効です。</p>` }),
              }).catch(() => {});
            }
            if (LINE_CHANNEL_ACCESS_TOKEN) {
              await fetch(`https://api.line.me/v2/bot/message/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
                body: JSON.stringify({ replyToken: ev.replyToken, messages: [{ type: "text", text: `${member.email} に確認コードを送りました。\n6桁のコードをLINEで送信してください。` }] })
              }).catch(() => {});
            }
          } else {
            if (LINE_CHANNEL_ACCESS_TOKEN && ev.replyToken) {
              await fetch(`https://api.line.me/v2/bot/message/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
                body: JSON.stringify({ replyToken: ev.replyToken, messages: [{ type: "text", text: "メールアドレスが見つかりませんでした。\nまずsolun.artでログインしてください。" }] })
              }).catch(() => {});
            }
          }
        } catch {}
      } else if (/^\d{6}$/.test(text)) {
        // 6桁OTP → LINE連携確認
        const lineUserId2 = ev.source.userId;
        try {
          const otpRow = (await db.execute({
            sql: "SELECT * FROM soluna_otps WHERE email LIKE ? AND code=? AND used=0 AND expires_at > datetime('now') ORDER BY id DESC LIMIT 1",
            args: [`line:${lineUserId2}:%`, text]
          })).rows[0];
          if (otpRow) {
            await db.execute({ sql: "UPDATE soluna_otps SET used=1 WHERE id=?", args: [otpRow.id] });
            const parts = otpRow.email.split(":");
            const memberEmail = parts.slice(2).join(":");  // line:{userId}:{email}
            const mem = (await db.execute({ sql: "SELECT id FROM soluna_members WHERE email=? OR email=?", args: [memberEmail, memberEmail] })).rows[0];
            if (mem) {
              await db.execute({ sql: "UPDATE soluna_members SET line_user_id=? WHERE id=?", args: [lineUserId2, mem.id] });
              if (LINE_CHANNEL_ACCESS_TOKEN && ev.replyToken) {
                await fetch("https://api.line.me/v2/bot/message/reply", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
                  body: JSON.stringify({ replyToken: ev.replyToken, messages: [{ type: "text", text: "✅ LINE連携完了！\n\n予約リマインダーやコミュニティ通知がここに届きます。\n\nヘルプ — コマンド一覧\n物件 — 物件一覧\n予約状況 — 予約確認" }] })
                }).catch(() => {});
              }
            }
          } else {
            if (LINE_CHANNEL_ACCESS_TOKEN && ev.replyToken) {
              await fetch("https://api.line.me/v2/bot/message/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
                body: JSON.stringify({ replyToken: ev.replyToken, messages: [{ type: "text", text: "コードが無効か期限切れです。\nもう一度メールアドレスを送ってください。" }] })
              }).catch(() => {});
            }
          }
        } catch {}
      } else {
        // LINE コマンド処理
        const member = (await db.execute({ sql: "SELECT id, name, email, member_type FROM soluna_members WHERE line_user_id=?", args: [lineUserId] })).rows[0];
        // LINE reply helper: text or Flex
        const lineReply = async (messages, quickReplies) => {
          if (!LINE_CHANNEL_ACCESS_TOKEN || !ev.replyToken) return;
          const msgs = Array.isArray(messages) ? messages : [{ type: "text", text: String(messages) }];
          if (quickReplies && msgs[msgs.length - 1]) {
            msgs[msgs.length - 1].quickReply = lineQuickReply(quickReplies);
          }
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
            body: JSON.stringify({ replyToken: ev.replyToken, messages: msgs.slice(0, 5) })
          }).catch(() => {});
        };

        const cmd = text.replace(/　/g, " ").trim();
        const cmdLow = cmd.toLowerCase();

        if (!member) {
          // 未登録
          await lineReply([{
            type: "flex", altText: "SOLUNAへようこそ",
            contents: {
              type: "bubble",
              body: {
                type: "box", layout: "vertical", paddingAll: "20px", spacing: "md",
                contents: [
                  { type: "image", url: "https://solun.art/img/sol-line-icon.png", size: "60px", aspectMode: "cover", align: "center" },
                  { type: "text", text: "SOLUNAへようこそ", weight: "bold", size: "lg", color: "#c8a455", align: "center", margin: "md" },
                  { type: "text", text: "LINEと連携するには、SOLUNAに登録したメールアドレスを送信してください。", size: "sm", color: "#888888", wrap: true, align: "center", margin: "sm" },
                  { type: "separator", margin: "lg", color: "#1a1a1a" },
                  { type: "text", text: "まだ登録していない方は下のボタンから", size: "xs", color: "#555555", align: "center", margin: "md" },
                  { type: "button", action: { type: "uri", label: "solun.art でアカウント作成", uri: "https://solun.art/app" }, style: "primary", color: "#c8a455", margin: "sm" }
                ]
              },
              styles: { body: { backgroundColor: "#0a0a0a" } }
            }
          }]);

        } else if (cmdLow === "ヘルプ" || cmdLow === "help" || cmdLow === "メニュー" || cmdLow === "menu") {
          await lineReply([{
            type: "flex", altText: "SOLUNAメニュー",
            contents: {
              type: "bubble",
              header: {
                type: "box", layout: "vertical", paddingAll: "16px", backgroundColor: "#050505",
                contents: [{ type: "text", text: "SOLUNA", weight: "bold", size: "xl", color: "#c8a455" }]
              },
              body: {
                type: "box", layout: "vertical", spacing: "sm", paddingAll: "12px",
                contents: [
                  { type: "button", action: { type: "message", label: "🏔 物件一覧", text: "物件" }, style: "secondary", height: "sm" },
                  { type: "button", action: { type: "message", label: "📅 予約を確認", text: "予約状況" }, style: "secondary", height: "sm" },
                  { type: "button", action: { type: "uri", label: "💬 コミュニティチャット", uri: "https://solun.art/chat" }, style: "secondary", height: "sm" },
                  { type: "button", action: { type: "uri", label: "🏠 アプリを開く", uri: "https://solun.art/app" }, style: "primary", color: "#c8a455", height: "sm" },
                ]
              },
              footer: {
                type: "box", layout: "vertical", paddingAll: "12px",
                contents: [{ type: "text", text: "退会するには「退会」と送信", size: "xxs", color: "#333333", align: "center" }]
              },
              styles: { body: { backgroundColor: "#0a0a0a" }, footer: { backgroundColor: "#0a0a0a" } }
            }
          }]);

        } else if (cmdLow === "予約状況" || cmdLow === "予約") {
          const bookings = (await db.execute({
            sql: "SELECT * FROM soluna_bookings WHERE member_id=? AND check_out >= date('now') AND status != 'cancelled' ORDER BY check_in LIMIT 5",
            args: [member.id],
          })).rows;
          if (!bookings.length) {
            await lineReply(
              [{ type: "text", text: "現在の予約はありません。\n物件を選んで予約してみましょう！" }],
              [["物件一覧を見る", "物件"], ["アプリを開く", "ヘルプ"]]
            );
          } else {
            const flexBubbles = bookings.map(b => {
              const prop = SOLUNA_PROPERTIES[b.property_slug] || {};
              return lineFlexBooking(b, prop.name);
            });
            await lineReply([{
              type: "flex", altText: `予約${bookings.length}件`,
              contents: flexBubbles.length === 1 ? flexBubbles[0] : { type: "carousel", contents: flexBubbles }
            }], [["予約状況を更新", "予約状況"], ["物件一覧", "物件"]]);
          }

        } else if (cmdLow.startsWith("キャンセル")) {
          const parts = cmd.split(/[\s　]+/);
          const bookingId = Number(parts[1]);
          if (!bookingId) {
            await lineReply(
              [{ type: "text", text: "キャンセルする予約IDを入力してください。\n例: キャンセル 123\n\n予約IDは「予約状況」で確認できます。" }],
              [["予約状況を確認", "予約状況"]]
            );
          } else {
            const booking = (await db.execute({
              sql: "SELECT * FROM soluna_bookings WHERE id=? AND member_id=? AND status != 'cancelled'",
              args: [bookingId, member.id],
            })).rows[0];
            if (!booking) {
              await lineReply([{ type: "text", text: `予約ID ${bookingId} が見つかりません。` }], [["予約状況を確認", "予約状況"]]);
            } else {
              const prop = SOLUNA_PROPERTIES[booking.property_slug] || {};
              const daysUntil = Math.ceil((new Date(booking.check_in) - new Date()) / 86400000);
              const cancelFee = daysUntil < 7 ? (prop.stay_price || 0) : 0;
              const policy = daysUntil >= 7 ? "無料キャンセル" : `キャンセル料 ¥${cancelFee.toLocaleString()}`;
              await db.execute({ sql: "UPDATE soluna_bookings SET status='cancelled' WHERE id=?", args: [bookingId] });
              if (booking.coupon_id) await db.execute({ sql: "UPDATE soluna_coupons SET nights_used=MAX(0,nights_used-?) WHERE id=?", args: [booking.nights, booking.coupon_id] });
              if (TG_TOKEN && TG_CHAT) sendTg(TG_CHAT, `❌ LINE予約キャンセル\n${member.email}\n${prop.name||''} ${booking.check_in}`).catch(() => {});
              await lineReply([{
                type: "flex", altText: "キャンセル完了",
                contents: {
                  type: "bubble",
                  body: {
                    type: "box", layout: "vertical", paddingAll: "20px", spacing: "md",
                    contents: [
                      { type: "text", text: "✅ キャンセル完了", weight: "bold", size: "lg", color: "#5ab55a" },
                      { type: "text", text: `${prop.name||''}`, size: "md", color: "#f0ece4", margin: "md" },
                      { type: "text", text: `${booking.check_in} 〜 ${booking.check_out}`, size: "sm", color: "#888888" },
                      { type: "text", text: policy, size: "sm", color: cancelFee > 0 ? "#e05555" : "#5ab55a", margin: "md", weight: "bold" },
                    ]
                  },
                  styles: { body: { backgroundColor: "#0a0a0a" } }
                }
              }], [["予約状況", "予約状況"], ["物件一覧", "物件"]]);
            }
          }

        } else if (cmdLow === "物件" || cmdLow === "物件一覧") {
          const availableProps = Object.values(SOLUNA_PROPERTIES).filter(p => p.name && p.stay_price);
          const flexBubbles = availableProps.slice(0, 10).map(p => lineFlexProperty(p));
          await lineReply([{
            type: "flex", altText: `SOLUNA物件一覧（${availableProps.length}件）`,
            contents: { type: "carousel", contents: flexBubbles }
          }], [["予約状況", "予約状況"], ["ヘルプ", "ヘルプ"]]);

        } else if (cmdLow === "退会") {
          await lineReply([{
            type: "flex", altText: "退会確認",
            contents: {
              type: "bubble",
              body: {
                type: "box", layout: "vertical", paddingAll: "20px", spacing: "sm",
                contents: [
                  { type: "text", text: "退会しますか？", weight: "bold", size: "lg", color: "#f0ece4" },
                  { type: "text", text: "退会するとログインできなくなります。クーポン・予約履歴は保持されますが、利用できなくなります。", size: "sm", color: "#888888", wrap: true, margin: "md" },
                  { type: "separator", margin: "lg", color: "#1a1a1a" },
                  { type: "text", text: "退会を確定する場合は「退会確認」と送信してください。", size: "xs", color: "#555555", margin: "md", wrap: true },
                ]
              },
              footer: {
                type: "box", layout: "vertical", spacing: "sm", paddingAll: "12px",
                contents: [
                  { type: "button", action: { type: "message", label: "退会を確定する", text: "退会確認" }, style: "secondary", height: "sm", color: "#e05555" },
                  { type: "button", action: { type: "message", label: "キャンセル", text: "ヘルプ" }, style: "primary", color: "#c8a455", height: "sm" }
                ]
              },
              styles: { body: { backgroundColor: "#0a0a0a" }, footer: { backgroundColor: "#0a0a0a" } }
            }
          }]);

        } else if (cmdLow === "退会確認") {
          await db.execute({ sql: "UPDATE soluna_members SET member_type='withdrawn' WHERE id=?", args: [member.id] });
          await db.execute({ sql: "DELETE FROM soluna_sessions WHERE member_id=?", args: [member.id] });
          if (TG_TOKEN && TG_CHAT) sendTg(TG_CHAT, `🚪 LINE退会 ${member.email}`).catch(() => {});
          await lineReply([{ type: "text", text: "退会処理が完了しました。\n\nご利用ありがとうございました。またいつでもお待ちしています。\nsolun.art" }]);

        } else if (cmdLow === "空き" || cmdLow === "空き日程" || cmdLow === "空き状況" || cmdLow === "availability") {
          const availableProps = Object.values(SOLUNA_PROPERTIES).filter(p => p.name && p.stay_price && p.beds24_prop && p.beds24_prop !== 0);
          const lines = availableProps.map(p => `🏔 ${p.name}\nsolun.art/${p.slug}`).join("\n\n");
          await lineReply([{
            type: "flex", altText: "空き状況確認",
            contents: {
              type: "bubble",
              body: {
                type: "box", layout: "vertical", paddingAll: "16px", spacing: "md",
                contents: [
                  { type: "text", text: "空き日程の確認", weight: "bold", size: "lg", color: "#c8a455" },
                  { type: "text", text: "アプリから各物件のカレンダーでご確認いただけます。", size: "sm", color: "#888", wrap: true, margin: "sm" },
                  ...availableProps.slice(0, 6).map(p => ({
                    type: "button",
                    action: { type: "uri", label: `🏔 ${p.name}`, uri: `https://solun.art/${p.slug}` },
                    style: "secondary", height: "sm", margin: "sm"
                  }))
                ]
              },
              styles: { body: { backgroundColor: "#0a0a0a" } }
            }
          }], [["予約状況", "予約状況"], ["物件一覧", "物件"]]);

        } else if (cmdLow === "ガイド" || cmdLow === "チェックイン" || cmdLow === "guide") {
          const upcoming = (await db.execute({
            sql: `SELECT b.*, c.property_slug FROM soluna_bookings b
                  LEFT JOIN soluna_coupons c ON c.id = b.coupon_id
                  WHERE b.member_id=? AND b.check_in >= date('now') AND b.status != 'cancelled'
                  ORDER BY b.check_in LIMIT 1`,
            args: [member.id]
          })).rows[0];
          if (!upcoming) {
            await lineReply([{ type: "text", text: "直近の予約が見つかりません。\n予約状況をご確認ください。" }],
              [["予約状況", "予約状況"], ["物件一覧", "物件"]]);
          } else {
            const prop = SOLUNA_PROPERTIES[upcoming.property_slug] || {};
            await lineReply([{
              type: "flex", altText: "チェックインガイド",
              contents: {
                type: "bubble",
                hero: { type: "image", url: `https://solun.art/img/${prop.img || 'og.jpg'}`, size: "full", aspectRatio: "20:13", aspectMode: "cover" },
                body: {
                  type: "box", layout: "vertical", paddingAll: "16px", spacing: "sm",
                  contents: [
                    { type: "text", text: "チェックインガイド", weight: "bold", size: "sm", color: "#c8a455" },
                    { type: "text", text: prop.name || upcoming.property_slug, weight: "bold", size: "lg", color: "#f0ece4" },
                    { type: "text", text: `${upcoming.check_in} チェックイン`, size: "sm", color: "#888", margin: "xs" },
                  ]
                },
                footer: {
                  type: "box", layout: "vertical", paddingAll: "12px",
                  contents: [
                    { type: "button", action: { type: "uri", label: "ガイドを開く", uri: `https://solun.art/app` }, style: "primary", color: "#c8a455", height: "sm" }
                  ]
                },
                styles: { body: { backgroundColor: "#0a0a0a" }, footer: { backgroundColor: "#0a0a0a" } }
              }
            }]);
          }

        } else if (cmdLow === "フェス" || cmdLow === "zamna" || cmdLow === "ザムナ" || cmdLow === "ハワイ" || cmdLow === "hawaii") {
          await lineReply([{
            type: "flex", altText: "ZAMNA × SOLUNA FEST HAWAII 2026",
            contents: {
              type: "bubble",
              hero: {
                type: "box", layout: "vertical", paddingAll: "28px", backgroundColor: "#050505",
                contents: [
                  { type: "text", text: "ZAMNA × SOLUNA", size: "xs", color: "#c8a455", weight: "bold", letterSpacing: "3px" },
                  { type: "text", text: "FEST HAWAII", size: "xxl", weight: "bold", color: "#f4f0ea", margin: "xs" },
                  { type: "text", text: "2026", size: "lg", color: "#c8a455", weight: "bold", margin: "none" }
                ]
              },
              body: {
                type: "box", layout: "vertical", paddingAll: "20px", spacing: "sm", backgroundColor: "#111",
                contents: [
                  { type: "box", layout: "horizontal", spacing: "md", contents: [
                    { type: "text", text: "日時", size: "xs", color: "#555", flex: 2 },
                    { type: "text", text: "2026年9月5日（土）", size: "xs", color: "#f0ece4", flex: 5, weight: "bold" }
                  ]},
                  { type: "box", layout: "horizontal", spacing: "md", margin: "sm", contents: [
                    { type: "text", text: "場所", size: "xs", color: "#555", flex: 2 },
                    { type: "text", text: "Oahu, Hawaii", size: "xs", color: "#f0ece4", flex: 5 }
                  ]},
                  { type: "box", layout: "horizontal", spacing: "md", margin: "sm", contents: [
                    { type: "text", text: "定員", size: "xs", color: "#555", flex: 2 },
                    { type: "text", text: "限定300名", size: "xs", color: "#c8a455", flex: 5, weight: "bold" }
                  ]},
                  { type: "box", layout: "horizontal", spacing: "md", margin: "sm", contents: [
                    { type: "text", text: "音楽", size: "xs", color: "#555", flex: 2 },
                    { type: "text", text: "ZAMNA Collective（テクノ/EDM）", size: "xs", color: "#f0ece4", flex: 5, wrap: true }
                  ]},
                  { type: "separator", margin: "lg", color: "#222" },
                  { type: "text", text: "先行登録者のみチケット先行購入権", size: "xs", color: "#c8a455", margin: "lg", align: "center" }
                ]
              },
              footer: {
                type: "box", layout: "vertical", paddingAll: "12px", spacing: "sm", backgroundColor: "#0a0a0a",
                contents: [
                  { type: "button", action: { type: "uri", label: "先行登録する → solun.art/zamna", uri: "https://solun.art/zamna" }, style: "primary", color: "#c8a455", height: "sm" }
                ]
              },
              styles: { hero: { backgroundColor: "#050505" }, body: { backgroundColor: "#111" }, footer: { backgroundColor: "#0a0a0a" } }
            }
          }], [["物件", "物件"], ["予約状況", "予約状況"], ["アプリ", "https://solun.art/app"]]);

        } else if (cmdLow === "ワークパーティ" || cmdLow === "work party" || cmdLow === "workparty" || cmdLow === "diy" || cmdLow === "建築") {
          await lineReply([{
            type: "flex", altText: "Work Party — 自然建築体験",
            contents: {
              type: "bubble",
              body: {
                type: "box", layout: "vertical", paddingAll: "20px", spacing: "sm", backgroundColor: "#111",
                contents: [
                  { type: "text", text: "🔨 Work Party", weight: "bold", size: "lg", color: "#c8a455" },
                  { type: "text", text: "自然建築体験イベント", size: "xs", color: "#666", margin: "xs" },
                  { type: "separator", margin: "lg", color: "#222" },
                  { type: "text", text: "北海道弟子屈で実際の建築に参加", size: "sm", color: "#f0ece4", margin: "lg", wrap: true },
                  { type: "box", layout: "vertical", margin: "md", spacing: "sm", contents: [
                    { type: "text", text: "• 版築（土の壁造成）", size: "xs", color: "#888" },
                    { type: "text", text: "• コードウッドサウナ建築", size: "xs", color: "#888" },
                    { type: "text", text: "• ストローベイル施工", size: "xs", color: "#888" },
                    { type: "text", text: "• SIPsパネル（杉CLT＋籾殻断熱）", size: "xs", color: "#888" }
                  ]},
                ]
              },
              footer: {
                type: "box", layout: "vertical", paddingAll: "12px", backgroundColor: "#0a0a0a",
                contents: [
                  { type: "button", action: { type: "uri", label: "詳細・申込 → solun.art/workparty", uri: "https://solun.art/workparty" }, style: "primary", color: "#c8a455", height: "sm" }
                ]
              },
              styles: { body: { backgroundColor: "#111" }, footer: { backgroundColor: "#0a0a0a" } }
            }
          }], [["物件", "物件"], ["ソルに質問", "Work Partyについて詳しく教えてください"]]);

        } else if (cmdLow === "チャット" || cmdLow === "コミュニティ") {
          await lineReply([{
            type: "flex", altText: "コミュニティチャット",
            contents: {
              type: "bubble",
              body: {
                type: "box", layout: "vertical", paddingAll: "20px", spacing: "md",
                contents: [
                  { type: "text", text: "💬 コミュニティチャット", weight: "bold", size: "lg", color: "#c8a455" },
                  { type: "text", text: "メンバー同士でリアルタイムにつながりましょう。", size: "sm", color: "#888", wrap: true, margin: "sm" },
                ]
              },
              footer: {
                type: "box", layout: "vertical", paddingAll: "12px",
                contents: [
                  { type: "button", action: { type: "uri", label: "チャットを開く", uri: "https://solun.art/chat" }, style: "primary", color: "#c8a455", height: "sm" }
                ]
              },
              styles: { body: { backgroundColor: "#0a0a0a" }, footer: { backgroundColor: "#0a0a0a" } }
            }
          }]);

        } else {
          // AI (ソル) が回答
          const displayName = member.name || member.email.split("@")[0];
          if (text.length < 120) {
            // 短文はAIに回答させる
            lineAiReply(lineUserId, ev.replyToken, text, member).catch(() => {});
          } else {
            // 長文はコミュニティチャットへ転送
            const ins = await db.execute({
              sql: `INSERT INTO soluna_community_messages (member_id, display_name, member_type, message, is_ai) VALUES (?,?,?,?,0)`,
              args: [member.id, `${displayName}`, member.member_type || "member", text]
            });
            broadcastCommunity({ type: "message", id: Number(ins.lastInsertRowid), member_id: member.id, display_name: displayName, member_type: member.member_type || "member", message: text, is_ai: 0, created_at: new Date().toISOString() });
            await lineReply(
              [{ type: "text", text: `✓ コミュニティに投稿しました\n\n「ソル、〇〇を教えて」のようにソルに質問することもできます。` }],
              [["チャットを開く", "チャット"], ["予約状況", "予約状況"], ["物件一覧", "物件"]]
            );
          }
        }
      }
    }
  }
});

// LINE: AI reply as ソル
async function lineAiReply(lineUserId, replyToken, question, member) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!LINE_CHANNEL_ACCESS_TOKEN) return;

  // Fetch member's bookings for context
  let ctxBookings = "";
  try {
    const bs = (await db.execute({ sql: "SELECT property_slug,check_in,check_out,status FROM soluna_bookings WHERE member_id=? ORDER BY check_in DESC LIMIT 3", args: [member.id] })).rows;
    if (bs.length) ctxBookings = "\nメンバー予約: " + bs.map(b => `${b.property_slug} ${b.check_in}〜${b.check_out}(${b.status})`).join(", ");
  } catch {}

  let reply = "";
  if (ANTHROPIC_API_KEY) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system: `あなたはSOLUNA（共同所有型リゾートクラブ）のLINEアシスタント「ソル」です。日本語で親切・簡潔に答えてください。250文字以内で。

【物件一覧】
▼北海道 弟子屈町
・TAPKOP ¥8,000万/口(5口)│阿寒摩周国立公園9,000坪│専任シェフ・バレルバス・サウナ│年30泊│泊¥34万│年収益最大¥5,100万
・THE LODGE ¥490万/口(10口)│年30泊│泊¥3.5万│利回り約21%
・NESTING ¥890万/口(10口)│年30泊│泊¥5万
・インスタントハウス ¥120万/口│年30泊│泊¥2.5万│利回り約62%
・天空の道場(KUMAUSHI) ¥480万/口│武道場・自然体験│2026年9月オープン
・美留和ビレッジ ¥490万/口│2026年9月オープン
▼熱海
・WHITE HOUSE 熱海 ¥1,900万/口│年36泊│泊¥5.5万
▼ハワイ(2026年11月オープン)
・HONOLULU VILLA ¥2,800万/口│月単位滞在│泊¥8.5万
・HAWAII KAI HOUSE ¥3,800万/口│月単位滞在│泊¥12万

【投資・リターン】
East Ventures 5,000万円出資済み・登記所有・2020年創業・表面利回り約27%(物件によって異なる)

【ZAMNA × SOLUNA FEST HAWAII 2026】
日時: 2026年9月5日(土)│場所: オアフ島ハワイ│定員: 限定300名│音楽: ZAMNA Collective(テクノ/EDM)│宿泊: SOLUNA提携先を案内予定(先行登録後)│先行登録: solun.art/zamna ← 先行登録者のみチケット先行購入権あり
※HONOLULU VILLAは2026年11月オープン予定のため、フェスト時期(9月)の宿泊先は先行登録者に別途ご案内

【Work Party（自然建築体験）】
北海道弟子屈で版築・コードウッドサウナ・ストローベイル施工体験│SIPsパネル: 杉CLT+籾殻断熱+竹集成材│詳細: solun.art/workparty

【予約・アプリ】solun.art/app

メンバー: ${member.email}(${member.member_type || 'member'})${ctxBookings}

---質問の文脈でペルソナを判断---
投資・利回り・口数・ROI → 具体的な数字で回答、East Ventures実績を添える
DIY・建築・素材・コードウッド・ストローベイル・SIPs → Work Party情報と自然建材スペック
フェス・ZAMNA・ハワイ・テクノ・EDM → ZAMNA FESTの日程・定員・登録リンクを必ず伝える
空き家・移住・地方・瀬戸内・和歌山 → 空き家リノベプロジェクトと体験施工を案内`,
          messages: [{ role: "user", content: question }]
        })
      });
      const data = await r.json();
      reply = data.content?.[0]?.text || "";
    } catch {}
  }

  if (!reply) reply = "少々お待ちください。詳細は solun.art/app でご確認いただけます。";

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
    body: JSON.stringify({
      replyToken,
      messages: [{
        type: "flex", altText: reply.slice(0, 50),
        contents: {
          type: "bubble",
          header: {
            type: "box", layout: "horizontal", paddingAll: "12px", backgroundColor: "#0a0a0a", spacing: "sm",
            contents: [
              { type: "text", text: "ソル", weight: "bold", size: "sm", color: "#c8a455", flex: 0 },
              { type: "text", text: " SOLUNA AI", size: "xs", color: "#555", margin: "sm" }
            ]
          },
          body: {
            type: "box", layout: "vertical", paddingAll: "16px",
            contents: [{ type: "text", text: reply, size: "sm", color: "#e8e0cc", wrap: true }]
          },
          footer: {
            type: "box", layout: "horizontal", paddingAll: "10px", spacing: "sm",
            contents: [
              { type: "button", action: { type: "message", label: "予約", text: "予約状況" }, style: "secondary", height: "sm", flex: 1 },
              { type: "button", action: { type: "message", label: "物件", text: "物件" }, style: "secondary", height: "sm", flex: 1 },
              { type: "button", action: { type: "uri", label: "アプリ", uri: "https://solun.art/app" }, style: "primary", color: "#c8a455", height: "sm", flex: 1 },
            ]
          },
          styles: { header: { backgroundColor: "#0a0a0a" }, body: { backgroundColor: "#111" }, footer: { backgroundColor: "#0a0a0a" } }
        }
      }]
    })
  }).catch(() => {});
}

// LINE: push message to admin (if they have line_user_id linked)
async function linePushAdmin(text) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return;
  try {
    const admin = (await db.execute({ sql: "SELECT line_user_id FROM soluna_members WHERE member_type='admin' AND line_user_id IS NOT NULL AND line_user_id != '' LIMIT 1" })).rows[0];
    if (!admin) return;
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
      body: JSON.stringify({ to: admin.line_user_id, messages: [{ type: "text", text }] })
    });
  } catch {}
}

// LINE: push check-in reminder to members checking in tomorrow
async function lineCheckinReminders() {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return;
  try {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tStr = tomorrow.toISOString().slice(0, 10);
    const bookings = (await db.execute({
      sql: `SELECT b.*, sm.line_user_id, sm.name as mname
            FROM soluna_bookings b
            JOIN soluna_members sm ON sm.id = b.member_id
            WHERE b.check_in = ? AND b.status = 'confirmed' AND sm.line_user_id IS NOT NULL AND sm.line_user_id != ''`,
      args: [tStr]
    })).rows;
    for (const b of bookings) {
      const prop = SOLUNA_PROPERTIES[b.property_slug] || {};
      await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` },
        body: JSON.stringify({
          to: b.line_user_id,
          messages: [{
            type: "flex", altText: `明日チェックインです — ${prop.name || b.property_slug}`,
            contents: {
              type: "bubble",
              hero: { type: "image", url: `https://solun.art/img/${prop.img || 'og.jpg'}`, size: "full", aspectRatio: "20:13", aspectMode: "cover" },
              body: {
                type: "box", layout: "vertical", paddingAll: "16px", spacing: "sm",
                contents: [
                  { type: "text", text: "🌅 明日チェックインです", weight: "bold", size: "md", color: "#c8a455" },
                  { type: "text", text: prop.name || b.property_slug, weight: "bold", size: "lg", color: "#f0ece4", margin: "sm" },
                  { type: "box", layout: "horizontal", margin: "md", spacing: "md", contents: [
                    { type: "box", layout: "vertical", contents: [
                      { type: "text", text: "チェックイン", size: "xxs", color: "#555" },
                      { type: "text", text: b.check_in, size: "sm", color: "#f0ece4", weight: "bold" }
                    ]},
                    { type: "box", layout: "vertical", contents: [
                      { type: "text", text: "チェックアウト", size: "xxs", color: "#555" },
                      { type: "text", text: b.check_out, size: "sm", color: "#f0ece4", weight: "bold" }
                    ]},
                  ]},
                  { type: "text", text: "チェックインガイドをご確認ください。良いご滞在を！", size: "sm", color: "#888", wrap: true, margin: "md" },
                ]
              },
              footer: {
                type: "box", layout: "vertical", paddingAll: "12px",
                contents: [{ type: "button", action: { type: "uri", label: "ガイドを開く", uri: "https://solun.art/app" }, style: "primary", color: "#c8a455", height: "sm" }]
              },
              styles: { body: { backgroundColor: "#0a0a0a" }, footer: { backgroundColor: "#0a0a0a" } }
            }
          }]
        })
      }).catch(() => {});
    }
    if (bookings.length) console.log(`[LINE] Sent ${bookings.length} check-in reminders for ${tStr}`);
  } catch(e) { console.error("[LINE] checkin reminder error:", e.message); }
}

// Schedule check-in reminder daily at 9am JST (0am UTC)
setInterval(() => {
  const now = new Date();
  if (now.getUTCHours() === 0 && now.getUTCMinutes() < 5) lineCheckinReminders().catch(() => {});
}, 5 * 60 * 1000);

// AI reply to community
async function aiCommunityReply(userMessage, userName) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `あなたはSOLUNA（共同所有型リゾート）のAIアシスタント「ソル」です。コミュニティチャットに参加し、メンバーの質問に自然で親しみやすい日本語で短く回答してください。物件は北海道（TAPKOP・THE LODGE・NESTING・インスタントハウス・KUMAUSHI BASE・美留和ビレッジ）・熱海（WHITE HOUSE 熱海）・ハワイ（HONOLULU BEACH VILLA・HAWAII KAI HOUSE）にあります。

建築哲学の知識を持ち、会話の流れに自然に合う場合は著名建築家の言葉を引用してください：
- 安藤忠雄「光は空間の本質を明らかにし、建築を詩にする」
- ピーター・ズントー「空間の記憶は、身体の記憶だ」
- 隈研吾「素材と自然が対話するとき、建築は呼吸を始める」
- ミース・ファン・デル・ローエ「Less is more」
- ル・コルビュジェ「空間、光、秩序。これが人間が求めるものだ」
- F.L.ライト「大地から生えたように、建物は場所に根ざすべきだ」
- 槇文彦「集合体の中に、個の美しさが生まれる」
- グレン・マーカット「地球に軽く触れよ」
- アルヴァ・アアルト「素材の温かさが、空間に人間性をもたらす」
- ルイス・カーン「建築とは、空間を通じた意志の表現だ」

必ず150文字以内で。建築引用は5回に1回程度、自然な文脈でのみ使用する。`,
        messages: [{ role: "user", content: `${userName}さんのメッセージ: "${userMessage}"` }]
      })
    });
    const data = await r.json();
    const reply = data.content?.[0]?.text;
    if (!reply) return;

    const ins = await db.execute({
      sql: `INSERT INTO soluna_community_messages (member_id, display_name, member_type, message, is_ai) VALUES (0,'ソル AI','ai',?,1)`,
      args: [reply]
    });
    const payload = {
      type: "message",
      id: Number(ins.lastInsertRowid),
      member_id: 0,
      display_name: "ソル AI",
      member_type: "ai",
      message: reply,
      is_ai: 1,
      created_at: new Date().toISOString()
    };
    broadcastCommunity(payload);
  } catch(e) {
    console.error("AI community reply error:", e.message);
  }
}

// ── MCP Server (Model Context Protocol) ──────────────────────────────────────
const SOLUNA_KB = {
  resort: `SOLUNA — 共同所有型リゾート
場所: 北海道弟子屈（川湯温泉エリア）/ 熱海 / ハワイ（2026年秋〜）
創業者: 濱田優貴（Enabler CEO, ex-Mercari CPO）
コンセプト: 自分が「作ったもの」として残る、建物と体験の場

## 物件一覧
| 物件 | 購入価格 | 滞在単価 | 状態 |
|------|---------|---------|------|
| TAPKOP（北海道） | ¥80,000,000 | ¥340,000/泊 | 公開中 |
| THE LODGE（北海道） | ¥4,900,000 | ¥35,000/泊 | 公開中 |
| NESTING（北海道） | ¥8,900,000 | ¥50,000/泊 | 公開中 |
| インスタントハウス（北海道） | ¥1,200,000 | ¥25,000/泊 | 公開中 |
| WHITE HOUSE 熱海 | ¥19,000,000 | ¥55,000/泊 | 公開中 |
| KUMAUSHI BASE（北海道） | ¥4,800,000 | ¥80,000/泊 | 2026-09 オープン |
| 美留和ビレッジ（北海道） | ¥4,900,000 | ¥30,000/泊 | 2026-09 オープン |
| HONOLULU BEACH VILLA（ハワイ） | ¥28,000,000 | ¥85,000/泊 | 2026-11 オープン |
| HAWAII KAI HOUSE（マウイ） | ¥38,000,000 | ¥120,000/泊 | 2026-11 オープン |

公式サイト: https://solun.art`,

  howto: `SOLUNAの仕組み
1. 口数を購入 → 物件の共同オーナーになる
2. 年間30泊の滞在権（クーポン）を取得
3. アプリから希望日を予約して利用

メンバー限定の特典:
- NOT A HOTELの全施設も利用可能
- オーナーコミュニティ参加
- 収益シェア（一部物件）

登録・購入は https://solun.art から`,

  festival: `ZAMNA × SOLUNA FEST HAWAII 2026
日時: 2026年9月5日（土）オアフ島ハワイ
音楽: ZAMNA Collective（テクノ / EDM）
定員: 限定300名
宿泊: HONOLULU VILLA 宿泊可（SOLUNA物件）
先行登録: https://solun.art/zamna ← 先行登録者のみチケット先行購入権あり
詳細: 詳細が決まり次第、先行登録者に最速でお知らせ

ZAMNAはメキシコ・トゥルム発のテクノ/EDMフェスティバル。自然と音楽を融合したコンセプトでSOLUNAとコラボ。
注意: HONOLULU VILLA / HAWAII KAI HOUSEは2026年11月オープン予定。フェスト(9月)時点では未開業。フェスト参加者の宿泊先は先行登録後に別途ご案内。
11月以降のハワイ滞在はSOLUNA物件（月単位）が利用可能。`,

  contact: `お問い合わせ
メール: info@solun.art
創業者: mail@yukihamada.jp（濱田優貴）
公式サイト: https://solun.art`
};

function solunaContext(query) {
  const q = (query || "").toLowerCase();
  const parts = [];
  if (q.match(/物件|lodge|nesting|tapkop|kumaushi|熱海|atami|ハワイ|honolulu|maui|villa/)) parts.push(SOLUNA_KB.resort);
  if (q.match(/方法|どうやって|購入|予約|仕組み|how|buy|book|join|member|口数/)) parts.push(SOLUNA_KB.howto);
  if (q.match(/fest|festival|フェス|ticket|チケット|hawaii.*fest|concert|zamna|ザムナ|テクノ|edm/)) parts.push(SOLUNA_KB.festival);
  if (parts.length === 0) { parts.push(SOLUNA_KB.resort); parts.push(SOLUNA_KB.howto); }
  return parts.join("\n\n");
}

// Try m5 HITL first (human-curated responses), fall back to Anthropic.
async function solunaAsk(question) {
  const context = solunaContext(question);

  // 1. Try m5 HITL
  const m5Url = m5RuntimeUrl;
  if (m5Url) {
    try {
      const res = await fetch(m5Url.replace(/\/$/, "") + "/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, context, site: "soluna" }),
        signal: AbortSignal.timeout(90000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.text && data.text.trim()) return data.text;
      }
    } catch (_) { /* fall through */ }
  }

  // 2. Fallback: Anthropic
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "AI not configured. See https://solun.art for info.";
  const system = `あなたはSOLUNA（solun.art）のAIアシスタントです。
SOLUNAは濱田優貴が創った共同所有型リゾートです。北海道弟子屈・熱海・ハワイに物件があります。
質問と同じ言語（日本語または英語）で簡潔に答えてください。マークダウンは使わないでください。

知識ベース:
${context}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 512, system, messages: [{ role: "user", content: question }] }),
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.json();
    return data?.content?.[0]?.text || "すみません、答えられませんでした。";
  } catch (e) {
    return "エラーが発生しました: " + e.message;
  }
}

function mcpToolsList() {
  return {
    tools: [
      { name: "get_resort_info", description: "SOLUNAリゾートの物件一覧・価格・場所を取得", inputSchema: { type: "object", properties: {} } },
      { name: "get_howto", description: "SOLUNAの購入・予約・メンバー登録の方法を取得", inputSchema: { type: "object", properties: {} } },
      { name: "get_festival_info", description: "SOLUNA FEST HAWAII 2026の情報（日程・チケット・会場）を取得", inputSchema: { type: "object", properties: {} } },
      { name: "get_contact", description: "SOLUNAの連絡先を取得", inputSchema: { type: "object", properties: {} } },
      { name: "ask_soluna", description: "SOLUNAに関する質問にAIが回答。物件・予約・フェス・購入方法など", inputSchema: { type: "object", properties: { question: { type: "string", description: "質問内容" } }, required: ["question"] } }
    ]
  };
}

async function mcpToolCall(name, args) {
  switch (name) {
    case "get_resort_info": return { content: [{ type: "text", text: SOLUNA_KB.resort }] };
    case "get_howto": return { content: [{ type: "text", text: SOLUNA_KB.howto }] };
    case "get_festival_info": return { content: [{ type: "text", text: SOLUNA_KB.festival }] };
    case "get_contact": return { content: [{ type: "text", text: SOLUNA_KB.contact }] };
    case "ask_soluna": {
      const text = await solunaAsk(args?.question || "");
      return { content: [{ type: "text", text }] };
    }
    default: return null;
  }
}

async function handleMcpReq(req) {
  const id = req.id ?? null;
  switch (req.method) {
    case "initialize":
      return { jsonrpc: "2.0", id, result: { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "soluna", version: "1.0.0" } } };
    case "notifications/initialized":
    case "ping":
      return { jsonrpc: "2.0", id, result: {} };
    case "tools/list":
      return { jsonrpc: "2.0", id, result: mcpToolsList() };
    case "tools/call": {
      const result = await mcpToolCall(req.params?.name, req.params?.arguments);
      if (!result) return { jsonrpc: "2.0", id, error: { code: -32602, message: "Unknown tool: " + req.params?.name } };
      return { jsonrpc: "2.0", id, result };
    }
    default:
      return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found: " + req.method } };
  }
}

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type" };

// ── m5 HITL URL registration ─────────────────────────────────────────────
// Allow the m5 watchdog to auto-update the tunnel URL when it changes.
app.post("/api/m5/register", express.json(), (req, res) => {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const required = process.env.M5_REGISTER_TOKEN || "";
  if (!required || token !== required) return res.status(401).json({ error: "unauthorized" });
  const url = (req.body?.url || "").trim();
  if (!/^https?:\/\//.test(url)) return res.status(400).json({ error: "invalid url" });
  m5RuntimeUrl = url;
  process.env.M5_HITL_URL = url;
  console.log(`[m5] URL registered: ${url}`);
  res.json({ ok: true, url });
});
app.get("/api/m5/status", (_req, res) => {
  res.json({ registered: !!m5RuntimeUrl, url: m5RuntimeUrl });
});

app.options("/api/mcp", (_, res) => res.set(CORS_HEADERS).status(204).end());
app.get("/api/mcp", (_, res) => res.set(CORS_HEADERS).json({ name: "SOLUNA MCP Server", endpoint: "https://solun.art/api/mcp", tools: ["get_resort_info","get_howto","get_festival_info","get_contact","ask_soluna"] }));
app.post("/api/mcp", express.json(), async (req, res) => {
  res.set(CORS_HEADERS);
  const body = req.body;
  if (Array.isArray(body)) {
    const results = await Promise.all(body.map(handleMcpReq));
    return res.json(results);
  }
  res.json(await handleMcpReq(body));
});

app.options("/api/a2a", (_, res) => res.set(CORS_HEADERS).status(204).end());
app.get("/api/a2a", (_, res) => res.set(CORS_HEADERS).json({ name: "SOLUNA A2A Agent", url: "https://solun.art/api/a2a", agentCard: "https://solun.art/.well-known/agent.json" }));
app.post("/api/a2a", express.json(), async (req, res) => {
  res.set(CORS_HEADERS);
  const taskId = req.body?.id ?? "unknown";
  const question = (req.body?.message?.parts || []).filter(p => p.type === "text").map(p => p.text || "").join(" ").trim();
  const answer = question ? await solunaAsk(question) : "SOLUNAについて何でも聞いてください。";
  res.json({ id: taskId, status: { state: "completed", message: { role: "agent", parts: [{ type: "text", text: answer }] } } });
});

// ── Document Vault ────────────────────────────────────────────────────────────

const DOC_TYPE_LABEL = {
  contract: "売買契約書",
  inspection: "重要事項説明書",
  receipt: "領収書",
  repair: "修繕記録",
  other: "その他書類",
};

// Public listing — metadata only, no file content
app.get("/api/soluna/docs/:slug", async (req, res) => {
  const { slug } = req.params;
  const r = await db.execute({
    sql: "SELECT id, title, doc_type, filename, file_size, created_at FROM property_documents WHERE slug=? AND is_listed=1 ORDER BY created_at",
    args: [slug],
  });
  res.json({ slug, documents: r.rows });
});

// Protected download — owner / admin / disclosed parties only
app.get("/api/soluna/docs/:slug/:id/download", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m) return res.status(401).json({ error: "unauthorized" });

  const { slug, id } = req.params;
  const docRow = await db.execute({
    sql: "SELECT * FROM property_documents WHERE id=? AND slug=?",
    args: [Number(id), slug],
  });
  if (!docRow.rows.length) return res.status(404).json({ error: "not found" });
  const doc = docRow.rows[0];

  let hasAccess = m.nah_access === 1;
  if (!hasAccess) {
    const coupon = await db.execute({
      sql: "SELECT id FROM soluna_coupons WHERE member_id=? AND property_slug=? LIMIT 1",
      args: [m.member_id, slug],
    });
    hasAccess = coupon.rows.length > 0;
  }
  if (!hasAccess) {
    const disclosed = await db.execute({
      sql: "SELECT id FROM document_disclosures WHERE doc_id=? AND email=? LIMIT 1",
      args: [doc.id, m.email],
    });
    hasAccess = disclosed.rows.length > 0;
  }
  if (!hasAccess) return res.status(403).json({ error: "forbidden" });

  if (!s3) return res.status(503).json({ error: "storage not configured" });
  const s3Resp = await s3Get(doc.s3_key);
  if (!s3Resp) return res.status(404).json({ error: "file missing in storage" });

  res.setHeader("Content-Type", doc.content_type || "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(doc.filename)}`);
  if (doc.file_size) res.setHeader("Content-Length", doc.file_size);
  s3Resp.Body.transformToWebStream().pipeTo(
    new WritableStream({ write(chunk) { res.write(chunk); }, close() { res.end(); } })
  ).catch(() => res.end());
});

// Admin upload endpoint
app.post("/api/soluna/docs/:slug/upload", docUpload.single("file"), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m || m.nah_access !== 1) return res.status(403).json({ error: "admin only" });
  if (!req.file) return res.status(400).json({ error: "no file" });

  const { slug } = req.params;
  const { title, doc_type = "contract" } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  if (!s3) return res.status(503).json({ error: "storage not configured" });

  const ext = path.extname(req.file.originalname).toLowerCase() || ".pdf";
  const uid = crypto.randomUUID();
  const s3Key = `docs/${slug}/${uid}${ext}`;

  await s3Put(s3Key, req.file.buffer, req.file.mimetype);

  const r = await db.execute({
    sql: "INSERT INTO property_documents (slug, title, doc_type, s3_key, filename, content_type, file_size, uploaded_by) VALUES (?,?,?,?,?,?,?,?)",
    args: [slug, title, doc_type, s3Key, req.file.originalname, req.file.mimetype, req.file.size, m.email],
  });
  res.json({ ok: true, id: Number(r.lastInsertRowid), s3_key: s3Key });
});

// Admin disclose — grant specific email access to a document
app.post("/api/soluna/docs/disclose", express.json(), async (req, res) => {
  const m = await solunaAuth(req);
  if (!m || m.nah_access !== 1) return res.status(403).json({ error: "admin only" });

  const { doc_id, email } = req.body;
  if (!doc_id || !email) return res.status(400).json({ error: "doc_id and email required" });

  await db.execute({
    sql: "INSERT OR REPLACE INTO document_disclosures (doc_id, email, granted_by) VALUES (?,?,?)",
    args: [doc_id, email.toLowerCase().trim(), m.email],
  });
  res.json({ ok: true });
});

// Admin: manufacturing page view logs
app.get("/api/soluna/admin/page-views", async (req, res) => {
  const m = await solunaAuth(req);
  if (!m || m.member_type !== "admin") return res.status(403).json({ error: "admin only" });
  const r = await db.execute({
    sql: "SELECT id, email, page, ip, viewed_at FROM soluna_page_views ORDER BY id DESC LIMIT 500",
    args: [],
  });
  res.json({ views: r.rows });
});

// ── Pages listing API (desk.html auto-populate) ──────────────────────────────
// Internal pages excluded from public /api/pages listing
const INTERNAL_PAGE_SLUGS = new Set([
  'admin','agent','member','owners','report','status','progress',
  'booking-analytics','visitor-log','management-fee','staff',
  'soluna-dashboard','neuro-dashboard','kaisha','kaisha-teikan',
  'kaisha-shinsei','kaisha-haraikomi','kaisha-checklist','kaisha-status',
  'plan','sites','slide','strategy','network','approve',
]);

app.get("/api/pages", async (req, res) => {
  // Admins see all pages; others see public pages only
  const m = await solunaAuth(req).catch(() => null);
  const isAdmin = m && m.member_type === 'admin';

  const result = [];
  try {
    const files = fs.readdirSync(CABIN_DIR).filter(f => f.endsWith(".html") && !f.startsWith("_"));
    files.forEach(f => {
      const slug = f.slice(0, -5);
      if (!isAdmin && INTERNAL_PAGE_SLUGS.has(slug)) return;
      const st = fs.statSync(path.join(CABIN_DIR, f));
      result.push({ path: "/" + slug, filename: f, dir: "cabin", mtime: st.mtimeMs });
    });
  } catch {}
  const DOCS_DIR = path.join(__dirname, "docs");
  try {
    const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith(".html") && !f.startsWith("_"));
    files.forEach(f => {
      const st = fs.statSync(path.join(DOCS_DIR, f));
      let title = f.slice(0, -5).replace(/^\d+_/, "").replace(/_/g, " ");
      try {
        const head = fs.readFileSync(path.join(DOCS_DIR, f), "utf8").slice(0, 2000);
        const m = head.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (m) title = m[1].replace(/\s*—.*$/, "").replace(/\s*\|.*$/, "").trim();
      } catch {}
      result.push({ path: "/docs/" + f.slice(0, -5), filename: f, dir: "docs", mtime: st.mtimeMs, title });
    });
  } catch {}
  result.sort((a, b) => b.mtime - a.mtime);
  res.json({ pages: result, total: result.length });
});

app.all("/api/*", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ── Auth-gated sensitive files ────────────────────────────────────────────────
const GATED_IMG_FILES = new Set(['teshikaga_97_detail.pdf']);
app.get("/img/:file", async (req, res, next) => {
  if (!GATED_IMG_FILES.has(req.params.file)) return next();
  const m = await solunaAuth(req).catch(() => null);
  if (!m || m.member_type !== 'admin') return res.status(403).json({ error: "forbidden" });
  res.sendFile(path.join(__dirname, "cabin", "img", req.params.file));
});

// ── Legal documents (/contracts/* — served from contracts/ dir) ──────────────
app.use("/contracts", express.static(path.join(__dirname, "contracts"), { maxAge: "0", etag: false, extensions: ["html"] }));

// ── Cabin images (/img/* — served from cabin/img/, fallback to teshikaga CDN) ─
app.use("/img", express.static(path.join(__dirname, "cabin", "img"), { maxAge: "7d" }));
app.get("/img/*", (req, res) => {
  res.redirect(301, "https://soluna-teshikaga.fly.dev" + req.path);
});

// ── Auth-gated pages ─────────────────────────────────────────────────────────
// Paths (without leading slash, without .html) that require SOLUNA member login.
// Covers: manufacturing specs, admin/ops, owner content, finance, purchase flow.
const GATED_PAGES = new Set([
  // ── Server-side full gate (no public overview) ──────────────────────────────
  // Admin / operations — truly private
  "admin","approve","ops","kumaushi-ops","materials-admin",
  "visitor-log","neuro-dashboard","neuro-portal","report","staff",
  // Owner / member content
  "owners","miruwa-owners","members","miruwa-photobook",
  // Short spec pages — entire page IS the detail, no overview
  "blueprint","structural","floorplans","systems",
  "sips","sips-diy","sips-lab","hybrid-sips","take-sips",
  "village-materials","miruwa-anatomy","k4-anatomy",
  "offgrid","offgrid-cabin",
  // Purchase action pages (have their own auth flow but still gate URL)
  "pay","referral",
  // Admin-only (checked again below with email guard)
  "strategy",
  //
  // NOTE: manufacturing/*, design, plan, management-fee, buy
  //       use CLIENT-SIDE partial gate via /js/gate.js
  //       (first N sections public, rest blurred with inline login card)
]);

// Page labels for the gate page title
const GATED_PAGE_LABELS = {
  "admin":"管理画面","approve":"承認","ops":"オペレーション","kumaushi-ops":"熊牛オペレーション",
  "materials-admin":"建材管理","visitor-log":"来訪者ログ","neuro-dashboard":"Neuro Dashboard",
  "neuro-portal":"Neuro Portal","report":"レポート","staff":"スタッフ",
  "owners":"オーナー専用","miruwa-owners":"美留和オーナー","members":"メンバー一覧",
  "miruwa-photobook":"美留和フォトブック","blueprint":"設計書","structural":"構造設計",
  "floorplans":"間取り図","scheme":"事業スキーム","design":"デザイン仕様",
  "systems":"システム仕様","sips":"SIPパネル工法","sips-diy":"SIP DIY",
  "sips-lab":"SIPラボ","hybrid-sips":"ハイブリッドSIP","take-sips":"タケSIP",
  "village-materials":"ビレッジ建材","miruwa-anatomy":"美留和解剖","k4-anatomy":"K4解剖",
  "offgrid":"オフグリッド設計","offgrid-cabin":"オフグリッドキャビン",
  "management-fee":"管理費詳細","plan":"事業計画","plans":"プラン一覧",
  "buy":"オーナーになる","pay":"お支払い","referral":"紹介プログラム",
  "strategy":"ポジショニング戦略（非公開）",
};

function authGatePage(pageKey, returnPath) {
  const label = GATED_PAGE_LABELS[pageKey] || pageKey;
  return `<!DOCTYPE html><html lang="ja"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SOLUNA — ログインが必要です</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0908;color:#c8c0b0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.gate{max-width:420px;width:100%;background:#141210;border:1px solid #2a2520;border-radius:8px;padding:40px 36px}
.gate-logo{font-size:11px;font-weight:800;letter-spacing:.25em;color:#c8a455;margin-bottom:32px}
h2{font-size:20px;font-weight:900;margin-bottom:8px;color:#f0ece4}
.sub{font-size:12px;color:#666;margin-bottom:28px;line-height:1.7}
label{display:block;font-size:9px;letter-spacing:.15em;color:#555;margin-bottom:6px;text-transform:uppercase}
input{width:100%;background:#0e0c0a;border:1px solid #2a2520;color:#c8c0b0;padding:12px 14px;border-radius:4px;font-size:13px;outline:none;margin-bottom:12px;font-family:inherit}
input:focus{border-color:#c8a455}
.btn{width:100%;background:#c8a455;color:#0a0908;font-weight:800;font-size:12px;letter-spacing:.12em;padding:14px;border:none;border-radius:4px;cursor:pointer;margin-top:4px}
.btn:hover{background:#d4b068}
.msg{margin-top:14px;font-size:12px;min-height:20px;text-align:center}
.msg.ok{color:#4a9a5a}.msg.err{color:#c0392b}
#step2{display:none}
.back{font-size:11px;color:#555;text-decoration:underline;cursor:pointer;background:none;border:none;margin-top:12px;display:block;text-align:center}
</style>
</head><body>
<div class="gate">
  <div class="gate-logo">SOLUNA</div>
  <h2>${label}</h2>
  <p class="sub">このページはSOLUNAメンバー限定です。<br>メールアドレスを入力してOTPコードを受け取ってください。</p>
  <div id="step1">
    <label>メールアドレス</label>
    <input type="email" id="email" placeholder="your@email.com" autocomplete="email">
    <button class="btn" onclick="sendOtp()">コードを送信</button>
    <div class="msg" id="msg1"></div>
  </div>
  <div id="step2">
    <label>確認コード（メールに届いた6桁）</label>
    <input type="text" id="code" placeholder="000000" maxlength="6" inputmode="numeric">
    <button class="btn" onclick="verifyOtp()">ログインして閲覧</button>
    <button class="back" onclick="document.getElementById('step1').style.display='';document.getElementById('step2').style.display='none'">← メールアドレスを変更</button>
    <div class="msg" id="msg2"></div>
  </div>
</div>
<script>
const RETURN=${JSON.stringify(returnPath)};
async function sendOtp(){
  const email=document.getElementById('email').value.trim();
  if(!email){document.getElementById('msg1').className='msg err';document.getElementById('msg1').textContent='メールアドレスを入力してください';return;}
  document.getElementById('msg1').className='msg';document.getElementById('msg1').textContent='送信中...';
  const r=await fetch('/api/soluna/otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
  const d=await r.json();
  if(r.ok){document.getElementById('step1').style.display='none';document.getElementById('step2').style.display='';document.getElementById('msg2').textContent='';}
  else{document.getElementById('msg1').className='msg err';document.getElementById('msg1').textContent=d.error||'エラーが発生しました';}
}
async function verifyOtp(){
  const email=document.getElementById('email').value.trim();
  const code=document.getElementById('code').value.trim();
  if(!code){document.getElementById('msg2').className='msg err';document.getElementById('msg2').textContent='コードを入力してください';return;}
  document.getElementById('msg2').className='msg';document.getElementById('msg2').textContent='確認中...';
  const r=await fetch('/api/soluna/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,code})});
  const d=await r.json();
  if(r.ok){
    localStorage.setItem('sln_token',d.token);
    document.getElementById('msg2').className='msg ok';document.getElementById('msg2').textContent='ログインしました。ページを読み込んでいます...';
    setTimeout(()=>location.href=RETURN,600);
  } else {
    document.getElementById('msg2').className='msg err';document.getElementById('msg2').textContent=d.error||'コードが正しくありません';
  }
}
document.getElementById('email').addEventListener('keypress',e=>{if(e.key==='Enter')sendOtp()});
document.getElementById('code')&&document.getElementById('code').addEventListener('keypress',e=>{if(e.key==='Enter')verifyOtp()});
</script>
</body></html>`;
}

const CABIN_DIR = path.join(__dirname, "cabin");

// General auth gate middleware — intercepts all GATED_PAGES before express.static
app.use(async (req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  // Normalize: /manufacturing/cluster.html → manufacturing/cluster
  const key = req.path.replace(/^\//, "").replace(/\.html$/, "");
  if (!GATED_PAGES.has(key)) return next();
  const filePath = path.join(CABIN_DIR, key + ".html");
  if (!fs.existsSync(filePath)) return next();

  // Validate session cookie
  const token = parseCookies(req).sln_tok;
  let member = null;
  if (token) {
    const r = await db.execute({
      sql: `SELECT s.member_id, m.email, m.name FROM soluna_sessions s
            JOIN soluna_members m ON m.id=s.member_id
            WHERE s.token=? AND s.expires_at > datetime('now')`,
      args: [token],
    }).catch(() => null);
    member = r && r.rows[0] ? r.rows[0] : null;
  }

  const returnPath = "/" + key + ".html";
  const pageKey = key.replace("manufacturing/", "");

  if (!member) {
    return res.status(401).setHeader("Content-Type","text/html; charset=UTF-8").send(authGatePage(pageKey, returnPath));
  }

  // strategy page: admin-only (mail@yukihamada.jp)
  if (key === "strategy" && member.email !== "mail@yukihamada.jp") {
    return res.status(403).setHeader("Content-Type","text/html; charset=UTF-8").send(
      `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>403</title>
      <style>body{background:#080806;color:#888;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
      p{font-size:.85rem;letter-spacing:.05em}</style></head>
      <body><p>このページへのアクセス権限がありません</p></body></html>`
    );
  }

  // Log the view (fire-and-forget)
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const ua = (req.headers["user-agent"] || "").substring(0, 250);
  db.execute({
    sql: "INSERT INTO soluna_page_views (member_id,email,page,ip,ua) VALUES (?,?,?,?,?)",
    args: [member.member_id, member.email, returnPath, ip, ua],
  }).catch(() => {});

  if (req.method === "HEAD") return res.end();
  res.sendFile(filePath);
});

// ── Voice Memo API ────────────────────────────────────────────────────────────
const VOICE_DIR = path.join('/data', 'voice');
try { fs.mkdirSync(VOICE_DIR, { recursive: true }); } catch {}

const voiceUpload = multer({
  storage: multer.diskStorage({
    destination: VOICE_DIR,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.webm`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('audio/')),
});

// POST /api/voice-memo — upload recording
app.post('/api/voice-memo', voiceUpload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no audio' });
  const { share_type = 'self', playback_type = 'unlimited', duration_sec } = req.body;
  const id = `vm_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Identify member from session token
  const token = parseCookies(req).sln_tok || req.headers['x-sln-token'] || '';
  let member = null;
  if (token) {
    const r = await db.execute({
      sql: `SELECT s.member_id, m.email FROM soluna_sessions s JOIN soluna_members m ON m.id=s.member_id WHERE s.token=? AND s.expires_at>datetime('now')`,
      args: [token],
    }).catch(() => null);
    member = r && r.rows[0] ? r.rows[0] : null;
  }

  await db.execute({
    sql: `INSERT INTO soluna_voice_memos (id,member_id,email,filename,duration_sec,share_type,playback_type) VALUES (?,?,?,?,?,?,?)`,
    args: [id, member?.member_id || null, member?.email || null, req.file.filename, parseFloat(duration_sec) || null, share_type, playback_type],
  });

  // Notify Yuki if share_type is 'yuki' or 'all'
  if ((share_type === 'yuki' || share_type === 'all') && RESEND_KEY) {
    const from_email = member?.email || '(未ログイン)';
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'SOLUNA <info@solun.art>',
        to: [ADMIN_EMAIL],
        subject: `🎙️ 新着ボイスメモ — ${from_email}`,
        html: `<p>${from_email} からボイスメモが届きました。</p><p>共有範囲: ${share_type} / 再生: ${playback_type}</p><p><a href="https://solun.art/voice">確認する</a></p>`,
      }),
    }).catch(() => {});
  }

  res.json({ ok: true, id });
});

// GET /api/voice-memos — list memos accessible to current user
app.get('/api/voice-memos', async (req, res) => {
  const token = parseCookies(req).sln_tok || req.headers['x-sln-token'] || '';
  let member = null;
  if (token) {
    const r = await db.execute({ sql: `SELECT s.member_id,m.email FROM soluna_sessions s JOIN soluna_members m ON m.id=s.member_id WHERE s.token=? AND s.expires_at>datetime('now')`, args: [token] }).catch(() => null);
    member = r?.rows[0] || null;
  }
  const isAdmin = member?.email === ADMIN_EMAIL;

  let rows;
  if (isAdmin) {
    rows = (await db.execute(`SELECT id,email,share_type,playback_type,play_count,duration_sec,created_at FROM soluna_voice_memos ORDER BY created_at DESC LIMIT 100`)).rows;
  } else if (member) {
    rows = (await db.execute({
      sql: `SELECT id,email,share_type,playback_type,play_count,duration_sec,created_at FROM soluna_voice_memos WHERE member_id=? OR share_type='all' ORDER BY created_at DESC LIMIT 50`,
      args: [member.member_id],
    })).rows;
  } else {
    rows = (await db.execute(`SELECT id,email,share_type,playback_type,play_count,duration_sec,created_at FROM soluna_voice_memos WHERE share_type='all' ORDER BY created_at DESC LIMIT 20`)).rows;
  }
  res.json(rows);
});

// POST /api/transcribe — transcribe audio via Whisper (OpenAI or Groq)
const transcribeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25*1024*1024 } });
app.post('/api/transcribe', transcribeUpload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no audio' });
  try {
    const GROQ_KEY = process.env.GROQ_API_KEY || '';
    const OAI_KEY = process.env.OPENAI_API_KEY || '';
    let result = null;

    if (GROQ_KEY) {
      // Groq Whisper (fast, free tier)
      const { FormData: FD, Blob: BlobPoly } = await import('node-fetch').catch(() => ({}));
      const form = new (global.FormData || (await import('undici').then(m=>m.FormData)))();
      form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), 'audio.webm');
      form.append('model', 'whisper-large-v3-turbo');
      form.append('language', 'ja');
      const r = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${GROQ_KEY}` },
        body: form,
      });
      if (r.ok) { const d = await r.json(); result = d.text; }
    } else if (OAI_KEY) {
      const form = new (await import('undici').then(m=>m.FormData))();
      form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), 'audio.webm');
      form.append('model', 'whisper-1');
      const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${OAI_KEY}` },
        body: form,
      });
      if (r.ok) { const d = await r.json(); result = d.text; }
    }

    if (result) return res.json({ text: result });
    res.status(503).json({ error: 'no transcription service configured' });
  } catch(e) {
    console.error('transcribe error', e.message);
    res.status(500).json({ error: 'transcription failed' });
  }
});

// GET /api/voice-memo/:id — stream audio (respects once/unlimited)
app.get('/api/voice-memo/:id', async (req, res) => {
  const row = (await db.execute({ sql: `SELECT * FROM soluna_voice_memos WHERE id=?`, args: [req.params.id] }).catch(() => null))?.rows[0];
  if (!row) return res.status(404).json({ error: 'not found' });

  // Access check
  const token = parseCookies(req).sln_tok || req.headers['x-sln-token'] || '';
  let member = null;
  if (token) {
    const r = await db.execute({ sql: `SELECT s.member_id,m.email FROM soluna_sessions s JOIN soluna_members m ON m.id=s.member_id WHERE s.token=? AND s.expires_at>datetime('now')`, args: [token] }).catch(() => null);
    member = r?.rows[0] || null;
  }
  const isOwner = member?.member_id === row.member_id;
  const isAdmin = member?.email === ADMIN_EMAIL;
  if (row.share_type === 'self' && !isOwner && !isAdmin) return res.status(403).json({ error: 'no access' });
  if (row.share_type === 'yuki' && !isAdmin && !isOwner) return res.status(403).json({ error: 'no access' });

  // Once-only check
  if (row.playback_type === 'once' && row.play_count >= 1 && !isOwner && !isAdmin)
    return res.status(410).json({ error: 'already played' });

  await db.execute({ sql: `UPDATE soluna_voice_memos SET play_count=play_count+1 WHERE id=?`, args: [row.id] });

  const filePath = path.join(VOICE_DIR, row.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'file missing' });
  res.setHeader('Content-Type', 'audio/webm');
  res.setHeader('Content-Disposition', 'inline');
  fs.createReadStream(filePath).pipe(res);
});

// ── BioGrid patent document (basic auth) ─────────────────────────────────────
const BIOGRID_PASS = process.env.BIOGRID_PASSWORD || "BioPatent2026";
function biogridAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Basic ")) {
    const [, pass] = Buffer.from(auth.slice(6), "base64").toString().split(":");
    if (pass === BIOGRID_PASS) return next();
  }
  res.setHeader("WWW-Authenticate", 'Basic realm="BioGrid Patent Document"');
  res.status(401).send("このページはパスワードが必要です。");
}
app.use("/biogrid", biogridAuth);

// ── Docs static HTML files (/docs/*.html) ────────────────────────────────────
const DOCS_STATIC_DIR = path.join(__dirname, "docs");
if (fs.existsSync(DOCS_STATIC_DIR)) {
  // Serve /docs/*.html before the global .html→clean-URL 301 redirect
  app.use("/docs", express.static(DOCS_STATIC_DIR, { maxAge: "0", etag: false }));
  // Also serve without .html extension: /docs/01_godo_kaisha_teikan
  app.get("/docs/:file([^/]+)", (req, res, next) => {
    const p = path.join(DOCS_STATIC_DIR, req.params.file + ".html");
    if (fs.existsSync(p)) return res.sendFile(p);
    next();
  });
}

// ── Cabin static files (main SOLUNA website — served from /cabin dir) ────────
// Must come BEFORE the SPA fallback so .html files are served directly

// ?embed=1 のとき内部ナビ/ヒーロー背景を消すCSS/JSをインジェクト
const EMBED_STRIP = `<style>
.gnav,.navbar,.site-header,nav,nav[class*="nav"],header[class*="header"],footer,.footer,[class*="footer"]{display:none!important}
body{padding-top:0!important;margin-top:0!important;background:#070707!important;overflow-x:hidden}
html{background:#070707!important}
/* hero 背景画像を除去 */
.hero,.hero-section,.hero-wrap,.hero-container,.main-hero,[class*="-hero"],[class*="hero-"]{background-image:none!important;min-height:auto!important;padding-top:40px!important}
/* 固定オーバーレイ除去 */
.overlay,.bg-overlay,[class*="overlay"]{display:none!important}
/* スクロールバー非表示 */
::-webkit-scrollbar{display:none}
</style><script>document.documentElement.classList.add('embedded');document.documentElement.classList.add('in-window')</script>`;

function serveWithEmbed(filePath, res) {
  let html = fs.readFileSync(filePath, "utf8");
  html = html.replace("</head>", EMBED_STRIP + "</head>");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}

if (fs.existsSync(CABIN_DIR)) {
  // ── URL alias redirects (clean up duplicate/confusing pages) ─────────────
  const PAGE_REDIRECTS = {
    "homes":        "collection",   // 物件一覧を collection に統一
    "properties":   "collection",
    "plan-a":       "package-a",
    "plan-b":       "package-b",
    "plan-c":       "package-c",
    "plan-d":       "package-d",
    "plan-e":       "sips-villa",
    "media":        "blog",
    "story":        "blog",
    "founding":     "scheme",
    "origin":       "scheme",
  };
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    const slug = req.path.replace(/^\//, "").replace(/\.html$/, "").split("?")[0];
    if (PAGE_REDIRECTS[slug]) {
      const qs = Object.keys(req.query).length ? "?" + new URLSearchParams(req.query).toString() : "";
      return res.redirect(301, "/" + PAGE_REDIRECTS[slug] + qs);
    }
    next();
  });

  // 301 redirect: /foo.html → /foo (SEO: canonical clean URLs)
  app.use((req, res, next) => {
    if (req.method === "GET" && req.path.endsWith(".html") && req.path !== "/index.html") {
      const clean = req.path.slice(0, -5) + (req.query && Object.keys(req.query).length ? "?" + new URLSearchParams(req.query).toString() : "");
      return res.redirect(301, clean);
    }
    next();
  });
  app.use(express.static(CABIN_DIR, { maxAge: "0", etag: false }));
  // cabin 内の .html を拡張子なしでも serve (/start → /start.html)
  app.get("/:page", (req, res, next) => {
    const p = path.join(CABIN_DIR, req.params.page + ".html");
    if (!fs.existsSync(p)) return next();
    if (req.query.embed === "1") return serveWithEmbed(p, res);
    return res.sendFile(p);
  });
  console.log("✓ Cabin static files served from /cabin");
}

// ── Inbound email → LLM auto-reply ──────────────────────────────────────────────
// Called by Cloudflare Email Worker when mail arrives at yoyaku@solun.art
app.post("/api/email/inbound", express.json({ limit: "2mb" }), async (req, res) => {
  const secret = req.headers["x-email-secret"];
  if (!secret || secret !== (process.env.EMAIL_WEBHOOK_SECRET || "")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { from, subject, text } = req.body;
  if (!from || !subject) return res.status(400).json({ error: "missing fields" });

  const EMAIL_KNOWLEDGE = `
あなたはSOLUNA（ソルナ）の予約・販売担当AIアシスタントです。丁寧な日本語（または相手の言語）で返答してください。

## SOLUNAとは
北海道・熱海・ハワイなどのリゾート物件を複数人で共同所有するクラブ。オーナーは年間一定泊数の優先滞在権を持つ。投資目的ではなく「帰れる場所を持つ」ことが目的。

## 物件と価格
- **THE LODGE**（北海道弟子屈）¥490万/口・年30泊・温泉露天風呂・薪ストーブ
- **NESTING**（北海道弟子屈）¥890万/口・年30泊・タワーサウナ・ジャグジー
- **インスタントハウス**（北海道弟子屈）¥120万/口・年30泊・最も手軽な入口
- **WHITE HOUSE 熱海**（静岡県熱海市）¥1,900万/口・年36泊・相模湾ビュー
- **TAPKOP**（北海道阿寒摩周国立公園）¥8,000万/口・年30泊・専任シェフ付き
- **KUMAUSHI BASE**（北海道）¥480万/口・2026年9月オープン予定

## 宿泊チケット（ゲスト利用）
物件購入前に一度泊まれるゲストチケットもあり。詳細はアプリ https://solun.art/app から確認可能。

## 問い合わせ・申込み
- アプリ: https://solun.art/app
- 担当: yoyaku@solun.art

返答は簡潔に（200〜400文字程度）、質問には具体的に答えること。詳細不明な点は「担当者より改めてご連絡いたします」と伝えること。
`;

  let replyHtml = "";
  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: EMAIL_KNOWLEDGE,
        messages: [
          {
            role: "user",
            content: `件名: ${subject}\n\n${(text || "").slice(0, 2000)}`,
          },
        ],
      }),
    });
    const aiJson = await aiRes.json();
    const aiText = aiJson.content?.[0]?.text || "お問い合わせありがとうございます。担当者より改めてご連絡いたします。";
    replyHtml = `<div style="font-family:sans-serif;color:#111;line-height:1.8;max-width:560px">
      ${aiText.replace(/\n/g, "<br>")}
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
      <div style="font-size:12px;color:#888">
        SOLUNA CABIN CLUB<br>
        <a href="https://solun.art/app" style="color:#c8a455">https://solun.art/app</a>
      </div>
    </div>`;
  } catch (e) {
    replyHtml = `<div style="font-family:sans-serif;color:#111">お問い合わせありがとうございます。担当者より改めてご連絡いたします。<br><br>SOLUNA CABIN CLUB</div>`;
  }

  // Send auto-reply to sender
  if (RESEND_API_KEY) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA 予約担当 <yoyaku@solun.art>",
        to: [from],
        subject: `Re: ${subject}`,
        html: replyHtml,
      }),
    }).catch(() => {});

    // Notify admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "SOLUNA <noreply@solun.art>",
        to: [ADMIN_EMAIL],
        subject: `[問い合わせ] ${subject}`,
        html: `<b>From:</b> ${from}<br><b>Subject:</b> ${subject}<br><hr><pre style="white-space:pre-wrap">${(text||"").slice(0,3000)}</pre><hr><b>AI返信内容:</b><br>${replyHtml}`,
      }),
    }).catch(() => {});
  }

  res.json({ ok: true });
});

// ── Global Express error handler (catches async throws forwarded via next(err)) ─
app.use((err, _req, res, _next) => {
  console.error("Express error:", err?.message || err);
  if (!res.headersSent) res.status(500).json({ error: "internal server error" });
});

// Public documents page — shows document listing for a property (no file content)
app.get("/docs/:slug", async (req, res) => {
  const { slug } = req.params;
  const r = await db.execute({
    sql: "SELECT id, title, doc_type, filename, file_size, created_at FROM property_documents WHERE slug=? AND is_listed=1 ORDER BY created_at",
    args: [slug],
  });
  const docs = r.rows;
  const slugLabel = { lodge: "THE LODGE（弟子屈町 美留和）", village: "美留和ビレッジ（弟子屈町）", kumaushi: "KUMAUSHI BASE（弟子屈町 熊牛原野）", tapkop: "TAPKOP（弟子屈町）", nesting: "NESTING（弟子屈町）", atami: "WHITE HOUSE 熱海", instant: "インスタントハウス（弟子屈町）" };
  const name = slugLabel[slug] || slug;
  const rows = docs.map(d => {
    const kb = d.file_size ? `${Math.round(d.file_size / 1024)} KB` : "";
    const date = d.created_at ? d.created_at.slice(0, 10) : "";
    const typeLabel = DOC_TYPE_LABEL[d.doc_type] || d.doc_type;
    return `<tr><td>${typeLabel}</td><td>${d.title}</td><td>${date}</td><td>${kb}</td></tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — 物件書類</title><style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{font-size:1.4rem;margin-bottom:4px}p.sub{color:#666;margin-bottom:24px}table{width:100%;border-collapse:collapse}th,td{padding:10px 12px;border-bottom:1px solid #e5e5e5;text-align:left}th{background:#f7f7f7;font-weight:600;font-size:.85rem;color:#555}.badge{display:inline-block;padding:3px 8px;border-radius:4px;font-size:.75rem;background:#e8f0fe;color:#1a4fa0}.notice{margin-top:24px;padding:16px;background:#fff8e1;border-radius:8px;font-size:.9rem;color:#555;border-left:4px solid #f0c040}.empty{color:#999;font-style:italic;padding:20px 0}</style></head><body><h1>${name}</h1><p class="sub">物件書類一覧</p>${docs.length === 0 ? '<p class="empty">登録済みの書類はありません。</p>' : `<table><thead><tr><th>書類種別</th><th>書類名</th><th>登録日</th><th>サイズ</th></tr></thead><tbody>${rows}</tbody></table>`}<div class="notice">書類の閲覧はオーナーおよびオーナーが開示を許可した方のみが可能です。閲覧をご希望の方は <a href="mailto:mail@yukihamada.jp">mail@yukihamada.jp</a> までご連絡ください。</div></body></html>`;
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send(html);
});

// ── Next.js static pages ────────────────────────────────────────────────────
// Serve pages built by Next.js (output: "export") that aren't handled above
app.get("/futami", (_req, res) => res.sendFile(path.join(STATIC_DIR, "futami", "index.html")));
app.get("/futami/", (_req, res) => res.sendFile(path.join(STATIC_DIR, "futami", "index.html")));
app.use("/futami-img", express.static(path.join(STATIC_DIR, "futami-img"), { maxAge: "7d" }));

// ── Standalone Login Page ─────────────────────────────────────────────────────
app.get('/login', (req, res) => {
  const next = (req.query.next || '/').replace(/[^a-zA-Z0-9/_\-\.]/g, '');
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send(`<!DOCTYPE html><html lang="ja"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>SOLUNA ログイン</title>
<meta name="robots" content="noindex,nofollow">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#080806;color:#c8c0b0;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.card{max-width:400px;width:100%;background:#0e0c0a;border:1px solid #2a2520;border-radius:12px;padding:40px 32px}
.logo{font-size:10px;font-weight:800;letter-spacing:.3em;color:#c8a455;margin-bottom:32px}
h1{font-size:1.2rem;font-weight:800;color:#f0ece4;margin-bottom:8px}
.sub{font-size:.78rem;color:rgba(255,255,255,.35);margin-bottom:28px;line-height:1.6}
label{display:block;font-size:.65rem;letter-spacing:.15em;color:#555;text-transform:uppercase;margin-bottom:6px}
input{width:100%;background:#080806;border:1px solid #2a2520;color:#c8c0b0;padding:12px 14px;border-radius:6px;font-size:.85rem;outline:none;margin-bottom:12px}
input:focus{border-color:#c8a455}
.btn{width:100%;background:#c8a455;color:#080806;font-weight:800;font-size:.8rem;letter-spacing:.1em;padding:14px;border:none;border-radius:6px;cursor:pointer;transition:background .15s}
.btn:hover{background:#d4b068}
.msg{margin-top:12px;font-size:.78rem;min-height:18px;text-align:center}
.msg.ok{color:#4a9a5a}.msg.err{color:#c0392b}
#step2{display:none}
.back{font-size:.72rem;color:#555;text-decoration:underline;cursor:pointer;background:none;border:none;margin-top:10px;display:block;text-align:center}
</style>
</head><body>
<div class="card">
  <div class="logo">SOLUNA</div>
  <h1>ログイン</h1>
  <p class="sub">メールアドレスにワンタイムコードを送信します。</p>
  <div id="step1">
    <label>メールアドレス</label>
    <input type="email" id="email" placeholder="your@email.com" autocomplete="email">
    <button class="btn" onclick="sendOtp()">コードを送信</button>
    <div class="msg" id="msg1"></div>
  </div>
  <div id="step2">
    <label>確認コード（6桁）</label>
    <input type="text" id="code" placeholder="000000" maxlength="6" inputmode="numeric">
    <button class="btn" onclick="verify()">ログイン</button>
    <button class="back" onclick="document.getElementById('step1').style.display='';document.getElementById('step2').style.display='none'">← メールを変更</button>
    <div class="msg" id="msg2"></div>
  </div>
</div>
<script>
const NEXT=${JSON.stringify(next)};
async function sendOtp(){
  const email=document.getElementById('email').value.trim();
  if(!email){setMsg('msg1','err','メールアドレスを入力');return;}
  setMsg('msg1','','送信中...');
  const r=await fetch('/api/soluna/otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
  const d=await r.json();
  if(r.ok){document.getElementById('step1').style.display='none';document.getElementById('step2').style.display='';setMsg('msg2','','');}
  else setMsg('msg1','err',d.error||'エラーが発生しました');
}
async function verify(){
  const email=document.getElementById('email').value.trim();
  const code=document.getElementById('code').value.trim();
  if(!code){setMsg('msg2','err','コードを入力');return;}
  setMsg('msg2','','確認中...');
  const r=await fetch('/api/soluna/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,code})});
  const d=await r.json();
  if(r.ok){localStorage.setItem('sln_token',d.token);setMsg('msg2','ok','ログイン完了');setTimeout(()=>location.href=NEXT,500);}
  else setMsg('msg2','err',d.error||'コードが正しくありません');
}
function setMsg(id,cls,txt){const el=document.getElementById(id);el.className='msg'+(cls?' '+cls:'');el.textContent=txt;}
document.getElementById('email').addEventListener('keydown',e=>{if(e.key==='Enter')sendOtp();});
document.getElementById('code').addEventListener('keydown',e=>{if(e.key==='Enter')verify();});
</script>
</body></html>`);
});

// ── Strategy Share ────────────────────────────────────────────────────────────
const { randomUUID } = require('crypto');

app.post('/api/strategy/share', async (req, res) => {
  const cookTok = parseCookies(req).sln_tok;
  const hdrTok = req.headers['x-sln-token'];
  const token = cookTok || hdrTok;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const row = await db.execute({ sql: 'SELECT m.email FROM soluna_sessions s JOIN soluna_members m ON s.member_id=m.id WHERE s.token=? AND s.expires_at>datetime("now")', args: [token] });
    if (!row.rows.length || row.rows[0].email !== 'mail@yukihamada.jp') return res.status(403).json({ error: 'forbidden' });
    const { title, content, expires_days = 30 } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + expires_days * 86400000).toISOString();
    await db.execute({ sql: 'INSERT INTO strategy_shares (id, title, content, expires_at) VALUES (?,?,?,?)', args: [id, title, content, expiresAt] });
    res.json({ id, url: `/s/${id}` });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/s/:id', async (req, res) => {
  try {
    const row = await db.execute({ sql: 'SELECT title, content FROM strategy_shares WHERE id=? AND (expires_at IS NULL OR expires_at>datetime("now"))', args: [req.params.id] });
    if (!row.rows.length) return res.status(404).send('<h1>このリンクは有効期限切れか存在しません</h1>');
    const { title, content } = row.rows[0];
    res.send(`<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — SOLUNA Strategy</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#080806;color:#e8e8e4;font-family:'Inter',sans-serif;padding:40px 24px;max-width:860px;margin:0 auto}h1,h2,h3{color:#c8a455;margin:1.5em 0 .5em}p,li{line-height:1.75;margin:.5em 0;font-size:.93rem}table{width:100%;border-collapse:collapse;margin:1em 0}th,td{padding:8px 12px;border:1px solid rgba(255,255,255,.1);text-align:left;font-size:.85rem}th{background:rgba(200,164,85,.1);color:#c8a455}.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:.7rem;font-weight:700;margin:.2em;background:rgba(200,164,85,.15);color:#c8a455}footer{margin-top:3em;padding-top:1em;border-top:1px solid rgba(255,255,255,.08);font-size:.75rem;color:rgba(255,255,255,.3)}</style></head><body>${content}<footer>Shared from <a href="https://solun.art" style="color:#c8a455">SOLUNA</a> Strategy</footer></body></html>`);
  } catch(e) { res.status(500).send('<h1>Error</h1>'); }
});

// ── 404 fallback ─────────────────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.status(404).setHeader("Content-Type", "text/html; charset=UTF-8");
  const p404 = path.join(CABIN_DIR, "404.html");
  if (fs.existsSync(p404)) return res.sendFile(p404);
  res.send("<html><body><h1>404 Not Found</h1></body></html>");
});

initDb().then(() => {
  app.listen(PORT, () => console.log(`SOLUNA server listening on :${PORT}`));

  // Telegram bot webhook registration
  registerTgWebhook().catch(() => {});

  // Morning digest scheduler
  scheduleMorningDigest();

  // Morning philosophy (9 AM JST)
  scheduleMorningPhilosophy();

  // Hourly cleaning task sync
  syncCleaningTasks().catch(() => {});
  setInterval(() => syncCleaningTasks().catch(() => {}), 60 * 60 * 1000);

  // Beds24 booking sync (every 5 min, initial after 15s)
  if (BEDS24_REFRESH) {
    setTimeout(() => beds24Sync().catch(() => {}), 15000);
    setInterval(() => beds24Sync().catch(() => {}), 5 * 60 * 1000);
    console.log("✓ Beds24 sync enabled (every 5min)");
  } else {
    console.log("ℹ Beds24 sync disabled (set BEDS24_REFRESH_TOKEN to enable)");
  }

  // Daily cleanup: expired OTP codes
  const cleanOtps = () => db.execute(`DELETE FROM soluna_otps WHERE expires_at < datetime('now')`).catch(() => {});
  setTimeout(cleanOtps, 60 * 1000); // run once 1 min after startup
  setInterval(cleanOtps, 24 * 60 * 60 * 1000); // then daily

  // LINE Rich Menu setup (once at startup)
  setupLineRichMenu().catch(() => {});
}).catch(err => {
  console.error("DB init failed:", err);
  process.exit(1);
});

// ── SOLUNA ADMIN: Purchases list ──────────────────────────────────────────────
app.get("/api/soluna/admin/purchases", async (req, res) => {
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  const m = await solunaAuth(req);
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  const r = await db.execute(
    `SELECT p.id, p.property_slug, p.units, p.price_yen, p.status, p.ref_code, p.created_at,
            m.email, m.name
     FROM soluna_purchases p
     LEFT JOIN soluna_members m ON m.id = p.member_id
     ORDER BY p.created_at DESC`
  );
  res.json({ purchases: r.rows });
});

// PATCH /api/soluna/admin/purchases/:id — confirm or reject
app.patch("/api/soluna/admin/purchases/:id", express.json(), async (req, res) => {
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  const m = await solunaAuth(req);
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  const { status } = req.body; // "confirmed" or "rejected"
  if (!["confirmed","rejected","pending"].includes(status)) return res.status(400).json({ error: "invalid status" });
  const id = parseInt(req.params.id);
  await db.execute({ sql: "UPDATE soluna_purchases SET status=? WHERE id=?", args: [status, id] });
  res.json({ ok: true, id, status });
});

// POST /api/soluna/admin/blast — email blast to soluna_members
app.post("/api/soluna/admin/blast", express.json(), async (req, res) => {
  const byKey = req.headers["x-admin-key"] === ADMIN_KEY;
  const m = await solunaAuth(req);
  if (!byKey && !isSolunaAdmin(m)) return res.status(403).json({ error: "forbidden" });
  if (!RESEND_API_KEY) return res.status(503).json({ error: "RESEND_API_KEY not set" });
  const { subject, body, test_email, filter } = req.body;
  if (!subject || !body) return res.status(400).json({ error: "subject and body required" });
  let rows;
  if (test_email) {
    rows = [{ email: test_email }];
  } else {
    const result = await db.execute(`SELECT DISTINCT email FROM soluna_members WHERE email IS NOT NULL AND email != '' ORDER BY created_at DESC`);
    rows = result.rows;
  }
  const html = `<div style="background:#050505;color:#f0ece4;font-family:'Helvetica Neue',sans-serif;padding:40px 32px;max-width:560px;margin:0 auto">
  <p style="color:#c8a455;letter-spacing:.3em;font-size:10px;text-transform:uppercase;margin-bottom:20px">SOLUNA</p>
  <h1 style="font-size:22px;font-weight:800;margin:0 0 24px;line-height:1.3;color:#f0ece4">${subject}</h1>
  <div style="color:rgba(240,236,228,.7);font-size:15px;line-height:1.9;white-space:pre-line">${body}</div>
  <div style="margin-top:36px;padding-top:24px;border-top:1px solid rgba(255,255,255,.07)">
    <a href="https://solun.art/app" style="display:inline-block;padding:13px 28px;background:#c8a455;color:#050505;font-weight:800;text-decoration:none;border-radius:8px;font-size:13px;letter-spacing:.04em">SOLUNAを開く →</a>
  </div>
  <p style="color:rgba(255,255,255,.1);font-size:10px;margin-top:28px">© 2026 Enabler Inc. · SOLUNA · <a href="https://solun.art" style="color:rgba(200,164,85,.4)">solun.art</a></p>
</div>`;
  let sent = 0, failed = 0;
  for (const row of rows) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({ from: "SOLUNA <info@solun.art>", to: [row.email], subject, html }),
      });
      if (r.ok) sent++; else failed++;
    } catch { failed++; }
    await new Promise(r => setTimeout(r, 120));
  }
  res.json({ ok: true, sent, failed, total: rows.length, mode: test_email ? "test" : "live" });
});

// POST /api/soluna/deposit — Stripe checkout for ¥100,000 property deposit
app.post("/api/soluna/deposit", express.json(), async (req, res) => {
  if (!STRIPE_SECRET_KEY) return res.status(503).json({ error: "Payment not configured" });
  const { property_slug, email, name } = req.body;
  if (!property_slug || !email) return res.status(400).json({ error: "property_slug and email required" });
  const prop = SOLUNA_PROPERTIES[property_slug];
  if (!prop) return res.status(400).json({ error: "unknown property" });
  try {
    const stripe = require("stripe")(STRIPE_SECRET_KEY);
    const origin = `${req.protocol}://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "jpy",
          product_data: { name: `SOLUNA ${prop.name} — 手付金`, description: "共同所有権取得の手付金。購入完了時に購入代金に充当されます。" },
          unit_amount: 100000,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${origin}/buy?deposited=true&property=${property_slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/buy?property=${property_slug}`,
      metadata: { property_slug, buyer_name: name || "", type: "soluna_deposit" },
    });
    // Record pending purchase
    await db.execute({ sql: "INSERT OR IGNORE INTO soluna_members (email, name) VALUES (?,?)", args: [email, name||""] });
    const memRow = await db.execute({ sql: "SELECT id FROM soluna_members WHERE email=?", args: [email] });
    if (memRow.rows.length) {
      await db.execute({
        sql: "INSERT INTO soluna_purchases (member_id, property_slug, units, price_yen, status) VALUES (?,?,1,100000,'deposit')",
        args: [memRow.rows[0].id, property_slug]
      });
    }
    res.json({ url: session.url });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/soluna/admin/send-email", express.json(), async (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  if (!RESEND_API_KEY) return res.status(503).json({ error: "RESEND_API_KEY not set" });
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) return res.status(400).json({ error: "to, subject, body required" });
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Yuki Hamada <yuki@solun.art>",
        reply_to: ["mail@yukihamada.jp"],
        to: [to],
        subject,
        text: body,
      }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json(d);
    res.json({ ok: true, id: d.id });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Site Settings (wallpaper etc.) ────────────────────────────────────────────
app.get("/api/site-settings", async (req, res) => {
  try {
    const r = await db.execute("SELECT key, value FROM site_settings");
    const settings = {};
    for (const row of r.rows) { try { settings[row.key] = JSON.parse(row.value); } catch { settings[row.key] = row.value; } }
    res.json(settings);
  } catch(e) { res.json({}); }
});

app.patch("/api/admin/site-settings", express.json(), async (req, res) => {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  if (!auth) return res.status(401).json({ error: "Unauthorized" });
  const ADMIN_EMAILS = ['mail@yukihamada.jp', 'yuki@hamada.tokyo'];
  try {
    const sr = await db.execute(
      "SELECT sm.email FROM soluna_sessions ss JOIN soluna_members sm ON ss.member_id = sm.id WHERE ss.token = ? AND ss.expires_at > ?",
      [auth, Date.now()]
    );
    if (!sr.rows.length || !ADMIN_EMAILS.includes(sr.rows[0].email)) return res.status(403).json({ error: "Forbidden" });
  } catch(e) { return res.status(500).json({ error: e.message }); }
  const { key, value } = req.body;
  if (!key) return res.status(400).json({ error: "key required" });
  try {
    await db.execute(
      "INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
      [key, JSON.stringify(value)]
    );
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Community: pin/unpin (admin) ──────────────────────────────────────────────
db.execute("ALTER TABLE soluna_community_messages ADD COLUMN pinned INTEGER DEFAULT 0").catch(()=>{});

// Seed community messages if empty
db.execute("SELECT COUNT(*) as cnt FROM soluna_community_messages").then(function(r){
  var cnt = (r.rows && r.rows[0] && (r.rows[0].cnt || r.rows[0][0])) || 0;
  if(parseInt(cnt) > 0) return;
  var seeds = [
    [0, 'SOLUNA', 'admin', 'SOLUNAコミュニティへようこそ！🌟\n\nここは北海道・熱海・ハワイのSOLUNAオーナーたちが集まる場所です。物件のこと、次の滞在の計画、村づくりのアイデアなど、なんでも気軽に話しかけてください！\n— 濱田優貴 & SOLUNA チーム', 1],
    [1, '田中 K.', 'member', 'TAPKOP先週行ってきました。サウナ→湖→焚き火のループが最高すぎて、帰りたくなかった笑。次の予約いつ入れよう', 0],
    [2, '佐藤 M.', 'member', '熱海のWHITE HOUSE、東京から新幹線で45分なのがほんとに便利。週末サクッと行けるの最高です。家族に大好評でした🏖', 0],
    [1, '田中 K.', 'member', '美留和ビレッジ9月オープン楽しみすぎる。Work Party参加する人いますか？', 0],
    [3, '鈴木 A.', 'member', '参加します！木材加工ワークショップ特に興味あり。薪ストーブの煙突施工も体験できるって聞いて。', 0],
    [0, 'SOLUNA', 'admin', '【お知らせ】美留和ビレッジ Work Party の参加者募集中です。9月5〜7日。詳細は /workparty をご覧ください 🏗️', 1],
  ];
  var p = Promise.resolve();
  seeds.forEach(function(s){
    p = p.then(function(){
      return db.execute(
        "INSERT INTO soluna_community_messages (member_id, display_name, member_type, message, is_ai) VALUES (?,?,?,?,?)", s
      ).catch(function(){});
    });
  });
}).catch(function(){});

app.patch("/api/soluna/community/pin/:id", express.json(), async (req, res) => {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  const ADMIN_EMAILS = ['mail@yukihamada.jp', 'yuki@hamada.tokyo'];
  try {
    const sr = await db.execute(
      "SELECT sm.email FROM soluna_sessions ss JOIN soluna_members sm ON ss.member_id=sm.id WHERE ss.token=? AND ss.expires_at>?",
      [auth, Date.now()]
    );
    if (!sr.rows.length || !ADMIN_EMAILS.includes(sr.rows[0].email)) return res.status(403).json({ error:"Forbidden" });
  } catch(e) { return res.status(500).json({ error: e.message }); }
  const { pinned } = req.body;
  await db.execute("UPDATE soluna_community_messages SET pinned=? WHERE id=?", [pinned?1:0, req.params.id]);
  res.json({ ok: true });
});

app.get("/api/soluna/community/pinned", async (_req, res) => {
  try {
    const r = await db.execute("SELECT * FROM soluna_community_messages WHERE pinned=1 AND deleted=0 ORDER BY id DESC LIMIT 5");
    res.json(r.rows);
  } catch(e) { res.json([]); }
});

// ── Admin notifications ───────────────────────────────────────────────────────
app.get("/api/admin/notifications", async (req, res) => {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  const ADMIN_EMAILS = ['mail@yukihamada.jp', 'yuki@hamada.tokyo'];
  try {
    const sr = await db.execute(
      "SELECT sm.email FROM soluna_sessions ss JOIN soluna_members sm ON ss.member_id=sm.id WHERE ss.token=? AND ss.expires_at>?",
      [auth, Date.now()]
    );
    if (!sr.rows.length || !ADMIN_EMAILS.includes(sr.rows[0].email)) return res.status(403).json({ error:"Forbidden" });
  } catch(e) { return res.status(403).json({ error:"Forbidden" }); }
  const since = req.query.since || new Date(Date.now()-24*60*60*1000).toISOString();
  try {
    const [purchases, meetings] = await Promise.all([
      db.execute("SELECT id,'purchase' as type,email as title,created_at FROM soluna_purchases WHERE created_at>? ORDER BY id DESC LIMIT 10",[since]),
      db.execute("SELECT id,'meeting' as type,name||' — '||meeting_type as title,created_at FROM meeting_requests WHERE created_at>? ORDER BY id DESC LIMIT 10",[since]).catch(()=>({rows:[]})),
    ]);
    const all=[...purchases.rows,...meetings.rows].sort((a,b)=>a.created_at<b.created_at?1:-1).slice(0,20);
    res.json(all);
  } catch(e) { res.json([]); }
});
