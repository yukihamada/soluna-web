import HomeClient from "./HomeClient";

const SSR_PROPERTIES = [
  { slug: "tapkop",   name: "TAPKOP — 屈斜路湖畔ヴィラ",       desc: "北海道弟子屈・敷地30,055㎡・専属シェフ・¥8,000万〜（事業承継・会員権）" },
  { slug: "lodge",    name: "THE LODGE — 美留和",              desc: "北海道弟子屈・pH9.2源泉かけ流し・1口¥490万・年30泊（10口制）" },
  { slug: "nesting",  name: "NESTING — 美留和",                desc: "北海道弟子屈・タワーサウナ＋ジャグジー・1口¥890万・年30泊（10口制）" },
  { slug: "atami",    name: "WHITE HOUSE 熱海",                desc: "静岡県熱海市・相模湾ビュー・1口¥1,900万・年36泊" },
  { slug: "instant",  name: "インスタントハウス",               desc: "北海道弟子屈・最も手軽な入口・1口¥120万・年30泊" },
  { slug: "village",  name: "美留和ビレッジ",                  desc: "3万坪のプライベート原野・延床50㎡＋デッキ20㎡・総額2,780万円・1口¥490万・年30泊" },
  { slug: "kumaushi", name: "天空の道場（熊牛原野）",           desc: "北海道・1口¥480万・2026年9月オープン予定" },
  { slug: "honolulu", name: "HONOLULU VILLA",                  desc: "ハワイ・オアフ島・1口¥2,800万・2026年11月オープン予定（月単位ピッカー）" },
];

const SSR_FEATURES = [
  { title: "10口共有持分で登記所有", desc: "1口780万円〜、年間30泊の滞在権つき。法的に守られた共有名義オーナーシップ。" },
  { title: "土地・建築・運営を一体で", desc: "SOLUNA / Enabler Inc. が予約・清掃・管理を一括代行。不在時はAirbnbで運用、収益還元あり。" },
  { title: "ZAMNA HAWAII 2026", desc: "オアフ島で開催の音楽フェス。SOLUNAオーナーには優先チケット・宿泊権を提供。" },
];

export default function Page() {
  return (
    <>
      {/*
        ── SSR-only content for crawlers, no-JS users, accessibility tools ──
        Visually hidden behind the OS UI (HomeClient covers the viewport),
        but rendered server-side so search engines and AI crawlers can index
        the homepage's actual value proposition.
      */}
      <header
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
        aria-hidden="false"
      >
        <h1>SOLUNA — 別荘共同所有 | 北海道・熱海・ハワイ 1口780万円〜</h1>
        <p>
          土地と建築と運営を一体で設計する定額型別荘所有プラットフォーム。
          北海道3万坪の自然を10人で分け合う共有持分（10口制）。
          1口780万円から、年間30泊の滞在権つき。
          使わない期間はSOLUNA / Enabler Inc.が管理し、Airbnbで運用、収益還元します。
        </p>
        <h2>SOLUNAの特徴</h2>
        <ul>
          {SSR_FEATURES.map((f) => (
            <li key={f.title}>
              <strong>{f.title}</strong>
              {" — "}
              {f.desc}
            </li>
          ))}
        </ul>
        <h2>物件一覧</h2>
        <ul>
          {SSR_PROPERTIES.map((p) => (
            <li key={p.slug}>
              <a href={`/${p.slug}`}>{p.name}</a>
              {" — "}
              {p.desc}
            </li>
          ))}
        </ul>
        <p>
          <a href="/collection">物件を全て見る</a>
          {" · "}
          <a href="/buy">オーナーになる</a>
          {" · "}
          <a href="/scheme">スキームを理解する</a>
          {" · "}
          <a href="/faq">よくある質問</a>
          {" · "}
          <a href="/contact">お問い合わせ</a>
        </p>
        <noscript>
          <p>
            JavaScriptを有効にしてください。SOLUNAの体験的なホームUIが表示されます。
            JavaScriptなしでも、上記リンクから各物件・申込ページに進めます。
          </p>
        </noscript>
      </header>
      <HomeClient />
    </>
  );
}
