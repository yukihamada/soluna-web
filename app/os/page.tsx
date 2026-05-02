"use client";

import { useRef, useEffect } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

/* ─── Ember canvas ────────────────────────────────────────── */
function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.5 - 0.15, a: Math.random() * 0.5 + 0.1, da: (Math.random() - 0.5) * 0.003,
    }));
    let id: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,169,98,${Math.max(0, Math.min(1, p.a))})`; ctx.fill();
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.a <= 0 || p.y < -10) { p.x = Math.random() * c.width; p.y = c.height + 5; p.a = Math.random() * 0.3 + 0.05; }
        if (p.a > 0.7) p.da *= -1;
      });
      id = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.6 }} />;
}

/* ─── Scroll reveal ───────────────────────────────────────── */
function R({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

/* ─── Progress bar ────────────────────────────────────────── */
function Bar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return <motion.div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: "var(--gold)", scaleX, transformOrigin: "0%", zIndex: 100 }} />;
}

/* ─── Stat card ───────────────────────────────────────────── */
function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="card" style={{ padding: "22px 20px", textAlign: "center" }}>
      <p className="font-display" style={{ fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "var(--gold)", marginBottom: 6 }}>{value}</p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: sub ? 4 : 0 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
    </div>
  );
}

/* ─── Phase block ─────────────────────────────────────────── */
function Phase({ n, title, body, active }: { n: string; title: string; body: string; active?: boolean }) {
  return (
    <div style={{
      padding: "28px 24px",
      background: active ? "linear-gradient(135deg,rgba(201,169,98,0.1),rgba(201,169,98,0.03))" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? "rgba(201,169,98,0.35)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 4,
      position: "relative",
    }}>
      <p style={{ fontSize: 10, letterSpacing: "0.5em", color: active ? "var(--gold)" : "rgba(255,255,255,0.2)", marginBottom: 10 }}>{n}</p>
      <p style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.4 }}>{title}</p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>{body}</p>
      {active && (
        <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: "var(--gold)", borderRadius: "4px 0 0 4px" }} />
      )}
    </div>
  );
}

/* ─── Property row ────────────────────────────────────────── */
function Prop({ name, location, revenue, entry, status }: { name: string; location: string; revenue: string; entry: string; status: "稼働中" | "開発中" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{name}</p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{location}</p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700 }}>{revenue}</p>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{entry} / 口</p>
      </div>
      <div style={{
        padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 600,
        background: status === "稼働中" ? "rgba(74,222,128,0.12)" : "rgba(201,169,98,0.12)",
        color: status === "稼働中" ? "rgba(74,222,128,0.9)" : "var(--gold)",
        border: `1px solid ${status === "稼働中" ? "rgba(74,222,128,0.2)" : "rgba(201,169,98,0.25)"}`,
        flexShrink: 0,
      }}>{status}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function OsPage() {
  return (
    <main style={{ background: "#080808", color: "#fff", overflowX: "hidden" }}>
      <Bar />

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="top-nav">
        <Link href="/" className="font-display" style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, letterSpacing: "0.3em", textDecoration: "none" }}>SOLUNA</Link>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="nav-pill-active">プラットフォーム</span>
          <Link href="/materials" className="nav-pill">物件</Link>
          <Link href="/buy" className="nav-pill">購入</Link>
          <Link href="/community" className="nav-pill">コミュニティ</Link>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <Embers />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760, padding: "0 28px", textAlign: "center" }}>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.3 }}
            style={{ fontSize: 10, letterSpacing: "0.6em", color: "rgba(201,169,98,0.5)", marginBottom: 28, textTransform: "uppercase" }}>
            SOLUNA OS · SHARED SPACES PLATFORM
          </motion.p>

          <motion.h1
            className="font-display"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: "clamp(3rem,11vw,7.5rem)", lineHeight: 0.92, marginBottom: 36 }}>
            場所を、<br />
            <span style={{ color: "var(--gold)" }}>分かち合う。</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1 }}
            style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", color: "rgba(255,255,255,0.45)", lineHeight: 1.9, maxWidth: 560, margin: "0 auto 52px" }}>
            空き家という名の資産が、日本全国に900万戸眠っている。<br />
            SOLUNAは、それをあなたの居場所に変える。
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.6 }}
            style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/buy" style={{ padding: "14px 36px", background: "var(--gold)", color: "#000", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textDecoration: "none", borderRadius: 2 }}>
              オーナーになる
            </Link>
            <a href="#model" style={{ padding: "14px 36px", border: "1px solid rgba(201,169,98,0.3)", color: "rgba(201,169,98,0.8)", fontSize: 11, letterSpacing: "0.25em", textDecoration: "none", borderRadius: 2 }}>
              仕組みを見る
            </a>
          </motion.div>
        </div>
      </section>

      {/* ══ NUMBERS ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 32, textAlign: "center" }}>
              TRACK RECORD · 実績
            </p>
          </R>
          <R delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              <Stat value="¥2,200万" label="TAPKOP 年間売上" sub="北海道弟子屈 · 稼働中" />
              <Stat value="¥1,800万" label="WHITE HOUSE 年間売上" sub="熱海 · 稼働中" />
              <Stat value="¥1,000万" label="THE LODGE 年間売上" sub="北海道弟子屈 · 稼働中" />
              <Stat value="10.7ha" label="SOLUNA VILLAGE" sub="弟子屈 · 開発着手" />
            </div>
          </R>
        </div>
      </section>

      <div className="gdivider" style={{ maxWidth: 760, margin: "0 auto" }} />

      {/* ══ THE PROBLEM ══════════════════════════════════════ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 20 }}>THE SITUATION</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4.5rem)", lineHeight: 0.95, marginBottom: 28 }}>
              日本の不動産は、<br />
              <span style={{ color: "var(--gold)" }}>15%しか動かない。</span>
            </h2>
          </R>
          <R delay={0.1}>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", color: "rgba(255,255,255,0.5)", lineHeight: 1.9, maxWidth: 600, marginBottom: 32 }}>
              アメリカでは中古住宅流通率が80%。日本はわずか15%。
              差の多くは「使われない場所」として沈んでいる。
              毎年13万戸が新たに空き家になりながら、そのほとんどは
              売るにも貸すにも「出口がない」まま朽ちていく。
            </p>
          </R>
          <R delay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {[
                { n: "900万戸", d: "全国の空き家数（2024年・過去最多）" },
                { n: "13万戸", d: "毎年新たに増える空き家" },
                { n: "15%", d: "日本の中古住宅流通率（米国の1/5）" },
              ].map(s => (
                <div key={s.n} className="card" style={{ padding: "20px 18px" }}>
                  <p className="font-display" style={{ fontSize: "2rem", color: "var(--gold)", marginBottom: 8 }}>{s.n}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{s.d}</p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      <div className="gdivider" style={{ maxWidth: 760, margin: "0 auto" }} />

      {/* ══ THE ANSWER ═══════════════════════════════════════ */}
      <section id="model" style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 20 }}>OUR APPROACH</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4.5rem)", lineHeight: 0.95, marginBottom: 28 }}>
              負債を、<br />
              <span style={{ color: "var(--gold)" }}>ライフスタイルに変える。</span>
            </h2>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", color: "rgba(255,255,255,0.5)", lineHeight: 1.9, maxWidth: 580, marginBottom: 48 }}>
              SOLUNAのやることはシンプルだ。空き家を発掘し、コミュニティで磨き、
              複数人で分けて持つ。管理はKAGI（スマートホームシステム）に任せ、
              契約はPON（電子署名）で完結する。全部、自社で作った。
            </p>
          </R>
          <R delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Phase
                n="PHASE 01 · 今ここ"
                title="プルーフ・オブ・ライフスタイル"
                body="弟子屈、熱海、ハワイ。自分が住みたいと思う場所だけを選んで、自分で経営してきた。犬とサウナと柔術。それがそのままブランドになった。Airbnb Superhost 10年の実績が、信頼の土台。"
                active
              />
              <Phase
                n="PHASE 02 · 進行中"
                title="テックで管理コストをゼロに近づける"
                body="空き家オーナーの最大の悩みは「管理できない」こと。KAGIのスマートホーム管理 + PONの電子契約 + SOLUNAの予約APIで、離れた物件を1人で回せるようにする。このスタックを外部オーナーにも提供し始めている。"
              />
              <Phase
                n="PHASE 03 · 次のステップ"
                title="あなたの空き家を、誰かの楽園に"
                body="SOLUNAのプラットフォームが整ったとき、物件を持つオーナーは「SOLUNAに乗せる」だけでよくなる。場所の発掘、共同所有の組成、運営、収益分配まで、全てがワンストップで回る。"
              />
            </div>
          </R>
        </div>
      </section>

      <div className="gdivider" style={{ maxWidth: 760, margin: "0 auto" }} />

      {/* ══ PROPERTIES ═══════════════════════════════════════ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 20 }}>PORTFOLIO · 物件ラインナップ</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, marginBottom: 36 }}>
              いまの場所たち。
            </h2>
          </R>
          <R delay={0.1}>
            <div>
              <Prop name="TAPKOP" location="北海道弟子屈町 · PAN-PROJECTS設計" revenue="年間¥2,200万" entry="¥780万" status="稼働中" />
              <Prop name="WHITE HOUSE" location="静岡県熱海市" revenue="年間¥1,800万" entry="¥240万" status="稼働中" />
              <Prop name="THE LODGE" location="北海道弟子屈町" revenue="年間¥1,000万" entry="¥78万" status="稼働中" />
              <Prop name="THE NEST" location="北海道弟子屈町 · VUILD×BIOTOPE" revenue="準備中" entry="¥240万" status="開発中" />
              <Prop name="SOLUNA VILLAGE" location="北海道弟子屈町 · 10.7ha" revenue="coming soon" entry="¥320万" status="開発中" />
              <Prop name="HAWAII BEACH HOUSE" location="オアフ島" revenue="—" entry="オーナー特典" status="稼働中" />
            </div>
            <div style={{ paddingTop: 16 }}>
              <Link href="/materials" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none", letterSpacing: "0.1em" }}>
                全物件を見る →
              </Link>
            </div>
          </R>
        </div>
      </section>

      <div className="gdivider" style={{ maxWidth: 760, margin: "0 auto" }} />

      {/* ══ WHY SOLUNA WINS ══════════════════════════════════ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 20 }}>WHAT OTHERS CAN'T REPLICATE</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, marginBottom: 36 }}>
              なぜ SOLUNAか。
            </h2>
          </R>
          <R delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {[
                {
                  icon: "🥋",
                  title: "創業者の生活がプロダクト",
                  body: "犬、サウナ、柔術、北海道の森。濱田優貴が実際に生きているライフスタイルが、そのまま場所の選定基準になっている。これは8年では作れない。一生かけて作るものだ。",
                },
                {
                  icon: "🔧",
                  title: "テックスタックを全部自社で持つ",
                  body: "KAGI（スマートホーム）、PON（電子契約）、予約API——これらは全てゼロから自分たちで作った。空き家SaaS系の新規参入組は、ここで2〜3年遅れる。",
                },
                {
                  icon: "🏠",
                  title: "Superhost 10年分の運営データ",
                  body: "TAPKOP年間¥2,200万という数字は証明済みのGMV。「いつかスケールする」ではなく、もう動いている。資金調達の説得ではなく、事実で語れる。",
                },
                {
                  icon: "🌊",
                  title: "ハワイという「憧れ」の資産",
                  body: "日本物件のオーナーには「ハワイにも居場所がある」という特典が自然についてくる。これは価格比較表には出ない価値だ。",
                },
              ].map(w => (
                <div key={w.title} className="card" style={{ padding: "24px 20px" }}>
                  <p style={{ fontSize: 28, marginBottom: 12 }}>{w.icon}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{w.title}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>{w.body}</p>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      <div className="gdivider" style={{ maxWidth: 760, margin: "0 auto" }} />

      {/* ══ COMPETITION ══════════════════════════════════════ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 20 }}>POSITIONING</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, marginBottom: 36 }}>
              誰と並んでいるか。
            </h2>
          </R>
          <R delay={0.1}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    {["", "登記所有", "空き家対応", "運営SaaS", "コミュニティ", "最低価格"].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: "0.1em", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "SOLUNA", own: "✓", akiya: "✓", saas: "✓", community: "✓", price: "¥78万〜", highlight: true },
                    { name: "NOT A HOTEL", own: "✓", akiya: "—", saas: "—", community: "△", price: "数千万〜", highlight: false },
                    { name: "SANU 2nd Home", own: "—", akiya: "—", saas: "—", community: "△", price: "¥3.4万/月", highlight: false },
                    { name: "ヤモリ（空き家管理）", own: "—", akiya: "✓", saas: "✓", community: "—", price: "SaaS課金", highlight: false },
                    { name: "エクシブ", own: "△", akiya: "—", saas: "—", community: "—", price: "数千万〜", highlight: false },
                  ].map(r => (
                    <tr key={r.name} style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      background: r.highlight ? "rgba(201,169,98,0.05)" : "transparent",
                    }}>
                      <td style={{ padding: "12px", color: r.highlight ? "var(--gold)" : "rgba(255,255,255,0.7)", fontWeight: r.highlight ? 700 : 400 }}>{r.name}</td>
                      {[r.own, r.akiya, r.saas, r.community].map((v, i) => (
                        <td key={i} style={{ padding: "12px", color: v === "✓" ? "rgba(74,222,128,0.8)" : v === "△" ? "rgba(250,204,21,0.6)" : "rgba(255,255,255,0.15)", textAlign: "center" }}>{v}</td>
                      ))}
                      <td style={{ padding: "12px", color: r.highlight ? "var(--gold)" : "rgba(255,255,255,0.35)", fontSize: 12 }}>{r.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </R>
        </div>
      </section>

      <div className="gdivider" style={{ maxWidth: 760, margin: "0 auto" }} />

      {/* ══ ROADMAP ══════════════════════════════════════════ */}
      <section style={{ padding: "80px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <R>
            <p style={{ fontSize: 10, letterSpacing: "0.5em", color: "rgba(201,169,98,0.5)", marginBottom: 20 }}>SCALE · どこへ向かうか</p>
            <h2 className="font-display" style={{ fontSize: "clamp(2rem,7vw,4rem)", lineHeight: 0.95, marginBottom: 36 }}>
              2030年の景色。
            </h2>
          </R>
          <R delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { year: "2026 · 今", label: "プラットフォームの土台を作る", body: "弟子屈ビレッジ建設、KAGI/PONの外部提供開始、初の空き家転換物件を組成。" },
                { year: "2027〜2028", label: "空き家を本格的に転換し始める", body: "全国10〜30件の空き家をSOLUNA形式でリノベーション＆共同所有化。オーナー数1,000名へ。" },
                { year: "2029〜2030", label: "場所が人を呼ぶ循環が生まれる", body: "SOLUNAオーナーが次のオーナーを紹介する口コミループ。500拠点・1万名のコミュニティへ。" },
                { year: "その先", label: "日本で生まれたモデルをアジアへ", body: "ハワイ、バリ、韓国。日本の空き家課題は、アジア全体の課題でもある。" },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 24, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 100, flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: "var(--gold)", fontWeight: 600, letterSpacing: "0.05em" }}>{row.year}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{row.label}</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{row.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </R>
        </div>
      </section>

      <div className="gdivider" style={{ maxWidth: 760, margin: "0 auto" }} />

      {/* ══ CTA ══════════════════════════════════════════════ */}
      <section style={{ padding: "100px 28px 120px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Embers />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto" }}>
          <R>
            <h2 className="font-display" style={{ fontSize: "clamp(2.5rem,9vw,5.5rem)", lineHeight: 0.92, marginBottom: 24 }}>
              一緒に作ろう。
            </h2>
            <p style={{ fontSize: "clamp(1rem,2.5vw,1.1rem)", color: "rgba(255,255,255,0.45)", lineHeight: 1.9, marginBottom: 44 }}>
              オーナーとして参加する。<br />
              空き家を持っている。<br />
              テックで一緒に作りたい。<br />
              どんな形でも、話を聞く。
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/buy" style={{ padding: "16px 40px", background: "var(--gold)", color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                物件を見る
              </Link>
              <Link href="/community" style={{ padding: "16px 40px", border: "1px solid rgba(201,169,98,0.35)", color: "rgba(201,169,98,0.8)", fontSize: 12, letterSpacing: "0.2em", textDecoration: "none", borderRadius: 2 }}>
                コミュニティに入る
              </Link>
            </div>
          </R>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 28px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.12)", letterSpacing: "0.1em" }}>
          © 2026 SOLUNA · Enabler Inc. · 東京都港区三田
        </p>
      </footer>
    </main>
  );
}
