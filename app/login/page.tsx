"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveLang, getSavedLang, type Lang } from "@/lib/lang";

export default function LoginPage() {
  const [step, setStep] = useState<"lang" | "form">("lang");
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const ja = lang === "ja";

  useEffect(() => {
    // 認証済みならリダイレクト
    if (localStorage.getItem("partner_auth") === "1") {
      const saved = getSavedLang();
      setLang(saved);
      const next = new URLSearchParams(window.location.search).get("next") || "/investor/";
      window.location.href = next;
      return;
    }
    // 言語が保存済みなら選択ステップをスキップ
    const saved = localStorage.getItem("partner_lang") as Lang | null;
    if (saved) { setLang(saved); setStep("form"); }
  }, []);

  const handleLangSelect = (l: Lang) => {
    setLang(l);
    saveLang(l);
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError(ja ? "有効なメールアドレスを入力してください" : "Enter a valid email address");
      return;
    }
    if (password === "SOLUNA2026") {
      localStorage.setItem("partner_auth", "1");
      localStorage.setItem("partner_email", email);
      const next = new URLSearchParams(window.location.search).get("next") || "/investor/";
      window.location.href = next;
    } else {
      setError(ja ? "パスワードが正しくありません" : "Incorrect password");
    }
  };

  return (
    <main style={{ background: "#080808", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(201,169,98,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

        {/* ロゴ */}
        <motion.a href="/" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 48 }}>
          <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.3em", color: "#fff" }}>ZAMNA HAWAII</p>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginTop: 4 }}>Partner Access</p>
        </motion.a>

        <AnimatePresence mode="wait">

          {/* STEP 1: 言語選択 */}
          {step === "lang" && (
            <motion.div key="lang"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13, letterSpacing: "0.08em", marginBottom: 28 }}>
                Select your language / 言語を選択
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => handleLangSelect("ja")} style={{
                  padding: "28px 0", borderRadius: 16, cursor: "pointer",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,169,98,0.5)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,169,98,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <p style={{ fontSize: 24, color: "#fff", fontWeight: 700, marginBottom: 6 }}>日本語</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>Japanese</p>
                </button>
                <button onClick={() => handleLangSelect("en")} style={{
                  padding: "28px 0", borderRadius: 16, cursor: "pointer",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,169,98,0.5)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,169,98,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <p style={{ fontSize: 24, color: "#fff", fontWeight: 700, marginBottom: 6 }}>English</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>英語</p>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ログインフォーム */}
          {step === "form" && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: "40px 36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}>
                    {ja ? "パートナーログイン" : "Partner Login"}
                  </p>
                  <button onClick={() => { setStep("lang"); setError(""); }}
                    style={{ padding: "4px 10px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, fontSize: 10, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.35)" }}>
                    {ja ? "EN" : "JA"}
                  </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                      {ja ? "メールアドレス" : "Email"}
                    </label>
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="your@email.com" required autoComplete="email"
                      style={{ width: "100%", padding: "13px 16px", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                      {ja ? "パスワード" : "Password"}
                    </label>
                    <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••••" required autoComplete="current-password"
                      style={{ width: "100%", padding: "13px 16px", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.1)"}`, borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif" }}
                    />
                  </div>
                  {error && <p style={{ color: "rgba(255,100,100,0.9)", fontSize: 13, margin: 0 }}>{error}</p>}
                  <button type="submit" style={{
                    marginTop: 8, padding: "14px 0", borderRadius: 999,
                    background: "var(--gold, #C9A962)", color: "#000",
                    fontWeight: 700, fontSize: 13, letterSpacing: "0.1em",
                    border: "none", cursor: "pointer", boxShadow: "0 0 24px rgba(201,169,98,0.2)",
                  }}>
                    {ja ? "アクセスする" : "Access Partner Area"}
                  </button>
                </form>
              </div>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 12, marginTop: 20 }}>
                {ja ? "招待制アクセスです" : "Invitation-only access"}
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}
