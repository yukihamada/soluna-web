"use client";

import { useState, useEffect } from "react";

let _lang = "en";
const t = (ja: string, en: string, lang?: string) => ((lang || _lang) === "ja" ? ja : en);

export default function RightsPage() {
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
  const dimmer = "rgba(255,255,255,0.2)";
  const card = "rgba(255,255,255,0.02)";
  const border = "rgba(255,255,255,0.05)";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #05060a 0%, #0a0d14 30%, #111827 100%)", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}` }}>
        <a href="/" style={{ color: gold, textDecoration: "none", fontSize: 13, letterSpacing: 5, fontWeight: 700 }}>SOLUNA</a>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="/music" style={{ color: dim, textDecoration: "none", fontSize: 11, letterSpacing: 2 }}>{t("音楽", "MUSIC", lang)}</a>
          <a href="/developers" style={{ color: dim, textDecoration: "none", fontSize: 11, letterSpacing: 2 }}>API</a>
          <button onClick={toggleLang} style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer", letterSpacing: 1 }}>{lang === "ja" ? "EN" : "JP"}</button>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: gold, marginBottom: 16 }}>RIGHTS MANAGEMENT</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, letterSpacing: -1, margin: "0 0 16px", lineHeight: 1.15 }}>
            {t("透明な権利管理と\nロイヤリティ分配", "Transparent Rights &\nRoyalty Distribution")}
          </h1>
          <p style={{ fontSize: 15, color: dim, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            {t(
              "楽曲の権利者を正しく認証し、再生ごとに自動でロイヤリティを分配。業界標準のベストプラクティスに基づいた仕組みです。",
              "Verify rights holders, automatically distribute royalties per stream. Built on industry-standard best practices from DistroKid, TuneCore & ASCAP."
            )}
          </p>
        </div>

        {/* Flow diagram */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 10, letterSpacing: 3, color: gold, marginBottom: 24, textAlign: "center" }}>
            {t("権利確認フロー", "VERIFICATION FLOW")}
          </h2>
          <div style={{ display: "grid", gap: 2 }}>
            {[
              { step: "01", ja: "楽曲アップロード", en: "Track Upload", descJa: "ISRCコードが自動発行されます", descEn: "ISRC code is automatically assigned", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12", status: "auto" },
              { step: "02", ja: "権利者の設定", en: "Set Rights Holders", descJa: "分配率と役割（作曲・プロデューサー等）を設定", descEn: "Configure split percentages and roles (composer, producer, etc.)", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", status: "manual" },
              { step: "03", ja: "確認メール送信", en: "Confirmation Email", descJa: "各権利者にトークン付きリンクをメール送信", descEn: "Tokenized confirmation link sent to each rights holder", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", status: "auto" },
              { step: "04", ja: "権利者が承認", en: "Rights Holder Confirms", descJa: "リンクをクリックして権利を承認。エスクロー解放。", descEn: "Click link to confirm rights. Escrowed royalties released.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", status: "action" },
              { step: "05", ja: "ロイヤリティ分配", en: "Royalties Distributed", descJa: "再生ごとに設定した比率で自動分配", descEn: "Automatically split per stream based on configured shares", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", status: "auto" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 20, alignItems: "flex-start", background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "20px 24px" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.status === "action" ? "rgba(201,169,98,0.12)" : "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: s.status === "action" ? `1px solid rgba(201,169,98,0.2)` : "1px solid rgba(255,255,255,0.05)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={s.status === "action" ? gold : "rgba(255,255,255,0.4)"} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: gold, fontWeight: 700, letterSpacing: 1 }}>{s.step}</span>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{t(s.ja, s.en, lang)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: dim, lineHeight: 1.5 }}>{t(s.descJa, s.descEn, lang)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status lifecycle */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 10, letterSpacing: 3, color: gold, marginBottom: 24, textAlign: "center" }}>
            {t("権利ステータス", "RIGHTS STATUS LIFECYCLE")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { status: "draft", ja: "下書き", en: "Draft", descJa: "権利未設定。ロイヤリティ分配なし。", descEn: "No rights set. No royalty distribution.", color: "rgba(255,255,255,0.15)", dot: "rgba(255,255,255,0.2)" },
              { status: "pending", ja: "確認待ち", en: "Pending", descJa: "確認メール送信済み。未確認分はエスクローに保持。", descEn: "Confirmation emails sent. Unconfirmed shares held in escrow.", color: "rgba(251,191,36,0.15)", dot: "#fbbf24" },
              { status: "confirmed", ja: "確認済み", en: "Confirmed", descJa: "全権利者が承認。ロイヤリティ通常分配。", descEn: "All holders confirmed. Royalties flow normally.", color: "rgba(74,222,128,0.15)", dot: "#4ade80" },
              { status: "disputed", ja: "紛争中", en: "Disputed", descJa: "異議申立て中。全ロイヤリティがエスクロー凍結。", descEn: "Dispute filed. All royalties frozen in escrow.", color: "rgba(248,113,113,0.15)", dot: "#f87171" },
            ].map((s) => (
              <div key={s.status} style={{ background: s.color, border: `1px solid ${s.dot}22`, borderRadius: 14, padding: "20px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot }} />
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t(s.ja, s.en, lang)}</div>
                </div>
                <div style={{ fontSize: 12, color: dim, lineHeight: 1.5 }}>{t(s.descJa, s.descEn, lang)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Escrow */}
        <div style={{ marginBottom: 64, background: "rgba(201,169,98,0.04)", border: "1px solid rgba(201,169,98,0.12)", borderRadius: 20, padding: "36px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={gold} strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t("エスクロー・システム", "Escrow System")}</h2>
          </div>
          <p style={{ fontSize: 14, color: dim, lineHeight: 1.7, margin: "0 0 20px" }}>
            {t(
              "権利が未確認または紛争中の場合、ロイヤリティはエスクロー（預託金）として安全に保管されます。権利が確認された時点で、蓄積された金額が出金可能残高に自動的に移行します。",
              "When rights are unconfirmed or under dispute, royalties are safely held in escrow. Once rights are confirmed, accumulated funds are automatically released to the payable balance."
            )}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { ja: "未確認時", en: "Unconfirmed", descJa: "確認待ちの権利者分はエスクローへ", descEn: "Unconfirmed holder's share goes to escrow" },
              { ja: "紛争時", en: "Disputed", descJa: "全ロイヤリティがエスクロー凍結", descEn: "All royalties frozen in escrow" },
              { ja: "確認後", en: "After Confirm", descJa: "エスクローから残高に自動解放", descEn: "Auto-released from escrow to balance" },
            ].map((item, i) => (
              <div key={i} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: gold, marginBottom: 4 }}>{t(item.ja, item.en, lang)}</div>
                <div style={{ fontSize: 12, color: dim, lineHeight: 1.4 }}>{t(item.descJa, item.descEn, lang)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Royalty rates */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 10, letterSpacing: 3, color: gold, marginBottom: 24, textAlign: "center" }}>
            {t("ロイヤリティ・レート", "ROYALTY RATES")}
          </h2>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${border}` }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, color: dimmer, letterSpacing: 1, fontWeight: 500 }}>{t("イベント", "EVENT")}</th>
                  <th style={{ padding: "14px 20px", textAlign: "right", fontSize: 11, color: dimmer, letterSpacing: 1, fontWeight: 500 }}>{t("単価", "RATE")}</th>
                  <th style={{ padding: "14px 20px", textAlign: "right", fontSize: 11, color: dimmer, letterSpacing: 1, fontWeight: 500 }}>{t("例（1万回）", "EX. (10K)")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ja: "ストリーム再生", en: "Stream Play", rate: 0.5, icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" },
                  { ja: "ラジオ再生", en: "Radio Play", rate: 1.0, icon: "M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" },
                  { ja: "ダウンロード", en: "Download", rate: 5.0, icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: i < 2 ? `1px solid ${border}` : "none" }}>
                    <td style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={gold} strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={row.icon} />
                      </svg>
                      <span style={{ fontSize: 14 }}>{t(row.ja, row.en, lang)}</span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right", fontSize: 16, fontWeight: 600, color: gold, fontFamily: "monospace" }}>
                      &yen;{row.rate.toFixed(1)}
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right", fontSize: 14, color: dim, fontFamily: "monospace" }}>
                      &yen;{(row.rate * 10000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: dimmer }}>
            {t("出金最低額: ¥1,000 / 対応: 銀行振込・PayPal・暗号通貨", "Min payout: ¥1,000 / Methods: Bank transfer, PayPal, Crypto")}
          </div>
        </div>

        {/* Dispute */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 10, letterSpacing: 3, color: gold, marginBottom: 24, textAlign: "center" }}>
            {t("紛争解決プロセス", "DISPUTE RESOLUTION")}
          </h2>
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "28px 24px" }}>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                { num: "1", ja: "異議申立て", en: "File Dispute", descJa: "楽曲の権利に異議がある場合、メールアドレスと理由を提出。", descEn: "If you have a claim on a track's rights, submit your email and reason." },
                { num: "2", ja: "ロイヤリティ凍結", en: "Royalties Frozen", descJa: "紛争中は該当楽曲の全ロイヤリティがエスクローに自動凍結。", descEn: "All royalties for the disputed track are automatically frozen in escrow." },
                { num: "3", ja: "証拠提出", en: "Evidence Review", descJa: "関係者が契約書・権利登録等の証拠を提出。", descEn: "Parties submit evidence: contracts, PRO registrations, split sheets." },
                { num: "4", ja: "解決・再分配", en: "Resolution", descJa: "管理者が審査し、確定した分配率に基づいてエスクローを解放。", descEn: "Admin reviews and releases escrow based on confirmed splits." },
              ].map((s) => (
                <div key={s.num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#f87171" }}>{s.num}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{t(s.ja, s.en, lang)}</div>
                    <div style={{ fontSize: 13, color: dim, lineHeight: 1.5 }}>{t(s.descJa, s.descEn, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ISRC */}
        <div style={{ marginBottom: 64, background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "28px 24px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>{t("ISRCコード自動発行", "Automatic ISRC Codes")}</h3>
          <p style={{ fontSize: 13, color: dim, lineHeight: 1.7, margin: "0 0 16px" }}>
            {t(
              "ISRC（国際標準レコーディングコード）は楽曲を世界中で一意に識別するコードです。SOLUNAではアップロード時に自動で発行されます。",
              "ISRC (International Standard Recording Code) uniquely identifies sound recordings worldwide. SOLUNA automatically assigns one at upload time."
            )}
          </p>
          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 14, color: gold, letterSpacing: 2 }}>
            JP-SOL-26-00001
          </div>
          <div style={{ fontSize: 11, color: dimmer, marginTop: 8 }}>
            {t("形式: 国コード-登録者-年-連番", "Format: Country-Registrant-Year-Sequence")}
          </div>
        </div>

        {/* Payout requirements */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 10, letterSpacing: 3, color: gold, marginBottom: 24, textAlign: "center" }}>
            {t("出金要件", "PAYOUT REQUIREMENTS")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", ja: "メール認証", en: "Email Verified", descJa: "権利者のメールアドレスの所有を確認", descEn: "Confirm ownership of rights holder email" },
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", ja: "権利確認済み", en: "Rights Confirmed", descJa: "全ての権利割り当てが承認済み", descEn: "All rights assignments confirmed" },
              { icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", ja: "振込先設定", en: "Payout Method Set", descJa: "銀行振込・PayPal・暗号通貨", descEn: "Bank transfer, PayPal, or crypto" },
              { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", ja: "最低¥1,000", en: "Min ¥1,000", descJa: "最低出金額を超えていること", descEn: "Balance exceeds minimum payout threshold" },
            ].map((item, i) => (
              <div key={i} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "20px 18px", textAlign: "center" }}>
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={gold} strokeWidth={1.5} style={{ margin: "0 auto 12px", display: "block" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t(item.ja, item.en, lang)}</div>
                <div style={{ fontSize: 11, color: dim, lineHeight: 1.4 }}>{t(item.descJa, item.descEn, lang)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "28px 24px", marginBottom: 64 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t("監査ログ", "Audit Trail")}</h3>
          <p style={{ fontSize: 13, color: dim, lineHeight: 1.7, margin: 0 }}>
            {t(
              "全ての権利操作（設定・確認・紛争・解決）は不変の監査ログに記録されます。いつ、誰が、何を行ったかを完全に追跡可能です。",
              "Every rights operation (set, confirm, dispute, resolve) is recorded in an immutable audit log. Fully traceable: who did what, and when."
            )}
          </p>
          <div style={{ marginTop: 16, background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 16, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 2 }}>
            <div><span style={{ color: gold }}>[2026-03-25 14:17]</span> rights_set <span style={{ color: dim }}>by dj@solun.art</span></div>
            <div><span style={{ color: "#fbbf24" }}>[2026-03-25 14:17]</span> rights_confirmed <span style={{ color: dim }}>by Producer X</span></div>
            <div><span style={{ color: "#f87171" }}>[2026-03-25 14:17]</span> dispute_filed <span style={{ color: dim }}>by claimant@example.com</span></div>
            <div><span style={{ color: "#4ade80" }}>[2026-03-25 15:30]</span> dispute_resolved <span style={{ color: dim }}>by admin</span></div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "0 0 24px" }}>
          <a href="/developers" style={{ display: "inline-block", background: "linear-gradient(135deg, #C9A962, #a88b3d)", color: "#000", padding: "14px 36px", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15 }}>
            {t("APIドキュメントを見る", "View API Documentation")}
          </a>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${border}`, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <a href="/music" style={{ color: dimmer, textDecoration: "none", fontSize: 12 }}>{t("音楽", "Music")}</a>
          <a href="/developers" style={{ color: dimmer, textDecoration: "none", fontSize: 12 }}>API</a>
          <a href="/tickets" style={{ color: dimmer, textDecoration: "none", fontSize: 12 }}>{t("チケット", "Tickets")}</a>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.1)", letterSpacing: 2, marginTop: 16 }}>SOLUNA FEST HAWAII 2026</div>
      </footer>
    </div>
  );
}
