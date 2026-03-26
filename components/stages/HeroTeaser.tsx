"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { translations, Locale } from "@/lib/i18n";
import { isStageActive } from "@/lib/stage";

export default function HeroTeaser() {
  const [locale, setLocale] = useState<Locale>("en");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations[locale];

  useEffect(() => {
    const lang = navigator.language.split("-")[0];
    setLocale(lang === "ja" ? "ja" : "en");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
    } catch {
      /* continue even if offline */
    }
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6">
      {/* Staggered entrance */}
      <div style={{ maxWidth: 720, width: "100%" }}>
        {/* Overline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontSize: 10,
            letterSpacing: "0.5em",
            color: "rgba(201,169,98,0.5)",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          {t.hero.subtitle}
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-display"
          style={{
            fontSize: "clamp(3.2rem, 12vw, 8rem)",
            letterSpacing: "0.08em",
            lineHeight: 0.95,
            marginBottom: 0,
          }}
        >
          SOLUNA
          <br />
          <span style={{ color: "#C9A962" }}>FEST HAWAII</span>
        </motion.h1>

        {/* Gold line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            width: 60,
            height: 1,
            background: "linear-gradient(90deg, transparent, #C9A962, transparent)",
            margin: "32px auto",
          }}
        />

        {/* Date & Location */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <p
            style={{
              fontSize: "clamp(14px, 3vw, 20px)",
              letterSpacing: "0.35em",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 300,
              marginBottom: 6,
            }}
          >
            SEP 4–6, 2026
          </p>
          <p
            style={{
              fontSize: "clamp(11px, 2vw, 14px)",
              letterSpacing: "0.4em",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
            }}
          >
            OAHU, HAWAII
          </p>
        </motion.div>

        {/* Ticket CTAs — Stage 3+ */}
        {isStageActive(3) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            style={{
              marginTop: 40,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://zamnahawaii.ticketblox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="glow-button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#C9A962",
                color: "#000",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.1em",
                padding: "15px 36px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              {locale === "ja" ? "チケットを取る" : "Get Tickets"} →
            </a>
            <a
              href="/vip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                letterSpacing: "0.08em",
                padding: "15px 32px",
                borderRadius: 999,
                textDecoration: "none",
                backdropFilter: "blur(8px)",
                background: "rgba(255,255,255,0.03)",
                transition: "border-color 0.3s, color 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,98,0.5)";
                e.currentTarget.style.color = "#C9A962";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                e.currentTarget.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              VIP →
            </a>
          </motion.div>
        )}

        {/* Email Signup — glass card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          style={{
            marginTop: isStageActive(3) ? 32 : 52,
            padding: "28px 28px 24px",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20,
            maxWidth: 480,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ padding: "12px 0" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(201,169,98,0.12)",
                  border: "1px solid rgba(201,169,98,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A962" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-gold font-display text-xl tracking-wider">
                {t.signup.success}
              </p>
            </motion.div>
          ) : (
            <>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: "0.25em",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  marginBottom: 16,
                }}
              >
                {t.signup.headline}
              </p>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  gap: 0,
                  borderRadius: 999,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0,0,0,0.3)",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) =>
                  ((e.currentTarget as HTMLFormElement).style.borderColor =
                    "rgba(201,169,98,0.3)")
                }
                onBlur={(e) =>
                  ((e.currentTarget as HTMLFormElement).style.borderColor =
                    "rgba(255,255,255,0.1)")
                }
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.signup.placeholder}
                  required
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "14px 24px",
                    background: "#C9A962",
                    color: "#000",
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#d4b76e")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#C9A962")
                  }
                >
                  {isSubmitting ? "..." : locale === "ja" ? "登録" : "NOTIFY ME"}
                </button>
              </form>
              <p
                style={{
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 10,
                  marginTop: 12,
                  letterSpacing: "0.04em",
                }}
              >
                {t.signup.privacy}
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      {isStageActive(2) && (
        <div className="absolute bottom-10 scroll-indicator">
          <svg
            className="w-8 h-8 text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      )}
    </section>
  );
}
