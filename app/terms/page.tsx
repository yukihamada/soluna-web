"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.7 }, viewport: { once: true } };

const SECTIONS = [
  {
    ja: "1. サービスの利用",
    en: "1. Use of Service",
    ja_body: "本サービス（solun.art）は、SOLUNA FEST HAWAII 2026 イベントに関する情報提供、パートナー申込、およびチケット関連情報を提供することを目的としています。\n\n本サイトは SOLUNA LLC（ハワイ州設立）が運営しています。サービスをご利用いただくことで、本利用規約に同意したものとみなします。",
    en_body: "This service (solun.art) is intended to provide information about the SOLUNA FEST HAWAII 2026 event, facilitate partner applications, and share ticket-related information.\n\nThis site is operated by SOLUNA LLC (incorporated in Hawaii). By using this service, you agree to these Terms of Service.",
  },
  {
    ja: "2. 知的財産権",
    en: "2. Intellectual Property",
    ja_body: "本サイト上のすべてのコンテンツ（テキスト、画像、デザイン、ロゴ等）は、SOLUNA LLC または SOLUNA（JC SOLUNA）の所有物です。事前の書面による許可なく、これらを複製・配布・改変することを禁止します。\n\nSOLUNA ブランドおよびロゴは JC SOLUNA の商標であり、ライセンス契約のもと使用されています。",
    en_body: "All content on this site (text, images, design, logos, etc.) is the property of SOLUNA LLC or SOLUNA (JC SOLUNA). Reproduction, distribution, or modification without prior written permission is prohibited.\n\nThe SOLUNA brand and logo are trademarks of JC SOLUNA and are used under license.",
  },
  {
    ja: "3. パートナー申込・契約",
    en: "3. Partner Applications & Contracts",
    ja_body: "本サイトを通じて提出された投資・スポンサー申込は、SOLUNA LLC との正式な契約交渉の開始を意味します。\n\n• 申込はお客様の意向確認であり、法的拘束力のある契約ではありません\n• 正式契約は別途書面（または電子署名）にて締結されます\n• 虚偽の情報を提供した場合、申込を無効とする場合があります",
    en_body: "Investment and sponsor applications submitted through this site initiate formal contract negotiations with SOLUNA LLC.\n\n• An application confirms your intent but does not constitute a legally binding contract\n• Formal contracts are executed separately in writing (or via electronic signature)\n• Applications may be voided if false information is provided",
  },
  {
    ja: "4. 支払いと返金",
    en: "4. Payments & Refunds",
    ja_body: "決済は Stripe を通じて安全に処理されます。\n\n• スポンサー・投資金の入金後の返金は、個別の契約条件に従います\n• チケットの購入・返金ポリシーは Ticketblox のプラットフォームポリシーに準拠します\n• 技術的エラーによる誤請求は、確認後に速やかに返金対応いたします",
    en_body: "Payments are processed securely via Stripe.\n\n• Refunds for sponsor/investment payments are subject to individual contract terms\n• Ticket purchase and refund policies follow the Ticketblox platform policy\n• Erroneous charges due to technical errors will be promptly refunded upon verification",
  },
  {
    ja: "5. イベントの変更・中止",
    en: "5. Event Changes & Cancellation",
    ja_body: "SOLUNA LLC は、やむを得ない事情（天災、行政命令、不可抗力等）によりイベントの内容変更または中止を行う場合があります。\n\n• 中止の場合、チケット代金の返金対応についてはTicketbloxのポリシーに準じます\n• スポンサー・投資パートナーへの対応は個別契約の条項に基づきます\n• ラインナップの変更は払い戻し事由とはなりません",
    en_body: "SOLUNA LLC may change or cancel the event due to circumstances beyond its control (natural disasters, government orders, force majeure, etc.).\n\n• In case of cancellation, ticket refunds follow Ticketblox's policy\n• Arrangements for sponsor and investment partners are governed by individual contract terms\n• Changes to the lineup do not constitute grounds for refunds",
  },
  {
    ja: "6. 免責事項",
    en: "6. Disclaimer",
    ja_body: "本サイトに掲載された情報は、可能な限り正確を期していますが、完全性・正確性を保証するものではありません。\n\nSOLUNA LLC は、本サービスの利用に起因する直接的・間接的な損害について、法律の定める範囲を超えた責任を負いません。",
    en_body: "Information on this site is provided with the utmost care for accuracy, but we do not guarantee its completeness or accuracy.\n\nSOLUNA LLC shall not be liable for any direct or indirect damages arising from the use of this service beyond what is required by law.",
  },
  {
    ja: "7. 準拠法・管轄",
    en: "7. Governing Law & Jurisdiction",
    ja_body: "本利用規約は、米国ハワイ州法に準拠するものとします。\n\n本規約に関する紛争は、ハワイ州の管轄裁判所において解決するものとします。",
    en_body: "These Terms of Service are governed by the laws of the State of Hawaii, USA.\n\nAny disputes arising from these Terms shall be resolved in the courts of the State of Hawaii.",
  },
  {
    ja: "8. 規約の変更",
    en: "8. Changes to Terms",
    ja_body: "SOLUNA LLC は、本利用規約を予告なく変更する場合があります。変更後も本サービスを引き続き利用される場合は、改定後の規約に同意したものとみなします。",
    en_body: "SOLUNA LLC may update these Terms of Service without prior notice. Continued use of the service after changes constitutes acceptance of the revised terms.",
  },
  {
    ja: "9. お問い合わせ",
    en: "9. Contact",
    ja_body: "本利用規約に関するご質問：\ninfo@solun.art\nSOLUNA FEST HAWAII 2026 / SOLUNA LLC, Hawaii, USA",
    en_body: "For questions about these Terms:\ninfo@solun.art\nSOLUNA FEST HAWAII 2026 / SOLUNA LLC, Hawaii, USA",
  },
];

export default function TermsPage() {
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
          <span className="nav-pill-active">{ja ? "利用規約" : "Terms"}</span>
          <Link href="/privacy" className="nav-pill">{ja ? "プライバシー" : "Privacy"}</Link>
          <button onClick={toggleLang} style={{ marginLeft: 8, padding: "5px 10px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
            {ja ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 20, textTransform: "uppercase" }}>
            {ja ? "利用規約 · 最終更新 2026年2月" : "Terms of Service · Last Updated February 2026"}
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,9vw,4.5rem)", lineHeight: 1, color: "#fff", marginBottom: 20 }}>
            {ja ? "利用規約" : "Terms of\nService"}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 20 }} />
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.8 }}>
            {ja
              ? "SOLUNA FEST HAWAII 2026 のサービスをご利用いただく前に、以下の利用規約をお読みください。"
              : "Please read the following Terms of Service before using SOLUNA FEST HAWAII 2026 services."}
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
          <Link href="/privacy" className="btn-ghost" style={{ marginRight: 10 }}>{ja ? "プライバシーポリシー" : "Privacy Policy"}</Link>
          <Link href="/" className="btn-ghost">{ja ? "トップへ" : "Back to Home"}</Link>
        </motion.div>
      </div>

      <InnerFooter lang={lang} />
    </main>
  );
}
