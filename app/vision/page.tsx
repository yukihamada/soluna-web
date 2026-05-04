"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─── Ember canvas ─────────────────────────────────────────── */
function EmbersCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const embers = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.6 - 0.2,
      alpha: Math.random() * 0.6 + 0.1,
      da: (Math.random() - 0.5) * 0.003,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const e of embers) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,98,${Math.max(0, Math.min(1, e.alpha))})`;
        ctx.fill();
        e.x += e.vx; e.y += e.vy; e.alpha += e.da;
        if (e.alpha <= 0 || e.y < -10) {
          e.x = Math.random() * c.width;
          e.y = c.height + 5;
          e.alpha = Math.random() * 0.4 + 0.05;
        }
        if (e.alpha > 0.8) e.da *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }} />;
}

/* ─── SVG Banyan tree ──────────────────────────────────────── */
function TreeSilhouette({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <svg viewBox="0 0 800 600" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "min(900px,130vw)", opacity, pointerEvents: "none" }} aria-hidden>
      <g fill="#c9a962">
        {/* trunk */}
        <rect x="370" y="320" width="60" height="280" />
        {/* aerial roots */}
        <rect x="290" y="400" width="18" height="200" transform="rotate(-8,290,400)" />
        <rect x="500" y="420" width="16" height="190" transform="rotate(10,500,420)" />
        <rect x="220" y="430" width="14" height="170" transform="rotate(-15,220,430)" />
        <rect x="560" y="440" width="14" height="160" transform="rotate(18,560,440)" />
        <rect x="160" y="460" width="12" height="140" transform="rotate(-20,160,460)" />
        <rect x="630" y="455" width="12" height="150" transform="rotate(22,630,455)" />
        {/* main canopy */}
        <ellipse cx="400" cy="200" rx="260" ry="180" />
        <ellipse cx="220" cy="250" rx="160" ry="130" />
        <ellipse cx="580" cy="245" rx="155" ry="125" />
        <ellipse cx="120" cy="310" rx="110" ry="90" />
        <ellipse cx="680" cy="300" rx="105" ry="88" />
        <ellipse cx="400" cy="120" rx="180" ry="110" />
        <ellipse cx="310" cy="160" rx="130" ry="100" />
        <ellipse cx="490" cy="155" rx="125" ry="98" />
      </g>
    </svg>
  );
}

/* ─── Drone dot animation ──────────────────────────────────── */
const DRONE_POSITIONS = [
  [400,140],[360,170],[440,170],[320,200],[400,200],[480,200],
  [280,230],[360,230],[440,230],[520,230],[300,260],[380,260],
  [420,260],[500,260],[340,290],[400,290],[460,290],[360,320],
  [400,320],[440,320],[380,350],[400,350],[420,350],[395,380],[405,380],
];

function DroneDots() {
  return (
    <div style={{ position: "relative", width: 800, height: 480, margin: "0 auto" }}>
      {DRONE_POSITIONS.map(([x, y], i) => (
        <motion.div
          key={i}
          style={{ position: "absolute", left: x, top: y, width: 6, height: 6, borderRadius: "50%", background: "#c9a962", transform: "translate(-50%,-50%)" }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
          transition={{ duration: 2 + Math.random() * 2, delay: i * 0.06, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <motion.p
        style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center", fontSize: 11, letterSpacing: "0.4em", color: "rgba(201,169,98,0.5)" }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        300 DRONES · SYNCHRONIZED · ONE FORMATION
      </motion.p>
    </div>
  );
}

/* ─── Scroll-reveal wrapper ────────────────────────────────── */
function R({ children, delay = 0, y = 40 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── Artist card ─────────────────────────────────────────── */
function ArtistCard({ name, origin, genre, fee, tagline, color }: { name: string; origin: string; genre: string; fee: string; tagline: string; color: string }) {
  return (
    <div style={{ borderTop: `2px solid ${color}`, background: "rgba(255,255,255,0.03)", padding: "28px 24px", borderRadius: 2 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.5em", color, marginBottom: 8, textTransform: "uppercase" }}>{origin} · {genre}</p>
      <h3 className="font-display" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff", marginBottom: 10 }}>{name}</h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 12 }}>{tagline}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>{fee}</p>
    </div>
  );
}

/* ─── Timeline item ───────────────────────────────────────── */
function TLItem({ time, label, sub }: { time: string; label: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
        <motion.div
          initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 0.4, type: "spring" }}
          style={{ width: 12, height: 12, borderRadius: "50%", background: "#c9a962", flexShrink: 0, boxShadow: "0 0 12px rgba(201,169,98,0.5)" }}
        />
        <div style={{ width: 1, flexGrow: 1, background: "rgba(201,169,98,0.2)", marginTop: 6 }} />
      </div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }} style={{ paddingBottom: 32 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(201,169,98,0.7)", marginBottom: 4 }}>{time}</p>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sub}</p>
      </motion.div>
    </div>
  );
}

/* ─── Progress bar ────────────────────────────────────────── */
function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <motion.div style={{ position: "fixed", top: 28, left: 0, right: 0, height: 2, background: "#c9a962", scaleX, transformOrigin: "0%", zIndex: 100 }} />
  );
}

/* ─── Section heading ─────────────────────────────────────── */
function SH({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <>
      {accent && <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.6)", marginBottom: 16, textTransform: "uppercase" }}>{accent}</p>}
      <h2 className="font-display" style={{ fontSize: "clamp(2.4rem,8vw,5rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>{children}</h2>
      <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 32 }} />
    </>
  );
}

/* ─── Piano keys (Sakamoto memorial) ─────────────────────── */
function PianoKeys() {
  const whites = 14;
  return (
    <div style={{ display: "flex", gap: 2, justifyContent: "center", margin: "32px 0" }}>
      {Array.from({ length: whites }, (_, i) => {
        const blackAfter = [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].includes(i);
        return (
          <div key={i} style={{ position: "relative" }}>
            <motion.div
              style={{ width: 28, height: 100, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0 0 3px 3px" }}
              animate={{ background: ["rgba(255,255,255,0.04)", "rgba(201,169,98,0.15)", "rgba(255,255,255,0.04)"] }}
              transition={{ duration: 4, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
            />
            {blackAfter && i < whites - 1 && (
              <div style={{ position: "absolute", top: 0, right: -8, width: 18, height: 64, background: "rgba(255,255,255,0.12)", zIndex: 1, borderRadius: "0 0 2px 2px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function VisionPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Countdown to Oct 31 2026
  const target = useMemo(() => new Date("2026-10-31T18:00:00-10:00").getTime(), []);
  const diff = target - Date.now() - tick * 0;
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hrs = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const secs = Math.max(0, Math.floor((diff % 60000) / 1000));

  return (
    <main style={{ background: "#080808", color: "#fff", overflowX: "hidden" }}>
      <ProgressBar />


      {/* ══════════════════════════════════════════════════════
          SECTION 1 — VOID
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#000" }}>
        <EmbersCanvas />
        <TreeSilhouette opacity={0.06} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px" }}>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.3 }}
            style={{ fontSize: 10, letterSpacing: "0.6em", color: "rgba(201,169,98,0.5)", marginBottom: 28, textTransform: "uppercase" }}
          >
            OCTOBER 31 · 2026 · MOANALUA GARDENS · OAHU, HAWAII
          </motion.p>

          <motion.h1
            className="font-display"
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(3.5rem,14vw,10rem)", lineHeight: 0.9, marginBottom: 32 }}
          >
            THE TREE<br />
            <span style={{ color: "#c9a962" }}>REMEMBERS</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.6 }}
            style={{ fontSize: "clamp(0.85rem,2vw,1rem)", color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.8 }}
          >
            Where ancient Hawaiian land meets underground electronic music.<br />
            One night. One tree. 5,850 souls.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noreferrer"
              style={{ padding: "14px 36px", background: "#c9a962", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textDecoration: "none", borderRadius: 2 }}>
              GET TICKETS
            </a>
            <a href="#story" style={{ padding: "14px 36px", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.8)", fontSize: 11, letterSpacing: "0.3em", textDecoration: "none", borderRadius: 2 }}>
              ENTER THE STORY
            </a>
          </motion.div>
        </div>

        <motion.div
          style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
        >
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
            <rect x="8" y="0" width="4" height="18" rx="2" fill="rgba(201,169,98,0.3)" />
            <path d="M4 18 L10 26 L16 18" stroke="rgba(201,169,98,0.4)" strokeWidth="1.5" fill="none" />
          </svg>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — THE TREE
      ══════════════════════════════════════════════════════ */}
      <section id="story" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 50% 0%, rgba(20,45,20,0.9) 0%, #080808 70%)", padding: "120px 24px", overflow: "hidden" }}>
        <TreeSilhouette opacity={0.18} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <R>
            <SH accent="MOANALUA GARDENS · EST. 1884">THE TREE<br />IS 110 YEARS OLD</SH>
          </R>
          <R delay={0.15}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 32 }}>
              The Great Banyan of Moanalua Gardens has spread its roots across Hawaiian soil since 1884.
              Its aerial roots — some thick as telephone poles — have witnessed generations of ceremonies,
              gatherings, and the quiet passage of time.
            </p>
          </R>
          <R delay={0.25}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 48 }}>
              On Halloween night 2026, the tree witnesses something new: 5,850 people becoming one
              organism beneath its canopy. Underground electronic music as ceremony. As offering.
              As memory made sound.
            </p>
          </R>
          <R delay={0.35}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
              {[
                { v: "110", u: "YEARS OLD" },
                { v: "1.5", u: "ACRES OF CANOPY" },
                { v: "5,850", u: "SOULS, ONE NIGHT" },
                { v: "∞", u: "MEMORIES FORMED" },
              ].map(s => (
                <div key={s.u} style={{ textAlign: "center", padding: "20px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="font-display" style={{ fontSize: 36, color: "#c9a962", marginBottom: 4 }}>{s.v}</p>
                  <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.35)" }}>{s.u}</p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — THE VEIL
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 30% 50%, rgba(80,10,10,0.8) 0%, rgba(40,5,5,0.6) 40%, #080808 80%)", padding: "120px 24px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 70% 30%, rgba(201,169,98,0.04) 0%, transparent 60%)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <R>
            <SH accent="HALLOWEEN · OCT 31 · 18:00 HST">THE VEIL<br />BREAKS TONIGHT</SH>
          </R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 28 }}>
              In Hawaiian tradition, Samhain and the old Hawaiian spiritual calendar converge
              at this time of year — when the membrane between worlds grows thin. The ancestors
              walk among the living. The dead are not gone; they dance.
            </p>
          </R>
          <R delay={0.2}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 48 }}>
              We chose Halloween not for its costume-party energy, but for its ancient truth:
              the night when music becomes prayer, when bass frequencies align with something
              older than language. A portal, made of sound.
            </p>
          </R>
          <R delay={0.3}>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["DAY OF THE DEAD · HONORING ANCESTORS", "SAMHAIN · THE TURNING OF THE YEAR", "ELECTRONIC MUSIC · THE NEW CEREMONY"].map((tag, i) => (
                <span key={i} style={{ fontSize: 10, letterSpacing: "0.35em", color: "rgba(201,169,98,0.6)", padding: "6px 14px", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 1 }}>
                  {tag}
                </span>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — CEREMONY
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 60% 40%, rgba(45,10,60,0.7) 0%, #080808 70%)", padding: "120px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <R>
            <SH accent="THE OPENING">A SHINTO CEREMONY<br />UNDER HAWAIIAN SKY</SH>
          </R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 28 }}>
              As the Hawaiian sun touches the Pacific horizon at 18:00, a Shinto priest from Japan
              performs <em style={{ color: "rgba(201,169,98,0.8)", fontStyle: "normal" }}>お祓い</em> — a purification ritual — at the roots of the Great Banyan.
              Taiko drums echo across the garden. The first electronic note drops at sunset.
            </p>
          </R>
          <R delay={0.2}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 48 }}>
              This is Japan meeting Hawaii meeting underground culture — a collision of ritual
              forms that has never existed before. The festival doesn't start with a DJ.
              It starts with silence, then drums, then everything.
            </p>
          </R>
          <R delay={0.3}>
            <div style={{ padding: "28px 32px", border: "1px solid rgba(201,169,98,0.15)", background: "rgba(201,169,98,0.03)", maxWidth: 540 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.4em", color: "rgba(201,169,98,0.5)", marginBottom: 12 }}>THE RITUAL SEQUENCE</p>
              {["お祓い · Shinto purification ritual", "太鼓 · Taiko drumming, 10 minutes", "夕日 · The last light of October 31st", "最初の音 · The first electronic note", "一夜限り · One night. Never again, exactly like this."].map((step, i) => (
                <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 2.2, borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", paddingBottom: i < 4 ? 4 : 0 }}>{step}</p>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — ARTISTS
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "#050505", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <R>
            <SH accent="THE CAST">THREE ARTISTS.<br />THREE WORLDS.</SH>
          </R>
          <R delay={0.1}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 48, maxWidth: 560, lineHeight: 1.8 }}>
              Each artist was chosen not for fame, but for resonance. For what they do to
              rooms at 2am. For why their music belongs under a 110-year-old tree.
            </p>
          </R>
          <R delay={0.15}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, marginBottom: 48 }}>
              <ArtistCard
                name="WHOMADEWHO"
                origin="DENMARK"
                genre="COSMIC ELECTRONIC"
                fee="HEADLINE · $70,000"
                tagline="Their sound lives in the exact frequency between melancholy and euphoria. The tree will resonate at 85Hz when they play."
                color="rgba(201,169,98,0.9)"
              />
              <ArtistCard
                name="MATHAME"
                origin="ITALY"
                genre="DARK MELODIC TECHNO"
                fee="DIRECT SUPPORT · $45,000"
                tagline="Brothers born of Italian electronic soil. When they play, clubs go dark and people forget what city they're in."
                color="rgba(160,120,200,0.8)"
              />
              <ArtistCard
                name="DJ NOBU"
                origin="JAPAN"
                genre="EXPERIMENTAL TECHNO"
                fee="OPENING ACT · $15,000"
                tagline="The connection between the Shinto ceremony and electronic music. Japan's most revered underground selector, opening under a Hawaiian sky."
                color="rgba(100,180,220,0.8)"
              />
            </div>
          </R>
          <R delay={0.25}>
            <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
              ADDITIONAL ARTISTS TO BE ANNOUNCED · LOCAL HAWAII ARTISTS FEATURED
            </p>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — DRONES
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 50% 100%, rgba(201,169,98,0.08) 0%, #080808 60%)", padding: "120px 24px", overflow: "hidden" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", textAlign: "center" }}>
          <R>
            <SH accent="THE SPECTACLE">
              300 DRONES.<br />ONE TREE.
            </SH>
          </R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto 48px" }}>
              As WhoMadeWho hits peak hour, 300 synchronized drones rise from the garden floor
              and form the silhouette of the Banyan tree itself — 300 golden points of light,
              suspended above 5,850 upturned faces. The tree made of light, born from the tree
              of wood. Captured by 400 phone cameras simultaneously.
            </p>
          </R>
          <R delay={0.2}>
            <DroneDots />
          </R>
          <R delay={0.3}>
            <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", marginTop: 40 }}>
              DRONE FORMATION MIRRORS THE GREAT BANYAN · SIMULTANEOUS MUSIC SYNC · ZERO PYRO
            </p>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — SAKAMOTO MEMORIAL
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 40% 60%, rgba(5,20,40,0.9) 0%, #080808 70%)", padding: "120px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <R>
            <SH accent="IN MEMORY · 坂本龍一 · 1952–2023">THE KEYS<br />STILL SING</SH>
          </R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 12 }}>
              Ryuichi Sakamoto, who passed in March 2023, spent his final years obsessed with
              a single question: <em style={{ color: "rgba(201,169,98,0.8)", fontStyle: "normal" }}>what is the relationship between nature and electronic music?</em>
            </p>
          </R>
          <R delay={0.2}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.25rem)", lineHeight: 1.9, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 32 }}>
              He left his Yamaha piano in the forest for a year. He recorded trees. He said:
              "The rain is already a great musician." SOLUNA FEST is an answer to his question.
              DJ Nobu will perform a dedicated set in his memory. The tree will listen.
            </p>
          </R>
          <R delay={0.25}>
            <PianoKeys />
          </R>
          <R delay={0.3}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontStyle: "italic", maxWidth: 480, lineHeight: 1.8 }}>
              "I don't want to express emotion. I want to exist in the emotion itself."<br />
              <span style={{ color: "rgba(201,169,98,0.4)", fontStyle: "normal", fontSize: 11, letterSpacing: "0.2em" }}>— Ryuichi Sakamoto</span>
            </p>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 8 — TIMELINE
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", background: "#060606", padding: "120px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
          <R>
            <SH accent="THE EVENING">EIGHT HOURS.<br />ONE PROGRESSION.</SH>
          </R>
          <div>
            <TLItem time="15:00 HST" label="GATES OPEN" sub="Garden access · Bar setup · Ambient soundscape" />
            <TLItem time="17:45 HST" label="SHINTO CEREMONY" sub="お祓い purification · Taiko drums · The blessing of the tree" />
            <TLItem time="18:00 HST" label="SUNSET · DJ NOBU" sub="First electronic note drops as the sun touches the Pacific" />
            <TLItem time="20:00 HST" label="MATHAME" sub="Dark melodic techno · The night deepens · Mist machines engage" />
            <TLItem time="21:30 HST" label="DRONE FORMATION" sub="300 drones rise · Banyan silhouette in light above 5,850 faces" />
            <TLItem time="22:00 HST" label="WHOMADEWHO · HEADLINE" sub="Peak hour begins · The tree's roots feel 2,000W of bass" />
            <TLItem time="23:00 HST" label="FINAL HOUR" sub="The grove fills with sound · The veil is thinnest · The ancestors dance" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 9 — CTA
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", overflow: "hidden", padding: "80px 24px", textAlign: "center" }}>
        <EmbersCanvas />
        <TreeSilhouette opacity={0.12} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.6em", color: "rgba(201,169,98,0.5)", marginBottom: 24 }}>OCTOBER 31 · 2026 · OAHU, HAWAII</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,9vw,6.5rem)", lineHeight: 0.92, marginBottom: 32 }}>
              5,850 SOULS.<br />
              <span style={{ color: "#c9a962" }}>ONE TREE.</span><br />
              ONE NIGHT.
            </h2>
            <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", margin: "0 auto 40px" }} />
          </R>

          {/* Countdown */}
          <R delay={0.1}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48 }}>
              {[
                { v: days, u: "DAYS" },
                { v: hrs, u: "HRS" },
                { v: mins, u: "MIN" },
                { v: secs, u: "SEC" },
              ].map(c => (
                <div key={c.u} style={{ textAlign: "center", padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)", minWidth: 72 }}>
                  <p className="font-display" style={{ fontSize: 36, color: "#c9a962", lineHeight: 1 }}>{String(c.v).padStart(2, "0")}</p>
                  <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{c.u}</p>
                </div>
              ))}
            </div>
          </R>

          <R delay={0.2}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 60 }}>
              <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noreferrer"
                style={{ padding: "16px 40px", background: "#c9a962", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.35em", textDecoration: "none", borderRadius: 2 }}>
                GET TICKETS FROM $120
              </a>
              <Link href="/vip"
                style={{ padding: "16px 40px", border: "1px solid rgba(201,169,98,0.4)", color: "#c9a962", fontSize: 12, letterSpacing: "0.35em", textDecoration: "none", borderRadius: 2 }}>
                VIP ACCESS FROM $1,000
              </Link>
            </div>
          </R>

          <R delay={0.3}>
            <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
              {[
                ["GA TICKET", "$120", "SOLD"],
                ["VIP", "$1,000", "AVAILABLE"],
                ["PLATINUM VIP", "$2,000", "LIMITED"],
                ["DIAMOND VIP", "$3,000", "10 LEFT"],
              ].map(([tier, price, status]) => (
                <div key={tier} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{tier}</p>
                  <p className="font-display" style={{ fontSize: 22, color: "#fff", marginBottom: 4 }}>{price}</p>
                  <p style={{ fontSize: 9, letterSpacing: "0.25em", color: status === "SOLD" ? "rgba(255,80,80,0.7)" : "rgba(74,222,128,0.7)" }}>{status}</p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "40px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <p className="font-display" style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>SOLUNA FEST HAWAII 2026</p>
        <div style={{ display: "flex", gap: 24 }}>
          {[["Budget", "/budget"], ["Production", "/production"], ["Sponsor", "/sponsor"], ["Artists", "/artist"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.2em" }}>MOANALUA GARDENS · OAHU</p>
      </footer>
    </main>
  );
}
