"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ─── Ember canvas ─────────────────────────────────────────── */
function EmbersCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const embers = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.4, vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.6 - 0.2, alpha: Math.random() * 0.6 + 0.1,
      da: (Math.random() - 0.5) * 0.003,
    }));
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (const e of embers) {
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,98,${Math.max(0, Math.min(1, e.alpha))})`; ctx.fill();
        e.x += e.vx; e.y += e.vy; e.alpha += e.da;
        if (e.alpha <= 0 || e.y < -10) { e.x = Math.random() * c.width; e.y = c.height + 5; e.alpha = Math.random() * 0.4 + 0.05; }
        if (e.alpha > 0.8) e.da *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.7 }} />;
}

/* ─── SVG Banyan ──────────────────────────────────────────── */
function TreeSilhouette({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <svg viewBox="0 0 800 600" style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "min(900px,130vw)", opacity, pointerEvents: "none" }} aria-hidden>
      <g fill="#c9a962">
        <rect x="370" y="320" width="60" height="280" />
        <rect x="290" y="400" width="18" height="200" transform="rotate(-8,290,400)" />
        <rect x="500" y="420" width="16" height="190" transform="rotate(10,500,420)" />
        <rect x="220" y="430" width="14" height="170" transform="rotate(-15,220,430)" />
        <rect x="560" y="440" width="14" height="160" transform="rotate(18,560,440)" />
        <ellipse cx="400" cy="200" rx="260" ry="180" />
        <ellipse cx="220" cy="250" rx="160" ry="130" />
        <ellipse cx="580" cy="245" rx="155" ry="125" />
        <ellipse cx="400" cy="120" rx="180" ry="110" />
      </g>
    </svg>
  );
}

/* ─── Cinematic image reveal ──────────────────────────────── */
function CinematicImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 1.03 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "relative", width: "100%", borderRadius: 2, overflow: "hidden", margin: "40px 0" }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
        <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 900px" />
        {/* subtle dark vignette at edges */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(8,8,8,0.4) 100%)", pointerEvents: "none" }} />
      </div>
      {caption && (
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", textAlign: "right", marginTop: 8, paddingRight: 4 }}>{caption}</p>
      )}
    </motion.div>
  );
}

/* ─── Scroll reveal ───────────────────────────────────────── */
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
function ArtistCard({ name, origin, genre, tagline, color }: { name: string; origin: string; genre: string; tagline: string; color: string }) {
  return (
    <div style={{ borderTop: `2px solid ${color}`, background: "rgba(255,255,255,0.03)", padding: "28px 24px", borderRadius: 2 }}>
      <p style={{ fontSize: 10, letterSpacing: "0.4em", color, marginBottom: 8 }}>{origin} · {genre}</p>
      <h3 className="font-display" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "#fff", marginBottom: 10 }}>{name}</h3>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>{tagline}</p>
    </div>
  );
}

/* ─── Timeline item ───────────────────────────────────────── */
function TLItem({ time, label, sub }: { time: string; label: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{ display: "flex", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
        <motion.div initial={{ scale: 0 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 0.4, type: "spring" }}
          style={{ width: 12, height: 12, borderRadius: "50%", background: "#c9a962", flexShrink: 0, boxShadow: "0 0 12px rgba(201,169,98,0.5)" }} />
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
  return <motion.div style={{ position: "fixed", top: 28, left: 0, right: 0, height: 2, background: "#c9a962", scaleX, transformOrigin: "0%", zIndex: 100 }} />;
}

/* ─── Section heading ─────────────────────────────────────── */
function SH({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <>
      {accent && <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.6)", marginBottom: 16 }}>{accent}</p>}
      <h2 className="font-display" style={{ fontSize: "clamp(2.4rem,8vw,5rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>{children}</h2>
      <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 32 }} />
    </>
  );
}

/* ─── Main page ───────────────────────────────────────────── */
export default function VisionJaPage() {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);

  const target = useMemo(() => new Date("2026-10-31T18:00:00-10:00").getTime(), []);
  const diff = target - Date.now() - tick * 0;
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hrs  = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
  const secs = Math.max(0, Math.floor((diff % 60000) / 1000));

  return (
    <main style={{ background: "#080808", color: "#fff", overflowX: "hidden", fontFamily: "'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif" }}>
      <ProgressBar />


      {/* ══════════════════════════════
          第一幕 — 虚空（背景に群衆写真）
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#000" }}>
        {/* crowd image as dark background */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/fest/crowd.jpg" alt="Festival crowd under banyan tree" fill style={{ objectFit: "cover", opacity: 0.25 }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)" }} />
        </div>
        <EmbersCanvas />
        <TreeSilhouette opacity={0.06} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 24px" }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.3 }}
            style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 28 }}>
            2026年10月31日（土）· モアナルア・ガーデンズ · オアフ島、ハワイ
          </motion.p>
          <motion.h1 className="font-display"
            initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(3rem,13vw,9rem)", lineHeight: 0.9, marginBottom: 32 }}>
            この木は<br /><span style={{ color: "#c9a962" }}>覚えている</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.6 }}
            style={{ fontSize: "clamp(0.85rem,2vw,1rem)", color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", maxWidth: 520, margin: "0 auto 48px", lineHeight: 2 }}>
            古代ハワイの大地と、アンダーグラウンド・エレクトロニック・ミュージックが交差する夜。<br />
            一本の木の下に、5,850の魂が集まる。
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 2 }}
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noreferrer"
              style={{ padding: "14px 36px", background: "#c9a962", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
              チケットを入手する
            </a>
            <a href="#story" style={{ padding: "14px 36px", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.8)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
              物語に入る
            </a>
          </motion.div>
        </div>
        <motion.div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}
          animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
            <rect x="8" y="0" width="4" height="18" rx="2" fill="rgba(201,169,98,0.3)" />
            <path d="M4 18 L10 26 L16 18" stroke="rgba(201,169,98,0.4)" strokeWidth="1.5" fill="none" />
          </svg>
        </motion.div>
      </section>

      {/* ══════════════════════════════
          第二幕 — 大木（黄金時間の写真）
      ══════════════════════════════ */}
      <section id="story" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 50% 0%, rgba(20,45,20,0.9) 0%, #080808 70%)", padding: "120px 24px", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <R>
            <SH accent="モアナルア・ガーデンズ · 1884年創設">この木は<br />樹齢110年</SH>
          </R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 2, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 20 }}>
              モアナルア・ガーデンズのグレート・バニヤンは、1884年からハワイの大地に根を張り続けている。
              電話柱ほどの太さになった気根は、幾世代もの儀式、集い、そして静かな時の流れを見届けてきた。
            </p>
          </R>
          <R delay={0.15}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 2, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 0 }}>
              2026年のハロウィンの夜、この木は新たな目撃者となる。5,850人がその樹冠の下でひとつの生命体になる瞬間。
              アンダーグラウンド・エレクトロニック・ミュージックは儀式となり、供物となり、音となった記憶として刻まれる。
            </p>
          </R>

          {/* ★ GOLDEN HOUR PHOTO */}
          <CinematicImage
            src="/images/fest/golden_hour.jpg"
            alt="Moanalua Gardens at golden hour with festival attendees"
            caption="モアナルア・ガーデンズ ゲートオープン直後の様子"
          />

          <R delay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16 }}>
              {[
                { v: "110", u: "年の樹齢" }, { v: "約1.5", u: "エーカーの樹冠" },
                { v: "5,850", u: "魂、一夜限り" }, { v: "∞", u: "生まれる記憶" },
              ].map(s => (
                <div key={s.u} style={{ textAlign: "center", padding: "20px 16px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="font-display" style={{ fontSize: 36, color: "#c9a962", marginBottom: 4 }}>{s.v}</p>
                  <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)" }}>{s.u}</p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════
          第三幕 — 帳
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 30% 50%, rgba(80,10,10,0.8) 0%, rgba(40,5,5,0.6) 40%, #080808 80%)", padding: "120px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <R><SH accent="ハロウィン · 10月31日 · 18:00 HST">今夜、帳が<br />破れる</SH></R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 2, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 28 }}>
              ハワイの伝承では、この時期、霊と現世の境界が最も薄くなると言われている。
              サウィンとハワイの古い暦が重なり合う夜。先祖は生者の間を歩く。死者は消えたのではなく、ただ踊り続けている。
            </p>
          </R>
          <R delay={0.2}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 2, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 40 }}>
              私たちがハロウィンを選んだのは、仮装パーティーのためではない。
              その古代的真実のためだ。音楽が祈りになり、低音が言語より古い何かと共鳴する夜。音でできた、門。
            </p>
          </R>
          <R delay={0.3}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {["死者の日 · 先祖への敬意", "サウィン · 年の転換点", "エレクトロニック · 新しい儀式"].map((tag, i) => (
                <span key={i} style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(201,169,98,0.6)", padding: "6px 14px", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 1 }}>{tag}</span>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════
          第四幕 — 儀式（神道の写真）
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 60% 40%, rgba(45,10,60,0.7) 0%, #080808 70%)", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <R><SH accent="開幕の儀式">ハワイの空の下で<br />神道の祓い</SH></R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 2, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 12 }}>
              18時、ハワイの夕日が太平洋に沈む瞬間、日本から招いた神主がグレート・バニヤンの根元で
              <span style={{ color: "rgba(201,169,98,0.8)" }}>お祓い</span>を執り行う。
              太鼓の音が庭園に響き渡り、その余韻の中で最初のエレクトロニック音が落ちる。
            </p>
          </R>

          {/* ★ CEREMONY PHOTO */}
          <CinematicImage
            src="/images/fest/ceremony.jpg"
            alt="Shinto priest performing ceremony at banyan tree roots at sunset"
            caption="神主によるお祓い · 日没の瞬間 · モアナルア・ガーデンズ"
          />

          <R delay={0.2}>
            <div style={{ padding: "28px 32px", border: "1px solid rgba(201,169,98,0.15)", background: "rgba(201,169,98,0.03)", maxWidth: 540 }}>
              <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "rgba(201,169,98,0.5)", marginBottom: 12 }}>儀式の流れ</p>
              {["お祓い · 神道の清めの儀式", "太鼓 · 10分間の奉納演奏", "夕日 · 10月31日最後の光", "最初の音 · エレクトロニックの幕開け", "一夜限り · 二度と同じ夜は来ない"].map((step, i) => (
                <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 2.2, borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", paddingBottom: i < 4 ? 4 : 0 }}>{step}</p>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════
          第五幕 — アーティスト（DJステージ写真）
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "#050505", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <R><SH accent="キャスト">3人のアーティスト。<br />3つの世界。</SH></R>
          <R delay={0.1}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 32, maxWidth: 560, lineHeight: 1.9 }}>
              名声ではなく、共鳴で選ばれた3人。深夜2時の会場で何をするか。なぜ彼らの音楽が樹齢110年の木の下に属するのか。
            </p>
          </R>

          {/* ★ DJ STAGE PHOTO */}
          <CinematicImage
            src="/images/fest/dj_stage.jpg"
            alt="DJ performing under banyan tree at night with laser lights"
            caption="バニヤンの樹皮にプロジェクションマッピングが投影されるメインステージ"
          />

          <R delay={0.15}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16, marginBottom: 40 }}>
              <ArtistCard name="WHOMADEWHO" origin="デンマーク" genre="コズミック・エレクトロニック"
                tagline="憂鬱と陶酔の狭間、正確にその周波数に生きる音楽。彼らが演奏するとき、この木は85Hzで共鳴する。"
                color="rgba(201,169,98,0.9)" />
              <ArtistCard name="MATHAME" origin="イタリア" genre="ダーク・メロディック・テクノ"
                tagline="イタリアのエレクトロニック・ソイルに生まれた兄弟。彼らが演奏すると、クラブは暗転し、人々はどの街にいるかを忘れる。"
                color="rgba(160,120,200,0.8)" />
              <ArtistCard name="DJ NOBU" origin="日本" genre="実験的テクノ"
                tagline="神道の儀式とエレクトロニック・ミュージックを繋ぐ存在。日本が誇るアンダーグラウンドの泰斗が、ハワイの空の下で幕を開ける。"
                color="rgba(100,180,220,0.8)" />
            </div>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════
          第六幕 — ドローン（実写）
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 50% 100%, rgba(201,169,98,0.08) 0%, #080808 60%)", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%", textAlign: "center" }}>
          <R><SH accent="300機の光">300機のドローン。<br />一本の木。</SH></R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 2, color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto 8px" }}>
              WhoMadeWhoがピーク・アワーを迎える瞬間、300機の同期ドローンが庭園の床から舞い上がり、
              バニヤンのシルエットそのものを空に描く。金色の300点の光が、5,850の上向いた顔の頭上に浮かぶ。
              木が光になり、木の上に宿る。
            </p>
          </R>

          {/* ★ DRONES PHOTO */}
          <CinematicImage
            src="/images/fest/drones.jpg"
            alt="300 drones forming banyan tree silhouette above festival crowd"
            caption="300機のドローンがバニヤンの樹形を夜空に描く · WhoMadeWhoピーク・アワー"
          />

          <R delay={0.2}>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)" }}>
              フォーメーションはグレート・バニヤンを模倣 · 音楽と完全同期 · 火薬不使用
            </p>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════
          第七幕 — 坂本龍一（ピアニスト写真）
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", background: "radial-gradient(ellipse at 40% 60%, rgba(5,20,40,0.9) 0%, #080808 70%)", padding: "120px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
          <R><SH accent="追悼 · 坂本龍一 · 1952–2023">鍵盤は<br />まだ歌う</SH></R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 2, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 12 }}>
              2023年3月に逝去した坂本龍一は、晩年、一つの問いに取り憑かれていた。
              <span style={{ color: "rgba(201,169,98,0.8)" }}>「自然とエレクトロニック・ミュージックの関係とは何か？」</span>
            </p>
          </R>
          <R delay={0.15}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", lineHeight: 2, color: "rgba(255,255,255,0.55)", maxWidth: 640, marginBottom: 0 }}>
              DJ Nobuは彼への追悼として、バニヤンの根元の特設ステージでセットを演奏する。
              ハワイの星空の下、木が聴いている。
            </p>
          </R>

          {/* ★ PIANIST PHOTO */}
          <CinematicImage
            src="/images/fest/pianist.jpg"
            alt="Pianist performing memorial tribute under banyan tree at night with stars"
            caption="バニヤンの根元 特設ステージ · 星空の下の追悼演奏"
          />

          <R delay={0.2}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontStyle: "italic", maxWidth: 480, lineHeight: 1.9 }}>
              「感情を表現したいのではない。感情そのものの中に存在したい。」<br />
              <span style={{ color: "rgba(201,169,98,0.4)", fontStyle: "normal", fontSize: 11, letterSpacing: "0.15em" }}>— 坂本龍一</span>
            </p>
          </R>
        </div>
      </section>

      {/* ══════════════════════════════
          第八幕 — タイムライン
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", background: "#060606", padding: "120px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
          <R><SH accent="一夜の流れ">8時間。<br />一つの旅。</SH></R>
          <TLItem time="15:00 HST" label="ゲートオープン" sub="庭園入場 · バー準備 · アンビエント・サウンドスケープ" />
          <TLItem time="17:45 HST" label="神道の儀式" sub="お祓い · 太鼓奉納 · グレート・バニヤンへの祝福" />
          <TLItem time="18:00 HST" label="日没 · DJ NOBU" sub="太平洋に夕日が沈む瞬間、最初の電子音が降りる" />
          <TLItem time="20:00 HST" label="MATHAME" sub="ダーク・メロディック・テクノ · 夜が深まる · ミスト・マシン始動" />
          <TLItem time="21:30 HST" label="ドローン・フォーメーション" sub="300機が舞い上がり · 5,850の顔の上にバニヤンのシルエット" />
          <TLItem time="22:00 HST" label="WHOMADEWHO · ヘッドライナー" sub="ピーク・アワー開幕 · 木の根が2,000Wの低音を感じる" />
          <TLItem time="23:00 HST" label="最終時間" sub="音が森を満たす · 帳は最も薄くなる · 先祖が踊る" />
        </div>
      </section>

      {/* ══════════════════════════════
          第九幕 — CTA
      ══════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#000", overflow: "hidden", padding: "80px 24px", textAlign: "center" }}>
        {/* crowd photo as dark background */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/fest/crowd.jpg" alt="" fill style={{ objectFit: "cover", opacity: 0.18 }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.92) 100%)" }} />
        </div>
        <EmbersCanvas />
        <TreeSilhouette opacity={0.1} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 24 }}>2026年10月31日 · オアフ島、ハワイ</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,9vw,6.5rem)", lineHeight: 0.92, marginBottom: 32 }}>
              5,850の魂。<br /><span style={{ color: "#c9a962" }}>一本の木。</span><br />一夜限り。
            </h2>
            <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", margin: "0 auto 40px" }} />
          </R>

          <R delay={0.1}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48 }}>
              {[{ v: days, u: "日" }, { v: hrs, u: "時間" }, { v: mins, u: "分" }, { v: secs, u: "秒" }].map(c => (
                <div key={c.u} style={{ textAlign: "center", padding: "16px 20px", border: "1px solid rgba(255,255,255,0.06)", minWidth: 72 }}>
                  <p className="font-display" style={{ fontSize: 36, color: "#c9a962", lineHeight: 1 }}>{String(c.v).padStart(2, "0")}</p>
                  <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginTop: 6 }}>{c.u}</p>
                </div>
              ))}
            </div>
          </R>

          <R delay={0.2}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
              <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noreferrer"
                style={{ padding: "16px 40px", background: "#c9a962", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                チケット購入 $120〜
              </a>
              <Link href="/vip" style={{ padding: "16px 40px", border: "1px solid rgba(201,169,98,0.4)", color: "#c9a962", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                VIPアクセス $1,000〜
              </Link>
            </div>
          </R>

          <R delay={0.3}>
            <div style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
              {[["GA チケット", "$120", "発売中", true], ["VIP", "$1,000", "残席あり", true], ["プラチナ VIP", "$2,000", "残り僅か", false], ["ダイヤモンド VIP", "$3,000", "10席のみ", false]].map(([tier, price, status, avail]) => (
                <div key={String(tier)} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{tier}</p>
                  <p className="font-display" style={{ fontSize: 22, color: "#fff", marginBottom: 4 }}>{price}</p>
                  <p style={{ fontSize: 9, letterSpacing: "0.2em", color: avail ? "rgba(74,222,128,0.7)" : "rgba(255,180,50,0.8)" }}>{status}</p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      {/* フッター */}
      <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "40px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <p className="font-display" style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>SOLUNA FEST HAWAII 2026</p>
        <div style={{ display: "flex", gap: 24 }}>
          {[["予算", "/budget"], ["制作", "/production"], ["スポンサー", "/sponsor"], ["アーティスト", "/artist"]].map(([l, h]) => (
            <Link key={String(l)} href={String(h)} style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>モアナルア・ガーデンズ · オアフ島</p>
      </footer>
    </main>
  );
}
