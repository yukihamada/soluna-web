"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { translations, Locale } from "@/lib/i18n";
import { isStageActive } from "@/lib/stage";

export default function SiteFooter() {
  const [locale, setLocale] = useState<Locale>("en");
  const t = translations[locale];

  useEffect(() => {
    const lang = navigator.language.split("-")[0];
    setLocale(lang === "ja" ? "ja" : "en");
  }, []);

  return (
    <footer className="relative py-12 px-4 border-t border-white/10">
      <div className="flex flex-col items-center gap-6">
        {/* Page links — Stage 3+ */}
        {isStageActive(3) && (
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              { href: "/lineup", ja: "ラインナップ", en: "Lineup" },
              { href: "/vip", ja: "VIP", en: "VIP" },
              { href: "/guide", ja: "当日ガイド", en: "Guide" },
              { href: "/info", ja: "アクセス・FAQ", en: "Info & FAQ" },
              { href: "/sponsor", ja: "スポンサー", en: "Sponsor" },
              { href: "/investor", ja: "投資家", en: "Investor" },
              { href: "/privacy", ja: "プライバシー", en: "Privacy" },
              { href: "/terms", ja: "利用規約", en: "Terms" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 12,
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(201,169,98,0.7)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.3)")
                }
              >
                {locale === "ja" ? l.ja : l.en}
              </Link>
            ))}
          </div>
        )}

        {/* Instagram */}
        <a
          href="https://instagram.com/zamnaofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/60 hover:text-gold transition-colors"
          aria-label="Instagram"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>

        {/* Copyright */}
        <p className="text-white/40 text-sm">{t.footer.copyright}</p>
      </div>
    </footer>
  );
}
