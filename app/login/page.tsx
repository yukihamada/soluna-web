"use client";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("/app.html");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("next");
    if (p) setNext(p);
  }, []);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setErr("有効なメールアドレスを入力してください"); return; }
    setLoading(true); setErr(""); setMsg("送信中…");
    const r = await fetch("/api/soluna/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const d = await r.json();
    setLoading(false);
    if (r.ok) { setMsg(""); setStep("code"); }
    else { setMsg(""); setErr(d.error || "エラーが発生しました"); }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(""); setMsg("確認中…");
    const r = await fetch("/api/soluna/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const d = await r.json();
    setLoading(false);
    if (r.ok) {
      localStorage.setItem("sln_token", d.token);
      setMsg("ログインしました。移動しています…");
      setTimeout(() => { window.location.href = next; }, 500);
    } else {
      setMsg(""); setErr(d.error || "コードが正しくありません");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 16px", boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff", fontSize: 15, outline: "none",
    fontFamily: "Inter, sans-serif",
  };
  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "14px 0", borderRadius: 999,
    background: "#c8a455", color: "#000",
    fontWeight: 800, fontSize: 13, letterSpacing: "0.1em",
    border: "none", cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.7 : 1,
  };
  const labelStyle: React.CSSProperties = {
    display: "block", color: "rgba(255,255,255,0.4)",
    fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8,
  };

  return (
    <main style={{ background: "#080806", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(200,164,85,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>
        <a href="/" style={{ display: "block", textAlign: "center", textDecoration: "none", marginBottom: 40 }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.28em", color: "#c8a455", textTransform: "uppercase" }}>SOLUNA</p>
        </a>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "36px 32px" }}>
          <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            {step === "email" ? "ログイン" : "確認コードを入力"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>
            {step === "email"
              ? "メールアドレスに確認コードを送信します。"
              : `${email} に届いた6桁のコードを入力してください。`}
          </p>

          {step === "email" ? (
            <form onSubmit={sendOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>メールアドレス</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required autoComplete="email"
                  style={inputStyle} />
              </div>
              {err && <p style={{ color: "#e05555", fontSize: 13, margin: 0 }}>{err}</p>}
              {msg && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>{msg}</p>}
              <button type="submit" style={btnStyle} disabled={loading}>
                コードを送信
              </button>
            </form>
          ) : (
            <form onSubmit={verify} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>確認コード（6桁）</label>
                <input type="text" value={code} onChange={e => setCode(e.target.value)}
                  placeholder="000000" maxLength={6} inputMode="numeric" required autoFocus
                  style={{ ...inputStyle, fontSize: 22, letterSpacing: "0.2em", textAlign: "center" }} />
              </div>
              {err && <p style={{ color: "#e05555", fontSize: 13, margin: 0 }}>{err}</p>}
              {msg && <p style={{ color: msg.includes("ログイン") ? "#4a9a5a" : "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>{msg}</p>}
              <button type="submit" style={btnStyle} disabled={loading}>
                ログイン
              </button>
              <button type="button" onClick={() => { setStep("email"); setErr(""); setMsg(""); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                ← メールアドレスを変更
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 12, marginTop: 20 }}>
          SOLUNAメンバー限定です
        </p>
      </div>
    </main>
  );
}
