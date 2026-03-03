"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Locale } from "@/lib/i18n";

export default function PartnerSection() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const lang = navigator.language.split("-")[0];
    setLocale(lang === "ja" ? "ja" : "en");
  }, []);

  return (
    <>
      {/* PARTNER ACCESS */}
      <section className="relative py-24 px-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ maxWidth: 860, margin: "0 auto" }}
        >
          <p
            style={{
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.4em",
              color: "rgba(201,169,98,0.7)",
              marginBottom: 20,
              textTransform: "uppercase",
            }}
          >
            {locale === "ja" ? "ビジネスパートナー" : "Business Partners"}
          </p>
          <h2
            className="font-display"
            style={{
              textAlign: "center",
              fontSize: "clamp(2rem,6vw,3rem)",
              letterSpacing: "0.08em",
              color: "#fff",
              marginBottom: 12,
            }}
          >
            {locale === "ja" ? "パートナーシップ" : "Partnership Opportunities"}
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.35)",
              fontSize: 14,
              marginBottom: 52,
            }}
          >
            {locale === "ja"
              ? "スポンサー・投資家・ビジネスパートナーの方はこちら"
              : "For sponsors, investors, and business partners"}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
              gap: 16,
            }}
          >
            {/* Sponsor */}
            <Link href="/sponsor" style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 16,
                  padding: "28px 24px",
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,169,98,0.4)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(201,169,98,0.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.09)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 12 }}>Sponsor</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
                  {locale === "ja" ? "ブランド露出" : "Brand Exposure"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                  {locale === "ja"
                    ? "2,000〜5,000人の富裕層に直接リーチ。スポンサーパッケージをご覧ください。"
                    : "Reach 2,000\u20135,000 affluent guests directly. View sponsor packages."}
                </p>
                <p style={{ color: "rgba(201,169,98,0.7)", fontSize: 12, letterSpacing: "0.08em" }}>
                  {locale === "ja" ? "詳細を見る" : "View details"} →
                </p>
              </div>
            </Link>

            {/* Investor */}
            <Link href="/investor" style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(201,169,98,0.2)",
                  borderRadius: 16,
                  padding: "28px 24px",
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,169,98,0.5)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(201,169,98,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,169,98,0.2)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(201,169,98,0.8)", textTransform: "uppercase", marginBottom: 12 }}>Investor</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
                  {locale === "ja" ? "投資機会" : "Investment"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                  {locale === "ja"
                    ? "$200,000の出資で最優先返済保証。利息または収益分配をご選択いただけます。"
                    : "$200,000 investment with first-priority repayment. Choose interest or revenue share."}
                </p>
                <p style={{ color: "rgba(201,169,98,0.9)", fontSize: 12, letterSpacing: "0.08em" }}>
                  {locale === "ja" ? "投資家資料を見る" : "View investor deck"} →
                </p>
              </div>
            </Link>

            {/* Deal */}
            <Link href="/deal" style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 16,
                  padding: "28px 24px",
                  transition: "border-color 0.2s, background 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(74,222,128,0.3)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(74,222,128,0.03)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.09)";
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(74,222,128,0.7)", textTransform: "uppercase", marginBottom: 12 }}>Deal Summary</p>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
                  {locale === "ja" ? "ディールの全体像" : "Deal Overview"}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                  {locale === "ja"
                    ? "専門用語なし。お金の流れと返済シナリオを1ページで確認できます。"
                    : "No jargon. Money flow and return scenarios on one page."}
                </p>
                <p style={{ color: "rgba(74,222,128,0.7)", fontSize: 12, letterSpacing: "0.08em" }}>
                  {locale === "ja" ? "サマリーを見る" : "View summary"} →
                </p>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* SOLUNA PROJECTS */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "60px 24px 48px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.4em",
            color: "rgba(201,169,98,0.5)",
            marginBottom: 16,
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          SOLUNA —{" "}
          {locale === "ja" ? "イベント × テクノロジー" : "Events × Technology"}
        </p>
        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.25)",
            fontSize: 13,
            lineHeight: 1.7,
            marginBottom: 32,
            maxWidth: 520,
            margin: "0 auto 32px",
          }}
        >
          {locale === "ja"
            ? "SOLUNAはZAMNA HAWAIIを主催するだけでなく、音楽・テクノロジーの融合を探求し続けています。"
            : "SOLUNA produces ZAMNA HAWAII and explores the intersection of music and technology."}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {/* ZAMNA HAWAII */}
          <div
            style={{
              padding: "20px 22px",
              border: "1px solid rgba(201,169,98,0.2)",
              borderRadius: 12,
              background: "rgba(201,169,98,0.03)",
            }}
          >
            <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(201,169,98,0.6)", textTransform: "uppercase", marginBottom: 8 }}>EVENT PRODUCTION</p>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>ZAMNA HAWAII</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.6 }}>
              {locale === "ja"
                ? "世界最高峰のアンダーグラウンド・エレクトロニックミュージック・フェスティバル。2026年9月、オアフ島初上陸。"
                : "The world's finest underground electronic music festival. Arrives in Oahu, September 2026."}
            </p>
          </div>
          {/* OpenSonic */}
          <a
            href="https://github.com/yukihamada/opensonic"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "20px 22px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              textDecoration: "none",
              display: "block",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,98,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            <p style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 8 }}>OPEN SOURCE · AUDIO TECH</p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>OpenSonic</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.6 }}>
              {locale === "ja"
                ? "Macのシステム音声をネットワーク越しにiPhone / Raspberry Piへ低遅延配信するオープンソース・ネットワークオーディオシステム。"
                : "Open-source network audio system for low-latency Mac system audio distribution to iPhone, Raspberry Pi, and more."}
            </p>
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8 }}>
              github.com/yukihamada/opensonic ↗
            </p>
          </a>
          {/* More coming */}
          <div
            style={{
              padding: "20px 22px",
              border: "1px dashed rgba(255,255,255,0.06)",
              borderRadius: 12,
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 120,
            }}
          >
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 12, letterSpacing: "0.08em", textAlign: "center" }}>
              {locale === "ja" ? "さらに多くのプロジェクトが進行中" : "More projects in the works"}
            </p>
            <p style={{ color: "rgba(201,169,98,0.2)", fontSize: 11, marginTop: 6 }}>info@solun.art</p>
          </div>
        </div>
      </section>
    </>
  );
}
