const express = require("express");
const compression = require("compression");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || "/data/contracts.db";
const STATIC_DIR = path.join(__dirname, "out");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const RESEND_API_KEY    = process.env.RESEND_API_KEY    || "";
const ADMIN_KEY         = process.env.ADMIN_KEY || "";
const ADMIN_EMAIL       = "info@solun.art";

if (!ADMIN_KEY) console.warn("⚠ ADMIN_KEY not set — admin endpoints will reject all requests");

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
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
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
  )
`);
// Migrate existing DBs (idempotent)
try { db.exec("ALTER TABLE submissions ADD COLUMN paid INTEGER DEFAULT 0"); } catch {}
try { db.exec("ALTER TABLE submissions ADD COLUMN stripe_session_id TEXT"); } catch {}

// Email signups table
db.exec(`
  CREATE TABLE IF NOT EXISTS email_signups (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL UNIQUE,
    locale     TEXT DEFAULT 'en',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Meeting requests table
db.exec(`
  CREATE TABLE IF NOT EXISTS meeting_requests (
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
  )
`);

// ── Admin task overrides & view tracking ─────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS task_overrides (
    task_key    TEXT PRIMARY KEY,
    status      TEXT NOT NULL,
    updated_by  TEXT,
    updated_at  TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_views (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    member    TEXT NOT NULL,
    viewed_at TEXT DEFAULT (datetime('now'))
  )
`);

// ── NFT passes table ─────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS nft_passes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    pass_type   TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    image_url   TEXT,
    claimed_by  TEXT,
    claimed_name TEXT,
    claimed_at  TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
  )
`);

// Seed initial passes if empty
{
  const count = db.prepare("SELECT COUNT(*) as c FROM nft_passes").get();
  if (count.c === 0) {
    const insert = db.prepare("INSERT INTO nft_passes (pass_type, name, description, image_url) VALUES (?, ?, ?, ?)");
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
      insert.run(type, name, desc, img);
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
app.post("/api/email", (req, res) => {
  const { email, locale } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }
  try {
    const result = db.prepare("INSERT OR IGNORE INTO email_signups (email, locale) VALUES (?, ?)")
      .run(email.toLowerCase().trim(), locale || "en");
    if (result.changes > 0) {
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

// ── VIP Inquiry table ─────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS vip_inquiries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    tier       TEXT NOT NULL,
    name       TEXT,
    email      TEXT NOT NULL,
    phone      TEXT,
    message    TEXT,
    lang       TEXT DEFAULT 'ja',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// ── API: VIP Inquiry ──────────────────────────────────────────────────────────
app.post("/api/vip-inquiry", (req, res) => {
  const { tier, name, email, phone, message, lang } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const result = db.prepare(
      "INSERT INTO vip_inquiries (tier, name, email, phone, message, lang) VALUES (?,?,?,?,?,?)"
    ).run(tier || "diamond", name || null, email, phone || null, message || null, lang || "ja");
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
    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Get email signups (admin) ────────────────────────────────────────────
app.get("/api/emails", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare("SELECT * FROM email_signups ORDER BY created_at DESC").all();
  res.json(rows);
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
  const rows = db.prepare("SELECT email, locale FROM email_signups").all();
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
app.get("/api/nft-passes", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare("SELECT id, pass_type, name, description, image_url FROM nft_passes WHERE claimed_by IS NULL ORDER BY pass_type, id").all();
  res.json(rows);
});

// List claimed passes (for admin view)
app.get("/api/nft-passes/claimed", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare("SELECT id, pass_type, name, claimed_by, claimed_name, claimed_at FROM nft_passes WHERE claimed_by IS NOT NULL ORDER BY claimed_at DESC").all();
  res.json(rows);
});

// Claim a pass
app.post("/api/nft-passes/:id/claim", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

  const { wallet, member } = req.body;
  if (!wallet) return res.status(400).json({ error: "wallet address required" });

  const pass = db.prepare("SELECT * FROM nft_passes WHERE id = ?").get(req.params.id);
  if (!pass) return res.status(404).json({ error: "Pass not found" });
  if (pass.claimed_by) return res.status(409).json({ error: "Already claimed" });

  db.prepare("UPDATE nft_passes SET claimed_by = ?, claimed_name = ?, claimed_at = datetime('now') WHERE id = ?")
    .run(wallet, member || null, req.params.id);

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
app.post("/api/meeting", (req, res) => {
  const { meetingType, name, company, email, phone, date, timeSlot, message, lang } = req.body;
  if (!meetingType || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const result = db.prepare(`
      INSERT INTO meeting_requests (meeting_type, name, company, email, phone, date, time_slot, message, lang)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(meetingType, name || null, company || null, email, phone || null, date || null, timeSlot || null, message || null, lang || "ja");
    sendAdminEmail(
      `[ZAMNA] ミーティング予約 — ${meetingType}`,
      `<p>新しいミーティングリクエストが届きました。</p><ul><li>種別: ${meetingType}</li><li>名前: ${name || "-"}</li><li>会社: ${company || "-"}</li><li>メール: ${email}</li><li>日付: ${date || "-"} ${timeSlot || ""}</li></ul><p>管理画面: https://solun.art/admin</p>`
    );
    res.json({ ok: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Get meetings (admin) ─────────────────────────────────────────────────
app.get("/api/meetings", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare("SELECT * FROM meeting_requests ORDER BY created_at DESC").all();
  res.json(rows);
});

// ── API: Submit contract ──────────────────────────────────────────────────────
app.post("/api/submit", (req, res) => {
  const {
    contractType, name, company, email, amount,
    structure, returnType, sponsorPackage, contactPerson, signature, lang,
  } = req.body;

  if (!contractType || !signature) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stmt = db.prepare(`
    INSERT INTO submissions
      (contract_type, name, company, email, amount, structure, return_type,
       sponsor_package, contact_person, signature, lang)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    contractType,
    name || null, company || null, email || null, amount || null,
    structure || null, returnType || null, sponsorPackage || null,
    contactPerson || null, signature, lang || "ja",
  );

  sendAdminEmail(
    `[ZAMNA] 新しい契約申込 — ${contractType}`,
    `<p>新しい契約申込が届きました。</p><ul><li>種別: ${contractType}</li><li>会社: ${company || "-"}</li><li>名前: ${name || "-"}</li><li>メール: ${email || "-"}</li><li>金額: ${amount || "-"}</li></ul><p>管理画面: https://solun.art/admin</p>`
  );
  res.json({ ok: true, id: result.lastInsertRowid });
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
      db.prepare("UPDATE submissions SET paid = 1, stripe_session_id = ? WHERE id = ?")
        .run(session_id, Number(sid));
    }
    res.json({ paid, amount: session.amount_total, currency: session.currency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── API: Get submissions (admin) ──────────────────────────────────────────────
app.get("/api/submissions", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const rows = db.prepare("SELECT * FROM submissions ORDER BY created_at DESC").all();
  res.json(rows);
});

// ── API: Task overrides (admin) ──────────────────────────────────────────────
app.get("/api/task-overrides", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare("SELECT * FROM task_overrides").all();
  res.json(rows);
});

app.put("/api/task-overrides/:taskKey", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { status, updated_by } = req.body;
  if (!status) return res.status(400).json({ error: "status required" });
  db.prepare(
    `INSERT INTO task_overrides (task_key, status, updated_by, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(task_key) DO UPDATE SET status=excluded.status, updated_by=excluded.updated_by, updated_at=excluded.updated_at`
  ).run(req.params.taskKey, status, updated_by || null);
  res.json({ ok: true });
});

// ── API: Admin views (admin) ────────────────────────────────────────────────
app.post("/api/admin-views", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { member } = req.body;
  if (!member) return res.status(400).json({ error: "member required" });
  db.prepare("INSERT INTO admin_views (member) VALUES (?)").run(member);
  res.json({ ok: true });
});

app.get("/api/admin-views", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const rows = db.prepare(
    `SELECT member, MAX(viewed_at) as last_viewed
     FROM admin_views GROUP BY member ORDER BY last_viewed DESC`
  ).all();
  res.json(rows);
});

// ── API: Admin DB cleanup ────────────────────────────────────────────────────
app.post("/api/admin/cleanup", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { table, where } = req.body;
  const allowed = ["submissions", "email_signups", "meeting_requests", "vip_inquiries", "nft_passes"];
  if (!allowed.includes(table)) return res.status(400).json({ error: "Invalid table" });
  if (!where || typeof where !== "object") return res.status(400).json({ error: "where clause required" });

  const keys = Object.keys(where);
  const clause = keys.map(k => `${k} = ?`).join(" AND ");
  const vals = keys.map(k => where[k]);
  const result = db.prepare(`DELETE FROM ${table} WHERE ${clause}`).run(...vals);
  res.json({ ok: true, deleted: result.changes });
});

app.post("/api/admin/reset-nft", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "id required" });
  db.prepare("UPDATE nft_passes SET claimed_by=NULL, claimed_name=NULL, claimed_at=NULL WHERE id=?").run(id);
  res.json({ ok: true });
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

// ── Custom Next.js pages ──────────────────────────────────────────────────────
const customRoutes = ["/sponsor", "/investor", "/deal", "/contract", "/login", "/admin", "/schedule", "/vip", "/lineup", "/info", "/privacy", "/terms", "/guide", "/artist-lounge", "/vip-lounge", "/mint", "/production", "/safety", "/staff", "/venue-agreement", "/artist-contract", "/budget", "/press"];
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

app.listen(PORT, () => console.log(`ZAMNA server listening on :${PORT}`));
