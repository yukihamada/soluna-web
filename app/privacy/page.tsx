"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const SECTIONS = [
  {
    ja: "1. データ管理者",
    en: "1. Data Controller",
    ja_body: "SOLUNA LLC（ハワイ州設立）が、SOLUNA FEST HAWAII 2026 イベントに関連する個人情報の管理者です。\nお問い合わせ：info@solun.art",
    en_body: "SOLUNA LLC (incorporated in Hawaii) is the data controller for personal information related to SOLUNA FEST HAWAII 2026.\nContact: info@solun.art",
  },
  {
    ja: "2. 収集する情報",
    en: "2. Information We Collect",
    ja_body: "以下の情報をお客様から収集する場合があります：\n• 氏名・会社名（フォーム入力時）\n• メールアドレス（登録・契約・ミーティング予約時）\n• 電話番号（任意）\n• 電子署名（契約締結時）\n• 支払い情報（Stripe 経由で処理。カード情報は当社サーバーに保存されません）\n• ミーティング希望日時・内容",
    en_body: "We may collect the following information from you:\n• Name and company name (when filling out forms)\n• Email address (registration, contract submission, meeting booking)\n• Phone number (optional)\n• Digital signature (contract execution)\n• Payment information (processed via Stripe — card data is never stored on our servers)\n• Preferred meeting date/time and details",
  },
  {
    ja: "3. 情報の利用目的",
    en: "3. How We Use Your Information",
    ja_body: "収集した情報は以下の目的で使用します：\n• イベントに関する最新情報・お知らせの送信\n• パートナー・スポンサー対応\n• 決済処理\n• 契約・法的義務の履行\n• カスタマーサポート",
    en_body: "We use collected information for the following purposes:\n• Sending event updates and announcements\n• Partner and sponsor coordination\n• Payment processing\n• Fulfilling contracts and legal obligations\n• Customer support",
  },
  {
    ja: "4. 情報の共有",
    en: "4. Data Sharing",
    ja_body: "当社は以下の場合を除き、お客様の個人情報を第三者に販売・共有しません：\n• Stripe（決済処理）\n• 法的義務に基づく開示\n• お客様の明示的な同意がある場合",
    en_body: "We do not sell or share your personal information except in the following cases:\n• Stripe (payment processing)\n• Disclosure required by law\n• With your explicit consent",
  },
  {
    ja: "5. データの保存期間",
    en: "5. Data Retention",
    ja_body: "• 登録データ・ミーティング記録：イベント終了後 90 日間\n• 契約・支払いデータ：7 年間（法的義務）\n• メールマーケティングデータ：配信停止申請まで",
    en_body: "• Registration data and meeting records: 90 days after the event\n• Contract and payment data: 7 years (legal requirement)\n• Email marketing data: until unsubscribe request",
  },
  {
    ja: "6. お客様の権利",
    en: "6. Your Rights",
    ja_body: "お客様は以下の権利を有します：\n• 保有個人情報へのアクセス・訂正・削除の請求\n• マーケティングメールの配信停止（各メール内のリンクから）\n• データポータビリティの要求\n\nご要望は info@solun.art までご連絡ください。",
    en_body: "You have the following rights:\n• Request access to, correction of, or deletion of your personal data\n• Opt out of marketing emails (via link in each email)\n• Request data portability\n\nPlease contact us at info@solun.art for any requests.",
  },
  {
    ja: "7. セキュリティ",
    en: "7. Security",
    ja_body: "お客様の情報を保護するために業界標準のセキュリティ対策を講じています。ただし、インターネット上での完全なセキュリティを保証することはできません。",
    en_body: "We implement industry-standard security measures to protect your information. However, we cannot guarantee absolute security over the internet.",
  },
  {
    ja: "8. Cookie について",
    en: "8. Cookies",
    ja_body: "当サイトは言語設定の保存にローカルストレージを使用しています。Google Analytics（匿名化済み）によるアクセス解析も行っています。",
    en_body: "This site uses local storage to save your language preference. We also use Google Analytics (anonymized) for access analysis.",
  },
  {
    ja: "9. プライバシーポリシーの変更",
    en: "9. Changes to This Policy",
    ja_body: "当ポリシーは予告なく更新される場合があります。重要な変更がある場合は、登録メールアドレスにご通知します。",
    en_body: "This policy may be updated without prior notice. For significant changes, we will notify you at your registered email address.",
  },
  {
    ja: "10. お問い合わせ",
    en: "10. Contact",
    ja_body: "プライバシーに関するご質問・ご要望：\ninfo@solun.art\nSOLUNA FEST HAWAII 2026 / SOLUNA LLC, Hawaii, USA",
    en_body: "For privacy inquiries or requests:\ninfo@solun.art\nSOLUNA FEST HAWAII 2026 / SOLUNA LLC, Hawaii, USA",
  },
];

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  useEffect(() => { setLang(getSavedLang()); }, []);
  const ja = lang === "ja";
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      <nav className="top-nav no-print">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none" }}>
          SOLUNA FEST HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <Link href="/info" className="nav-pill">{ja ? "アクセス" : "Info"}</Link>
          <Link href="/terms" className="nav-pill">{ja ? "利用規約" : "Terms"}</Link>
          <span className="nav-pill-active">{ja ? "プライバシー" : "Privacy"}</span>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 20, textTransform: "uppercase" }}>
            {ja ? "プライバシーポリシー · 最終更新 2026年2月" : "Privacy Policy · Last Updated February 2026"}
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,9vw,4.5rem)", lineHeight: 1, color: "#fff", marginBottom: 20 }}>
            {ja ? "プライバシー\nポリシー" : "Privacy\nPolicy"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.8 }}>
            {ja
              ? "SOLUNA FEST HAWAII 2026 をご利用いただくにあたり、お客様の個人情報の取り扱いについてご説明します。"
              : "This policy explains how SOLUNA FEST HAWAII 2026 handles your personal information."}
          </p>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SECTIONS.map((s, i) => (
            <motion.div key={i} {...fade} className="card" style={{ padding: "22px 26px" }}>
              <h2 className="font-display" style={{ fontSize: "clamp(1rem,3vw,1.3rem)", color: "rgba(201,169,98,0.9)", marginBottom: 12, letterSpacing: "0.04em" }}>
                {ja ? s.ja : s.en}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13.5, lineHeight: 1.85, whiteSpace: "pre-line" }}>
                {ja ? s.ja_body : s.en_body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fade} style={{ marginTop: 48, textAlign: "center" }}>
          <Link href="/terms" className="btn-ghost" style={{ marginRight: 10 }}>{ja ? "利用規約" : "Terms of Service"}</Link>
          <Link href="/" className="btn-ghost">{ja ? "トップへ" : "Back to Home"}</Link>
        </motion.div>
      </div>

      <InnerFooter lang={lang} />
    </main>
  );
}
