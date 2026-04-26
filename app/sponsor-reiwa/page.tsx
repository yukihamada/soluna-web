"use client";
import React from "react";

const gold = "#8a6d3b";
const goldBg = "rgba(138,109,59,0.07)";
const goldBd = "rgba(138,109,59,0.22)";
const green = "#1a5c3a";
const greenBg = "rgba(26,92,58,0.06)";
const text = "#111";
const muted = "#555";
const border = "#d0ccc4";
const bg = "#faf9f6";
const bgAlt = "#f2efe8";

const fmt = (n: number) => n.toLocaleString("ja-JP");
const usd = (n: number) => "$" + n.toLocaleString("en-US");
const jpy = (n: number) => "約" + fmt(n) + "万円";

export default function SponsorReiwaPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${bg}; font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif; color: ${text}; }
        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          body { background: white; }
          @page { margin: 15mm 18mm; size: A4; }
        }
      `}</style>

      {/* ── PRINT BUTTON ── */}
      <div className="no-print" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}>
        <button
          onClick={() => window.print()}
          style={{ padding: "12px 24px", background: gold, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
        >
          PDFとして保存
        </button>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 0 80px" }}>

        {/* ══ PAGE 1: COVER ══ */}
        <div className="page-break" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 56px", background: "#0c0b09", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/fest/golden_hour.jpg)", backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.18 }} />
          <div style={{ position: "relative" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 40 }}>SPONSORSHIP PROPOSAL — CONFIDENTIAL</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 48 }}>
              <div style={{ padding: "10px 20px", border: "1px solid rgba(201,169,98,0.4)", fontSize: 15, fontWeight: 700, color: "#c9a962", letterSpacing: "0.1em" }}>SOLUNA FEST HAWAII 2026</div>
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.3)" }}>×</div>
              <div style={{ padding: "10px 20px", border: "1px solid rgba(255,255,255,0.2)", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.05em" }}>令和トラベル</div>
            </div>
            <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "0.01em" }}>
              ハワイ旅行パッケージ<br />
              <span style={{ color: "#c9a962" }}>タイアップ提案書</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 520 }}>
              日本人が、Zamnaをハワイに召喚する。<br />
              2026年10月31日ハロウィン夜——バニヤンの木の下に<br />
              5,000人が集まる日本発の世界水準フェスを、<br />
              令和トラベルとともに作りたい。
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 32, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[["日付", "2026年10月31日（土）"], ["会場", "Moanalua Gardens, Hawaii"], ["規模", "5,000名"], ["提案日", "2026年4月"]].map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginBottom: 4 }}>{k}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ PAGE 2: OVERVIEW ══ */}
        <div style={{ padding: "56px 56px 48px", borderBottom: `2px solid ${border}` }}>

          <SectionTitle n="01">イベント概要</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 28 }}>
            {[
              { label: "開催日", value: "2026.10.31", sub: "ハロウィン（土曜）" },
              { label: "会場", value: "バニヤンの木", sub: "モアナルア・ガーデンズ" },
              { label: "定員", value: "5,000名", sub: "VIP 208名含む" },
              { label: "ライセンス", value: "Zamna", sub: "世界最高峰テクノフェス" },
            ].map(c => (
              <div key={c.label} style={{ padding: "14px 16px", background: bgAlt, border: `1px solid ${border}`, textAlign: "center" }}>
                <p style={{ fontSize: 10, color: muted, letterSpacing: "0.15em", marginBottom: 6 }}>{c.label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 3 }}>{c.value}</p>
                <p style={{ fontSize: 11, color: muted }}>{c.sub}</p>
              </div>
            ))}
          </div>

          <Callout>
            Zamnaはメキシコ・トゥルムを拠点に世界展開する高級テクノフェスブランド。そのハワイ版を日本人チームが主導して開催する——
            <strong>「日本人がZamnaをハワイに召喚する」</strong>という唯一無二のストーリー。
            神道の儀式（お祓い）でオープニング、DJ Nobu×坂本龍一追悼×300機ドローンフォーメーション。
          </Callout>

          <SectionTitle n="02" mt={36}>アーティストラインナップ</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: 13 }}>
            <thead>
              <tr style={{ background: bgAlt, borderBottom: `1px solid ${border}` }}>
                {["#", "アーティスト", "出身", "役割"].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {[
                ["01", "DJ Nobu", "日本・東京", "オープナー・坂本龍一追悼セット"],
                ["02", "Mathame", "イタリア", "セカンド・スピリチュアルテクノ"],
                ["03", "WhoMadeWho", "デンマーク", "ヘッドライナー・ドローン演出"],
              ].map(([n, name, origin, role]) => (
                <tr key={n} style={{ borderBottom: `1px solid ${border}` }}>
                  <Td style={{ color: gold, fontWeight: 700, width: 40 }}>{n}</Td>
                  <Td style={{ fontWeight: 700 }}>{name}</Td>
                  <Td style={{ color: muted }}>{origin}</Td>
                  <Td style={{ color: muted }}>{role}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ══ PAGE 3: WHY REIWA ══ */}
        <div style={{ padding: "56px 56px 48px", borderBottom: `2px solid ${border}` }}>

          <SectionTitle n="03">なぜ令和トラベルか</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
            {[
              {
                title: "ターゲット層の完全一致",
                body: "SOLUNA FESTのメインターゲットは「ハワイを旅行先として選ぶ日本人30〜40代・高所得層」。令和トラベル（NEWT）が最も力を入れているハワイ路線のユーザー層と完全に重なる。",
                icon: "◆",
              },
              {
                title: "「このために行く」旅行需要の創出",
                body: "イベント目的の旅行は旅行代理店にとって最も価値が高い需要。SOLUNA FESTは「ハワイついでに」ではなく「SOLUNA FESTに行くためにハワイへ」という明確な動機を作る。キャンセル率が低く、高単価。",
                icon: "◆",
              },
              {
                title: "コンテンツ・PR素材としての価値",
                body: "バニヤンの木・神道儀式・300機のドローン——これらはInstagram・TikTok・Youtubeで爆発的に拡散される素材。令和トラベルとのタイアップコンテンツは自然にバイラルする。",
                icon: "◆",
              },
              {
                title: "日本初の「フェス×旅行パッケージ」先行事例",
                body: "日本のオンライン旅行会社でフェスと連動したパッケージを展開した事例はほとんどない。令和トラベルが先手を取ることで業界初の事例として強い訴求力を持つ。",
                icon: "◆",
              },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", gap: 14, padding: "16px 18px", border: `1px solid ${border}`, background: bgAlt }}>
                <span style={{ color: gold, fontSize: 10, flexShrink: 0, paddingTop: 4 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 5 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: muted, lineHeight: 1.8 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <SectionTitle n="04" mt={36}>市場規模</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { n: "150万人", label: "年間ハワイ訪問日本人", sub: "海外渡航先ダントツ1位" },
              { n: "5,000人", label: "SOLUNA FEST定員", sub: "うち日本人比率60%想定" },
              { n: "3,000人", label: "日本人ターゲット", sub: "令和トラベル接点層" },
              { n: "$0", label: "競合する同種イベント", sub: "ハワイ×テクノの空白地帯" },
            ].map(c => (
              <div key={c.n} style={{ padding: "16px", background: goldBg, border: `1px solid ${goldBd}`, textAlign: "center" }}>
                <p style={{ fontSize: "1.4rem", fontWeight: 900, color: gold, marginBottom: 4 }}>{c.n}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: text, marginBottom: 3 }}>{c.label}</p>
                <p style={{ fontSize: 10, color: muted }}>{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ PAGE 4: PROPOSAL ══ */}
        <div className="page-break" style={{ padding: "56px 56px 48px", borderBottom: `2px solid ${border}` }}>

          <SectionTitle n="05">タイアップ内容</SectionTitle>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 12 }}>
              令和トラベル（NEWT）限定パッケージ
              <span style={{ marginLeft: 10, fontSize: 11, color: gold, border: `1px solid ${goldBd}`, padding: "2px 8px" }}>独占販売権</span>
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: 13, marginBottom: 16 }}>
              <thead>
                <tr style={{ background: bgAlt, borderBottom: `1px solid ${border}` }}>
                  {["パッケージ名", "内容", "価格（目安）", "目標販売数"].map(h => <Th key={h}>{h}</Th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  ["SOLUNA GA パック", "往復航空券（東京発）+ ホテル3泊 + GAチケット", "¥180,000〜", "200名"],
                  ["SOLUNA VIP パック", "往復航空券 + ホテル5泊（高級） + VIPチケット $1,000", "¥350,000〜", "100名"],
                  ["SOLUNA グループ パック", "4名以上・上記のグループ割引", "¥160,000〜/人", "50組(200名)"],
                ].map(([name, content, price, target]) => (
                  <tr key={name} style={{ borderBottom: `1px solid ${border}` }}>
                    <Td style={{ fontWeight: 700 }}>{name}</Td>
                    <Td style={{ color: muted }}>{content}</Td>
                    <Td style={{ color: green, fontWeight: 700 }}>{price}</Td>
                    <Td style={{ color: muted }}>{target}</Td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: "14px 18px", background: greenBg, border: `1px solid ${green}33`, marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: green, marginBottom: 4 }}>想定取扱高（令和トラベル）</p>
              <p style={{ fontSize: 13, color: muted, lineHeight: 1.8 }}>
                500名 × 平均 ¥200,000 = <strong style={{ color: green, fontSize: 15 }}>取扱高 約1億円</strong><br />
                うち令和トラベルの収益（取扱手数料15%想定）≈ <strong style={{ color: green }}>約1,500万円</strong>
              </p>
            </div>
          </div>

          <SectionTitle n="06" mt={0}>令和トラベルに提供する権利</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
            {[
              { title: "独占パッケージ販売権", body: "NEWT経由限定のチケット+旅行パッケージ。他の旅行代理店には販売権を付与しない。" },
              { title: "オフィシャルスポンサーロゴ掲出", body: "会場バナー・チケット・公式サイト・SNS告知・プレスリリースすべてに令和トラベルロゴを掲載。" },
              { title: "VIPラウンジ内ブランドブース", body: "VIPエリアに令和トラベル専用ブース設置。NEWT新規登録者への特典配布が可能。" },
              { title: "コンテンツ素材の独占使用権（3ヶ月）", body: "当日の写真・映像・ドローン映像を令和トラベルのSNS・広告に優先使用可能。" },
              { title: "事前コラボコンテンツ制作", body: "「SOLUNA FESTへの旅支度」などのタイアップ記事・動画コンテンツをNEWTアプリ内で発信。" },
              { title: "先行チケット購入権（令和ユーザー限定）", body: "一般販売の2週間前にNEWT会員限定でチケット先行購入の機会を提供。新規登録の起爆剤になる。" },
            ].map(item => (
              <div key={item.title} style={{ padding: "14px 16px", border: `1px solid ${border}`, background: bgAlt }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: text, marginBottom: 5 }}>✓ {item.title}</p>
                <p style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══ PAGE 5: INVESTMENT ══ */}
        <div style={{ padding: "56px 56px 48px", borderBottom: `2px solid ${border}` }}>

          <SectionTitle n="07">スポンサー条件</SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            {[
              {
                tier: "TITLE SPONSOR",
                price: usd(50000),
                priceSub: jpy(750) + "（スポンサー料）",
                color: gold,
                bg: goldBg,
                bd: goldBd,
                rights: [
                  "独占パッケージ販売権（全プラン）",
                  "「令和トラベル presents SOLUNA FEST」クレジット",
                  "会場メインステージバックドロップへのロゴ掲出",
                  "VIPラウンジ命名権",
                  "コンテンツ素材6ヶ月独占使用権",
                  "タイアップSNS投稿 × 10回以上",
                  "アーティストとの特別ディナー招待（5名）",
                ],
              },
              {
                tier: "OFFICIAL PARTNER",
                price: usd(30000),
                priceSub: jpy(450) + "（スポンサー料）",
                color: green,
                bg: greenBg,
                bd: `${green}33`,
                rights: [
                  "パッケージ販売権（GAパックのみ）",
                  "会場バナー・公式サイトへのロゴ掲出",
                  "VIPラウンジ内ブランドブース",
                  "コンテンツ素材3ヶ月使用権",
                  "タイアップSNS投稿 × 5回",
                  "NEWT会員先行チケット購入権",
                ],
              },
            ].map(t => (
              <div key={t.tier} style={{ border: `1px solid ${t.bd}`, background: t.bg }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.bd}` }}>
                  <p style={{ fontSize: 10, letterSpacing: "0.25em", color: t.color, marginBottom: 6 }}>{t.tier}</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 900, color: t.color, marginBottom: 2 }}>{t.price}</p>
                  <p style={{ fontSize: 12, color: muted }}>{t.priceSub}</p>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  {t.rights.map(r => (
                    <p key={r} style={{ fontSize: 12, color: muted, marginBottom: 6, display: "flex", gap: 8 }}>
                      <span style={{ color: t.color, flexShrink: 0 }}>✓</span>{r}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 20px", background: goldBg, border: `1px solid ${goldBd}`, marginBottom: 28 }}>
            <p style={{ fontSize: 13, color: text, lineHeight: 1.9 }}>
              <strong>ROI試算（OFFICIAL PARTNERの場合）：</strong><br />
              スポンサー料 {usd(30000)}（{jpy(450)}）に対し、
              パッケージ取扱高 500名 × ¥200,000 = <strong>取扱高1億円・収益約1,500万円</strong>。
              さらに NEWT 新規会員獲得・コンテンツ資産・ブランド露出を含めると、
              スポンサー投資対効果は十分にポジティブ。
            </p>
          </div>

          <SectionTitle n="08" mt={0}>スケジュール</SectionTitle>
          <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${border}`, fontSize: 13 }}>
            <tbody>
              {[
                ["2026年4〜5月", "契約締結・パッケージ内容確定"],
                ["2026年5月", "NEWT会員向け先行情報解禁・先行登録開始"],
                ["2026年6月", "パッケージ先行販売スタート（NEWT独占期間）"],
                ["2026年7月", "一般チケット発売・メディア一斉掲載"],
                ["2026年9月", "タイアップコンテンツ集中配信"],
                ["2026年10月31日", "SOLUNA FEST HAWAII 当日"],
                ["2026年11月〜", "コンテンツ素材活用・次回イベント検討"],
              ].map(([date, event]) => (
                <tr key={date} style={{ borderBottom: `1px solid ${border}` }}>
                  <td style={{ padding: "9px 14px", fontSize: 12, color: gold, fontWeight: 700, width: "28%", background: bgAlt, whiteSpace: "nowrap" }}>{date}</td>
                  <td style={{ padding: "9px 14px", fontSize: 13, color: text }}>{event}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ══ FOOTER / CONTACT ══ */}
        <div style={{ padding: "48px 56px", background: "#0c0b09", color: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(201,169,98,0.6)", marginBottom: 16 }}>CONTACT</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>濱田 優貴（Yuki Hamada）</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Enabler Inc. / SOLUNA FEST 主催</p>
              <p style={{ fontSize: 13, color: "rgba(201,169,98,0.8)", marginBottom: 4 }}>mail@yukihamada.jp</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>090-7409-0407</p>
            </div>
            <div>
              <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(201,169,98,0.6)", marginBottom: 16 }}>NEXT STEP</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.9 }}>
                まずはカジュアルにお話しできれば。<br />
                30分のオンラインミーティングを設定させてください。<br /><br />
                詳細資料・P&L・ビジュアル資料は<br />
                別途お送りします。
              </p>
            </div>
          </div>
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>SOLUNA FEST HAWAII 2026 — Confidential</p>
            <p style={{ fontSize: 11, color: "rgba(201,169,98,0.5)" }}>solun.art</p>
          </div>
        </div>

      </div>
    </>
  );
}

function SectionTitle({ n, children, mt = 0 }: { n: string; children: React.ReactNode; mt?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${border}`, marginTop: mt }}>
      <span style={{ fontSize: 11, color: gold, fontWeight: 700, letterSpacing: "0.2em", flexShrink: 0 }}>{n}</span>
      <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: text }}>{children}</h2>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "16px 20px", background: goldBg, border: `1px solid ${goldBd}`, lineHeight: 1.9, fontSize: 13, color: muted }}>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "8px 12px", fontSize: 11, color: muted, letterSpacing: "0.1em", textAlign: "left", fontWeight: 700 }}>{children}</th>;
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <td style={{ padding: "9px 12px", fontSize: 13, color: text, ...style }}>{children}</td>;
}
