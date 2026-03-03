"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Locale } from "@/lib/i18n";

export default function LineupSection() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const lang = navigator.language.split("-")[0];
    setLocale(lang === "ja" ? "ja" : "en");
  }, []);

  return (
    <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.45em",
            color: "rgba(201,169,98,0.6)",
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          {locale === "ja" ? "ラインナップ" : "LINEUP"}
        </p>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wider mb-4">
          {locale === "ja" ? "2026年9月4日" : "SEPTEMBER 4, 2026"}
        </h2>
        <p className="text-xl md:text-2xl tracking-widest text-white/80 mb-2">
          {locale === "ja" ? "オアフ島、ハワイ" : "OAHU, HAWAII"}
        </p>
        <p className="text-gold text-lg tracking-[0.2em] mb-8">
          {locale === "ja" ? "SECRET LOCATION" : "SECRET LOCATION"}
        </p>
        <p className="text-white/60 text-lg md:text-xl italic">
          {locale === "ja"
            ? "ジャングルと海が出会う場所"
            : "Where the jungle meets the ocean"}
        </p>

        <div style={{ marginTop: 40 }}>
          <a
            href="/lineup"
            className="btn-gold"
            style={{ textDecoration: "none" }}
          >
            {locale === "ja" ? "ラインナップを見る" : "View Lineup"} →
          </a>
        </div>
      </motion.div>
    </section>
  );
}
