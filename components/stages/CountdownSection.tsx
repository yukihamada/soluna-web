"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Locale } from "@/lib/i18n";
import { isStageActive } from "@/lib/stage";

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export default function CountdownSection() {
  const [locale, setLocale] = useState<Locale>("en");
  const countdown = useCountdown(new Date("2026-09-04T18:00:00-10:00"));

  useEffect(() => {
    const lang = navigator.language.split("-")[0];
    setLocale(lang === "ja" ? "ja" : "en");
  }, []);

  return (
    <>
      {/* COUNTDOWN */}
      <section
        className="relative px-4"
        style={{
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          padding: "80px 16px 72px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.45em",
              color: "rgba(201,169,98,0.6)",
              marginBottom: 32,
              textTransform: "uppercase",
            }}
          >
            {locale === "ja"
              ? "SOLUNA FEST HAWAII 2026 \u00B7 開幕まで"
              : "SOLUNA FEST HAWAII 2026 \u00B7 OPENS IN"}
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              gap: "clamp(8px,3vw,20px)",
              marginBottom: 48,
            }}
          >
            {[
              { v: countdown.d, l: locale === "ja" ? "日" : "DAYS" },
              { v: countdown.h, l: locale === "ja" ? "時間" : "HRS" },
              { v: countdown.m, l: locale === "ja" ? "分" : "MIN" },
              { v: countdown.s, l: locale === "ja" ? "秒" : "SEC" },
            ].map(({ v, l }, i) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "clamp(8px,3vw,20px)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'Anton', 'Arial Black', serif",
                      fontSize: "clamp(3.6rem,14vw,7rem)",
                      color: "#fff",
                      lineHeight: 1,
                      minWidth: "2ch",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      padding: "16px 20px",
                      boxShadow:
                        "0 0 40px rgba(201,169,98,0.08), inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                  >
                    {String(v).padStart(2, "0")}
                  </div>
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.25em",
                      color: "rgba(255,255,255,0.25)",
                      marginTop: 10,
                      textTransform: "uppercase",
                    }}
                  >
                    {l}
                  </p>
                </div>
                {i < 3 && (
                  <div
                    style={{
                      fontFamily: "'Anton', serif",
                      fontSize: "clamp(2rem,8vw,4.5rem)",
                      color: "rgba(201,169,98,0.3)",
                      lineHeight: 1,
                      paddingTop: 16,
                    }}
                  >
                    :
                  </div>
                )}
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 13,
              letterSpacing: "0.3em",
              color: "rgba(201,169,98,0.5)",
              marginBottom: 32,
              textTransform: "uppercase",
            }}
          >
            SEP 4–6, 2026 · MOANALUA GARDENS · OAHU
          </p>

          {/* Ticket CTA — Stage 3+ */}
          {isStageActive(3) && (
            <>
              <a
                href="https://zamnahawaii.ticketblox.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#C9A962",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "0.08em",
                  padding: "18px 44px",
                  borderRadius: 999,
                  textDecoration: "none",
                  boxShadow:
                    "0 0 48px rgba(201,169,98,0.4), 0 0 80px rgba(201,169,98,0.15)",
                  transition: "opacity 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.boxShadow =
                    "0 0 64px rgba(201,169,98,0.6), 0 0 100px rgba(201,169,98,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.boxShadow =
                    "0 0 48px rgba(201,169,98,0.4), 0 0 80px rgba(201,169,98,0.15)";
                }}
              >
                {locale === "ja" ? "今すぐチケットを取る" : "Get Tickets Now"} →
              </a>
              <p
                style={{
                  color: "rgba(255,255,255,0.2)",
                  fontSize: 12,
                  marginTop: 14,
                  letterSpacing: "0.08em",
                }}
              >
                Day 1: $120 · Day 2: $180 · VIP: $1,000+
              </p>
            </>
          )}
        </motion.div>
      </section>

      {/* STATS — Stage 2+ */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl md:text-4xl tracking-wider text-center mb-12">
            {locale === "ja" ? "体験" : "THE EXPERIENCE"}
          </h2>

          <div className="gallery-container px-4">
            {[
              {
                stat: "850K+",
                label:
                  locale === "ja" ? "グローバル来場者数" : "Global Attendees",
                sub: "Tulum · Dubai · Costa Rica",
              },
              {
                stat: "12h+",
                label:
                  locale === "ja" ? "連続パフォーマンス" : "Continuous Music",
                sub: "Sunrise to Sunset",
              },
              {
                stat: locale === "ja" ? "125万" : "1.25M",
                label:
                  locale === "ja" ? "SNSフォロワー" : "Social Followers",
                sub: "@solunamusic",
              },
              {
                stat: "2026",
                label: locale === "ja" ? "ハワイ初上陸" : "Hawaii Debut",
                sub: "Sep 4–6 · Oahu",
              },
            ].map((card) => (
              <div
                key={card.stat}
                className="gallery-item aspect-[4/3] rounded-lg overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,169,98,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(201,169,98,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "24px 16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Anton', sans-serif",
                    fontSize: "clamp(2rem,6vw,3rem)",
                    color: "var(--gold)",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                    marginBottom: 10,
                  }}
                >
                  {card.stat}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "clamp(11px,2vw,14px)",
                    fontWeight: 600,
                    marginBottom: 6,
                    letterSpacing: "0.06em",
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.25)",
                    fontSize: "clamp(9px,1.5vw,11px)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {card.sub}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </>
  );
}
