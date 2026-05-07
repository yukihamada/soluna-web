// SOLUNA URBAN — 都市型SIPsキャビン 3プラン
// build-data.js (鄙シリーズ) の都市版。同じ JS 構造を流用するため window.BUILD_PLANS に格納。
window.BUILD_PLANS = [
  // ===== POD (25m²) =====
  {
    id: "pod",
    name: "POD",
    label: "25m²",
    area: 25,
    dims: "W 3,500 × D 8,000 mm（平屋+ロフト）",
    weeks: 16,
    tag: "都市ワンルーム・SOHO",
    tagColor: "#50b8d0",
    desc: "都市の狭小区画(土地15坪〜)に収まる25m²ワンルーム。SIPs+ALC耐火被覆で準防火地域に対応。1階建てに天井高3mのロフトを足して縦に広げ、25m²でも閉塞感ゼロ。系統連系電力・上下水道・都市ガス前提。単身住宅・都市別荘・SOHO・スタジオとして月¥15万で貸し出すと18ヶ月で材料費回収。",
    totalMat: 12000000,
    subsidyMax: 3000000,
    coldClimateUpgrade: 800000,
    rentPerNight: 15000,
    color: "#50b8d0",
    img: "/img/urban/pod_ext.jpg",
    lifeImgs: [
      {src:"/img/urban/pod_ext.jpg", cap:"南面ファサード(夕景・狭小区画)"},
      {src:"/img/urban/pod_int.jpg", cap:"ワンルーム+ロフト(天井3m)"},
    ],
    specs: [
      {k:"延床面積", v:"25 m²（7.6坪）+ロフト6m²"},
      {k:"外形寸法", v:"W 3,500 × D 8,000 × H 4,000 mm"},
      {k:"間取り", v:"ワンルーム(LDK+UB+トイレ) + ロフト(寝室)"},
      {k:"天井高", v:"3,000mm + ロフト1,400mm"},
      {k:"構造", v:"SIPs+ALC30mm耐火被覆 平屋（準防火地域対応）"},
      {k:"断熱性能", v:"UA値 0.46 W/m²K（HEAT20 G1 都市標準）"},
      {k:"暖房", v:"エアコン1台 + 床暖房（系統連系）"},
      {k:"電力", v:"系統連系（オプションで太陽光3kW追加可）"},
      {k:"運営許可", v:"住宅（特例なし）/ 民泊届出可（住居専用地域不可）"},
      {k:"建築確認", v:"必須（小規模住宅・建築士不要可）"},
    ],
    materials: [
      {cat:"SIPs+ALC耐火被覆",emoji:"🏗️",total:3200000,color:"#50b8d0",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 160mm",qty:"60 m²",unit:"¥11,000/m²",total:660000,note:"標準OSB"},
         {name:"SIPsパネル 屋根用 200mm",qty:"32 m²",unit:"¥14,000/m²",total:448000,note:""},
         {name:"ALC 30mm 耐火被覆パネル",qty:"60 m²",unit:"¥6,500/m²",total:390000,note:"準防火地域認定"},
         {name:"耐火サイディング+ジョイント金物一式",qty:"一式",unit:"¥1,702,000",total:1702000,note:"準防火30分認定セット"},
       ]},
      {cat:"構造材（プレカット）",emoji:"📐",total:600000,color:"#b07850",
       items:[
         {name:"KD杉 120×120 柱材",qty:"16本",unit:"¥1,500/本",total:24000,note:""},
         {name:"KD杉 105×240 梁材",qty:"6本",unit:"¥6,000/本",total:36000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥240,000",total:240000,note:""},
         {name:"構造用合板 28mm + 大引き土台",qty:"一式",unit:"¥300,000",total:300000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:1000000,color:"#4ab8d0",
       items:[
         {name:"南面FIX大窓 W2500×H2000",qty:"1枚",unit:"¥420,000",total:420000,note:"トリプルLow-E樹脂"},
         {name:"樹脂窓 W780×H1170",qty:"4枚",unit:"¥38,000/枚",total:152000,note:"側面+ロフト窓"},
         {name:"玄関ドア 断熱（住宅用）",qty:"1枚",unit:"¥130,000",total:130000,note:""},
         {name:"ロフト天窓",qty:"1枚",unit:"¥168,000",total:168000,note:"FIX+電動ブラインド"},
         {name:"網戸・シャッター一式",qty:"一式",unit:"¥130,000",total:130000,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:2000000,color:"#a07850",
       items:[
         {name:"杉羽目板 15mm",qty:"60 m²",unit:"¥2,800/m²",total:168000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"31 m²",unit:"¥5,000/m²",total:155000,note:""},
         {name:"ミニキッチン（IH2口+食洗機+冷蔵庫一体型）",qty:"1式",unit:"¥450,000",total:450000,note:"幅1800mm"},
         {name:"洗面化粧台+ロフト階段+造作棚",qty:"一式",unit:"¥327,000",total:327000,note:""},
         {name:"漆喰 + 無垢部材一式",qty:"一式",unit:"¥900,000",total:900000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:700000,color:"#50b8a0",
       items:[
         {name:"システムバス 1216（樹脂浴槽）",qty:"1基",unit:"¥320,000",total:320000,note:""},
         {name:"温水洗浄便座（節水型）",qty:"1基",unit:"¥80,000",total:80000,note:""},
         {name:"上下水道引込工事",qty:"一式",unit:"¥200,000",total:200000,note:"道路から敷地内10m"},
         {name:"配管材一式",qty:"一式",unit:"¥100,000",total:100000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:550000,color:"#888",
       items:[
         {name:"ガルバリウム波板 黒",qty:"60 m²",unit:"¥1,350/m²",total:81000,note:""},
         {name:"杉板格子（縦張り）+塗装",qty:"15 m²",unit:"¥4,800/m²",total:72000,note:"南面ファサード"},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"軒・水切り金物一式",qty:"一式",unit:"¥147,000",total:147000,note:""},
       ]},
      {cat:"暖房・空調",emoji:"❄️",total:450000,color:"#4ab8d0",
       items:[
         {name:"エアコン 6畳用（高効率）",qty:"1台",unit:"¥120,000",total:120000,note:"暖冷房兼用"},
         {name:"床暖房 8m²（電気式）",qty:"1式",unit:"¥230,000",total:230000,note:"LDK主居室"},
         {name:"24時間換気 第三種",qty:"1式",unit:"¥100,000",total:100000,note:"建築基準法対応"},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:350000,color:"#7080e0",
       items:[
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"基礎断熱（XPS50mm）",qty:"25 m²",unit:"¥1,800/m²",total:45000,note:""},
         {name:"その他補助断熱材一式",qty:"一式",unit:"¥185,000",total:185000,note:""},
       ]},
      {cat:"基礎（べた基礎）",emoji:"⚓",total:750000,color:"#606060",
       items:[
         {name:"生コン 凍結深度300mm",qty:"5 m³",unit:"¥18,000/m³",total:90000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥420,000",total:420000,note:"べた基礎28m²"},
         {name:"地業（砕石・防湿シート）",qty:"一式",unit:"¥240,000",total:240000,note:""},
       ]},
      {cat:"設計監理+確認申請",emoji:"📋",total:900000,color:"#c06080",
       items:[
         {name:"建築確認申請",qty:"一式",unit:"¥250,000",total:250000,note:"申請手数料込み"},
         {name:"設計図一式（意匠+構造+設備）",qty:"一式",unit:"¥450,000",total:450000,note:"小規模住宅"},
         {name:"完了検査・引き渡し書類一式",qty:"一式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"附帯工事・搬入",emoji:"🚚",total:1500000,color:"#607080",
       items:[
         {name:"電気引込+分電盤+コンセント+照明一式",qty:"一式",unit:"¥400,000",total:400000,note:"100A 単相3線"},
         {name:"都市ガス引込",qty:"一式",unit:"¥150,000",total:150000,note:"道路から敷地内"},
         {name:"通信(光ファイバー)+TV配線",qty:"一式",unit:"¥80,000",total:80000,note:""},
         {name:"足場(全周2層)",qty:"一式",unit:"¥150,000",total:150000,note:""},
         {name:"建具金物・防蟻処理",qty:"一式",unit:"¥220,000",total:220000,note:""},
         {name:"運搬費(都内)",qty:"一式",unit:"¥120,000",total:120000,note:"4tトラック2便"},
         {name:"その他諸経費・廃材処分",qty:"一式",unit:"¥380,000",total:380000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"設計確認・地盤調査",icon:"📋",cost:0,diff:"★★☆☆☆",people:"設計士1人",
       desc:"都市部の狭小地は隣家との越境・電線・道路後退ラインの確認が命。建築確認申請は2〜4週間。", tools:["測量器具"],tips:"都市は近隣調整が最重要。事前挨拶で半分決まる。"},
      {week:"W2〜3",phase:"基礎工事（べた基礎）",icon:"⚓",cost:750000,diff:"★★★☆☆",people:"3人",
       desc:"28m²のべた基礎。凍結深度300mm（本州都市部標準）。生コン1日打設。", tools:["ミニユンボ","型枠","鉄筋"],tips:"狭小地はミキサー車の進入経路を事前確認。"},
      {week:"W4〜5",phase:"土台・床組み・骨組",icon:"🪵",cost:600000,diff:"★★★☆☆",people:"3〜4人",
       desc:"プレカット材を組む。ワンルーム+ロフトの単純構造。", tools:["インパクト","丸ノコ","レベル"],tips:"小屋組まで2週間で完了する規模。"},
      {week:"W6〜7",phase:"SIPs+ALC耐火被覆取付",icon:"🔷",cost:3200000,diff:"★★★★☆",people:"4人",
       desc:"60m²の壁パネル+32m²の屋根パネル+ALC30mm耐火被覆を施工。準防火地域認定の納まりに注意。", tools:["インパクト","コーキングガン","リフト"],tips:"ALC耐火被覆は気密より防火優先。納まり図通りに。"},
      {week:"W8〜9",phase:"屋根・外装",icon:"🖤",cost:1100000,diff:"★★★☆☆",people:"3人",
       desc:"ガルバ波板60m²+杉板格子15m²(南面)+水切り金物。", tools:["丸ノコ","タッカー","コーキング"],tips:"杉板格子は耐候塗装3回必須。"},
      {week:"W10〜11",phase:"窓・断熱・気密",icon:"🪟",cost:1750000,diff:"★★★★☆",people:"3人",
       desc:"FIX大窓W2.5m+樹脂窓4枚+玄関+ロフト天窓を取付。気密テープで処理。C値1.0以下目標。", tools:["気密テープ","測定機"],tips:"FIX大窓は2人がかりで持ち上げ。動線を確保。"},
      {week:"W12〜13",phase:"設備工事（電気・配管・空調）",icon:"⚡",cost:2650000,diff:"★★★★☆",people:"4人",
       desc:"電気引込100A+ガス+水道+通信+UB+ミニキッチン+エアコン+床暖。都市インフラ全部入り。", tools:["配管工具","配線工具"],tips:"電気・ガス・水道の引込は2週間前に申請を入れること。"},
      {week:"W14〜15",phase:"内装・什器",icon:"🪵",cost:2000000,diff:"★★★☆☆",people:"3人",
       desc:"杉羽目板60m²+フローリング31m²+漆喰+ロフト階段+造作棚。", tools:["フィニッシュネイラー","左官鏝"],tips:"漆喰は3回塗りで仕上がる。"},
      {week:"W16",phase:"検査・引き渡し",icon:"✨",cost:0,diff:"★★☆☆☆",people:"2人",
       desc:"建築完了検査+気密測定+引き渡し書類。住宅瑕疵担保責任保険加入。", tools:["気密測定機"],tips:"完了検査済証なしでは住めない。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修",cost:13500000,color:"#50b8d0",hi:true},
      {name:"補助金後（ZEH+都市補助）",cost:10500000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:25000000,color:"#555"},
      {name:"賃貸収益（年）",cost:-1800000,color:"#50b8d0",note:"¥15万/月想定"},
    ],
    floorSvg: `<svg viewBox="0 0 240 320" style="width:100%;background:#050505;display:block">
      <rect x="20" y="40" width="200" height="240" fill="none" stroke="#50b8d0" stroke-width="3"/>
      <line x1="20" y1="200" x2="220" y2="200" stroke="#555" stroke-width="1.5"/>
      <line x1="160" y1="200" x2="160" y2="280" stroke="#555" stroke-width="1.5"/>
      <rect x="160" y="210" width="60" height="35" fill="rgba(70,184,208,.06)" stroke="#50b8d0" stroke-width="1.5"/>
      <text x="190" y="232" fill="#50b8d0" font-size="8" text-anchor="middle">UB</text>
      <rect x="160" y="245" width="60" height="35" fill="rgba(70,184,208,.06)" stroke="#50b8d0" stroke-width="1.5"/>
      <text x="190" y="267" fill="#50b8d0" font-size="8" text-anchor="middle">WC+洗面</text>
      <rect x="20" y="200" width="140" height="80" fill="rgba(160,120,80,.06)"/>
      <text x="90" y="244" fill="#ddd" font-size="11" text-anchor="middle">LDK</text>
      <text x="90" y="260" fill="#666" font-size="8" text-anchor="middle">19m² · ロフトアクセス</text>
      <rect x="20" y="40" width="200" height="160" fill="rgba(70,184,208,.04)"/>
      <text x="120" y="100" fill="#ddd" font-size="10" text-anchor="middle">FIX大窓 W2,500×H2,000</text>
      <text x="120" y="118" fill="#666" font-size="8" text-anchor="middle">南面採光</text>
      <line x1="20" y1="40" x2="220" y2="40" stroke="#4ab8d0" stroke-width="6" opacity=".7"/>
      <text x="20" y="32" fill="#50b8d0" font-size="8" font-weight="bold">POD — 25m²（平屋+ロフト6m²）</text>
      <line x1="20" y1="295" x2="220" y2="295" stroke="#333" stroke-width="1"/>
      <text x="20" y="307" fill="#666" font-size="7.5">3,500 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 320 220" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="190" x2="310" y2="190" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="40" y="80" width="240" height="110" fill="rgba(28,30,32,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="30,80 160,30 290,80" fill="rgba(26,26,26,.98)" stroke="#50b8d0" stroke-width="2"/>
      <rect x="60" y="100" width="120" height="80" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="120" y1="100" x2="120" y2="180" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="120" y="148" fill="#4ab8d0" font-size="8" text-anchor="middle">FIX大窓 W2.5m</text>
      <rect x="200" y="110" width="40" height="60" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <text x="220" y="146" fill="#888" font-size="7" text-anchor="middle">玄関</text>
      <rect x="170" y="42" width="40" height="32" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="1.5"/>
      <text x="190" y="62" fill="#4ab8d0" font-size="6.5" text-anchor="middle">ロフト天窓</text>
      <line x1="40" y1="80" x2="280" y2="80" stroke="#888" stroke-width="2"/>
      <text x="20" y="48" fill="#666" font-size="7" text-anchor="middle">ロフト</text>
      <text x="20" y="138" fill="#666" font-size="7" text-anchor="middle">1F</text>
      <line x1="40" y1="200" x2="280" y2="200" stroke="#444" stroke-width="1"/>
      <text x="160" y="214" fill="#555" font-size="8" text-anchor="middle">3,500 mm（4,000mm高）</text>
      <text x="20" y="14" fill="#50b8d0" font-size="8" font-weight="bold">POD — 南立面（平屋+ロフト・準防火対応）</text>
    </svg>`,
  },

  // ===== STACK (75m²) =====
  {
    id: "stack",
    name: "STACK",
    label: "75m²",
    area: 75,
    dims: "W 5,000 × D 9,000 mm（2階建て）",
    weeks: 28,
    tag: "都市標準・夫婦+1子",
    tagColor: "#a070d0",
    desc: "75m²は都市の標準住宅サイズ。土地30坪に建ぺい率60%で2階建てを建てると、まさにこのサイズに収束する。1F LDK+水回り+和室、2F 主寝室+子供部屋+書斎+バルコニー。SIPs+ALC耐火被覆で準防火地域対応、ZEH仕様で光熱費年¥3万以下。共働き夫婦+1子の30〜40代世代の現実的なゴール。",
    totalMat: 30000000,
    subsidyMax: 4250000,
    coldClimateUpgrade: 1500000,
    rentPerNight: 30000,
    color: "#a070d0",
    img: "/img/urban/stack_ext.jpg",
    lifeImgs: [
      {src:"/img/urban/stack_ext.jpg", cap:"南面ファサード(夕景・住宅街)"},
      {src:"/img/urban/stack_int.jpg", cap:"1F LDK 30m²(家族3人)"},
    ],
    specs: [
      {k:"延床面積", v:"75 m²（22.7坪）1F: 40m² / 2F: 35m²"},
      {k:"外形寸法", v:"W 5,000 × D 9,000 × H 7,500 mm（2階建て）"},
      {k:"間取り", v:"1F LDK 30m²+和室+UB+トイレ+洗面 / 2F 主寝室+子供部屋+書斎+バルコニー"},
      {k:"天井高", v:"1F 2,600mm / 2F 2,400mm"},
      {k:"構造", v:"SIPs+ALC30mm耐火被覆 木造2階建て（準防火地域対応）"},
      {k:"断熱性能", v:"UA値 0.46 W/m²K（HEAT20 G1 / ZEH対応）"},
      {k:"暖房", v:"全館空調（ヒートポンプ+ダクト）or エアコン3台+床暖"},
      {k:"電力", v:"系統連系（オプションで太陽光5kW追加可）"},
      {k:"運営許可", v:"住宅 / 民泊届出可（住居専用地域不可）"},
      {k:"建築確認", v:"必須（建築士設計・四号特例）"},
    ],
    materials: [
      {cat:"SIPs+ALC耐火被覆",emoji:"🏗️",total:7500000,color:"#a070d0",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 160mm",qty:"150 m²",unit:"¥11,000/m²",total:1650000,note:"1F+2F全周"},
         {name:"SIPsパネル 屋根用 200mm",qty:"45 m²",unit:"¥14,000/m²",total:630000,note:""},
         {name:"ALC 30mm 耐火被覆パネル",qty:"150 m²",unit:"¥6,500/m²",total:975000,note:"準防火地域認定"},
         {name:"耐火サイディング+ジョイント金物一式",qty:"一式",unit:"¥4,245,000",total:4245000,note:"準防火30分認定セット"},
       ]},
      {cat:"構造材（プレカット 2階建て）",emoji:"📐",total:2200000,color:"#b07850",
       items:[
         {name:"KD杉 120×120 柱材",qty:"32本",unit:"¥1,500/本",total:48000,note:""},
         {name:"KD杉 105×360 大梁",qty:"16本",unit:"¥6,000/本",total:96000,note:"スパン4m対応"},
         {name:"2F床梁・根太・廊下材",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥456,000",total:456000,note:""},
         {name:"構造用合板 28mm",qty:"60枚",unit:"¥4,200/枚",total:252000,note:""},
         {name:"大引・束・土台一式",qty:"一式",unit:"¥998,000",total:998000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:3800000,color:"#4ab8d0",
       items:[
         {name:"南面LDK大開口 W4000×H2400(引違い)",qty:"1枚",unit:"¥780,000",total:780000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170",qty:"12枚",unit:"¥38,000/枚",total:456000,note:"2F+水回り"},
         {name:"玄関ドア 高断熱（K2)",qty:"1枚",unit:"¥220,000",total:220000,note:""},
         {name:"バルコニー引違い戸",qty:"2枚",unit:"¥180,000/枚",total:360000,note:""},
         {name:"勝手口・浴室窓",qty:"3枚",unit:"¥85,000/枚",total:255000,note:""},
         {name:"網戸・シャッター・電動ブラインド一式",qty:"一式",unit:"¥1,729,000",total:1729000,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:5500000,color:"#a07850",
       items:[
         {name:"杉羽目板 15mm",qty:"180 m²",unit:"¥2,800/m²",total:504000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"75 m²",unit:"¥5,000/m²",total:375000,note:""},
         {name:"システムキッチン W2700+食洗機+IH",qty:"1式",unit:"¥800,000",total:800000,note:"クリナップ等"},
         {name:"システムバス 1620（樹脂浴槽）",qty:"1基",unit:"¥520,000",total:520000,note:""},
         {name:"洗面化粧台 W900",qty:"2基",unit:"¥130,000/基",total:260000,note:"1F+2F"},
         {name:"トイレ温水洗浄便座",qty:"2基",unit:"¥85,000/基",total:170000,note:""},
         {name:"漆喰塗装 + 階段+造作棚一式",qty:"一式",unit:"¥1,500,000",total:1500000,note:""},
         {name:"和室畳・襖・障子",qty:"一式",unit:"¥420,000",total:420000,note:"1F和室6畳"},
         {name:"建具・室内ドア×8",qty:"8枚",unit:"¥119,000/枚",total:951000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:1800000,color:"#50b8a0",
       items:[
         {name:"上下水道引込工事",qty:"一式",unit:"¥350,000",total:350000,note:"道路から敷地内"},
         {name:"配管材一式",qty:"一式",unit:"¥600,000",total:600000,note:"2階建て立管含む"},
         {name:"給湯器 エコキュート 460L",qty:"1基",unit:"¥420,000",total:420000,note:"4人家族対応"},
         {name:"雨水タンク 200L+雨樋一式",qty:"1式",unit:"¥80,000",total:80000,note:""},
         {name:"その他衛生器具一式",qty:"一式",unit:"¥350,000",total:350000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:1500000,color:"#888",
       items:[
         {name:"ガルバリウム波板 黒",qty:"160 m²",unit:"¥1,350/m²",total:216000,note:""},
         {name:"杉板水平張り（西面アクセント）",qty:"22 m²",unit:"¥4,800/m²",total:106000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥620,000",total:620000,note:""},
         {name:"バルコニー防水・手すり",qty:"一式",unit:"¥358,000",total:358000,note:""},
         {name:"軒・水切り金物一式",qty:"一式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"暖房・空調",emoji:"❄️",total:1400000,color:"#4ab8d0",
       items:[
         {name:"全館空調（ヒートポンプ式・ダクト）",qty:"1式",unit:"¥850,000",total:850000,note:"ZEH対応"},
         {name:"床暖房 LDK 20m²（電気式）",qty:"1式",unit:"¥320,000",total:320000,note:""},
         {name:"24時間第一種熱交換換気",qty:"1式",unit:"¥230,000",total:230000,note:"ZEH要件"},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:800000,color:"#7080e0",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"40 m²",unit:"¥1,200/m²",total:48000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥300,000",total:300000,note:""},
         {name:"断熱補強・気流止め一式",qty:"一式",unit:"¥452,000",total:452000,note:""},
       ]},
      {cat:"基礎（べた基礎）",emoji:"⚓",total:1400000,color:"#606060",
       items:[
         {name:"生コン 凍結深度300mm",qty:"8 m³",unit:"¥18,000/m³",total:144000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥720,000",total:720000,note:"べた基礎40m²+耐震金物"},
         {name:"地業（砕石・防湿シート）+地盤調査",qty:"一式",unit:"¥536,000",total:536000,note:""},
       ]},
      {cat:"設計監理+確認申請",emoji:"📋",total:1800000,color:"#c06080",
       items:[
         {name:"建築確認申請",qty:"一式",unit:"¥350,000",total:350000,note:"四号建築物"},
         {name:"設計図一式（意匠+構造+設備）",qty:"一式",unit:"¥900,000",total:900000,note:"建築士設計"},
         {name:"完了検査・引き渡し書類一式",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"瑕疵担保責任保険",qty:"一式",unit:"¥150,000",total:150000,note:"住宅10年"},
         {name:"BELS評価+ZEH申請",qty:"一式",unit:"¥150,000",total:150000,note:"補助金申請用"},
       ]},
      {cat:"附帯工事・搬入",emoji:"🚚",total:2300000,color:"#607080",
       items:[
         {name:"電気引込60A+分電盤+配線+照明一式",qty:"一式",unit:"¥720,000",total:720000,note:""},
         {name:"都市ガス引込",qty:"一式",unit:"¥200,000",total:200000,note:""},
         {name:"通信(光ファイバー)+TV配線",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"足場(全周3層)",qty:"一式",unit:"¥350,000",total:350000,note:"2階建て"},
         {name:"建具金物・防蟻処理",qty:"一式",unit:"¥360,000",total:360000,note:""},
         {name:"運搬費(都内)",qty:"一式",unit:"¥250,000",total:250000,note:"10tトラック2便"},
         {name:"その他諸経費・廃材処分",qty:"一式",unit:"¥300,000",total:300000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"設計確認・地盤調査",icon:"📋",cost:0,diff:"★★☆☆☆",people:"設計士1人",
       desc:"建築確認申請を出す。地盤調査でSWS試験を実施。", tools:["SWS試験機"],tips:"地盤改良が必要なら+¥80万。改良不要なら大ラッキー。"},
      {week:"W2〜4",phase:"基礎工事（べた基礎）",icon:"⚓",cost:1400000,diff:"★★★☆☆",people:"4〜5人",
       desc:"40m²のべた基礎+耐震金物アンカー。コンクリート養生1週間。", tools:["ミニユンボ","型枠","鉄筋"],tips:"耐震等級3を狙うならアンカー位置をmm単位で確認。"},
      {week:"W5〜7",phase:"1F土台・骨組",icon:"🪵",cost:2200000,diff:"★★★☆☆",people:"4〜5人",
       desc:"プレカット材を組む。1階の柱・梁・床。", tools:["インパクト","丸ノコ","レベル"],tips:""},
      {week:"W8〜10",phase:"棟上げ・2F骨組・小屋組",icon:"🏗️",cost:0,diff:"★★★★☆",people:"6〜8人（2日）",
       desc:"棟上げ2日。プロ大工2〜3人を入れる（¥10万）。クレーン半日（¥5万）。", tools:["インパクト","クレーン","安全帯"],tips:"棟上げの祝詞は今でも入れることが多い。"},
      {week:"W11〜18",phase:"SIPs+ALC耐火被覆取付",icon:"🔷",cost:7500000,diff:"★★★★☆",people:"4〜6人",
       desc:"150m²の壁パネル+45m²の屋根パネル+ALC耐火被覆。8週間。準防火地域納まりに注意。", tools:["インパクト","コーキングガン","足場"],tips:"ALC耐火被覆は防火優先で気密はテープで補う。"},
      {week:"W19〜20",phase:"屋根・外装",icon:"🖤",cost:1500000,diff:"★★★☆☆",people:"3〜4人",
       desc:"ガルバ160m²+杉板アクセント+バルコニー防水。", tools:["丸ノコ","タッカー","コーキング"],tips:"バルコニー防水は重要。漏水で構造体が腐る。"},
      {week:"W21〜22",phase:"窓・断熱・気密",icon:"🪟",cost:4600000,diff:"★★★★☆",people:"3〜4人",
       desc:"LDK大開口W4m+樹脂窓12枚+玄関+バルコニー戸を取付。気密測定でC値0.7目標。", tools:["気密テープ","気密測定機"],tips:"LDK大開口は3人がかり。動線確保。"},
      {week:"W23〜25",phase:"設備工事（電気・配管・空調）",icon:"⚡",cost:3600000,diff:"★★★★☆",people:"4〜5人",
       desc:"全館空調ダクト+床暖+電気引込+ガス+水道+給湯+UB+キッチン+トイレ。", tools:["ダクト工具","配管工具","配線工具"],tips:"全館空調は業者依頼推奨（¥30万）。"},
      {week:"W26〜27",phase:"内装・什器",icon:"🪵",cost:5500000,diff:"★★★☆☆",people:"4〜6人",
       desc:"杉羽目板180m²+フローリング75m²+システムキッチン+UB+和室畳+建具8枚+漆喰塗装。", tools:["フィニッシュネイラー","左官鏝"],tips:"漆喰は3回塗りで仕上がる。和室は建具屋に依頼。"},
      {week:"W28",phase:"検査・引き渡し",icon:"✨",cost:4100000,diff:"★★☆☆☆",people:"3人",
       desc:"建築完了検査+気密測定+BELS評価+ZEH申請+瑕疵保険加入+引き渡し書類。", tools:["気密測定機"],tips:"ZEH補助金は完了後申請。書類完璧に。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修+部分外注",cost:34000000,color:"#a070d0",hi:true},
      {name:"補助金後（こどもエコ+ZEH+都市）",cost:29750000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:55000000,color:"#555"},
      {name:"賃貸収益（年）",cost:-3600000,color:"#a070d0",note:"¥30万/月想定"},
    ],
    floorSvg: `<svg viewBox="0 0 360 320" style="width:100%;background:#050505;display:block">
      <rect x="20" y="40" width="320" height="240" fill="none" stroke="#a070d0" stroke-width="3"/>
      <line x1="20" y1="160" x2="340" y2="160" stroke="#555" stroke-width="1.5"/>
      <line x1="200" y1="160" x2="200" y2="280" stroke="#555" stroke-width="1.5"/>
      <line x1="260" y1="40" x2="260" y2="160" stroke="#555" stroke-width="1.5"/>
      <rect x="200" y="170" width="140" height="60" fill="rgba(70,184,208,.06)" stroke="#50b8a0" stroke-width="1.5"/>
      <text x="270" y="200" fill="#50b8a0" font-size="9" text-anchor="middle">UB+洗面+WC</text>
      <text x="270" y="215" fill="#666" font-size="7.5" text-anchor="middle">水回り集約</text>
      <rect x="200" y="230" width="140" height="50" fill="rgba(160,120,80,.08)" stroke="#a07850" stroke-width="1.5"/>
      <text x="270" y="255" fill="#a07850" font-size="9" text-anchor="middle">和室6畳</text>
      <rect x="20" y="170" width="180" height="110" fill="rgba(160,112,208,.04)"/>
      <text x="110" y="220" fill="#ddd" font-size="13" text-anchor="middle">LDK</text>
      <text x="110" y="238" fill="#666" font-size="9" text-anchor="middle">30 m²（大開口W4m）</text>
      <rect x="260" y="50" width="80" height="100" fill="rgba(160,112,208,.04)" stroke="#a070d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="300" y="100" fill="#666" font-size="8" text-anchor="middle">玄関</text>
      <text x="300" y="115" fill="#666" font-size="7.5" text-anchor="middle">+ 階段</text>
      <rect x="20" y="50" width="240" height="100" fill="rgba(70,184,208,.04)"/>
      <text x="140" y="100" fill="#ddd" font-size="11" text-anchor="middle">LDK 大開口 W4m × H2.4m</text>
      <line x1="20" y1="40" x2="260" y2="40" stroke="#4ab8d0" stroke-width="6" opacity=".7"/>
      <text x="20" y="32" fill="#a070d0" font-size="9" font-weight="bold">STACK 1F — 40m²（2F: 主寝室+子供部屋+書斎+バルコニー 35m²）</text>
      <line x1="20" y1="295" x2="340" y2="295" stroke="#333" stroke-width="1"/>
      <text x="20" y="307" fill="#666" font-size="7.5">5,000 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 400 280" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="240" x2="390" y2="240" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="40" y="130" width="320" height="110" fill="rgba(28,30,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="40" y="50" width="320" height="80" fill="rgba(32,34,38,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="30,50 200,18 370,50" fill="rgba(26,26,26,.98)" stroke="#a070d0" stroke-width="2"/>
      <rect x="60" y="160" width="200" height="76" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="160" y1="160" x2="160" y2="236" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="160" y="202" fill="#4ab8d0" font-size="8" text-anchor="middle">LDK大開口 W4m×H2.4m</text>
      <rect x="280" y="170" width="36" height="64" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <text x="298" y="204" fill="#888" font-size="7" text-anchor="middle">玄関</text>
      <g fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5">
        <rect x="60" y="64" width="44" height="60"/>
        <rect x="120" y="64" width="44" height="60"/>
        <rect x="180" y="64" width="44" height="60"/>
        <rect x="240" y="64" width="44" height="60"/>
        <rect x="300" y="64" width="44" height="60"/>
      </g>
      <line x1="40" y1="130" x2="360" y2="130" stroke="#888" stroke-width="2"/>
      <rect x="40" y="124" width="100" height="14" fill="rgba(160,120,80,.2)" stroke="#a07850" stroke-width="1.5"/>
      <text x="90" y="135" fill="#a07850" font-size="6.5" text-anchor="middle">2Fバルコニー</text>
      <text x="20" y="178" fill="#666" font-size="7" text-anchor="middle">1F</text>
      <text x="20" y="92" fill="#666" font-size="7" text-anchor="middle">2F</text>
      <line x1="40" y1="252" x2="360" y2="252" stroke="#444" stroke-width="1"/>
      <text x="200" y="266" fill="#555" font-size="8.5" text-anchor="middle">5,000 mm（7,500mm高・2階建て）</text>
      <text x="20" y="14" fill="#a070d0" font-size="9" font-weight="bold">STACK — 南立面（2階建て・準防火対応・ZEH）</text>
    </svg>`,
  },

  // ===== TOWER (130m²) =====
  {
    id: "tower",
    name: "TOWER",
    label: "130m²",
    area: 130,
    dims: "W 5,000 × D 10,000 mm（3階建て+ピロティ+屋上）",
    weeks: 45,
    tag: "狭小地・3階建て・二世帯/賃貸併用",
    tagColor: "#d04060",
    desc: "都市の狭小地(土地15坪〜)を縦に最大化する3階建て+ピロティ駐車場+屋上テラス。1Fピロティ+1Kサブユニット(賃貸用)、2F LDK+書斎、3F寝室3+主寝室バルコニー、屋上40m²。木造耐火認定構造で防火地域対応。賃貸併用なら家賃収入が住宅ローンの50%を相殺する。「家を建てて住みながら稼ぐ」モデル。",
    totalMat: 55000000,
    subsidyMax: 5200000,
    coldClimateUpgrade: 2500000,
    rentPerNight: 60000,
    color: "#d04060",
    img: "/img/urban/tower_ext.jpg",
    lifeImgs: [
      {src:"/img/urban/tower_ext.jpg", cap:"南面ファサード(夕景・3階建て)"},
      {src:"/img/urban/tower_int.jpg", cap:"屋上テラス(40m²・東京の朝)"},
    ],
    specs: [
      {k:"延床面積", v:"130 m²（39.3坪）1F: 25m²(ピロティ+1K) / 2F: 45m²(LDK) / 3F: 45m²(寝室) + 屋上 40m²"},
      {k:"外形寸法", v:"W 5,000 × D 10,000 × H 10,000 mm（3階建て）"},
      {k:"間取り", v:"1F ピロティ駐車場+玄関+1Kサブ(賃貸/離れ・15m²) / 2F LDK 30m²+書斎+水回り / 3F 寝室×3+主寝室バルコニー / 屋上 40m²"},
      {k:"天井高", v:"1F 2,400mm / 2F 2,700mm / 3F 2,400mm"},
      {k:"構造", v:"SIPs+木造耐火認定構造 3階建て（防火地域対応・1時間耐火）"},
      {k:"断熱性能", v:"UA値 0.46 W/m²K（HEAT20 G1+ / ZEH+対応）"},
      {k:"暖房", v:"全館空調（ヒートポンプ+ダクト）+ 床暖（LDK）"},
      {k:"電力", v:"系統連系 + 太陽光5kW+蓄電池10kWh（標準装備）"},
      {k:"運営許可", v:"住宅 / 1Kサブ部分は賃貸住宅届出"},
      {k:"建築確認", v:"必須（建築士設計・構造計算・耐火認定材使用）"},
    ],
    materials: [
      {cat:"SIPs+木造耐火認定構造",emoji:"🏗️",total:13000000,color:"#d04060",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 2枚積み 160mm",qty:"280 m²",unit:"¥11,000/m²",total:3080000,note:"3階建て全周"},
         {name:"SIPsパネル 屋根用 200mm",qty:"45 m²",unit:"¥14,000/m²",total:630000,note:""},
         {name:"耐火認定パネル（1時間耐火）",qty:"280 m²",unit:"¥18,000/m²",total:5040000,note:"大臣認定材"},
         {name:"耐火サイディング+ジョイント金物一式",qty:"一式",unit:"¥4,250,000",total:4250000,note:"防火地域認定セット"},
       ]},
      {cat:"構造材（プレカット 3階建て）",emoji:"📐",total:4500000,color:"#b07850",
       items:[
         {name:"KD杉 120×120 柱材",qty:"60本",unit:"¥1,500/本",total:90000,note:""},
         {name:"米松集成材 大梁 105×360",qty:"32本",unit:"¥6,000/本",total:192000,note:"3階建て大スパン"},
         {name:"2F-3F床梁・根太・廊下材",qty:"一式",unit:"¥850,000",total:850000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥756,000",total:756000,note:""},
         {name:"構造用合板 28mm",qty:"110枚",unit:"¥4,200/枚",total:462000,note:""},
         {name:"大引・束・土台・耐震金物一式",qty:"一式",unit:"¥2,150,000",total:2150000,note:"耐震等級3"},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:5500000,color:"#4ab8d0",
       items:[
         {name:"2F LDK大開口 W4000×H2700",qty:"1枚",unit:"¥920,000",total:920000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170",qty:"20枚",unit:"¥38,000/枚",total:760000,note:""},
         {name:"玄関ドア 高断熱（K2)",qty:"1枚",unit:"¥250,000",total:250000,note:""},
         {name:"バルコニー引違い戸",qty:"3枚",unit:"¥180,000/枚",total:540000,note:""},
         {name:"屋上アクセス天窓+階段室窓",qty:"3枚",unit:"¥168,000/枚",total:504000,note:""},
         {name:"勝手口・浴室窓・1Kサブ窓",qty:"6枚",unit:"¥85,000/枚",total:510000,note:""},
         {name:"網戸・シャッター・電動ブラインド一式",qty:"一式",unit:"¥2,016,000",total:2016000,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:9500000,color:"#a07850",
       items:[
         {name:"杉羽目板 15mm",qty:"320 m²",unit:"¥2,800/m²",total:896000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"130 m²",unit:"¥5,000/m²",total:650000,note:""},
         {name:"システムキッチン W2700+食洗機+IH（メイン）",qty:"1式",unit:"¥850,000",total:850000,note:""},
         {name:"ミニキッチン（1Kサブユニット）",qty:"1式",unit:"¥320,000",total:320000,note:""},
         {name:"システムバス 1620（メイン）",qty:"1基",unit:"¥520,000",total:520000,note:""},
         {name:"システムバス 1216（1Kサブ）",qty:"1基",unit:"¥320,000",total:320000,note:""},
         {name:"洗面化粧台",qty:"3基",unit:"¥130,000/基",total:390000,note:"2F+3F+1Kサブ"},
         {name:"トイレ温水洗浄便座",qty:"3基",unit:"¥85,000/基",total:255000,note:""},
         {name:"漆喰塗装 + 階段3層+造作棚一式",qty:"一式",unit:"¥3,049,000",total:3049000,note:""},
         {name:"建具・室内ドア×16",qty:"16枚",unit:"¥119,000/枚",total:1904000,note:""},
         {name:"屋上テラス内装（防水フローリング+造作）",qty:"一式",unit:"¥346,000",total:346000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:3200000,color:"#50b8a0",
       items:[
         {name:"上下水道引込工事",qty:"一式",unit:"¥420,000",total:420000,note:"3階建て立管"},
         {name:"配管材一式（3階建て）",qty:"一式",unit:"¥1,200,000",total:1200000,note:""},
         {name:"給湯器 エコキュート 460L（メイン）",qty:"1基",unit:"¥420,000",total:420000,note:""},
         {name:"給湯器 エコジョーズ（1Kサブ）",qty:"1基",unit:"¥220,000",total:220000,note:""},
         {name:"屋上防水（ウレタン2層）",qty:"40 m²",unit:"¥9,500/m²",total:380000,note:"屋上テラス"},
         {name:"その他衛生器具一式",qty:"一式",unit:"¥560,000",total:560000,note:""},
       ]},
      {cat:"外装+屋上防水",emoji:"🖤",total:3000000,color:"#888",
       items:[
         {name:"ガルバリウム波板 黒",qty:"300 m²",unit:"¥1,350/m²",total:405000,note:""},
         {name:"杉板格子（南面アクセント）",qty:"40 m²",unit:"¥4,800/m²",total:192000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥820,000",total:820000,note:""},
         {name:"屋上テラス用 ipe+杉ウッドデッキ材",qty:"40 m²",unit:"¥4,500/m²",total:180000,note:""},
         {name:"屋上手すり・植栽プランター",qty:"一式",unit:"¥780,000",total:780000,note:""},
         {name:"バルコニー防水・手すり×3",qty:"3式",unit:"¥150,000/式",total:450000,note:""},
         {name:"軒・水切り金物一式",qty:"一式",unit:"¥173,000",total:173000,note:""},
       ]},
      {cat:"暖房・空調",emoji:"❄️",total:3000000,color:"#4ab8d0",
       items:[
         {name:"全館空調（ヒートポンプ式・3階ダクト）",qty:"1式",unit:"¥1,500,000",total:1500000,note:"ZEH+対応"},
         {name:"床暖房 LDK 25m²（電気式）",qty:"1式",unit:"¥400,000",total:400000,note:""},
         {name:"24時間第一種熱交換換気×2系統",qty:"1式",unit:"¥460,000",total:460000,note:"3階建てZEH+要件"},
         {name:"太陽光5kW+蓄電池10kWh一式",qty:"1式",unit:"¥640,000",total:640000,note:"系統連系・標準装備"},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:1500000,color:"#7080e0",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"50 m²",unit:"¥1,200/m²",total:60000,note:""},
         {name:"気密テープ + 先張りシート（3階建て）",qty:"一式",unit:"¥600,000",total:600000,note:""},
         {name:"断熱補強・気流止め一式",qty:"一式",unit:"¥840,000",total:840000,note:""},
       ]},
      {cat:"基礎+地盤改良",emoji:"⚓",total:3500000,color:"#606060",
       items:[
         {name:"地盤改良（柱状改良・狭小地用）",qty:"一式",unit:"¥1,200,000",total:1200000,note:"3階建ては改良ほぼ必須"},
         {name:"生コン 凍結深度300mm",qty:"10 m³",unit:"¥18,000/m³",total:180000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥1,400,000",total:1400000,note:"べた基礎45m²+耐震金物"},
         {name:"地業（砕石・防湿シート）+地盤調査",qty:"一式",unit:"¥720,000",total:720000,note:""},
       ]},
      {cat:"設計監理+確認申請+構造計算",emoji:"📋",total:3500000,color:"#c06080",
       items:[
         {name:"建築確認申請（3階建て・耐火認定）",qty:"一式",unit:"¥600,000",total:600000,note:""},
         {name:"設計図一式（意匠+構造+設備+設計監理）",qty:"一式",unit:"¥1,800,000",total:1800000,note:"建築士+構造設計士"},
         {name:"構造計算（許容応力度計算）",qty:"一式",unit:"¥350,000",total:350000,note:"3階建て必須"},
         {name:"完了検査・引き渡し書類一式",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"瑕疵担保責任保険+ZEH+申請",qty:"一式",unit:"¥400,000",total:400000,note:""},
       ]},
      {cat:"附帯工事+ピロティ+屋上テラス",emoji:"🚚",total:4800000,color:"#607080",
       items:[
         {name:"電気引込60A+分電盤+配線+照明一式",qty:"一式",unit:"¥1,200,000",total:1200000,note:""},
         {name:"都市ガス引込（メイン+1Kサブ）",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"通信(光ファイバー)+TV配線+スマートホーム配線",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"足場(全周3層・3階建て)",qty:"一式",unit:"¥600,000",total:600000,note:""},
         {name:"建具金物・防蟻処理",qty:"一式",unit:"¥520,000",total:520000,note:""},
         {name:"運搬費(都内)",qty:"一式",unit:"¥400,000",total:400000,note:"10tトラック3便"},
         {name:"ピロティ駐車場仕上げ+外灯",qty:"一式",unit:"¥480,000",total:480000,note:""},
         {name:"外構（境界壁+門柱+敷地内通路）",qty:"一式",unit:"¥600,000",total:600000,note:""},
         {name:"その他諸経費・廃材処分",qty:"一式",unit:"¥400,000",total:400000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜2",phase:"設計確認・地盤調査",icon:"📋",cost:0,diff:"★★★☆☆",people:"設計士+構造設計士",
       desc:"建築確認申請（3階建て・耐火認定）+構造計算+ボーリング調査。狭小地は近隣調整が必須。", tools:["SWS試験機","ボーリング機"],tips:"3階建ては地盤改良ほぼ必須。柱状改良¥120万計算しておく。"},
      {week:"W3〜7",phase:"基礎・地盤改良",icon:"⚓",cost:3500000,diff:"★★★★☆",people:"5〜6人",
       desc:"柱状改良+べた基礎45m²。3階建ての荷重に耐える耐震金物。コンクリート養生2週間。", tools:["地盤改良機","ミニユンボ","型枠","鉄筋"],tips:"耐震等級3+耐火認定で構造体は鉄壁になる。"},
      {week:"W8〜12",phase:"1F-3F土台・骨組",icon:"🪵",cost:4500000,diff:"★★★★☆",people:"5〜6人",
       desc:"プレカット材で1F〜3Fまで5週間で組む。階段ホール・ピロティ・耐震金物の精度が肝。", tools:["インパクト","丸ノコ","レベル","クレーン"],tips:"3階建ては垂直精度が命。レベル+下げ振りを毎日確認。"},
      {week:"W13〜15",phase:"棟上げ・小屋組・屋上スラブ",icon:"🏗️",cost:0,diff:"★★★★★",people:"8〜10人（3日）",
       desc:"棟上げ3日。プロ大工4〜5人を入れる（¥30万）。クレーン1日（¥10万）。3階+屋上スラブまで一気に。", tools:["クレーン","インパクト","安全帯","足場"],tips:"3階建て棟上げは命がけ。安全帯+ヘルメット完璧に。"},
      {week:"W16〜30",phase:"SIPs+耐火認定構造取付",icon:"🔷",cost:13000000,diff:"★★★★☆",people:"6〜8人",
       desc:"280m²の壁パネル+45m²の屋根パネル+1時間耐火認定材。15週間。防火地域納まりは法的に厳格。", tools:["インパクト","コーキングガン","足場（3層）"],tips:"防火地域は耐火認定材を使わないと違反。設計図通りに。"},
      {week:"W31〜33",phase:"屋根・外装+屋上防水",icon:"🖤",cost:3000000,diff:"★★★★☆",people:"4〜5人",
       desc:"ガルバ300m²+杉板格子+屋上ウレタン防水40m²+ipeデッキ+バルコニー防水×3。", tools:["丸ノコ","防水機材","コーキング"],tips:"屋上防水は専門業者依頼推奨（¥40万）。漏水で全部腐る。"},
      {week:"W34〜35",phase:"窓・断熱・気密",icon:"🪟",cost:7000000,diff:"★★★★☆",people:"3〜4人",
       desc:"LDK大開口W4m+樹脂窓20枚+玄関+バルコニー戸×3+屋上天窓を取付。気密測定でC値0.5目標。", tools:["気密テープ","気密測定機"],tips:"3階建ては気密が落ちやすい。1階階ごとに測定。"},
      {week:"W36〜39",phase:"設備工事（電気・配管・空調・太陽光）",icon:"⚡",cost:6200000,diff:"★★★★★",people:"5〜6人",
       desc:"全館空調ダクト3階+床暖+電気引込+ガス×2+水道+給湯×2+UB×2+キッチン×2+トイレ×3+太陽光5kW+蓄電池+スマートホーム配線。", tools:["ダクト工具","配管工具","配線工具","電気計測"],tips:"設備は全部業者依頼で¥80万追加が現実的。"},
      {week:"W40〜43",phase:"内装・什器・ピロティ",icon:"🪵",cost:9500000,diff:"★★★★☆",people:"5〜7人",
       desc:"杉羽目板320m²+フローリング130m²+システムキッチン+UB×2+建具16枚+漆喰3層階段+造作棚+ピロティ仕上げ。", tools:["フィニッシュネイラー","左官鏝"],tips:"漆喰3階建て分は時間かかる。職人2人体制で。"},
      {week:"W44〜45",phase:"検査・引き渡し",icon:"✨",cost:8300000,diff:"★★★☆☆",people:"4人",
       desc:"建築完了検査（耐火認定+構造計算）+気密測定+BELS評価+ZEH+申請+瑕疵保険+引き渡し書類+1Kサブ部分賃貸申請。", tools:["気密測定機"],tips:"ZEH+補助金は完了後申請。書類完璧に。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修+施工チーム",cost:62000000,color:"#d04060",hi:true},
      {name:"補助金後（ZEH++三世代+都市）",cost:56800000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:110000000,color:"#555"},
      {name:"賃貸併用収益（年）",cost:-5400000,color:"#d04060",note:"1Kサブ¥10万/月+主棟¥35万/月想定"},
    ],
    floorSvg: `<svg viewBox="0 0 360 360" style="width:100%;background:#050505;display:block">
      <rect x="20" y="40" width="320" height="280" fill="none" stroke="#d04060" stroke-width="3"/>
      <line x1="20" y1="180" x2="340" y2="180" stroke="#888" stroke-width="2" stroke-dasharray="6,3"/>
      <text x="180" y="20" fill="#d04060" font-size="9" font-weight="bold" text-anchor="middle">TOWER 1F — 25m²(ピロティ+1Kサブ) / 2F LDK 45m² / 3F 寝室3 45m² / 屋上 40m²</text>
      <rect x="20" y="40" width="200" height="140" fill="rgba(80,80,80,.15)" stroke="#666" stroke-width="1.5" stroke-dasharray="4,3"/>
      <text x="120" y="100" fill="#888" font-size="11" text-anchor="middle">ピロティ駐車場</text>
      <text x="120" y="118" fill="#666" font-size="8" text-anchor="middle">1台分（W2.5m × D5m）</text>
      <rect x="220" y="40" width="120" height="140" fill="rgba(208,64,96,.06)" stroke="#d04060" stroke-width="1.5"/>
      <text x="280" y="100" fill="#d04060" font-size="10" text-anchor="middle">1Kサブユニット</text>
      <text x="280" y="116" fill="#666" font-size="8" text-anchor="middle">15m² · 賃貸/離れ</text>
      <text x="280" y="135" fill="#666" font-size="7.5" text-anchor="middle">ミニキッチン+UB+WC</text>
      <line x1="20" y1="180" x2="340" y2="180" stroke="#888" stroke-width="2"/>
      <text x="180" y="195" fill="#666" font-size="8" text-anchor="middle">↑ 1F（ピロティ + サブ）  /  2F-3F+屋上 ↓</text>
      <rect x="20" y="200" width="320" height="120" fill="rgba(208,64,96,.04)"/>
      <line x1="20" y1="270" x2="340" y2="270" stroke="#555" stroke-width="1"/>
      <text x="100" y="240" fill="#ddd" font-size="11" text-anchor="middle">2F LDK 30m²</text>
      <text x="100" y="255" fill="#666" font-size="8" text-anchor="middle">大開口W4m × H2.7m</text>
      <text x="240" y="240" fill="#ddd" font-size="11" text-anchor="middle">2F 書斎+水回り 15m²</text>
      <text x="100" y="295" fill="#ddd" font-size="11" text-anchor="middle">3F 寝室3+主寝室 35m²</text>
      <text x="240" y="295" fill="#ddd" font-size="11" text-anchor="middle">3F 水回り 10m²</text>
      <text x="100" y="312" fill="#666" font-size="8" text-anchor="middle">屋上テラス 40m²(階段アクセス)</text>
      <line x1="20" y1="335" x2="340" y2="335" stroke="#333" stroke-width="1"/>
      <text x="20" y="347" fill="#666" font-size="7.5">5,000 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 400 360" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="320" x2="390" y2="320" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="40" y="240" width="320" height="80" fill="rgba(20,20,22,.95)" stroke="#666" stroke-width="2"/>
      <rect x="40" y="160" width="320" height="80" fill="rgba(28,30,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="40" y="80" width="320" height="80" fill="rgba(32,34,38,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="30,80 200,46 370,80" fill="rgba(26,26,26,.98)" stroke="#d04060" stroke-width="2"/>
      <rect x="60" y="252" width="160" height="64" fill="rgba(80,80,80,.2)" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="140" y="288" fill="#888" font-size="8" text-anchor="middle">ピロティ駐車場</text>
      <rect x="240" y="252" width="100" height="64" fill="rgba(208,64,96,.1)" stroke="#d04060" stroke-width="1.5"/>
      <text x="290" y="284" fill="#d04060" font-size="8" text-anchor="middle">1Kサブ</text>
      <rect x="60" y="170" width="240" height="60" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="180" y1="170" x2="180" y2="230" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="180" y="206" fill="#4ab8d0" font-size="8" text-anchor="middle">2F LDK大開口 W4m×H2.7m</text>
      <g fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5">
        <rect x="60" y="92" width="44" height="60"/>
        <rect x="120" y="92" width="44" height="60"/>
        <rect x="180" y="92" width="44" height="60"/>
        <rect x="240" y="92" width="44" height="60"/>
        <rect x="300" y="92" width="44" height="60"/>
      </g>
      <line x1="40" y1="160" x2="360" y2="160" stroke="#888" stroke-width="2"/>
      <line x1="40" y1="240" x2="360" y2="240" stroke="#888" stroke-width="2"/>
      <rect x="40" y="74" width="320" height="10" fill="rgba(80,184,160,.2)" stroke="#50b8a0" stroke-width="1"/>
      <text x="200" y="83" fill="#50b8a0" font-size="6.5" text-anchor="middle">屋上テラス 40m²（ipeデッキ+植栽）</text>
      <rect x="40" y="148" width="100" height="14" fill="rgba(160,120,80,.2)" stroke="#a07850" stroke-width="1"/>
      <text x="90" y="159" fill="#a07850" font-size="6" text-anchor="middle">3Fバルコニー</text>
      <rect x="170" y="22" width="60" height="20" fill="rgba(208,64,96,.15)" rx="2"/>
      <text x="200" y="36" fill="#d04060" font-size="7" text-anchor="middle">太陽光5kW</text>
      <text x="20" y="284" fill="#666" font-size="7" text-anchor="middle">1F</text>
      <text x="20" y="200" fill="#666" font-size="7" text-anchor="middle">2F</text>
      <text x="20" y="120" fill="#666" font-size="7" text-anchor="middle">3F</text>
      <line x1="40" y1="332" x2="360" y2="332" stroke="#444" stroke-width="1"/>
      <text x="200" y="346" fill="#555" font-size="8.5" text-anchor="middle">5,000 mm（10,000mm高・3階建て）</text>
      <text x="20" y="14" fill="#d04060" font-size="9" font-weight="bold">TOWER — 南立面（3階建て+ピロティ+屋上・防火地域・ZEH+）</text>
    </svg>`,
  },
];

// アップグレードオプションも build-data.js から流用したいので空配列で初期化（実際は build-data.js をロードしないため必須）
window.BUILD_UPGRADES = [];
window.BUILD_COSTDOWNS = [];
