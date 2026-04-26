"use client";
import React, { useState } from "react";

const C = {
  bg:      "#f8f7f4",
  bgAlt:   "#f0ede6",
  border:  "#d8d2c6",
  text:    "#1a1814",
  muted:   "#6b6459",
  dimmed:  "#9d9389",
  gold:    "#8a6d3b",
  goldBg:  "rgba(138,109,59,0.08)",
  goldBd:  "rgba(138,109,59,0.25)",
  green:   "#2d6a4f",
  greenBg: "rgba(45,106,79,0.07)",
  red:     "#9b2335",
  redBg:   "rgba(155,35,53,0.06)",
  blue:    "#1a4a7a",
  blueBg:  "rgba(26,74,122,0.06)",
};

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

const REVENUE = [
  { label: "GA チケット", detail: "$120 × 5,000枚 × 70%動員", amount: 420000 },
  { label: "VIP テーブル / ボトルサービス", detail: "プレミアムエリア（日本人接待需要）", amount: 270000 },
  { label: "VIP パッケージ", detail: "208名 × $1,000", amount: 208000 },
  { label: "飲食売上 (F&B)", detail: "ベンダー委託", amount: 394000 },
  { label: "スポンサーシップ", detail: "日系企業ブランド露出権", amount: 170000 },
];

const EXPENSES = [
  { label: "アーティスト出演料", detail: "DJ Nobu + WhoMadeWho + Mathame", amount: 130000 },
  { label: "会場使用料", detail: "Moanalua Gardens", amount: 8000 },
  { label: "音響・照明・映像制作", detail: "プロダクション全般", amount: 180000 },
  { label: "セキュリティ・スタッフ人件費", detail: "当日運営", amount: 95000 },
  { label: "Zamna ライセンス料", detail: "売上総額の15%（内容要確認）", amount: 221250, flag: true },
  { label: "ドローン 300機", detail: "レンタル + オペレーター + FAA申請", amount: 60000 },
  { label: "シャトル・交通費", detail: "会場送迎", amount: 25000 },
  { label: "保険", detail: "賠償 + キャンセル", amount: 43000 },
  { label: "ハワイ GET 税", detail: "4.71%", amount: 69500 },
  { label: "チケットプラットフォーム手数料", detail: "", amount: 44000 },
  { label: "ホテルブロック", detail: "アーティスト + VIP", amount: 30000 },
  { label: "予備費", detail: "10%", amount: 90575 },
];

const totalRevenue = REVENUE.reduce((s, r) => s + r.amount, 0);
const totalExpense = EXPENSES.reduce((s, e) => s + e.amount, 0);
const netProfit    = totalRevenue - totalExpense;

const UPFRONT = [
  { label: "アーティストデポジット（50%）", amount: 65000 },
  { label: "制作・音響デポジット（50%）",   amount: 90000 },
  { label: "保険（全額前払い）",             amount: 43000 },
  { label: "Zamna 前払い（要確認）",         amount: 55000 },
  { label: "運営・マーケ初期費用",           amount: 47000 },
];
const PRESALES = [
  { label: "GA 早期販売（30% × 5,000枚）", amount: 180000 },
  { label: "VIP パッケージ早期申込（50%）", amount: 100000 },
];
const totalUpfront  = UPFRONT.reduce((s, r) => s + r.amount, 0);
const totalPresales = PRESALES.reduce((s, r) => s + r.amount, 0);
const bridgeNet     = Math.max(0, totalUpfront - totalPresales);

function DocTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.2em", flexShrink: 0 }}>{n}</span>
      <h2 style={{ fontSize: "clamp(1.2rem,3vw,1.5rem)", fontWeight: 700, color: C.text }}>{children}</h2>
    </div>
  );
}

function Cell({ label, value, sub, color = C.text }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ padding: "16px 20px", background: C.bgAlt, border: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 10, color: C.dimmed, letterSpacing: "0.2em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: "clamp(1.1rem,2.5vw,1.4rem)", fontWeight: 700, color, marginBottom: sub ? 4 : 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: C.muted }}>{sub}</p>}
    </div>
  );
}

function Tag({ children, color = C.gold }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontSize: 10, color, border: `1px solid ${color}`, padding: "2px 7px", letterSpacing: "0.1em", opacity: 0.85 }}>
      {children}
    </span>
  );
}

function TRow({ label, detail, amount, color, flag }: { label: string; detail?: string; amount: number; color: string; flag?: boolean }) {
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      <td style={{ padding: "9px 12px", fontSize: 12, color: C.text }}>
        {label}
        {flag && <span style={{ marginLeft: 6, fontSize: 10, color: C.gold, border: `1px solid ${C.goldBd}`, padding: "1px 5px" }}>要確認</span>}
      </td>
      <td style={{ padding: "9px 12px", fontSize: 11, color: C.muted }}>{detail}</td>
      <td style={{ padding: "9px 12px", fontSize: 12, color, textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmt(amount)}</td>
    </tr>
  );
}

const ARTISTS = [
  {
    name: "DJ Nobu",
    origin: "日本・東京",
    role: "OPENER · 日本アンカー · 坂本龍一追悼",
    color: C.blue,
    why: "ターゲットが日本人富裕層である以上、Nobuは最重要ピース。日本の音楽好きが「このために行く」と思える唯一のアンカー。BrutusもCasa BrutusもNikkei Weekendも、DJ Nobuの名前があれば記事にする。",
    what: "オープニングに坂本龍一追悼セット。「自然と電子音楽の関係」を探求した坂本の問いへの音楽的な答えを、このバニヤンの木の下で出してもらう。",
    fee: "$15,000（交渉中）",
  },
  {
    name: "WhoMadeWho",
    origin: "デンマーク",
    role: "HEADLINER · クロージング",
    color: C.gold,
    why: "日本のSNSで急速に認知が広がっている。Zamna Tulum映像への日本語コメントが多く、「知っている名前」になりつつある。ハワイ初上陸という事実は日本の音楽メディアが記事にする理由になる。",
    what: "ドローン300機フォーメーションとの組み合わせがこのイベントの核心。セット中に必ず会場が静かになる瞬間がある——5,000人が一斉に上を向く。",
    fee: "$70,000（確定）",
  },
  {
    name: "Mathame",
    origin: "イタリア",
    role: "セカンド · ミッドナイト",
    color: "#7b5ea7",
    why: "スピリチュアル・テクノは日本の瞑想・wellness・マインドフルネス層と親和性が高い。神道儀式のオープニングから繋ぐトーンとして最適で、日本人が「このイベントは深い」と感じる世界観を作る。",
    what: "WhoMadeWhoへの橋渡し役。バニヤンの夜の空気と最も合う音楽性。深夜に向かって会場の温度を上げる。",
    fee: "$45,000（確定）",
  },
];

const SPONSORS = [
  { cat: "航空・旅行", names: ["ANA（全日本空輸）", "JAL（日本航空）", "ハワイアン航空", "JTB", "H.I.S."], angle: "ハワイ旅行パッケージとのタイアップ。チケット付きツアー造成。" },
  { cat: "百貨店・ラグジュアリー", names: ["三越伊勢丹", "高島屋", "阪急阪神百貨店"], angle: "富裕層顧客へのVIP体験プレゼント。外商・外商クレジット連動。" },
  { cat: "自動車", names: ["LEXUS", "BMW Japan", "メルセデス・ベンツ日本"], angle: "VIPラウンジのブランドスポンサー。会場内ラグジュアリーカー展示。" },
  { cat: "飲料・食品", names: ["サントリー（山崎・響）", "ニッカウヰスキー", "ROKU GIN", "キリン（一番搾りプレミアム）"], angle: "会場内オフィシャルドリンクブランド。日本酒・ウィスキーバー設置。" },
  { cat: "クレジット・金融", names: ["アメックス日本", "JCBプラチナ", "三井住友プラチナカード"], angle: "VIPチケット先行販売権・カード会員特典。" },
  { cat: "メディア・コスメ", names: ["資生堂SHISEIDO", "SK-II", "POLA"], angle: "女性富裕層向け。VIPエリアでのビューティ体験。" },
];

const MEDIA = [
  { name: "Brutus", reach: "知的男性富裕層", angle: "「ハワイで神道。音楽と儀式が交差する夜」" },
  { name: "Casa Brutus", reach: "デザイン・建築・文化層", angle: "「樹齢110年のバニヤンを舞台にした、建築的イベント体験」" },
  { name: "Pen", reach: "ラグジュアリー男性層", angle: "「Zamnaがハワイに来る。なぜ今なのか」" },
  { name: "Nikkei Weekend / Nikkei Style", reach: "ビジネス富裕層", angle: "「ビジネスリーダーが向かうハロウィンの夜」" },
  { name: "Vogue Japan", reach: "富裕層女性", angle: "「ハワイ × ファッション × 音楽。今年最もドレスアップしたい夜」" },
  { name: "Rolling Stone Japan", reach: "音楽ファン全般", angle: "「DJ Nobu × WhoMadeWho × バニヤン。世界初の試み」" },
  { name: "天然生活 / GOETHE", reach: "wellness・生活文化層", angle: "「自然と音楽。木が奏でる夜」" },
];

const TIMELINE_ITEMS = [
  { phase: "今すぐ", items: ["Zamna ライセンス条件の確認・契約（最優先）", "日程（10/31）の法的・許可申請確認", "チームの意思決定・役割分担"] },
  { phase: "T−6ヶ月（2026年4月）", items: ["アーティストデポジット支払い・契約締結", "Moanalua Gardens 本契約", "日本語先行チケット販売開始（Yukiネットワーク先行）", "スポンサー営業開始（ANA・JAL・JTB優先）"] },
  { phase: "T−3ヶ月（2026年7月）", items: ["プロダクション会社確定", "ドローン業者・FAA Part 107 申請", "日本メディア向けプレスリリース配信", "VIPパッケージ販売開始"] },
  { phase: "T−1ヶ月（2026年9月）", items: ["本チケット一般販売", "日本→ハワイ航空パッケージ（ANA/JALタイアップ）発売", "神主との最終打合せ・リハーサル", "スタッフ・セキュリティ確定"] },
  { phase: "当日（2026年10月31日）", items: ["ゲートオープン 17:00", "神道儀式（お祓い）日没", "DJ Nobu + 坂本龍一追悼ピアノ 19:00", "Mathame 21:00", "WhoMadeWho + ドローン300機 23:00"] },
];

export default function ProposalPage() {
  const [tocOpen, setTocOpen] = useState(false);

  const sections = [
    ["01", "イベント概要"],
    ["02", "ターゲット戦略"],
    ["03", "ビジョン・コンセプト"],
    ["04", "開催詳細"],
    ["05", "アーティスト選定"],
    ["06", "マーケティング戦略"],
    ["07", "スポンサー候補"],
    ["08", "プログラム・タイムライン"],
    ["09", "収支計画（P&L）"],
    ["10", "資金調達計画"],
    ["11", "チームへの問いかけ"],
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif", color: C.text }}>

      {/* ── COVER ── */}
      <div style={{ background: "#0c0b09", color: "#fff", padding: "80px 40px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/images/fest/golden_hour.jpg)", backgroundSize: "cover", backgroundPosition: "center 40%", opacity: 0.15 }} />
        <div style={{ position: "relative", maxWidth: 820, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.4em", color: "rgba(201,169,98,0.7)", marginBottom: 20 }}>CONFIDENTIAL — INTERNAL DOCUMENT</p>
          <h1 style={{ fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, lineHeight: 1.05, marginBottom: 16 }}>
            SOLUNA FEST HAWAII<br /><span style={{ color: "#c9a962" }}>2026</span>
          </h1>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", color: "rgba(255,255,255,0.55)", marginBottom: 12, maxWidth: 560, lineHeight: 1.7 }}>
            モアナルア・ガーデンズ / バニヤンの木の下<br />
            2026年10月31日（土）— ハロウィン夜
          </p>
          <p style={{ fontSize: 13, color: "rgba(201,169,98,0.8)", marginBottom: 32, fontWeight: 700 }}>
            「日本人が、Zamnaをハワイに召喚する。」
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 40 }}>
            {["ターゲット：ハワイを訪れる日本人富裕層", "5,000人規模", "DJ Nobu · WhoMadeWho · Mathame", "ドローン300機", "神道儀式オープニング"].map(t => (
              <span key={t} style={{ fontSize: 11, color: "rgba(201,169,98,0.8)", border: "1px solid rgba(201,169,98,0.3)", padding: "4px 10px" }}>{t}</span>
            ))}
          </div>
          <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[["作成者", "濱田優貴 (Yuki Hamada)"], ["作成日", "2026年4月"], ["ステータス", "チーム内レビュー中"]].map(([k, v]) => (
              <div key={k}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", marginBottom: 4 }}>{k}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOC ── */}
      <div style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 40px" }}>
          <button onClick={() => setTocOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0", background: "none", border: "none", cursor: "pointer", color: C.gold, fontSize: 12, letterSpacing: "0.2em" }}>
            <span style={{ fontSize: 14, transform: tocOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▶</span>
            目次
          </button>
          {tocOpen && (
            <div style={{ paddingBottom: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 4 }}>
              {sections.map(([n, t]) => (
                <a key={n} href={`#sec${n}`} style={{ display: "flex", gap: 10, padding: "6px 10px", fontSize: 12, color: C.muted, textDecoration: "none" }}>
                  <span style={{ color: C.gold }}>{n}</span> {t}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "60px 40px" }}>

        {/* ── 01 OVERVIEW ── */}
        <section id="sec01" style={{ marginBottom: 64 }}>
          <DocTitle n="01">イベント概要</DocTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8, marginBottom: 28 }}>
            <Cell label="開催日" value="2026年10月31日" sub="ハロウィン（土曜日）" />
            <Cell label="会場" value="モアナルア・ガーデンズ" sub="オアフ島・ホノルル" />
            <Cell label="定員" value="5,000人" sub="70%動員目標" />
            <Cell label="ライセンス" value="Zamna" sub="メキシコ発・世界展開" />
          </div>
          <div style={{ padding: "20px 24px", background: C.goldBg, border: `1px solid ${C.goldBd}`, lineHeight: 1.9, fontSize: 14, color: C.muted }}>
            <strong style={{ color: C.text }}>「日本人が、Zamnaをハワイに召喚する。」</strong><br />
            ハワイを最も愛する国民が日本人である事実と、Zamnaブランドの世界観が交わる唯一のポイント。
            日本とハワイをつなぐ精神的な橋を、音楽・儀式・自然で作る。
            樹齢110年のバニヤンの木を舞台に、神道の儀式・世界クラスのDJ・300機のドローンが交差するハロウィンの夜。
          </div>
        </section>

        {/* ── 02 TARGET ── */}
        <section id="sec02" style={{ marginBottom: 64 }}>
          <DocTitle n="02">ターゲット戦略</DocTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 8, marginBottom: 28 }}>
            <Cell label="年間ハワイ訪問日本人" value="150万人" sub="海外旅行先ダントツ1位" color={C.gold} />
            <Cell label="競合する同種イベント" value="ゼロ" sub="ハワイ×テクノの空白地帯" color={C.green} />
            <Cell label="東京→ホノルル" value="約8時間" sub="日帰り不可の特別感" />
            <Cell label="Yukiのネットワーク重複" value="直結" sub="スタートアップ・柔術・旧Mercari" color={C.gold} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {[
              {
                title: "プライマリー：ハワイを旅行先として選ぶ日本人富裕層",
                body: "年150万人の日本人がハワイを訪れる。その中の、「良い体験にお金を出す」層——30〜50代、年収1,000万円以上、旅行・音楽・wellness・カルチャーに関心がある人たち。GAチケット$120は迷わず買える価格帯。",
                tag: "PRIMARY",
                tagColor: C.gold,
              },
              {
                title: "セカンダリー：ハワイ在住の日系コミュニティ",
                body: "ホノルルの日系人口は約14万人。日本文化への親和性が高く、神道の儀式・日本人DJ・日本的コンセプトへの共感が強い。ローカル動員の核になる。",
                tag: "SECONDARY",
                tagColor: C.green,
              },
              {
                title: "ターシャリー：Zamnaコミュニティ（欧米）",
                body: "WhoMadeWhoとMathameを目当てに来るヨーロッパ・US層。彼らはZamna Tulamの常連で、「Zamna Hawaii」というキーワードで反応する。日本人を主軸にしながら、このコミュニティを加えることで5,000人の構成が成立する。",
                tag: "TERTIARY",
                tagColor: C.blue,
              },
            ].map(t => (
              <div key={t.title} style={{ display: "flex", gap: 0, border: `1px solid ${C.border}`, background: C.bgAlt }}>
                <div style={{ width: 3, background: t.tagColor, flexShrink: 0 }} />
                <div style={{ padding: "16px 20px", flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{t.title}</p>
                    <Tag color={t.tagColor}>{t.tag}</Tag>
                  </div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{t.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: "16px 20px", background: C.goldBg, border: `1px solid ${C.goldBd}` }}>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
              <strong>なぜこの戦略が機能するか：</strong><br />
              Yukiのネットワーク（スタートアップ・柔術コミュニティ・旧Mercari人脈）はプライマリーターゲットと完全に重なる。
              VIPテーブル$270Kは日本人の接待文化と高相性。スポンサーはANA・JTB・三越など「日本人×ハワイ×富裕層」に予算を持つ企業ばかり。
              集客・資金調達・メディア露出のすべてがこの軸で解ける。
            </p>
          </div>
        </section>

        {/* ── 03 VISION ── */}
        <section id="sec03" style={{ marginBottom: 64 }}>
          <DocTitle n="03">ビジョン・コンセプト</DocTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "THE TREE REMEMBERS", body: "モアナルア・ガーデンズのバニヤンの木は110年の記憶を持つ。その根元に5,000人が集まり、音楽・光・祈りを共有する。イベントが終わっても、木は覚えている。" },
              { title: "日本とハワイをつなぐ精神的な橋", body: "神道の儀式（お祓い）でオープニング。日本人DJ・坂本龍一追悼セット。これにより「ただの音楽フェス」ではなく「文化的な体験」として記憶に残るものになる。日本人にとっての「帰還」の場所。" },
              { title: "Zamna品質 × ハワイの自然 × 日本の精神性", body: "トゥルムで証明されたZamnaフォーマットをハワイに持ち込む。しかし単なる「Zamna出張版」ではない。神道・坂本龍一・バニヤンの木という日本的エレメントが加わることで、ZamnaのHawaiiバージョンではなく「日本発のZamna」になる。" },
            ].map(item => (
              <div key={item.title} style={{ display: "flex", gap: 16, padding: "18px 20px", background: C.bgAlt, border: `1px solid ${C.border}` }}>
                <div style={{ width: 3, background: C.gold, flexShrink: 0, borderRadius: 2 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 04 DETAILS ── */}
        <section id="sec04" style={{ marginBottom: 64 }}>
          <DocTitle n="04">開催詳細</DocTitle>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              {[
                ["日時", "2026年10月31日（土）17:00〜翌3:00"],
                ["会場", "Moanalua Gardens, Honolulu, Oahu, Hawaii"],
                ["定員", "5,000名（VIP 208名含む）"],
                ["チケット価格", "GA $120 / VIPパッケージ $1,000 / VIPテーブル 応相談"],
                ["ライセンス", "Zamna（メキシコ）— 売上総額の15%（内容要確認）"],
                ["日程変更の理由", "当初9/4案から変更。村田良蔵（柔術世界チャンピオン・日本連盟幹部）が9/4世界大会と完全重複するため。Yukiのネットワーク多数が参加不可能な状況だった"],
                ["ハロウィン選択の理由", "帳が破れる夜・先祖が踊るという古代の意味と、神道儀式×バニヤン×テクノのコンセプトが完全一致。土曜日で参加しやすい"],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted, width: "30%", background: C.bgAlt }}>{k}</td>
                  <td style={{ padding: "10px 14px", fontSize: 13, color: C.text }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── 05 ARTISTS ── */}
        <section id="sec05" style={{ marginBottom: 64 }}>
          <DocTitle n="05">アーティスト選定</DocTitle>
          <div style={{ padding: "14px 18px", background: C.blueBg, border: `1px solid ${C.blue}22`, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
              <strong style={{ color: C.text }}>選定基準：日本人ターゲット × Zamna品質 × コンセプト合致の3軸。</strong><br />
              日本のアンカー（DJ Nobu）→ スピリチュアル・ブリッジ（Mathame）→ 日本SNSで認知急上昇のヘッドライナー（WhoMadeWho）という構成。
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {ARTISTS.map((a, i) => (
              <div key={a.name} style={{ border: `1px solid ${C.border}`, background: i === 1 ? C.goldBg : C.bgAlt }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${C.border}`, gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: a.color, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{ fontSize: "1rem", fontWeight: 700, color: C.text }}>{a.name}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{a.origin}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <Tag color={a.color}>{a.role}</Tag>
                    <span style={{ fontSize: 11, color: C.dimmed }}>{a.fee}</span>
                  </div>
                </div>
                <div style={{ padding: "12px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, color: C.dimmed, letterSpacing: "0.15em", marginBottom: 6 }}>なぜ選んだか</p>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{a.why}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: C.dimmed, letterSpacing: "0.15em", marginBottom: 6 }}>何をする</p>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{a.what}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 06 MARKETING ── */}
        <section id="sec06" style={{ marginBottom: 64 }}>
          <DocTitle n="06">マーケティング戦略</DocTitle>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 11, color: C.gold, letterSpacing: "0.2em", marginBottom: 12, fontWeight: 700 }}>フェーズ1：Yukiネットワーク先行（T-6ヶ月）</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Yuki個人SNSでの告知（Instagram/X）",
                  "スタートアップ・経営者コミュニティへの直接声かけ",
                  "柔術コミュニティ（村田良蔵ネットワーク含む）",
                  "旧Mercari・Enabler人脈への先行販売",
                  "先行50枚のみの「ファウンダーズチケット」設定",
                ].map(i => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.muted }}>
                    <span style={{ color: C.gold, flexShrink: 0 }}>—</span>{i}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.green, letterSpacing: "0.2em", marginBottom: 12, fontWeight: 700 }}>フェーズ2：メディア展開（T-4ヶ月）</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  "Brutus / Casa Brutus への独占取材オファー",
                  "Nikkei Weekend / Nikkei Style に収支・投資角度で掲載",
                  "Rolling Stone Japan に DJ Nobu特集として掲載",
                  "Vogue Japan にハロウィン×ファッション角度で掲載",
                  "ハワイ旅行メディア（るるぶ・HAWAII WEB等）との連動",
                ].map(i => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.muted }}>
                    <span style={{ color: C.green, flexShrink: 0 }}>—</span>{i}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 11, color: C.blue, letterSpacing: "0.2em", marginBottom: 12, fontWeight: 700 }}>狙うメディアと切り口</p>
          <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}`, marginBottom: 20 }}>
            <thead>
              <tr style={{ background: C.bgAlt, borderBottom: `1px solid ${C.border}` }}>
                {["媒体", "リーチ層", "切り口"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", fontSize: 10, color: C.dimmed, letterSpacing: "0.15em", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEDIA.map((m, i) => (
                <tr key={m.name} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 ? C.bgAlt : "transparent" }}>
                  <td style={{ padding: "9px 12px", fontSize: 13, fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{m.name}</td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: C.muted }}>{m.reach}</td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: C.muted, fontStyle: "italic" }}>{m.angle}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: "16px 18px", background: C.bgAlt, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, color: C.gold, letterSpacing: "0.15em", marginBottom: 8, fontWeight: 700 }}>航空×旅行パッケージ戦略</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
                ANA・JALとの共同企画で「チケット付きハワイ旅行パッケージ」を造成。旅行代理店経由で日本全国の富裕層に届く。
                HISとのタイアップでオンライン販売。
              </p>
            </div>
            <div style={{ padding: "16px 18px", background: C.bgAlt, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11, color: C.green, letterSpacing: "0.15em", marginBottom: 8, fontWeight: 700 }}>SNS戦略（日本語コンテンツ主軸）</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
                バニヤンの木・神道儀式・ドローンの映像はSNSで強拡散される素材。
                イベント前の「木の音」バイオソニフィケーション動画などコンテンツを段階的にリリース。
              </p>
            </div>
          </div>
        </section>

        {/* ── 07 SPONSORS ── */}
        <section id="sec07" style={{ marginBottom: 64 }}>
          <DocTitle n="07">スポンサー候補</DocTitle>
          <div style={{ padding: "14px 18px", background: C.goldBg, border: `1px solid ${C.goldBd}`, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
              スポンサー $170Kは収入として既計上。これは投資家への依頼ではなく、
              <strong style={{ color: C.text }}>「日本人富裕層5,000人へのブランド露出権」</strong>のマーケティング販売。
              以下はいずれも「日本人×ハワイ×高所得層」に年間予算を持っている企業。
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SPONSORS.map(s => (
              <div key={s.cat} style={{ border: `1px solid ${C.border}`, background: C.bgAlt }}>
                <div style={{ padding: "10px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{s.cat}</p>
                  <p style={{ fontSize: 12, color: C.muted }}>{s.names.join("　·　")}</p>
                </div>
                <p style={{ padding: "10px 18px", fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{s.angle}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 08 TIMELINE ── */}
        <section id="sec08" style={{ marginBottom: 64 }}>
          <DocTitle n="08">プログラム・タイムライン</DocTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {TIMELINE_ITEMS.map((t, i) => (
              <div key={t.phase} style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: "32%", padding: "14px 16px", background: i === TIMELINE_ITEMS.length - 1 ? C.goldBg : C.bgAlt, borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: i === TIMELINE_ITEMS.length - 1 ? C.gold : C.text }}>{t.phase}</p>
                </div>
                <div style={{ padding: "12px 16px", flex: 1 }}>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                    {t.items.map(item => (
                      <li key={item} style={{ fontSize: 12, color: C.muted, display: "flex", gap: 8 }}>
                        <span style={{ color: C.gold, flexShrink: 0 }}>—</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 09 P&L ── */}
        <section id="sec09" style={{ marginBottom: 64 }}>
          <DocTitle n="09">収支計画（P&amp;L）</DocTitle>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 28 }}>
            <Cell label="総収入（予測）" value={fmt(totalRevenue)} sub="5,000人動員ベース" color={C.green} />
            <Cell label="総支出" value={fmt(totalExpense)} sub="予備費10%込み" color={C.red} />
            <Cell label="純利益" value={fmt(netProfit)} sub="黒字確定ライン" color={C.gold} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 11, color: C.green, letterSpacing: "0.2em", marginBottom: 8, fontWeight: 700 }}>収入内訳</p>
              <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}` }}>
                <tbody>
                  {REVENUE.map((r, i) => <TRow key={i} label={r.label} detail={r.detail} amount={r.amount} color={C.green} />)}
                  <tr style={{ background: C.greenBg }}>
                    <td colSpan={2} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700 }}>合計</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: C.green, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(totalRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p style={{ fontSize: 11, color: C.red, letterSpacing: "0.2em", marginBottom: 8, fontWeight: 700 }}>支出内訳</p>
              <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${C.border}` }}>
                <tbody>
                  {EXPENSES.map((e, i) => <TRow key={i} label={e.label} detail={e.detail} amount={e.amount} color={C.red} flag={e.flag} />)}
                  <tr style={{ background: C.redBg }}>
                    <td colSpan={2} style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700 }}>合計</td>
                    <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 700, color: C.red, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(totalExpense)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ padding: "18px 20px", background: C.bgAlt, border: `1px solid ${C.border}`, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>帳簿は黒字。課題はキャッシュフローの順番。</p>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
              先払い必要額 <strong style={{ color: C.text }}>{fmt(totalUpfront)}</strong> に対し、
              先行チケット販売で <strong style={{ color: C.text }}>{fmt(totalPresales)}</strong> の早期回収が見込める。
              純ブリッジ必要額は <strong style={{ color: C.gold }}>{fmt(bridgeNet)}〜$100,000</strong>。
            </p>
          </div>

          <div style={{ padding: "14px 20px", background: "#fff3cd", border: "1px solid #e6c96a" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#856404", marginBottom: 6 }}>⚠ 最優先確認：Zamna ライセンス料の内訳</p>
            <p style={{ fontSize: 13, color: "#856404", lineHeight: 1.8 }}>
              {fmt(221250)}（売上の15%）が「ブランド使用料のみ」か「制作・演出費込み」かで必要ブリッジが$100K単位で変わる。
            </p>
          </div>
        </section>

        {/* ── 10 FUNDING ── */}
        <section id="sec10" style={{ marginBottom: 64 }}>
          <DocTitle n="10">資金調達計画</DocTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
            {[
              {
                n: "①", title: "Yuki ブリッジ資金",
                amount: "up to $200,000",
                status: "確保済み", statusColor: C.green,
                body: "エクイティまたは貸付として入れる。スポンサーを連れてくる形でも可。先行チケット販売が始まれば回収サイクルに入る。",
              },
              {
                n: "②", title: "日系スポンサー $170K（収入として計上済み）",
                amount: "$170,000",
                status: "営業が必要", statusColor: C.gold,
                body: "ANA・JAL・JTB・三越伊勢丹・サントリーなど。「日本人富裕層5,000人へのブランド露出権」として販売。投資家へのお願いではなくマーケティング予算の獲得。",
              },
              {
                n: "③", title: "先行チケット販売（発表後即時）",
                amount: "~$280,000",
                status: "Yukiネットワーク先行", statusColor: C.blue,
                body: "まずYukiの個人ネットワークから。スタートアップ・柔術コミュニティ・旧Mercari人脈で初動の数百枚を作り、メディア報道のフックにする。",
              },
            ].map(f => (
              <div key={f.n} style={{ border: `1px solid ${C.border}`, background: C.bgAlt }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: `1px solid ${C.border}`, gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{f.n}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{f.title}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: "1rem", fontWeight: 700 }}>{f.amount}</span>
                    <Tag color={f.statusColor}>{f.status}</Tag>
                  </div>
                </div>
                <p style={{ padding: "12px 18px", fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{f.body}</p>
              </div>
            ))}
            <div style={{ padding: "14px 20px", background: C.goldBg, border: `1px solid ${C.goldBd}` }}>
              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.8 }}>
                <strong>結論：外部の機関投資家は不要。</strong><br />
                Yuki $200K + 日系スポンサー $170K + 先行チケット $280K = $650K で先払い $300K をカバー。
                残りはイベント当日収入で完結。周囲への声かけとスポンサー営業のみで自己完結できる規模感。
              </p>
            </div>
          </div>
        </section>

        {/* ── 11 DISCUSSION ── */}
        <section id="sec11" style={{ marginBottom: 64 }}>
          <DocTitle n="11">チームへの問いかけ</DocTitle>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.9, marginBottom: 24 }}>
            このドキュメントは提案です。決定事項ではありません。特に以下について率直な意見をください。
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { n: "Q1", q: "日程変更（9月4日 → 10月31日）は現実的ですか？すでに確定している要素への影響は？" },
              { n: "Q2", q: "「ハワイを訪れる日本人富裕層をメインターゲット」という戦略に合意できますか？この方針でSean・チームは動けますか？" },
              { n: "Q3", q: "DJ Nobu（日本アンカー）→ Mathame → WhoMadeWho のラインナップ。日本人集客の観点で十分と思いますか？" },
              { n: "Q4", q: "スポンサー営業（ANA・JTB・三越伊勢丹・サントリーなど）：誰が担当できますか？具体的なコネクションはありますか？" },
              { n: "Q5", q: "Brutus・Casa Brutus・Nikkei Weekend などへのメディアパイプ。チームの中に持っている人はいますか？" },
              { n: "Q6", q: "ドローン300機のFAA Part 107対応。誰が主担当になれますか？" },
            ].map(item => (
              <div key={item.n} style={{ display: "flex", gap: 16, padding: "14px 18px", border: `1px solid ${C.border}`, background: C.bgAlt }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, flexShrink: 0, paddingTop: 2 }}>{item.n}</span>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.8 }}>{item.q}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>SOLUNA FEST HAWAII 2026</p>
            <p style={{ fontSize: 12, color: C.muted }}>Confidential — For internal team review only</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, color: C.muted }}>作成：濱田優貴</p>
            <p style={{ fontSize: 12, color: C.muted }}>2026年4月</p>
          </div>
        </div>

      </div>
    </div>
  );
}
