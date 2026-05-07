// ── 4プランデータ ──────────────────────────────────────────────────────────
window.BUILD_PLANS = [
  // ===== MINI (9.9m²) =====
  {
    id: "mini",
    name: "MEBUKI",
    label: "10m²未満",
    area: 9.9,
    dims: "W 3,640 × D 2,730 mm",
    weeks: 5,
    tag: "建築確認不要",
    tagColor: "#50b8a0",
    desc: "10m²の制約がデザインを研ぎ澄ます。910×1820mm標準SIPsパネルが4枚で四周の壁が完成する——特注カット不要、DIY初心者でも精度が出る。黒ガルバ一枚皮、露しOSB面、南窓1枚。余分を削ぎ落とした結果がそのままデザインになる。建築確認不要・ロフト付きで最小限の家を体験する。",
    totalMat: 1346258,
    subsidyMax: 1350000,
    coldClimateUpgrade: 65000,
    rentPerNight: 15000,
    color: "#50b8a0",
    img: "/img/build/mini.jpg",
    specs: [
      {k:"延床面積", v:"9.9 m²（3坪）"},
      {k:"外形寸法", v:"W 3,640 × D 2,730 × H 3,800 mm"},
      {k:"構造", v:"木造軸組 + SIPsパネル（壁・屋根）"},
      {k:"天井高", v:"1,800mm（SIPs 910×1820mm 単層・ロフト下）"},
      {k:"断熱性能", v:"UA値 0.18 W/m²K"},
      {k:"暖房", v:"小型薪ストーブ"},
      {k:"電力", v:"オフグリッド 400W + 2kWh"},
      {k:"トイレ", v:"コンポストトイレ"},
      {k:"耐震等級", v:"等級2 想定（10m²超は構造計算推奨・性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"不要（10m²未満）"},
    ],
    materials: [
      {cat:"構造材（プレカット）", emoji:"📐", total:96000, color:"#b07850",
       items:[
         {name:"KD杉 105×105 柱材",qty:"8本",unit:"¥1,200/本",total:9600,note:"プレカット込み"},
         {name:"KD杉 105×180 梁材",qty:"4本",unit:"¥2,200/本",total:8800,note:""},
         {name:"KD杉 45×90 間柱",qty:"20本",unit:"¥380/本",total:7600,note:""},
         {name:"構造用合板 24mm 床",qty:"6枚",unit:"¥3,800/枚",total:22800,note:""},
         {name:"野縁・垂木セット",qty:"一式",unit:"¥15,000",total:15000,note:""},
         {name:"ロフト床 パーチクルボード",qty:"3枚",unit:"¥2,800/枚",total:8400,note:""},
         {name:"ロフト梯子材",qty:"一式",unit:"¥23,800",total:23800,note:""},
       ]},
      {cat:"SIPsパネル（壁・屋根）", emoji:"🏗️", total:404000, color:"#50b8a0",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 単層 160mm",qty:"20 m²",unit:"¥11,000/m²",total:220000,note:"標準OSBサイズ・単層で壁高1,820mm・ロフトロフト下高さ確保"},
         {name:"SIPsパネル 屋根用 910×1820mm 200mm",qty:"11 m²",unit:"¥14,000/m²",total:154000,note:"片流れ屋根・断熱一体型"},
         {name:"スプライン材・気密テープ一式",qty:"一式",unit:"¥30,000",total:30000,note:"パネル継ぎ目処理・C値0.5以下目標"},
       ]},
      {cat:"外装", emoji:"🖤", total:72000, color:"#888",
       items:[
         {name:"ガルバリウム波板 黒 0.35mm",qty:"35 m²",unit:"¥1,200/m²",total:42000,note:""},
         {name:"タイベック 透湿防水シート",qty:"半巻",unit:"¥10,000",total:10000,note:""},
         {name:"コーキング・役物材",qty:"一式",unit:"¥20,000",total:20000,note:""},
       ]},
      {cat:"屋根", emoji:"🏠", total:58000, color:"#6070a0",
       items:[
         {name:"ガルバリウム屋根材 片流れ",qty:"14 m²",unit:"¥2,200/m²",total:30800,note:""},
         {name:"ルーフィング ゴムアス",qty:"1本",unit:"¥6,800/本",total:6800,note:""},
         {name:"棟板金・破風板",qty:"一式",unit:"¥20,400",total:20400,note:""},
       ]},
      {cat:"窓・開口部", emoji:"🪟", total:123000, color:"#4ab8d0",
       items:[
         {name:"樹脂窓 W780×H1170 南",qty:"2枚",unit:"¥46,000/枚",total:92000,note:"トリプルガラス"},
         {name:"ドア 断熱型 小型",qty:"1枚",unit:"¥31,000",total:31000,note:""},
       ]},
      {cat:"オフグリッド電力", emoji:"☀️", total:109658, color:"#f0c040",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"1枚",unit:"¥15,000/枚",total:15000,note:"200W×2と同ワット数・半数で設置工数半減"},
         {name:"LiFePO4 12V 200Ah + 600W インバーター一式",qty:"1式",unit:"¥58,000",total:58000,note:"CATL/EVEセル使用・中国直輸入"},
         {name:"MPPT 30A + 配線一式",qty:"1式",unit:"¥36,658",total:36658,note:""},
       ]},
      {cat:"給排水・衛生", emoji:"💧", total:105000, color:"#50b8a0",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"1台",unit:"¥75,000",total:75000,note:"スウェーデン製・Nature's Head比63%削減・浄化槽不要"},
         {name:"雨水タンク 200L",qty:"1基",unit:"¥12,000",total:12000,note:""},
         {name:"ハンドポンプ・配管一式",qty:"1式",unit:"¥18,000",total:18000,note:""},
       ],
       note:"※コンポストトイレ¥200,000は全プラン共通",
      },
      {cat:"暖房（小型薪ストーブ）", emoji:"🔥", total:48000, color:"#e06030",
       items:[
         {name:"小型鋼板薪ストーブ",qty:"1台",unit:"¥28,000",total:28000,note:""},
         {name:"煙突一式 Φ120",qty:"1式",unit:"¥20,000",total:20000,note:""},
       ]},
      {cat:"基礎（独立基礎 4点）", emoji:"⚓", total:43600, color:"#606060",
       items:[
         {name:"生コン 凍結深度1,000mm対応",qty:"0.8 m³",unit:"¥18,000/m³",total:14400,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥20,000",total:20000,note:""},
         {name:"砕石・砂",qty:"一式",unit:"¥9,200",total:9200,note:""},
       ]},
      {cat:"内装・仕上げ", emoji:"🪵", total:89000, color:"#a07850",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"22 m²",unit:"¥2,800/m²",total:61600,note:""},
         {name:"杉無垢フローリング",qty:"10 m²",unit:"¥2,700/m²",total:27000,note:""},
         {name:"造作棚・吊り収納一式",qty:"一式",unit:"¥400",total:400,note:"端材活用"},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:263000, color:"#607080",
       items:[
         {name:"小型換気扇 Φ100（法定24h換気）",qty:"1台",unit:"¥18,000",total:18000,note:"建築基準法対応"},
         {name:"室内配線（コンセント4口・照明2点・分電盤）",qty:"一式",unit:"¥42,000",total:42000,note:""},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩）処理",qty:"一式",unit:"¥35,000",total:35000,note:""},
         {name:"建具金物（ドアノブ・蝶番・デッドボルト）",qty:"一式",unit:"¥18,000",total:18000,note:""},
         {name:"運搬費（弟子屈まで・4tトラック）",qty:"1式",unit:"¥150,000",total:150000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"基礎 4点打設",icon:"⚓",cost:42000,diff:"★★☆☆☆",people:"2人",
       desc:"独立基礎を4点打設。凍結深度1,000mmまで掘る。4点なので1日で完了。",
       tools:["スコップ・ツルハシ","型枠板","アンカーボルト","生コン"],tips:"4点基礎はレベル出しが命。糸張りで正確に。"},
      {week:"W2",phase:"土台・床・ロフト骨組み",icon:"🪵",cost:95000,diff:"★★☆☆☆",people:"2人",
       desc:"土台を敷き、根太・床合板を張る。同時にロフト梯子・梁も仮組みしておく。",
       tools:["インパクト","丸ノコ","水平器"],tips:"ロフト高さは1,400mm以上確保。230cmの天井高があれば大人が立てる。"},
      {week:"W3",phase:"棟上げ・SIPsパネル取付",icon:"🏗️",cost:404000,diff:"★★★☆☆",people:"3人",
       desc:"柱・梁を組んで棟上げ。910×1820mm SIPsパネルを単層で4面に取付。タイベック・胴縁まで一気に進める。",
       tools:["インパクト","丸ノコ","カッター","コーキングガン"],tips:"単層パネルは1820mm → 壁高さそのまま。スプライン溝にPU接着剤を充填してから積む。"},
      {week:"W4",phase:"外装・窓・設備",icon:"🖤",cost:371000,diff:"★★★☆☆",people:"2人",
       desc:"ガルバ外壁・屋根を張り、窓を取り付ける。コンポストトイレ・ソーラーも同週に設置。",
       tools:["電動ドリル","コーキングガン","脚立"],tips:"小屋なら1人でもガルバ張りが可能。"},
      {week:"W5",phase:"内装・竣工",icon:"✨",cost:89000,diff:"★★☆☆☆",people:"2人",
       desc:"杉羽目板・フローリングを張り、薪ストーブを設置して完成。",
       tools:["フィニッシュネイラー","カンナ","丸ノコ"],tips:"5週間でコンパクトな週末小屋が完成。"},
    ],
    routes: [
      {name:"セルフビルド",cost:1346258,color:"#50b8a0",hi:true},
      {name:"補助金後",cost:0,color:"rgba(80,200,160,.9)",gr:true,note:"移住補助¥135万活用後（実質¥0〜）"},
      {name:"工務店依頼",cost:2800000,color:"#555"},
      {name:"キット小屋",cost:1200000,color:"#555",note:"組立キット"},
    ],
    floorSvg: `<svg viewBox="0 0 200 180" style="width:100%;background:#050505;display:block">
      <rect x="20" y="20" width="130" height="120" fill="none" stroke="#50b8a0" stroke-width="3"/>
      <line x1="20" y1="90" x2="150" y2="90" stroke="#555" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="20" y="90" width="130" height="50" fill="rgba(80,184,160,.04)"/>
      <text x="85" y="52" fill="#ddd" font-size="9" text-anchor="middle">メインスペース</text>
      <text x="85" y="64" fill="#555" font-size="7.5" text-anchor="middle">キッチン・作業・ストーブ</text>
      <text x="85" y="110" fill="#888" font-size="8" text-anchor="middle">ロフト下（収納・WC）</text>
      <text x="85" y="122" fill="#555" font-size="7" text-anchor="middle">H:1,400mm</text>
      <rect x="148" y="50" width="6" height="30" fill="#4ab8d0" opacity=".7"/>
      <rect x="148" y="95" width="6" height="20" fill="#4ab8d0" opacity=".7"/>
      <line x1="20" y1="100" x2="20" y2="120" stroke="#050505" stroke-width="5"/>
      <path d="M20 100 Q36 100 36 116" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="20" y="168" fill="#50b8a0" font-size="7.5">3,640 mm</text>
      <line x1="20" y1="162" x2="150" y2="162" stroke="#333" stroke-width="1"/>
      <text x="162" y="85" fill="#555" font-size="7" text-anchor="middle" transform="rotate(90,162,85)">2,730</text>
      <line x1="158" y1="20" x2="158" y2="140" stroke="#333" stroke-width="1"/>
      <text x="20" y="12" fill="#50b8a0" font-size="8" font-weight="bold">MEBUKI — 9.9m² / 建築確認不要</text>
      <circle cx="45" cy="75" r="6" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.5)" stroke-width="1.2"/>
      <text x="45" y="79" fill="rgba(224,96,48,.8)" font-size="5.5" text-anchor="middle">炉</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 200 175" style="width:100%;background:#050505;display:block">
      <text x="100" y="10" fill="#50b8a0" font-size="8" text-anchor="middle">MEBUKI — 南立面（SIPs単層）</text>
      <!-- Ground line -->
      <line x1="10" y1="155" x2="190" y2="155" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <!-- Roof -->
      <polygon points="22,70 100,28 178,70" fill="rgba(22,22,22,.98)" stroke="#50b8a0" stroke-width="1.5"/>
      <!-- Chimney -->
      <rect x="55" y="35" width="10" height="35" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1"/>
      <!-- SIPs wall panels — show panel boundaries -->
      <!-- Wall: y=70 to y=155 (85px = 1820mm) -->
      <rect x="30" y="70" width="140" height="85" fill="rgba(14,32,48,.95)" stroke="rgba(74,184,208,.45)" stroke-width="1.5"/>
      <!-- Panel vertical joins (910mm grid → ~48px wide each panel at 140px total → 2 panels + 1 join) -->
      <line x1="30" y1="70" x2="30" y2="155" stroke="rgba(74,184,208,.6)" stroke-width="1.5"/>
      <line x1="79" y1="70" x2="79" y2="155" stroke="rgba(74,184,208,.3)" stroke-width=".8" stroke-dasharray="3,2"/>
      <line x1="128" y1="70" x2="128" y2="155" stroke="rgba(74,184,208,.3)" stroke-width=".8" stroke-dasharray="3,2"/>
      <line x1="170" y1="70" x2="170" y2="155" stroke="rgba(74,184,208,.6)" stroke-width="1.5"/>
      <!-- South window -->
      <rect x="104" y="82" width="52" height="45" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="1.5"/>
      <text x="130" y="108" fill="#888" font-size="6.5" text-anchor="middle">南窓 780×1170</text>
      <!-- Door -->
      <rect x="162" y="115" width="20" height="40" fill="rgba(50,32,12,.4)" stroke="#888" stroke-width="1"/>
      <!-- Loft zone (upper half of wall) -->
      <rect x="32" y="70" width="44" height="42" fill="rgba(80,184,160,.08)" stroke="rgba(80,184,160,.3)" stroke-width="1" stroke-dasharray="2,2"/>
      <text x="54" y="95" fill="rgba(80,184,160,.6)" font-size="6.5" text-anchor="middle">ロフト</text>
      <!-- Height dimension: wall height = 1820mm -->
      <line x1="14" y1="70" x2="14" y2="155" stroke="rgba(74,184,208,.4)" stroke-width=".8"/>
      <line x1="10" y1="70" x2="18" y2="70" stroke="rgba(74,184,208,.6)" stroke-width=".8"/>
      <line x1="10" y1="155" x2="18" y2="155" stroke="rgba(74,184,208,.6)" stroke-width=".8"/>
      <text x="100" y="167" fill="rgba(74,184,208,.5)" font-size="6" text-anchor="middle">壁高 1,820mm（SIPs 910×1820mm 単層）</text>
      <!-- Width dimension -->
      <line x1="30" y1="163" x2="170" y2="163" stroke="#444" stroke-width="1"/>
      <text x="100" y="173" fill="#444" font-size="7" text-anchor="middle">3,640 mm</text>
    </svg>`,
  },

  // ===== STANDARD (24.8m²) =====
  {
    id: "standard",
    name: "SU",
    label: "24.8m²",
    area: 24.8,
    dims: "W 5,460 × D 4,550 mm",
    weeks: 8,
    tag: "本ガイドの標準",
    tagColor: "#c8a455",
    desc: "24.8m²で1人の完全な生活が成立する最小単位。南面フルガラス+北面黒ガルバの対比。910×1820mm標準OSBパネルを2枚積みすることで天井高3.0〜3.2mを実現——山小屋とは思えない縦への開放感。SIPsの断面が素材感を語る。",
    totalMat: 3272168,
    subsidyMax: 2350000,
    coldClimateUpgrade: 500000,
    rentPerNight: 25000,
    color: "#c8a455",
    img: "/img/build/standard.jpg",
    specs: [
      {k:"延床面積", v:"24.8 m²（7.5坪）"},
      {k:"外形寸法", v:"W 5,460 × D 4,550 × H 4,200 mm"},
      {k:"構造", v:"木造軸組 + SIPsパネル"},
      {k:"断熱性能", v:"UA値 0.16 W/m²K（HEAT20 G3）"},
      {k:"天井高", v:"3,000〜3,200mm（SIPs 910×1820mm 2枚積み）"},
      {k:"気密性能", v:"C値 0.2 以下"},
      {k:"暖房", v:"ロケットマスヒーター（薪）"},
      {k:"電力", v:"800W + 5kWh"},
      {k:"耐震等級", v:"等級2 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"要（10m²超）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:1400000,color:"#c8a455",url:"",
       alt:"在来工法に変更でコスト▲¥80万、工期+2週",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"80 m²",unit:"¥11,000/m²",total:880000,note:"標準OSBサイズ・特注カット不要・2枚積みで天井高3.0m対応"},
         {name:"SIPsパネル 屋根用 200mm",qty:"35 m²",unit:"¥14,000/m²",total:490000,note:""},
         {name:"スプラインジョイント材",qty:"一式",unit:"¥30,000",total:30000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:203000,color:"#f0c040",url:"",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"2枚",unit:"¥15,000/枚",total:30000,note:"4×200Wと同ワット数・設置工数半減"},
         {name:"LiFePO4 48V 100Ah + 3kW インバーター一式",qty:"1式",unit:"¥120,000",total:120000,note:"≈4.8kWh・DELTA Pro3比57%削減"},
         {name:"MPPT 60A + 配線一式",qty:"1式",unit:"¥53,000",total:53000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:333000,color:"#4ab8d0",url:"",
       items:[
         {name:"樹脂窓 南面大窓 W1690×H1830",qty:"1枚",unit:"¥95,000",total:95000,note:"トリプル Low-E"},
         {name:"樹脂窓 W780×H1170",qty:"4枚",unit:"¥38,000/枚",total:152000,note:""},
         {name:"玄関ドア 断熱型",qty:"1枚",unit:"¥68,000",total:68000,note:""},
         {name:"窓台・額縁材",qty:"一式",unit:"¥18,000",total:18000,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:330500,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"60 m²",unit:"¥2,800/m²",total:168000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"25 m²",unit:"¥3,500/m²",total:87500,note:""},
         {name:"キッチン（シンプルIH）",qty:"1式",unit:"¥45,000",total:45000,note:""},
         {name:"造作棚・収納",qty:"一式",unit:"¥30,000",total:30000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:155000,color:"#50b8a0",url:"",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"1台",unit:"¥75,000",total:75000,note:"スウェーデン製・浄化槽不要"},
         {name:"雨水タンク 1,000L",qty:"1基",unit:"¥35,000",total:35000,note:""},
         {name:"フィルター + UV殺菌 + ポンプ",qty:"1式",unit:"¥45,000",total:45000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:156778,color:"#888",url:"https://www.monotaro.com/p/1339/5302/",
       items:[
         {name:"ガルバリウム波板 黒 0.35mm",qty:"85 m²",unit:"¥1,200/m²",total:102000,note:""},
         {name:"タイベック シルバー",qty:"1巻",unit:"¥19,778",total:19778,note:""},
         {name:"縦胴縁 + コーキング",qty:"一式",unit:"¥35,000",total:35000,note:""},
       ]},
      {cat:"構造材（プレカット）",emoji:"📐",total:165000,color:"#b07850",url:"",
       items:[
         {name:"KD杉 105×105 柱材",qty:"12本",unit:"¥1,200/本",total:14400,note:""},
         {name:"KD杉 105×210 梁材",qty:"8本",unit:"¥2,800/本",total:22400,note:""},
         {name:"KD杉 45×105 間柱 + 野縁",qty:"一式",unit:"¥44,200",total:44200,note:""},
         {name:"構造用合板 28mm 床",qty:"20枚",unit:"¥4,200/枚",total:84000,note:""},
       ]},
      {cat:"暖房（ロケットマスヒーター）",emoji:"🔥",total:118140,color:"#e06030",url:"https://www.monotaro.com/p/4085/3580/",
       items:[
         {name:"耐火レンガ SK-32",qty:"200個",unit:"¥228/個",total:45600,note:""},
         {name:"耐火モルタル 20kg",qty:"5袋",unit:"¥748/袋",total:3740,note:""},
         {name:"ステンレス煙突 Φ150 一式",qty:"1式",unit:"¥68,800",total:68800,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:123150,color:"#7080e0",url:"https://www.monotaro.com/p/2139/1148/",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"20枚",unit:"¥3,956/枚",total:79120,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥44,030",total:44030,note:""},
       ]},
      {cat:"屋根",emoji:"🏠",total:115600,color:"#6070a0",url:"",
       items:[
         {name:"ガルバリウム 立平葺き",qty:"35 m²",unit:"¥2,200/m²",total:77000,note:""},
         {name:"ルーフィング + 棟板金",qty:"一式",unit:"¥38,600",total:38600,note:""},
       ]},
      {cat:"基礎（独立コンクリート）",emoji:"⚓",total:74000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"1.5 m³",unit:"¥18,000/m³",total:27000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥47,000",total:47000,note:""},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:598000, color:"#607080",
       items:[
         {name:"24時間熱交換換気ユニット（第一種・Max-e75VC相当）",qty:"1台",unit:"¥85,000",total:85000,note:"建築基準法対応・熱交換効率90%"},
         {name:"室内配線（コンセント8口・照明4点・分電盤 100A）",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩）処理",qty:"一式",unit:"¥65,000",total:65000,note:""},
         {name:"建具金物（ドアノブ・蝶番・錠前）",qty:"一式",unit:"¥28,000",total:28000,note:""},
         {name:"運搬費（弟子屈まで・4tトラック）",qty:"1式",unit:"¥300,000",total:300000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"基礎工事",icon:"⚓",cost:71000,diff:"★★★☆☆",people:"2〜3人",
       desc:"地面を掘り、コンクリート独立基礎を6点打つ。凍結深度1,000mm。レンタルミニユンボで効率化。",tools:["ミニユンボ（レンタル）","型枠板","鉄筋"],tips:"打設後は最低7日養生。凍結前に完了。"},
      {week:"W2",phase:"土台・床組み",icon:"🪵",cost:165000,diff:"★★☆☆☆",people:"2人",
       desc:"プレカット済みの土台・大引を組む。28mm剛床合板を張る。",tools:["インパクト","丸ノコ","水平器"],tips:"土台は防腐処理材。床合板の継ぎ目は大引の上で割り付け。"},
      {week:"W3",phase:"棟上げ",icon:"🏗️",cost:0,diff:"★★★★☆",people:"4人（1日）",
       desc:"プレカット材で柱・梁・母屋を一気に組む。4人・8時間で棟上げ完了。",tools:["インパクト","ハンマー","仮筋交い"],tips:"番号通りに組むだけ。前日に並び順を確認しておく。"},
      {week:"W4",phase:"SIPsパネル取付",icon:"🔷",cost:1400000,diff:"★★★☆☆",people:"4人",
       desc:"工場製作SIPsパネルを壁・屋根に建て込む。スプライン接合→コーキングで断熱完成。",tools:["インパクト","コーキングガン","クランプ"],tips:"継ぎ目の気密処理が断熱性能を決める。"},
      {week:"W5",phase:"外装仕上げ",icon:"🖤",cost:272378,diff:"★★★☆☆",people:"2人",
       desc:"タイベック→胴縁→黒ガルバリウム外壁。屋根は立平葺き。",tools:["丸ノコ","タッカー","脚立"],tips:"通気層21mmは省かないこと。"},
      {week:"W6",phase:"窓・気密処理",icon:"🪟",cost:456150,diff:"★★☆☆☆",people:"2人",
       desc:"樹脂トリプルガラス窓・断熱ドア取付。全周気密テープ施工→C値測定。",tools:["気密テープ","コーキングガン","測定機"],tips:"C値0.5以上なら漏れ箇所を徹底的に修正。"},
      {week:"W7",phase:"設備工事",icon:"🔥",cost:834024,diff:"★★★★☆",people:"2〜3人",
       desc:"ロケットマスヒーター築炉・太陽光配線・雨水タンク・コンポストトイレ設置。",tools:["耐火レンガ","配線工具","配管工具"],tips:"電気配線の一部は電気工事士委託（約¥5万）。"},
      {week:"W8",phase:"内装・竣工",icon:"✨",cost:330500,diff:"★★☆☆☆",people:"2人",
       desc:"杉羽目板・フローリング張り、造作棚・キッチン設置。清掃・検査で完成。",tools:["フィニッシュネイラー","丸ノコ","塗料"],tips:"杉無垢は養生をしっかり。"},
    ],
    routes: [
      {name:"セルフビルド",cost:3272168,color:"#c8a455",hi:true},
      {name:"補助金後（子育て）",cost:922168,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:7500000,color:"#555"},
      {name:"コンテナ改造",cost:2800000,color:"#555"},
    ],
    floorSvg: `<svg viewBox="0 0 280 260" style="width:100%;background:#050505;display:block">
      <rect x="20" y="20" width="240" height="200" fill="none" stroke="#c8a455" stroke-width="3.5"/>
      <line x1="20" y1="128" x2="180" y2="128" stroke="#555" stroke-width="1.5"/>
      <line x1="180" y1="20" x2="180" y2="220" stroke="#555" stroke-width="1.5"/>
      <line x1="20" y1="172" x2="20" y2="200" stroke="#050505" stroke-width="6"/>
      <path d="M20 172 Q42 172 42 194" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="52" y="216" width="124" height="7" fill="#4ab8d0" opacity=".7"/>
      <rect x="254" y="48" width="7" height="56" fill="#4ab8d0" opacity=".7"/>
      <rect x="254" y="148" width="7" height="46" fill="#4ab8d0" opacity=".7"/>
      <text x="96" y="72" fill="#ddd" font-size="10" text-anchor="middle">居間・ダイニング</text>
      <text x="96" y="86" fill="#555" font-size="8" text-anchor="middle">14.8 m²</text>
      <text x="216" y="74" fill="#ddd" font-size="9" text-anchor="middle">寝室</text>
      <text x="216" y="87" fill="#555" font-size="8" text-anchor="middle">5.2 m²</text>
      <text x="216" y="170" fill="#ddd" font-size="9" text-anchor="middle">水回り</text>
      <text x="216" y="183" fill="#555" font-size="8" text-anchor="middle">4.8 m²</text>
      <text x="114" y="244" fill="#555" font-size="8" text-anchor="middle">南面大窓 W1,690</text>
      <text x="114" y="254" fill="#444" font-size="7" text-anchor="middle">↑ 南 / SOUTH</text>
      <circle cx="56" cy="113" r="8" fill="rgba(224,96,48,.18)" stroke="rgba(224,96,48,.55)" stroke-width="1.5"/>
      <text x="56" y="117" fill="rgba(224,96,48,.8)" font-size="7" text-anchor="middle">炉</text>
      <text x="20" y="12" fill="#c8a455" font-size="8" font-weight="bold">SU — 24.8m²</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 280 230" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="200" x2="270" y2="200" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="70" width="220" height="130" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,70 140,18 260,70" fill="rgba(26,26,26,.98)" stroke="#c8a455" stroke-width="2"/>
      <rect x="67" y="7" width="14" height="63" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="51" y="108" width="134" height="82" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="118" y1="108" x2="118" y2="190" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="208" y="142" width="34" height="58" fill="rgba(55,36,18,.4)" stroke="#666" stroke-width="1.5"/>
      <rect x="80" y="20" width="60" height="20" fill="rgba(200,164,85,.15)" stroke="rgba(200,164,85,.3)" stroke-width="1" rx="2"/>
      <text x="110" y="33" fill="rgba(200,164,85,.7)" font-size="7.5" text-anchor="middle">ソーラーパネル</text>
      <line x1="30" y1="208" x2="250" y2="208" stroke="#444" stroke-width="1"/>
      <text x="140" y="220" fill="#444" font-size="8.5" text-anchor="middle">5,460 mm</text>
      <text x="20" y="12" fill="#c8a455" font-size="8" font-weight="bold">SU — 南立面</text>
    </svg>`,
  },

  // ===== TAMA (27m² ジオデシックドーム) =====
  {
    id: "dome",
    name: "TAMA",
    label: "27m² ドーム",
    area: 27,
    dims: "直径 5,900mm × 高さ 2,500mm（2V ジオデシック）",
    weeks: 8,
    tag: "端材＜5%・910mmモジュール最適化 2Vジオデシックドーム",
    tagColor: "#50b8d0",
    desc: "B辺1,820mm（2×910mm）でSIPsパネルの端材を5%以下に抑えた2Vジオデシック。内側はOSBとストラットを黒塗装のまま露出——幾何学が内装になる。頂上の五角形パネルをガラスにすると垂直の光柱が室内中央に落ちる。焼杉外装にすると森に溶け込む黒い球体になる。",
    totalMat: 2986900,
    subsidyMax: 400000,
    coldClimateUpgrade: 250000,
    rentPerNight: 30000,
    color: "#50b8d0",
    img: "/img/build/tama.jpg",
    lifeImgs: [
      {src:"/img/dome_interior_projector.webp", cap:"プロジェクターで映画、球体の光"},
      {src:"/img/dome_summer_deck.webp",        cap:"夏、デッキでキャンプファイアを囲む"},
      {src:"/img/kumaushi_c_dome_interior_winter.webp", cap:"雪の日、薪ストーブで温まる"},
      {src:"/img/kumaushi_c_snow_dome_night.webp",      cap:"夜は満天の星の下に黒い球体"},
      {src:"/img/instant_dome_interior.webp",           cap:"幾何学が内装になる、OSB露し"},
      {src:"/img/dome_exterior_winter.webp",            cap:"北海道の冬、雪原の中に佇む"},
    ],
    specs: [
      {k:"延床面積", v:"27 m²（π×2.95²）"},
      {k:"外形寸法", v:"直径 5,900mm × 高さ 2,500mm"},
      {k:"構造", v:"2V ジオデシック（SIPsパネル三角組み）"},
      {k:"断熱性能", v:"UA値 0.28 W/m²K（SIPs 160mm）"},
      {k:"B辺長", v:"1,820mm（2×910mm — 端材ゼロ）"},
      {k:"A辺長", v:"1,610mm（端材率＜5%）"},
      {k:"パネル枚数", v:"A型×25枚 + B型×15枚 = 計40枚"},
      {k:"ストラット", v:"A辺×30本 + B辺×35本 = 計65本"},
      {k:"耐震等級", v:"等級2 想定（ジオデシック・構造特性別計算）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必要（27m²・4号建築物）"},
    ],
    materials: [
      {cat:"基礎（スクリュー杭）", emoji:"🔩", total:90000, color:"#4080e0",
       items:[
         {name:"スクリュー杭 φ89mm×1,500mm",qty:"6本",unit:"¥15,000/本",total:90000,note:"1日施工・コンクリート不要"},
       ]},
      {cat:"ジオデシックフレーム", emoji:"🔺", total:380000, color:"#50b8d0",
       items:[
         {name:"ハブ金物（レーザーカット鉄板）",qty:"26個",unit:"¥10,000/個",total:260000,note:"全26頂点・5又/6又対応"},
         {name:"A辺ストラット 2×6 SPF 1,610mm",qty:"30本",unit:"¥1,500/本",total:45000,note:"30本×1,610mm"},
         {name:"B辺ストラット 2×6 SPF 1,820mm",qty:"35本",unit:"¥1,260/本",total:44000,note:"35本×1,820mm"},
         {name:"組立ボルト・ナット 構造用 M12一式",qty:"一式",unit:"¥31,000",total:31000,note:""},
       ]},
      {cat:"SIPsパネル A型（三角カスタム）", emoji:"🏗️", total:700000, color:"#c8a455",
       items:[
         {name:"SIPs A型 1820×1328mm カスタム切 160mm",qty:"13枚",unit:"¥53,800/枚",total:700000,note:"1枚からA型パネル2枚取り・端材ほぼゼロ"},
       ]},
      {cat:"SIPsパネル B型（正三角カスタム）", emoji:"🏗️", total:520000, color:"#c8a455",
       items:[
         {name:"SIPs B型 1820×1575mm カスタム切 160mm",qty:"8枚",unit:"¥65,000/枚",total:520000,note:"辺1820mm正三角形・2枚取り・0%廃材"},
       ]},
      {cat:"床（断熱スラブ）", emoji:"🟫", total:153900, color:"#a07850",
       items:[
         {name:"スタイロフォーム 100mm",qty:"27 m²",unit:"¥3,200/m²",total:86400,note:""},
         {name:"構造用合板 28mm 床",qty:"27 m²",unit:"¥2,500/m²",total:67500,note:""},
       ]},
      {cat:"開口部", emoji:"🪟", total:200000, color:"#4ab8d0",
       items:[
         {name:"断熱ドア K2.0",qty:"1枚",unit:"¥120,000/枚",total:120000,note:""},
         {name:"頂上五角形 apex ガラスパネル",qty:"1基",unit:"¥80,000/基",total:80000,note:"ドーム頂点の五角形パネルをガラス化。垂直の光柱が室内中央に落ちる"},
       ]},
      {cat:"防水・気密", emoji:"🔒", total:160000, color:"#888",
       items:[
         {name:"三角継ぎ目シーリング（ポリウレタン）",qty:"65箇所",unit:"¥1,400/箇所",total:91000,note:"ストラット数と同数"},
         {name:"気密テープ・防水シート",qty:"一式",unit:"¥69,000",total:69000,note:""},
       ]},
      {cat:"内装・仕上げ（構造露し）", emoji:"🖤", total:230000, color:"#222",
       items:[
         {name:"OSB面露し仕上げ（研磨+蜜蝋ワックス）",qty:"一式",unit:"¥55,000",total:55000,note:"SIPsのOSB内面をそのまま内装に。研磨後ワックス仕上げで質感向上"},
         {name:"ストラット+ハブ 黒スプレー塗装",qty:"一式",unit:"¥45,000",total:45000,note:"65ストラット・26ハブを艶消し黒塗装。幾何学がそのまま内装になる"},
         {name:"外装黒塗料（防水外部用）全パネル",qty:"47 m²",unit:"¥1,702/m²",total:80000,note:"SIPs外面OSBを防水黒塗装。焼杉効果をコスト1/10で実現"},
         {name:"六角形デッキ（端材活用）",qty:"一式",unit:"¥50,000",total:50000,note:"SIPsカット端材で六角形アウトドアデッキ。廃材ゼロ化"},
       ]},
      {cat:"オフグリッド電力", emoji:"☀️", total:200000, color:"#f0c040",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"2枚",unit:"¥15,000/枚",total:30000,note:""},
         {name:"LiFePO4 48V 100Ah + 3kW インバーター一式",qty:"1式",unit:"¥120,000",total:120000,note:"≈4.8kWh"},
         {name:"MPPT 60A + 配線一式",qty:"1式",unit:"¥50,000",total:50000,note:""},
       ]},
      {cat:"暖房（小型薪ストーブ）", emoji:"🔥", total:80000, color:"#e06030",
       items:[
         {name:"小型鋼板薪ストーブ",qty:"1台",unit:"¥35,000",total:35000,note:""},
         {name:"煙突一式 Φ120（ドーム天頂部貫通）",qty:"1式",unit:"¥45,000",total:45000,note:""},
       ]},
      {cat:"給排水・衛生", emoji:"💧", total:120000, color:"#50b8a0",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"1台",unit:"¥75,000",total:75000,note:"浄化槽不要"},
         {name:"雨水タンク 500L",qty:"1基",unit:"¥18,000",total:18000,note:""},
         {name:"フィルター+UV殺菌+ポンプ一式",qty:"1式",unit:"¥27,000",total:27000,note:""},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:403000, color:"#607080",
       items:[
         {name:"小型換気扇 Φ100（天頂部設置・法定24h換気）",qty:"1台",unit:"¥18,000",total:18000,note:"建築基準法対応"},
         {name:"室内配線（コンセント6口・照明3点・分電盤）",qty:"一式",unit:"¥95,000",total:95000,note:""},
         {name:"防水シール追加・建具金物",qty:"一式",unit:"¥40,000",total:40000,note:""},
         {name:"運搬費（弟子屈まで・4tトラック）",qty:"1式",unit:"¥250,000",total:250000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"スクリュー杭基礎",icon:"🔩",cost:90000,diff:"★☆☆☆☆",people:"2人",
       desc:"スクリュー杭6点を1日で圧入。翌日から床工事に進める。杭頭レベル出しが精度を決める。",
       tools:["スクリュー杭施工機（レンタル）","水平器","墨壺"],tips:"六角形配置で打つ。中心から外周6点。"},
      {week:"W2",phase:"床断熱・合板",icon:"🟫",cost:154000,diff:"★★☆☆☆",people:"2人",
       desc:"スタイロ100mmを敷き詰め、構造合板28mmを張る。円形下地が後のパネル取付精度を決める。",
       tools:["丸ノコ","インパクト","コンパス"],tips:"円の外周部は合板をカットして合わせる。"},
      {week:"W3",phase:"ハブ+ストラット組立",icon:"🔺",cost:180000,diff:"★★★☆☆",people:"3人",
       desc:"26個のハブ金物にストラット65本をボルト締め。頂点から順番に組み上げる。足場・脚立必須。",
       tools:["インパクト","スパナ","脚立"],tips:"A辺30本とB辺35本を混在させないようテープで区別。"},
      {week:"W4〜5",phase:"SIPsパネル取付",icon:"🏗️",cost:760000,diff:"★★★★☆",people:"4人",
       desc:"A型25枚→B型15枚の順で取付。各パネルをフレームにビス止め+スプライン接合。継ぎ目の気密処理を念入りに。",
       tools:["インパクト","コーキングガン","安全帯"],tips:"上から順に取り付ける。頂上付近は安全帯必須。"},
      {week:"W6",phase:"気密・防水シーリング",icon:"🔒",cost:60000,diff:"★★☆☆☆",people:"2人",
       desc:"65箇所の継ぎ目にシーリング。ドームは雨の流れ方が独特なので頂上から水が溜まる箇所を先に処理。",
       tools:["コーキングガン","養生テープ"],tips:"雨天後に光を当てて漏れ確認するとよい。"},
      {week:"W7",phase:"内装（杉羽目板）",icon:"🪵",cost:176000,diff:"★★★☆☆",people:"2人",
       desc:"曲面に沿って羽目板を短冊状に張る。三角形状の壁面は板を扇状にカットして対応。",
       tools:["丸ノコ","タッカー","脚立"],tips:"曲面部は細めの板（90mm幅）の方が隙間が出にくい。"},
      {week:"W8",phase:"ドア・天窓・竣工",icon:"✨",cost:200000,diff:"★★☆☆☆",people:"2人",
       desc:"ドア取付・天窓設置・ソーラー接続・コンポストトイレ設置。仕上げ清掃と気密検査で完了。",
       tools:["電動ドリル","コーキングガン","気密測定器"],tips:"天窓の防水フラッシングを丁寧に。"},
    ],
    routes: [
      {label:"セルフビルド",cost:2986900,desc:"材料費のみ。工期8週間（延べ20人工）"},
      {label:"補助金後",cost:2586900,desc:"こどもエコすまい支援事業等 最大40万円活用後"},
      {label:"寒冷地仕様（北海道）",cost:3236900,desc:"基礎深め＋3層ガラス＋断熱厚増 +¥25万"},
      {label:"ワークパーティー施工",cost:2836900,desc:"SOLUNAビレッジメンバーとの共同作業"},
    ],
    floorSvg: `<svg viewBox="-2 -2 124 140" xmlns="http://www.w3.org/2000/svg" fill="none">
      <circle cx="60" cy="65" r="50" fill="rgba(80,184,208,.07)" stroke="#50b8d0" stroke-width="1.5"/>
      <g stroke="rgba(80,184,208,.35)" stroke-width=".8">
        <line x1="60" y1="65" x2="60" y2="15"/>
        <line x1="60" y1="65" x2="107" y2="49"/>
        <line x1="60" y1="65" x2="89" y2="106"/>
        <line x1="60" y1="65" x2="31" y2="106"/>
        <line x1="60" y1="65" x2="13" y2="49"/>
      </g>
      <polygon points="60,45 79,59 72,81 48,81 41,59" fill="none" stroke="rgba(80,184,208,.45)" stroke-width=".8"/>
      <g stroke="rgba(80,184,208,.22)" stroke-width=".55">
        <line x1="60" y1="15" x2="82" y2="34"/>
        <line x1="60" y1="15" x2="38" y2="34"/>
        <line x1="107" y1="49" x2="96" y2="77"/>
        <line x1="107" y1="49" x2="82" y2="34"/>
        <line x1="89" y1="106" x2="96" y2="77"/>
        <line x1="89" y1="106" x2="60" y2="103"/>
        <line x1="31" y1="106" x2="60" y2="103"/>
        <line x1="31" y1="106" x2="24" y2="77"/>
        <line x1="13" y1="49" x2="24" y2="77"/>
        <line x1="13" y1="49" x2="38" y2="34"/>
      </g>
      <g fill="#50b8d0" opacity=".8">
        <circle cx="60" cy="65" r="2.2"/>
        <circle cx="60" cy="45" r="1.5"/>
        <circle cx="79" cy="59" r="1.5"/>
        <circle cx="72" cy="81" r="1.5"/>
        <circle cx="48" cy="81" r="1.5"/>
        <circle cx="41" cy="59" r="1.5"/>
      </g>
      <text x="60" y="126" fill="rgba(80,184,208,.7)" font-size="7" text-anchor="middle" font-weight="700">Ø 5,900mm — 2V ジオデシック</text>
      <text x="60" y="135" fill="rgba(80,184,208,.4)" font-size="6" text-anchor="middle">床面積 27m²</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 145 100" xmlns="http://www.w3.org/2000/svg" fill="none">
      <ellipse cx="72" cy="83" rx="56" ry="4" fill="rgba(0,0,0,.35)"/>
      <path d="M16,80 A56,56 0 0,1 128,80" fill="rgba(80,184,208,.07)" stroke="#50b8d0" stroke-width="1.4"/>
      <g stroke="rgba(80,184,208,.38)" stroke-width=".7">
        <line x1="28" y1="55" x2="116" y2="55"/>
        <line x1="42" y1="35" x2="102" y2="35"/>
      </g>
      <g stroke="rgba(80,184,208,.22)" stroke-width=".55">
        <line x1="72" y1="24" x2="16" y2="80"/>
        <line x1="72" y1="24" x2="128" y2="80"/>
        <line x1="72" y1="24" x2="28" y2="55"/>
        <line x1="72" y1="24" x2="116" y2="55"/>
        <line x1="28" y1="55" x2="42" y2="35"/>
        <line x1="116" y1="55" x2="102" y2="35"/>
        <line x1="28" y1="55" x2="16" y2="80"/>
        <line x1="116" y1="55" x2="128" y2="80"/>
      </g>
      <circle cx="72" cy="24" r="2.5" fill="#50b8d0"/>
      <line x1="133" y1="24" x2="133" y2="80" stroke="rgba(80,184,208,.4)" stroke-width=".5"/>
      <line x1="130" y1="24" x2="136" y2="24" stroke="rgba(80,184,208,.4)" stroke-width=".5"/>
      <line x1="130" y1="80" x2="136" y2="80" stroke="rgba(80,184,208,.4)" stroke-width=".5"/>
      <text x="141" y="55" fill="rgba(80,184,208,.6)" font-size="6" text-anchor="middle">2,500</text>
      <line x1="5" y1="80" x2="137" y2="80" stroke="#222" stroke-width=".8"/>
      <text x="72" y="94" fill="rgba(80,184,208,.7)" font-size="6.5" text-anchor="middle" font-weight="700">直径 5,900mm（B辺=1,820mm=2×910mm）</text>
      <text x="8" y="12" fill="#50b8d0" font-size="8" font-weight="bold">TAMA — 南立面（2V ジオデシック・28面体）</text>
    </svg>`,
  },

  // ===== LARGE (40m²) =====
  {
    id: "large",
    name: "AN",
    label: "40m²",
    area: 40,
    dims: "W 7,280 × D 5,460 mm",
    weeks: 11,
    tag: "ファミリー向け",
    tagColor: "#e08030",
    desc: "40m²は一家族が快適に暮らせる最小限。南面大開口＋デッキ一体化に加え、910×1820mm標準OSBを2枚積みした天井高3.0〜3.2mが空間を縦に解放する。露し梁と漆喰内壁の対比が平屋とは思えないスケール感をつくる。",
    totalMat: 5148600,
    subsidyMax: 2350000,
    coldClimateUpgrade: 800000,
    rentPerNight: 38000,
    color: "#e08030",
    img: "/img/build/large.jpg",
    specs: [
      {k:"延床面積", v:"40 m²（12.1坪）"},
      {k:"外形寸法", v:"W 7,280 × D 5,460 × H 4,500 mm"},
      {k:"間取り", v:"LDK + 寝室2 + 水回り + デッキ"},
      {k:"構造", v:"木造軸組 + SIPsパネル"},
      {k:"断熱性能", v:"UA値 0.14 W/m²K"},
      {k:"天井高", v:"3,000〜3,200mm（SIPs 910×1820mm 2枚積み）"},
      {k:"暖房", v:"ロケットマスヒーター + 床下蓄熱"},
      {k:"電力", v:"1,600W + 10kWh"},
      {k:"耐震等級", v:"等級3 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"要（30〜50m²届出範囲）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:2340000,color:"#e08030",url:"",
       alt:"",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"140 m²",unit:"¥11,000/m²",total:1540000,note:"標準OSBサイズ・2枚積みで天井高3.0m対応"},
         {name:"SIPsパネル 屋根用 200mm",qty:"55 m²",unit:"¥14,000/m²",total:770000,note:""},
         {name:"スプライン・コーキング材",qty:"一式",unit:"¥30,000",total:30000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:340000,color:"#f0c040",url:"",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"4枚",unit:"¥15,000/枚",total:60000,note:"8×200Wと同ワット数"},
         {name:"LiFePO4 48V 200Ah + 5kW インバーター一式",qty:"1式",unit:"¥200,000",total:200000,note:"≈9.6kWh・DELTA Pro3×2台比64%削減"},
         {name:"MPPT 100A + 配線一式",qty:"1式",unit:"¥80,000",total:80000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:580000,color:"#4ab8d0",url:"",
       items:[
         {name:"南面大窓 W2730×H1830",qty:"1枚",unit:"¥160,000",total:160000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170",qty:"6枚",unit:"¥38,000/枚",total:228000,note:""},
         {name:"玄関ドア 断熱型",qty:"1枚",unit:"¥85,000",total:85000,note:""},
         {name:"デッキ用引き戸 断熱",qty:"1枚",unit:"¥107,000",total:107000,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:580000,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"100 m²",unit:"¥2,800/m²",total:280000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"40 m²",unit:"¥3,500/m²",total:140000,note:""},
         {name:"システムキッチン（IH + 食洗機）",qty:"1式",unit:"¥120,000",total:120000,note:""},
         {name:"造作棚・収納・洗面台",qty:"一式",unit:"¥40,000",total:40000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:225000,color:"#50b8a0",url:"",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"1台",unit:"¥75,000",total:75000,note:"スウェーデン製・浄化槽不要"},
         {name:"雨水タンク 2,000L",qty:"1基",unit:"¥55,000",total:55000,note:""},
         {name:"フィルター + UV + ポンプ一式",qty:"1式",unit:"¥45,000",total:45000,note:""},
         {name:"バスユニット（簡易シャワー）",qty:"1式",unit:"¥50,000",total:50000,note:""},
       ]},
      {cat:"ウッドデッキ",emoji:"🌳",total:108000,color:"#507840",url:"",
       items:[
         {name:"国産杉 ACQ防腐処理 デッキ材",qty:"15 m²",unit:"¥3,200/m²",total:48000,note:"耐久20年以上・イタウバ比60%削減"},
         {name:"根太・束柱・幕板",qty:"一式",unit:"¥60,000",total:60000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:235000,color:"#888",url:"",
       items:[
         {name:"ガルバリウム波板 黒",qty:"130 m²",unit:"¥1,200/m²",total:156000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥79,000",total:79000,note:""},
       ]},
      {cat:"構造材（プレカット）",emoji:"📐",total:280000,color:"#b07850",url:"",
       items:[
         {name:"KD杉 105×105 柱材",qty:"18本",unit:"¥1,200/本",total:21600,note:""},
         {name:"KD杉 105×210 梁材",qty:"14本",unit:"¥2,800/本",total:39200,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥50,000",total:50000,note:""},
         {name:"構造用合板 28mm 床",qty:"32枚",unit:"¥4,200/枚",total:134400,note:""},
         {name:"大引・束一式",qty:"一式",unit:"¥34,800",total:34800,note:""},
       ]},
      {cat:"暖房（ロケットマスヒーター）",emoji:"🔥",total:145600,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"280個",unit:"¥228/個",total:63840,note:""},
         {name:"蓄熱ベンチ用コンクリート",qty:"0.3 m³",unit:"¥18,000/m³",total:5400,note:""},
         {name:"煙突 Φ150 一式",qty:"1式",unit:"¥76,360",total:76360,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:190000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"40 m²",unit:"¥2,000/m²",total:80000,note:""},
         {name:"気密テープ + 先張りシート 一式",qty:"一式",unit:"¥110,000",total:110000,note:""},
       ]},
      {cat:"基礎（独立コンクリート 8点）",emoji:"⚓",total:115000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"2.5 m³",unit:"¥18,000/m³",total:45000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥70,000",total:70000,note:""},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:810000, color:"#607080",
       items:[
         {name:"24時間熱交換換気ユニット（第一種・換気量150m³/h）",qty:"1台",unit:"¥100,000",total:100000,note:"建築基準法対応"},
         {name:"室内配線（コンセント12口・照明6点・分電盤 150A）",qty:"一式",unit:"¥180,000",total:180000,note:""},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩）処理",qty:"一式",unit:"¥90,000",total:90000,note:""},
         {name:"建具金物（ドアノブ×4・蝶番・錠前・引き戸レール）",qty:"一式",unit:"¥40,000",total:40000,note:""},
         {name:"運搬費（弟子屈まで・4tトラック×2便）",qty:"1式",unit:"¥400,000",total:400000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜2",phase:"基礎工事",icon:"⚓",cost:110000,diff:"★★★☆☆",people:"3人",
       desc:"独立基礎8点、凍結深度1,000mm。ミニユンボ必須。2週間でしっかり養生。",tools:["ミニユンボ","型枠","生コン"],tips:"8点基礎は対角線でレベルを確認。"},
      {week:"W3",phase:"土台・床組み",icon:"🪵",cost:280000,diff:"★★☆☆☆",people:"2〜3人",
       desc:"プレカット材で土台・大引・根太を組む。32枚の剛床合板を張る。",tools:["インパクト","丸ノコ","水平器"],tips:"スパンが長いので大引の間隔に注意。"},
      {week:"W4",phase:"棟上げ",icon:"🏗️",cost:0,diff:"★★★★☆",people:"5〜6人（1日）",
       desc:"大型になるため人手が必要。レンタルミニクレーン（¥40,000/日）の活用も検討。",tools:["インパクト","仮筋交い","クランプ"],tips:"大梁はミニクレーンで吊ると安全・確実。"},
      {week:"W5〜6",phase:"SIPsパネル取付",icon:"🔷",cost:2340000,diff:"★★★☆☆",people:"4人",
       desc:"壁・屋根パネルを建て込む。大型なので2週間かける。継ぎ目の気密処理を念入りに。",tools:["インパクト","コーキングガン","クランプ"],tips:"屋根パネルは安全帯必須。"},
      {week:"W7",phase:"外装・デッキ",icon:"🌳",cost:415000,diff:"★★★☆☆",people:"2〜3人",
       desc:"ガルバ外壁・屋根仕上げ＋ウッドデッキの骨組みと床張り。",tools:["丸ノコ","タッカー","インパクト"],tips:"デッキ材は事前に塗料処理しておくと耐久性アップ。"},
      {week:"W8",phase:"窓・気密処理",icon:"🪟",cost:580000,diff:"★★☆☆☆",people:"2人",
       desc:"大型南面窓・引き戸・玄関ドアを取付。C値測定で0.2以下を確認。",tools:["気密テープ","測定機"],tips:"引き戸の気密処理は特に念入りに。"},
      {week:"W9〜10",phase:"設備工事",icon:"🔥",cost:1175000,diff:"★★★★☆",people:"3人",
       desc:"ロケットマスヒーター築炉（蓄熱ベンチ付き）、8枚ソーラー配線、雨水2,000L。",tools:["耐火レンガ","配線工具","配管工具"],tips:"蓄熱ベンチがあると夜間も暖かさが持続。"},
      {week:"W11",phase:"内装・竣工",icon:"✨",cost:580000,diff:"★★☆☆☆",people:"2〜3人",
       desc:"羽目板・フローリング・キッチン・洗面台を設置。清掃・検査で完成。",tools:["フィニッシュネイラー","丸ノコ"],tips:"40m²なら本格的な生活空間が完成。"},
    ],
    routes: [
      {name:"セルフビルド",cost:5148600,color:"#e08030",hi:true},
      {name:"補助金後",cost:2798600,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:12000000,color:"#555"},
      {name:"ユニット工法",cost:6500000,color:"#555"},
    ],
    floorSvg: `<svg viewBox="0 0 320 260" style="width:100%;background:#050505;display:block">
      <rect x="20" y="20" width="260" height="200" fill="none" stroke="#e08030" stroke-width="3.5"/>
      <line x1="20" y1="128" x2="280" y2="128" stroke="#555" stroke-width="1.5"/>
      <line x1="180" y1="20" x2="180" y2="128" stroke="#555" stroke-width="1.5"/>
      <line x1="200" y1="128" x2="200" y2="220" stroke="#555" stroke-width="1.5"/>
      <line x1="20" y1="172" x2="20" y2="200" stroke="#050505" stroke-width="6"/>
      <path d="M20 172 Q38 172 38 190" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="55" y="216" width="160" height="7" fill="#4ab8d0" opacity=".7"/>
      <rect x="296" y="40" width="7" height="60" fill="#4ab8d0" opacity=".7"/>
      <rect x="296" y="140" width="7" height="50" fill="#4ab8d0" opacity=".7"/>
      <text x="96" y="68" fill="#ddd" font-size="10" text-anchor="middle">LDK</text>
      <text x="96" y="82" fill="#555" font-size="7.5" text-anchor="middle">22 m²</text>
      <text x="236" y="68" fill="#ddd" font-size="10" text-anchor="middle">寝室 1</text>
      <text x="236" y="82" fill="#555" font-size="7.5" text-anchor="middle">9 m²</text>
      <text x="96" y="174" fill="#ddd" font-size="9" text-anchor="middle">寝室 2</text>
      <text x="96" y="187" fill="#555" font-size="7.5" text-anchor="middle">7 m²</text>
      <text x="244" y="174" fill="#ddd" font-size="9" text-anchor="middle">水回り</text>
      <text x="244" y="187" fill="#555" font-size="7.5" text-anchor="middle">4 m²</text>
      <rect x="280" y="20" width="40" height="200" fill="rgba(80,120,64,.15)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="300" y="118" fill="#507840" font-size="7" text-anchor="middle" transform="rotate(90,300,118)">デッキ 15m²</text>
      <circle cx="52" cy="108" r="8" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.55)" stroke-width="1.5"/>
      <text x="52" y="112" fill="rgba(224,96,48,.8)" font-size="7" text-anchor="middle">炉</text>
      <text x="20" y="12" fill="#e08030" font-size="8" font-weight="bold">AN — 40m² + デッキ</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 340 230" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="200" x2="330" y2="200" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="65" width="265" height="135" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,65 162,15 295,65" fill="rgba(26,26,26,.98)" stroke="#e08030" stroke-width="2"/>
      <rect x="75" y="5" width="14" height="60" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="50" y="105" width="165" height="82" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="132" y1="105" x2="132" y2="187" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="228" y="140" width="34" height="60" fill="rgba(55,36,18,.4)" stroke="#666" stroke-width="1.5"/>
      <rect x="295" y="140" width="40" height="60" fill="rgba(80,120,64,.2)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="315" y="175" fill="#507840" font-size="7" text-anchor="middle">デッキ</text>
      <rect x="100" y="18" width="100" height="20" fill="rgba(224,128,48,.15)" stroke="rgba(224,128,48,.3)" stroke-width="1" rx="2"/>
      <text x="150" y="31" fill="rgba(224,128,48,.7)" font-size="7.5" text-anchor="middle">ソーラー × 8枚</text>
      <line x1="30" y1="208" x2="295" y2="208" stroke="#444" stroke-width="1"/>
      <text x="162" y="220" fill="#444" font-size="8.5" text-anchor="middle">7,280 mm</text>
      <text x="20" y="10" fill="#e08030" font-size="8" font-weight="bold">AN — 南立面</text>
    </svg>`,
  },

  // ===== XL (66m²) =====
  {
    id: "xl",
    name: "MUNE",
    label: "66m²",
    area: 66,
    dims: "W 9,100 × D 7,280 mm",
    weeks: 16,
    tag: "ゲストハウス運営可",
    tagColor: "#9060e0",
    desc: "66m²は2世帯・シェアハウス・アトリエとして機能する規模。910×1820mm標準パネル2枚積みで天井高3.0〜3.6m——ロフト吹き抜けと組み合わせると縦に広がる二層空間が生まれる。CLT露し天井が構造そのものを意匠にする。ガルバ黒外皮×木製デッキ、北海道の雪景色に映える。",
    totalMat: 7725000,
    subsidyMax: 2350000,
    coldClimateUpgrade: 1500000,
    rentPerNight: 60000,
    color: "#9060e0",
    img: "/img/build/xl.jpg",
    specs: [
      {k:"延床面積", v:"66 m²（20.0坪）＋ロフト 18m²"},
      {k:"外形寸法", v:"W 9,100 × D 7,280 × H 5,500 mm"},
      {k:"間取り", v:"LDK+ロフト＋寝室3＋水回り2＋大デッキ"},
      {k:"構造", v:"木造軸組 + SIPsパネル"},
      {k:"断熱性能", v:"UA値 0.13 W/m²K（HEAT20 G3超）"},
      {k:"天井高", v:"3,000〜3,600mm（SIPs 2枚積み＋ロフト吹抜け）"},
      {k:"暖房", v:"ロケットマスヒーター + 蓄熱ベンチ"},
      {k:"電力", v:"2,400W + 15kWh（売電余剰あり）"},
      {k:"民泊運営", v:"旅館業・簡易宿所届出で可"},
      {k:"耐震等級", v:"等級3 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:3630000,color:"#9060e0",url:"",
       alt:"",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"220 m²",unit:"¥11,000/m²",total:2420000,note:"標準OSBサイズ・2枚積みで天井高3.0〜3.6m対応"},
         {name:"SIPsパネル 屋根用 200mm",qty:"85 m²",unit:"¥14,000/m²",total:1190000,note:""},
         {name:"スプライン・コーキング",qty:"一式",unit:"¥20,000",total:20000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:490000,color:"#f0c040",url:"",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"6枚",unit:"¥15,000/枚",total:90000,note:"12×200Wと同ワット数"},
         {name:"LiFePO4 48V 300Ah + 5kW インバーター一式",qty:"1式",unit:"¥280,000",total:280000,note:"≈14.4kWh・DELTA Pro3×3台比67%削減"},
         {name:"MPPT 150A + 配電盤一式",qty:"1式",unit:"¥120,000",total:120000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:920000,color:"#4ab8d0",url:"",
       items:[
         {name:"南面大開口 W3640×H2100",qty:"1枚",unit:"¥280,000",total:280000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170",qty:"10枚",unit:"¥38,000/枚",total:380000,note:""},
         {name:"玄関ドア 断熱型",qty:"1枚",unit:"¥95,000",total:95000,note:""},
         {name:"デッキ引き戸 2枚",qty:"2枚",unit:"¥82,500/枚",total:165000,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:880000,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"160 m²",unit:"¥2,800/m²",total:448000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"65 m²",unit:"¥3,500/m²",total:227500,note:""},
         {name:"業務用キッチン（IH3口）",qty:"1式",unit:"¥180,000",total:180000,note:"民泊対応"},
         {name:"洗面台2台 + 造作棚",qty:"一式",unit:"¥24,500",total:24500,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:350000,color:"#50b8a0",url:"",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"2台",unit:"¥75,000/台",total:150000,note:"スウェーデン製・浄化槽不要"},
         {name:"雨水タンク 3,000L",qty:"1基",unit:"¥70,000",total:70000,note:""},
         {name:"フィルター + UV + 大型ポンプ",qty:"1式",unit:"¥60,000",total:60000,note:""},
         {name:"シャワーユニット 2基",qty:"2式",unit:"¥35,000/式",total:70000,note:""},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:176000,color:"#507840",url:"",
       items:[
         {name:"国産杉 ACQ防腐処理 デッキ材",qty:"30 m²",unit:"¥3,200/m²",total:96000,note:"耐久20年以上・イタウバ比60%削減"},
         {name:"根太・束柱・手すり一式",qty:"一式",unit:"¥80,000",total:80000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:360000,color:"#888",url:"",
       items:[
         {name:"ガルバリウム波板 黒",qty:"200 m²",unit:"¥1,200/m²",total:240000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥120,000",total:120000,note:""},
       ]},
      {cat:"構造材（プレカット）",emoji:"📐",total:450000,color:"#b07850",url:"",
       items:[
         {name:"KD杉 105×105 柱材",qty:"28本",unit:"¥1,200/本",total:33600,note:""},
         {name:"KD杉 105×240 大梁",qty:"18本",unit:"¥4,500/本",total:81000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥80,000",total:80000,note:""},
         {name:"構造用合板 28mm",qty:"50枚",unit:"¥4,200/枚",total:210000,note:""},
         {name:"大引・束・ロフト材一式",qty:"一式",unit:"¥45,400",total:45400,note:""},
       ]},
      {cat:"暖房（ロケットマスヒーター）",emoji:"🔥",total:186000,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"360個",unit:"¥228/個",total:82080,note:""},
         {name:"蓄熱ベンチ コンクリート",qty:"0.5 m³",unit:"¥18,000/m³",total:9000,note:""},
         {name:"煙突 Φ150 + ロフト貫通処理",qty:"1式",unit:"¥94,920",total:94920,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:290000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"65 m²",unit:"¥2,000/m²",total:130000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥160,000",total:160000,note:""},
       ]},
      {cat:"基礎（独立コンクリート 12点）",emoji:"⚓",total:173000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"4 m³",unit:"¥18,000/m³",total:72000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥101,000",total:101000,note:""},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:1320000, color:"#607080",
       items:[
         {name:"24時間熱交換換気ユニット（第一種・2ユニット）",qty:"2台",unit:"¥85,000/台",total:170000,note:"建築基準法対応"},
         {name:"室内配線（コンセント18口・照明10点・分電盤 200A）",qty:"一式",unit:"¥280,000",total:280000,note:""},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩）処理",qty:"一式",unit:"¥130,000",total:130000,note:""},
         {name:"階段（杉無垢・蹴り上げ200mm×13段）",qty:"1基",unit:"¥180,000",total:180000,note:"1F→2Fロフト"},
         {name:"建具金物（ドアノブ×6・蝶番・錠前・引き戸レール）",qty:"一式",unit:"¥60,000",total:60000,note:""},
         {name:"運搬費（弟子屈まで・4tトラック×2便）",qty:"1式",unit:"¥500,000",total:500000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜3",phase:"基礎工事",icon:"⚓",cost:165000,diff:"★★★★☆",people:"3〜4人",
       desc:"独立基礎12点。スパンが広いため測量が重要。レンタルミニユンボで3週間かける。",tools:["ミニユンボ","測量器具","型枠"],tips:"基礎間隔が大きいので水糸でしっかり通り確認。"},
      {week:"W4",phase:"土台・床組み",icon:"🪵",cost:450000,diff:"★★★☆☆",people:"3人",
       desc:"大断面梁のプレカット材を組む。剛床50枚。ロフト梁も同時に仮組み。",tools:["インパクト","丸ノコ","ミニクレーン"],tips:"大断面梁はミニクレーン活用で安全。"},
      {week:"W5〜6",phase:"棟上げ・ロフト",icon:"🏗️",cost:0,diff:"★★★★★",people:"6〜8人（2日）",
       desc:"大型のため2日かけて棟上げ。ロフト梁・床も同時に施工。ミニクレーン（¥40,000/日）必須。",tools:["ミニクレーン","インパクト","仮筋交い"],tips:"安全が最優先。プロの鳶職人に棟上げのみ依頼（¥5〜10万）も検討。"},
      {week:"W7〜9",phase:"SIPsパネル取付",icon:"🔷",cost:3630000,diff:"★★★☆☆",people:"4〜5人",
       desc:"面積が大きいため3週間。屋根パネルは安全帯必須。継ぎ目のコーキングを徹底。",tools:["インパクト","コーキングガン","足場"],tips:"足場をレンタル（¥50,000〜）すると安全・効率大幅向上。"},
      {week:"W10〜11",phase:"外装・大デッキ",icon:"🌳",cost:680000,diff:"★★★☆☆",people:"3人",
       desc:"ガルバ外壁・屋根仕上げ＋30m²の大型ウッドデッキ施工。",tools:["丸ノコ","タッカー","インパクト"],tips:"デッキ材は事前に塗料処理。イタウバは耐久性が高い。"},
      {week:"W12",phase:"窓・気密処理",icon:"🪟",cost:920000,diff:"★★☆☆☆",people:"2〜3人",
       desc:"大型南面開口・引き戸2枚・窓10枚を取付。C値測定で0.2以下確認。",tools:["気密テープ","測定機"],tips:"開口部が多いのでC値測定前に全箇所テープ処理を確認。"},
      {week:"W13〜14",phase:"設備工事",icon:"🔥",cost:1715000,diff:"★★★★☆",people:"3〜4人",
       desc:"12枚ソーラー・3台蓄電池・ロケットマスヒーター（大型蓄熱ベンチ）・コンポスト2台・雨水3,000L。",tools:["配線工具","耐火レンガ","配管工具"],tips:"電気工事士委託部分を先に調整しておく（¥10〜15万）。"},
      {week:"W15〜16",phase:"内装・竣工",icon:"✨",cost:880000,diff:"★★☆☆☆",people:"3人",
       desc:"160m²の羽目板・66m²フローリング・業務用キッチン・洗面台2台。清掃・検査で完成。",tools:["フィニッシュネイラー","丸ノコ"],tips:"ゲストハウス運営には旅館業の簡易宿所届出が必要（弟子屈町保健所）。"},
    ],
    routes: [
      {name:"セルフビルド",cost:7725000,color:"#9060e0",hi:true},
      {name:"補助金後",cost:5375000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:18000000,color:"#555"},
      {name:"民泊収益（年）",cost:-720000,color:"#9060e0",note:"年¥72万収益想定"},
    ],
    floorSvg: `<svg viewBox="0 0 380 280" style="width:100%;background:#050505;display:block">
      <rect x="20" y="20" width="300" height="220" fill="none" stroke="#9060e0" stroke-width="3.5"/>
      <line x1="20" y1="130" x2="320" y2="130" stroke="#555" stroke-width="1.5"/>
      <line x1="160" y1="20" x2="160" y2="130" stroke="#555" stroke-width="1.5"/>
      <line x1="220" y1="130" x2="220" y2="240" stroke="#555" stroke-width="1.5"/>
      <line x1="160" y1="130" x2="160" y2="240" stroke="#555" stroke-width="1.5"/>
      <rect x="316" y="20" width="44" height="220" fill="rgba(80,120,64,.15)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="338" y="135" fill="#507840" font-size="7" text-anchor="middle" transform="rotate(90,338,135)">大デッキ 30m²</text>
      <line x1="20" y1="180" x2="20" y2="210" stroke="#050505" stroke-width="6"/>
      <path d="M20 180 Q40 180 40 200" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="55" y="236" width="180" height="7" fill="#4ab8d0" opacity=".7"/>
      <rect x="316" y="40" width="7" height="80" fill="#4ab8d0" opacity=".7"/>
      <text x="85" y="70" fill="#ddd" font-size="10" text-anchor="middle">LDK + ロフト</text>
      <text x="85" y="84" fill="#555" font-size="7.5" text-anchor="middle">28 m²（ロフト18m²）</text>
      <text x="245" y="70" fill="#ddd" font-size="10" text-anchor="middle">寝室 1</text>
      <text x="245" y="84" fill="#555" font-size="7.5" text-anchor="middle">12 m²</text>
      <text x="85" y="192" fill="#ddd" font-size="9" text-anchor="middle">寝室 2</text>
      <text x="85" y="205" fill="#555" font-size="7.5" text-anchor="middle">9 m²</text>
      <text x="185" y="192" fill="#ddd" font-size="9" text-anchor="middle">寝室 3</text>
      <text x="185" y="205" fill="#555" font-size="7.5" text-anchor="middle">8 m²</text>
      <text x="275" y="192" fill="#ddd" font-size="9" text-anchor="middle">水回り</text>
      <text x="275" y="205" fill="#555" font-size="7.5" text-anchor="middle">8 m²×2</text>
      <circle cx="50" cy="110" r="9" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.55)" stroke-width="1.5"/>
      <text x="50" y="114" fill="rgba(224,96,48,.8)" font-size="7" text-anchor="middle">炉</text>
      <rect x="105" y="22" width="60" height="14" fill="rgba(144,96,224,.2)" stroke="rgba(144,96,224,.4)" stroke-width="1" rx="2"/>
      <text x="135" y="32" fill="rgba(144,96,224,.7)" font-size="6" text-anchor="middle">ロフト開口部</text>
      <text x="20" y="12" fill="#9060e0" font-size="8" font-weight="bold">MUNE — 66m² + ロフト18m² + デッキ</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 400 240" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="210" x2="390" y2="210" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="60" width="310" height="150" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,60 185,10 340,60" fill="rgba(26,26,26,.98)" stroke="#9060e0" stroke-width="2"/>
      <rect x="80" y="2" width="14" height="58" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="50" y="100" width="200" height="100" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="150" y1="100" x2="150" y2="200" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="264" y="145" width="34" height="65" fill="rgba(55,36,18,.4)" stroke="#666" stroke-width="1.5"/>
      <rect x="340" y="140" width="44" height="70" fill="rgba(80,120,64,.2)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="362" y="180" fill="#507840" font-size="7" text-anchor="middle">デッキ</text>
      <rect x="110" y="15" width="150" height="22" fill="rgba(144,96,224,.15)" stroke="rgba(144,96,224,.3)" stroke-width="1" rx="2"/>
      <text x="185" y="29" fill="rgba(144,96,224,.7)" font-size="7.5" text-anchor="middle">ソーラー × 12枚</text>
      <rect x="30" y="60" width="310" height="55" fill="rgba(144,96,224,.04)"/>
      <text x="185" y="91" fill="rgba(144,96,224,.4)" font-size="8" text-anchor="middle">ロフト空間</text>
      <line x1="30" y1="218" x2="340" y2="218" stroke="#444" stroke-width="1"/>
      <text x="185" y="230" fill="#444" font-size="8.5" text-anchor="middle">9,100 mm</text>
      <text x="20" y="8" fill="#9060e0" font-size="8" font-weight="bold">MUNE — 南立面</text>
    </svg>`,
  },

  // ===== VILLA (120m²) =====
  {
    id: "villa",
    name: "VILLA",
    label: "120m²",
    area: 120,
    dims: "W 9,100 × D 13,200 mm（平屋）",
    weeks: 24,
    tag: "食堂・ホール・炉付き リトリート施設",
    tagColor: "#d04060",
    desc: "120m²の平屋リトリート施設。食堂ホール（60m²・収容20名）を中心に、ロケットマスヒーター3基が炎の核をつくる。南面の大デッキ（100m²）が内外を繋ぎ、炊き出しや焚き火の場になる。厨房・水回り更衣室（男女）・スタッフ室を機能的に配置。すべて910mmモジュール、SIPs断熱。",
    totalMat: 13232000,
    subsidyMax: 2350000,
    coldClimateUpgrade: 2000000,
    rentPerNight: 120000,
    color: "#d04060",
    img: "/img/build/villa.jpg",
    specs: [
      {k:"延床面積", v:"120 m²（36.3坪）平屋"},
      {k:"外形寸法", v:"W 9,100 × D 13,200 × H 3,600 mm（平屋）"},
      {k:"間取り", v:"食堂・ホール(60m²) + 厨房(20m²) + 水回り・更衣室(30m²) + スタッフ室(10m²)"},
      {k:"収容人数", v:"最大20名（食堂ホール）"},
      {k:"構造", v:"木造軸組 + SIPsパネル 平屋"},
      {k:"天井高", v:"3,200〜3,600mm（SIPs 2枚積み・食堂ホール吹抜け）"},
      {k:"断熱性能", v:"UA値 0.16 W/m²K（HEAT20 G2）"},
      {k:"暖房", v:"ロケットマスヒーター×3 + 床下蓄熱"},
      {k:"電力", v:"4,800W + 15kWh（12枚 + 3台蓄電池）"},
      {k:"大型デッキ", v:"100 m²（南面・炉×3付き）"},
      {k:"耐震等級", v:"等級3 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"耐震等級", v:"等級3 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（旅館業・簡易宿所申請）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:4750000,color:"#d04060",url:"",alt:"",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"300 m²",unit:"¥11,000/m²",total:3300000,note:"1F全周・標準OSBサイズ・2枚積みで天井高3.2〜3.6m"},
         {name:"SIPsパネル 屋根用 200mm",qty:"100 m²",unit:"¥14,000/m²",total:1400000,note:""},
         {name:"スプライン・コーキング一式",qty:"一式",unit:"¥50,000",total:50000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:780000,color:"#f0c040",url:"",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"10枚",unit:"¥15,000/枚",total:150000,note:"20×200Wと同ワット数"},
         {name:"LiFePO4 48V 500Ah + 8kW インバーター一式",qty:"1式",unit:"¥450,000",total:450000,note:"≈24kWh・DELTA Pro3×5台比68%削減"},
         {name:"MPPT 200A + 配電盤一式",qty:"1式",unit:"¥180,000",total:180000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:1299500,color:"#4ab8d0",url:"",
       items:[
         {name:"南面大開口 W4550×H2100",qty:"1枚",unit:"¥400,000",total:400000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170",qty:"14枚",unit:"¥38,000/枚",total:532000,note:""},
         {name:"玄関ドア 断熱型",qty:"1枚",unit:"¥120,000",total:120000,note:""},
         {name:"デッキ引き戸 断熱",qty:"3枚",unit:"¥82,500/枚",total:247500,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:1446000,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"220 m²",unit:"¥2,800/m²",total:616000,note:"1F+2F"},
         {name:"杉無垢フローリング 15mm",qty:"120 m²",unit:"¥3,500/m²",total:420000,note:""},
         {name:"キッチン（IH + 食洗機）",qty:"1式",unit:"¥250,000",total:250000,note:"民泊対応"},
         {name:"洗面台×3 + 造作棚",qty:"一式",unit:"¥80,000",total:80000,note:""},
         {name:"造作家具・間仕切り",qty:"一式",unit:"¥80,000",total:80000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:470000,color:"#50b8a0",url:"",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"2台",unit:"¥75,000/台",total:150000,note:"スウェーデン製・浄化槽不要"},
         {name:"雨水タンク 5,000L",qty:"1基",unit:"¥120,000",total:120000,note:""},
         {name:"フィルター + UV + ポンプ",qty:"1式",unit:"¥80,000",total:80000,note:""},
         {name:"シャワーユニット",qty:"3式",unit:"¥40,000/式",total:120000,note:""},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:292000,color:"#507840",url:"",
       items:[
         {name:"国産杉 ACQ防腐処理 デッキ材",qty:"60 m²",unit:"¥3,200/m²",total:192000,note:"耐久20年以上・イタウバ比60%削減"},
         {name:"根太・束柱・手すり一式",qty:"一式",unit:"¥100,000",total:100000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:496000,color:"#888",url:"",
       items:[
         {name:"ガルバリウム波板 黒",qty:"280 m²",unit:"¥1,200/m²",total:336000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥160,000",total:160000,note:""},
       ]},
      {cat:"構造材（プレカット・平屋）",emoji:"📐",total:692000,color:"#b07850",url:"",
       items:[
         {name:"KD杉 105×105 柱材",qty:"40本",unit:"¥1,200/本",total:48000,note:""},
         {name:"KD杉 105×300 大梁（長スパン）",qty:"20本",unit:"¥5,800/本",total:116000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"構造用合板 28mm",qty:"80枚",unit:"¥4,200/枚",total:336000,note:""},
         {name:"大引・束・土台一式",qty:"一式",unit:"¥72,000",total:72000,note:""},
       ]},
      {cat:"暖房（ロケットマスヒーター×3）",emoji:"🔥",total:426000,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"750個",unit:"¥228/個",total:171000,note:"3基分"},
         {name:"蓄熱ベンチ用コンクリート",qty:"一式",unit:"¥30,000",total:30000,note:""},
         {name:"煙突 Φ150 × 3系統",qty:"3式",unit:"¥75,000/式",total:225000,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:460000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"120 m²",unit:"¥2,000/m²",total:240000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥220,000",total:220000,note:"2階建て対応"},
       ]},
      {cat:"基礎（独立コンクリート 14点）",emoji:"⚓",total:258000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"6 m³",unit:"¥18,000/m³",total:108000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥150,000",total:150000,note:""},
       ]},
      {cat:"業務用設備・外部工事",emoji:"🏪",total:2342500,color:"#c06080",url:"",
       items:[
         {name:"消防設備（誘導灯・消火器）",qty:"一式",unit:"¥300,000",total:300000,note:"簡易宿所申請要件"},
         {name:"業務用換気扇×4+給排気設備",qty:"一式",unit:"¥200,000",total:200000,note:""},
         {name:"内部建具（ドア×6+引き戸×4）",qty:"一式",unit:"¥400,000",total:400000,note:""},
         {name:"業務用食器棚+スタッフ什器",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"旅館業申請+設計監理料",qty:"一式",unit:"¥500,000",total:500000,note:""},
         {name:"外構（砂利敷+アプローチ+外部照明）",qty:"一式",unit:"¥300,000",total:300000,note:""},
         {name:"薪棚・外部保管庫・庇一式",qty:"一式",unit:"¥200,000",total:200000,note:""},
         {name:"屋外炉台×3（石組+コンクリート）",qty:"3基",unit:"¥64,167/基",total:192500,note:"炎の核となる中心設備"},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:1520000, color:"#607080",
       items:[
         {name:"24時間熱交換換気ユニット（業務用・第一種）",qty:"2台",unit:"¥120,000/台",total:240000,note:"建築基準法対応・食堂+宿泊棟"},
         {name:"室内電気配線（分電盤+コンセント24口+照明16点+非常灯）",qty:"一式",unit:"¥420,000",total:420000,note:"旅館業法対応 非常灯含む"},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩大型処理）",qty:"一式",unit:"¥180,000",total:180000,note:""},
         {name:"建具金物（ドア×6+引き戸×4 金物一式）",qty:"一式",unit:"¥80,000",total:80000,note:""},
         {name:"運搬費（弟子屈まで・10tトラック）",qty:"1式",unit:"¥600,000",total:600000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜3",phase:"基礎工事（14点）",icon:"⚓",cost:246000,diff:"★★★☆☆",people:"3人",
       desc:"独立基礎14点。平屋のため荷重計算が比較的シンプル。ミニユンボ必須。",
       tools:["ミニユンボ","測量器具","型枠","鉄筋"],tips:"平屋なので基礎は比較的シンプル。設計士に基礎計算を依頼（¥3〜5万）すると安心。"},
      {week:"W4〜5",phase:"土台・床組み",icon:"🪵",cost:692000,diff:"★★★☆☆",people:"3人",
       desc:"プレカット土台・大引を組む。80枚の剛床合板を張る。2F床梁も仮組み。",
       tools:["インパクト","丸ノコ","水平器","ミニクレーン"],tips:"1F床が完成すると作業スペースになる。丁寧に水平を出す。"},
      {week:"W6〜9",phase:"棟上げ・2F骨組み",icon:"🏗️",cost:0,diff:"★★★★★",people:"6〜8人（2〜3日）",
       desc:"1F柱・梁を棟上げし、2F床梁・柱・屋根まで組む。ミニクレーン（¥40,000/日）必須。プロの鳶職人を招くと確実（¥10〜20万）。",
       tools:["ミニクレーン","インパクト","仮筋交い","安全帯"],tips:"2Fは高所作業。安全帯+ランヤード全員着用。棟上げ前日に順番と人員配置を綿密に計画。"},
      {week:"W10〜14",phase:"SIPsパネル取付（全面）",icon:"🔷",cost:4750000,diff:"★★★☆☆",people:"4〜6人",
       desc:"300m²の壁パネル＋100m²の屋根パネル。5週間かけて建て込む。足場レンタル（¥80,000〜）を強く推奨。",
       tools:["インパクト","コーキングガン","足場（レンタル）"],tips:"継ぎ目の気密テープ処理が断熱性能を決める。"},
      {week:"W15〜16",phase:"外装仕上げ・大型デッキ",icon:"🌳",cost:1076000,diff:"★★★☆☆",people:"3人",
       desc:"ガルバ外壁・屋根仕上げ＋60m²の大型デッキを同時施工。",
       tools:["丸ノコ","タッカー","インパクト"],tips:"デッキ材は事前に塗料処理で耐久性アップ。"},
      {week:"W17",phase:"窓・気密処理",icon:"🪟",cost:1299500,diff:"★★★☆☆",people:"2〜3人",
       desc:"南面大開口・14枚の窓・玄関ドアを取付。C値測定で0.2以下を確認。",
       tools:["気密テープ","測定機"],tips:"14枚を1週間で取付。チームワークが重要。"},
      {week:"W18〜21",phase:"設備工事（大型）",icon:"🔥",cost:3098420,diff:"★★★★☆",people:"3〜4人",
       desc:"ロケットマスヒーター×2築炉、20枚ソーラー・5台蓄電池配線、コンポスト×2、雨水5,000L設置。電気工事士委託必須。",
       tools:["耐火レンガ","配線工具","配管工具"],tips:"電気工事士委託（¥10〜15万）を先に手配。大型設備は搬入ルートを事前確認。"},
      {week:"W22〜24",phase:"内装・竣工",icon:"✨",cost:1446000,diff:"★★★☆☆",people:"3〜4人",
       desc:"220m²の羽目板・フローリング・キッチン・洗面台3台。清掃・写真撮影・民泊登録で完成。",
       tools:["フィニッシュネイラー","丸ノコ"],tips:"民泊（簡易宿所）届出は弟子屈町保健所へ。Airbnb登録もこのタイミングで。"},
    ],
    routes: [
      {name:"セルフビルド+部分外注",cost:13232000,color:"#d04060",hi:true},
      {name:"補助金後",cost:10882000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:42000000,color:"#555"},
      {name:"リトリート収益（年）",cost:-2400000,color:"#d04060",note:"20名×¥10,000×12泊/月=年¥240万"},
    ],
    floorSvg: `<svg viewBox="0 0 420 440" style="width:100%;background:#050505;display:block">
      <rect x="20" y="30" width="270" height="360" fill="none" stroke="#d04060" stroke-width="3.5"/>
      <line x1="20" y1="210" x2="290" y2="210" stroke="#555" stroke-width="1.5"/>
      <line x1="155" y1="210" x2="155" y2="330" stroke="#555" stroke-width="1.5"/>
      <line x1="20" y1="330" x2="290" y2="330" stroke="#555" stroke-width="1.5"/>
      <line x1="20" y1="355" x2="20" y2="390" stroke="#050505" stroke-width="6"/>
      <path d="M20 355 Q46 355 46 381" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="70" y="385" width="150" height="7" fill="#4ab8d0" opacity=".7"/>
      <rect x="285" y="48" width="7" height="80" fill="#4ab8d0" opacity=".7"/>
      <rect x="285" y="148" width="7" height="50" fill="#4ab8d0" opacity=".7"/>
      <rect x="292" y="30" width="80" height="280" fill="rgba(80,120,64,.15)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="332" y="175" fill="#507840" font-size="7" text-anchor="middle" transform="rotate(90,332,175)">大デッキ 100m²</text>
      <text x="155" y="118" fill="#ddd" font-size="11" text-anchor="middle">食堂・ホール</text>
      <text x="155" y="134" fill="#555" font-size="8.5" text-anchor="middle">60 m²（収容20名）</text>
      <circle cx="58" cy="172" r="10" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.55)" stroke-width="1.5"/>
      <text x="58" y="176" fill="rgba(224,96,48,.8)" font-size="7" text-anchor="middle">炉×3</text>
      <text x="87" y="268" fill="#ddd" font-size="9" text-anchor="middle">水回り・更衣室</text>
      <text x="87" y="283" fill="#555" font-size="7.5" text-anchor="middle">30 m²（男女）</text>
      <text x="223" y="265" fill="#ddd" font-size="9" text-anchor="middle">厨房</text>
      <text x="223" y="280" fill="#555" font-size="7.5" text-anchor="middle">20 m²</text>
      <text x="155" y="357" fill="#ddd" font-size="9" text-anchor="middle">スタッフ室</text>
      <text x="155" y="371" fill="#555" font-size="7.5" text-anchor="middle">10 m²</text>
      <text x="20" y="22" fill="#d04060" font-size="8" font-weight="bold">VILLA — 平屋 120m²</text>
      <line x1="20" y1="410" x2="290" y2="410" stroke="#333" stroke-width="1"/>
      <text x="20" y="422" fill="#555" font-size="7">9,100 mm</text>
      <text x="300" y="422" fill="#888" font-size="6.5">平屋（1F only）</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 400 220" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="185" x2="390" y2="185" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="95" width="310" height="90" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,95 185,48 340,95" fill="rgba(26,26,26,.98)" stroke="#d04060" stroke-width="2"/>
      <rect x="72" y="62" width="12" height="33" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="180" y="55" width="12" height="40" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="278" y="62" width="12" height="33" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="48" y="115" width="170" height="60" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="133" y1="115" x2="133" y2="175" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="340" y="148" width="45" height="37" fill="rgba(80,120,64,.2)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="362" y="170" fill="#507840" font-size="7" text-anchor="middle">デッキ</text>
      <rect x="95" y="62" width="150" height="22" fill="rgba(208,64,96,.15)" stroke="rgba(208,64,96,.3)" stroke-width="1" rx="2"/>
      <text x="170" y="76" fill="rgba(208,64,96,.7)" font-size="7" text-anchor="middle">ソーラー × 12枚</text>
      <text x="8" y="148" fill="#555" font-size="7" text-anchor="middle">1F</text>
      <line x1="30" y1="195" x2="340" y2="195" stroke="#444" stroke-width="1"/>
      <text x="185" y="210" fill="#444" font-size="8.5" text-anchor="middle">9,100 mm</text>
      <text x="20" y="10" fill="#d04060" font-size="8" font-weight="bold">VILLA — 南立面（平屋）</text>
    </svg>`,
  },

  // ===== GRAND (200m²) =====
  {
    id: "grand",
    name: "GRAND",
    label: "200m²",
    area: 200,
    dims: "W 13,650 × D 7,280 mm（2階建て）",
    weeks: 36,
    tag: "SOLUNAベース・宿泊施設",
    tagColor: "#1878c8",
    desc: "198m²は村のコモンハウスになれる規模。長いデッキが主な滞在場所になり、建物は背景に退く。大型SIPsパネルの端材はデッキ材として再利用。構造材はすべて地産の北海道産杉を指定できる。外皮100年、内装10年の3層分離設計。",
    totalMat: 21070000,
    subsidyMax: 2350000,
    coldClimateUpgrade: 3200000,
    rentPerNight: 150000,
    color: "#1878c8",
    img: "/img/build/grand.jpg",
    specs: [
      {k:"延床面積", v:"200 m²（60.5坪）1F: 100m² / 2F: 100m²"},
      {k:"外形寸法", v:"W 13,650 × D 7,280 × H 7,200 mm（2階建て）"},
      {k:"間取り", v:"1F 食堂+厨房+水回り4 / 2F 個室×10室"},
      {k:"収容人数", v:"最大20名（個室10室 × 2名）"},
      {k:"構造", v:"木造軸組 + SIPsパネル 2階建て（建築士必須）"},
      {k:"天井高", v:"1F 3,200mm / 2F 2,800mm（SIPs 2枚積み）"},
      {k:"断熱性能", v:"UA値 0.12 W/m²K"},
      {k:"暖房", v:"ロケットマスヒーター×3 + 床下蓄熱"},
      {k:"電力", v:"6,400W + 20kWh（32枚 + 8台蓄電池）"},
      {k:"運営許可", v:"旅館業（簡易宿所）+ 消防法届出"},
      {k:"耐震等級", v:"等級3 想定（許容応力度計算必須・性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（建築士設計・監理）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:7940000,color:"#1878c8",url:"",alt:"",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"500 m²",unit:"¥11,000/m²",total:5500000,note:"1F+2F全周+間仕切り・標準OSBサイズ"},
         {name:"SIPsパネル 屋根用 200mm",qty:"170 m²",unit:"¥14,000/m²",total:2380000,note:""},
         {name:"スプライン・コーキング一式",qty:"一式",unit:"¥60,000",total:60000,note:""},
       ]},
      {cat:"オフグリッド電力（大型）",emoji:"☀️",total:1140000,color:"#f0c040",url:"",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"16枚",unit:"¥15,000/枚",total:240000,note:"32×200Wと同ワット数"},
         {name:"LiFePO4 48V 800Ah + 10kW インバーター一式",qty:"1式",unit:"¥700,000",total:700000,note:"≈38.4kWh・DELTA Pro3×8台比69%削減"},
         {name:"MPPT 200A + 分電盤一式",qty:"1式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:1764000,color:"#4ab8d0",url:"",
       items:[
         {name:"南面大開口 W5460×H2400",qty:"1枚",unit:"¥600,000",total:600000,note:"トリプルLow-E 食堂南面"},
         {name:"樹脂窓 W780×H1170",qty:"18枚",unit:"¥38,000/枚",total:684000,note:"2F個室×10+共用"},
         {name:"玄関ドア 断熱（業務用）",qty:"1枚",unit:"¥150,000",total:150000,note:""},
         {name:"デッキ引き戸 断熱",qty:"4枚",unit:"¥82,500/枚",total:330000,note:"食堂→デッキ"},
       ]},
      {cat:"内装・仕上げ（業務用）",emoji:"🪵",total:2572000,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"340 m²",unit:"¥2,800/m²",total:952000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"200 m²",unit:"¥3,500/m²",total:700000,note:""},
         {name:"業務用キッチン（IH6口+食洗機）",qty:"1式",unit:"¥450,000",total:450000,note:"20名対応"},
         {name:"洗面台×4 + 造作棚",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"個室ベッドフレーム",qty:"10台",unit:"¥35,000/台",total:350000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:745000,color:"#50b8a0",url:"",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"3台",unit:"¥75,000/台",total:225000,note:"20名対応・浄化槽不要"},
         {name:"雨水タンク 10,000L",qty:"1基",unit:"¥200,000",total:200000,note:""},
         {name:"大型フィルター + UV + ポンプ",qty:"1式",unit:"¥120,000",total:120000,note:""},
         {name:"シャワーユニット",qty:"4式",unit:"¥50,000/式",total:200000,note:"男女分"},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:480000,color:"#507840",url:"",
       items:[
         {name:"国産杉 ACQ防腐処理 デッキ材",qty:"100 m²",unit:"¥3,200/m²",total:320000,note:"食堂南面・耐久20年以上・イタウバ比60%削減"},
         {name:"根太・束柱・手すり一式",qty:"一式",unit:"¥160,000",total:160000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:790000,color:"#888",url:"",
       items:[
         {name:"ガルバリウム波板 黒",qty:"450 m²",unit:"¥1,200/m²",total:540000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥250,000",total:250000,note:""},
       ]},
      {cat:"構造材（プレカット）",emoji:"📐",total:1358000,color:"#b07850",url:"",
       items:[
         {name:"KD杉 105×105 柱材",qty:"60本",unit:"¥1,200/本",total:72000,note:""},
         {name:"KD杉 105×300 大梁",qty:"36本",unit:"¥4,500/本",total:162000,note:"大スパン対応"},
         {name:"2F床梁・根太・廊下材",qty:"一式",unit:"¥300,000",total:300000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥200,000",total:200000,note:""},
         {name:"構造用合板 28mm",qty:"120枚",unit:"¥4,200/枚",total:504000,note:""},
         {name:"大引・束・土台一式",qty:"一式",unit:"¥120,000",total:120000,note:""},
       ]},
      {cat:"暖房（ロケットマスヒーター×3）",emoji:"🔥",total:414160,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"720個",unit:"¥228/個",total:164160,note:"3基分"},
         {name:"蓄熱ベンチ コンクリート",qty:"一式",unit:"¥50,000",total:50000,note:""},
         {name:"煙突 Φ150 × 3系統",qty:"3式",unit:"¥66,667/式",total:200000,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:750000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"200 m²",unit:"¥2,000/m²",total:400000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥350,000",total:350000,note:"大型2階建て対応"},
       ]},
      {cat:"基礎（独立コンクリート 24点）",emoji:"⚓",total:430000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"10 m³",unit:"¥18,000/m³",total:180000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥250,000",total:250000,note:""},
       ]},
      {cat:"消防・旅館業設備+設計監理",emoji:"🏨",total:3386840,color:"#c06080",url:"",
       items:[
         {name:"スプリンクラー設備（簡易型・20名施設）",qty:"一式",unit:"¥1,500,000",total:1500000,note:"旅館業申請要件"},
         {name:"旅館業什器（ベッド×10+クーラー×10+寝具一式）",qty:"一式",unit:"¥986,840",total:986840,note:"2F個室10室分"},
         {name:"建築士費用（設計+確認申請+監理）",qty:"一式",unit:"¥700,000",total:700000,note:"200m²超は建築士必須"},
         {name:"外部工事（外構+照明+サイン）",qty:"一式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:2500000, color:"#607080",
       items:[
         {name:"24時間熱交換換気ユニット（業務用・第一種・2ユニット）",qty:"2台",unit:"¥180,000/台",total:360000,note:"建築基準法対応"},
         {name:"室内電気配線（分電盤300A+コンセント40口+照明20点+非常灯+業務用配線）",qty:"一式",unit:"¥650,000",total:650000,note:"旅館業法対応"},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩）処理",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"階段（杉無垢×2基・1F→2F個室棟）",qty:"2基",unit:"¥160,000/基",total:320000,note:"2F個室10室へのアクセス"},
         {name:"建具金物（業務用ドア×12+引き戸金物一式）",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"運搬費（弟子屈まで・10tトラック×2便）",qty:"1式",unit:"¥800,000",total:800000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜4",phase:"基礎工事（24点）",icon:"⚓",cost:410000,diff:"★★★★☆",people:"4〜5人",
       desc:"独立基礎24点。建築士による基礎設計必須。地盤調査（¥10〜20万）を最初に実施。ミニユンボ4週間稼働。",
       tools:["ミニユンボ","測量器具","型枠","鉄筋"],tips:"地盤が軟弱な場合は鋼管杭（¥50〜100万）が必要。地盤調査を最初に行うこと。"},
      {week:"W5〜7",phase:"土台・1F床組み",icon:"🪵",cost:1358000,diff:"★★★☆☆",people:"4人",
       desc:"大断面梁（105×300）のプレカット材を組む。120枚の剛床合板を張る。ミニクレーン必須。",
       tools:["インパクト","丸ノコ","ミニクレーン（必須）"],tips:"大断面梁はミニクレーンなしでは危険。搬入ルートを事前確保。"},
      {week:"W8〜13",phase:"棟上げ・2F骨組み",icon:"🏗️",cost:0,diff:"★★★★★",people:"8〜10人（3日）",
       desc:"大型のため3日かけて棟上げ。1F→2F→屋根の順。プロの鳶職人同行を強く推奨（¥20〜30万）。ミニクレーン必須。",
       tools:["ミニクレーン","インパクト","安全帯","足場"],tips:"人命最優先。棟上げプロへの依頼を惜しまない。"},
      {week:"W14〜20",phase:"SIPsパネル取付（全面）",icon:"🔷",cost:7940000,diff:"★★★☆☆",people:"5〜8人",
       desc:"500m²の壁パネル＋170m²の屋根パネルを7週間かけて施工。足場（¥120,000〜）必須。屋根は安全帯+ランヤード全員着用。",
       tools:["インパクト","コーキングガン","足場"],tips:"屋根パネルの気密処理は特に念入りに。"},
      {week:"W21〜24",phase:"外装・大型デッキ（100m²）",icon:"🌳",cost:1750000,diff:"★★★☆☆",people:"4人",
       desc:"ガルバ外壁・屋根仕上げ＋100m²の大型ウッドデッキ施工。4週間かけて丁寧に仕上げる。",
       tools:["丸ノコ","タッカー","インパクト"],tips:"デッキ材は事前に塗料処理。イタウバは耐久性が高い。"},
      {week:"W25〜26",phase:"窓・気密処理",icon:"🪟",cost:1764000,diff:"★★★☆☆",people:"3〜4人",
       desc:"南面大開口・18枚の窓・引き戸4枚を取付。C値測定で0.3以下を確認。",
       tools:["気密テープ","測定機"],tips:"開口部が多いので2週間確保。全箇所のテープ処理後に測定。"},
      {week:"W27〜32",phase:"設備工事（業務用）",icon:"🔥",cost:4797232,diff:"★★★★★",people:"4〜6人",
       desc:"32枚ソーラー・8台蓄電池配線、ロケットマスヒーター×3築炉、コンポスト×3、雨水10,000L。消防設備（スプリンクラー・誘導灯）も設置。",
       tools:["配線工具","耐火レンガ","配管工具","消防設備"],tips:"旅館業申請前に消防検査が必要。消防署との事前協議を早めに行う。"},
      {week:"W33〜36",phase:"内装・什器・竣工",icon:"✨",cost:2322000,diff:"★★★☆☆",people:"4〜6人",
       desc:"340m²の羽目板・フローリング・業務用キッチン・個室10室設備。保健所・消防・旅館業の各検査に合格して完成。",
       tools:["フィニッシュネイラー","丸ノコ"],tips:"旅館業許可取得には1〜3ヶ月かかる。申請書類の準備を並行して進める。"},
    ],
    routes: [
      {name:"セルフビルド+部分外注",cost:21070000,color:"#1878c8",hi:true},
      {name:"補助金後",cost:18720000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:60000000,color:"#555"},
      {name:"民泊収益（年）",cost:-3000000,color:"#1878c8",note:"20名稼働¥300万/年"},
    ],
    floorSvg: `<svg viewBox="0 0 480 330" style="width:100%;background:#050505;display:block">
      <rect x="20" y="30" width="380" height="260" fill="none" stroke="#1878c8" stroke-width="4"/>
      <line x1="20" y1="185" x2="400" y2="185" stroke="#555" stroke-width="1.5"/>
      <line x1="280" y1="30" x2="280" y2="185" stroke="#555" stroke-width="1.5"/>
      <line x1="270" y1="185" x2="270" y2="290" stroke="#555" stroke-width="1.5"/>
      <line x1="20" y1="228" x2="20" y2="265" stroke="#050505" stroke-width="6"/>
      <path d="M20 228 Q50 228 50 258" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="80" y="287" width="200" height="7" fill="#4ab8d0" opacity=".7"/>
      <rect x="396" y="58" width="7" height="110" fill="#4ab8d0" opacity=".7"/>
      <text x="140" y="98" fill="#ddd" font-size="12" text-anchor="middle">食堂・ホール</text>
      <text x="140" y="115" fill="#555" font-size="8.5" text-anchor="middle">60 m²（収容20名）</text>
      <text x="345" y="98" fill="#ddd" font-size="10" text-anchor="middle">厨房</text>
      <text x="345" y="113" fill="#555" font-size="8" text-anchor="middle">20 m²</text>
      <text x="130" y="237" fill="#ddd" font-size="9" text-anchor="middle">水回り・更衣室（男女）</text>
      <text x="130" y="252" fill="#555" font-size="7.5" text-anchor="middle">30 m²</text>
      <text x="340" y="237" fill="#ddd" font-size="9" text-anchor="middle">スタッフ室</text>
      <text x="340" y="252" fill="#555" font-size="7.5" text-anchor="middle">10 m²</text>
      <rect x="400" y="30" width="55" height="260" fill="rgba(80,120,64,.15)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="427" y="165" fill="#507840" font-size="7" text-anchor="middle" transform="rotate(90,427,165)">大デッキ 100m²</text>
      <circle cx="65" cy="154" r="11" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.55)" stroke-width="1.5"/>
      <text x="65" y="159" fill="rgba(224,96,48,.8)" font-size="7.5" text-anchor="middle">炉×3</text>
      <text x="20" y="22" fill="#1878c8" font-size="8" font-weight="bold">GRAND 1F — 100m²（2F: 個室×10室 100m²）</text>
      <line x1="20" y1="310" x2="400" y2="310" stroke="#333" stroke-width="1"/>
      <text x="20" y="322" fill="#555" font-size="7">13,650 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 500 280" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="240" x2="490" y2="240" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="132" width="410" height="108" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="30" y="46" width="410" height="86" fill="rgba(28,30,40,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,46 235,6 450,46" fill="rgba(26,26,26,.98)" stroke="#1878c8" stroke-width="2"/>
      <rect x="90" y="-2" width="14" height="48" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="215" y="-2" width="14" height="48" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="340" y="-2" width="14" height="48" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="50" y="154" width="220" height="74" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="160" y1="154" x2="160" y2="228" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="298" y="184" width="50" height="56" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <rect x="40" y="58" width="54" height="56" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="106" y="58" width="54" height="56" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="172" y="58" width="54" height="56" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="238" y="58" width="54" height="56" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="304" y="58" width="54" height="56" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="370" y="58" width="54" height="56" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <line x1="30" y1="132" x2="440" y2="132" stroke="#888" stroke-width="2"/>
      <rect x="440" y="168" width="50" height="72" fill="rgba(80,120,64,.2)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="465" y="208" fill="#507840" font-size="7" text-anchor="middle">デッキ</text>
      <rect x="140" y="14" width="210" height="24" fill="rgba(24,120,200,.15)" stroke="rgba(24,120,200,.3)" stroke-width="1" rx="2"/>
      <text x="245" y="29" fill="rgba(24,120,200,.7)" font-size="7.5" text-anchor="middle">ソーラー × 32枚</text>
      <text x="8" y="188" fill="#555" font-size="7" text-anchor="middle">1F</text>
      <text x="8" y="92" fill="#555" font-size="7" text-anchor="middle">2F</text>
      <line x1="30" y1="250" x2="440" y2="250" stroke="#444" stroke-width="1"/>
      <text x="235" y="266" fill="#444" font-size="8.5" text-anchor="middle">12,740 mm</text>
      <text x="20" y="8" fill="#1878c8" font-size="8" font-weight="bold">GRAND — 南立面（2階建て・20名収容）</text>
    </svg>`,
  },
  // ===== MYTH (300m²) =====
  {
    id: "myth",
    name: "MYTH",
    label: "300m²",
    area: 300,
    dims: "W 16,380 × D 9,100 mm（2階建て）",
    weeks: 52,
    tag: "SOLUNAリトリート・究極の共同体",
    tagColor: "#c89020",
    desc: "【Phase 2 / 旅館業認定取得後リリース予定】300m²は施設。頂部トップライトから落ちる光柱が空間の中心軸になる。バレルサウナ→水風呂→外気浴デッキの動線を環状に配置。構造材はすべて弟子屈産杉。SOLUNAビレッジの共用拠点として、または宿泊・リトリート施設として設計。",
    totalMat: 31269000,
    subsidyMax: 2350000,
    coldClimateUpgrade: 4500000,
    rentPerNight: 200000,
    color: "#c89020",
    img: "/img/kumaushi_sips_exterior_winter.webp",
    lifeImgs: [
      {src:"/img/village_lux_living.jpg",   cap:"大きなラウンジ・共有スペース"},
      {src:"/img/village_lux_dining.jpg",   cap:"共同食堂・大テーブル"},
      {src:"/img/village_lux_bedroom.jpg",  cap:"ゲスト個室（14室）"},
      {src:"/img/village_lux_bath.jpg",     cap:"バスルーム"},
      {src:"/img/village_lux_cellar.jpg",   cap:"地下ワインセラー・貯蔵庫"},
      {src:"/img/pro_village_cinematic.webp", cap:"弟子屈の広大な敷地に建つ"},
    ],
    specs: [
      {k:"延床面積", v:"300 m²（90.8坪）1F: 149m² / 2F: 149m²"},
      {k:"外形寸法", v:"W 16,380 × D 9,100 × H 8,000 mm（2階建て）"},
      {k:"間取り", v:"1F 食堂ホール+スパ+サウナ+厨房+水回り6 / 2F 個室×14室+ラウンジ"},
      {k:"収容人数", v:"最大28名（個室14室 × 2名）"},
      {k:"構造", v:"木造軸組 + SIPsパネル 2階建て（建築士・構造計算必須）"},
      {k:"天井高", v:"1F 4,000mm吹抜け（食堂ホール）/ 2F 2,800mm"},
      {k:"断熱性能", v:"UA値 0.12 W/m²K"},
      {k:"暖房", v:"ロケットマスヒーター×4 + 床下蓄熱"},
      {k:"電力", v:"9,600W + 57.6kWh（24枚 + LiFePO4 1200Ah）"},
      {k:"運営許可", v:"旅館業（旅館・ホテル営業）+ 消防法 + 食品衛生法"},
      {k:"耐震等級", v:"等級3 想定（許容応力度計算+消防設計必須・性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（建築士設計・構造計算・消防設計）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:10850000,color:"#c89020",url:"",alt:"",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"750 m²",unit:"¥11,000/m²",total:8250000,note:"1F+2F全周+間仕切り+14室区画・標準OSBサイズ"},
         {name:"SIPsパネル 屋根用 200mm",qty:"180 m²",unit:"¥14,000/m²",total:2520000,note:""},
         {name:"スプライン・コーキング一式",qty:"一式",unit:"¥80,000",total:80000,note:""},
       ]},
      {cat:"オフグリッド電力（超大型）",emoji:"☀️",total:1710000,color:"#f0c040",url:"",
       items:[
         {name:"400W 単結晶パネル（JA Solar / Longi）",qty:"24枚",unit:"¥15,000/枚",total:360000,note:"32×200Wと同ワット数"},
         {name:"LiFePO4 48V 1200Ah + 15kW インバーター一式",qty:"1式",unit:"¥1,100,000",total:1100000,note:"≈57.6kWh・施設全体対応"},
         {name:"MPPT 250A + 主分電盤一式",qty:"1式",unit:"¥250,000",total:250000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:2807000,color:"#4ab8d0",url:"",
       items:[
         {name:"南面超大開口 W7280×H2400",qty:"1枚",unit:"¥1,200,000",total:1200000,note:"トリプルLow-E 食堂全面"},
         {name:"樹脂窓 W780×H1170",qty:"24枚",unit:"¥38,000/枚",total:912000,note:"2F個室14室+共用"},
         {name:"玄関ドア 断熱（業務用）",qty:"1枚",unit:"¥200,000",total:200000,note:""},
         {name:"デッキ引き戸 断熱",qty:"6枚",unit:"¥82,500/枚",total:495000,note:"食堂→大デッキ"},
       ]},
      {cat:"内装・仕上げ（業務用）",emoji:"🪵",total:5090000,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"450 m²",unit:"¥2,800/m²",total:1260000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"300 m²",unit:"¥5,000/m²",total:1500000,note:"業務グレード"},
         {name:"業務用キッチン（IH8口+食洗機）",qty:"1式",unit:"¥900,000",total:900000,note:"28名対応・大型"},
         {name:"洗面台×8 + 造作棚",qty:"一式",unit:"¥30,000/台",total:240000,note:"共用+個室計8箇所"},
         {name:"個室ベッドフレーム",qty:"14台",unit:"¥35,000/台",total:490000,note:""},
         {name:"バレルサウナ（8人用）",qty:"1基",unit:"¥700,000",total:700000,note:"MYTH限定装備"},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:1270000,color:"#50b8a0",url:"",
       items:[
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"4台",unit:"¥75,000/台",total:300000,note:"28名対応・浄化槽不要"},
         {name:"雨水タンク 15,000L",qty:"1基",unit:"¥280,000",total:280000,note:""},
         {name:"大型フィルター + UV + ポンプ",qty:"1式",unit:"¥150,000",total:150000,note:""},
         {name:"シャワーユニット",qty:"6式",unit:"¥90,000/式",total:540000,note:"男女+スパ+個室階"},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:584000,color:"#507840",url:"",
       items:[
         {name:"国産杉 ACQ防腐処理 デッキ材",qty:"120 m²",unit:"¥3,200/m²",total:384000,note:"食堂南面・耐久20年以上"},
         {name:"根太・束柱・手すり一式",qty:"一式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:980000,color:"#888",url:"",
       items:[
         {name:"ガルバリウム波板 黒",qty:"550 m²",unit:"¥1,200/m²",total:660000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥320,000",total:320000,note:""},
       ]},
      {cat:"構造材（プレカット）",emoji:"📐",total:2044000,color:"#b07850",url:"",
       items:[
         {name:"KD杉 120×120 柱材",qty:"80本",unit:"¥1,500/本",total:120000,note:"大断面"},
         {name:"KD杉 105×360 大梁",qty:"48本",unit:"¥6,000/本",total:288000,note:"大スパン・集成材推奨"},
         {name:"2F床梁・根太・廊下材",qty:"一式",unit:"¥450,000",total:450000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥280,000",total:280000,note:""},
         {name:"構造用合板 28mm",qty:"180枚",unit:"¥4,200/枚",total:756000,note:""},
         {name:"大引・束・土台一式",qty:"一式",unit:"¥150,000",total:150000,note:""},
       ]},
      {cat:"暖房（ロケットマスヒーター×4）",emoji:"🔥",total:608000,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"1000個",unit:"¥228/個",total:228000,note:"4基分"},
         {name:"蓄熱ベンチ コンクリート",qty:"一式",unit:"¥80,000",total:80000,note:""},
         {name:"煙突 Φ150 × 4系統",qty:"4式",unit:"¥75,000/式",total:300000,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:1050000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"300 m²",unit:"¥2,000/m²",total:600000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥450,000",total:450000,note:"超大型2階建て対応"},
       ]},
      {cat:"基礎（独立コンクリート 30点）",emoji:"⚓",total:566000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"12 m³",unit:"¥18,000/m³",total:216000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥350,000",total:350000,note:""},
       ]},
      {cat:"消防・旅館業設備+設計監理",emoji:"🏨",total:4900000,color:"#c06080",url:"",
       items:[
         {name:"スプリンクラー設備（自動式・全館30点）",qty:"一式",unit:"¥2,000,000",total:2000000,note:"旅館業（旅館・ホテル営業）申請要件"},
         {name:"旅館業什器（エアコン×14+寝具一式+備品）",qty:"一式",unit:"¥1,260,000",total:1260000,note:"14室×¥90,000"},
         {name:"建築士費用（設計+確認申請+構造計算+消防設計）",qty:"一式",unit:"¥1,200,000",total:1200000,note:"300m²超・構造計算必須"},
         {name:"外部工事（外構+駐車場舗装+外部照明+サイン）",qty:"一式",unit:"¥440,000",total:440000,note:""},
       ]},
      {cat:"附帯工事・搬入", emoji:"🚚", total:3310000, color:"#607080",
       items:[
         {name:"24時間熱交換換気ユニット（業務用・第一種・3ユニット）",qty:"3台",unit:"¥173,333/台",total:520000,note:"建築基準法対応・全棟対応"},
         {name:"室内電気配線（分電盤400A+コンセント60口+照明30点+非常灯+業務用配線）",qty:"一式",unit:"¥900,000",total:900000,note:"旅館業法対応"},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩）処理",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"階段（杉無垢×2基・1F→2F）",qty:"2基",unit:"¥190,000/基",total:380000,note:"2Fアクセス用"},
         {name:"建具金物（業務用ドア×16+引き戸金物一式）",qty:"一式",unit:"¥160,000",total:160000,note:""},
         {name:"運搬費（弟子屈まで・10tトラック×3便）",qty:"1式",unit:"¥1,000,000",total:1000000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜5",phase:"基礎工事（30点）",icon:"⚓",cost:542000,diff:"★★★★★",people:"5〜6人",
       desc:"独立基礎30点。地盤調査（¥20〜30万）を最初に実施。建築士による基礎設計必須。ミニユンボ5週間稼働。",
       tools:["ミニユンボ","測量器具","型枠","鉄筋"],tips:"MYTH級の荷重には地盤調査と構造計算が絶対に必要。妥協するな。"},
      {week:"W6〜10",phase:"土台・1F床組み",icon:"🪵",cost:2044000,diff:"★★★★☆",people:"5人",
       desc:"大断面柱（120×120）・大梁（105×360）のプレカット材を組む。180枚の剛床合板を張る。ミニクレーン2台必須。",
       tools:["インパクト","丸ノコ","ミニクレーン2台"],tips:"大断面材は2人がかりでも重い。チェーンブロック常備。"},
      {week:"W11〜18",phase:"棟上げ・2F骨組み",icon:"🏗️",cost:0,diff:"★★★★★",people:"12〜15人（4日）",
       desc:"MYTH級の棟上げは4日がかり。プロの鳶職人チームを必ず呼ぶ（¥30〜50万）。ラフタークレーン25t必須。命に関わる作業。",
       tools:["ラフタークレーン25t","インパクト","安全帯","足場"],tips:"「できるかな」ではなく「プロに頼む」が正解。棟上げだけは絶対プロへ。"},
      {week:"W19〜34",phase:"SIPsパネル取付（全面）",icon:"🔷",cost:9370000,diff:"★★★★☆",people:"6〜10人",
       desc:"650m²の壁パネル＋160m²の屋根パネルを16週間かけて施工。足場（¥200,000〜）全周設置必須。これだけで工期の1/3を占める。",
       tools:["インパクト","コーキングガン","足場（全周）"],tips:"継ぎ目の気密処理こそがMYTH品質を決める。手を抜くな。"},
      {week:"W35〜40",phase:"外装・超大型デッキ（120m²）",icon:"🌳",cost:1564000,diff:"★★★★☆",people:"5人",
       desc:"ガルバ外壁・屋根仕上げ＋120m²の大型デッキ施工。6週間。デッキだけでLARGE一棟分の床面積がある。",
       tools:["丸ノコ","タッカー","インパクト"],tips:"デッキ材は事前にACQ確認・塗料処理で耐久性確保。"},
      {week:"W41〜42",phase:"窓・気密処理",icon:"🪟",cost:2807000,diff:"★★★★☆",people:"4〜5人",
       desc:"南面超大開口・24枚の窓・引き戸6枚を取付。C値測定で0.3以下を目標。",
       tools:["気密テープ","測定機"],tips:"24枚を2週間で取付。開口部一つ一つ丁寧に気密処理。"},
      {week:"W43〜50",phase:"設備工事（超大型）",icon:"🔥",cost:3626000,diff:"★★★★★",people:"5〜8人",
       desc:"24枚ソーラー・1200Ah蓄電池・ロケットマスヒーター×4築炉・バレルサウナ設置・コンポスト×4・雨水15,000L。消防設備も設置。",
       tools:["配線工具","耐火レンガ","配管工具","消防設備"],tips:"消防署との事前協議は着工6ヶ月前から始めること。旅館業許可取得に3〜6ヶ月かかる。"},
      {week:"W51〜52",phase:"内装・什器・竣工",icon:"✨",cost:4000000,diff:"★★★★☆",people:"5〜8人",
       desc:"450m²の羽目板・フローリング・業務用キッチン・個室14室設備。保健所・消防・旅館業の各検査に合格して完成。",
       tools:["フィニッシュネイラー","丸ノコ"],tips:"完成したとき、それはもうMYTHだ。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修",cost:34500000,color:"#c89020",hi:true},
      {name:"補助金後",cost:32150000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:80000000,color:"#555"},
      {name:"宿泊収益（年）",cost:-5000000,color:"#c89020",note:"28名稼働¥500万/年"},
    ],
    floorSvg: `<svg viewBox="0 0 520 340" style="width:100%;background:#050505;display:block">
      <rect x="20" y="30" width="430" height="270" fill="none" stroke="#c89020" stroke-width="4"/>
      <line x1="20" y1="205" x2="450" y2="205" stroke="#555" stroke-width="1.5"/>
      <line x1="321" y1="30" x2="321" y2="205" stroke="#555" stroke-width="1.5"/>
      <line x1="213" y1="205" x2="213" y2="300" stroke="#555" stroke-width="1.5"/>
      <line x1="20" y1="240" x2="20" y2="275" stroke="#050505" stroke-width="6"/>
      <path d="M20 240 Q52 240 52 272" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="60" y="297" width="230" height="7" fill="#4ab8d0" opacity=".7"/>
      <rect x="447" y="50" width="7" height="100" fill="#4ab8d0" opacity=".7"/>
      <rect x="450" y="30" width="55" height="270" fill="rgba(80,120,64,.15)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="477" y="170" fill="#507840" font-size="7" text-anchor="middle" transform="rotate(90,477,170)">大デッキ 120m²</text>
      <circle cx="70" cy="170" r="12" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.55)" stroke-width="1.5"/>
      <text x="70" y="174" fill="rgba(224,96,48,.8)" font-size="7" text-anchor="middle">炉×4</text>
      <rect x="30" y="215" width="65" height="75" fill="rgba(200,80,32,.08)" stroke="rgba(200,80,32,.45)" stroke-width="1.5"/>
      <text x="63" y="258" fill="rgba(200,80,32,.7)" font-size="7.5" text-anchor="middle">サウナ</text>
      <text x="168" y="100" fill="#ddd" font-size="12" text-anchor="middle">食堂ホール</text>
      <text x="168" y="117" fill="#555" font-size="8.5" text-anchor="middle">90 m²（収容28名）</text>
      <text x="390" y="98" fill="#ddd" font-size="10" text-anchor="middle">厨房+倉庫</text>
      <text x="390" y="113" fill="#555" font-size="8" text-anchor="middle">30 m²</text>
      <text x="120" y="250" fill="#ddd" font-size="9" text-anchor="middle">スパ・水回り</text>
      <text x="120" y="265" fill="#555" font-size="7.5" text-anchor="middle">40 m²</text>
      <text x="345" y="250" fill="#ddd" font-size="9" text-anchor="middle">スタッフ+倉庫</text>
      <text x="345" y="265" fill="#555" font-size="7.5" text-anchor="middle">20 m²</text>
      <text x="20" y="22" fill="#c89020" font-size="8" font-weight="bold">MYTH 1F — 149m²（2F: 個室×14室+ラウンジ 149m²）</text>
      <line x1="20" y1="315" x2="450" y2="315" stroke="#333" stroke-width="1"/>
      <text x="20" y="327" fill="#555" font-size="7">16,380 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 560 290" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="250" x2="550" y2="250" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="140" width="480" height="110" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="30" y="46" width="480" height="94" fill="rgba(28,30,40,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,46 270,6 540,46" fill="rgba(26,26,26,.98)" stroke="#c89020" stroke-width="2"/>
      <rect x="80" y="-2" width="14" height="48" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="200" y="-2" width="14" height="48" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="330" y="-2" width="14" height="48" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="440" y="-2" width="14" height="48" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="50" y="162" width="280" height="76" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="190" y1="162" x2="190" y2="238" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="40" y="58" width="46" height="52" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="100" y="58" width="46" height="52" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="160" y="58" width="46" height="52" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="220" y="58" width="46" height="52" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="280" y="58" width="46" height="52" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="340" y="58" width="46" height="52" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="400" y="58" width="46" height="52" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="360" y="168" width="40" height="64" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <rect x="420" y="168" width="40" height="64" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <line x1="30" y1="140" x2="510" y2="140" stroke="#888" stroke-width="2"/>
      <rect x="510" y="178" width="50" height="72" fill="rgba(80,120,64,.2)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="535" y="218" fill="#507840" font-size="7" text-anchor="middle">デッキ</text>
      <rect x="160" y="14" width="220" height="24" fill="rgba(200,144,32,.15)" stroke="rgba(200,144,32,.3)" stroke-width="1" rx="2"/>
      <text x="270" y="29" fill="rgba(200,144,32,.7)" font-size="7.5" text-anchor="middle">ソーラー × 24枚</text>
      <text x="8" y="196" fill="#555" font-size="7" text-anchor="middle">1F</text>
      <text x="8" y="95" fill="#555" font-size="7" text-anchor="middle">2F</text>
      <line x1="30" y1="260" x2="510" y2="260" stroke="#444" stroke-width="1"/>
      <text x="270" y="276" fill="#444" font-size="8.5" text-anchor="middle">16,380 mm</text>
      <text x="20" y="8" fill="#c89020" font-size="8" font-weight="bold">MYTH — 南立面（2階建て・28名収容）</text>
    </svg>`,
  },
  // ===== KOSMOS (500m²) =====
  {
    id: "kosmos",
    name: "KOSMOS",
    label: "500m²",
    area: 500,
    dims: "W 22,000 × D 11,000 mm（2階建て）",
    weeks: 75,
    tag: "中規模リトリート・合宿施設",
    tagColor: "#20a8c0",
    desc: "【Phase 2 / 旅館業認定取得後リリース予定】500m²はもう「家」ではなく「施設」。1F食堂ホール150m²+大浴場+サウナ+ライブラリ、2F個室22室と共用ラウンジ。50名が3泊4日のリトリートを過ごせる規模。SIPs単体では強度不足になるため集成材ハイブリッド構造に切り替え、建築士の設計+構造計算+消防設計を前提とする。セルフビルドの度合いは下がるが、内装・断熱・電気の一部は施主主導が可能。",
    totalMat: 52000000,
    subsidyMax: 2350000,
    coldClimateUpgrade: 7000000,
    rentPerNight: 280000,
    color: "#20a8c0",
    img: "/img/build/kosmos_exterior.jpg",
    lifeImgs: [
      {src:"/img/build/kosmos_hall.jpg",     cap:"食堂ホール 150m²（収容50名・吹抜け5m）"},
      {src:"/img/build/kosmos_room.jpg",     cap:"ゲスト個室 22室（白木の禅室）"},
      {src:"/img/build/kosmos_bath.jpg",     cap:"檜の大浴場・12人槽"},
      {src:"/img/build/kosmos_library.jpg",  cap:"ライブラリ・静寂室"},
      {src:"/img/build/kosmos_aerial.jpg",   cap:"空撮・敷地一体の中央拠点"},
      {src:"/img/build/kosmos_exterior.jpg", cap:"南面立面・大開口W10m"},
    ],
    specs: [
      {k:"延床面積", v:"500 m²（151坪）1F: 250m² / 2F: 250m²"},
      {k:"外形寸法", v:"W 22,000 × D 11,000 × H 8,200 mm（2階建て）"},
      {k:"間取り", v:"1F 食堂ホール150m²+大浴場+サウナ+ライブラリ+厨房+水回り / 2F 個室×22室+共用ラウンジ"},
      {k:"収容人数", v:"最大50名（個室22室+ロフト+ホール仮眠対応）"},
      {k:"構造", v:"SIPs+集成材ハイブリッド 2階建て（建築士・構造計算・消防設計必須）"},
      {k:"天井高", v:"1F食堂 5,000mm吹抜け / 1F一般 3,000mm / 2F 2,800mm"},
      {k:"断熱性能", v:"UA値 0.30 W/m²K（HEAT20 G2 本州標準）"},
      {k:"暖房", v:"ペレット中央暖房 30kW + 床下温水パネル（薪サウナ別系統）"},
      {k:"電力", v:"18kW + 96kWh（30枚 + LiFePO4 2000Ah）+ 系統連系オプション"},
      {k:"運営許可", v:"旅館業（旅館・ホテル営業）+ 消防法（耐火2級）+ 食品衛生法 + 公衆浴場法"},
      {k:"耐震等級", v:"等級3 想定（許容応力度計算+耐火2級+消防設計必須・性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（建築士設計・構造計算・消防設計・耐火2級認定）"},
    ],
    materials: [
      {cat:"SIPsパネル+集成材ハイブリッド構造",emoji:"🏗️",total:15720000,color:"#20a8c0",url:"",alt:"",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"1,100 m²",unit:"¥11,000/m²",total:12100000,note:"1F+2F全周+間仕切り+22室区画"},
         {name:"SIPsパネル 屋根用 200mm",qty:"250 m²",unit:"¥14,000/m²",total:3500000,note:""},
         {name:"スプライン・コーキング一式",qty:"一式",unit:"¥120,000",total:120000,note:"500m²超は気密処理シビア"},
       ]},
      {cat:"集成材ハイブリッド構造材",emoji:"📐",total:4200000,color:"#b07850",url:"",
       items:[
         {name:"米松集成材 大断面柱 180×360",qty:"12本",unit:"¥250,000/本",total:3000000,note:"1F食堂吹抜けの主柱（5,000mm）"},
         {name:"米松集成材 大梁 180×540",qty:"8本",unit:"¥150,000/本",total:1200000,note:"スパン10m対応"},
       ]},
      {cat:"オフグリッド電力（業務級）",emoji:"☀️",total:2800000,color:"#f0c040",url:"",
       items:[
         {name:"600W 単結晶パネル（JA Solar / Longi）",qty:"30枚",unit:"¥18,000/枚",total:540000,note:"18kW・系統連系オプション"},
         {name:"LiFePO4 96V 2000Ah + 30kW 三相インバーター一式",qty:"1式",unit:"¥1,800,000",total:1800000,note:"≈96kWh・施設全体対応"},
         {name:"MPPT 400A + 主分電盤一式",qty:"1式",unit:"¥460,000",total:460000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:3500000,color:"#4ab8d0",url:"",
       items:[
         {name:"南面超大開口 W10000×H2700",qty:"1枚",unit:"¥1,800,000",total:1800000,note:"ペアLow-E 食堂全面"},
         {name:"樹脂窓 W780×H1170",qty:"36枚",unit:"¥38,000/枚",total:1368000,note:"2F個室22室+共用14"},
         {name:"玄関ドア 業務用断熱",qty:"1枚",unit:"¥250,000",total:250000,note:""},
         {name:"浴室高窓",qty:"4枚",unit:"¥20,500/枚",total:82000,note:""},
       ]},
      {cat:"内装・仕上げ（業務用）",emoji:"🪵",total:7400000,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"700 m²",unit:"¥2,800/m²",total:1960000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"480 m²",unit:"¥5,000/m²",total:2400000,note:"業務グレード"},
         {name:"業務用キッチン（IH8口×2+食洗機×2+冷蔵庫業務用）",qty:"1式",unit:"¥1,500,000",total:1500000,note:"50名対応・大型"},
         {name:"洗面台×12 + 造作棚",qty:"一式",unit:"¥30,000/台",total:360000,note:"共用+個室階各所"},
         {name:"個室ベッドフレーム",qty:"22台",unit:"¥40,000/台",total:880000,note:""},
         {name:"バレルサウナ（12人用）+ 薪ストーブ",qty:"1基",unit:"¥300,000",total:300000,note:"既存サウナ一覧との価格整合"},
       ]},
      {cat:"給排水・大浴場",emoji:"💧",total:2500000,color:"#50b8a0",url:"",
       items:[
         {name:"檜の大浴場（12人槽・タイル仕上げ）",qty:"1基",unit:"¥800,000",total:800000,note:"循環ろ過+加温"},
         {name:"Separett Villa 9215 尿分離型コンポスト",qty:"6台",unit:"¥75,000/台",total:450000,note:"50名対応・浄化槽併用"},
         {name:"合併浄化槽 50人槽（公衆浴場対応）",qty:"1基",unit:"¥600,000",total:600000,note:"公衆浴場法のため必須"},
         {name:"雨水タンク 25,000L",qty:"1基",unit:"¥420,000",total:420000,note:""},
         {name:"シャワーユニット",qty:"10式",unit:"¥23,000/式",total:230000,note:"男女+スパ+個室階"},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:1200000,color:"#507840",url:"",
       items:[
         {name:"国産杉 ACQ防腐処理 デッキ材",qty:"200 m²",unit:"¥3,500/m²",total:700000,note:"食堂南面・耐久20年以上"},
         {name:"根太・束柱・手すり一式",qty:"一式",unit:"¥500,000",total:500000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:1800000,color:"#888",url:"",
       items:[
         {name:"ガルバリウム波板 黒",qty:"850 m²",unit:"¥1,350/m²",total:1148000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥520,000",total:520000,note:""},
         {name:"軒・水切り金物一式",qty:"一式",unit:"¥132,000",total:132000,note:""},
       ]},
      {cat:"ペレット中央暖房",emoji:"🔥",total:1000000,color:"#e06030",url:"",
       items:[
         {name:"ペレットボイラー 30kW（本州標準）",qty:"1基",unit:"¥600,000",total:600000,note:"寒冷地は50kWに+¥25万"},
         {name:"床下温水配管+ヘッダー一式",qty:"一式",unit:"¥280,000",total:280000,note:""},
         {name:"ペレットサイロ 3t",qty:"1基",unit:"¥120,000",total:120000,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:1000000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"500 m²",unit:"¥1,200/m²",total:600000,note:"本州仕様"},
         {name:"気密テープ + 先張りシート（大型）",qty:"一式",unit:"¥400,000",total:400000,note:"500m²対応"},
       ]},
      {cat:"基礎（独立コンクリート 50点）",emoji:"⚓",total:900000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度500mm（本州標準）",qty:"18 m³",unit:"¥18,000/m³",total:324000,note:"寒冷地は1,000mm深 +¥40万"},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥576,000",total:576000,note:"50点+耐震金物"},
       ]},
      {cat:"旅館業設備+設計監理+消防",emoji:"🏨",total:6200000,color:"#c06080",url:"",
       items:[
         {name:"スプリンクラー設備（自動式・全館50点）",qty:"一式",unit:"¥2,800,000",total:2800000,note:"耐火2級・旅館業要件"},
         {name:"旅館業什器（エアコン×22+寝具一式+備品）",qty:"一式",unit:"¥1,800,000",total:1800000,note:"22室×¥80,000+共用"},
         {name:"建築士費用（設計+確認申請+構造計算+消防設計+音響）",qty:"一式",unit:"¥1,400,000",total:1400000,note:"500m²超・専門設計必須"},
         {name:"外部工事（外構+駐車場舗装+外部照明+サイン）",qty:"一式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"附帯工事・搬入",emoji:"🚚",total:3780000,color:"#607080",
       items:[
         {name:"24時間熱交換換気ユニット（業務用第一種・5ユニット）",qty:"5台",unit:"¥170,000/台",total:850000,note:"建築基準法対応"},
         {name:"室内電気配線（分電盤600A+業務用配線+非常灯+誘導灯）",qty:"一式",unit:"¥1,400,000",total:1400000,note:"旅館業法・消防法対応"},
         {name:"雨樋・水切り金物・防蟻（ホウ酸塩）処理",qty:"一式",unit:"¥450,000",total:450000,note:""},
         {name:"階段（杉無垢×3基）",qty:"3基",unit:"¥200,000/基",total:600000,note:"2Fアクセス+避難用"},
         {name:"建具金物（業務用ドア×24+引き戸金物一式）",qty:"一式",unit:"¥180,000",total:180000,note:""},
         {name:"運搬費（弟子屈・地方まで・10t×3便）",qty:"1式",unit:"¥300,000",total:300000,note:"本州近郊"},
       ]},
    ],
    steps: [
      {week:"W1〜6",phase:"地盤調査・基礎工事（50点）",icon:"⚓",cost:900000,diff:"★★★★★",people:"6〜8人",
       desc:"地盤調査（¥30〜50万）・柱状改良。50点独立基礎を6週間。建築士の基礎設計+第三者監理必須。ミニユンボ2台+ダンプ。",
       tools:["ミニユンボ×2","測量器具","型枠","鉄筋","ダンプ"],tips:"500m²超は地盤改良の判断が命綱。ボーリング調査は必ず実施。"},
      {week:"W7〜12",phase:"土台・1F床組み（集成材柱建て込み）",icon:"🪵",cost:4200000,diff:"★★★★☆",people:"6〜8人",
       desc:"米松集成材180×360柱（5,000mm長）12本をクレーンで建て込み。180×540大梁8本を10mスパンで架ける。剛床合板240枚。",
       tools:["インパクト","丸ノコ","ラフタークレーン25t","チェーンブロック"],tips:"集成材大断面は1本300kg超。クレーン+合図者必須。"},
      {week:"W13〜22",phase:"棟上げ・2F骨組み・小屋組",icon:"🏗️",cost:0,diff:"★★★★★",people:"15〜18人（5日）",
       desc:"棟上げは5日がかり。プロ鳶職人チーム必須（¥50〜80万）。ラフタークレーン35t必須。建築士+構造設計士の現場立会い必須。",
       tools:["ラフタークレーン35t","インパクト","安全帯","足場（全周5層）"],tips:"500m²棟上げは全工程で最も危険。プロ起用の妥協は許されない。"},
      {week:"W23〜44",phase:"SIPsパネル取付（全面・1,350m²）",icon:"🔷",cost:13720000,diff:"★★★★☆",people:"8〜12人",
       desc:"1,100m²の壁パネル＋250m²の屋根パネルを22週間で施工。足場（¥400,000〜）全周設置。これだけで工期の1/3。",
       tools:["インパクト","コーキングガン","足場（全周5層）"],tips:"22室区画のSIPs納まりは設計図通りに。後からの開口追加は気密破壊。"},
      {week:"W45〜52",phase:"外装・大型デッキ（200m²）",icon:"🌳",cost:3000000,diff:"★★★★☆",people:"6〜8人",
       desc:"ガルバ外壁850m²＋200m²のデッキ施工。8週間。ACQ防腐処理＋塗料処理で耐久20年確保。",
       tools:["丸ノコ","タッカー","インパクト","リフト"],tips:"ガルバ波板の取付は重ね幅と防水テープを徹底。"},
      {week:"W53〜56",phase:"窓・気密処理（40枚＋大開口）",icon:"🪟",cost:3500000,diff:"★★★★☆",people:"5〜6人",
       desc:"南面超大開口W10m+36枚の樹脂窓+業務用ドアを取付。C値0.5以下を目標に気密測定実施。",
       tools:["気密テープ","測定機","クレーン"],tips:"超大開口W10mは10人がかり。専門業者依頼推奨（¥30万）。"},
      {week:"W57〜68",phase:"設備工事（業務級・大浴場・スプリンクラー）",icon:"🔥",cost:14580000,diff:"★★★★★",people:"6〜10人",
       desc:"30枚ソーラー・2000Ah蓄電池・ペレットボイラー30kW・檜大浴場（12人槽）・コンポスト×6・浄化槽50人槽・スプリンクラー50点設置。消防+保健所事前協議必須。",
       tools:["配線工具","配管工具","消防設備","重機"],tips:"消防+保健所+浴場法は着工8ヶ月前から協議。許可なく着工すると致命的。"},
      {week:"W69〜75",phase:"内装・什器・検査・竣工",icon:"✨",cost:11600000,diff:"★★★★☆",people:"8〜12人",
       desc:"700m²の羽目板・480m²のフローリング・業務用キッチン・個室22室設備。建築完了検査・消防検査・保健所検査・旅館業検査・公衆浴場検査の5検査に合格して竣工。",
       tools:["フィニッシュネイラー","丸ノコ"],tips:"5検査同時並行は段取りが命。建築士+施工管理士のスケジュール調整を最優先。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修+施工チーム",cost:58000000,color:"#20a8c0",hi:true},
      {name:"補助金後",cost:55650000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:130000000,color:"#555"},
      {name:"宿泊収益（年）",cost:-9000000,color:"#20a8c0",note:"50名稼働¥900万/年"},
    ],
    floorSvg: `<svg viewBox="0 0 600 360" style="width:100%;background:#050505;display:block">
      <rect x="20" y="30" width="540" height="290" fill="none" stroke="#20a8c0" stroke-width="4"/>
      <line x1="20" y1="180" x2="560" y2="180" stroke="#555" stroke-width="1.5"/>
      <line x1="270" y1="30" x2="270" y2="180" stroke="#555" stroke-width="1.5"/>
      <line x1="420" y1="30" x2="420" y2="180" stroke="#555" stroke-width="1.5"/>
      <line x1="180" y1="180" x2="180" y2="320" stroke="#555" stroke-width="1.5"/>
      <line x1="360" y1="180" x2="360" y2="320" stroke="#555" stroke-width="1.5"/>
      <rect x="180" y="195" width="180" height="115" fill="rgba(80,184,160,.08)" stroke="#50b8a0" stroke-width="1.5"/>
      <text x="270" y="252" fill="#50b8a0" font-size="11" text-anchor="middle">檜の大浴場</text>
      <text x="270" y="268" fill="#666" font-size="8" text-anchor="middle">12人槽 · 男女別</text>
      <rect x="30" y="195" width="140" height="115" fill="rgba(200,80,32,.06)" stroke="rgba(200,80,32,.45)" stroke-width="1.5"/>
      <text x="100" y="252" fill="rgba(200,80,32,.8)" font-size="10" text-anchor="middle">サウナ</text>
      <text x="100" y="268" fill="#666" font-size="7.5" text-anchor="middle">12人 + 水風呂 + 外気浴</text>
      <text x="145" y="105" fill="#ddd" font-size="14" text-anchor="middle">食堂ホール</text>
      <text x="145" y="123" fill="#666" font-size="9" text-anchor="middle">150 m² · 収容50名 · 吹抜け5m</text>
      <text x="345" y="105" fill="#ddd" font-size="11" text-anchor="middle">ライブラリ</text>
      <text x="345" y="120" fill="#666" font-size="8.5" text-anchor="middle">静寂室 · 30 m²</text>
      <text x="490" y="105" fill="#ddd" font-size="11" text-anchor="middle">業務厨房</text>
      <text x="490" y="120" fill="#666" font-size="8.5" text-anchor="middle">50名対応 · 40 m²</text>
      <text x="450" y="252" fill="#ddd" font-size="10" text-anchor="middle">スタッフ+倉庫</text>
      <text x="450" y="268" fill="#666" font-size="7.5" text-anchor="middle">30 m²</text>
      <rect x="560" y="30" width="35" height="290" fill="rgba(80,120,64,.15)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="578" y="180" fill="#507840" font-size="7" text-anchor="middle" transform="rotate(90,578,180)">大デッキ 200m²</text>
      <text x="20" y="22" fill="#20a8c0" font-size="9" font-weight="bold">KOSMOS 1F — 250m²（2F: 個室×22室+共用ラウンジ 250m²）</text>
      <line x1="20" y1="335" x2="560" y2="335" stroke="#333" stroke-width="1"/>
      <text x="20" y="349" fill="#666" font-size="7.5">22,000 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 640 320" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="280" x2="630" y2="280" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="160" width="580" height="120" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="30" y="56" width="580" height="104" fill="rgba(28,30,40,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,56 320,12 620,56" fill="rgba(26,26,26,.98)" stroke="#20a8c0" stroke-width="2"/>
      <rect x="60" y="172" width="380" height="98" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="250" y1="172" x2="250" y2="270" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="250" y="226" fill="#4ab8d0" font-size="9" text-anchor="middle">食堂大開口 W10m × H2.7m</text>
      <g fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5">
        <rect x="40" y="68" width="46" height="60"/>
        <rect x="100" y="68" width="46" height="60"/>
        <rect x="160" y="68" width="46" height="60"/>
        <rect x="220" y="68" width="46" height="60"/>
        <rect x="280" y="68" width="46" height="60"/>
        <rect x="340" y="68" width="46" height="60"/>
        <rect x="400" y="68" width="46" height="60"/>
        <rect x="460" y="68" width="46" height="60"/>
        <rect x="520" y="68" width="46" height="60"/>
      </g>
      <line x1="30" y1="160" x2="610" y2="160" stroke="#888" stroke-width="2"/>
      <rect x="610" y="200" width="20" height="80" fill="rgba(80,120,64,.2)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="620" y="245" fill="#507840" font-size="6.5" text-anchor="middle" transform="rotate(90,620,245)">デッキ</text>
      <rect x="180" y="22" width="280" height="32" fill="rgba(32,168,192,.15)" stroke="rgba(32,168,192,.3)" stroke-width="1" rx="2"/>
      <text x="320" y="42" fill="rgba(32,168,192,.7)" font-size="9" text-anchor="middle">ソーラー × 30枚（系統連系オプション）</text>
      <text x="8" y="220" fill="#666" font-size="8" text-anchor="middle">1F</text>
      <text x="8" y="110" fill="#666" font-size="8" text-anchor="middle">2F</text>
      <line x1="30" y1="290" x2="610" y2="290" stroke="#444" stroke-width="1"/>
      <text x="320" y="306" fill="#555" font-size="9" text-anchor="middle">22,000 mm</text>
      <text x="20" y="9" fill="#20a8c0" font-size="9" font-weight="bold">KOSMOS — 南立面（2階建て・50名収容・耐火2級）</text>
    </svg>`,
  },
];

// ── アップグレードオプション ──────────────────────────────────────────────
window.BUILD_UPGRADES = [
  {
    id: "hrv",
    name: "HRV 熱交換換気",
    icon: "🌬️",
    tag: "品質向上",
    tagColor: "#4ab8d0",
    desc: "第一種換気（熱交換率85%以上）。高気密住宅には換気が必須。PM2.5除去・CO2管理・結露防止。冬の換気熱損失を85%削減し、薪消費も下がる。パナソニック・三菱製品が国内で入手しやすい。",
    impact: "冬の換気ロス ▲85% / 空気質が別次元に",
    pros: ["PM2.5 99%除去", "換気熱損失▲85%", "結露・カビ防止", "CO2自動管理"],
    costs: {mini:120000, standard:200000, large:320000, xl:450000, villa:700000, grand:1100000, myth:2000000, dome:150000},
  },
  {
    id: "radiant",
    name: "蓄熱床暖房",
    icon: "♨️",
    tag: "快適性向上",
    tagColor: "#e06030",
    desc: "ロケットマスヒーターの熱を床スラブ内PEX配管に蓄熱。薪1本で6〜8時間温もりが続く。基礎工事時にPEX管を埋設するので計画段階での決断が必要。弟子屈の-30℃夜でも床からぽかぽか。",
    impact: "薪消費 ▲1/3 / 朝も足元から暖かい",
    pros: ["夜間蓄熱で朝も暖かい", "薪消費1/3削減", "輻射熱で体感+3℃", "足元から温まる"],
    costs: {mini:180000, standard:380000, large:620000, xl:950000, villa:1600000, grand:2600000, myth:4500000, dome:480000},
  },
  {
    id: "clt",
    name: "CLT 床・天井材",
    icon: "🪵",
    tag: "意匠・強度向上",
    tagColor: "#a07850",
    desc: "構造合板28mmをCLT（直交集成板）に変更。剛性1.5倍、調湿効果、天井仕上げ不要。杉CLTは弟子屈周辺産も調達可能で地産地消になる。木の表面がそのまま内装になりコストを相殺。",
    impact: "天井仕上げ不要 / 剛性1.5倍 / 調湿効果",
    pros: ["天井仕上げ不要", "剛性1.5倍", "湿度自然調整", "弟子屈産杉調達可"],
    costs: {mini:150000, standard:380000, large:640000, xl:980000, villa:1800000, grand:3000000, myth:5500000, dome:300000},
  },
  {
    id: "kit",
    name: "完全パネルキット工法",
    icon: "🏭",
    tag: "工期1/3短縮",
    tagColor: "#9060e0",
    desc: "壁・床・屋根を工場で完成品パネルとして製作し番号通り組むだけ。施工ミスゼロ、工期1/3。SIPsバラ発注より高いがC値0.1以下保証・雨天施工可・品質が確定する。STANDARD(24.8m²)なら3週間で屋根まで完成。",
    impact: "工期1/3短縮 / 気密C値0.1以下保証",
    pros: ["工期1/3短縮", "C値0.1以下保証", "施工ミスゼロ", "雨天施工可能"],
    costs: {mini:250000, standard:650000, large:1100000, xl:1800000, villa:3000000, grand:5000000, myth:9000000, dome:0},
  },
  {
    id: "solar_water",
    name: "太陽熱温水器",
    icon: "🌡️",
    tag: "オフグリッド完全化",
    tagColor: "#f0c040",
    desc: "真空管式集熱パネル+断熱タンクで給湯を完全オフグリッド化。晴天時はシャワー・食器洗いを電力ゼロで対応。冬でも予熱効果があり、ロケットマスヒーターとの組み合わせで年間ほぼ無料の給湯が実現。",
    impact: "給湯電力ゼロ / 年間¥8〜15万節約",
    pros: ["給湯電力ゼロ", "冬でも予熱効果", "薪消費さらに削減", "耐用年数20年以上"],
    costs: {mini:200000, standard:280000, large:380000, xl:500000, villa:800000, grand:1400000, myth:2500000, dome:250000},
  },
  {
    id: "water_supply",
    name: "水道引き込み工事",
    icon: "🚰",
    tag: "インフラ整備 OP",
    tagColor: "#4080e0",
    desc: "宅内に水道の引き込みがない、または本館から分岐できない場合に必要な工事。公道から敷地内への給水管引き込み（口径20mm標準）。工事費は距離・口径・地盤条件により変動。オフグリッド水源（井戸・雨水）を採用する場合は不要。",
    impact: "生活用水を安定確保 / 給湯・シャワー・キッチン全対応",
    pros: ["安定した水圧・水量", "将来の増設にも対応", "飲料水基準をクリア", "工事1〜3日で完了"],
    costs: {mini:800000, standard:900000, large:950000, xl:1000000, villa:1000000, grand:1200000, myth:1500000, dome:800000},
  },
];

window.BUILD_COSTDOWNS = [
  {
    id:"screw_pile",
    name:"スクリュー杭基礎",
    icon:"🔩",
    tag:"基礎工法変更",
    tagColor:"#4080e0",
    supplyRating:5,
    supplyNote:"旭化成建材・テノックス・日本スクリュー杭など全国50社以上。即納・設計支援込",
    desc:"コンクリート不要、機械で1日圧入するだけ。養生期間ゼロで翌日から上棟可能。将来の撤去・移設も可能。積雪深2m超・軟弱地盤は別途検討。",
    impact:"基礎工事1日完了 / 養生期間ゼロ翌日上棟 / 移設可能",
    pros:["1日施工","養生ゼロ翌日上棟","DII設置モデルあり","撤去・移設可能"],
    isDeferred:false,
    savings:{mini:150000,standard:250000,large:400000,xl:600000,villa:900000,grand:1500000,myth:2500000, dome:250000},
  },
  {
    id:"reclaimed",
    name:"中古建材・廃材活用",
    icon:"♻️",
    tag:"開口部・内装▲30〜50%",
    tagColor:"#50b870",
    supplyRating:3,
    supplyNote:"ヤフオク建材カテゴリ・建デポ中古館（全国15店）・地域解体業者。調達に1〜3ヶ月の余裕を",
    desc:"サッシ・ドア・フローリングは中古品で問題なし。構造材は新材推奨。古民家解体現場から良質な古材・建具を格安で入手できる。デッキ材は無料入手できることも。",
    impact:"サッシ・ドア 50〜70%安 / フローリング 40〜60%安",
    pros:["サッシ・ドア -50%","フローリング -40%","デッキ材無料も","廃材目利き力が育つ"],
    isDeferred:false,
    savings:{mini:80000,standard:150000,large:250000,xl:380000,villa:550000,grand:900000,myth:1500000, dome:800000},
  },
  {
    id:"group_order",
    name:"5棟まとめ発注（ビレッジ割引）",
    icon:"🏘️",
    tag:"材料費▲15〜20%",
    tagColor:"#c86030",
    supplyRating:5,
    supplyNote:"SIPsパネル・製材・太陽光はロット発注で卸値対応。SOLUNAが一括交渉・発注窓口を担当",
    desc:"SOLUNAビレッジ参加者と合同発注でメーカー直仕入れ価格を実現。5棟以上でSIPsパネル・製材・蓄電池が卸値に。発注・納品管理はSOLUNA側が対応するので手間ゼロ。",
    impact:"SIPsパネル 20〜25%割引 / 木材・合板 15〜20%割引",
    pros:["SIPsパネル -20%","木材・合板 -15%","太陽光・蓄電 -15%","発注窓口はSOLUNA"],
    isDeferred:false,
    savings:{mini:90000,standard:300000,large:500000,xl:800000,villa:1200000,grand:2000000,myth:3500000, dome:120000},
  },
  {
    id:"work_party",
    name:"ワークパーティー施工",
    icon:"🤝",
    tag:"労務コスト実質ゼロ",
    tagColor:"#9060e0",
    supplyRating:4,
    supplyNote:"SOLUNAビレッジメンバー間の相互扶助。独立した土地での建設は個別相談",
    desc:"ビレッジメンバーが互いの建設を手伝い合う。延べ20〜60人工の労働力を調達。技術者の作業を見ながら学べるため、自分の家の構造を完全理解できる。コミュニティも深まる。",
    impact:"延べ20〜60人工の労働力を無償調達 / 技術を習得しながら建てる",
    pros:["大工作業を見ながら学べる","家の構造を完全理解","次は教える側に","コミュニティ結束"],
    isDeferred:false,
    savings:{mini:200000,standard:400000,large:700000,xl:1000000,villa:1500000,grand:2500000,myth:4500000, dome:480000},
  },
  {
    id:"phased",
    name:"段階建設（シェル先行入居）",
    icon:"🪜",
    tag:"初期費用▲40%",
    tagColor:"#f0a030",
    supplyRating:5,
    supplyNote:"フェーズ1（躯体+断熱+屋根）で先行入居可。コンポストトイレ+雨水タンクを仮設として活用",
    desc:"まずフェーズ1で躯体・断熱・屋根だけ完成（全コストの約60%）して先行入居。住みながら収入を得つつフェーズ2の設備・内装工事を進める。補助金を2回に分けて申請することも可能。",
    impact:"初期支出を60%に圧縮 / 住みながら仕上げ / 補助金2期申請可",
    pros:["初期資金が60%でOK","住みながら仕上げ","設計変更が後から可能","補助金2期申請"],
    isDeferred:true,
    savings:{mini:300000,standard:1000000,large:1700000,xl:2700000,villa:4000000,grand:6500000,myth:10000000, dome:400000},
  },
];

window.SUPPLY_GUIDE = [
  {cat:"SIPsパネル（壁・屋根断熱）", emoji:"🏗️", color:"#4080e0",
   note:"特注寸法対応。まとめ発注で20%前後の割引あり。",
   suppliers:[
    {name:"ウッドビルド", note:"ネット発注可・特注寸法対応・全国配送", lead:"2〜4週", url:"https://www.wood-build.co.jp"},
    {name:"アキレス建材（Achilles Jr.）", note:"硬質ウレタン系SIPs。全国代理店網", lead:"2〜3週", url:"https://www.achilles.jp"},
    {name:"旭化成建材 ネオマフォーム", note:"フェノールフォーム系断熱材。高性能", lead:"1〜2週", url:"https://www.asahikasei-kenzai.com"},
   ]},
  {cat:"構造材・製材（木材）", emoji:"🪵", color:"#a07850",
   note:"地産材（地域製材所直）が輸送費込みで最安になるケースが多い。",
   suppliers:[
    {name:"ウッドマイル", note:"全国配送対応・地産材指定可・プレカット連携", lead:"1〜2週", url:"https://www.woodmiles.jp"},
    {name:"地域製材組合（各道県）", note:"農林水産部に問い合わせ。地産材で輸送費・価格ともに有利", lead:"1〜3週", url:""},
    {name:"モノタロウ（小物・羽柄材）", note:"翌日配送・会員10%引・追加カット可", lead:"翌日〜", url:"https://www.monotaro.com"},
   ]},
  {cat:"太陽光パネル・蓄電池", emoji:"⚡", color:"#f0c040",
   note:"Amazon経由でRenogy/EcoFlow/Jackeryが安定入手可。メーカー直より10〜15%安い場合も。",
   suppliers:[
    {name:"Renogy Japan（公式）", note:"DIYオフグリッド向け。単結晶200〜400W。日本語サポートあり", lead:"3〜7日", url:"https://www.renogy.jp"},
    {name:"EcoFlow公式（Amazon）", note:"DELTA Pro3・スマートホーム連携・急速充電", lead:"翌日〜3日", url:"https://www.amazon.co.jp/ecoflow"},
    {name:"Jackery Japan", note:"ポータブル電源+ソーラーセット。実績多数", lead:"翌日〜3日", url:"https://www.jackery.jp"},
   ]},
  {cat:"スクリュー杭基礎", emoji:"🔩", color:"#4080e0",
   note:"5棟以上の発注でロット割引あり。図面があれば即見積対応。",
   suppliers:[
    {name:"旭化成建材（ヘーベルパイル）", note:"全国施工ネットワーク・設計支援・保証付", lead:"1〜2週", url:"https://www.asahikasei-kenzai.com"},
    {name:"テノックス（Tenax）", note:"小径鋼管杭。自立施工向けマニュアル提供あり", lead:"1〜2週", url:"https://www.tenox.co.jp"},
    {name:"JFEシビル 鋼管杭", note:"重量物・傾斜地向け。大型物件に", lead:"2〜3週", url:"https://www.jfe-civil.com"},
   ]},
  {cat:"コンポストトイレ・オフグリッド給排水", emoji:"🚿", color:"#50b870",
   note:"輸入品はリードタイム注意。国産品なら即納可。",
   suppliers:[
    {name:"バイオレット コンポストトイレ（輸入）", note:"世界標準。輸入代行経由で入手可。臭いが少ない評価", lead:"4〜8週", url:""},
    {name:"Separett（スウェーデン産）", note:"尿分離型。においゼロ評価が高い。日本代理店あり", lead:"3〜5週", url:""},
    {name:"日本エコトイレ（国産）", note:"国産コンポストトイレ。メンテナンス体制あり", lead:"2〜3週", url:""},
   ]},
  {cat:"工具・ファスナー・接合金物", emoji:"🔧", color:"#888",
   note:"工具はMonotaRO会員（月¥500）で常時10%引。金物はカネシン・タナカが豊富。",
   suppliers:[
    {name:"モノタロウ", note:"最大品揃え・会員10%引・翌日配送・プロ向け", lead:"翌日", url:"https://www.monotaro.com"},
    {name:"マキタ直販", note:"電動工具はメーカー直購入が最安。修理対応も早い", lead:"2〜5日", url:"https://www.makita.co.jp"},
    {name:"カネシン（接合金物）", note:"ホールダウン・羽子板・梁受け金物の定番メーカー", lead:"1〜5日", url:"https://www.kanesin.co.jp"},
   ]},
  {cat:"中古建材・廃材", emoji:"♻️", color:"#50b870",
   note:"良い建材は出品後すぐ売れる。入荷アラート設定が鉄則。",
   suppliers:[
    {name:"ヤフオク（建材カテゴリ）", note:"サッシ・ドア・床材が豊富。出品アラート設定必須", lead:"即日〜2週", url:"https://auctions.yahoo.co.jp"},
    {name:"建デポ 中古建材館", note:"全国15店舗。現物確認できる安心感。デッキ材が安い", lead:"即日", url:"https://www.kenchiku-depot.co.jp"},
    {name:"解体業者直接交渉", note:"古民家解体現場に直接交渉。古材・建具を格安・無料で入手可", lead:"要調整", url:""},
   ]},
];
