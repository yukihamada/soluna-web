"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { getSavedLang, saveLang } from "@/lib/lang";

const fade = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true },
};

const AVAILABLE = [
  "2026-03-02", "2026-03-03", "2026-03-05",
  "2026-03-09", "2026-03-10", "2026-03-12",
  "2026-03-16", "2026-03-17", "2026-03-19",
  "2026-03-23", "2026-03-24", "2026-03-26",
  "2026-04-01", "2026-04-02", "2026-04-07",
  "2026-04-08", "2026-04-13", "2026-04-14",
  "2026-04-20", "2026-04-21", "2026-04-23",
  "2026-05-07", "2026-05-11", "2026-05-12",
  "2026-05-18", "2026-05-19", "2026-05-25",
];

const SLOTS = [
  { ja: "10:00 JST / 15:00 HST 前日", en: "10:00 JST / 15:00 HST (prev day)" },
  { ja: "14:00 JST / 19:00 HST 前日", en: "14:00 JST / 19:00 HST (prev day)" },
  { ja: "17:00 JST / 22:00 HST 前日", en: "17:00 JST / 22:00 HST (prev day)" },
  { ja: "19:00 JST / 00:00 HST", en: "19:00 JST / 00:00 HST" },
];

const DAY_NAMES_JA = ["日", "月", "火", "水", "木", "金", "土"];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(dateStr: string, lang: "ja" | "en"): string {
  const [, m, d] = dateStr.split("-").map(Number);
  const date = new Date(dateStr + "T00:00:00");
  const dayIdx = date.getDay();
  if (lang === "ja") {
    return `${m}/${d} (${DAY_NAMES_JA[dayIdx]})`;
  }
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m - 1]} ${d} (${DAY_NAMES_EN[dayIdx]})`;
}

const SL = ({ n, t }: { n: string; t: string }) => (
  <div className="sec-label">
    <span className="sec-num">{n}</span>
    <div className="sec-line" />
    <span className="sec-text">{t}</span>
  </div>
);

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "12px 16px",
  color: "#fff",
  fontSize: 14,
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: "var(--gold)", marginLeft: 4 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? "rgba(201,169,98,0.5)" : "rgba(255,255,255,0.1)",
        }}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          resize: "vertical",
          borderColor: focused ? "rgba(201,169,98,0.5)" : "rgba(255,255,255,0.1)",
        }}
      />
    </div>
  );
}

export default function SchedulePage() {
  const [lang, setLang] = useState<"ja" | "en">(() => getSavedLang());
  const [meetingType, setMeetingType] = useState<"investor" | "sponsor" | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentStep = !meetingType ? 1 : !selectedDate ? 2 : !selectedTime ? 3 : 4;

  const handleSubmit = async () => {
    if (!meetingType || !selectedDate || !selectedTime || !name || !email) return;
    setLoading(true);
    try {
      await fetch("/api/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingType, name, company, email, phone, date: selectedDate, timeSlot: selectedTime, message, lang }),
      });
    } catch { /* continue even if offline */ }
    setLoading(false);
    setSubmitted(true);
  };

  const isSubmittable = !!(meetingType && selectedDate && selectedTime && name && email);

  return (
    <main style={{ background: "#080808", position: "relative" }}>
      <div className="atmo" />

      {/* Nav */}
      <nav className="top-nav no-print">
        <Link
          href="/"
          className="font-display text-sm"
          style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textDecoration: "none" }}
        >
          SOLUNA FEST HAWAII
        </Link>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/sponsor" className="nav-pill">
            {lang === "ja" ? "スポンサー" : "Sponsor"}
          </Link>
          <Link href="/investor" className="nav-pill">
            {lang === "ja" ? "投資家" : "Investor"}
          </Link>
          <Link href="/deal" className="nav-pill">
            {lang === "ja" ? "ディール" : "Deal"}
          </Link>
          <Link href="/contract" className="nav-pill">
            {lang === "ja" ? "契約" : "Contract"}
          </Link>
          <span className="nav-pill-active">
            {lang === "ja" ? "スケジュール" : "Schedule"}
          </span>
          <button
            onClick={() => setLang(l => l === "ja" ? "en" : "ja")}
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

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px 120px", position: "relative", zIndex: 1 }}>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          style={{ marginBottom: 64 }}
        >
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 20, textTransform: "uppercase" }}>
            SCHEDULE A CALL · SOLUNA FEST HAWAII 2026
          </p>
          <h1 className="font-display" style={{ fontSize: "clamp(2.8rem,10vw,5rem)", lineHeight: 1, marginBottom: 20, color: "#fff" }}>
            {lang === "ja" ? (
              <>ミーティングを<br />予約する</>
            ) : (
              <>Schedule a<br />Meeting</>
            )}
          </h1>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.6)", marginBottom: 18 }} />
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, lineHeight: 1.8 }}>
            {lang === "ja"
              ? "30分のビデオ通話で、投資・スポンサーシップについてお話しましょう。"
              : "Let's talk about investment or sponsorship opportunities in a 30-min video call."}
          </p>
        </motion.div>

        {/* Progress steps */}
        <motion.div {...fade} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 52 }}>
          {[1, 2, 3, 4].map((step) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: step <= currentStep ? "var(--gold)" : "transparent",
                border: step <= currentStep ? "none" : "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: step <= currentStep ? "#000" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s",
                flexShrink: 0,
              }}>
                {step < currentStep ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step}
              </div>
              {step < 4 && (
                <div style={{
                  width: 40,
                  height: 1,
                  background: step < currentStep ? "rgba(201,169,98,0.4)" : "rgba(255,255,255,0.08)",
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          ))}
          <p style={{ marginLeft: 12, fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
            {lang === "ja" ? `ステップ ${currentStep} / 4` : `Step ${currentStep} of 4`}
          </p>
        </motion.div>

        {submitted ? (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card-gold"
            style={{ textAlign: "center", padding: "52px 32px" }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(201,169,98,0.12)",
              border: "1px solid rgba(201,169,98,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 12l5 5L20 7" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="font-display" style={{ fontSize: "clamp(1.5rem,5vw,2.2rem)", color: "#fff", marginBottom: 10 }}>
              {lang === "ja" ? "送信しました！" : "Message Sent!"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
              {lang === "ja"
                ? "24時間以内にご連絡します。\nメールをご確認ください。"
                : "We'll follow up within 24 hours.\nPlease check your email."}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/deal" className="btn-gold" style={{ fontSize: 13 }}>
                {lang === "ja" ? "ディールを見る" : "View the Deal"}
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMeetingType(null);
                  setSelectedDate("");
                  setSelectedTime("");
                  setName(""); setCompany(""); setEmail(""); setPhone(""); setMessage("");
                }}
                className="btn-ghost"
                style={{ fontSize: 13 }}
              >
                {lang === "ja" ? "もう一件予約" : "Book Another"}
              </button>
            </div>
          </motion.div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

            {/* STEP 1 — Meeting type */}
            <motion.section {...fade}>
              <SL n="01" t="Meeting Type" />
              <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 16, color: "#fff" }}>
                {lang === "ja" ? "ミーティングの種類を選択" : "Select Meeting Type"}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(["investor", "sponsor"] as const).map((type) => {
                  const isSelected = meetingType === type;
                  const titles = {
                    investor: { ja: "投資家ミーティング", en: "Investor Meeting" },
                    sponsor: { ja: "スポンサーミーティング", en: "Sponsor Meeting" },
                  };
                  const subs = {
                    investor: { ja: "投資・融資条件について", en: "Investment terms, due diligence" },
                    sponsor: { ja: "スポンサーシップパッケージについて", en: "Sponsorship packages, custom proposals" },
                  };
                  return (
                    <button
                      key={type}
                      onClick={() => setMeetingType(type)}
                      style={{
                        background: isSelected ? "rgba(201,169,98,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isSelected ? "rgba(201,169,98,0.5)" : "rgba(255,255,255,0.08)"}`,
                        boxShadow: isSelected ? "inset 0 1px 0 rgba(201,169,98,0.15)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
                        borderRadius: 14,
                        padding: "20px 22px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                      }}
                    >
                      <div>
                        <p style={{ color: isSelected ? "var(--gold)" : "#fff", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                          {titles[type][lang]}
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
                          {subs[type][lang]}
                        </p>
                      </div>
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: `2px solid ${isSelected ? "var(--gold)" : "rgba(255,255,255,0.15)"}`,
                        background: isSelected ? "var(--gold)" : "transparent",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.section>

            {/* STEP 2 — Date picker */}
            <motion.section {...fade}>
              <SL n="02" t="Select Date" />
              <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 6, color: "#fff" }}>
                {lang === "ja" ? "日程を選択" : "Choose a Date"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginBottom: 20, letterSpacing: "0.05em" }}>
                {lang === "ja" ? "3〜5月 / Mar–May 2026" : "Mar–May 2026"}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {AVAILABLE.map((date) => {
                  const isSelected = selectedDate === date;
                  const isActive = !!meetingType;
                  return (
                    <button
                      key={date}
                      onClick={() => isActive && setSelectedDate(date)}
                      style={{
                        padding: "10px 16px",
                        border: `1px solid ${isSelected ? "rgba(201,169,98,0.6)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 10,
                        cursor: isActive ? "pointer" : "not-allowed",
                        background: isSelected ? "rgba(201,169,98,0.08)" : "transparent",
                        color: isSelected ? "var(--gold)" : isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                        fontSize: 13,
                        fontFamily: "inherit",
                        transition: "all 0.2s",
                        opacity: isActive ? 1 : 0.5,
                      }}
                    >
                      {formatDate(date, lang)}
                    </button>
                  );
                })}
              </div>
            </motion.section>

            {/* STEP 3 — Time slot */}
            <motion.section {...fade}>
              <SL n="03" t="Select Time" />
              <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 6, color: "#fff" }}>
                {lang === "ja" ? "時間帯を選択" : "Choose a Time Slot"}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginBottom: 20 }}>
                {lang === "ja" ? "JST = 日本標準時 · HST = ハワイ標準時" : "JST = Japan Standard Time · HST = Hawaii Standard Time"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SLOTS.map((slot) => {
                  const label = lang === "ja" ? slot.ja : slot.en;
                  const isSelected = selectedTime === slot.en;
                  const isActive = !!(meetingType && selectedDate);
                  return (
                    <button
                      key={slot.en}
                      onClick={() => isActive && setSelectedTime(slot.en)}
                      style={{
                        padding: "13px 18px",
                        border: `1px solid ${isSelected ? "rgba(201,169,98,0.6)" : "rgba(255,255,255,0.1)"}`,
                        borderRadius: 10,
                        cursor: isActive ? "pointer" : "not-allowed",
                        background: isSelected ? "rgba(201,169,98,0.08)" : "transparent",
                        color: isSelected ? "var(--gold)" : isActive ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                        fontSize: 14,
                        fontFamily: "inherit",
                        textAlign: "left",
                        transition: "all 0.2s",
                        opacity: isActive ? 1 : 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{label}</span>
                      {isSelected && (
                        <div style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "var(--gold)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.section>

            {/* STEP 4 — Contact form */}
            <motion.section {...fade}>
              <SL n="04" t="Your Details" />
              <h2 className="font-display" style={{ fontSize: "clamp(1.2rem,4vw,1.7rem)", marginBottom: 20, color: "#fff" }}>
                {lang === "ja" ? "お客様情報" : "Contact Details"}
              </h2>

              <div style={{
                opacity: meetingType && selectedDate && selectedTime ? 1 : 0.4,
                pointerEvents: meetingType && selectedDate && selectedTime ? "auto" : "none",
                transition: "opacity 0.3s",
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  <Input
                    label={lang === "ja" ? "お名前 / Full Name" : "Full Name"}
                    value={name}
                    onChange={setName}
                    placeholder={lang === "ja" ? "山田 太郎" : "John Smith"}
                    required
                  />
                  <Input
                    label={lang === "ja" ? "会社名 / Company" : "Company"}
                    value={company}
                    onChange={setCompany}
                    placeholder={lang === "ja" ? "任意 / Optional" : "Optional"}
                  />
                  <Input
                    label={lang === "ja" ? "メールアドレス / Email" : "Email"}
                    value={email}
                    onChange={setEmail}
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                  <Input
                    label={lang === "ja" ? "電話番号 / Phone" : "Phone"}
                    value={phone}
                    onChange={setPhone}
                    type="tel"
                    placeholder={lang === "ja" ? "任意 / Optional" : "Optional"}
                  />
                  <Textarea
                    label={lang === "ja" ? "メッセージ / Message" : "Message"}
                    value={message}
                    onChange={setMessage}
                    placeholder={lang === "ja" ? "ご質問・ご要望など / Any questions or requests" : "Any questions or requests"}
                  />
                </div>

                {/* Booking summary */}
                {meetingType && selectedDate && selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="card"
                    style={{ marginBottom: 20, padding: "16px 20px" }}
                  >
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
                      {lang === "ja" ? "予約内容の確認" : "Booking Summary"}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        {
                          label: lang === "ja" ? "種類" : "Type",
                          value: meetingType === "investor"
                            ? (lang === "ja" ? "投資家ミーティング" : "Investor Meeting")
                            : (lang === "ja" ? "スポンサーミーティング" : "Sponsor Meeting"),
                        },
                        {
                          label: lang === "ja" ? "日付" : "Date",
                          value: formatDate(selectedDate, lang),
                        },
                        {
                          label: lang === "ja" ? "時間" : "Time",
                          value: lang === "ja"
                            ? (SLOTS.find(s => s.en === selectedTime)?.ja ?? selectedTime)
                            : selectedTime,
                        },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>{label}</span>
                          <span style={{ color: "var(--gold)", fontSize: 13, fontWeight: 500 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!isSubmittable || loading}
                  className="btn-gold"
                  style={{
                    width: "100%",
                    fontSize: 14,
                    padding: "16px 32px",
                    opacity: isSubmittable && !loading ? 1 : 0.4,
                    cursor: isSubmittable && !loading ? "pointer" : "not-allowed",
                    fontFamily: "inherit",
                  }}
                >
                  {loading ? "..." : lang === "ja" ? "ミーティングを予約する" : "Book Meeting"}
                </button>
              </div>
            </motion.section>

            {/* Divider */}
            <div className="gdivider" style={{ margin: "8px 0" }} />

            {/* Info cards */}
            <motion.section {...fade}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="2" y="5" width="16" height="12" rx="2" stroke="var(--gold)" strokeWidth="1.4" />
                        <path d="M2 8h16M7 5V3M13 5V3" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ),
                    title: "Zoom / Google Meet",
                    desc: lang === "ja"
                      ? "ご都合に合わせてZoomかGoogle Meetを使用します"
                      : "We use Zoom or Google Meet",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="7" stroke="var(--gold)" strokeWidth="1.4" />
                        <path d="M10 6v4l2.5 2.5" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ),
                    title: lang === "ja" ? "30分 / 30 Minutes" : "30 Minutes",
                    desc: lang === "ja"
                      ? "短く・集中した対話を心がけています"
                      : "Short, focused conversation",
                  },
                  {
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="4" y="9" width="12" height="9" rx="1.5" stroke="var(--gold)" strokeWidth="1.4" />
                        <path d="M7 9V7a3 3 0 116 0v2" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    ),
                    title: lang === "ja" ? "要NDA / NDA Required" : "NDA Required",
                    desc: lang === "ja"
                      ? "機密事項はNDA締結後に詳細開示します"
                      : "Confidential details shared after NDA",
                  },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="card" style={{ textAlign: "center", padding: "20px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                      {icon}
                    </div>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: 12, marginBottom: 6, lineHeight: 1.4 }}>{title}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

          </div>
        )}

      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          {lang === "ja"
            ? "© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · 本資料は機密情報です · 無断転用禁止"
            : "© 2026 SOLUNA FEST HAWAII · Powered by SOLUNA · Confidential · All rights reserved"}
        </p>
      </footer>
    </main>
  );
}
