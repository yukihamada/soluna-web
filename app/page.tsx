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

export default function Page() {
  return (
    <>
      <HomeClient />
      {/*
        SEO/no-JS fallback. <noscript> is rendered server-side and shown only
        when JS is disabled. Visible content for crawlers is provided by the
        <h1>/meta/JSON-LD in layout.tsx, so we keep this minimal to avoid
        interfering with HomeClient's hydration.
      */}
      <noscript>
        <div style={{ position:"fixed", inset:0, padding:"40px 24px", overflow:"auto", background:"#080808", color:"#f0ece4", fontFamily:"sans-serif", lineHeight:1.8, zIndex:9999 }}>
          <h1 style={{ fontSize:"24px", marginBottom:"16px" }}>SOLUNA — 別荘共同所有 | 北海道・熱海・ハワイ 1口780万円〜</h1>
          <p>JavaScriptを有効にすると体験的なホームUIが表示されます。リンクから各物件・申込ページに進めます。</p>
          <h2 style={{ fontSize:"16px", margin:"20px 0 8px" }}>物件一覧</h2>
          <ul>
            {SSR_PROPERTIES.map((p) => (
              <li key={p.slug}>
                <a href={`/${p.slug}`} style={{ color:"#c9a962" }}>{p.name}</a>
                {" — "}
                {p.desc}
              </li>
            ))}
          </ul>
          <p style={{ marginTop:"20px" }}>
            <a href="/collection" style={{ color:"#c9a962" }}>物件を全て見る</a>
            {" · "}
            <a href="/buy" style={{ color:"#c9a962" }}>オーナーになる</a>
            {" · "}
            <a href="/scheme" style={{ color:"#c9a962" }}>スキーム</a>
            {" · "}
            <a href="/faq" style={{ color:"#c9a962" }}>FAQ</a>
            {" · "}
            <a href="/contact" style={{ color:"#c9a962" }}>お問い合わせ</a>
          </p>
        </div>
      </noscript>
    </>
  );
}
