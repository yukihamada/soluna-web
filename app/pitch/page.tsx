"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   DJ AUDIO ENGINE — scroll-triggered crossfade synthesizer
══════════════════════════════════════════════════════════════ */

// 8 synthesized soundscapes, each tuned to a different musical mood
const AUDIO_DEFS = [
  // 0 — Void / Opening: deep sub-bass drone, almost silence
  { freqs: [[40,"sine"],[80,"sine"],[165,"sine"]], filter: 200,  vol: 0.18, lfoHz: 0.08, lfoDepth: 20 },
  // 1 — Conflict / Date problem: minor tension, dissonance
  { freqs: [[55,"sine"],[87,"sine"],[147,"triangle"]], filter: 300,  vol: 0.22, lfoHz: 0.12, lfoDepth: 30 },
  // 2 — Resolution / Oct 31 argument: major chord resolving
  { freqs: [[65,"sine"],[131,"sine"],[196,"sine"],[262,"sine"]], filter: 600,  vol: 0.20, lfoHz: 0.10, lfoDepth: 25 },
  // 3 — Vision / Venue: harmonic richness, warmth
  { freqs: [[55,"sine"],[110,"sine"],[165,"sine"],[220,"sine"]], filter: 800,  vol: 0.22, lfoHz: 0.15, lfoDepth: 15 },
  // 4 — Artists / Energy building: pulse starts
  { freqs: [[55,"sine"],[110,"triangle"],[185,"sine"],[330,"sine"]], filter: 1200, vol: 0.24, lfoHz: 0.20, lfoDepth: 20 },
  // 5 — Drones / Peak energy: full texture, deep groove
  { freqs: [[44,"sawtooth"],[88,"sine"],[176,"sine"],[220,"triangle"]], filter: 1500, vol: 0.25, lfoHz: 0.25, lfoDepth: 18 },
  // 6 — P&L / Numbers: clean, clear, less distortion
  { freqs: [[55,"sine"],[123,"sine"],[196,"sine"]], filter: 900,  vol: 0.20, lfoHz: 0.08, lfoDepth: 10 },
  // 7 — CTA / Outro: emotional peak, major chord shimmer
  { freqs: [[55,"sine"],[110,"sine"],[138,"sine"],[165,"sine"],[220,"sine"]], filter: 2000, vol: 0.22, lfoHz: 0.12, lfoDepth: 12 },
];

type SectionAudio = { gain: GainNode; lfos: OscillatorNode[]; oscs: OscillatorNode[] };

function createDJEngine(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const sections: SectionAudio[] = AUDIO_DEFS.map(def => {
    const sGain = ctx.createGain();
    sGain.gain.value = 0;
    sGain.connect(master);

    const oscs: OscillatorNode[] = [];
    const lfos: OscillatorNode[] = [];

    def.freqs.forEach(([freq, type]) => {
      const osc = ctx.createOscillator();
      osc.type = type as OscillatorType;
      osc.frequency.value = Number(freq);

      const oscGain = ctx.createGain();
      oscGain.gain.value = def.vol / def.freqs.length;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = def.filter;
      filter.Q.value = 0.8;

      // LFO for subtle pitch drift (analog warmth)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = def.lfoHz;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = def.lfoDepth;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      lfos.push(lfo);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(sGain);
      osc.start();
      oscs.push(osc);
    });

    return { gain: sGain, lfos, oscs };
  });

  return { master, sections };
}

/* ══════════════════════════════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════════════════════════════ */
function useScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement;
      setPct(Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)));
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return pct;
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function R({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 36 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CINEMATIC IMAGE
══════════════════════════════════════════════════════════════ */
function CinematicImg({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 1.04 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "relative", width: "100%", borderRadius: 2, overflow: "hidden", margin: "32px 0" }}>
      <div style={{ position: "relative", aspectRatio: "16/9" }}>
        <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes="900px" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(8,8,8,0.5))" }} />
      </div>
      {caption && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "right", marginTop: 6, letterSpacing: "0.25em" }}>{caption}</p>}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION WRAPPER — full-viewport section with subtle bg shift
══════════════════════════════════════════════════════════════ */
function Section({ children, bg = "#080808", id }: { children: React.ReactNode; bg?: string; id?: string }) {
  return (
    <section id={id} style={{ background: bg, padding: "120px 24px", position: "relative" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   P&L TABLE
══════════════════════════════════════════════════════════════ */
const REVENUE = [
  { label: "GA チケット ($120 × 5,000枚×70%動員)", amount: 420000 },
  { label: "VIP テーブル / ボトルサービス", amount: 270000 },
  { label: "VIPパッケージ (208名 × $1,000)", amount: 208000 },
  { label: "飲食売上 (F&B)", amount: 394000 },
  { label: "スポンサーシップ", amount: 170000 },
];

const EXPENSES = [
  { label: "アーティスト出演料 (WhoMadeWho + Mathame + DJ Nobu)", amount: 130000 },
  { label: "会場使用料 (Moanalua Gardens)", amount: 8000 },
  { label: "音響・照明・映像制作", amount: 180000 },
  { label: "セキュリティ・スタッフ人件費", amount: 95000 },
  { label: "Zamna ライセンス料 (15% of gross)", amount: 221250 },
  { label: "ドローン300機 (レンタル + オペレーター)", amount: 60000 },
  { label: "シャトル・交通費", amount: 25000 },
  { label: "保険 (賠償 + キャンセル)", amount: 43000 },
  { label: "ハワイ GET 税 (4.71%)", amount: 69500 },
  { label: "チケットプラットフォーム手数料", amount: 44000 },
  { label: "ホテルブロック (アーティスト + VIP)", amount: 30000 },
  { label: "予備費 (10%)", amount: 90575 },
];

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function PitchPage() {
  const scrollPct = useScrollProgress();
  const ctxRef = useRef<AudioContext | null>(null);
  const engineRef = useRef<ReturnType<typeof createDJEngine> | null>(null);
  const [audioOn, setAudioOn] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const NUM_SECTIONS = 8;

  // Scroll-based DJ crossfade
  useEffect(() => {
    if (!audioOn || !engineRef.current) return;
    const engine = engineRef.current;
    const ctx = ctxRef.current!;
    const sectionFloat = scrollPct * (NUM_SECTIONS - 1);
    const cur = Math.floor(sectionFloat);
    const t = sectionFloat - cur;
    engine.sections.forEach((s, i) => {
      let target = 0;
      if (i === cur) target = 1 - t;
      else if (i === cur + 1) target = t;
      s.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.8);
    });
  }, [scrollPct, audioOn]);

  const startAudio = useCallback(async () => {
    if (audioStarted) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const engine = createDJEngine(ctx);
    engineRef.current = engine;
    await ctx.resume();
    engine.master.gain.setTargetAtTime(0.5, ctx.currentTime, 3);
    // Start first section
    engine.sections[0].gain.gain.setTargetAtTime(1, ctx.currentTime, 0.5);
    setAudioOn(true);
    setAudioStarted(true);
  }, [audioStarted]);

  const toggleAudio = useCallback(async () => {
    if (!audioStarted) { await startAudio(); return; }
    const ctx = ctxRef.current!;
    const engine = engineRef.current!;
    if (audioOn) {
      engine.master.gain.setTargetAtTime(0, ctx.currentTime, 1);
      setAudioOn(false);
    } else {
      engine.master.gain.setTargetAtTime(0.5, ctx.currentTime, 1);
      setAudioOn(true);
    }
  }, [audioStarted, audioOn, startAudio]);

  const totalRevenue = REVENUE.reduce((s, r) => s + r.amount, 0);
  const totalExpense = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;
  const yukiInvest = 200000;
  const upfront = 300000;      // cash needed before presales
  const presales = 280000;     // expected presale offset
  const bridgeNeeded = Math.max(0, upfront - presales); // ~20-100K

  const gold = "#c9a962";
  const muted = "rgba(255,255,255,0.5)";
  const dimmed = "rgba(255,255,255,0.3)";

  return (
    <main style={{ background: "#080808", color: "#fff", overflowX: "hidden", fontFamily: "'Noto Sans JP','Inter',sans-serif" }}>

      {/* ── Fixed progress + audio ── */}
      <div style={{ position: "fixed", top: 28, left: 0, right: 0, zIndex: 200 }}>
        <div style={{ height: 2, background: "#111" }}>
          <div style={{ height: "100%", background: gold, width: `${scrollPct * 100}%`, transition: "width 0.1s linear" }} />
        </div>
      </div>

      {/* ── Audio button ── */}
      <button onClick={toggleAudio}
        style={{ position: "fixed", bottom: 90, right: 28, zIndex: 200, background: audioOn ? gold : "rgba(255,255,255,0.08)", border: `1px solid ${audioOn ? gold : "rgba(255,255,255,0.15)"}`, color: audioOn ? "#000" : "rgba(255,255,255,0.6)", borderRadius: 999, padding: "10px 18px", fontSize: 11, letterSpacing: "0.2em", cursor: "pointer", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>{audioOn ? "♫" : "♩"}</span>
        {audioOn ? "音楽 ON" : "音楽を再生"}
      </button>


      {/* ══════════════════════════════════════════════
          S0 — YUKI'S OPENING  (audio zone 0)
      ══════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", background: "#000", overflow: "hidden", padding: "120px 24px" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/fest/crowd.jpg" alt="" fill style={{ objectFit: "cover", opacity: 0.12 }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.6), rgba(0,0,0,0.96))" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}
            style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.4)", marginBottom: 32 }}>
            INTERNAL PITCH DECK · TEAM & STAKEHOLDERS
          </motion.p>

          <motion.h1 className="font-display"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(2.8rem,10vw,6rem)", lineHeight: 0.9, marginBottom: 40 }}>
            このイベント、<br />
            <span style={{ color: gold }}>こんな風にしたい。</span>
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.2 }}>
            <div style={{ borderLeft: `3px solid rgba(201,169,98,0.3)`, paddingLeft: 24, marginBottom: 40 }}>
              <p style={{ fontSize: "clamp(0.95rem,2.2vw,1.1rem)", lineHeight: 2, color: muted, marginBottom: 16 }}>
                最近ずっと考えてたことがあって、アーティスト選定や日程について、
                勝手ながら自分なりに整理してみました。
                無理は承知してるんだけど、変えた方がいいんじゃないかなって思うことがいくつかある。
              </p>
              <p style={{ fontSize: "clamp(0.95rem,2.2vw,1.1rem)", lineHeight: 2, color: muted, marginBottom: 16 }}>
                このスライドは、僕がやりたいと思うイベントのイメージを可視化したもの。
                内容についてはフラットに意見を聞かせてほしいです。
                批判でも賛成でも、正直なところを教えてください。
              </p>
              <p style={{ fontSize: "0.9rem", color: dimmed, fontStyle: "italic" }}>— Yuki Hamada, April 2026</p>
            </div>

            {!audioStarted && (
              <button onClick={startAudio}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 28px", border: `1px solid rgba(201,169,98,0.3)`, background: "rgba(201,169,98,0.05)", borderRadius: 2, color: gold, fontSize: 12, letterSpacing: "0.2em", cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>▶</span>
                スライドを音楽付きで体験する
              </button>
            )}
          </motion.div>
        </div>
        <motion.div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
            <rect x="8" y="0" width="4" height="16" rx="2" fill="rgba(201,169,98,0.25)" />
            <path d="M4 16 L10 24 L16 16" stroke="rgba(201,169,98,0.35)" strokeWidth="1.5" fill="none" />
          </svg>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════
          S1 — THE DATE PROBLEM  (audio zone 1)
      ══════════════════════════════════════════════ */}
      <Section bg="radial-gradient(ellipse at 30% 50%, rgba(60,10,10,0.6), #080808)">
        <R>
          <p style={{ fontSize: 10, letterSpacing: "0.45em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>THE DATE PROBLEM</p>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>
            9月4日では、<br /><span style={{ color: "rgba(255,100,100,0.9)" }}>行けない人がいる。</span>
          </h2>
          <div style={{ width: 36, height: 2, background: "rgba(255,100,100,0.4)", marginBottom: 36 }} />
        </R>

        <R delay={0.1}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 2, color: muted, maxWidth: 640, marginBottom: 28 }}>
            SeanとYuki、共通の友人に<strong style={{ color: "#fff" }}>村田良蔵（むらたりょうぞう）</strong>がいます。
            ブラジリアン柔術の世界チャンピオンで、日本の連盟リーグも運営している方。
          </p>
        </R>

        <R delay={0.15}>
          <div style={{ padding: "24px 28px", background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)", borderRadius: 2, marginBottom: 28, maxWidth: 600 }}>
            <p style={{ fontSize: 12, letterSpacing: "0.3em", color: "rgba(255,100,100,0.7)", marginBottom: 12 }}>CONFLICT DETECTED</p>
            <p style={{ fontSize: "1rem", lineHeight: 1.9, color: muted }}>
              今年の日本で開催される<strong style={{ color: "#fff" }}>ブラジリアン柔術世界大会</strong>の日程が、
              9月4日と完全にかぶっています。良蔵さんは大会運営側でもあるため、
              ハワイに来ることがほぼ不可能な状況です。
            </p>
          </div>
        </R>

        <R delay={0.2}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 2, color: muted, maxWidth: 640 }}>
            さらに、僕の周りで「行きたい」と言っていた人の多くが、
            この日程では動けないと言っています。
            開催前から主要なネットワークが来られない状況はできれば避けたい。
          </p>
        </R>
      </Section>

      {/* ══════════════════════════════════════════════
          S2 — THE PROPOSAL  (audio zone 2)
      ══════════════════════════════════════════════ */}
      <Section bg="radial-gradient(ellipse at 60% 40%, rgba(10,30,50,0.8), #080808)">
        <R>
          <p style={{ fontSize: 10, letterSpacing: "0.45em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>THE PROPOSAL</p>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>
            10月30日か31日、<br /><span style={{ color: gold }}>どちらかに動かしたい。</span>
          </h2>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 36 }} />
        </R>

        <R delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32, maxWidth: 700 }}>
            {[
              { date: "OCT 30 (Fri)", label: "10月30日（金）", pros: ["週末前日で来やすい", "翌日にフォローアップ可能", "ハロウィン前夜の雰囲気"], cons: ["ハロウィン当日ではない"] },
              { date: "OCT 31 (Sat)", label: "10月31日（土）★推奨", pros: ["ハロウィン当日の特別感", "古代の祭り・帳が破れる夜", "土曜日で参加しやすい"], cons: ["Hawaii GET税込みで若干コスト増"] },
            ].map(opt => (
              <div key={opt.date} style={{ padding: "20px 18px", border: `1px solid ${opt.date.includes("31") ? "rgba(201,169,98,0.35)" : "rgba(255,255,255,0.08)"}`, background: opt.date.includes("31") ? "rgba(201,169,98,0.04)" : "transparent", borderRadius: 2 }}>
                <p className="font-display" style={{ fontSize: "1.2rem", color: opt.date.includes("31") ? gold : "#fff", marginBottom: 8 }}>{opt.label}</p>
                {opt.pros.map(p => <p key={p} style={{ fontSize: 12, color: "rgba(74,222,128,0.8)", marginBottom: 4 }}>✓ {p}</p>)}
                {opt.cons.map(c => <p key={c} style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>· {c}</p>)}
              </div>
            ))}
          </div>
        </R>

        <R delay={0.2}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 2, color: muted, maxWidth: 640 }}>
            31日を推奨する理由は、<strong style={{ color: "#fff" }}>ハロウィンという日が持つ意味</strong>と、
            このイベントのコンセプト（帳が破れる夜・先祖が踊る）が完全に一致するから。
            仮装パーティーではなく、「古代の儀式としてのフェス」という文脈で、
            ハロウィン当日は強力な追い風になります。
          </p>
        </R>
      </Section>

      {/* ══════════════════════════════════════════════
          S3 — THE VISION  (audio zone 3)
      ══════════════════════════════════════════════ */}
      <Section bg="radial-gradient(ellipse at 50% 0%, rgba(20,45,20,0.7), #080808)">
        <R>
          <p style={{ fontSize: 10, letterSpacing: "0.45em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>THE VISION</p>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>
            日本人が、<br /><span style={{ color: gold }}>Zamnaをハワイに召喚する。</span>
          </h2>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 24 }} />
        </R>
        <R delay={0.1}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 2, color: muted, maxWidth: 640, marginBottom: 32 }}>
            このイベントの主役は、<strong style={{ color: "#fff" }}>ハワイを愛する日本人</strong>です。
            年間150万人の日本人がハワイを訪れる。その中の、特別な体験を求めている層。
            Yukiのネットワーク——スタートアップ、柔術コミュニティ、旧Mercari人脈——がそのままこの層と重なっている。
          </p>
        </R>
        <R delay={0.15}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 2, marginBottom: 36 }}>
            {[
              { n: "150万人", label: "年間ハワイ訪問日本人数", sub: "海外旅行先ダントツ1位" },
              { n: "30%", label: "富裕層・ビジネス層比率", sub: "VIP需要が見込める" },
              { n: "5時間", label: "東京→ホノルル", sub: "日帰りできない特別感" },
              { n: "ゼロ", label: "競合する同種イベント", sub: "ハワイ×テクノの空白地帯" },
            ].map(k => (
              <div key={k.n} style={{ textAlign: "center", padding: "20px 12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="font-display" style={{ fontSize: "clamp(1.3rem,3.5vw,1.8rem)", color: gold, marginBottom: 4 }}>{k.n}</p>
                <p style={{ fontSize: 11, color: "#fff", marginBottom: 3 }}>{k.label}</p>
                <p style={{ fontSize: 10, color: dimmed }}>{k.sub}</p>
              </div>
            ))}
          </div>
        </R>
        <R delay={0.2}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 2, color: muted, maxWidth: 640, marginBottom: 8 }}>
            樹齢110年のバニヤンの下に集まる。開幕は神主のお祓いと太鼓。日没の瞬間に最初の電子音が落ちる。
            <strong style={{ color: "#fff" }}>日本とハワイをつなぐ精神的な橋を、音楽で作る。</strong>
          </p>
        </R>
        <CinematicImg src="/images/fest/golden_hour.jpg" alt="Moanalua Gardens golden hour" caption="モアナルア・ガーデンズ — ゲートオープン直後の想定" />
        <CinematicImg src="/images/fest/ceremony.jpg" alt="Shinto ceremony at banyan tree" caption="神主によるお祓い — 日没の瞬間" />
      </Section>

      {/* ══════════════════════════════════════════════
          S4 — ARTIST SELECTION  (audio zone 4)
      ══════════════════════════════════════════════ */}
      <Section bg="#050505">
        <R>
          <p style={{ fontSize: 10, letterSpacing: "0.45em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>ARTIST SELECTION</p>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>
            なぜこの3人なのか、<br /><span style={{ color: gold }}>理由を話したい。</span>
          </h2>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 36 }} />
        </R>

        <CinematicImg src="/images/fest/dj_stage.jpg" alt="DJ performing under banyan tree" caption="バニヤンの根元ステージ — Pioneer DJ · プロジェクションマッピング" />

        {[
          {
            name: "DJ NOBU",
            origin: "日本 · 実験的テクノ",
            color: "rgba(100,180,220,0.9)",
            why: "このイベントのターゲットが日本人である以上、Nobuは必須。日本の音楽好きが「このために行く」と思える唯一のアンカー。BrutusもCasa BrutusもNikkei Weekendも、DJ Nobuの名前があれば記事にする。",
            what: "オープニングに坂本龍一追悼セット。「自然と電子音楽の関係」という坂本が最晩年に探求した問いへの、音楽的な答えをこの木の下で出してほしい。日本とハワイが音で繋がる瞬間。",
            fee: "$15,000（交渉中）",
          },
          {
            name: "WHOMADEWHO",
            origin: "デンマーク · コズミック・エレクトロニック",
            color: gold,
            why: "日本のSNSで急速に認知が広がっている。Zamna Tulamの映像が日本語コメントで溢れるほど、日本人にとって「知っている名前」になりつつある。ハワイ初上陸という事実は、日本の音楽メディアが記事にする理由になる。",
            what: "彼らのセットは必ず会場を静かにする瞬間がある。5,000人が一斉に上を向く。ドローン300機との組み合わせがこのイベントの核心。",
            fee: "$70,000（確定）",
          },
          {
            name: "MATHAME",
            origin: "イタリア · ダーク・メロディック・テクノ",
            color: "rgba(160,120,200,0.9)",
            why: "スピリチュアル・テクノというジャンルは、日本の瞑想・wellness・マインドフルネス層と親和性が高い。神道儀式のオープニングから繋ぐトーンとして最適で、日本人が「このイベントは深い」と感じる世界観を作ってくれる。",
            what: "WhoMadeWhoへの橋渡し役。深夜に向かって会場の温度を上げる。バニヤンの空気感と最も合う音楽性。",
            fee: "$45,000（確定）",
          },
        ].map((a, i) => (
          <R key={a.name} delay={i * 0.1}>
            <div style={{ padding: "28px 24px", borderTop: `2px solid ${a.color}`, background: "rgba(255,255,255,0.025)", marginBottom: 16, borderRadius: 2 }}>
              <p style={{ fontSize: 10, letterSpacing: "0.4em", color: a.color, marginBottom: 6 }}>{a.origin}</p>
              <h3 className="font-display" style={{ fontSize: "clamp(1.4rem,4vw,2rem)", color: "#fff", marginBottom: 16 }}>{a.name}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.9, color: muted, marginBottom: 12 }}><strong style={{ color: "rgba(255,255,255,0.7)" }}>なぜ：</strong> {a.why}</p>
              <p style={{ fontSize: 13, lineHeight: 1.9, color: muted, marginBottom: 12 }}><strong style={{ color: "rgba(255,255,255,0.7)" }}>何をする：</strong> {a.what}</p>
              <p style={{ fontSize: 11, color: dimmed, letterSpacing: "0.15em" }}>出演料 : {a.fee}</p>
            </div>
          </R>
        ))}
      </Section>

      {/* ══════════════════════════════════════════════
          S5 — THE EXPERIENCE  (audio zone 5)
      ══════════════════════════════════════════════ */}
      <Section bg="radial-gradient(ellipse at 50% 100%, rgba(201,169,98,0.07), #080808)">
        <R>
          <p style={{ fontSize: 10, letterSpacing: "0.45em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>THE EXPERIENCE</p>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>
            300機のドローン。<br /><span style={{ color: gold }}>一本の木。</span>
          </h2>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 24 }} />
        </R>
        <R delay={0.1}>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", lineHeight: 2, color: muted, maxWidth: 640, marginBottom: 8 }}>
            WhoMadeWhoのピーク時、300機のドローンが空に浮かびバニヤンの樹形を描く。
            5,850人が同時に上を向く。この瞬間が、このイベントの「コア」です。
          </p>
        </R>
        <CinematicImg src="/images/fest/drones.jpg" alt="300 drones forming banyan tree silhouette" caption="300機のドローン · バニヤン樹形フォーメーション · WhoMadeWhoピーク時" />
        <CinematicImg src="/images/fest/pianist.jpg" alt="Pianist memorial under banyan tree" caption="坂本龍一追悼演奏 · DJ Nobu特設ステージ · 星空の下" />
      </Section>

      {/* ══════════════════════════════════════════════
          S6 — P&L  (audio zone 6)
      ══════════════════════════════════════════════ */}
      <Section bg="#060606">
        <R>
          <p style={{ fontSize: 10, letterSpacing: "0.45em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>FINANCIALS</p>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, color: "#fff", marginBottom: 16 }}>
            帳簿は黒字。<br /><span style={{ color: gold }}>問題は順番だ。</span>
          </h2>
          <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 20 }} />
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.05rem)", lineHeight: 1.9, color: muted, maxWidth: 620, marginBottom: 40 }}>
            イベント全体の収支は黒字になる試算です。課題はキャッシュフローの順番——
            チケット収入が入る前に、先払いしなければならないお金がある。
            そこさえ解決すれば、<strong style={{ color: "#fff" }}>このイベントは回ります。</strong>
          </p>
        </R>

        {/* ── HEADLINE METRICS ── */}
        <R delay={0.05}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2, marginBottom: 40 }}>
            {[
              { label: "総収入 (予測)", v: fmt(totalRevenue), c: "rgba(74,222,128,0.9)", sub: "5,000人動員ベース" },
              { label: "総支出", v: fmt(totalExpense), c: "rgba(255,100,100,0.8)", sub: "予備費10%込み" },
              { label: "純利益", v: fmt(netProfit), c: gold, sub: "黒字確定ライン" },
            ].map(k => (
              <div key={k.label} style={{ textAlign: "center", padding: "24px 12px", background: "rgba(255,255,255,0.025)", borderLeft: `1px solid rgba(255,255,255,0.06)` }}>
                <p className="font-display" style={{ fontSize: "clamp(1.4rem,4vw,2rem)", color: k.c, marginBottom: 4 }}>{k.v}</p>
                <p style={{ fontSize: 11, color: "#fff", marginBottom: 4 }}>{k.label}</p>
                <p style={{ fontSize: 10, color: dimmed }}>{k.sub}</p>
              </div>
            ))}
          </div>
        </R>

        {/* ── CASH FLOW CHALLENGE ── */}
        <R delay={0.08}>
          <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>CASH FLOW — イベント前に必要なお金</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
            {/* 先払い */}
            <div style={{ border: "1px solid rgba(255,100,100,0.2)", background: "rgba(255,100,100,0.03)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,100,100,0.15)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(255,100,100,0.7)" }}>先払い必要額</p>
              </div>
              {[
                ["アーティストデポジット (50%)", 65000],
                ["制作・音響デポジット (50%)", 90000],
                ["保険（全額前払い）", 43000],
                ["Zamna前払い（要確認）", 55000],
                ["運営・マーケ初期費用", 47000],
              ].map(([label, amt]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "7px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: 8 }}>
                  <span style={{ fontSize: 11, color: muted }}>{label as string}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,100,100,0.7)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmt(amt as number)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "rgba(255,100,100,0.07)" }}>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>合計</span>
                <span style={{ fontSize: 12, color: "rgba(255,100,100,0.9)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(upfront)}</span>
              </div>
            </div>
            {/* 先行回収 */}
            <div style={{ border: "1px solid rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.03)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(74,222,128,0.15)" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(74,222,128,0.7)" }}>先行回収（開幕6ヶ月前〜）</p>
              </div>
              {[
                ["GA早期販売 (30% × 5,000枚)", 180000],
                ["VIPパッケージ早期申込", 100000],
              ].map(([label, amt]) => (
                <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "7px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", gap: 8 }}>
                  <span style={{ fontSize: 11, color: muted }}>{label as string}</span>
                  <span style={{ fontSize: 11, color: "rgba(74,222,128,0.7)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmt(amt as number)}</span>
                </div>
              ))}
              <div style={{ padding: "7px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ fontSize: 11, color: dimmed }}>（F&Bベンダー保証金なども加算可）</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", background: "rgba(74,222,128,0.07)" }}>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>合計</span>
                <span style={{ fontSize: 12, color: "rgba(74,222,128,0.9)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{fmt(presales)}</span>
              </div>
            </div>
          </div>
          {/* Net bridge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, padding: "12px 16px", background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.2)", marginBottom: 40 }}>
            <span style={{ fontSize: 12, color: muted }}>先払い {fmt(upfront)} − 先行回収 {fmt(presales)} =</span>
            <span className="font-display" style={{ fontSize: "1.4rem", color: gold }}>純ブリッジ必要額 {fmt(bridgeNeeded)}〜$100K</span>
          </div>
        </R>

        {/* ── FUNDING STRUCTURE ── */}
        <R delay={0.12}>
          <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>FUNDING STRUCTURE — どう揃えるか</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 40 }}>
            {[
              {
                step: "01",
                title: "Yukiがブリッジとして入れる",
                amount: "up to $200K",
                note: "エクイティ or 貸付——先行販売が始まれば回収できる。スポンサーを連れてくる形でもOK。",
                c: gold,
                status: "AVAILABLE",
              },
              {
                step: "02",
                title: "スポンサー枠 $170K（収入として計上済み）",
                amount: "$170K",
                note: "投資家ではなく「ハワイを訪れる日本人富裕層5,000人へのブランド露出権」として販売。ANA・JAL・ハワイアン航空 / JTB・HIS / 三越伊勢丹・高島屋 / LEXUS・BMW Japan / 国産ウィスキー・日本酒ブランド——全て「日本人×ハワイ×高所得層」に予算を持っている企業。",
                c: "rgba(74,222,128,0.8)",
                status: "SELL AS MARKETING",
              },
              {
                step: "03",
                title: "先行チケット販売（6ヶ月前〜）",
                amount: "~$280K",
                note: "イベント発表と同時にプレセール開始。これが動けばブリッジは最小化できる。",
                c: "rgba(150,200,255,0.8)",
                status: "PRESALE",
              },
            ].map(f => (
              <div key={f.step} style={{ display: "flex", gap: 0, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
                <div style={{ width: 4, background: f.c, flexShrink: 0 }} />
                <div style={{ padding: "16px 20px", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span className="font-display" style={{ fontSize: "0.8rem", color: f.c }}>{f.step}</span>
                      <span style={{ fontSize: "0.95rem", color: "#fff" }}>{f.title}</span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p className="font-display" style={{ fontSize: "1rem", color: f.c }}>{f.amount}</p>
                      <p style={{ fontSize: 9, letterSpacing: "0.2em", color: f.c, opacity: 0.7 }}>{f.status}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: muted, lineHeight: 1.7, paddingLeft: 28 }}>{f.note}</p>
                </div>
              </div>
            ))}
            {/* Result row */}
            <div style={{ padding: "14px 24px", background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <p style={{ fontSize: "0.9rem", color: muted }}>
                → この3つが揃えば、<strong style={{ color: "#fff" }}>外部の機関投資家は不要。</strong>
                周囲への声かけとスポンサー提案で完結できる規模感。
              </p>
              <p className="font-display" style={{ fontSize: "1.1rem", color: gold, whiteSpace: "nowrap" }}>自己完結型</p>
            </div>
          </div>
        </R>

        {/* ── KEY UNKNOWN ── */}
        <R delay={0.15}>
          <div style={{ padding: "20px 24px", border: "1px solid rgba(255,180,50,0.3)", background: "rgba(255,180,50,0.04)", marginBottom: 40 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(255,180,50,0.7)", marginBottom: 10 }}>⚠ KEY UNKNOWN — 最優先確認事項</p>
            <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: muted }}>
              <strong style={{ color: "#fff" }}>Zamnaライセンス料 $221K（売上の15%）</strong> の中身が未確定。
              これが「ブランド使用料のみ」なのか「制作・演出費込み」なのかで、
              実質的な制作コストが大きく変わる。<br />
              <strong style={{ color: "#fff" }}>ここを確認するだけで必要ブリッジ額が$100K単位で変わります。</strong>
            </p>
          </div>
        </R>

        {/* ── FULL P&L DETAIL ── */}
        <R delay={0.18}>
          <p style={{ fontSize: 11, letterSpacing: "0.35em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>FULL P&L DETAIL</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(74,222,128,0.6)", marginBottom: 10 }}>収入内訳</p>
              <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {REVENUE.map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", background: i % 2 ? "transparent" : "rgba(255,255,255,0.015)", gap: 8 }}>
                    <span style={{ fontSize: 11, color: muted, flex: 1 }}>{r.label}</span>
                    <span style={{ fontSize: 11, color: "rgba(74,222,128,0.7)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmt(r.amount)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "rgba(74,222,128,0.06)", fontWeight: 700 }}>
                  <span style={{ fontSize: 11, color: "#fff" }}>合計</span>
                  <span style={{ fontSize: 11, color: "rgba(74,222,128,0.9)", fontVariantNumeric: "tabular-nums" }}>{fmt(totalRevenue)}</span>
                </div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(255,100,100,0.6)", marginBottom: 10 }}>支出内訳</p>
              <div style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                {EXPENSES.map((e, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px", background: i % 2 ? "transparent" : "rgba(255,255,255,0.015)", gap: 8 }}>
                    <span style={{ fontSize: 11, color: muted, flex: 1 }}>{e.label}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,100,100,0.65)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmt(e.amount)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", background: "rgba(255,100,100,0.06)", fontWeight: 700 }}>
                  <span style={{ fontSize: 11, color: "#fff" }}>合計</span>
                  <span style={{ fontSize: 11, color: "rgba(255,100,100,0.8)", fontVariantNumeric: "tabular-nums" }}>{fmt(totalExpense)}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ padding: "12px 24px", background: "rgba(201,169,98,0.06)", border: "1px solid rgba(201,169,98,0.2)", display: "flex", gap: 24, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: muted }}>純利益</span>
              <span className="font-display" style={{ fontSize: "1.4rem", color: gold, fontVariantNumeric: "tabular-nums" }}>{fmt(netProfit)}</span>
            </div>
          </div>
        </R>
      </Section>

      {/* ══════════════════════════════════════════════
          S7 — YOUR TURN  (audio zone 7)
      ══════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", background: "#000", overflow: "hidden", padding: "120px 24px" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/images/fest/crowd.jpg" alt="" fill style={{ objectFit: "cover", opacity: 0.1 }} sizes="100vw" />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7), rgba(0,0,0,0.97))" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.45em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>YOUR TURN</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, color: "#fff", marginBottom: 24 }}>
              皆さんの意見を<br /><span style={{ color: gold }}>素直に聞かせてください。</span>
            </h2>
            <div style={{ width: 36, height: 2, background: "rgba(201,169,98,0.5)", marginBottom: 40 }} />
          </R>

          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.1rem)", lineHeight: 2, color: muted, marginBottom: 36, maxWidth: 600 }}>
              このドキュメントは提案です。決定事項じゃない。
              特に以下の点について、率直な意見が欲しいです。
            </p>
          </R>

          <R delay={0.15}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              {[
                { n: "01", q: "日程変更（9月4日 → 10月31日）は現実的ですか？すでに確定しているものへの影響は？" },
                { n: "02", q: "「ハワイに来る日本人富裕層」をメインターゲットにすることへの合意は取れますか？この方針でSean・チームは動けますか？" },
                { n: "03", q: "DJ Nobu（日本アンカー）→ Mathame → WhoMadeWhoのラインナップ。日本人を集めるという観点で十分と思いますか？" },
                { n: "04", q: "スポンサー営業：ANA・JTB・三越伊勢丹・国産ウィスキーブランドへのアプローチは誰が担当できますか？コネクションはありますか？" },
                { n: "05", q: "Brutus・Casa Brutus・Nikkei Weekend・Vogue Japanなどメディアへのパイプ。チームの中に持っている人はいますか？" },
              ].map(item => (
                <div key={item.n} style={{ display: "flex", gap: 16, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.015)" }}>
                  <span className="font-display" style={{ fontSize: "0.85rem", color: gold, flexShrink: 0, paddingTop: 2 }}>{item.n}</span>
                  <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: muted }}>{item.q}</p>
                </div>
              ))}
            </div>
          </R>

          <R delay={0.25}>
            <div style={{ borderLeft: `3px solid rgba(201,169,98,0.3)`, paddingLeft: 24, marginBottom: 40 }}>
              <p style={{ fontSize: "clamp(0.95rem,2vw,1.05rem)", lineHeight: 2, color: muted }}>
                批判でも全力で歓迎します。「これは無理」「この部分は現実的じゃない」という意見こそ聞きたい。
                フラットに話しましょう。
              </p>
              <p style={{ fontSize: "0.9rem", color: dimmed, marginTop: 12, fontStyle: "italic" }}>— Yuki</p>
            </div>
          </R>

          <R delay={0.3}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="https://zamnahawaii.ticketblox.com" target="_blank" rel="noreferrer"
                style={{ padding: "12px 24px", background: gold, color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                チケットページ →
              </a>
              <Link href="/budget" style={{ padding: "12px 24px", border: "1px solid rgba(201,169,98,0.3)", color: gold, fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                詳細 P&L →
              </Link>
              <Link href="/vision-ja" style={{ padding: "12px 24px", border: "1px solid rgba(255,255,255,0.1)", color: dimmed, fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                ビジュアル版 →
              </Link>
            </div>
          </R>
        </div>
      </section>

    </main>
  );
}
