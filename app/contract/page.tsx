"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getSavedLang, saveLang } from "@/lib/lang";

type Lang = "ja" | "en";
type Step = 1 | 2 | 3;
type ContractType = "nda" | "investment" | "sponsor" | null;

const fade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "12px 16px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  width: "100%",
  fontFamily: "Inter, sans-serif",
};

const inputStyleError: React.CSSProperties = {
  ...inputStyle,
  border: "1px solid rgba(255,80,80,0.6)",
};

const radioCardStyle = (active: boolean): React.CSSProperties => ({
  border: `1px solid ${active ? "rgba(201,169,98,0.6)" : "rgba(255,255,255,0.1)"}`,
  background: active ? "rgba(201,169,98,0.08)" : "rgba(255,255,255,0.02)",
  borderRadius: 10,
  padding: "12px 16px",
  cursor: "pointer",
  color: active ? "var(--gold)" : "rgba(255,255,255,0.5)",
  fontSize: 13,
  transition: "all 0.2s",
});

const NDA_TEXT_JA = `第1条（目的）
甲および乙は、ZAMNA HAWAII 2026プロジェクトに関する機密情報の取り扱いについて、相互に合意する。

第2条（機密情報の定義）
本契約において「機密情報」とは、事業計画、財務情報、投資条件、アーティスト情報、その他一方当事者が開示した非公開情報をいう。

第3条（秘密保持義務）
乙は甲が開示した機密情報を厳密に秘密として保持し、甲の書面による事前承諾なしに第三者に開示してはならない。

第4条（有効期間）
本契約は署名日より2年間有効とする。`;

const NDA_TEXT_EN = `Article 1 (Purpose)
Both parties agree on the handling of confidential information relating to the ZAMNA HAWAII 2026 project.

Article 2 (Confidential Information)
"Confidential Information" means business plans, financials, investment terms, artist information, and any other non-public information disclosed by either party.

Article 3 (Non-Disclosure)
The receiving party shall keep all Confidential Information strictly confidential and shall not disclose it to any third party without prior written consent.

Article 4 (Term)
This agreement is effective for 2 years from the date of signing.`;

const INVESTMENT_TEXT_JA = `第1条（投資条件）
乙は甲に対し、本タームシートに記載の条件に従い投資を実行することに合意する。

第2条（資金使途）
調達資金は100%、ZAMNA HAWAII 2026におけるアーティストギャランティーの支払いに充当する。

第3条（返済優先度）
乙への返済はチケット売上収益からFirst-out（最優先）で実施する。チケット売上累計が投資額に達した時点で即時全額返済を行う。

第4条（追加リターン）
元本返済後、合意した追加リターン条件（固定利子・収益分配・スポンサー権等）を実施する。

第5条（準拠法）
本契約はハワイ州法および日本法に準拠する。`;

const INVESTMENT_TEXT_EN = `Article 1 (Investment Terms)
Party B agrees to make the investment in Party A under the terms set forth in this Term Sheet.

Article 2 (Use of Funds)
100% of the raised capital will be allocated to artist guarantee payments for ZAMNA HAWAII 2026.

Article 3 (Repayment Priority)
Repayment to Party B will be made on a First-out (highest priority) basis from ticket revenue. Full repayment occurs when cumulative ticket revenue reaches the investment amount.

Article 4 (Additional Returns)
After principal repayment, agreed additional return terms (fixed interest, revenue share, sponsorship rights, etc.) will be implemented.

Article 5 (Governing Law)
This agreement is governed by the laws of the State of Hawaii and Japan.`;

const SPONSOR_TEXT_JA = `第1条（スポンサーシップの範囲）
乙は甲に対し、ZAMNA HAWAII 2026イベントのスポンサーとして合意したパッケージに基づくサービスと露出を提供することに同意する。

第2条（スポンサー料の支払い）
乙は合意したスポンサー料を、契約締結後30日以内に甲指定の口座に送金する。

第3条（スポンサー特典）
甲は乙に対し、合意したパッケージに応じたブランド露出・VIP招待・デジタル掲載を提供する。

第4条（イベントのキャンセル）
不可抗力によりイベントが中止となった場合、スポンサー料の全額または一部を返金する。`;

const SPONSOR_TEXT_EN = `Article 1 (Sponsorship Scope)
Party B agrees to provide agreed package services and exposure as a sponsor of the ZAMNA HAWAII 2026 event.

Article 2 (Payment)
Party B shall remit the agreed sponsorship fee to Party A's designated account within 30 days of signing.

Article 3 (Sponsor Benefits)
Party A shall provide brand exposure, VIP invitations, and digital placements corresponding to the agreed package.

Article 4 (Event Cancellation)
In the event of force majeure cancellation, all or part of the sponsorship fee shall be refunded.`;

export default function ContractPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [step, setStep] = useState<Step>(1);
  const [contractType, setContractType] = useState<ContractType>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [signature, setSignature] = useState("");
  const [structure, setStructure] = useState("loan");
  const [amount, setAmount] = useState("$200,000");
  const [returnType, setReturnType] = useState("b");
  const [sponsorPackage, setSponsorPackage] = useState("presenting");
  const [contactPerson, setContactPerson] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  useEffect(() => { setLang(getSavedLang()); }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Contract type pre-selection
    const t = params.get("type") as ContractType;
    const pkg = params.get("package");
    if (t && ["nda", "investment", "sponsor"].includes(t)) {
      setContractType(t);
      if (pkg && ["presenting", "artist", "vip", "custom"].includes(pkg)) {
        setSponsorPackage(pkg);
      }
      setStep(2);
    }
    // Payment result
    if (params.get("paid") === "true") {
      const sessionId = params.get("session_id");
      const sid = params.get("sid");
      setSubmitted(true);
      setPaymentDone(true);
      // Verify and record payment
      if (sessionId) {
        const url = `/api/verify-payment?session_id=${sessionId}${sid ? `&sid=${sid}` : ""}`;
        fetch(url).catch(() => {});
      }
    }
    if (params.get("cancelled") === "true") {
      setSubmitted(true);
      setPaymentCancelled(true);
    }
  }, []);

  const today = new Date().toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const ja = lang === "ja";

  const T = {
    navSponsor: ja ? "スポンサー" : "Sponsor",
    navInvestor: ja ? "投資家" : "Investor",
    navDeal: ja ? "ディール" : "Deal",
    navSchedule: ja ? "スケジュール" : "Schedule",
    navContract: ja ? "契約" : "Contract",
    heroLabel: ja ? "契約・署名 · 機密 · 2026" : "Contract & Signing · Confidential · 2026",
    heroTitle: ja ? "ZAMNA HAWAII 2026\n契約・署名ポータル" : "ZAMNA HAWAII 2026\nContract & Signing Portal",
    heroSub: ja
      ? "NDA、投資契約、スポンサー契約をデジタルで締結できます。\nすべての契約は法的拘束力を持ちます。"
      : "Digitally execute NDAs, investment term sheets, and sponsorship agreements.\nAll contracts carry legal binding force.",
    step1Title: ja ? "契約タイプを選択" : "Select Contract Type",
    step2Title: ja ? "情報を入力" : "Enter Your Details",
    step3Title: ja ? "確認・署名" : "Review & Sign",
    stepLabels: [
      { n: "1", t: ja ? "契約タイプ / Contract Type" : "Contract Type" },
      { n: "2", t: ja ? "情報入力 / Your Details" : "Your Details" },
      { n: "3", t: ja ? "確認・署名 / Review & Sign" : "Review & Sign" },
    ],
    types: [
      {
        id: "nda" as ContractType,
        title: ja ? "NDA（秘密保持契約）" : "NDA",
        subtitle: "Non-Disclosure Agreement",
        price: ja ? "無料" : "Free",
        desc: ja
          ? "詳細資料を受け取る前に締結します。署名は2分で完了します。"
          : "Sign before receiving detailed materials. Takes 2 minutes.",
        icon: "🔒",
        cta: ja ? "NDAに署名する →" : "Sign NDA →",
      },
      {
        id: "investment" as ContractType,
        title: ja ? "投資契約（タームシート）" : "Investment Contract",
        subtitle: "Investment Term Sheet",
        price: "$200,000",
        desc: ja
          ? "チケット収益から最優先で全額返済。固定利息・収益分配・スポンサー権から選択可。"
          : "Repaid first from ticket revenue. Choose fixed interest, revenue share, or sponsorship rights.",
        icon: "📊",
        cta: ja ? "投資契約を結ぶ →" : "Sign Investment Contract →",
      },
      {
        id: "sponsor" as ContractType,
        title: ja ? "スポンサー契約" : "Sponsorship Agreement",
        subtitle: "Sponsorship Agreement",
        price: ja ? "$20K〜$100K+" : "$20K–$100K+",
        desc: ja
          ? "Presenting・Stage・VIP Loungeの3パッケージ。ロゴ露出・VIPチケット・SNS掲載。"
          : "3 packages: Presenting, Stage, VIP Lounge. Logo, VIP tickets, social media.",
        icon: "✨",
        cta: ja ? "スポンサー契約を結ぶ →" : "Sign Sponsorship →",
      },
    ],
    labelName: ja ? "氏名・会社名 / Full Name & Company" : "Full Name",
    labelCompany: ja ? "会社名 / Company Name (任意 / Optional)" : "Company Name (Optional)",
    labelEmail: ja ? "メールアドレス / Email" : "Email Address",
    labelSig: ja ? "署名（フルネームを入力）/ Signature (type full name)" : "Signature (type full name)",
    labelDate: ja ? "日付 / Date" : "Date",
    labelInvestor: ja ? "投資家名 / Investor Name" : "Investor Name",
    labelStructure: ja ? "投資形態 / Investment Structure" : "Investment Structure",
    labelAmount: ja ? "投資金額 / Investment Amount" : "Investment Amount",
    labelReturn: ja ? "追加リターン / Additional Return" : "Additional Return",
    labelContact: ja ? "担当者名 / Contact Person" : "Contact Person",
    labelPackage: ja ? "スポンサーパッケージ / Package" : "Sponsorship Package",
    structures: [
      { id: "loan", label: ja ? "ローン / Loan" : "Loan" },
      { id: "equity", label: ja ? "優先株 / Preferred Equity" : "Preferred Equity" },
      { id: "revenue", label: ja ? "収益分配 / Revenue Share" : "Revenue Share" },
    ],
    returns: [
      { id: "a", label: ja ? "A. 固定利子 10-15% / Fixed Interest" : "A. Fixed Interest 10–15%" },
      { id: "b", label: ja ? "B. 収益分配 20% / Revenue Share 20%" : "B. Revenue Share 20%" },
      { id: "c", label: ja ? "C. スポンサー権 / Sponsorship Rights" : "C. Sponsorship Rights" },
      { id: "d", label: ja ? "D. 次回優先 / Next Event Priority" : "D. Next Event Priority" },
      { id: "e", label: ja ? "E. 組み合わせ / Combination" : "E. Combination" },
    ],
    packages: [
      { id: "presenting", label: "Presenting Partner · $100K+" },
      { id: "artist", label: "Artist Stage · $50K" },
      { id: "vip", label: "VIP Lounge · $20K" },
      { id: "custom", label: ja ? "カスタム / Custom" : "Custom" },
    ],
    btnNext: ja ? "次へ →" : "Next →",
    btnBack: ja ? "← 戻る" : "← Back",
    btnSign: ja ? "確認・署名画面へ →" : "Review & Sign →",
    btnDownload: ja ? "PDFとしてダウンロード / Download as PDF" : "Download as PDF",
    btnSend: ja ? "署名して送信 / Sign & Send" : "Sign & Send",
    btnSchedule: ja ? "ミーティングを予約 / Schedule a Call" : "Schedule a Call",
    reviewTitle: ja ? "契約プレビュー" : "Contract Preview",
    partyA: "甲 / Party A",
    partyB: ja ? "乙 / Party B" : "Party B",
    sigLabel: ja ? "署名 / Signature" : "Signature",
    dateLabel: ja ? "日付 / Date" : "Date",
    successTitle: ja ? "送信が完了しました" : "Submission Complete",
    successMsg: ja
      ? "ご署名ありがとうございます。担当者よりご連絡いたします。"
      : "Thank you for signing. Our team will be in touch shortly.",
    footer: ja
      ? "© 2026 ZAMNA HAWAII · Powered by SOLUNA · Confidential · All rights reserved"
      : "© 2026 ZAMNA HAWAII · Powered by SOLUNA · Confidential · All rights reserved",
    requiredError: ja ? "必須項目を入力してください" : "Please fill in all required fields",
    sigDigital: ja ? "デジタル署名" : "DIGITAL SIGNATURE",
  };

  // ─── Validation ───────────────────────────────────────────────
  const validateStep2 = () => {
    const newErrors: Record<string, boolean> = {};

    if (contractType === "nda") {
      if (!name.trim()) newErrors.name = true;
      if (!email.trim()) newErrors.email = true;
      if (!signature.trim()) newErrors.signature = true;
    } else if (contractType === "investment") {
      if (!name.trim()) newErrors.name = true;
      if (!email.trim()) newErrors.email = true;
      if (!amount.trim()) newErrors.amount = true;
      if (!signature.trim()) newErrors.signature = true;
    } else if (contractType === "sponsor") {
      if (!company.trim()) newErrors.company = true;
      if (!contactPerson.trim()) newErrors.contactPerson = true;
      if (!email.trim()) newErrors.email = true;
      if (!signature.trim()) newErrors.signature = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── PDF generation ────────────────────────────────────────────
  const downloadContractPDF = async () => {
    const el = document.getElementById("contract-preview");
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");
    const canvas = await html2canvas(el, {
      scale: 2, useCORS: true, backgroundColor: "#111",
      windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210, pageH = 297;
    const imgH = (canvas.height * pageW) / canvas.width;
    let left = imgH, pos = 0;
    pdf.addImage(imgData, "JPEG", 0, pos, pageW, imgH);
    left -= pageH;
    while (left > 0) { pos -= pageH; pdf.addPage(); pdf.addImage(imgData, "JPEG", 0, pos, pageW, imgH); left -= pageH; }
    const fileName = contractType === "nda" ? "ZAMNA-NDA.pdf" : contractType === "investment" ? "ZAMNA-TermSheet.pdf" : "ZAMNA-Sponsorship.pdf";
    pdf.save(fileName);
  };

  // ─── Submit: save to DB + mailto ──────────────────────────────
  const handleSendEmail = async () => {
    // 1. Save to DB
    try {
      const resp = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractType,
          name,
          company,
          email,
          amount,
          structure,
          returnType,
          sponsorPackage,
          contactPerson,
          signature,
          lang,
        }),
      });
      const data = await resp.json();
      if (data.id) setSubmissionId(data.id);
    } catch {
      // silently continue even if server is unreachable
    }

    // 2. Open mailto for email notification
    const typeLabel =
      contractType === "nda"
        ? "NDA"
        : contractType === "investment"
        ? "Investment Term Sheet"
        : "Sponsorship Agreement";

    let body = `ZAMNA HAWAII 2026 — ${typeLabel}\n\n`;
    body += `Date / 日付: ${new Date().toLocaleDateString()}\n`;
    body += `Party A / 甲: SOLUNA\n`;

    if (contractType === "nda") {
      body += `Party B / 乙: ${name}${company ? ` (${company})` : ""}\n`;
      body += `Email: ${email}\n`;
      body += `Signature / 署名: ${signature}\n`;
    } else if (contractType === "investment") {
      body += `Investor / 投資家: ${name}${company ? ` (${company})` : ""}\n`;
      body += `Email: ${email}\n`;
      body += `Structure / 投資形態: ${structure}\n`;
      body += `Amount / 金額: ${amount}\n`;
      body += `Return / 追加リターン: ${returnType.toUpperCase()}\n`;
      body += `Signature / 署名: ${signature}\n`;
    } else if (contractType === "sponsor") {
      body += `Company / 会社: ${company}\n`;
      body += `Contact / 担当者: ${contactPerson}\n`;
      body += `Package / パッケージ: ${sponsorPackage}\n`;
      body += `Email: ${email}\n`;
      body += `Signature / 署名: ${signature}\n`;
    }

    const subject = encodeURIComponent(`[ZAMNA HAWAII 2026] ${typeLabel} — ${signature}`);
    const bodyEncoded = encodeURIComponent(body);
    window.location.href = `mailto:invest@solun.art?subject=${subject}&body=${bodyEncoded}`;
    setSubmitted(true);
  };

  // ─── Stripe Checkout ──────────────────────────────────────────
  const handlePayment = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractType, sponsorPackage, submissionId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Payment unavailable");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ─── Payment amount display ────────────────────────────────────
  const paymentAmount = (): string | null => {
    if (contractType === "investment") return "$200,000";
    if (contractType === "sponsor") {
      if (sponsorPackage === "presenting") return "$100,000";
      if (sponsorPackage === "artist") return "$50,000";
      if (sponsorPackage === "vip") return "$20,000";
    }
    return null;
  };

  // Large = $50K+: wire transfer recommended
  const isLargeAmount = () => {
    if (contractType === "investment") return true;
    if (contractType === "sponsor" && sponsorPackage === "presenting") return true;
    if (contractType === "sponsor" && sponsorPackage === "artist") return true;
    return false;
  };

  // ─── Contract preview text ─────────────────────────────────────
  const contractPreviewText = () => {
    if (contractType === "nda") return ja ? NDA_TEXT_JA : NDA_TEXT_EN;
    if (contractType === "investment") return ja ? INVESTMENT_TEXT_JA : INVESTMENT_TEXT_EN;
    if (contractType === "sponsor") return ja ? SPONSOR_TEXT_JA : SPONSOR_TEXT_EN;
    return "";
  };

  const contractTypeName = () => {
    if (contractType === "nda")
      return ja ? "秘密保持契約 / Non-Disclosure Agreement" : "Non-Disclosure Agreement";
    if (contractType === "investment")
      return ja
        ? "投資契約（タームシート）/ Investment Term Sheet"
        : "Investment Term Sheet";
    if (contractType === "sponsor")
      return ja ? "スポンサー契約 / Sponsorship Agreement" : "Sponsorship Agreement";
    return "";
  };

  // ─── Render helpers ───────────────────────────────────────────
  const StepIndicator = () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginBottom: 40,
        justifyContent: "center",
      }}
    >
      {T.stepLabels.map((s, i) => {
        const stepNum = (i + 1) as Step;
        const isDone = step > stepNum;
        const isActive = step === stepNum;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  background: isDone
                    ? "var(--gold)"
                    : isActive
                    ? "var(--gold)"
                    : "transparent",
                  border: isDone || isActive
                    ? "2px solid var(--gold)"
                    : "2px solid rgba(255,255,255,0.15)",
                  color: isDone || isActive ? "#000" : "rgba(255,255,255,0.3)",
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}
              >
                {isDone ? "✓" : s.n}
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: isActive ? "var(--gold)" : "rgba(255,255,255,0.2)",
                  letterSpacing: "0.05em",
                  textAlign: "center",
                  maxWidth: 100,
                  whiteSpace: "nowrap",
                }}
              >
                {s.t}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{
                  width: 60,
                  height: 1,
                  background:
                    step > stepNum
                      ? "rgba(201,169,98,0.5)"
                      : "rgba(255,255,255,0.08)",
                  margin: "0 8px",
                  marginBottom: 22,
                  transition: "background 0.3s",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <label
      style={{
        fontSize: 11,
        color: "rgba(255,255,255,0.35)",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        display: "block",
        marginBottom: 8,
      }}
    >
      {children}
    </label>
  );

  // ─── Step 1: Contract Type Selection ─────────────────────────
  const renderStep1 = () => (
    <motion.div {...fade}>
      <h2
        className="font-display"
        style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}
      >
        {ja ? "契約タイプを選択" : "Choose Your Contract"}
      </h2>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 28 }}>
        {ja ? "カードをクリックして次へ進みます。" : "Click a card to proceed."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {T.types.map((t) => (
          <div
            key={t.id}
            onClick={() => { setContractType(t.id); setStep(2); }}
            style={{
              border: `1px solid rgba(201,169,98,${t.id === "investment" ? "0.4" : "0.15"})`,
              background: t.id === "investment"
                ? "rgba(201,169,98,0.05)"
                : "rgba(255,255,255,0.02)",
              borderRadius: 16,
              padding: "22px 24px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(201,169,98,0.6)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = `rgba(201,169,98,${t.id === "investment" ? "0.4" : "0.15"})`)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{t.title}</p>
              </div>
              <span style={{
                color: "var(--gold)", fontWeight: 700, fontSize: 16,
                background: "rgba(201,169,98,0.1)", borderRadius: 8,
                padding: "3px 10px", flexShrink: 0,
              }}>{t.price}</span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginBottom: 14 }}>
              {t.desc}
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: "var(--gold)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em",
            }}>
              {t.cta}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  // ─── Step 2: Fill in Details ──────────────────────────────────
  const renderStep2 = () => (
    <motion.div {...fade}>
      <h2
        className="font-display"
        style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}
      >
        {T.step2Title}
      </h2>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 28 }}>
        {ja ? "以下のフォームに必要事項を入力してください。" : "Please fill in the details below."}
      </p>

      {/* Error banner */}
      {Object.keys(errors).length > 0 && (
        <div
          style={{
            background: "rgba(255,80,80,0.08)",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 13,
            color: "rgba(255,120,120,0.9)",
          }}
        >
          {T.requiredError}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* NDA fields */}
        {contractType === "nda" && (
          <>
            <div>
              <FieldLabel>{T.labelName} *</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: false })); }}
                placeholder={ja ? "山田 太郎 / Taro Yamada" : "Full Name"}
                style={errors.name ? inputStyleError : inputStyle}
              />
            </div>
            <div>
              <FieldLabel>{T.labelCompany}</FieldLabel>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={ja ? "株式会社〇〇 / Company Inc." : "Company Name (optional)"}
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>{T.labelEmail} *</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: false })); }}
                placeholder="email@example.com"
                style={errors.email ? inputStyleError : inputStyle}
              />
            </div>
          </>
        )}

        {/* Investment fields */}
        {contractType === "investment" && (
          <>
            <div>
              <FieldLabel>{T.labelInvestor} *</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: false })); }}
                placeholder={ja ? "個人名または法人名" : "Individual or company name"}
                style={errors.name ? inputStyleError : inputStyle}
              />
            </div>
            <div>
              <FieldLabel>{T.labelCompany}</FieldLabel>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={ja ? "会社名（任意）" : "Company name (optional)"}
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>{T.labelStructure}</FieldLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {T.structures.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setStructure(s.id)}
                    style={radioCardStyle(structure === s.id)}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{T.labelAmount} *</FieldLabel>
              <input
                type="text"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: false })); }}
                placeholder="$200,000"
                style={errors.amount ? inputStyleError : inputStyle}
              />
            </div>
            <div>
              <FieldLabel>{T.labelReturn}</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {T.returns.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setReturnType(r.id)}
                    style={radioCardStyle(returnType === r.id)}
                  >
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{T.labelEmail} *</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: false })); }}
                placeholder="email@example.com"
                style={errors.email ? inputStyleError : inputStyle}
              />
            </div>
          </>
        )}

        {/* Sponsor fields */}
        {contractType === "sponsor" && (
          <>
            <div>
              <FieldLabel>{T.labelCompany} *</FieldLabel>
              <input
                type="text"
                value={company}
                onChange={(e) => { setCompany(e.target.value); setErrors(prev => ({ ...prev, company: false })); }}
                placeholder={ja ? "会社名 / Company Name" : "Company Name"}
                style={errors.company ? inputStyleError : inputStyle}
              />
            </div>
            <div>
              <FieldLabel>{T.labelContact} *</FieldLabel>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => { setContactPerson(e.target.value); setErrors(prev => ({ ...prev, contactPerson: false })); }}
                placeholder={ja ? "担当者のお名前" : "Contact person's full name"}
                style={errors.contactPerson ? inputStyleError : inputStyle}
              />
            </div>
            <div>
              <FieldLabel>{T.labelPackage}</FieldLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {T.packages.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSponsorPackage(p.id)}
                    style={radioCardStyle(sponsorPackage === p.id)}
                  >
                    {p.label}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>{T.labelEmail} *</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: false })); }}
                placeholder="email@example.com"
                style={errors.email ? inputStyleError : inputStyle}
              />
            </div>
          </>
        )}

        {/* Signature — common */}
        <div>
          <FieldLabel>{T.labelSig} *</FieldLabel>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={signature}
              onChange={(e) => { setSignature(e.target.value); setErrors(prev => ({ ...prev, signature: false })); }}
              placeholder={
                ja
                  ? "フルネームを入力してサイン / Type full name to sign"
                  : "Type your full name to sign"
              }
              style={{
                ...(errors.signature ? inputStyleError : inputStyle),
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: 18,
                borderBottom: `2px solid ${errors.signature ? "rgba(255,80,80,0.6)" : "rgba(201,169,98,0.5)"}`,
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderRadius: 0,
                background: "transparent",
                paddingLeft: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 10,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.1em",
              }}
            >
              {T.sigDigital}
            </div>
          </div>
        </div>

        {/* Date (auto) */}
        <div>
          <FieldLabel>{T.labelDate}</FieldLabel>
          <div
            style={{
              ...inputStyle,
              color: "rgba(255,255,255,0.35)",
              cursor: "default",
            }}
          >
            {today}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        <button
          className="btn-ghost"
          style={{ flex: "0 0 auto" }}
          onClick={() => { setStep(1); setErrors({}); }}
        >
          {T.btnBack}
        </button>
        <button
          className="btn-gold"
          style={{ flex: 1 }}
          onClick={() => {
            if (validateStep2()) setStep(3);
          }}
        >
          {T.btnSign}
        </button>
      </div>
    </motion.div>
  );

  // ─── Step 3: Review & Sign ─────────────────────────────────────
  const renderStep3 = () => {
    if (submitted) {
      const amt = paymentAmount();
      const isCustomSponsor = contractType === "sponsor" && sponsorPackage === "custom";

      // Payment success screen
      if (paymentDone) {
        return (
          <motion.div {...fade} style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(74,222,128,0.15)", border: "2px solid rgba(74,222,128,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", fontSize: 32,
            }}>✓</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2rem)", color: "#fff", marginBottom: 12 }}>
              {ja ? "お支払いが完了しました" : "Payment Complete"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 8 }}>
              {ja ? "契約書と領収書をメールでお送りします。" : "You'll receive a contract and receipt by email."}
            </p>
            <p style={{ color: "rgba(74,222,128,0.7)", fontSize: 13, marginBottom: 32 }}>
              {ja ? "担当者より24時間以内にご連絡いたします。" : "Our team will reach out within 24 hours."}
            </p>
            <button className="btn-ghost" onClick={downloadContractPDF}>{T.btnDownload}</button>
          </motion.div>
        );
      }

      // Payment cancelled screen
      if (paymentCancelled) {
        return (
          <motion.div {...fade} style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", fontSize: 28,
            }}>✕</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2rem)", color: "#fff", marginBottom: 12 }}>
              {ja ? "お支払いがキャンセルされました" : "Payment Cancelled"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>
              {ja ? "契約書は送信済みです。後でお支払いいただくことも可能です。" : "Your contract was submitted. You can pay later if you wish."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {amt && !isCustomSponsor && (
                <button className="btn-gold" onClick={handlePayment} disabled={checkoutLoading}>
                  {checkoutLoading ? (ja ? "処理中…" : "Loading…") : (ja ? `もう一度支払う (${amt})` : `Pay Again (${amt})`)}
                </button>
              )}
              <button className="btn-ghost" onClick={downloadContractPDF}>{T.btnDownload}</button>
            </div>
          </motion.div>
        );
      }

      // Normal submission success — show payment option
      return (
        <motion.div {...fade} style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(201,169,98,0.15)", border: "2px solid rgba(201,169,98,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: 28,
          }}>✓</div>
          <h2 className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2rem)", color: "#fff", marginBottom: 12 }}>
            {T.successTitle}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 32 }}>
            {T.successMsg}
          </p>

          {/* Payment section */}
          {contractType !== "nda" && (
            <div style={{ border: "1px solid rgba(201,169,98,0.2)", borderRadius: 16, padding: "28px 24px", marginBottom: 20, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                  {ja ? "お支払い方法" : "Payment"}
                </p>
                {amt && <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 24 }}>{amt}</span>}
              </div>

              {isCustomSponsor ? (
                /* Custom: contact only */
                <>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                    {ja ? "金額はご要望に合わせてご提案します。担当者よりご連絡いたします。" : "We'll tailor the amount to your needs. Our team will contact you."}
                  </p>
                  <a href="mailto:sponsor@solun.art" className="btn-gold" style={{ display: "inline-block", textDecoration: "none" }}>
                    sponsor@solun.art
                  </a>
                </>
              ) : isLargeAmount() ? (
                /* $50K+: Wire Transfer primary + Stripe ACH secondary */
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Option 1: Wire Transfer */}
                  <div style={{ border: "1px solid rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.04)", borderRadius: 12, padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ background: "rgba(74,222,128,0.2)", color: "rgba(74,222,128,0.9)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 99 }}>
                        {ja ? "推奨" : "RECOMMENDED"}
                      </span>
                      <p style={{ color: "rgba(74,222,128,0.9)", fontWeight: 700, fontSize: 14 }}>
                        {ja ? "銀行振込（Wire Transfer）" : "Wire Transfer"}
                      </p>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.6 }}>
                      {ja ? "手数料なし。振込先情報は署名後にメールでお送りします。" : "No fees. Bank details will be sent to you by email after signing."}
                    </p>
                  </div>

                  {/* Option 2: Stripe ACH */}
                  <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px" }}>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                      {ja ? "オンライン銀行口座引き落とし（ACH）" : "Online Bank Debit (ACH)"}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 14, lineHeight: 1.6 }}>
                      {ja ? "手数料最大$5。米国の銀行口座が必要です。Stripeで安全に処理。" : "Max $5 fee. Requires US bank account. Processed securely via Stripe."}
                    </p>
                    <button
                      style={{
                        width: "100%", padding: "12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                        background: "transparent", color: "rgba(255,255,255,0.55)", fontSize: 13, cursor: checkoutLoading ? "default" : "pointer",
                        opacity: checkoutLoading ? 0.5 : 1,
                      }}
                      onClick={handlePayment}
                      disabled={checkoutLoading}
                    >
                      {checkoutLoading ? (ja ? "接続中…" : "Connecting…") : (ja ? "ACH / 銀行口座で支払う →" : "Pay via ACH Bank Transfer →")}
                    </button>
                  </div>

                  {/* Option 3: Credit card note */}
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, textAlign: "center" }}>
                    {ja
                      ? "クレカでの支払いはカード上限により難しい場合があります。"
                      : "Credit card may be limited by your card's spending limit for this amount."}
                  </p>
                </div>
              ) : (
                /* $20K VIP: Card + ACH both fine */
                <>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
                    {ja
                      ? "クレジットカード（Visa/Mastercard/Amex）または銀行口座（ACH）でのお支払いが可能です。"
                      : "Pay by credit card (Visa/Mastercard/Amex) or bank account (ACH)."}
                  </p>
                  <button
                    className="btn-gold"
                    style={{ width: "100%", fontSize: 15, padding: "14px 0", opacity: checkoutLoading ? 0.6 : 1 }}
                    onClick={handlePayment}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading
                      ? (ja ? "Stripeに接続中…" : "Connecting to Stripe…")
                      : (ja ? `カードまたは銀行口座で支払う — ${amt}` : `Pay by Card or Bank — ${amt}`)}
                  </button>
                  <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 10, textAlign: "center" }}>
                    {ja ? "Stripe の安全な決済画面にリダイレクトします" : "Redirected to Stripe's secure checkout"}
                  </p>
                </>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-ghost" onClick={downloadContractPDF}>{T.btnDownload}</button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div {...fade}>
        <h2
          className="font-display"
          style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", color: "#fff", marginBottom: 8 }}
        >
          {T.step3Title}
        </h2>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 24 }}>
          {ja
            ? "内容をご確認の上、下記のボタンで署名・送信してください。"
            : "Please review the contract below, then sign and send."}
        </p>

        {/* Contract document preview */}
        <div
          id="contract-preview"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {/* Doc header */}
          <div
            style={{
              background: "rgba(201,169,98,0.06)",
              borderBottom: "1px solid rgba(201,169,98,0.2)",
              padding: "20px 24px",
            }}
          >
            <p
              className="font-display"
              style={{ fontSize: 16, color: "var(--gold)", letterSpacing: "0.12em", marginBottom: 4 }}
            >
              ZAMNA HAWAII 2026
            </p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 0 }}>
              {contractTypeName()}
            </p>
          </div>

          {/* Parties */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="data-table" style={{ border: "none", borderRadius: 0 }}>
              <div className="data-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <span className="data-row-label">{T.dateLabel}</span>
                <span className="data-row-value">{today}</span>
              </div>
              <div className="data-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <span className="data-row-label">{T.partyA}</span>
                <span className="data-row-value">SOLUNA</span>
              </div>
              <div className="data-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <span className="data-row-label">{T.partyB}</span>
                <span className="data-row-value">
                  {contractType === "sponsor"
                    ? `${company} — ${contactPerson}`
                    : `${name}${company ? ` (${company})` : ""}`}
                </span>
              </div>

              {contractType === "investment" && (
                <>
                  <div className="data-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <span className="data-row-label">
                      {ja ? "投資形態" : "Structure"}
                    </span>
                    <span className="data-row-value">
                      {T.structures.find((s) => s.id === structure)?.label}
                    </span>
                  </div>
                  <div className="data-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <span className="data-row-label">
                      {ja ? "投資金額" : "Amount"}
                    </span>
                    <span className="data-row-value" style={{ color: "var(--gold)" }}>
                      {amount}
                    </span>
                  </div>
                  <div className="data-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <span className="data-row-label">
                      {ja ? "追加リターン" : "Additional Return"}
                    </span>
                    <span className="data-row-value">
                      {T.returns.find((r) => r.id === returnType)?.label}
                    </span>
                  </div>
                </>
              )}

              {contractType === "sponsor" && (
                <div className="data-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <span className="data-row-label">
                    {ja ? "パッケージ" : "Package"}
                  </span>
                  <span className="data-row-value">
                    {T.packages.find((p) => p.id === sponsorPackage)?.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contract text */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                maxHeight: 300,
                overflowY: "auto",
                background: "rgba(0,0,0,0.2)",
                borderRadius: 8,
                padding: "14px 16px",
              }}
            >
              <pre
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {contractPreviewText()}
              </pre>
            </div>
          </div>

          {/* Signature block */}
          <div style={{ padding: "16px 24px" }}>
            <div
              style={{
                borderTop: "2px solid rgba(201,169,98,0.35)",
                paddingTop: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  {T.sigLabel}:
                </span>
                <span
                  style={{
                    fontFamily: "Georgia, serif",
                    fontStyle: "italic",
                    fontSize: 18,
                    color: "var(--gold)",
                  }}
                >
                  {signature}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                  {T.dateLabel}:
                </span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  {today}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="btn-gold glow-button"
            style={{ width: "100%", fontSize: 14 }}
            onClick={handleSendEmail}
          >
            {T.btnSend}
          </button>
          <button
            className="btn-ghost"
            style={{ width: "100%" }}
            onClick={downloadContractPDF}
          >
            {T.btnDownload}
          </button>
        </div>

        <div style={{ marginTop: 20 }}>
          <button
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.2)",
              fontSize: 12,
              cursor: "pointer",
              padding: 0,
            }}
            onClick={() => { setStep(2); setSubmitted(false); }}
          >
            {T.btnBack}
          </button>
        </div>
      </motion.div>
    );
  };

  // ─── Page render ───────────────────────────────────────────────
  return (
    <main style={{ background: "#080808", minHeight: "100vh", position: "relative" }}>
      <div className="atmo" />

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link
          href="/"
          className="font-display"
          style={{
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.2em",
            textDecoration: "none",
            fontSize: 12,
          }}
        >
          ZAMNA HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/sponsor" className="nav-pill">{T.navSponsor}</Link>
          <Link href="/investor" className="nav-pill">{T.navInvestor}</Link>
          <Link href="/deal" className="nav-pill">{T.navDeal}</Link>
          <span className="nav-pill-active">{T.navContract}</span>
          <button
            onClick={() => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); }}
            style={{
              marginLeft: 8,
              padding: "5px 10px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 999,
              fontSize: 10,
              letterSpacing: "0.08em",
              cursor: "pointer",
              background: "transparent",
              color: "rgba(255,255,255,0.4)",
              fontWeight: 600,
            }}
          >
            {lang === "ja" ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      {/* Print header */}
      <div className="print-header px-0">
        <p className="font-display text-2xl tracking-wider" style={{ color: "#111" }}>
          ZAMNA HAWAII 2026
        </p>
        <p className="text-sm mt-1" style={{ color: "#666" }}>
          {contractTypeName() || "Contract & Signing"} · Confidential · Powered by SOLUNA
        </p>
      </div>

      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "72px 24px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          style={{ marginBottom: 56 }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.4em",
              color: "rgba(201,169,98,0.8)",
              marginBottom: 20,
              textTransform: "uppercase",
            }}
          >
            {T.heroLabel}
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2rem,8vw,3.5rem)",
              lineHeight: 1.05,
              color: "#fff",
              marginBottom: 16,
              whiteSpace: "pre-line",
            }}
          >
            {T.heroTitle}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 16 }} />
          <p
            style={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 14,
              lineHeight: 1.75,
              whiteSpace: "pre-line",
            }}
          >
            {T.heroSub}
          </p>
        </motion.div>

        {/* Wizard card */}
        <div className="gdivider" style={{ margin: "0 0 36px" }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <StepIndicator />
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </motion.div>

        <div className="gdivider" style={{ margin: "48px 0 0" }} />
      </div>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          {T.footer}
        </p>
      </footer>
    </main>
  );
}
