pub const SCHEMA = [_][]const u8{
    \\CREATE TABLE IF NOT EXISTS submissions (
    \\  id                INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  contract_type     TEXT NOT NULL,
    \\  name              TEXT,
    \\  company           TEXT,
    \\  email             TEXT,
    \\  amount            TEXT,
    \\  structure         TEXT,
    \\  return_type       TEXT,
    \\  sponsor_package   TEXT,
    \\  contact_person    TEXT,
    \\  signature         TEXT NOT NULL,
    \\  lang              TEXT DEFAULT 'ja',
    \\  paid              INTEGER DEFAULT 0,
    \\  stripe_session_id TEXT,
    \\  created_at        TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS email_signups (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  email      TEXT NOT NULL UNIQUE,
    \\  locale     TEXT DEFAULT 'en',
    \\  created_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS meeting_requests (
    \\  id           INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  meeting_type TEXT NOT NULL,
    \\  name         TEXT,
    \\  company      TEXT,
    \\  email        TEXT,
    \\  phone        TEXT,
    \\  date         TEXT,
    \\  time_slot    TEXT,
    \\  message      TEXT,
    \\  lang         TEXT DEFAULT 'ja',
    \\  created_at   TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS task_overrides (
    \\  task_key    TEXT PRIMARY KEY,
    \\  status      TEXT NOT NULL,
    \\  updated_by  TEXT,
    \\  updated_at  TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS admin_views (
    \\  id        INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  member    TEXT NOT NULL,
    \\  viewed_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS nft_passes (
    \\  id          INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  pass_type   TEXT NOT NULL,
    \\  name        TEXT NOT NULL,
    \\  description TEXT,
    \\  image_url   TEXT,
    \\  claimed_by  TEXT,
    \\  claimed_name TEXT,
    \\  claimed_at  TEXT,
    \\  created_at  TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS vip_inquiries (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  tier       TEXT NOT NULL,
    \\  name       TEXT,
    \\  email      TEXT NOT NULL,
    \\  phone      TEXT,
    \\  message    TEXT,
    \\  lang       TEXT DEFAULT 'ja',
    \\  created_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS feedback (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  page       TEXT NOT NULL,
    \\  member     TEXT,
    \\  category   TEXT DEFAULT 'general',
    \\  message    TEXT NOT NULL,
    \\  created_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS partners (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  name       TEXT,
    \\  contact    TEXT NOT NULL,
    \\  type_ja    TEXT,
    \\  type_en    TEXT,
    \\  status     TEXT DEFAULT 'pending',
    \\  notes_ja   TEXT,
    \\  notes_en   TEXT,
    \\  email      TEXT,
    \\  phone      TEXT,
    \\  who        TEXT,
    \\  instagram  TEXT,
    \\  link       TEXT,
    \\  created_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS notes (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  target     TEXT NOT NULL,
    \\  member     TEXT,
    \\  content    TEXT NOT NULL,
    \\  created_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS chat_history (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  member     TEXT,
    \\  role       TEXT NOT NULL,
    \\  content    TEXT NOT NULL,
    \\  sql_executed TEXT,
    \\  created_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS whatsapp_messages (
    \\  id           INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  wa_msg_id    TEXT UNIQUE,
    \\  from_phone   TEXT NOT NULL,
    \\  from_name    TEXT,
    \\  group_id     TEXT,
    \\  message_type TEXT DEFAULT 'text',
    \\  body         TEXT,
    \\  is_mention   INTEGER DEFAULT 0,
    \\  replied      INTEGER DEFAULT 0,
    \\  reply_text   TEXT,
    \\  sql_executed TEXT,
    \\  created_at   TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS audit_log (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  action     TEXT NOT NULL,
    \\  target     TEXT,
    \\  member     TEXT,
    \\  details    TEXT,
    \\  created_at TEXT DEFAULT (datetime('now'))
    \\)
    ,
    \\CREATE TABLE IF NOT EXISTS cms_content (
    \\  id         INTEGER PRIMARY KEY AUTOINCREMENT,
    \\  section    TEXT NOT NULL,
    \\  key        TEXT NOT NULL,
    \\  value_ja   TEXT,
    \\  value_en   TEXT,
    \\  updated_by TEXT,
    \\  updated_at TEXT DEFAULT (datetime('now')),
    \\  UNIQUE(section, key)
    \\)
    ,
};

pub const NFT_SEEDS = [_][4][]const u8{
    .{ "artist", "Artist Pass #1", "Backstage access, rider info, production contacts", "/api/nft-image/artist/1" },
    .{ "artist", "Artist Pass #2", "Backstage access, rider info, production contacts", "/api/nft-image/artist/2" },
    .{ "artist", "Artist Pass #3", "Backstage access, rider info, production contacts", "/api/nft-image/artist/3" },
    .{ "artist", "Artist Pass #4", "Backstage access, rider info, production contacts", "/api/nft-image/artist/4" },
    .{ "artist", "Artist Pass #5", "Backstage access, rider info, production contacts", "/api/nft-image/artist/5" },
    .{ "vip", "VIP Pass #1", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/1" },
    .{ "vip", "VIP Pass #2", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/2" },
    .{ "vip", "VIP Pass #3", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/3" },
    .{ "vip", "VIP Pass #4", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/4" },
    .{ "vip", "VIP Pass #5", "Premium viewing, open bar, meet & greet, concierge", "/api/nft-image/vip/5" },
};
