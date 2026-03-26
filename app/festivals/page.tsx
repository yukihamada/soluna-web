"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getSavedLang, saveLang, type Lang } from "@/lib/lang";
import InnerFooter from "@/components/InnerFooter";

/* ── animation presets ─────────────────────────────────────── */
const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7 },
  viewport: { once: true },
};
const stagger = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ── types ─────────────────────────────────────────────────── */
interface Festival {
  id: string;
  title: string;
  subtitle?: string;
  cover_image?: string;
  dates: string;
  start_date: string;
  end_date?: string;
  location: string;
  venue?: string;
  description_ja?: string;
  description_en?: string;
  lineup?: ArtistSlot[];
  contests?: Contest[];
  ticket_types?: TicketType[];
  stages?: Stage[];
}

interface ArtistSlot {
  name: string;
  avatar?: string;
  stage: string;
  time: string;
  genre?: string;
  headliner?: boolean;
}

interface Contest {
  id: string;
  name: string;
  description?: string;
  prize?: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  sold_out?: boolean;
}

interface Stage {
  name: string;
  color?: string;
}

/* ── countdown hook ────────────────────────────────────────── */
function useCountdown(target: Date) {
  const [diff, setDiff] = useState(0);
  useEffect(() => {
    const tick = () => setDiff(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  };
}

/* ── style constants ───────────────────────────────────────── */
const GOLD = "#C9A962";
const BG = "#05060a";

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
};

const glassHover: React.CSSProperties = {
  ...glass,
  cursor: "pointer",
  transition: "border-color 0.3s, transform 0.3s",
};

/* ── section label ─────────────────────────────────────────── */
const SL = ({ n, t }: { n: string; t: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
    <span style={{ fontSize: 10, letterSpacing: "0.3em", color: GOLD, fontWeight: 700 }}>{n}</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${GOLD}40, transparent)` }} />
    <span style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>{t}</span>
  </div>
);

/* ── countdown unit display ────────────────────────────────── */
const CUnit = ({ v, l }: { v: number; l: string }) => (
  <div style={{ textAlign: "center", minWidth: 56 }}>
    <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{String(v).padStart(2, "0")}</div>
    <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginTop: 4 }}>{l}</div>
  </div>
);

/* ── stage color palette ───────────────────────────────────── */
const STAGE_COLORS: Record<string, string> = {
  "Main Stage": "#C9A962",
  "Jungle Stage": "#4CAF50",
  "Beach Stage": "#29B6F6",
  "Sunrise Stage": "#FF7043",
};
function stageColor(stage: string): string {
  return STAGE_COLORS[stage] || GOLD;
}

/* ════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                             */
/* ════════════════════════════════════════════════════════════ */
export default function FestivalsPage() {
  const [lang, setLang] = useState<Lang>(() => getSavedLang());
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [selected, setSelected] = useState<Festival | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLang(getSavedLang()); }, []);
  const t = useCallback((ja: string, en: string) => (lang === "ja" ? ja : en), [lang]);
  const toggleLang = () => { const n = lang === "ja" ? "en" : "ja"; setLang(n); saveLang(n); };

  /* fetch festival list */
  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/festivals")
      .then((r) => r.json())
      .then((d) => setFestivals(d.festivals || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* fetch festival detail */
  const selectFestival = async (id: string) => {
    try {
      const r = await fetch(`/api/v1/festivals/${id}`);
      const d = await r.json();
      setSelected(d.festival || d);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  };

  const countdown = useCountdown(
    new Date(selected?.start_date || "2026-09-04T18:00:00-10:00")
  );

  /* group lineup by stage for schedule view */
  const stageMap = new Map<string, ArtistSlot[]>();
  (selected?.lineup || []).forEach((a) => {
    const arr = stageMap.get(a.stage) || [];
    arr.push(a);
    stageMap.set(a.stage, arr);
  });
  const stages = Array.from(stageMap.entries());

  return (
    <main style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif", position: "relative" }}>
      {/* atmospheric glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${GOLD}08, transparent 70%)` }} />

      {/* nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 24px",
        background: "rgba(5,6,10,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.25em", textDecoration: "none", fontWeight: 600 }}>
          SOLUNA
        </Link>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link href="/lineup" style={{ ...pillStyle, textDecoration: "none" }}>{t("ラインナップ", "Lineup")}</Link>
          <Link href="/tickets" style={{ ...pillStyle, textDecoration: "none" }}>{t("チケット", "Tickets")}</Link>
          <span style={{ ...pillStyle, color: GOLD, borderColor: `${GOLD}40` }}>{t("フェスティバル", "Festivals")}</span>
          <button onClick={toggleLang} style={{ ...pillStyle, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
            {lang === "ja" ? "EN" : "JA"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "96px 24px 48px", position: "relative", zIndex: 1 }}>

        <AnimatePresence mode="wait">
          {!selected ? (
            /* ═══ FESTIVAL LIST ═══ */
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

              {/* header */}
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} style={{ textAlign: "center", marginBottom: 64 }}>
                <p style={{ fontSize: 10, letterSpacing: "0.4em", color: `${GOLD}AA`, marginBottom: 16, textTransform: "uppercase" }}>
                  SOLUNA
                </p>
                <h1 style={{ fontSize: "clamp(2.2rem, 8vw, 4rem)", fontWeight: 700, lineHeight: 1, marginBottom: 16, letterSpacing: "0.04em" }}>
                  {t("フェスティバル", "Festivals")}
                </h1>
                <div style={{ width: 48, height: 2, background: `${GOLD}80`, margin: "0 auto 20px" }} />
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
                  {t(
                    "音楽、アート、テクノロジーが交差する特別な空間。SOLUNAのフェスティバル一覧をご覧ください。",
                    "Where music, art, and technology converge. Explore the SOLUNA festival calendar."
                  )}
                </p>
              </motion.div>

              {/* loading */}
              {loading && (
                <div style={{ textAlign: "center", padding: 64 }}>
                  <div style={{ width: 32, height: 32, border: `2px solid ${GOLD}40`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                </div>
              )}

              {/* list grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
                {festivals.map((f, i) => (
                  <motion.div
                    key={f.id}
                    {...stagger}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    onClick={() => selectFestival(f.id)}
                    style={{ ...glassHover, overflow: "hidden" }}
                    whileHover={{ scale: 1.02, borderColor: `${GOLD}40` }}
                  >
                    {/* cover */}
                    {f.cover_image && (
                      <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                        <img src={f.cover_image} alt={f.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 40%, rgba(5,6,10,0.9))" }} />
                      </div>
                    )}
                    <div style={{ padding: 24 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: "0.02em" }}>{f.title}</h3>
                      {f.subtitle && <p style={{ fontSize: 12, color: `${GOLD}CC`, marginBottom: 12 }}>{f.subtitle}</p>}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                        <span>{f.dates}</span>
                        <span>{f.location}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* empty state */}
              {!loading && festivals.length === 0 && (
                <motion.div {...fade} style={{ textAlign: "center", padding: 64 }}>
                  <p style={{ fontSize: 48, marginBottom: 16 }}>&#127926;</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                    {t("フェスティバルはまだ登録されていません", "No festivals listed yet")}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* ═══ FESTIVAL DETAIL ═══ */
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

              {/* back button */}
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelected(null)}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 999, padding: "8px 20px", color: "rgba(255,255,255,0.6)",
                  fontSize: 12, cursor: "pointer", marginBottom: 32, fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
              >
                &larr; {t("一覧に戻る", "Back to list")}
              </motion.button>

              {/* ── 1. Hero ─────────────────────────────────── */}
              <motion.section initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div style={{
                  position: "relative", borderRadius: 20, overflow: "hidden",
                  marginBottom: 48, minHeight: 300,
                }}>
                  {selected.cover_image && (
                    <img src={selected.cover_image} alt={selected.title} style={{ width: "100%", height: 360, objectFit: "cover" }} />
                  )}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(transparent 20%, rgba(5,6,10,0.95))",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    padding: "32px 36px",
                  }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.4em", color: `${GOLD}AA`, marginBottom: 12, textTransform: "uppercase" }}>
                      SOLUNA FESTIVAL
                    </p>
                    <h1 style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", fontWeight: 800, lineHeight: 1.05, marginBottom: 12, letterSpacing: "0.03em" }}>
                      {selected.title}
                    </h1>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                      <span>&#128197; {selected.dates}</span>
                      <span>&#128205; {selected.location}</span>
                      {selected.venue && <span>&#127963;&#65039; {selected.venue}</span>}
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* ── 2. Countdown ────────────────────────────── */}
              <motion.section {...fade} style={{ marginBottom: 56, textAlign: "center" }}>
                <SL n="01" t={t("カウントダウン", "Countdown")} />
                <div style={{ ...glass, padding: "32px 24px", display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
                  <CUnit v={countdown.d} l={t("日", "Days")} />
                  <span style={{ fontSize: 28, color: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingTop: 4 }}>:</span>
                  <CUnit v={countdown.h} l={t("時間", "Hours")} />
                  <span style={{ fontSize: 28, color: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingTop: 4 }}>:</span>
                  <CUnit v={countdown.m} l={t("分", "Min")} />
                  <span style={{ fontSize: 28, color: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingTop: 4 }}>:</span>
                  <CUnit v={countdown.s} l={t("秒", "Sec")} />
                </div>
              </motion.section>

              {/* ── 3. Description ──────────────────────────── */}
              {(selected.description_ja || selected.description_en) && (
                <motion.section {...fade} style={{ marginBottom: 56 }}>
                  <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.8, maxWidth: 640 }}>
                    {lang === "ja" ? (selected.description_ja || selected.description_en) : (selected.description_en || selected.description_ja)}
                  </p>
                </motion.section>
              )}

              {/* ── 4. Lineup ───────────────────────────────── */}
              {selected.lineup && selected.lineup.length > 0 && (
                <motion.section {...fade} style={{ marginBottom: 56 }}>
                  <SL n="02" t={t("ラインナップ", "Lineup")} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                    {selected.lineup.map((a, i) => (
                      <motion.div
                        key={`${a.name}-${i}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        viewport={{ once: true }}
                        style={{
                          ...glass,
                          padding: 20,
                          textAlign: "center",
                          borderColor: a.headliner ? `${GOLD}40` : undefined,
                        }}
                      >
                        {/* avatar */}
                        <div style={{
                          width: 72, height: 72, borderRadius: "50%",
                          background: a.avatar ? `url(${a.avatar}) center/cover` : `linear-gradient(135deg, ${stageColor(a.stage)}40, ${stageColor(a.stage)}15)`,
                          margin: "0 auto 14px",
                          border: a.headliner ? `2px solid ${GOLD}60` : "2px solid rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 24, color: "rgba(255,255,255,0.3)",
                        }}>
                          {!a.avatar && a.name.charAt(0)}
                        </div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, letterSpacing: "0.02em" }}>
                          {a.name}
                          {a.headliner && <span style={{ color: GOLD, marginLeft: 6, fontSize: 10 }}>&#9733;</span>}
                        </h4>
                        <div style={{ fontSize: 11, color: stageColor(a.stage), marginBottom: 4, fontWeight: 600 }}>{a.stage}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{a.time}</div>
                        {a.genre && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>{a.genre}</div>}
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── 5. Schedule / Timeline ──────────────────── */}
              {stages.length > 0 && (
                <motion.section {...fade} style={{ marginBottom: 56 }}>
                  <SL n="03" t={t("タイムテーブル", "Schedule")} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {stages.map(([stageName, artists]) => (
                      <div key={stageName} style={{ ...glass, padding: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: stageColor(stageName), letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>
                          {stageName}
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {artists
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((a, i) => (
                              <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 16,
                                padding: "12px 0",
                                borderBottom: i < artists.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                              }}>
                                {/* time marker */}
                                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, minWidth: 100 }}>
                                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: stageColor(stageName), flexShrink: 0 }} />
                                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{a.time}</span>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: a.headliner ? 700 : 500, color: a.headliner ? "#fff" : "rgba(255,255,255,0.7)" }}>
                                  {a.name}
                                  {a.headliner && <span style={{ color: GOLD, marginLeft: 6, fontSize: 10 }}>HEADLINER</span>}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── 6. Contests ─────────────────────────────── */}
              {selected.contests && selected.contests.length > 0 && (
                <motion.section {...fade} style={{ marginBottom: 56 }}>
                  <SL n="04" t={t("コンテスト", "Contests")} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {selected.contests.map((c) => (
                      <Link
                        key={c.id}
                        href={`/contests`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <motion.div whileHover={{ scale: 1.02 }} style={{ ...glass, padding: 24, cursor: "pointer", transition: "border-color 0.3s" }}>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{c.name}</h4>
                          {c.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 12 }}>{c.description}</p>}
                          {c.prize && (
                            <div style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, background: `${GOLD}18`, color: GOLD, fontSize: 11, fontWeight: 600 }}>
                              {t("賞金", "Prize")}: {c.prize}
                            </div>
                          )}
                          <div style={{ marginTop: 12, fontSize: 11, color: `${GOLD}AA` }}>
                            {t("詳細を見る", "View details")} &rarr;
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── 7. Tickets ──────────────────────────────── */}
              {selected.ticket_types && selected.ticket_types.length > 0 && (
                <motion.section {...fade} style={{ marginBottom: 56 }}>
                  <SL n="05" t={t("チケット", "Tickets")} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                    {selected.ticket_types.map((tk) => (
                      <motion.div key={tk.id} whileHover={{ scale: 1.02 }} style={{ ...glass, padding: 24, position: "relative", overflow: "hidden" }}>
                        {tk.sold_out && (
                          <div style={{
                            position: "absolute", top: 14, right: -28, transform: "rotate(45deg)",
                            background: "rgba(255,60,60,0.8)", color: "#fff", fontSize: 9, fontWeight: 700,
                            padding: "4px 36px", letterSpacing: "0.1em",
                          }}>
                            SOLD OUT
                          </div>
                        )}
                        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{tk.name}</h4>
                        {tk.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 16 }}>{tk.description}</p>}
                        <div style={{ fontSize: 28, fontWeight: 800, color: GOLD, marginBottom: 16 }}>
                          {tk.currency === "USD" ? "$" : tk.currency}{tk.price.toLocaleString()}
                        </div>
                        <Link
                          href="/tickets"
                          style={{
                            display: "inline-block", textDecoration: "none",
                            padding: "10px 28px", borderRadius: 999,
                            background: tk.sold_out ? "rgba(255,255,255,0.06)" : `linear-gradient(135deg, ${GOLD}, #a8873e)`,
                            color: tk.sold_out ? "rgba(255,255,255,0.3)" : BG,
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                            pointerEvents: tk.sold_out ? "none" : "auto",
                            transition: "opacity 0.2s",
                          }}
                        >
                          {tk.sold_out ? t("完売", "Sold Out") : t("購入する", "Buy")}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* ── 8. Location ─────────────────────────────── */}
              <motion.section {...fade} style={{ marginBottom: 56 }}>
                <SL n="06" t={t("会場", "Location")} />
                <div style={{ ...glass, padding: 32 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "center" }}>
                    <div style={{ flex: "1 1 280px" }}>
                      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                        {selected.venue || "Moanalua Gardens"}
                      </h3>
                      <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 16 }}>
                        {selected.location || "Oahu, Hawaii"}
                      </p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
                        {t(
                          "ホノルルから車で約15分。モアナルア・ガーデンズは、歴史ある庭園で、壮大な「この木なんの木」モンキーポッドが迎えてくれます。",
                          "About 15 minutes from Honolulu. Moanalua Gardens is a historic botanical garden, famous for its majestic monkeypod tree canopy."
                        )}
                      </p>
                    </div>
                    <div style={{
                      flex: "1 1 260px", minHeight: 200, borderRadius: 12,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden",
                    }}>
                      <iframe
                        title="Moanalua Gardens"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3717.1!2d-157.89!3d21.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7c006e2b3f5c5b3d%3A0x2b1b3e0a0b0a0b0a!2sMonalua%20Gardens!5e0!3m2!1sen!2sus!4v1690000000000!5m2!1sen!2sus"
                        style={{ width: "100%", height: 200, border: 0, borderRadius: 12, filter: "invert(0.9) hue-rotate(180deg) saturate(0.3)" }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>
              </motion.section>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InnerFooter lang={lang} />

      {/* keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

/* ── shared pill style ─────────────────────────────────────── */
const pillStyle: React.CSSProperties = {
  padding: "5px 12px",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  fontSize: 10,
  color: "rgba(255,255,255,0.5)",
  fontWeight: 600,
  background: "transparent",
  letterSpacing: "0.04em",
};
