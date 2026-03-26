"use client";

import { useState, useEffect } from "react";

let _lang = "en";
const t = (ja: string, en: string, lang?: string) => ((lang || _lang) === "ja" ? ja : en);

interface Endpoint { method: string; path: string; ja: string; en: string; auth: boolean; }

const endpoints: Record<string, Endpoint[]> = {
  "Auth": [
    { method: "POST", path: "/api/v1/auth/register", ja: "ユーザー登録（APIキー自動発行）", en: "Register user (auto-issues API key)", auth: false },
    { method: "POST", path: "/api/v1/auth/login", ja: "ログイン", en: "Login", auth: false },
  ],
  "API Keys": [
    { method: "GET", path: "/api/v1/keys", ja: "APIキー一覧", en: "List API keys", auth: true },
    { method: "POST", path: "/api/v1/keys", ja: "新しいAPIキーを発行", en: "Generate new API key", auth: true },
    { method: "DELETE", path: "/api/v1/keys/:id", ja: "APIキーを削除", en: "Delete API key", auth: true },
  ],
  "User": [
    { method: "GET", path: "/api/v1/me", ja: "プロフィール確認", en: "Get profile", auth: true },
    { method: "POST", path: "/api/v1/me/upgrade", ja: "Proプランにアップグレード", en: "Upgrade to Pro plan", auth: true },
  ],
  "Tracks": [
    { method: "POST", path: "/api/v1/tracks", ja: "楽曲アップロード (multipart)", en: "Upload track (multipart)", auth: true },
    { method: "GET", path: "/api/v1/tracks", ja: "自分の楽曲一覧", en: "List my tracks", auth: true },
    { method: "GET", path: "/api/v1/tracks/:id", ja: "楽曲詳細", en: "Get track details", auth: false },
    { method: "PATCH", path: "/api/v1/tracks/:id", ja: "楽曲を更新", en: "Update track", auth: true },
    { method: "DELETE", path: "/api/v1/tracks/:id", ja: "楽曲を削除", en: "Delete track", auth: true },
    { method: "GET", path: "/api/v1/tracks/:id/stream", ja: "音声ストリーミング (Range対応)", en: "Stream audio (Range support)", auth: false },
  ],
  "Rights": [
    { method: "PUT", path: "/api/v1/tracks/:id/rights", ja: "権利者と分配率を設定（確認メール送信）", en: "Set rights holders & splits (sends confirmation)", auth: true },
    { method: "GET", path: "/api/v1/tracks/:id/rights", ja: "権利情報・ステータス・監査ログ取得", en: "Get rights info, status & audit log", auth: true },
    { method: "GET", path: "/api/v1/tracks/:id/audit-log", ja: "監査ログ", en: "Get audit log", auth: true },
    { method: "POST", path: "/api/v1/rights/dispute", ja: "紛争を申立て（ロイヤリティ凍結）", en: "File dispute (freezes royalties)", auth: false },
  ],
  "Rights Holders": [
    { method: "POST", path: "/api/v1/rights-holders", ja: "権利者を登録", en: "Create rights holder", auth: true },
    { method: "GET", path: "/api/v1/rights-holders", ja: "権利者一覧", en: "List rights holders", auth: true },
    { method: "PATCH", path: "/api/v1/rights-holders/:id", ja: "権利者情報を更新", en: "Update rights holder", auth: true },
    { method: "POST", path: "/api/v1/rights-holders/:id/verify-email", ja: "メール認証を送信", en: "Send email verification", auth: true },
  ],
  "Royalties": [
    { method: "GET", path: "/api/v1/rights-holders/:id/royalties", ja: "ロイヤリティダッシュボード", en: "Royalty dashboard", auth: true },
    { method: "GET", path: "/api/v1/tracks/:id/royalties", ja: "トラック別収益レポート", en: "Track revenue report", auth: true },
    { method: "GET", path: "/api/v1/royalty-rates", ja: "ロイヤリティレート", en: "Get royalty rates", auth: false },
  ],
  "Payouts": [
    { method: "POST", path: "/api/v1/rights-holders/:id/payouts", ja: "出金申請（最低¥1,000）", en: "Request payout (min ¥1,000)", auth: true },
    { method: "GET", path: "/api/v1/rights-holders/:id/payouts", ja: "出金履歴", en: "Payout history", auth: true },
  ],
  "Radios": [
    { method: "POST", path: "/api/v1/radios", ja: "ラジオ局を作成", en: "Create radio station", auth: true },
    { method: "GET", path: "/api/v1/radios", ja: "自分のラジオ一覧", en: "List my radios", auth: true },
    { method: "GET", path: "/api/v1/radios/:slug", ja: "ラジオ詳細（公開）", en: "Get radio details (public)", auth: false },
    { method: "GET", path: "/api/v1/radios/:slug/listen", ja: "プレイリスト取得", en: "Get playlist", auth: false },
    { method: "POST", path: "/api/v1/radios/:id/tracks", ja: "ラジオにトラック追加", en: "Add track to radio", auth: true },
    { method: "DELETE", path: "/api/v1/radios/:id/tracks/:trackId", ja: "ラジオからトラック削除", en: "Remove track from radio", auth: true },
  ],
  "Tickets": [
    { method: "GET", path: "/api/v1/tickets/types", ja: "チケット種別一覧", en: "List ticket types", auth: false },
    { method: "POST", path: "/api/v1/tickets/checkout", ja: "チケット購入（Stripe Checkout）", en: "Purchase tickets (Stripe Checkout)", auth: false },
    { method: "GET", path: "/api/v1/tickets/mine?email=...", ja: "自分のチケット確認", en: "My tickets by email", auth: false },
    { method: "POST", path: "/api/v1/tickets/:id/transfer", ja: "チケット譲渡", en: "Transfer ticket", auth: false },
    { method: "POST", path: "/api/v1/tickets/checkin", ja: "チェックイン（QRスキャン）", en: "Check-in (QR scan)", auth: true },
  ],
  "Explore": [
    { method: "GET", path: "/api/v1/explore/radios", ja: "公開ラジオ一覧", en: "Browse public radios", auth: false },
    { method: "GET", path: "/api/v1/explore/tracks", ja: "公開トラック一覧", en: "Browse public tracks", auth: false },
  ],
};

const methodColors: Record<string, string> = {
  GET: "#4ade80", POST: "#60a5fa", PUT: "#fbbf24", PATCH: "#c084fc", DELETE: "#f87171",
};

export default function DevelopersPage() {
  const [lang, setLang] = useState("en");
  useEffect(() => {
    const s = localStorage.getItem("soluna-lang");
    if (s) setLang(s);
    else if (navigator.language.startsWith("ja")) setLang("ja");
  }, []);
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); _lang = n; localStorage.setItem("soluna-lang", n); };
  _lang = lang;

  const gold = "#C9A962";
  const dim = "rgba(255,255,255,0.35)";
  const border = "rgba(255,255,255,0.05)";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #05060a 0%, #0a0d14 30%, #111827 100%)", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <header style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}` }}>
        <a href="/" style={{ color: gold, textDecoration: "none", fontSize: 13, letterSpacing: 5, fontWeight: 700 }}>SOLUNA</a>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="/music" style={{ color: dim, textDecoration: "none", fontSize: 11, letterSpacing: 2 }}>{t("音楽", "MUSIC", lang)}</a>
          <a href="/rights" style={{ color: dim, textDecoration: "none", fontSize: 11, letterSpacing: 2 }}>{t("権利管理", "RIGHTS", lang)}</a>
          <button onClick={toggleLang} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>{lang === "ja" ? "EN" : "JP"}</button>
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: gold, marginBottom: 16 }}>API REFERENCE</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, letterSpacing: -1, margin: "0 0 16px" }}>
            {t("SOLUNA API ドキュメント", "SOLUNA API Documentation")}
          </h1>
          <p style={{ fontSize: 14, color: dim, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            {t("RESTful API で楽曲、ラジオ、権利、チケットを管理。", "Manage tracks, radios, rights, and tickets via RESTful API.")}
          </p>
        </div>

        {/* Quick start */}
        <div style={{ marginBottom: 48, background: "rgba(201,169,98,0.04)", border: "1px solid rgba(201,169,98,0.12)", borderRadius: 16, padding: "28px 24px" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: gold }}>{t("クイックスタート", "Quick Start")}</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: dim, marginBottom: 4, letterSpacing: 1 }}>1. {t("ユーザー登録", "Register")}</div>
              <pre style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: "#e2e8f0", overflowX: "auto", margin: 0 }}>
{`curl -X POST https://solun.art/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","password":"secure123","name":"Your Name"}'`}
              </pre>
            </div>
            <div>
              <div style={{ fontSize: 11, color: dim, marginBottom: 4, letterSpacing: 1 }}>2. {t("楽曲アップロード", "Upload Track")}</div>
              <pre style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: "#e2e8f0", overflowX: "auto", margin: 0 }}>
{`curl -X POST https://solun.art/api/v1/tracks \\
  -H "Authorization: Bearer sk_YOUR_API_KEY" \\
  -F "file=@track.mp3" -F "title=My Track" -F "artist=Me"`}
              </pre>
            </div>
            <div>
              <div style={{ fontSize: 11, color: dim, marginBottom: 4, letterSpacing: 1 }}>3. {t("ラジオ作成", "Create Radio")}</div>
              <pre style={{ background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: "#e2e8f0", overflowX: "auto", margin: 0 }}>
{`curl -X POST https://solun.art/api/v1/radios \\
  -H "Authorization: Bearer sk_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"My Radio","shuffle":true}'`}
              </pre>
            </div>
          </div>
        </div>

        {/* Auth info */}
        <div style={{ marginBottom: 48, background: "rgba(255,255,255,0.02)", border: `1px solid ${border}`, borderRadius: 16, padding: "24px 24px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t("認証", "Authentication")}</h3>
          <p style={{ fontSize: 13, color: dim, lineHeight: 1.6, margin: "0 0 12px" }}>
            {t(
              "APIキーをAuthorizationヘッダーに含めてリクエストします。登録時に自動発行され、追加キーも生成できます。",
              "Include your API key in the Authorization header. Auto-issued on registration; additional keys can be generated."
            )}
          </p>
          <pre style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: gold, margin: 0 }}>
            Authorization: Bearer sk_XXXXXXXX_YYYYYYYYYYYYYYYY
          </pre>
        </div>

        {/* Endpoints */}
        {Object.entries(endpoints).map(([section, eps]) => (
          <div key={section} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 12, letterSpacing: 2, color: gold, marginBottom: 12, fontWeight: 600 }}>{section.toUpperCase()}</h2>
            <div style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
              {eps.map((ep, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: i < eps.length - 1 ? `1px solid ${border}` : "none", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 0.5, padding: "2px 6px", borderRadius: 4,
                    background: `${methodColors[ep.method]}15`, color: methodColors[ep.method],
                    fontFamily: "monospace", flexShrink: 0, minWidth: 44, textAlign: "center",
                  }}>{ep.method}</span>
                  <code style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "monospace", flex: "1 1 200px", minWidth: 0, wordBreak: "break-all" }}>{ep.path}</code>
                  <span style={{ fontSize: 12, color: dim, flex: "1 1 180px" }}>{t(ep.ja, ep.en, lang)}</span>
                  {ep.auth && <span style={{ fontSize: 9, background: "rgba(201,169,98,0.1)", color: gold, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>AUTH</span>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Response format */}
        <div style={{ marginBottom: 48, background: "rgba(255,255,255,0.02)", border: `1px solid ${border}`, borderRadius: 16, padding: "24px 24px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t("レスポンス形式", "Response Format")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#4ade80", marginBottom: 4, letterSpacing: 1 }}>{t("成功", "SUCCESS")}</div>
              <pre style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "12px 14px", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6 }}>
{`{
  "ok": true,
  "track": { ... }
}`}
              </pre>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#f87171", marginBottom: 4, letterSpacing: 1 }}>{t("エラー", "ERROR")}</div>
              <pre style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "12px 14px", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6 }}>
{`{
  "error": "message"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Rate limits */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${border}`, borderRadius: 16, padding: "24px 24px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t("制限・仕様", "Limits & Specs")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            {[
              { ja: "ファイルサイズ", en: "File size", val: "50 MB" },
              { ja: "対応形式", en: "Formats", val: "MP3, M4A, WAV, OGG, FLAC, AAC" },
              { ja: "Free上限", en: "Free limit", val: t("10曲", "10 tracks", lang) },
              { ja: "Pro上限", en: "Pro limit", val: t("100曲", "100 tracks", lang) },
              { ja: "最低出金額", en: "Min payout", val: "¥1,000" },
              { ja: "Base URL", en: "Base URL", val: "https://solun.art" },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, color: dim, marginBottom: 2 }}>{t(item.ja, item.en, lang)}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <a href="/music" style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none", fontSize: 12 }}>{t("音楽", "Music")}</a>
          <a href="/rights" style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none", fontSize: 12 }}>{t("権利管理", "Rights")}</a>
          <a href="/tickets" style={{ color: "rgba(255,255,255,0.2)", textDecoration: "none", fontSize: 12 }}>{t("チケット", "Tickets")}</a>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: 2, marginTop: 16 }}>SOLUNA FEST HAWAII 2026</div>
      </footer>
    </div>
  );
}
