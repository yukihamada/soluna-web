"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

/* ─── Background embers ───────────────────────────────────── */
function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.4 - 0.1, a: Math.random() * 0.4 + 0.05, da: (Math.random() - 0.5) * 0.002,
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,98,${Math.max(0, Math.min(1, p.a))})`; ctx.fill();
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.a <= 0 || p.y < -10) { p.x = Math.random() * c.width; p.y = c.height + 5; p.a = 0.05; }
        if (p.a > 0.6) p.da *= -1;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

/* ─── Scroll reveal ───────────────────────────────────────── */
function R({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── Stat card ───────────────────────────────────────────── */
function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{ padding: "18px 16px", textAlign: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}>
      <p className="font-display" style={{ fontSize: "clamp(1.4rem,4vw,2rem)", color: "var(--gold)", marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>{label}</p>
      {sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

/* ─── Phase block ─────────────────────────────────────────── */
function Phase({ n, title, body, active }: { n: string; title: string; body: string; active?: boolean }) {
  return (
    <div style={{
      padding: "22px 20px",
      background: active ? "rgba(201,169,98,0.07)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? "rgba(201,169,98,0.3)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 8,
      position: "relative",
    }}>
      {active && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "var(--gold)", borderRadius: "8px 0 0 8px" }} />}
      <p style={{ fontSize: 9, letterSpacing: "0.5em", color: active ? "var(--gold)" : "rgba(255,255,255,0.2)", marginBottom: 8 }}>{n}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 7, lineHeight: 1.4 }}>{title}</p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{body}</p>
    </div>
  );
}

/* ─── Property row ────────────────────────────────────────── */
function Prop({ name, location, revenue, entry, status }: {
  name: string; location: string; revenue: string; entry: string; status: "稼働中" | "開発中";
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{name}</p>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{location}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ color: "var(--gold)", fontSize: 12, fontWeight: 700 }}>{revenue}</p>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{entry}/口</p>
      </div>
      <span style={{
        padding: "2px 8px", borderRadius: 999, fontSize: 9, fontWeight: 700,
        background: status === "稼働中" ? "rgba(74,222,128,0.1)" : "rgba(201,169,98,0.1)",
        color: status === "稼働中" ? "rgba(74,222,128,0.9)" : "var(--gold)",
        border: `1px solid ${status === "稼働中" ? "rgba(74,222,128,0.2)" : "rgba(201,169,98,0.2)"}`,
        flexShrink: 0,
      }}>{status}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DESKTOP WRAPPER
═══════════════════════════════════════════════════════════ */
export default function OsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "radial-gradient(ellipse 160% 100% at 60% -10%, rgba(30,20,8,1) 0%, #060606 55%)",
      overflow: "hidden",
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>
      <Embers />

      {/* ── macOS menubar ─────────────────────────────────── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 28, zIndex: 200,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span className="font-display" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: "0.2em" }}>SOLUNA</span>
          {["File","View","Help"].map(m => (
            <span key={m} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", cursor: "default" }}>{m}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Clock />
        </div>
      </div>

      {/* ── Main window ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={mounted ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(820px, calc(100vw - 32px))",
          height: "calc(100vh - 80px)",
          marginTop: 14,
          background: "rgba(14,14,14,0.92)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.08)",
          zIndex: 100,
        }}
      >
        {/* Window title bar */}
        <div style={{
          height: 40, flexShrink: 0,
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", padding: "0 16px", gap: 8,
        }}>
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6 }}>
            <Link href="/" style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", display: "block", textDecoration: "none" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          <p style={{ flex: 1, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
            SOLUNA — プラットフォーム
          </p>
          <div style={{ width: 42 }} />
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 48px" }}>

          {/* HERO */}
          <R>
            <p style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 16 }}>
              SOLUNA OS · SHARED SPACES PLATFORM
            </p>
            <h1 className="font-display" style={{ fontSize: "clamp(2.4rem,8vw,4.5rem)", lineHeight: 0.92, marginBottom: 20 }}>
              場所を、<br />
              <span style={{ color: "var(--gold)" }}>分かち合う。</span>
            </h1>
            <p style={{ fontSize: "clamp(0.9rem,2vw,1.05rem)", color: "rgba(255,255,255,0.45)", lineHeight: 1.85, maxWidth: 520, marginBottom: 32 }}>
              空き家という名の資産が、日本全国に900万戸眠っている。<br />
              SOLUNAは、それをあなたの居場所に変える。
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/buy" style={{ padding: "11px 28px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                オーナーになる
              </Link>
              <Link href="/community" style={{ padding: "11px 28px", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.8)", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                コミュニティ
              </Link>
            </div>
          </R>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "36px 0" }} />

          {/* NUMBERS */}
          <R>
            <p style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(201,169,98,0.4)", marginBottom: 16 }}>TRACK RECORD</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
              <Stat value="¥2,200万" label="TAPKOP 年間売上" sub="北海道弟子屈" />
              <Stat value="¥1,800万" label="WHITE HOUSE 年間売上" sub="熱海" />
              <Stat value="¥1,000万" label="THE LODGE 年間売上" sub="北海道弟子屈" />
              <Stat value="10.7ha" label="SOLUNA VILLAGE" sub="弟子屈 開発着手" />
            </div>
          </R>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "36px 0" }} />

          {/* THE PROBLEM */}
          <R>
            <p style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(201,169,98,0.4)", marginBottom: 14 }}>THE SITUATION</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", lineHeight: 0.95, marginBottom: 18 }}>
              日本の不動産は、<br /><span style={{ color: "var(--gold)" }}>15%しか動かない。</span>
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.85, maxWidth: 560, marginBottom: 24 }}>
              アメリカでは中古住宅流通率が80%。日本はわずか15%。
              毎年13万戸が新たに空き家になりながら、そのほとんどは
              売るにも貸すにも「出口がない」まま朽ちていく。
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[
                { n: "900万戸", d: "全国の空き家数（2024年）" },
                { n: "13万戸", d: "毎年増える空き家" },
                { n: "15%", d: "中古住宅流通率（米国の1/5）" },
              ].map(s => (
                <div key={s.n} style={{ padding: "16px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <p className="font-display" style={{ fontSize: "1.5rem", color: "var(--gold)", marginBottom: 6 }}>{s.n}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </R>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "36px 0" }} />

          {/* THE MODEL */}
          <R>
            <p style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(201,169,98,0.4)", marginBottom: 14 }}>OUR APPROACH</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", lineHeight: 0.95, marginBottom: 18 }}>
              負債を、<br /><span style={{ color: "var(--gold)" }}>ライフスタイルに変える。</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Phase n="PHASE 01 · 今ここ" title="プルーフ・オブ・ライフスタイル"
                body="弟子屈、熱海、ハワイ。自分が住みたいと思う場所だけを選んで、自分で経営してきた。犬とサウナと柔術。それがそのままブランドになった。Airbnb Superhost 10年の実績が信頼の土台。" active />
              <Phase n="PHASE 02 · 進行中" title="テックで管理コストをゼロに近づける"
                body="KAGI（スマートホーム）+ PON（電子契約）+ 予約API — 離れた物件を1人で回せるスタックを自社で作った。このテックを外部空き家オーナーにも提供し始めている。" />
              <Phase n="PHASE 03 · 次のステップ" title="あなたの空き家を、誰かの楽園に"
                body="プラットフォームが整ったとき、物件を持つオーナーは「SOLUNAに乗せる」だけでよくなる。発掘・共同所有の組成・運営・収益分配まで、全てワンストップで回る。" />
            </div>
          </R>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "36px 0" }} />

          {/* PROPERTIES */}
          <R>
            <p style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(201,169,98,0.4)", marginBottom: 14 }}>PORTFOLIO</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", lineHeight: 0.95, marginBottom: 22 }}>
              いまの場所たち。
            </h2>
            <div>
              <Prop name="TAPKOP" location="北海道弟子屈 · PAN-PROJECTS設計" revenue="年間¥2,200万" entry="¥780万" status="稼働中" />
              <Prop name="WHITE HOUSE" location="静岡県熱海市" revenue="年間¥1,800万" entry="¥240万" status="稼働中" />
              <Prop name="THE LODGE" location="北海道弟子屈" revenue="年間¥1,000万" entry="¥78万" status="稼働中" />
              <Prop name="THE NEST" location="北海道弟子屈 · VUILD×BIOTOPE" revenue="準備中" entry="¥240万" status="開発中" />
              <Prop name="SOLUNA VILLAGE" location="北海道弟子屈 · 10.7ha" revenue="coming soon" entry="¥320万" status="開発中" />
              <Prop name="HAWAII BEACH HOUSE" location="オアフ島" revenue="—" entry="特典" status="稼働中" />
            </div>
            <Link href="/materials" style={{ display: "inline-block", marginTop: 14, fontSize: 12, color: "var(--gold)", textDecoration: "none" }}>全物件を見る →</Link>
          </R>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "36px 0" }} />

          {/* WHY SOLUNA */}
          <R>
            <p style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(201,169,98,0.4)", marginBottom: 14 }}>MOAT</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", lineHeight: 0.95, marginBottom: 22 }}>
              なぜ SOLUNAか。
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 10 }}>
              {[
                { icon: "🥋", t: "創業者の生活がプロダクト", b: "犬・サウナ・柔術・北海道の森。実際の生活が選定基準。これは8年では作れない。" },
                { icon: "🔧", t: "テックスタック全部自社", b: "KAGI・PON・予約API — ゼロから自作。新規参入組は2〜3年遅れる。" },
                { icon: "🏠", t: "Superhost 10年のデータ", b: "TAPKOP ¥2,200万/年は証明済みのGMV。「いつか」ではなく、もう動いている。" },
                { icon: "🌊", t: "ハワイという「憧れ」", b: "日本物件オーナーにはハワイの居場所が自然についてくる。価格表には出ない価値。" },
              ].map(w => (
                <div key={w.t} style={{ padding: "20px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <p style={{ fontSize: 22, marginBottom: 10 }}>{w.icon}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 7 }}>{w.t}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{w.b}</p>
                </div>
              ))}
            </div>
          </R>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "36px 0" }} />

          {/* ROADMAP */}
          <R>
            <p style={{ fontSize: 9, letterSpacing: "0.5em", color: "rgba(201,169,98,0.4)", marginBottom: 14 }}>2030</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", lineHeight: 0.95, marginBottom: 22 }}>
              2030年の景色。
            </h2>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {[
                { y: "2026", l: "プラットフォームの土台を作る", b: "弟子屈ビレッジ建設、KAGI/PONの外部提供開始、初の空き家転換物件を組成。" },
                { y: "2027〜28", l: "空き家を本格的に転換する", b: "全国10〜30件の空き家をSOLUNA形式でリノベ＆共同所有化。オーナー1,000名へ。" },
                { y: "2029〜30", l: "場所が人を呼ぶ循環が生まれる", b: "500拠点・1万名のコミュニティ。オーナーが次のオーナーを呼ぶ。" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 20, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <p style={{ width: 72, flexShrink: 0, fontSize: 10, color: "var(--gold)", fontWeight: 600, paddingTop: 2 }}>{r.y}</p>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 5 }}>{r.l}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>{r.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </R>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "36px 0" }} />

          {/* CTA */}
          <R>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,6vw,3.5rem)", lineHeight: 0.92, marginBottom: 18 }}>
              一緒に作ろう。
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.85, marginBottom: 28 }}>
              オーナーとして参加する。空き家を持っている。<br />
              テックで一緒に作りたい。どんな形でも、話を聞く。
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/buy" style={{ padding: "12px 32px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                物件を見る
              </Link>
              <Link href="/community" style={{ padding: "12px 32px", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.8)", fontSize: 11, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                コミュニティに入る
              </Link>
            </div>
          </R>

          <div style={{ height: 40 }} />
        </div>
      </motion.div>

      {/* ── Dock ──────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 8, left: "50%", transform: "translateX(-50%)",
        background: "rgba(255,255,255,0.08)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18,
        padding: "8px 14px", display: "flex", gap: 4, zIndex: 200,
      }}>
        {[
          { icon: "🏠", label: "Home",    href: "/" },
          { icon: "🏡", label: "物件",    href: "/materials" },
          { icon: "💰", label: "購入",    href: "/buy" },
          { icon: "💬", label: "コミュ",  href: "/community" },
          { icon: "🎫", label: "チケット", href: "/tickets" },
        ].map(d => (
          <Link key={d.href} href={d.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 10, textDecoration: "none", transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <span style={{ fontSize: "1.8rem", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}>{d.icon}</span>
            <span style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.55)" }}>{d.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Clock ───────────────────────────────────────────────── */
function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Tokyo" }) + " JST");
    tick(); const id = setInterval(tick, 10000); return () => clearInterval(id);
  }, []);
  return <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>{t}</span>;
}
