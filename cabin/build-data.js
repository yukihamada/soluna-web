// ── 4プランデータ ──────────────────────────────────────────────────────────
window.BUILD_PLANS = [
  // ===== MINI (9.9m²) =====
  {
    id: "mini",
    name: "MINI",
    label: "10m²未満",
    area: 9.9,
    dims: "W 3,640 × D 2,730 mm",
    weeks: 5,
    tag: "建築確認不要",
    tagColor: "#50b8a0",
    desc: "建築確認申請が不要な10m²未満の超コンパクト小屋。ロフト付きで就寝スペースを確保。週末別荘・書斎・シェッドとして最速・最安で建てられる。",
    totalMat: 1023000,
    subsidyMax: 1350000,
    warmClimateDiscount: 65000,
    color: "#50b8a0",
    specs: [
      {k:"延床面積", v:"9.9 m²（3坪）"},
      {k:"外形寸法", v:"W 3,640 × D 2,730 × H 3,800 mm"},
      {k:"構造", v:"木造軸組 + スタイロ外張り断熱"},
      {k:"断熱性能", v:"UA値 0.20 W/m²K"},
      {k:"暖房", v:"小型薪ストーブ"},
      {k:"電力", v:"オフグリッド 400W + 2kWh"},
      {k:"トイレ", v:"コンポストトイレ"},
      {k:"建築確認", v:"不要（10m²未満）"},
    ],
    materials: [
      {cat:"構造材（プレカット）", emoji:"📐", total:95000, color:"#b07850",
       items:[
         {name:"KD杉 105×105 柱材",qty:"8本",unit:"¥1,200/本",total:9600,note:"プレカット込み"},
         {name:"KD杉 105×180 梁材",qty:"4本",unit:"¥2,200/本",total:8800,note:""},
         {name:"KD杉 45×90 間柱",qty:"20本",unit:"¥380/本",total:7600,note:""},
         {name:"構造用合板 24mm 床",qty:"6枚",unit:"¥3,800/枚",total:22800,note:""},
         {name:"野縁・垂木セット",qty:"一式",unit:"¥15,000",total:15000,note:""},
         {name:"ロフト床 パーチクルボード",qty:"3枚",unit:"¥2,800/枚",total:8400,note:""},
         {name:"ロフト梯子材",qty:"一式",unit:"¥23,800",total:23800,note:""},
       ]},
      {cat:"断熱（外張りスタイロ）", emoji:"🌡️", total:145000, color:"#7080e0",
       items:[
         {name:"スタイロフォーム 100mm 壁外張り",qty:"30 m²",unit:"¥3,200/m²",total:96000,note:""},
         {name:"スタイロフォーム 50mm 床下",qty:"7 m²",unit:"¥1,800/m²",total:12600,note:""},
         {name:"気密テープ 75mm",qty:"5巻",unit:"¥1,403/巻",total:7015,note:""},
         {name:"先張り気密シート",qty:"15 m²",unit:"¥600/m²",total:9000,note:""},
         {name:"ガルバ胴縁・通気材",qty:"一式",unit:"¥20,385",total:20385,note:""},
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
      {cat:"窓・開口部", emoji:"🪟", total:95000, color:"#4ab8d0",
       items:[
         {name:"樹脂窓 W780×H1170 南",qty:"2枚",unit:"¥32,000/枚",total:64000,note:"トリプルガラス"},
         {name:"ドア 断熱型 小型",qty:"1枚",unit:"¥31,000",total:31000,note:""},
       ]},
      {cat:"オフグリッド電力", emoji:"☀️", total:148000, color:"#f0c040",
       items:[
         {name:"Renogy 200W パネル",qty:"2枚",unit:"¥25,771/枚",total:51542,note:""},
         {name:"EcoFlow RIVER 2 Pro 768Wh",qty:"1台",unit:"¥59,800",total:59800,note:""},
         {name:"MPPT 30A + 配線一式",qty:"1式",unit:"¥36,658",total:36658,note:""},
       ]},
      {cat:"給排水・衛生", emoji:"💧", total:230000, color:"#50b8a0",
       items:[
         {name:"Nature's Head コンポストトイレ",qty:"1台",unit:"¥200,000",total:200000,note:"浄化槽不要"},
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
      {cat:"基礎（独立基礎 4点）", emoji:"⚓", total:42000, color:"#606060",
       items:[
         {name:"生コン 凍結深度1,000mm対応",qty:"0.8 m³",unit:"¥16,000/m³",total:12800,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥20,000",total:20000,note:""},
         {name:"砕石・砂",qty:"一式",unit:"¥9,200",total:9200,note:""},
       ]},
      {cat:"内装・仕上げ", emoji:"🪵", total:89000, color:"#a07850",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"22 m²",unit:"¥2,800/m²",total:61600,note:""},
         {name:"杉無垢フローリング",qty:"10 m²",unit:"¥2,700/m²",total:27000,note:""},
         {name:"造作棚・吊り収納一式",qty:"一式",unit:"¥400",total:400,note:"端材活用"},
       ]},
    ],
    steps: [
      {week:"W1",phase:"基礎 4点打設",icon:"⚓",cost:42000,diff:"★★☆☆☆",people:"2人",
       desc:"独立基礎を4点打設。凍結深度1,000mmまで掘る。4点なので1日で完了。",
       tools:["スコップ・ツルハシ","型枠板","アンカーボルト","生コン"],tips:"4点基礎はレベル出しが命。糸張りで正確に。"},
      {week:"W2",phase:"土台・床・ロフト骨組み",icon:"🪵",cost:95000,diff:"★★☆☆☆",people:"2人",
       desc:"土台を敷き、根太・床合板を張る。同時にロフト梯子・梁も仮組みしておく。",
       tools:["インパクト","丸ノコ","水平器"],tips:"ロフト高さは1,400mm以上確保。230cmの天井高があれば大人が立てる。"},
      {week:"W3",phase:"棟上げ・外張り断熱",icon:"🏗️",cost:145000,diff:"★★★☆☆",people:"3人",
       desc:"柱・梁を組んで棟上げ。スタイロ100mmを外張りし、タイベック・胴縁まで一気に進める。",
       tools:["インパクト","丸ノコ","カッター"],tips:"外張り断熱はスタイロを隙間なく。継ぎ目は気密テープで完全処理。"},
      {week:"W4",phase:"外装・窓・設備",icon:"🖤",cost:371000,diff:"★★★☆☆",people:"2人",
       desc:"ガルバ外壁・屋根を張り、窓を取り付ける。コンポストトイレ・ソーラーも同週に設置。",
       tools:["電動ドリル","コーキングガン","脚立"],tips:"小屋なら1人でもガルバ張りが可能。"},
      {week:"W5",phase:"内装・竣工",icon:"✨",cost:89000,diff:"★★☆☆☆",people:"2人",
       desc:"杉羽目板・フローリングを張り、薪ストーブを設置して完成。",
       tools:["フィニッシュネイラー","カンナ","丸ノコ"],tips:"5週間でコンパクトな週末小屋が完成。"},
    ],
    routes: [
      {name:"セルフビルド",cost:1023000,color:"#50b8a0",hi:true},
      {name:"補助金後",cost:23000,color:"rgba(80,200,160,.9)",gr:true,note:"移住補助¥100万後"},
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
      <text x="20" y="12" fill="#50b8a0" font-size="8" font-weight="bold">MINI — 9.9m² / 建築確認不要</text>
      <circle cx="45" cy="75" r="6" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.5)" stroke-width="1.2"/>
      <text x="45" y="79" fill="rgba(224,96,48,.8)" font-size="5.5" text-anchor="middle">炉</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 200 160" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="140" x2="190" y2="140" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="55" width="140" height="85" fill="rgba(28,28,28,.95)" stroke="#666" stroke-width="1.5"/>
      <polygon points="22,55 100,15 178,55" fill="rgba(22,22,22,.98)" stroke="#50b8a0" stroke-width="1.5"/>
      <rect x="55" y="20" width="10" height="35" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1"/>
      <rect x="100" y="78" width="50" height="55" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="162" y="105" width="20" height="35" fill="rgba(50,32,12,.4)" stroke="#666" stroke-width="1.2"/>
      <text x="100" y="8" fill="#50b8a0" font-size="8" text-anchor="middle">MINI — 南立面</text>
      <text x="125" y="112" fill="#888" font-size="7" text-anchor="middle">南窓</text>
      <line x1="30" y1="148" x2="170" y2="148" stroke="#444" stroke-width="1"/>
      <text x="100" y="158" fill="#444" font-size="7.5" text-anchor="middle">3,640 mm</text>
      <rect x="40" y="55" width="45" height="55" fill="rgba(80,184,160,.08)" stroke="rgba(80,184,160,.3)" stroke-width="1" stroke-dasharray="2,2"/>
      <text x="62" y="88" fill="rgba(80,184,160,.6)" font-size="6.5" text-anchor="middle">ロフト</text>
    </svg>`,
  },

  // ===== STANDARD (24.8m²) =====
  {
    id: "standard",
    name: "STANDARD",
    label: "24.8m²",
    area: 24.8,
    dims: "W 5,460 × D 4,550 mm",
    weeks: 8,
    tag: "本ガイドの標準",
    tagColor: "#c8a455",
    desc: "1人〜カップル向けの定番サイズ。南面大窓からの採光・ロケットマスヒーター・オフグリッド電力をすべて備えた、弟子屈の冬を越せる完全自立型住居。",
    totalMat: 3609052,
    subsidyMax: 2350000,
    warmClimateDiscount: 500000,
    color: "#c8a455",
    specs: [
      {k:"延床面積", v:"24.8 m²（7.5坪）"},
      {k:"外形寸法", v:"W 5,460 × D 4,550 × H 4,200 mm"},
      {k:"構造", v:"木造軸組 + SIPsパネル"},
      {k:"断熱性能", v:"UA値 0.16 W/m²K（HEAT20 G3）"},
      {k:"気密性能", v:"C値 0.2 以下"},
      {k:"暖房", v:"ロケットマスヒーター（薪）"},
      {k:"電力", v:"800W + 5kWh"},
      {k:"建築確認", v:"要（10m²超）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:1480000,color:"#c8a455",url:"",
       alt:"在来工法に変更でコスト▲¥80万、工期+2週",
       items:[
         {name:"SIPsパネル 壁用 OSB+160mm+OSB",qty:"80 m²",unit:"¥12,000/m²",total:960000,note:"工場製作・配送込み"},
         {name:"SIPsパネル 屋根用 200mm",qty:"35 m²",unit:"¥14,000/m²",total:490000,note:""},
         {name:"スプラインジョイント材",qty:"一式",unit:"¥30,000",total:30000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:435884,color:"#f0c040",url:"https://www.amazon.co.jp/s?k=Renogy+ソーラーパネル",
       items:[
         {name:"Renogy 200W 単結晶パネル",qty:"4枚",unit:"¥25,771/枚",total:103084,note:""},
         {name:"EcoFlow DELTA Pro3 5kWh",qty:"1台",unit:"¥279,800",total:279800,note:""},
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
      {cat:"給排水・衛生",emoji:"💧",total:280000,color:"#50b8a0",url:"",
       items:[
         {name:"Nature's Head コンポストトイレ",qty:"1台",unit:"¥200,000",total:200000,note:"浄化槽不要"},
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
      {cat:"基礎（独立コンクリート）",emoji:"⚓",total:71000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"1.5 m³",unit:"¥16,000/m³",total:24000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥47,000",total:47000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"基礎工事",icon:"⚓",cost:71000,diff:"★★★☆☆",people:"2〜3人",
       desc:"地面を掘り、コンクリート独立基礎を6点打つ。凍結深度1,000mm。レンタルミニユンボで効率化。",tools:["ミニユンボ（レンタル）","型枠板","鉄筋"],tips:"打設後は最低7日養生。凍結前に完了。"},
      {week:"W2",phase:"土台・床組み",icon:"🪵",cost:165000,diff:"★★☆☆☆",people:"2人",
       desc:"プレカット済みの土台・大引を組む。28mm剛床合板を張る。",tools:["インパクト","丸ノコ","水平器"],tips:"土台は防腐処理材。床合板の継ぎ目は大引の上で割り付け。"},
      {week:"W3",phase:"棟上げ",icon:"🏗️",cost:0,diff:"★★★★☆",people:"4人（1日）",
       desc:"プレカット材で柱・梁・母屋を一気に組む。4人・8時間で棟上げ完了。",tools:["インパクト","ハンマー","仮筋交い"],tips:"番号通りに組むだけ。前日に並び順を確認しておく。"},
      {week:"W4",phase:"SIPsパネル取付",icon:"🔷",cost:1480000,diff:"★★★☆☆",people:"4人",
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
      {name:"セルフビルド",cost:3609052,color:"#c8a455",hi:true},
      {name:"補助金後（子育て）",cost:1259052,color:"rgba(80,200,160,.9)",gr:true},
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
      <text x="20" y="12" fill="#c8a455" font-size="8" font-weight="bold">STANDARD — 24.8m²</text>
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
      <text x="20" y="12" fill="#c8a455" font-size="8" font-weight="bold">STANDARD — 南立面</text>
    </svg>`,
  },

  // ===== LARGE (42m²) =====
  {
    id: "large",
    name: "LARGE",
    label: "42m²",
    area: 42,
    dims: "W 7,280 × D 5,460 mm",
    weeks: 11,
    tag: "ファミリー向け",
    tagColor: "#e08030",
    desc: "ファミリーや友人複数人での移住に適したサイズ。寝室2室＋LDK＋ウッドデッキ付き。弟子屈への本格移住、週末二拠点居住に最適。",
    totalMat: 5975768,
    subsidyMax: 2350000,
    warmClimateDiscount: 800000,
    color: "#e08030",
    specs: [
      {k:"延床面積", v:"42 m²（12.7坪）"},
      {k:"外形寸法", v:"W 7,280 × D 5,460 × H 4,500 mm"},
      {k:"間取り", v:"LDK + 寝室2 + 水回り + デッキ"},
      {k:"構造", v:"木造軸組 + SIPsパネル"},
      {k:"断熱性能", v:"UA値 0.14 W/m²K"},
      {k:"暖房", v:"ロケットマスヒーター + 床下蓄熱"},
      {k:"電力", v:"1,600W + 10kWh"},
      {k:"建築確認", v:"要（30〜50m²届出範囲）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:2480000,color:"#e08030",url:"",
       alt:"",
       items:[
         {name:"SIPsパネル 壁用 160mm",qty:"140 m²",unit:"¥12,000/m²",total:1680000,note:""},
         {name:"SIPsパネル 屋根用 200mm",qty:"55 m²",unit:"¥14,000/m²",total:770000,note:""},
         {name:"スプライン・コーキング材",qty:"一式",unit:"¥30,000",total:30000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:845768,color:"#f0c040",url:"",
       items:[
         {name:"Renogy 200W 単結晶パネル",qty:"8枚",unit:"¥25,771/枚",total:206168,note:""},
         {name:"EcoFlow DELTA Pro3 × 2台",qty:"2台",unit:"¥279,800/台",total:559600,note:""},
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
         {name:"杉無垢フローリング 15mm",qty:"42 m²",unit:"¥3,500/m²",total:147000,note:""},
         {name:"システムキッチン（IH + 食洗機）",qty:"1式",unit:"¥120,000",total:120000,note:""},
         {name:"造作棚・収納・洗面台",qty:"一式",unit:"¥33,000",total:33000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:350000,color:"#50b8a0",url:"",
       items:[
         {name:"Nature's Head コンポストトイレ",qty:"1台",unit:"¥200,000",total:200000,note:""},
         {name:"雨水タンク 2,000L",qty:"1基",unit:"¥55,000",total:55000,note:""},
         {name:"フィルター + UV + ポンプ一式",qty:"1式",unit:"¥45,000",total:45000,note:""},
         {name:"バスユニット（簡易シャワー）",qty:"1式",unit:"¥50,000",total:50000,note:""},
       ]},
      {cat:"ウッドデッキ",emoji:"🌳",total:180000,color:"#507840",url:"",
       items:[
         {name:"耐久材 イタウバ デッキ材",qty:"15 m²",unit:"¥8,000/m²",total:120000,note:""},
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
      {cat:"暖房（ロケットマスヒーター）",emoji:"🔥",total:145000,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"280個",unit:"¥228/個",total:63840,note:""},
         {name:"蓄熱ベンチ用コンクリート",qty:"0.3 m³",unit:"¥16,000/m³",total:4800,note:""},
         {name:"煙突 Φ150 一式",qty:"1式",unit:"¥76,360",total:76360,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:190000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"42 m²",unit:"¥2,000/m²",total:84000,note:""},
         {name:"気密テープ + 先張りシート 一式",qty:"一式",unit:"¥106,000",total:106000,note:""},
       ]},
      {cat:"基礎（独立コンクリート 8点）",emoji:"⚓",total:110000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"2.5 m³",unit:"¥16,000/m³",total:40000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥70,000",total:70000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜2",phase:"基礎工事",icon:"⚓",cost:110000,diff:"★★★☆☆",people:"3人",
       desc:"独立基礎8点、凍結深度1,000mm。ミニユンボ必須。2週間でしっかり養生。",tools:["ミニユンボ","型枠","生コン"],tips:"8点基礎は対角線でレベルを確認。"},
      {week:"W3",phase:"土台・床組み",icon:"🪵",cost:280000,diff:"★★☆☆☆",people:"2〜3人",
       desc:"プレカット材で土台・大引・根太を組む。32枚の剛床合板を張る。",tools:["インパクト","丸ノコ","水平器"],tips:"スパンが長いので大引の間隔に注意。"},
      {week:"W4",phase:"棟上げ",icon:"🏗️",cost:0,diff:"★★★★☆",people:"5〜6人（1日）",
       desc:"大型になるため人手が必要。レンタルミニクレーン（¥40,000/日）の活用も検討。",tools:["インパクト","仮筋交い","クランプ"],tips:"大梁はミニクレーンで吊ると安全・確実。"},
      {week:"W5〜6",phase:"SIPsパネル取付",icon:"🔷",cost:2480000,diff:"★★★☆☆",people:"4人",
       desc:"壁・屋根パネルを建て込む。大型なので2週間かける。継ぎ目の気密処理を念入りに。",tools:["インパクト","コーキングガン","クランプ"],tips:"屋根パネルは安全帯必須。"},
      {week:"W7",phase:"外装・デッキ",icon:"🌳",cost:415000,diff:"★★★☆☆",people:"2〜3人",
       desc:"ガルバ外壁・屋根仕上げ＋ウッドデッキの骨組みと床張り。",tools:["丸ノコ","タッカー","インパクト"],tips:"デッキ材は事前に塗料処理しておくと耐久性アップ。"},
      {week:"W8",phase:"窓・気密処理",icon:"🪟",cost:580000,diff:"★★☆☆☆",people:"2人",
       desc:"大型南面窓・引き戸・玄関ドアを取付。C値測定で0.2以下を確認。",tools:["気密テープ","測定機"],tips:"引き戸の気密処理は特に念入りに。"},
      {week:"W9〜10",phase:"設備工事",icon:"🔥",cost:1175000,diff:"★★★★☆",people:"3人",
       desc:"ロケットマスヒーター築炉（蓄熱ベンチ付き）、8枚ソーラー配線、雨水2,000L。",tools:["耐火レンガ","配線工具","配管工具"],tips:"蓄熱ベンチがあると夜間も暖かさが持続。"},
      {week:"W11",phase:"内装・竣工",icon:"✨",cost:580000,diff:"★★☆☆☆",people:"2〜3人",
       desc:"羽目板・フローリング・キッチン・洗面台を設置。清掃・検査で完成。",tools:["フィニッシュネイラー","丸ノコ"],tips:"42m²なら本格的な生活空間が完成。"},
    ],
    routes: [
      {name:"セルフビルド",cost:5975768,color:"#e08030",hi:true},
      {name:"補助金後",cost:3625768,color:"rgba(80,200,160,.9)",gr:true},
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
      <text x="20" y="12" fill="#e08030" font-size="8" font-weight="bold">LARGE — 42m² + デッキ</text>
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
      <text x="20" y="10" fill="#e08030" font-size="8" font-weight="bold">LARGE — 南立面</text>
    </svg>`,
  },

  // ===== XL (65m²) =====
  {
    id: "xl",
    name: "XL",
    label: "65m²",
    area: 65,
    dims: "W 9,100 × D 7,280 mm",
    weeks: 16,
    tag: "ゲストハウス運営可",
    tagColor: "#9060e0",
    desc: "家族移住・民泊運営まで対応できる最大サイズ。ロフト付き大空間LDK＋寝室3室＋大デッキ。SOLUNAメンバーへの宿泊提供や短期賃貸で投資回収も可能。",
    totalMat: 9288652,
    subsidyMax: 2350000,
    warmClimateDiscount: 1500000,
    color: "#9060e0",
    specs: [
      {k:"延床面積", v:"65 m²（19.7坪）＋ロフト 18m²"},
      {k:"外形寸法", v:"W 9,100 × D 7,280 × H 5,500 mm"},
      {k:"間取り", v:"LDK+ロフト＋寝室3＋水回り2＋大デッキ"},
      {k:"構造", v:"木造軸組 + SIPsパネル"},
      {k:"断熱性能", v:"UA値 0.13 W/m²K（HEAT20 G3超）"},
      {k:"暖房", v:"ロケットマスヒーター + 蓄熱ベンチ"},
      {k:"電力", v:"2,400W + 15kWh（売電余剰あり）"},
      {k:"民泊運営", v:"旅館業・簡易宿所届出で可"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:3850000,color:"#9060e0",url:"",
       alt:"",
       items:[
         {name:"SIPsパネル 壁用 160mm",qty:"220 m²",unit:"¥12,000/m²",total:2640000,note:""},
         {name:"SIPsパネル 屋根用 200mm",qty:"85 m²",unit:"¥14,000/m²",total:1190000,note:""},
         {name:"スプライン・コーキング",qty:"一式",unit:"¥20,000",total:20000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:1268652,color:"#f0c040",url:"",
       items:[
         {name:"Renogy 200W パネル",qty:"12枚",unit:"¥25,771/枚",total:309252,note:""},
         {name:"EcoFlow DELTA Pro3 × 3台",qty:"3台",unit:"¥279,800/台",total:839400,note:""},
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
      {cat:"給排水・衛生",emoji:"💧",total:600000,color:"#50b8a0",url:"",
       items:[
         {name:"Nature's Head コンポスト × 2台",qty:"2台",unit:"¥200,000/台",total:400000,note:"浄化槽不要"},
         {name:"雨水タンク 3,000L",qty:"1基",unit:"¥70,000",total:70000,note:""},
         {name:"フィルター + UV + 大型ポンプ",qty:"1式",unit:"¥60,000",total:60000,note:""},
         {name:"シャワーユニット 2基",qty:"2式",unit:"¥35,000/式",total:70000,note:""},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:320000,color:"#507840",url:"",
       items:[
         {name:"イタウバ デッキ材",qty:"30 m²",unit:"¥8,000/m²",total:240000,note:""},
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
      {cat:"暖房（ロケットマスヒーター）",emoji:"🔥",total:185000,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"360個",unit:"¥228/個",total:82080,note:""},
         {name:"蓄熱ベンチ コンクリート",qty:"0.5 m³",unit:"¥16,000/m³",total:8000,note:""},
         {name:"煙突 Φ150 + ロフト貫通処理",qty:"1式",unit:"¥94,920",total:94920,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:290000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"65 m²",unit:"¥2,000/m²",total:130000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥160,000",total:160000,note:""},
       ]},
      {cat:"基礎（独立コンクリート 12点）",emoji:"⚓",total:165000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"4 m³",unit:"¥16,000/m³",total:64000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥101,000",total:101000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜3",phase:"基礎工事",icon:"⚓",cost:165000,diff:"★★★★☆",people:"3〜4人",
       desc:"独立基礎12点。スパンが広いため測量が重要。レンタルミニユンボで3週間かける。",tools:["ミニユンボ","測量器具","型枠"],tips:"基礎間隔が大きいので水糸でしっかり通り確認。"},
      {week:"W4",phase:"土台・床組み",icon:"🪵",cost:450000,diff:"★★★☆☆",people:"3人",
       desc:"大断面梁のプレカット材を組む。剛床50枚。ロフト梁も同時に仮組み。",tools:["インパクト","丸ノコ","ミニクレーン"],tips:"大断面梁はミニクレーン活用で安全。"},
      {week:"W5〜6",phase:"棟上げ・ロフト",icon:"🏗️",cost:0,diff:"★★★★★",people:"6〜8人（2日）",
       desc:"大型のため2日かけて棟上げ。ロフト梁・床も同時に施工。ミニクレーン（¥40,000/日）必須。",tools:["ミニクレーン","インパクト","仮筋交い"],tips:"安全が最優先。プロの鳶職人に棟上げのみ依頼（¥5〜10万）も検討。"},
      {week:"W7〜9",phase:"SIPsパネル取付",icon:"🔷",cost:3850000,diff:"★★★☆☆",people:"4〜5人",
       desc:"面積が大きいため3週間。屋根パネルは安全帯必須。継ぎ目のコーキングを徹底。",tools:["インパクト","コーキングガン","足場"],tips:"足場をレンタル（¥50,000〜）すると安全・効率大幅向上。"},
      {week:"W10〜11",phase:"外装・大デッキ",icon:"🌳",cost:680000,diff:"★★★☆☆",people:"3人",
       desc:"ガルバ外壁・屋根仕上げ＋30m²の大型ウッドデッキ施工。",tools:["丸ノコ","タッカー","インパクト"],tips:"デッキ材は事前に塗料処理。イタウバは耐久性が高い。"},
      {week:"W12",phase:"窓・気密処理",icon:"🪟",cost:920000,diff:"★★☆☆☆",people:"2〜3人",
       desc:"大型南面開口・引き戸2枚・窓10枚を取付。C値測定で0.2以下確認。",tools:["気密テープ","測定機"],tips:"開口部が多いのでC値測定前に全箇所テープ処理を確認。"},
      {week:"W13〜14",phase:"設備工事",icon:"🔥",cost:1715000,diff:"★★★★☆",people:"3〜4人",
       desc:"12枚ソーラー・3台蓄電池・ロケットマスヒーター（大型蓄熱ベンチ）・コンポスト2台・雨水3,000L。",tools:["配線工具","耐火レンガ","配管工具"],tips:"電気工事士委託部分を先に調整しておく（¥10〜15万）。"},
      {week:"W15〜16",phase:"内装・竣工",icon:"✨",cost:880000,diff:"★★☆☆☆",people:"3人",
       desc:"160m²の羽目板・65m²フローリング・業務用キッチン・洗面台2台。清掃・検査で完成。",tools:["フィニッシュネイラー","丸ノコ"],tips:"ゲストハウス運営には旅館業の簡易宿所届出が必要（弟子屈町保健所）。"},
    ],
    routes: [
      {name:"セルフビルド",cost:9288652,color:"#9060e0",hi:true},
      {name:"補助金後",cost:6938652,color:"rgba(80,200,160,.9)",gr:true},
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
      <text x="20" y="12" fill="#9060e0" font-size="8" font-weight="bold">XL — 65m² + ロフト18m² + デッキ</text>
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
      <text x="20" y="8" fill="#9060e0" font-size="8" font-weight="bold">XL — 南立面</text>
    </svg>`,
  },

  // ===== VILLA (120m²) =====
  {
    id: "villa",
    name: "VILLA",
    label: "120m²",
    area: 120,
    dims: "W 9,100 × D 6,370 mm（2階建て）",
    weeks: 24,
    tag: "別荘・民泊本格運営",
    tagColor: "#d04060",
    desc: "別荘・民泊・二拠点居住の本格拠点。2階建てで120m²の広さを確保。1F:LDK+ゲスト室+水回り、2F:主寝室+子供室2+書斎。旅館業届出でSOLUNAメンバーへの宿泊提供も可能。棟上げ・電気工事の一部は専門職へ外注する前提のプラン。",
    totalMat: 13567920,
    subsidyMax: 2350000,
    warmClimateDiscount: 2000000,
    color: "#d04060",
    specs: [
      {k:"延床面積", v:"120 m²（36.3坪）1F: 60m² / 2F: 60m²"},
      {k:"外形寸法", v:"W 9,100 × D 6,370 × H 6,800 mm（2階建て）"},
      {k:"間取り", v:"LDK+ゲスト室+水回り2 / 主寝室+子供室2+書斎"},
      {k:"構造", v:"木造軸組 + SIPsパネル 2階建て"},
      {k:"断熱性能", v:"UA値 0.12 W/m²K（HEAT20 G3超）"},
      {k:"暖房", v:"ロケットマスヒーター×2 + 床下蓄熱"},
      {k:"電力", v:"4,000W + 12kWh（20枚 + 5台蓄電池）"},
      {k:"民泊運営", v:"旅館業・簡易宿所届出で可（8名収容）"},
      {k:"建築確認", v:"必須（4号特例の適用確認を推奨）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:5050000,color:"#d04060",url:"",alt:"",
       items:[
         {name:"SIPsパネル 壁用 160mm",qty:"300 m²",unit:"¥12,000/m²",total:3600000,note:"1F+2F 全周"},
         {name:"SIPsパネル 屋根用 200mm",qty:"100 m²",unit:"¥14,000/m²",total:1400000,note:""},
         {name:"スプライン・コーキング一式",qty:"一式",unit:"¥50,000",total:50000,note:""},
       ]},
      {cat:"オフグリッド電力",emoji:"☀️",total:2094420,color:"#f0c040",url:"",
       items:[
         {name:"Renogy 200W 単結晶パネル",qty:"20枚",unit:"¥25,771/枚",total:515420,note:""},
         {name:"EcoFlow DELTA Pro3",qty:"5台",unit:"¥279,800/台",total:1399000,note:"12kWh蓄電"},
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
      {cat:"給排水・衛生",emoji:"💧",total:720000,color:"#50b8a0",url:"",
       items:[
         {name:"Nature's Head コンポスト",qty:"2台",unit:"¥200,000/台",total:400000,note:""},
         {name:"雨水タンク 5,000L",qty:"1基",unit:"¥120,000",total:120000,note:""},
         {name:"フィルター + UV + ポンプ",qty:"1式",unit:"¥80,000",total:80000,note:""},
         {name:"シャワーユニット",qty:"3式",unit:"¥40,000/式",total:120000,note:""},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:580000,color:"#507840",url:"",
       items:[
         {name:"イタウバ デッキ材",qty:"60 m²",unit:"¥8,000/m²",total:480000,note:""},
         {name:"根太・束柱・手すり一式",qty:"一式",unit:"¥100,000",total:100000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:496000,color:"#888",url:"",
       items:[
         {name:"ガルバリウム波板 黒",qty:"280 m²",unit:"¥1,200/m²",total:336000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥160,000",total:160000,note:""},
       ]},
      {cat:"構造材（プレカット）",emoji:"📐",total:892000,color:"#b07850",url:"",
       items:[
         {name:"KD杉 105×105 柱材",qty:"40本",unit:"¥1,200/本",total:48000,note:""},
         {name:"KD杉 105×240 大梁",qty:"24本",unit:"¥4,500/本",total:108000,note:""},
         {name:"2F床梁・根太セット",qty:"一式",unit:"¥200,000",total:200000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"構造用合板 28mm",qty:"80枚",unit:"¥4,200/枚",total:336000,note:""},
         {name:"大引・束・土台一式",qty:"一式",unit:"¥80,000",total:80000,note:""},
       ]},
      {cat:"暖房（ロケットマスヒーター×2）",emoji:"🔥",total:284000,color:"#e06030",url:"",
       items:[
         {name:"耐火レンガ SK-32",qty:"500個",unit:"¥228/個",total:114000,note:"2基分"},
         {name:"蓄熱ベンチ用コンクリート",qty:"一式",unit:"¥20,000",total:20000,note:""},
         {name:"煙突 Φ150 × 2系統",qty:"2式",unit:"¥75,000/式",total:150000,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:460000,color:"#7080e0",url:"",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"120 m²",unit:"¥2,000/m²",total:240000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥220,000",total:220000,note:"2階建て対応"},
       ]},
      {cat:"基礎（独立コンクリート 18点）",emoji:"⚓",total:246000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"6 m³",unit:"¥16,000/m³",total:96000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥150,000",total:150000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜3",phase:"基礎工事（18点）",icon:"⚓",cost:246000,diff:"★★★★☆",people:"3〜4人",
       desc:"独立基礎18点。2階建てのため荷重計算をしっかり行い、アンカーボルト径も大きくする。ミニユンボ必須。",
       tools:["ミニユンボ","測量器具","型枠","鉄筋"],tips:"荷重が大きいため、設計士に基礎計算を依頼（¥5〜10万）すると安心。"},
      {week:"W4〜5",phase:"土台・1F床組み",icon:"🪵",cost:892000,diff:"★★★☆☆",people:"3人",
       desc:"プレカット土台・大引を組む。80枚の剛床合板を張る。2F床梁も仮組み。",
       tools:["インパクト","丸ノコ","水平器","ミニクレーン"],tips:"1F床が完成すると作業スペースになる。丁寧に水平を出す。"},
      {week:"W6〜9",phase:"棟上げ・2F骨組み",icon:"🏗️",cost:0,diff:"★★★★★",people:"6〜8人（2〜3日）",
       desc:"1F柱・梁を棟上げし、2F床梁・柱・屋根まで組む。ミニクレーン（¥40,000/日）必須。プロの鳶職人を招くと確実（¥10〜20万）。",
       tools:["ミニクレーン","インパクト","仮筋交い","安全帯"],tips:"2Fは高所作業。安全帯+ランヤード全員着用。棟上げ前日に順番と人員配置を綿密に計画。"},
      {week:"W10〜14",phase:"SIPsパネル取付（全面）",icon:"🔷",cost:5050000,diff:"★★★☆☆",people:"4〜6人",
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
      {name:"セルフビルド",cost:13567920,color:"#d04060",hi:true},
      {name:"補助金後",cost:11217920,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:36000000,color:"#555"},
      {name:"民泊収益（年）",cost:-1200000,color:"#d04060",note:"年¥120万収益想定"},
    ],
    floorSvg: `<svg viewBox="0 0 420 310" style="width:100%;background:#050505;display:block">
      <rect x="20" y="30" width="300" height="230" fill="none" stroke="#d04060" stroke-width="3.5"/>
      <line x1="20" y1="158" x2="320" y2="158" stroke="#555" stroke-width="1.5"/>
      <line x1="215" y1="158" x2="215" y2="260" stroke="#555" stroke-width="1.5"/>
      <line x1="20" y1="205" x2="20" y2="240" stroke="#050505" stroke-width="6"/>
      <path d="M20 205 Q46 205 46 231" fill="none" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <rect x="60" y="257" width="180" height="7" fill="#4ab8d0" opacity=".7"/>
      <rect x="316" y="48" width="7" height="90" fill="#4ab8d0" opacity=".7"/>
      <rect x="316" y="168" width="7" height="60" fill="#4ab8d0" opacity=".7"/>
      <text x="160" y="86" fill="#ddd" font-size="11" text-anchor="middle">LDK</text>
      <text x="160" y="101" fill="#555" font-size="8" text-anchor="middle">40 m²</text>
      <text x="90" y="208" fill="#ddd" font-size="9" text-anchor="middle">ゲスト室</text>
      <text x="90" y="222" fill="#555" font-size="7.5" text-anchor="middle">8 m²</text>
      <text x="272" y="208" fill="#ddd" font-size="9" text-anchor="middle">水回り</text>
      <text x="272" y="222" fill="#555" font-size="7.5" text-anchor="middle">12 m²×2</text>
      <rect x="320" y="30" width="55" height="230" fill="rgba(80,120,64,.15)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="347" y="150" fill="#507840" font-size="7" text-anchor="middle" transform="rotate(90,347,150)">デッキ 60m²</text>
      <circle cx="55" cy="134" r="9" fill="rgba(224,96,48,.2)" stroke="rgba(224,96,48,.55)" stroke-width="1.5"/>
      <text x="55" y="138" fill="rgba(224,96,48,.8)" font-size="7" text-anchor="middle">炉</text>
      <text x="20" y="22" fill="#d04060" font-size="8" font-weight="bold">VILLA 1F — 60m²（2F: 主寝室+子供室2+書斎 60m²）</text>
      <line x1="20" y1="286" x2="320" y2="286" stroke="#333" stroke-width="1"/>
      <text x="20" y="298" fill="#555" font-size="7">9,100 mm</text>
      <text x="330" y="298" fill="#888" font-size="6.5">↑ 2F: 寝室3+書斎</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 440 270" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="230" x2="430" y2="230" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="30" y="122" width="340" height="108" fill="rgba(32,32,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="30" y="46" width="340" height="76" fill="rgba(36,28,34,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="20,46 200,6 380,46" fill="rgba(26,26,26,.98)" stroke="#d04060" stroke-width="2"/>
      <rect x="90" y="-3" width="14" height="49" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="210" y="-3" width="14" height="49" fill="rgba(50,50,50,.95)" stroke="#666" stroke-width="1.5"/>
      <rect x="56" y="142" width="182" height="76" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="147" y1="142" x2="147" y2="218" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <rect x="64" y="58" width="60" height="50" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="158" y="58" width="60" height="50" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="252" y="58" width="60" height="50" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <line x1="30" y1="122" x2="370" y2="122" stroke="#888" stroke-width="2"/>
      <rect x="255" y="150" width="40" height="80" fill="rgba(55,36,18,.4)" stroke="#666" stroke-width="1.5"/>
      <rect x="370" y="158" width="50" height="72" fill="rgba(80,120,64,.2)" stroke="#507840" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="395" y="197" fill="#507840" font-size="7" text-anchor="middle">デッキ</text>
      <rect x="118" y="14" width="164" height="24" fill="rgba(208,64,96,.15)" stroke="rgba(208,64,96,.3)" stroke-width="1" rx="2"/>
      <text x="200" y="29" fill="rgba(208,64,96,.7)" font-size="7.5" text-anchor="middle">ソーラー × 20枚</text>
      <text x="8" y="178" fill="#555" font-size="7" text-anchor="middle">1F</text>
      <text x="8" y="88" fill="#555" font-size="7" text-anchor="middle">2F</text>
      <line x1="30" y1="240" x2="370" y2="240" stroke="#444" stroke-width="1"/>
      <text x="200" y="256" fill="#444" font-size="8.5" text-anchor="middle">9,100 mm</text>
      <text x="20" y="8" fill="#d04060" font-size="8" font-weight="bold">VILLA — 南立面（2階建て）</text>
    </svg>`,
  },

  // ===== GRAND (200m²) =====
  {
    id: "grand",
    name: "GRAND",
    label: "200m²",
    area: 200,
    dims: "W 12,740 × D 7,280 mm（2階建て）",
    weeks: 36,
    tag: "SOLUNAベース・宿泊施設",
    tagColor: "#1878c8",
    desc: "SOLUNAビレッジのメインロッジや商業宿泊施設として運営できる大型プラン。1F:食堂・ホール・厨房・水回り4、2F:個室×10室。最大20名収容。旅館業許可・消防法対応・建築士との協働が必須。",
    totalMat: 21591232,
    subsidyMax: 2350000,
    warmClimateDiscount: 3000000,
    color: "#1878c8",
    specs: [
      {k:"延床面積", v:"200 m²（60.5坪）1F: 100m² / 2F: 100m²"},
      {k:"外形寸法", v:"W 12,740 × D 7,280 × H 7,200 mm（2階建て）"},
      {k:"間取り", v:"1F 食堂+厨房+水回り4 / 2F 個室×10室"},
      {k:"収容人数", v:"最大20名（個室10室 × 2名）"},
      {k:"構造", v:"木造軸組 + SIPsパネル 2階建て（建築士必須）"},
      {k:"断熱性能", v:"UA値 0.12 W/m²K"},
      {k:"暖房", v:"ロケットマスヒーター×3 + 床下蓄熱"},
      {k:"電力", v:"6,400W + 20kWh（32枚 + 8台蓄電池）"},
      {k:"運営許可", v:"旅館業（簡易宿所）+ 消防法届出"},
      {k:"建築確認", v:"必須（建築士設計・監理）"},
    ],
    materials: [
      {cat:"SIPsパネル（壁・屋根）",emoji:"🏗️",total:8440000,color:"#1878c8",url:"",alt:"",
       items:[
         {name:"SIPsパネル 壁用 160mm",qty:"500 m²",unit:"¥12,000/m²",total:6000000,note:"1F+2F全周+間仕切り"},
         {name:"SIPsパネル 屋根用 200mm",qty:"170 m²",unit:"¥14,000/m²",total:2380000,note:""},
         {name:"スプライン・コーキング一式",qty:"一式",unit:"¥60,000",total:60000,note:""},
       ]},
      {cat:"オフグリッド電力（大型）",emoji:"☀️",total:3263072,color:"#f0c040",url:"",
       items:[
         {name:"Renogy 200W 単結晶パネル",qty:"32枚",unit:"¥25,771/枚",total:824672,note:""},
         {name:"EcoFlow DELTA Pro3",qty:"8台",unit:"¥279,800/台",total:2238400,note:"20kWh蓄電"},
         {name:"MPPT 200A + 分電盤一式",qty:"1式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:1764000,color:"#4ab8d0",url:"",
       items:[
         {name:"南面大開口 W5460×H2400",qty:"1枚",unit:"¥600,000",total:600000,note:"トリプルLow-E 食堂南面"},
         {name:"樹脂窓 W780×H1170",qty:"18枚",unit:"¥38,000/枚",total:684000,note:"2F個室×10+共用"},
         {name:"玄関ドア 断熱（業務用）",qty:"1枚",unit:"¥150,000",total:150000,note:""},
         {name:"デッキ引き戸 断熱",qty:"4枚",unit:"¥82,500/枚",total:330000,note:"食堂→デッキ"},
       ]},
      {cat:"内装・仕上げ（業務用）",emoji:"🪵",total:2322000,color:"#a07850",url:"",
       items:[
         {name:"国産杉 羽目板 15mm",qty:"340 m²",unit:"¥2,800/m²",total:952000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"200 m²",unit:"¥3,500/m²",total:700000,note:""},
         {name:"業務用キッチン（IH6口+食洗機）",qty:"1式",unit:"¥450,000",total:450000,note:"20名対応"},
         {name:"洗面台×4 + 造作棚",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"個室ベッドフレーム",qty:"10台",unit:"¥10,000/台",total:100000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:1120000,color:"#50b8a0",url:"",
       items:[
         {name:"Nature's Head コンポスト",qty:"3台",unit:"¥200,000/台",total:600000,note:"20名対応"},
         {name:"雨水タンク 10,000L",qty:"1基",unit:"¥200,000",total:200000,note:""},
         {name:"大型フィルター + UV + ポンプ",qty:"1式",unit:"¥120,000",total:120000,note:""},
         {name:"シャワーユニット",qty:"4式",unit:"¥50,000/式",total:200000,note:"男女分"},
       ]},
      {cat:"大型ウッドデッキ",emoji:"🌳",total:960000,color:"#507840",url:"",
       items:[
         {name:"イタウバ デッキ材",qty:"100 m²",unit:"¥8,000/m²",total:800000,note:"食堂南面"},
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
      {cat:"基礎（独立コンクリート 24点）",emoji:"⚓",total:410000,color:"#606060",url:"",
       items:[
         {name:"生コン 凍結深度1,000mm",qty:"10 m³",unit:"¥16,000/m³",total:160000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥250,000",total:250000,note:""},
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
      {week:"W14〜20",phase:"SIPsパネル取付（全面）",icon:"🔷",cost:8440000,diff:"★★★☆☆",people:"5〜8人",
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
      {name:"セルフビルド+部分外注",cost:21591232,color:"#1878c8",hi:true},
      {name:"補助金後",cost:19241232,color:"rgba(80,200,160,.9)",gr:true},
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
      <text x="20" y="322" fill="#555" font-size="7">12,740 mm</text>
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
];
