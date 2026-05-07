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
      {k:"耐震等級", v:"等級2 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
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
      {k:"耐震等級", v:"等級3 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
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
    desc: "【Phase 2 / 大臣認定取得後リリース予定】都市の狭小地(土地15坪〜)を縦に最大化する3階建て+ピロティ駐車場+屋上テラス。1Fピロティ+1Kサブユニット(賃貸用)、2F LDK+書斎、3F寝室3+主寝室バルコニー、屋上40m²。木造耐火認定構造で防火地域対応。賃貸併用なら家賃収入が住宅ローンの50%を相殺する。「家を建てて住みながら稼ぐ」モデル。",
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
      {k:"耐震等級", v:"等級3 想定（性能評価未取得・大臣認定取得後Phase 2リリース）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
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
  // ===== FLAT (95m²) =====
  {
    id: "flat",
    name: "FLAT",
    label: "95m²",
    area: 95,
    dims: "W 12,000 × D 8,000 mm（平屋）",
    weeks: 28,
    tag: "平屋ファミリー・郊外住宅",
    tagColor: "#50a880",
    desc: "95m²の平屋は、子育て世代(30〜40代+子1〜2人)の郊外住宅地(土地50〜70坪)に最適化されたボリュームゾーン。LDK 32m²+主寝室+子供部屋×2+書斎+UB+トイレ×2+WICがワンフロアで完結。階段なし=家事動線最短、子供の安全性最大、将来のバリアフリー化対応。大屋根+ハイサイドライトで平屋特有の天井の低さを克服。SIPs+ALC耐火被覆 木造平屋でZEH対応、太陽光5kWを標準装備して光熱費年¥0時代へ。",
    totalMat: 38000000,
    subsidyMax: 3150000,
    coldClimateUpgrade: 1800000,
    rentPerNight: 35000,
    color: "#50a880",
    img: "/img/urban/flat_ext.jpg",
    lifeImgs: [
      {src:"/img/urban/flat_ext.jpg", cap:"南面ファサード(夕景・郊外住宅地)"},
      {src:"/img/urban/flat_int.jpg", cap:"LDK 32m²(家族4人の暮らし)"},
    ],
    specs: [
      {k:"延床面積", v:"95 m²（28.7坪）平屋ワンフロア"},
      {k:"外形寸法", v:"W 12,000 × D 8,000 × H 4,800 mm（平屋・大屋根）"},
      {k:"間取り", v:"LDK 32m²+主寝室+子供部屋×2+書斎+WIC+UB+トイレ×2+洗面"},
      {k:"天井高", v:"LDK 3,400mm（勾配天井）/ 居室 2,500mm"},
      {k:"構造", v:"SIPs+ALC30mm耐火被覆 木造平屋（準防火地域対応）"},
      {k:"断熱性能", v:"UA値 0.46 W/m²K（HEAT20 G1+ / ZEH対応）"},
      {k:"暖房", v:"全館空調（ヒートポンプ+ダクト・平屋一括）+ 床暖（LDK）"},
      {k:"電力", v:"系統連系 + 太陽光5kW（標準装備）"},
      {k:"運営許可", v:"住宅 / 民泊届出可（住居専用地域不可）"},
      {k:"耐震等級", v:"等級3 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（建築士設計・四号特例）"},
    ],
    materials: [
      {cat:"SIPs+ALC耐火被覆",emoji:"🏗️",total:9500000,color:"#50a880",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 160mm",qty:"180 m²",unit:"¥11,000/m²",total:1980000,note:"平屋全周"},
         {name:"SIPsパネル 屋根用 200mm",qty:"110 m²",unit:"¥14,000/m²",total:1540000,note:"大屋根・登り梁"},
         {name:"ALC 30mm 耐火被覆パネル",qty:"180 m²",unit:"¥6,500/m²",total:1170000,note:"準防火地域認定"},
         {name:"耐火サイディング+ジョイント金物一式",qty:"一式",unit:"¥4,810,000",total:4810000,note:"準防火30分認定セット"},
       ]},
      {cat:"構造材（プレカット 平屋）",emoji:"📐",total:2500000,color:"#b07850",
       items:[
         {name:"KD杉 120×120 柱材",qty:"28本",unit:"¥1,500/本",total:42000,note:""},
         {name:"KD杉 105×360 大梁",qty:"14本",unit:"¥6,000/本",total:84000,note:""},
         {name:"平屋小屋組材一式（登り梁・桁・棟木）",qty:"一式",unit:"¥780,000",total:780000,note:"勾配天井対応"},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥544,000",total:544000,note:""},
         {name:"構造用合板 28mm",qty:"80枚",unit:"¥4,200/枚",total:336000,note:""},
         {name:"大引・束・土台一式",qty:"一式",unit:"¥714,000",total:714000,note:""},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:4500000,color:"#4ab8d0",
       items:[
         {name:"南面LDK大開口 W4500×H2400(引違い)",qty:"1枚",unit:"¥860,000",total:860000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170",qty:"14枚",unit:"¥38,000/枚",total:532000,note:"居室+水回り"},
         {name:"玄関ドア 高断熱（K2)",qty:"1枚",unit:"¥220,000",total:220000,note:""},
         {name:"勝手口・浴室窓",qty:"4枚",unit:"¥85,000/枚",total:340000,note:""},
         {name:"子供部屋FIX窓+書斎窓",qty:"3枚",unit:"¥120,000/枚",total:360000,note:""},
         {name:"高所窓（ハイサイドライト）",qty:"3枚",unit:"¥150,000/枚",total:450000,note:"勾配天井採光"},
         {name:"網戸・シャッター・電動ブラインド一式",qty:"一式",unit:"¥1,738,000",total:1738000,note:""},
       ]},
      {cat:"内装・仕上げ",emoji:"🪵",total:7000000,color:"#a07850",
       items:[
         {name:"杉羽目板 15mm",qty:"220 m²",unit:"¥2,800/m²",total:616000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"95 m²",unit:"¥5,000/m²",total:475000,note:""},
         {name:"システムキッチン W2700+食洗機+IH",qty:"1式",unit:"¥850,000",total:850000,note:"クリナップ等"},
         {name:"システムバス 1620（樹脂浴槽）",qty:"1基",unit:"¥520,000",total:520000,note:""},
         {name:"洗面化粧台 W900",qty:"2基",unit:"¥130,000/基",total:260000,note:"主+子供用"},
         {name:"トイレ温水洗浄便座",qty:"2基",unit:"¥85,000/基",total:170000,note:""},
         {name:"漆喰塗装+造作棚一式",qty:"一式",unit:"¥1,800,000",total:1800000,note:"勾配天井含む"},
         {name:"WIC（ウォークインクローゼット）造作",qty:"一式",unit:"¥320,000",total:320000,note:""},
         {name:"子供部屋×2 造作（学習デスク・棚）",qty:"一式",unit:"¥440,000",total:440000,note:""},
         {name:"建具・室内ドア×10",qty:"10枚",unit:"¥120,000/枚",total:1200000,note:""},
         {name:"玄関土間+収納",qty:"一式",unit:"¥349,000",total:349000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:2000000,color:"#50b8a0",
       items:[
         {name:"上下水道引込工事",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"配管材一式（平屋・水回り集約）",qty:"一式",unit:"¥500,000",total:500000,note:"立管不要で短い"},
         {name:"給湯器 エコキュート 460L",qty:"1基",unit:"¥420,000",total:420000,note:"4〜5人家族対応"},
         {name:"雨水タンク 200L+雨樋一式",qty:"1式",unit:"¥100,000",total:100000,note:"大屋根分"},
         {name:"その他衛生器具一式",qty:"一式",unit:"¥630,000",total:630000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:2000000,color:"#888",
       items:[
         {name:"ガルバリウム波板 黒",qty:"240 m²",unit:"¥1,350/m²",total:324000,note:"屋根+壁・大屋根分"},
         {name:"杉板水平張り（南面アクセント）",qty:"35 m²",unit:"¥4,800/m²",total:168000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥820,000",total:820000,note:""},
         {name:"軒・水切り金物一式",qty:"一式",unit:"¥350,000",total:350000,note:"平屋深い軒の出"},
         {name:"雨樋・水切り工事一式",qty:"一式",unit:"¥338,000",total:338000,note:""},
       ]},
      {cat:"暖房・空調",emoji:"❄️",total:2800000,color:"#4ab8d0",
       items:[
         {name:"全館空調（ヒートポンプ式・ダクト・平屋一括）",qty:"1式",unit:"¥1,100,000",total:1100000,note:"ZEH対応・平屋効率良"},
         {name:"床暖房 LDK 25m²（電気式）",qty:"1式",unit:"¥400,000",total:400000,note:""},
         {name:"24時間第一種熱交換換気",qty:"1式",unit:"¥260,000",total:260000,note:"ZEH要件"},
         {name:"太陽光5kW（パネル+パワコン）",qty:"1式",unit:"¥800,000",total:800000,note:"標準装備・大屋根に最適"},
         {name:"蓄電池7kWh準備配線（後付対応）",qty:"1式",unit:"¥240,000",total:240000,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:1000000,color:"#7080e0",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"95 m²",unit:"¥1,200/m²",total:114000,note:""},
         {name:"気密テープ + 先張りシート（平屋）",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"断熱補強・気流止め一式",qty:"一式",unit:"¥336,000",total:336000,note:""},
         {name:"屋根断熱 補強層（HEAT20 G1+対応）",qty:"一式",unit:"¥200,000",total:200000,note:"勾配天井断熱"},
       ]},
      {cat:"基礎（べた基礎）",emoji:"⚓",total:1800000,color:"#606060",
       items:[
         {name:"生コン 凍結深度300mm",qty:"16 m³",unit:"¥18,000/m³",total:288000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥850,000",total:850000,note:"べた基礎95m²+耐震金物"},
         {name:"地業（砕石・防湿シート）+地盤調査",qty:"一式",unit:"¥662,000",total:662000,note:""},
       ]},
      {cat:"設計監理+確認申請",emoji:"📋",total:1800000,color:"#c06080",
       items:[
         {name:"建築確認申請",qty:"一式",unit:"¥350,000",total:350000,note:"四号建築物・平屋"},
         {name:"設計図一式（意匠+構造+設備）",qty:"一式",unit:"¥900,000",total:900000,note:"建築士設計"},
         {name:"完了検査・引き渡し書類一式",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"瑕疵担保責任保険",qty:"一式",unit:"¥150,000",total:150000,note:"住宅10年"},
         {name:"BELS評価+ZEH申請",qty:"一式",unit:"¥150,000",total:150000,note:"補助金申請用"},
       ]},
      {cat:"附帯工事・搬入",emoji:"🚚",total:3100000,color:"#607080",
       items:[
         {name:"電気引込60A+分電盤+配線+照明一式",qty:"一式",unit:"¥780,000",total:780000,note:""},
         {name:"都市ガス引込",qty:"一式",unit:"¥200,000",total:200000,note:""},
         {name:"通信(光ファイバー)+TV配線",qty:"一式",unit:"¥120,000",total:120000,note:""},
         {name:"足場(全周1層・平屋)",qty:"一式",unit:"¥250,000",total:250000,note:"平屋なので低コスト"},
         {name:"建具金物・防蟻処理",qty:"一式",unit:"¥420,000",total:420000,note:""},
         {name:"運搬費(郊外)",qty:"一式",unit:"¥350,000",total:350000,note:"10tトラック2便"},
         {name:"外構（庭+駐車場2台分+門柱）",qty:"一式",unit:"¥780,000",total:780000,note:"郊外住宅の標準"},
         {name:"その他諸経費・廃材処分",qty:"一式",unit:"¥200,000",total:200000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"設計確認・地盤調査",icon:"📋",cost:0,diff:"★★☆☆☆",people:"設計士1人",
       desc:"建築確認申請を出す。地盤調査でSWS試験を実施。郊外は地盤に当たり外れがある。", tools:["SWS試験機"],tips:"郊外の田んぼ転用地は地盤改良ほぼ必須。+¥80万計算。"},
      {week:"W2〜4",phase:"基礎工事（べた基礎 95m²）",icon:"⚓",cost:1800000,diff:"★★★☆☆",people:"4〜5人",
       desc:"95m²のべた基礎+耐震金物アンカー。コンクリート養生1週間。平屋は基礎が広い。", tools:["ミニユンボ","型枠","鉄筋"],tips:"耐震等級3を狙うならアンカー位置をmm単位で確認。"},
      {week:"W5〜7",phase:"1F土台・骨組（平屋）",icon:"🪵",cost:2500000,diff:"★★★☆☆",people:"4〜5人",
       desc:"プレカット材を組む。平屋なので階段不要、シンプル構成。登り梁+桁+棟木で大屋根を準備。", tools:["インパクト","丸ノコ","レベル"],tips:"平屋は2階分の床梁不要で工程が約1週間短い。"},
      {week:"W8〜10",phase:"棟上げ・大屋根小屋組",icon:"🏗️",cost:0,diff:"★★★☆☆",people:"5〜7人（2日）",
       desc:"棟上げ2日。大屋根の登り梁を架けるのにクレーン半日（¥5万）。プロ大工2人推奨（¥10万）。", tools:["インパクト","クレーン","安全帯"],tips:"平屋大屋根は美しいシルエットの命。棟の通りを精度高く。"},
      {week:"W11〜18",phase:"SIPs+ALC耐火被覆取付",icon:"🔷",cost:9500000,diff:"★★★★☆",people:"4〜6人",
       desc:"180m²の壁パネル+110m²の屋根パネル+ALC耐火被覆。8週間。平屋は屋根が広いので屋根施工が長い。", tools:["インパクト","コーキングガン","足場"],tips:"大屋根SIPsは雨養生最重要。ブルーシート二重で。"},
      {week:"W19〜20",phase:"屋根・外装",icon:"🖤",cost:2000000,diff:"★★★☆☆",people:"3〜4人",
       desc:"ガルバ240m²+杉板アクセント+深い軒の出+雨樋。", tools:["丸ノコ","タッカー","コーキング"],tips:"平屋は軒の出が深い（900mm以上）と外観が決まる。"},
      {week:"W21〜22",phase:"窓・断熱・気密",icon:"🪟",cost:5500000,diff:"★★★★☆",people:"3〜4人",
       desc:"LDK大開口W4.5m+樹脂窓14枚+ハイサイドライト3枚+玄関+勝手口を取付。気密測定でC値0.5目標。", tools:["気密テープ","気密測定機"],tips:"ハイサイドライトは脚立で取付。安全帯必須。"},
      {week:"W23〜25",phase:"設備工事（電気・配管・空調・太陽光）",icon:"⚡",cost:3600000,diff:"★★★★☆",people:"4〜5人",
       desc:"全館空調ダクト+床暖+電気引込+ガス+水道+給湯+UB+キッチン+トイレ+太陽光5kW。", tools:["ダクト工具","配管工具","配線工具"],tips:"太陽光5kWは大屋根南面に最適配置。BELS評価向上。"},
      {week:"W26〜27",phase:"内装・什器",icon:"🪵",cost:7000000,diff:"★★★☆☆",people:"4〜6人",
       desc:"杉羽目板220m²+フローリング95m²+システムキッチン+UB+建具10枚+漆喰塗装+WIC造作+子供部屋造作。", tools:["フィニッシュネイラー","左官鏝"],tips:"勾配天井の漆喰は足場必要。1日多めに見ておく。"},
      {week:"W28",phase:"検査・引き渡し+外構",icon:"✨",cost:4900000,diff:"★★☆☆☆",people:"3〜4人",
       desc:"建築完了検査+気密測定+BELS評価+ZEH申請+瑕疵保険+引き渡し+外構工事（庭+駐車場+門柱）。", tools:["気密測定機"],tips:"ZEH補助金は完了後申請。BELS評価書は¥10万分の価値。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修+部分外注",cost:43000000,color:"#50a880",hi:true},
      {name:"補助金後（こどもエコ+ZEH+郊外移住）",cost:39850000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:70000000,color:"#555"},
      {name:"賃貸収益（年）",cost:-4200000,color:"#50a880",note:"¥35万/月想定"},
    ],
    floorSvg: `<svg viewBox="0 0 480 320" style="width:100%;background:#050505;display:block">
      <rect x="20" y="40" width="440" height="240" fill="none" stroke="#50a880" stroke-width="3"/>
      <line x1="20" y1="170" x2="460" y2="170" stroke="#555" stroke-width="1.5"/>
      <line x1="180" y1="40" x2="180" y2="170" stroke="#555" stroke-width="1.5"/>
      <line x1="320" y1="40" x2="320" y2="170" stroke="#555" stroke-width="1.5"/>
      <line x1="160" y1="170" x2="160" y2="280" stroke="#555" stroke-width="1.5"/>
      <line x1="280" y1="170" x2="280" y2="280" stroke="#555" stroke-width="1.5"/>
      <rect x="20" y="180" width="140" height="100" fill="rgba(80,168,128,.06)"/>
      <text x="90" y="225" fill="#ddd" font-size="12" text-anchor="middle">LDK</text>
      <text x="90" y="242" fill="#666" font-size="9" text-anchor="middle">32 m²（大開口W4.5m）</text>
      <text x="90" y="258" fill="#888" font-size="7.5" text-anchor="middle">勾配天井 H3.4m</text>
      <rect x="160" y="180" width="120" height="100" fill="rgba(70,184,160,.06)" stroke="#50b8a0" stroke-width="1.5"/>
      <text x="220" y="220" fill="#50b8a0" font-size="9" text-anchor="middle">UB+洗面+WC×2</text>
      <text x="220" y="236" fill="#666" font-size="7.5" text-anchor="middle">水回り集約 + WIC</text>
      <rect x="280" y="180" width="180" height="100" fill="rgba(160,120,80,.06)" stroke="#a07850" stroke-width="1.5"/>
      <text x="370" y="220" fill="#a07850" font-size="11" text-anchor="middle">主寝室+書斎</text>
      <text x="370" y="238" fill="#666" font-size="8" text-anchor="middle">15 m² + 5 m²</text>
      <rect x="20" y="50" width="160" height="120" fill="rgba(70,184,208,.04)"/>
      <text x="100" y="105" fill="#ddd" font-size="11" text-anchor="middle">玄関+土間</text>
      <text x="100" y="120" fill="#888" font-size="8" text-anchor="middle">家族の収納+ベンチ</text>
      <rect x="180" y="50" width="140" height="120" fill="rgba(160,120,80,.04)" stroke="#a07850" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="250" y="105" fill="#ddd" font-size="11" text-anchor="middle">子供部屋 ①</text>
      <text x="250" y="120" fill="#888" font-size="8" text-anchor="middle">8 m²</text>
      <rect x="320" y="50" width="140" height="120" fill="rgba(160,120,80,.04)" stroke="#a07850" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="390" y="105" fill="#ddd" font-size="11" text-anchor="middle">子供部屋 ②</text>
      <text x="390" y="120" fill="#888" font-size="8" text-anchor="middle">8 m²</text>
      <line x1="20" y1="280" x2="160" y2="280" stroke="#4ab8d0" stroke-width="6" opacity=".7"/>
      <text x="20" y="32" fill="#50a880" font-size="9" font-weight="bold">FLAT — 平屋ワンフロア 95m²（大屋根+ハイサイドライト+太陽光5kW）</text>
      <line x1="20" y1="295" x2="460" y2="295" stroke="#333" stroke-width="1"/>
      <text x="20" y="307" fill="#666" font-size="7.5">12,000 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 460 220" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="190" x2="450" y2="190" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="40" y="100" width="380" height="90" fill="rgba(28,30,32,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="30,100 230,40 430,100" fill="rgba(26,26,26,.98)" stroke="#50a880" stroke-width="2"/>
      <rect x="60" y="120" width="200" height="65" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="160" y1="120" x2="160" y2="185" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="160" y="158" fill="#4ab8d0" font-size="8" text-anchor="middle">LDK大開口 W4.5m×H2.4m</text>
      <rect x="280" y="130" width="36" height="55" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <text x="298" y="162" fill="#888" font-size="7" text-anchor="middle">玄関</text>
      <rect x="330" y="130" width="36" height="50" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="376" y="130" width="36" height="50" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="120" y="58" width="50" height="20" fill="rgba(70,184,208,.15)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="200" y="50" width="50" height="22" fill="rgba(70,184,208,.15)" stroke="#4ab8d0" stroke-width="1.5"/>
      <rect x="280" y="58" width="50" height="20" fill="rgba(70,184,208,.15)" stroke="#4ab8d0" stroke-width="1.5"/>
      <text x="225" y="92" fill="#4ab8d0" font-size="6.5" text-anchor="middle">ハイサイドライト×3（勾配天井採光）</text>
      <rect x="120" y="44" width="220" height="14" fill="rgba(80,168,128,.2)" stroke="#50a880" stroke-width="1" rx="2"/>
      <text x="230" y="54" fill="#50a880" font-size="6.5" text-anchor="middle">太陽光 5kW（大屋根南面・標準装備）</text>
      <text x="20" y="148" fill="#666" font-size="7" text-anchor="middle">1F</text>
      <line x1="40" y1="200" x2="420" y2="200" stroke="#444" stroke-width="1"/>
      <text x="230" y="214" fill="#555" font-size="8.5" text-anchor="middle">12,000 mm（4,800mm高・平屋大屋根）</text>
      <text x="20" y="14" fill="#50a880" font-size="9" font-weight="bold">FLAT — 南立面（平屋・準防火対応・ZEH+太陽光5kW）</text>
    </svg>`,
  },
  // ===== DUO (160m²) =====
  {
    id: "duo",
    name: "DUO",
    label: "160m²",
    area: 160,
    dims: "W 9,000 × D 11,000 mm（2階建て・二世帯）",
    weeks: 40,
    tag: "二世帯住宅・親+子世帯同居",
    tagColor: "#c08040",
    desc: "親世帯(60代)+子世帯(30〜40代+孫1〜2人)の二世帯同居。1F親世帯60m²(LDK+寝室+UB+WC、バリアフリー)/2F子世帯100m²(LDK+寝室3+UB+WC+書斎)。共用玄関+収納+階段室、間仕切りはサウンドプルーフ仕様で世帯間の音を遮断。郊外〜地方都市(土地80〜120坪)前提。三世代同居補助¥150万+こどもエコ¥160万+ZEH¥55万で実質¥7,795万。親世帯部分を将来賃貸化すれば月¥30万の収益も可能。",
    totalMat: 75000000,
    subsidyMax: 5050000,
    coldClimateUpgrade: 3500000,
    rentPerNight: 70000,
    color: "#c08040",
    img: "/img/urban/duo_ext.jpg",
    lifeImgs: [
      {src:"/img/urban/duo_ext.jpg", cap:"南面ファサード(午後・郊外住宅地)"},
      {src:"/img/urban/duo_int.jpg", cap:"1F親世帯リビング(バリアフリー・孫が遊ぶ)"},
    ],
    specs: [
      {k:"延床面積", v:"160 m²（48.4坪）1F: 60m²(親世帯) / 2F: 100m²(子世帯)"},
      {k:"外形寸法", v:"W 9,000 × D 11,000 × H 7,500 mm（2階建て）"},
      {k:"間取り", v:"1F 親世帯LDK+寝室+UB+WC(バリアフリー) / 2F 子世帯LDK+寝室3+UB+WC+書斎 / 共用玄関+収納+階段室"},
      {k:"天井高", v:"1F 2,500mm(車椅子対応) / 2F 2,400mm"},
      {k:"構造", v:"SIPs+ALC30mm耐火被覆 木造2階建て（準防火地域対応・サウンドプルーフ仕様）"},
      {k:"断熱性能", v:"UA値 0.46 W/m²K（HEAT20 G1 / ZEH対応）"},
      {k:"暖房", v:"全館空調×2系統(世帯別独立・温度個別制御)"},
      {k:"電力", v:"系統連系 + 太陽光7kW + 蓄電池10kWh（標準装備）"},
      {k:"バリアフリー", v:"1F全段差解消・廊下幅850mm・手すり・引戸式・段差5mm以下"},
      {k:"防音", v:"2F床に防振ゴム+グラスウール100mm（軽量衝撃音 ΔL-4等級）"},
      {k:"運営許可", v:"住宅 / 親世帯部分は将来賃貸住宅届出可"},
      {k:"耐震等級", v:"等級3 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（建築士設計・四号特例不可・構造計算推奨）"},
    ],
    materials: [
      {cat:"SIPs+ALC耐火被覆+サウンドプルーフ",emoji:"🏗️",total:18500000,color:"#c08040",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 160mm",qty:"320 m²",unit:"¥11,000/m²",total:3520000,note:"1F+2F全周+間仕切り"},
         {name:"SIPsパネル 屋根用 200mm",qty:"100 m²",unit:"¥14,000/m²",total:1400000,note:""},
         {name:"ALC 30mm 耐火被覆パネル",qty:"320 m²",unit:"¥6,500/m²",total:2080000,note:"準防火地域認定"},
         {name:"耐火サイディング+ジョイント金物一式",qty:"一式",unit:"¥6,500,000",total:6500000,note:"準防火30分認定セット"},
         {name:"防音間仕切り(2F床防振+グラスウール100mm)",qty:"100 m²",unit:"¥35,000/m²",total:3500000,note:"ΔL-4等級・世帯間遮音"},
         {name:"世帯間階段室防音処理",qty:"一式",unit:"¥1,500,000",total:1500000,note:"二重防音壁+気密ドア"},
       ]},
      {cat:"構造材（プレカット 2階建て・二世帯）",emoji:"📐",total:5500000,color:"#b07850",
       items:[
         {name:"KD杉 120×120 柱材",qty:"60本",unit:"¥1,500/本",total:90000,note:""},
         {name:"米松集成材 大梁 105×360",qty:"24本",unit:"¥6,000/本",total:144000,note:"スパン5m対応"},
         {name:"2F床梁・根太・廊下材",qty:"一式",unit:"¥1,200,000",total:1200000,note:"二世帯重荷重対応"},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥980,000",total:980000,note:""},
         {name:"構造用合板 28mm",qty:"130枚",unit:"¥4,200/枚",total:546000,note:""},
         {name:"大引・束・土台・耐震金物一式",qty:"一式",unit:"¥2,540,000",total:2540000,note:"耐震等級3"},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:7800000,color:"#4ab8d0",
       items:[
         {name:"1F親世帯LDK大開口 W4500×H2200(引違い・低敷居)",qty:"1枚",unit:"¥980,000",total:980000,note:"バリアフリー仕様"},
         {name:"2F子世帯LDK大開口 W4000×H2400(引違い)",qty:"1枚",unit:"¥820,000",total:820000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170",qty:"24枚",unit:"¥38,000/枚",total:912000,note:"全室"},
         {name:"玄関ドア 高断熱（K2・幅広）",qty:"1枚",unit:"¥320,000",total:320000,note:"共用・車椅子通過幅"},
         {name:"バルコニー引違い戸",qty:"3枚",unit:"¥180,000/枚",total:540000,note:"2F子世帯"},
         {name:"勝手口・浴室窓×2(親+子)・トイレ窓×2",qty:"6枚",unit:"¥85,000/枚",total:510000,note:""},
         {name:"親世帯掃出し窓(庭アクセス)",qty:"2枚",unit:"¥220,000/枚",total:440000,note:"バリアフリー敷居"},
         {name:"網戸・シャッター・電動ブラインド一式",qty:"一式",unit:"¥3,278,000",total:3278000,note:""},
       ]},
      {cat:"内装・仕上げ（バリアフリー含む）",emoji:"🪵",total:13500000,color:"#a07850",
       items:[
         {name:"杉羽目板 15mm",qty:"380 m²",unit:"¥2,800/m²",total:1064000,note:""},
         {name:"杉無垢フローリング 15mm",qty:"160 m²",unit:"¥5,000/m²",total:800000,note:""},
         {name:"システムキッチン W2700+食洗機+IH（2F子世帯）",qty:"1式",unit:"¥850,000",total:850000,note:""},
         {name:"システムキッチン W2400+食洗機+IH（1F親世帯・低カウンター）",qty:"1式",unit:"¥780,000",total:780000,note:"車椅子対応"},
         {name:"システムバス 1620（2F子世帯）",qty:"1基",unit:"¥520,000",total:520000,note:""},
         {name:"システムバス 1820（1F親世帯・バリアフリー）",qty:"1基",unit:"¥780,000",total:780000,note:"手すり+座面+段差なし"},
         {name:"洗面化粧台",qty:"3基",unit:"¥130,000/基",total:390000,note:"親+子+共用"},
         {name:"トイレ温水洗浄便座（1F手すり付）",qty:"3基",unit:"¥120,000/基",total:360000,note:""},
         {name:"漆喰塗装 + 階段+造作棚一式",qty:"一式",unit:"¥3,800,000",total:3800000,note:""},
         {name:"室内ドア×16（1F全引戸+幅広）",qty:"16枚",unit:"¥150,000/枚",total:2400000,note:"バリアフリー仕様"},
         {name:"手すり一式（1F廊下+トイレ+浴室+階段）",qty:"一式",unit:"¥420,000",total:420000,note:""},
         {name:"和室畳・襖・障子（1F親世帯6畳）",qty:"一式",unit:"¥420,000",total:420000,note:""},
         {name:"作り付け収納（共用玄関+各居室）",qty:"一式",unit:"¥916,000",total:916000,note:""},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:3800000,color:"#50b8a0",
       items:[
         {name:"上下水道引込工事",qty:"一式",unit:"¥420,000",total:420000,note:"郊外・道路から敷地内"},
         {name:"配管材一式（二世帯独立給湯系統）",qty:"一式",unit:"¥1,400,000",total:1400000,note:""},
         {name:"給湯器 エコキュート 460L（2F子世帯）",qty:"1基",unit:"¥420,000",total:420000,note:"4人家族対応"},
         {name:"給湯器 エコジョーズ（1F親世帯）",qty:"1基",unit:"¥280,000",total:280000,note:""},
         {name:"親世帯バリアフリー浴室追加配管",qty:"一式",unit:"¥380,000",total:380000,note:""},
         {name:"雨水タンク 500L+雨樋一式",qty:"1式",unit:"¥150,000",total:150000,note:""},
         {name:"その他衛生器具一式",qty:"一式",unit:"¥750,000",total:750000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:3200000,color:"#888",
       items:[
         {name:"ガルバリウム波板 黒",qty:"320 m²",unit:"¥1,350/m²",total:432000,note:""},
         {name:"杉板水平張り（南面+西面アクセント）",qty:"60 m²",unit:"¥4,800/m²",total:288000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥1,250,000",total:1250000,note:""},
         {name:"バルコニー防水・手すり×3",qty:"一式",unit:"¥720,000",total:720000,note:""},
         {name:"親世帯ウッドデッキ（庭アクセス）",qty:"15 m²",unit:"¥18,000/m²",total:270000,note:"段差なし"},
         {name:"軒・水切り金物一式",qty:"一式",unit:"¥240,000",total:240000,note:""},
       ]},
      {cat:"暖房・空調（世帯別2系統）",emoji:"❄️",total:3600000,color:"#4ab8d0",
       items:[
         {name:"全館空調 1F親世帯系統（ヒートポンプ+ダクト）",qty:"1式",unit:"¥950,000",total:950000,note:"温度個別制御"},
         {name:"全館空調 2F子世帯系統（ヒートポンプ+ダクト）",qty:"1式",unit:"¥1,200,000",total:1200000,note:"温度個別制御"},
         {name:"床暖房 1F親世帯LDK 25m²（電気式）",qty:"1式",unit:"¥400,000",total:400000,note:"バリアフリー暖房"},
         {name:"床暖房 2F子世帯LDK 25m²（電気式）",qty:"1式",unit:"¥400,000",total:400000,note:""},
         {name:"24時間第一種熱交換換気×2系統",qty:"1式",unit:"¥460,000",total:460000,note:"世帯別独立"},
         {name:"太陽光7kW+蓄電池10kWh一式",qty:"1式",unit:"¥190,000",total:190000,note:"系統連系・標準装備（補助金併用）"},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:1800000,color:"#7080e0",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"80 m²",unit:"¥1,200/m²",total:96000,note:""},
         {name:"気密テープ + 先張りシート（二世帯対応）",qty:"一式",unit:"¥520,000",total:520000,note:""},
         {name:"断熱補強・気流止め一式",qty:"一式",unit:"¥748,000",total:748000,note:""},
         {name:"2F子世帯床の防音断熱（防振ゴム+グラスウール100mm）",qty:"100 m²",unit:"¥4,360/m²",total:436000,note:"ΔL-4等級補強"},
       ]},
      {cat:"基礎+地盤改良",emoji:"⚓",total:3300000,color:"#606060",
       items:[
         {name:"地盤改良（柱状改良・郊外住宅地）",qty:"一式",unit:"¥1,000,000",total:1000000,note:"160m²二世帯は改良推奨"},
         {name:"生コン 凍結深度300mm",qty:"18 m³",unit:"¥18,000/m³",total:324000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥1,180,000",total:1180000,note:"べた基礎100m²+耐震金物"},
         {name:"地業（砕石・防湿シート）+地盤調査",qty:"一式",unit:"¥796,000",total:796000,note:""},
       ]},
      {cat:"設計監理+確認申請+構造計算",emoji:"📋",total:3300000,color:"#c06080",
       items:[
         {name:"建築確認申請（160m²超・四号特例不可）",qty:"一式",unit:"¥500,000",total:500000,note:""},
         {name:"設計図一式（意匠+構造+設備+設計監理）",qty:"一式",unit:"¥1,600,000",total:1600000,note:"建築士+構造設計士・二世帯間取り"},
         {name:"構造計算（許容応力度計算・推奨）",qty:"一式",unit:"¥350,000",total:350000,note:"160m²二世帯安全確保"},
         {name:"完了検査・引き渡し書類一式",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"瑕疵担保責任保険+ZEH+三世代同居申請",qty:"一式",unit:"¥350,000",total:350000,note:"補助金申請書類"},
         {name:"BELS評価+耐震等級3評価",qty:"一式",unit:"¥150,000",total:150000,note:""},
       ]},
      {cat:"附帯工事・搬入",emoji:"🚚",total:5300000,color:"#607080",
       items:[
         {name:"電気引込60A×2（世帯別分電盤+配線+照明一式）",qty:"一式",unit:"¥1,400,000",total:1400000,note:"二世帯独立メーター"},
         {name:"都市ガス引込（メイン+親世帯）",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"通信(光ファイバー)+TV配線（2世帯別回線）",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"足場(全周3層・2階建て大型)",qty:"一式",unit:"¥520,000",total:520000,note:""},
         {name:"建具金物・防蟻処理",qty:"一式",unit:"¥520,000",total:520000,note:""},
         {name:"運搬費(郊外・地方)",qty:"一式",unit:"¥400,000",total:400000,note:"10tトラック3便"},
         {name:"外構（境界塀+門柱+カーポート2台分+敷地内通路）",qty:"一式",unit:"¥1,200,000",total:1200000,note:"バリアフリー通路"},
         {name:"親世帯庭園・果樹植栽",qty:"一式",unit:"¥260,000",total:260000,note:""},
         {name:"その他諸経費・廃材処分",qty:"一式",unit:"¥400,000",total:400000,note:""},
       ]},
      {cat:"バリアフリー追加工事",emoji:"♿",total:5400000,color:"#50b8d0",
       items:[
         {name:"段差解消工事一式（玄関スロープ+全段差解消）",qty:"一式",unit:"¥850,000",total:850000,note:"5mm以下に統一"},
         {name:"廊下幅850mm拡張（車椅子対応）",qty:"一式",unit:"¥620,000",total:620000,note:""},
         {name:"親世帯トイレ拡張（介助スペース確保）",qty:"一式",unit:"¥480,000",total:480000,note:"幅1.5m×奥行2m"},
         {name:"将来エレベーター設置スペース（吹抜け確保）",qty:"一式",unit:"¥350,000",total:350000,note:"後付け対応の構造補強"},
         {name:"ホームエレベーター（オプション・3人乗り）",qty:"1基",unit:"¥2,800,000",total:2800000,note:"将来必要時に作動可・配線済み"},
         {name:"非常通報装置・センサー一式",qty:"一式",unit:"¥300,000",total:300000,note:"親世帯緊急通報"},
       ]},
    ],
    steps: [
      {week:"W1〜2",phase:"設計確認・地盤調査",icon:"📋",cost:0,diff:"★★★☆☆",people:"設計士+構造設計士",
       desc:"二世帯間取りの調整が最大のポイント。親世帯のバリアフリー要件・将来介護を見据えた配置確認。地盤調査+構造計算。", tools:["SWS試験機"],tips:"親世帯の意見と子世帯の意見が対立しやすい。事前家族会議が成否の80%。"},
      {week:"W3〜6",phase:"基礎・地盤改良",icon:"⚓",cost:3300000,diff:"★★★★☆",people:"5〜6人",
       desc:"柱状改良+べた基礎100m²。160m²二世帯の重荷重に耐える耐震金物。コンクリート養生2週間。", tools:["地盤改良機","ミニユンボ","型枠","鉄筋"],tips:"耐震等級3+地盤改良で安心の構造体に。"},
      {week:"W7〜10",phase:"1F土台・骨組・親世帯床組み",icon:"🪵",cost:3000000,diff:"★★★☆☆",people:"5〜6人",
       desc:"プレカット材を組む。1階親世帯の床はバリアフリー（段差5mm以下）に細心の注意。", tools:["インパクト","丸ノコ","レベル"],tips:"段差は後から直せない。0.1mm単位で水平を取る。"},
      {week:"W11〜13",phase:"棟上げ・2F子世帯骨組・小屋組",icon:"🏗️",cost:0,diff:"★★★★☆",people:"7〜9人（2.5日）",
       desc:"棟上げ2.5日。プロ大工3人を入れる（¥20万）。クレーン半日（¥7万）。160m²の二世帯規模。", tools:["クレーン","インパクト","安全帯"],tips:"二世帯の床荷重は通常住宅の1.5倍。梁サイズに妥協なし。"},
      {week:"W14〜25",phase:"SIPs+ALC耐火被覆+防音間仕切り取付",icon:"🔷",cost:18500000,diff:"★★★★☆",people:"6〜8人",
       desc:"320m²の壁パネル+100m²の屋根パネル+ALC耐火被覆+2F床防音施工。12週間。世帯間防音は念入りに。", tools:["インパクト","コーキングガン","足場","防振ゴム"],tips:"2F床の防音は施工後に直せない。グラスウール+防振ゴムを設計通り正確に。"},
      {week:"W26〜28",phase:"屋根・外装+バルコニー防水",icon:"🖤",cost:3200000,diff:"★★★★☆",people:"4〜5人",
       desc:"ガルバ320m²+杉板アクセント+バルコニー防水×3+親世帯ウッドデッキ。", tools:["丸ノコ","防水機材","コーキング"],tips:"バルコニー防水は専門業者依頼推奨。漏水で構造体が腐る。"},
      {week:"W29〜30",phase:"窓・断熱・気密",icon:"🪟",cost:7800000,diff:"★★★★☆",people:"4〜5人",
       desc:"親世帯LDK大開口W4.5m+子世帯LDK大開口W4m+樹脂窓24枚+玄関+バルコニー戸×3+掃出し窓×2を取付。気密測定でC値0.7目標。", tools:["気密テープ","気密測定機"],tips:"親世帯掃出し窓の敷居は段差なし仕様。専用部材必須。"},
      {week:"W31〜34",phase:"設備工事（電気・配管・空調×2系統・太陽光）",icon:"⚡",cost:8800000,diff:"★★★★★",people:"5〜7人",
       desc:"全館空調×2系統+床暖×2+電気引込×2世帯+ガス×2+水道×2+給湯×2+UB×2+キッチン×2+トイレ×3+太陽光7kW+蓄電池+将来エレベーター配線。", tools:["ダクト工具","配管工具","配線工具"],tips:"二世帯の独立メーターは必須。後で揉める原因No.1。"},
      {week:"W35〜38",phase:"内装・什器・バリアフリー仕上げ",icon:"🪵",cost:18900000,diff:"★★★★☆",people:"6〜8人",
       desc:"杉羽目板380m²+フローリング160m²+システムキッチン×2+UB×2+建具16枚（1F全引戸）+漆喰塗装+和室畳+手すり一式+段差解消工事+バリアフリートイレ。", tools:["フィニッシュネイラー","左官鏝"],tips:"バリアフリー仕上げは国交省ガイドラインを必ず確認。後付けは2倍コスト。"},
      {week:"W39〜40",phase:"外構・検査・引き渡し",icon:"✨",cost:11500000,diff:"★★★☆☆",people:"5人",
       desc:"外構（境界塀+門柱+カーポート2台+バリアフリー通路+親世帯庭園）+建築完了検査+気密測定+BELS評価+ZEH+三世代同居申請+耐震等級3評価+瑕疵保険+引き渡し書類。", tools:["気密測定機"],tips:"三世代同居補助金は完了後申請。書類完璧に。¥150万獲得確定。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修+部分外注",cost:83000000,color:"#c08040",hi:true},
      {name:"補助金後（三世代+こどもエコ+ZEH+郊外移住）",cost:77950000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:140000000,color:"#555"},
      {name:"親世帯空室時賃貸収益（年）",cost:-3600000,color:"#c08040",note:"親世帯部分¥30万/月想定"},
    ],
    floorSvg: `<svg viewBox="0 0 400 360" style="width:100%;background:#050505;display:block">
      <rect x="20" y="40" width="360" height="280" fill="none" stroke="#c08040" stroke-width="3"/>
      <line x1="20" y1="180" x2="380" y2="180" stroke="#888" stroke-width="2" stroke-dasharray="6,3"/>
      <text x="200" y="20" fill="#c08040" font-size="9" font-weight="bold" text-anchor="middle">DUO 1F 親世帯 60m²(バリアフリー) / 2F 子世帯 100m²</text>
      <rect x="20" y="40" width="220" height="140" fill="rgba(192,128,64,.06)" stroke="#c08040" stroke-width="1.5"/>
      <text x="130" y="80" fill="#c08040" font-size="11" text-anchor="middle">親世帯 LDK</text>
      <text x="130" y="98" fill="#666" font-size="8" text-anchor="middle">30m² · 大開口W4.5m(低敷居)</text>
      <text x="130" y="135" fill="#888" font-size="8" text-anchor="middle">床暖+全館空調 系統①</text>
      <rect x="20" y="140" width="100" height="40" fill="rgba(160,120,80,.08)" stroke="#a07850" stroke-width="1"/>
      <text x="70" y="165" fill="#a07850" font-size="8" text-anchor="middle">和室6畳</text>
      <rect x="120" y="140" width="120" height="40" fill="rgba(70,184,208,.06)" stroke="#50b8d0" stroke-width="1"/>
      <text x="180" y="158" fill="#50b8d0" font-size="8" text-anchor="middle">親寝室</text>
      <text x="180" y="171" fill="#666" font-size="7" text-anchor="middle">12m²</text>
      <rect x="240" y="40" width="140" height="100" fill="rgba(80,184,160,.06)" stroke="#50b8a0" stroke-width="1.5"/>
      <text x="310" y="80" fill="#50b8a0" font-size="9" text-anchor="middle">親UB(バリアフリー)</text>
      <text x="310" y="95" fill="#666" font-size="7.5" text-anchor="middle">1820・手すり付</text>
      <text x="310" y="115" fill="#50b8a0" font-size="8" text-anchor="middle">+WC+洗面</text>
      <text x="310" y="130" fill="#666" font-size="7" text-anchor="middle">幅広・引戸</text>
      <rect x="240" y="140" width="140" height="40" fill="rgba(80,80,80,.15)" stroke="#888" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="310" y="158" fill="#888" font-size="9" text-anchor="middle">共用玄関+階段室</text>
      <text x="310" y="171" fill="#888" font-size="7" text-anchor="middle">幅広・段差なし</text>
      <line x1="20" y1="180" x2="380" y2="180" stroke="#888" stroke-width="2"/>
      <text x="200" y="195" fill="#666" font-size="8" text-anchor="middle">↑ 1F 親世帯  /  2F 子世帯 ↓</text>
      <rect x="20" y="200" width="220" height="80" fill="rgba(192,128,64,.04)" stroke="#c08040" stroke-width="1"/>
      <text x="130" y="232" fill="#ddd" font-size="11" text-anchor="middle">子世帯 LDK</text>
      <text x="130" y="248" fill="#666" font-size="8" text-anchor="middle">35m² · 大開口W4m·バルコニー</text>
      <text x="130" y="268" fill="#888" font-size="7.5" text-anchor="middle">床暖+全館空調 系統②</text>
      <rect x="240" y="200" width="140" height="80" fill="rgba(70,184,208,.04)" stroke="#4ab8d0" stroke-width="1"/>
      <text x="310" y="232" fill="#4ab8d0" font-size="9" text-anchor="middle">寝室3+書斎</text>
      <text x="310" y="248" fill="#666" font-size="7.5" text-anchor="middle">主寝室+子供部屋×2+書斎</text>
      <text x="310" y="268" fill="#666" font-size="7.5" text-anchor="middle">+UB+WC</text>
      <text x="200" y="300" fill="#888" font-size="7.5" text-anchor="middle">2F床 防音処理(防振ゴム+グラスウール100mm・ΔL-4等級)</text>
      <line x1="20" y1="335" x2="380" y2="335" stroke="#333" stroke-width="1"/>
      <text x="20" y="347" fill="#666" font-size="7.5">9,000 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 440 280" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="240" x2="430" y2="240" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="40" y="130" width="360" height="110" fill="rgba(28,30,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="40" y="50" width="360" height="80" fill="rgba(32,34,38,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="30,50 220,18 410,50" fill="rgba(26,26,26,.98)" stroke="#c08040" stroke-width="2"/>
      <rect x="60" y="160" width="200" height="76" fill="rgba(192,128,64,.1)" stroke="#c08040" stroke-width="2"/>
      <line x1="160" y1="160" x2="160" y2="236" stroke="#c08040" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="160" y="195" fill="#c08040" font-size="8" text-anchor="middle">親世帯LDK大開口</text>
      <text x="160" y="210" fill="#888" font-size="7" text-anchor="middle">W4.5m×H2.2m(低敷居)</text>
      <rect x="320" y="170" width="36" height="64" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <text x="338" y="200" fill="#888" font-size="6.5" text-anchor="middle">共用玄関</text>
      <text x="338" y="212" fill="#888" font-size="6" text-anchor="middle">幅広</text>
      <rect x="60" y="62" width="200" height="68" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="160" y1="62" x2="160" y2="130" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="160" y="100" fill="#4ab8d0" font-size="8" text-anchor="middle">子世帯LDK大開口 W4m×H2.4m</text>
      <g fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1.5">
        <rect x="280" y="70" width="40" height="50"/>
        <rect x="340" y="70" width="40" height="50"/>
      </g>
      <line x1="40" y1="130" x2="400" y2="130" stroke="#888" stroke-width="2"/>
      <rect x="40" y="124" width="120" height="14" fill="rgba(160,120,80,.2)" stroke="#a07850" stroke-width="1.5"/>
      <text x="100" y="135" fill="#a07850" font-size="6.5" text-anchor="middle">子世帯バルコニー</text>
      <rect x="180" y="22" width="120" height="20" fill="rgba(192,128,64,.15)" rx="2"/>
      <text x="240" y="36" fill="#c08040" font-size="7" text-anchor="middle">太陽光7kW+蓄電池10kWh</text>
      <text x="20" y="178" fill="#666" font-size="7" text-anchor="middle">1F 親</text>
      <text x="20" y="92" fill="#666" font-size="7" text-anchor="middle">2F 子</text>
      <line x1="40" y1="252" x2="400" y2="252" stroke="#444" stroke-width="1"/>
      <text x="220" y="266" fill="#555" font-size="8.5" text-anchor="middle">9,000 mm（7,500mm高・2階建て二世帯）</text>
      <text x="20" y="14" fill="#c08040" font-size="9" font-weight="bold">DUO — 南立面（二世帯・サウンドプルーフ・準防火・ZEH）</text>
    </svg>`,
  },
  // ===== YIELD (180m²) =====
  {
    id: "yield",
    name: "YIELD",
    label: "180m²",
    area: 180,
    dims: "W 12,000 × D 8,000 mm（2階建て・1K×6戸）",
    weeks: 50,
    tag: "投資用アパート・1K×6戸",
    tagColor: "#6080c0",
    desc: "【Phase 2 / 大臣認定取得後リリース予定】180m²を25m²×6戸の1Kアパートに分割した不動産投資特化プラン。1F 3戸+2F 3戸+共用廊下+メーター室+ゴミ置き場+駐輪場。各戸独立給湯・独立メーター・LH-45サウンドプルーフ間仕切りで隣戸音漏れゼロ。地方都市〜中核市の駅徒歩10分圏を想定。家賃想定¥87,500/月/戸×6戸=月¥52.5万=年¥630万、表面利回り6.6%/年(対土地+建物)。耐震等級3+準耐火構造で30年保有を見据えた長期投資物件。",
    totalMat: 95000000,
    subsidyMax: 2400000,
    coldClimateUpgrade: 4000000,
    rentPerNight: 0,
    color: "#6080c0",
    img: "/img/urban/yield_ext.jpg",
    lifeImgs: [
      {src:"/img/urban/yield_ext.jpg", cap:"駅徒歩10分・全体ファサード(6戸並列)"},
      {src:"/img/urban/yield_int.jpg", cap:"1Kユニット内部 25m²(社会人入居者)"},
    ],
    specs: [
      {k:"延床面積", v:"180 m²（54.5坪）1F: 90m²(3戸+共用廊下) / 2F: 90m²(3戸+共用廊下)"},
      {k:"外形寸法", v:"W 12,000 × D 8,000 × H 7,500 mm（2階建て）"},
      {k:"間取り", v:"各戸25m² 1K(LDK15m²+UB+WC+ミニキッチン+収納) × 6戸 / 共用廊下+メーター室+駐輪場8台+ゴミ置き場"},
      {k:"天井高", v:"1F 2,500mm / 2F 2,400mm"},
      {k:"構造", v:"SIPs+ALC30mm耐火被覆 木造2階建て（準耐火構造・サウンドプルーフLH-45）"},
      {k:"断熱性能", v:"UA値 0.46 W/m²K（HEAT20 G1 / 賃貸住宅標準）"},
      {k:"暖房", v:"各戸エアコン+床暖（個別空調・各戸独立電気代）"},
      {k:"電力", v:"各戸独立メーター 30A・系統連系のみ・共用部別途"},
      {k:"運営許可", v:"共同住宅（賃貸住宅届出・宅建業法対応）"},
      {k:"耐震等級", v:"等級3 想定（性能評価未取得・大臣認定取得後Phase 2リリース）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（建築士設計・構造計算・耐震等級3）"},
    ],
    materials: [
      {cat:"SIPs+ALC耐火被覆+サウンドプルーフ",emoji:"🏗️",total:18000000,color:"#6080c0",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 160mm",qty:"320 m²",unit:"¥11,000/m²",total:3520000,note:"外周+戸間仕切り"},
         {name:"SIPsパネル 屋根用 200mm",qty:"96 m²",unit:"¥14,000/m²",total:1344000,note:""},
         {name:"ALC 30mm 耐火被覆パネル",qty:"320 m²",unit:"¥6,500/m²",total:2080000,note:"準防火地域認定"},
         {name:"サウンドプルーフ間仕切壁 LH-45（戸間仕切り）",qty:"110 m²",unit:"¥18,000/m²",total:1980000,note:"遮音等級LH-45"},
         {name:"床遮音二重床（パンライト+遮音マット）",qty:"180 m²",unit:"¥9,500/m²",total:1710000,note:"上下階遮音"},
         {name:"耐火サイディング+ジョイント金物一式",qty:"一式",unit:"¥7,366,000",total:7366000,note:"準耐火認定セット"},
       ]},
      {cat:"構造材（プレカット 2階建て）",emoji:"📐",total:5800000,color:"#b07850",
       items:[
         {name:"KD杉 120×120 柱材",qty:"72本",unit:"¥1,500/本",total:108000,note:"6戸+共用部"},
         {name:"米松集成材 大梁 105×360",qty:"36本",unit:"¥6,000/本",total:216000,note:"6戸スパン4m"},
         {name:"2F床梁・根太・廊下材",qty:"一式",unit:"¥850,000",total:850000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥1,156,000",total:1156000,note:""},
         {name:"構造用合板 28mm",qty:"140枚",unit:"¥4,200/枚",total:588000,note:""},
         {name:"大引・束・土台・耐震金物一式",qty:"一式",unit:"¥2,882,000",total:2882000,note:"耐震等級3"},
       ]},
      {cat:"窓・開口部（6戸分）",emoji:"🪟",total:7200000,color:"#4ab8d0",
       items:[
         {name:"各戸南面引違い W1700×H1800",qty:"6枚",unit:"¥190,000/枚",total:1140000,note:"トリプルLow-E"},
         {name:"樹脂窓 W780×H1170（各戸副窓+水回り）",qty:"24枚",unit:"¥38,000/枚",total:912000,note:""},
         {name:"玄関ドア 共同住宅用（各戸）",qty:"6枚",unit:"¥150,000/枚",total:900000,note:"防犯K2+ドアスコープ"},
         {name:"共用部外部建具（エントランス+物置）",qty:"一式",unit:"¥420,000",total:420000,note:""},
         {name:"網戸・面格子・シャッター一式",qty:"一式",unit:"¥3,828,000",total:3828000,note:"6戸分"},
       ]},
      {cat:"内装・仕上げ（6戸分）",emoji:"🪵",total:18000000,color:"#a07850",
       items:[
         {name:"クッションフロア（各戸LDK+水回り）",qty:"180 m²",unit:"¥3,500/m²",total:630000,note:"賃貸グレード・耐久"},
         {name:"ビニールクロス（各戸+共用部）",qty:"540 m²",unit:"¥1,200/m²",total:648000,note:"賃貸標準"},
         {name:"ミニキッチン W1500（IH1口+ミニ冷蔵庫対応）",qty:"6式",unit:"¥220,000/式",total:1320000,note:"単身者向け"},
         {name:"システムバス 1014（樹脂浴槽）",qty:"6基",unit:"¥320,000/基",total:1920000,note:"単身者向けコンパクト"},
         {name:"洗面化粧台 W600（コンパクト）",qty:"6基",unit:"¥58,000/基",total:348000,note:""},
         {name:"トイレ温水洗浄便座",qty:"6基",unit:"¥75,000/基",total:450000,note:"賃貸標準"},
         {name:"室内ドア（各戸 玄関→LDK→UB+WC）",qty:"24枚",unit:"¥48,000/枚",total:1152000,note:""},
         {name:"造作収納（各戸 1.5畳分クローゼット）",qty:"6式",unit:"¥180,000/式",total:1080000,note:""},
         {name:"共用廊下・階段仕上げ（防滑シート+塩ビ手すり）",qty:"一式",unit:"¥1,620,000",total:1620000,note:""},
         {name:"その他賃貸グレード仕上げ・幅木一式",qty:"一式",unit:"¥8,832,000",total:8832000,note:"6戸×¥147万"},
       ]},
      {cat:"給排水・衛生（6戸独立）",emoji:"💧",total:6500000,color:"#50b8a0",
       items:[
         {name:"上下水道引込工事（共同住宅口径）",qty:"一式",unit:"¥600,000",total:600000,note:"道路本管→敷地内"},
         {name:"配管材一式（6戸分岐+立管）",qty:"一式",unit:"¥1,800,000",total:1800000,note:"各戸独立メーター"},
         {name:"給湯器 エコジョーズ 24号（各戸独立）",qty:"6基",unit:"¥220,000/基",total:1320000,note:"PSマウント・独立計量"},
         {name:"水道メーター 6戸分+受水槽不要",qty:"一式",unit:"¥360,000",total:360000,note:"直結増圧式"},
         {name:"雨水管・排水ポンプ・浸透桝一式",qty:"一式",unit:"¥780,000",total:780000,note:""},
         {name:"その他衛生器具・給排水雑材一式",qty:"一式",unit:"¥1,640,000",total:1640000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:3200000,color:"#888",
       items:[
         {name:"ガルバリウム波板 黒",qty:"320 m²",unit:"¥1,350/m²",total:432000,note:""},
         {name:"杉板水平張り（エントランス側アクセント）",qty:"30 m²",unit:"¥4,800/m²",total:144000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥1,200,000",total:1200000,note:""},
         {name:"共用廊下・外階段防水・手すり",qty:"一式",unit:"¥980,000",total:980000,note:""},
         {name:"軒・水切り金物一式",qty:"一式",unit:"¥444,000",total:444000,note:""},
       ]},
      {cat:"暖房・空調（個別6系統）",emoji:"❄️",total:3600000,color:"#4ab8d0",
       items:[
         {name:"エアコン 6畳用（各戸標準装備）",qty:"6台",unit:"¥120,000/台",total:720000,note:"賃貸標準"},
         {name:"床暖房 LDK 8m²（各戸 電気式）",qty:"6式",unit:"¥230,000/式",total:1380000,note:""},
         {name:"24時間換気 第三種（各戸独立）",qty:"6式",unit:"¥110,000/式",total:660000,note:"建築基準法対応"},
         {name:"換気ダクト・配管・室外機架台一式",qty:"一式",unit:"¥840,000",total:840000,note:""},
       ]},
      {cat:"断熱・気密",emoji:"🌡️",total:1800000,color:"#7080e0",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"95 m²",unit:"¥1,200/m²",total:114000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥600,000",total:600000,note:""},
         {name:"戸間遮音吸音材（グラスウール80kg/m³）",qty:"110 m²",unit:"¥3,800/m²",total:418000,note:"LH-45用"},
         {name:"断熱補強・気流止め一式",qty:"一式",unit:"¥668,000",total:668000,note:""},
       ]},
      {cat:"基礎（べた基礎・耐震等級3）",emoji:"⚓",total:3500000,color:"#606060",
       items:[
         {name:"地盤調査+地盤改良（柱状改良必要時）",qty:"一式",unit:"¥1,200,000",total:1200000,note:"共同住宅は要改良率高"},
         {name:"生コン 凍結深度300mm",qty:"22 m³",unit:"¥18,000/m³",total:396000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥1,400,000",total:1400000,note:"べた基礎95m²+耐震金物"},
         {name:"地業（砕石・防湿シート）",qty:"一式",unit:"¥504,000",total:504000,note:""},
       ]},
      {cat:"設計監理+確認申請+構造計算",emoji:"📋",total:5400000,color:"#c06080",
       items:[
         {name:"建築確認申請（共同住宅・準耐火）",qty:"一式",unit:"¥600,000",total:600000,note:"共同住宅は審査厳格"},
         {name:"設計図一式（意匠+構造+設備+設計監理）",qty:"一式",unit:"¥2,400,000",total:2400000,note:"建築士+構造設計士"},
         {name:"構造計算（許容応力度計算・耐震等級3）",qty:"一式",unit:"¥600,000",total:600000,note:"共同住宅必須"},
         {name:"完了検査・引き渡し書類一式",qty:"一式",unit:"¥400,000",total:400000,note:""},
         {name:"瑕疵担保責任保険+賃貸住宅補助申請",qty:"一式",unit:"¥500,000",total:500000,note:"6戸分"},
         {name:"宅建業者連携+賃貸管理契約準備",qty:"一式",unit:"¥900,000",total:900000,note:"賃貸開始前手続"},
       ]},
      {cat:"附帯工事・搬入",emoji:"🚚",total:5800000,color:"#607080",
       items:[
         {name:"電気引込（共用60A+各戸30A×6）+分電盤一式",qty:"一式",unit:"¥1,800,000",total:1800000,note:"各戸独立メーター"},
         {name:"通信(光ファイバー6回線分岐)+TV共聴設備",qty:"一式",unit:"¥480,000",total:480000,note:""},
         {name:"足場(全周3層・大型)",qty:"一式",unit:"¥720,000",total:720000,note:"延長28m対応"},
         {name:"建具金物・防蟻処理",qty:"一式",unit:"¥720,000",total:720000,note:""},
         {name:"運搬費（地方都市・10tトラック3便）",qty:"一式",unit:"¥420,000",total:420000,note:""},
         {name:"駐輪場（屋根付き8台分）",qty:"一式",unit:"¥380,000",total:380000,note:"単身者用"},
         {name:"ゴミ置き場（鉄骨+樹脂屋根）",qty:"一式",unit:"¥260,000",total:260000,note:"自治体指定"},
         {name:"外構（境界塀+郵便受6+宅配ボックス6+案内サイン）",qty:"一式",unit:"¥620,000",total:620000,note:""},
         {name:"その他諸経費・廃材処分・近隣挨拶",qty:"一式",unit:"¥400,000",total:400000,note:""},
       ]},
      {cat:"賃貸開始準備（家具家電+管理初年度）",emoji:"🔑",total:16200000,color:"#80a0c0",
       items:[
         {name:"AD（広告料・客付け仲介）¥87,500×6戸×2ヶ月分",qty:"一式",unit:"¥1,050,000",total:1050000,note:"初回満室時"},
         {name:"賃貸管理契約準備（5%×年¥630万×3年前払）",qty:"一式",unit:"¥945,000",total:945000,note:"地方管理会社"},
         {name:"火災・地震・施設賠償保険（5年一括）",qty:"一式",unit:"¥420,000",total:420000,note:"オーナー加入"},
         {name:"家具家電（各戸エアコン以外+冷蔵庫+洗濯機+カーテン+照明）",qty:"6式",unit:"¥230,000/式",total:1380000,note:"家具付き賃料+¥5千上乗せ"},
         {name:"インターネット無料サービス導入工事+1年分",qty:"一式",unit:"¥360,000",total:360000,note:"客付け強化"},
         {name:"防犯カメラ4台+モニター+録画設備",qty:"一式",unit:"¥420,000",total:420000,note:"共用部監視"},
         {name:"オートロック・宅配ボックス連動設備",qty:"一式",unit:"¥625,000",total:625000,note:"単身女性入居率向上"},
         {name:"デジタル消防設備+自動火災報知設備（共同住宅必須）",qty:"一式",unit:"¥10,000,000",total:10000000,note:"スプリンクラー+受信機+各戸感知器+消防検査"},
         {name:"その他賃貸開始諸経費（鍵×6・ハウスクリーニング・契約書一式）",qty:"一式",unit:"¥1,000,000",total:1000000,note:""},
       ]},
    ],
    steps: [
      {week:"W1〜2",phase:"設計確認・地盤調査・近隣調整",icon:"📋",cost:0,diff:"★★★☆☆",people:"設計士+構造設計士",
       desc:"建築確認申請（共同住宅・準耐火）+構造計算+地盤調査。共同住宅は近隣説明会必須(自治体条例)。", tools:["SWS試験機"],tips:"共同住宅は近隣の反対が起きやすい。事前説明会で半分決まる。"},
      {week:"W3〜6",phase:"基礎工事（べた基礎・地盤改良）",icon:"⚓",cost:3500000,diff:"★★★★☆",people:"5〜6人",
       desc:"95m²のべた基礎+柱状改良。耐震等級3対応の鉄筋ピッチ密。", tools:["地盤改良機","ミニユンボ","型枠","鉄筋"],tips:"共同住宅は地盤改良ほぼ必須。¥120万計算。"},
      {week:"W7〜10",phase:"1F土台・骨組",icon:"🪵",cost:5800000,diff:"★★★☆☆",people:"5〜6人",
       desc:"プレカット材で1階6戸分+共用廊下を組む。", tools:["インパクト","丸ノコ","レベル"],tips:"6戸分の戸境壁の精度が後の遮音性能を決める。"},
      {week:"W11〜13",phase:"棟上げ・2F骨組・小屋組",icon:"🏗️",cost:0,diff:"★★★★☆",people:"8〜10人（3日）",
       desc:"棟上げ3日。プロ大工4人入れる(¥20万)。クレーン1日(¥10万)。", tools:["クレーン","インパクト","安全帯"],tips:"間口12mは大梁の取り扱いが命。1人で持てない部材は2人体制で。"},
      {week:"W14〜26",phase:"SIPs+ALC耐火被覆+サウンドプルーフ取付",icon:"🔷",cost:18000000,diff:"★★★★☆",people:"6〜8人",
       desc:"320m²の壁パネル+96m²の屋根+ALC耐火被覆+戸境LH-45間仕切り。13週間。", tools:["インパクト","コーキングガン","足場"],tips:"戸境壁の遮音はパネルとパネルの隙間1mmでも音漏れする。テープシール完璧に。"},
      {week:"W27〜29",phase:"屋根・外装",icon:"🖤",cost:3200000,diff:"★★★☆☆",people:"4〜5人",
       desc:"ガルバ320m²+共用廊下防水+外階段。", tools:["丸ノコ","防水機材","コーキング"],tips:"共用廊下防水は将来的な漏水で訴訟リスク。専門業者推奨。"},
      {week:"W30〜32",phase:"窓・断熱・気密",icon:"🪟",cost:9000000,diff:"★★★★☆",people:"4〜5人",
       desc:"6戸×南面引違い+樹脂窓24枚+玄関6枚+共用部建具。気密C値1.0目標(賃貸グレード)。", tools:["気密テープ","気密測定機"],tips:"玄関ドアの防犯性能は入居者選定に直結。K2必須。"},
      {week:"W33〜37",phase:"設備工事（電気・配管・空調・各戸独立）",icon:"⚡",cost:9400000,diff:"★★★★★",people:"5〜7人",
       desc:"6戸独立メーター+給湯器6台+UB6基+ミニキッチン6式+エアコン6台+24時間換気6系統+共用部配線。", tools:["ダクト工具","配管工具","配線工具"],tips:"各戸独立計量が肝。間違えると後で大事故。電気図面は3回チェック。"},
      {week:"W38〜44",phase:"内装・仕上げ（6戸分）",icon:"🪵",cost:18000000,diff:"★★★☆☆",people:"6〜8人",
       desc:"クッションフロア180m²+ビニールクロス540m²+ミニキッチン6+UB6+建具24枚+造作収納+共用廊下仕上げ。", tools:["フィニッシュネイラー","クロス糊付機"],tips:"賃貸グレードは耐久性重視。傷つきにくい素材選択。"},
      {week:"W45〜47",phase:"附帯・外構・駐輪場・ゴミ置き場",icon:"🚚",cost:5800000,diff:"★★★☆☆",people:"4人",
       desc:"駐輪場8台+ゴミ置き場+境界塀+郵便受+宅配ボックス+案内サイン+外構。", tools:["インパクト","左官道具"],tips:"宅配ボックスは単身入居者の必需品。手抜き厳禁。"},
      {week:"W48〜50",phase:"検査・引き渡し・賃貸開始準備",icon:"🔑",cost:21600000,diff:"★★★★☆",people:"設計士+管理会社",
       desc:"建築完了検査+気密測定+瑕疵保険+消防設備設置+賃貸住宅補助申請+管理会社契約+広告掲載+鍵引き渡し。", tools:["気密測定機"],tips:"完成→入居開始までのスピードが利回りに直結。検査前から客付け開始。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修+施工チーム",cost:105000000,color:"#6080c0",hi:true},
      {name:"補助金後（賃貸住宅補助¥40万×6戸）",cost:102600000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:170000000,color:"#555"},
      {name:"家賃収益（年・満室時）",cost:-6300000,color:"#6080c0",note:"¥87,500×6戸×12ヶ月（表面利回り6.6%）"},
    ],
    floorSvg: `<svg viewBox="0 0 540 280" style="width:100%;background:#050505;display:block">
      <rect x="20" y="40" width="500" height="220" fill="none" stroke="#6080c0" stroke-width="3"/>
      <line x1="20" y1="180" x2="520" y2="180" stroke="#888" stroke-width="2" stroke-dasharray="6,3"/>
      <text x="270" y="20" fill="#6080c0" font-size="9" font-weight="bold" text-anchor="middle">YIELD — 1F: 25m²×3戸+共用廊下 / 2F: 25m²×3戸+共用廊下（合計6戸）</text>
      <g>
        <rect x="30" y="50" width="150" height="120" fill="rgba(96,128,192,.06)" stroke="#6080c0" stroke-width="1.5"/>
        <text x="105" y="100" fill="#ddd" font-size="11" text-anchor="middle">101号室</text>
        <text x="105" y="118" fill="#666" font-size="8" text-anchor="middle">25 m² · 1K</text>
        <text x="105" y="135" fill="#666" font-size="7" text-anchor="middle">¥87,500/月</text>
        <rect x="30" y="50" width="150" height="14" fill="rgba(70,184,208,.15)" stroke="#4ab8d0" stroke-width="1"/>
        <text x="105" y="60" fill="#4ab8d0" font-size="6" text-anchor="middle">南面窓W1.7m</text>
      </g>
      <g>
        <rect x="190" y="50" width="150" height="120" fill="rgba(96,128,192,.06)" stroke="#6080c0" stroke-width="1.5"/>
        <text x="265" y="100" fill="#ddd" font-size="11" text-anchor="middle">102号室</text>
        <text x="265" y="118" fill="#666" font-size="8" text-anchor="middle">25 m² · 1K</text>
        <text x="265" y="135" fill="#666" font-size="7" text-anchor="middle">¥87,500/月</text>
        <rect x="190" y="50" width="150" height="14" fill="rgba(70,184,208,.15)" stroke="#4ab8d0" stroke-width="1"/>
      </g>
      <g>
        <rect x="350" y="50" width="150" height="120" fill="rgba(96,128,192,.06)" stroke="#6080c0" stroke-width="1.5"/>
        <text x="425" y="100" fill="#ddd" font-size="11" text-anchor="middle">103号室</text>
        <text x="425" y="118" fill="#666" font-size="8" text-anchor="middle">25 m² · 1K</text>
        <text x="425" y="135" fill="#666" font-size="7" text-anchor="middle">¥87,500/月</text>
        <rect x="350" y="50" width="150" height="14" fill="rgba(70,184,208,.15)" stroke="#4ab8d0" stroke-width="1"/>
      </g>
      <rect x="20" y="170" width="500" height="10" fill="rgba(160,160,160,.15)"/>
      <text x="270" y="178" fill="#888" font-size="7" text-anchor="middle">共用廊下（北側通路+階段室）</text>
      <rect x="20" y="195" width="160" height="55" fill="rgba(80,80,80,.12)" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="100" y="220" fill="#888" font-size="9" text-anchor="middle">駐輪場 8台分</text>
      <text x="100" y="235" fill="#666" font-size="7" text-anchor="middle">屋根付き</text>
      <rect x="190" y="195" width="100" height="55" fill="rgba(80,80,80,.12)" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="240" y="220" fill="#888" font-size="9" text-anchor="middle">ゴミ置き場</text>
      <rect x="300" y="195" width="100" height="55" fill="rgba(80,80,80,.12)" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="350" y="220" fill="#888" font-size="9" text-anchor="middle">メーター室</text>
      <text x="350" y="235" fill="#666" font-size="7" text-anchor="middle">水道+電気6戸独立</text>
      <rect x="410" y="195" width="100" height="55" fill="rgba(80,80,80,.12)" stroke="#666" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="460" y="220" fill="#888" font-size="9" text-anchor="middle">エントランス</text>
      <text x="460" y="235" fill="#666" font-size="7" text-anchor="middle">+宅配ボックス×6</text>
      <line x1="20" y1="265" x2="520" y2="265" stroke="#333" stroke-width="1"/>
      <text x="20" y="276" fill="#666" font-size="7.5">12,000 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 560 280" style="width:100%;background:#050505;display:block">
      <line x1="10" y1="240" x2="550" y2="240" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="40" y="130" width="480" height="110" fill="rgba(28,30,32,.95)" stroke="#666" stroke-width="2"/>
      <rect x="40" y="50" width="480" height="80" fill="rgba(32,34,38,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="30,50 280,18 530,50" fill="rgba(26,26,26,.98)" stroke="#6080c0" stroke-width="2"/>
      <g fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="1.5">
        <rect x="60" y="160" width="100" height="60"/>
        <rect x="220" y="160" width="100" height="60"/>
        <rect x="380" y="160" width="100" height="60"/>
      </g>
      <text x="110" y="195" fill="#4ab8d0" font-size="7" text-anchor="middle">101号</text>
      <text x="270" y="195" fill="#4ab8d0" font-size="7" text-anchor="middle">102号</text>
      <text x="430" y="195" fill="#4ab8d0" font-size="7" text-anchor="middle">103号</text>
      <g fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="1.5">
        <rect x="60" y="80" width="100" height="44"/>
        <rect x="220" y="80" width="100" height="44"/>
        <rect x="380" y="80" width="100" height="44"/>
      </g>
      <text x="110" y="106" fill="#4ab8d0" font-size="7" text-anchor="middle">201号</text>
      <text x="270" y="106" fill="#4ab8d0" font-size="7" text-anchor="middle">202号</text>
      <text x="430" y="106" fill="#4ab8d0" font-size="7" text-anchor="middle">203号</text>
      <line x1="40" y1="130" x2="520" y2="130" stroke="#888" stroke-width="2"/>
      <text x="20" y="195" fill="#666" font-size="7" text-anchor="middle">1F</text>
      <text x="20" y="105" fill="#666" font-size="7" text-anchor="middle">2F</text>
      <line x1="40" y1="124" x2="520" y2="124" stroke="#a07850" stroke-width="2"/>
      <text x="280" y="78" fill="#a07850" font-size="6.5" text-anchor="middle">2F共用廊下（外部開放廊下）</text>
      <line x1="40" y1="252" x2="520" y2="252" stroke="#444" stroke-width="1"/>
      <text x="280" y="266" fill="#555" font-size="8.5" text-anchor="middle">12,000 mm（7,500mm高・2階建て・準耐火）</text>
      <text x="20" y="14" fill="#6080c0" font-size="9" font-weight="bold">YIELD — 南立面（2階建て・1K×6戸・LH-45遮音・耐震等級3）</text>
    </svg>`,
  },
  // ===== ROOTS (60m²) =====
  {
    id: "roots",
    name: "ROOTS",
    label: "60m²",
    area: 60,
    dims: "W 9,000 × D 7,000 mm（平屋）",
    weeks: 22,
    tag: "終の住処・60代夫婦",
    tagColor: "#a86060",
    desc: "60代以上夫婦(子供独立後)の終の住処。LDK 22m²+主寝室+UB(バリアフリー1620)+WC×2(寝室隣接)+書斎or趣味室+広縁。段差ゼロ・引戸中心・全所手すり配置・要介護2レベル対応想定。郊外住宅地・地方都市(土地30〜50坪)前提。SIPs+ALC耐火被覆 木造平屋。リバースモーゲージで現金化可能。介護リフォーム不要の「最初から終の住処」設計。",
    totalMat: 24000000,
    subsidyMax: 2050000,
    coldClimateUpgrade: 1200000,
    rentPerNight: 20000,
    color: "#a86060",
    img: "/img/urban/roots_ext.jpg",
    lifeImgs: [
      {src:"/img/urban/roots_ext.jpg", cap:"南面ファサード(午後・玄関スロープ)"},
      {src:"/img/urban/roots_int.jpg", cap:"LDK 22m² + 広縁(夫婦のための時間)"},
    ],
    specs: [
      {k:"延床面積", v:"60 m²（18.2坪）平屋 + 広縁 4m²"},
      {k:"外形寸法", v:"W 9,000 × D 7,000 × H 4,000 mm（平屋）"},
      {k:"間取り", v:"LDK 22m² + 主寝室 + 書斎/趣味室 + UB1620(バリアフリー) + WC×2(寝室隣接+玄関側) + 広縁(南面1.2m深)"},
      {k:"天井高", v:"2,600mm（広縁部 2,400mm深軒）"},
      {k:"構造", v:"SIPs+ALC30mm耐火被覆 木造平屋（準防火地域対応・バリアフリー）"},
      {k:"断熱性能", v:"UA値 0.46 W/m²K（HEAT20 G1 / ZEH対応）"},
      {k:"暖房", v:"全館空調（温度差5℃以下・ヒートショック予防）+ 床暖房"},
      {k:"電力", v:"系統連系 + 太陽光 4kW（売電収益 年¥4〜5万）"},
      {k:"バリアフリー", v:"段差ゼロ・引戸中心・全所手すり・スロープ・UB1620(車椅子対応)・緊急通報"},
      {k:"運営許可", v:"住宅 / 将来貸し出し時は民泊届出可"},
      {k:"耐震等級", v:"等級2 想定（性能評価未取得）"},
      {k:"設計監理", v:"提携1級建築士事務所と個別連携（事務所登録番号は契約時に開示）"},
      {k:"建築確認", v:"必須（建築士設計・バリアフリー認定）"},
    ],
    materials: [
      {cat:"SIPs+ALC耐火被覆",emoji:"🏗️",total:6200000,color:"#a86060",
       items:[
         {name:"SIPsパネル 壁用 910×1820mm 160mm",qty:"130 m²",unit:"¥11,000/m²",total:1430000,note:"全周"},
         {name:"SIPsパネル 屋根用 200mm",qty:"65 m²",unit:"¥14,000/m²",total:910000,note:""},
         {name:"ALC 30mm 耐火被覆パネル",qty:"130 m²",unit:"¥6,500/m²",total:845000,note:"準防火地域認定"},
         {name:"耐火サイディング+ジョイント金物一式",qty:"一式",unit:"¥3,015,000",total:3015000,note:"準防火30分認定セット"},
       ]},
      {cat:"構造材（プレカット 平屋）",emoji:"📐",total:1400000,color:"#b07850",
       items:[
         {name:"KD杉 120×120 柱材",qty:"24本",unit:"¥1,500/本",total:36000,note:""},
         {name:"KD杉 105×240 梁材",qty:"14本",unit:"¥6,000/本",total:84000,note:""},
         {name:"間柱・垂木・野縁一式",qty:"一式",unit:"¥380,000",total:380000,note:""},
         {name:"構造用合板 28mm",qty:"50枚",unit:"¥4,200/枚",total:210000,note:""},
         {name:"大引・束・土台・耐震金物一式",qty:"一式",unit:"¥690,000",total:690000,note:"耐震等級2以上"},
       ]},
      {cat:"窓・開口部",emoji:"🪟",total:2800000,color:"#4ab8d0",
       items:[
         {name:"南面広縁大開口 W4500×H2200(引違い)",qty:"1枚",unit:"¥720,000",total:720000,note:"トリプルLow-E"},
         {name:"樹脂引違い窓 W1690×H1170",qty:"5枚",unit:"¥75,000/枚",total:375000,note:"主寝室+書斎+和室"},
         {name:"樹脂窓 W780×H1170",qty:"4枚",unit:"¥38,000/枚",total:152000,note:"水回り+小窓"},
         {name:"バリアフリー玄関ドア（車椅子対応・幅広）",qty:"1枚",unit:"¥250,000",total:250000,note:"開口W900以上"},
         {name:"勝手口・浴室窓",qty:"2枚",unit:"¥85,000/枚",total:170000,note:""},
         {name:"網戸・電動シャッター・ブラインド一式",qty:"一式",unit:"¥1,133,000",total:1133000,note:"操作簡単型"},
       ]},
      {cat:"内装・仕上げ（バリアフリー）",emoji:"🪵",total:3800000,color:"#a07850",
       items:[
         {name:"杉羽目板 15mm",qty:"150 m²",unit:"¥2,800/m²",total:420000,note:""},
         {name:"コルクフローリング 15mm（滑り止め・転倒衝撃緩和）",qty:"60 m²",unit:"¥6,500/m²",total:390000,note:"バリアフリー仕様"},
         {name:"システムキッチン W2400（車椅子対応・低めL型）",qty:"1式",unit:"¥850,000",total:850000,note:"カウンター高780mm"},
         {name:"洗面化粧台 W900（バリアフリー・高さ調整可）",qty:"1基",unit:"¥180,000",total:180000,note:""},
         {name:"トイレ温水洗浄便座（バリアフリーグレード）",qty:"2基",unit:"¥120,000/基",total:240000,note:"主+寝室隣接"},
         {name:"漆喰塗装 + 引戸建具×8 + 造作棚一式",qty:"一式",unit:"¥1,720,000",total:1720000,note:"全室引戸・段差ゼロ"},
       ]},
      {cat:"給排水・衛生",emoji:"💧",total:1300000,color:"#50b8a0",
       items:[
         {name:"上下水道引込工事",qty:"一式",unit:"¥300,000",total:300000,note:""},
         {name:"配管材一式（平屋）",qty:"一式",unit:"¥350,000",total:350000,note:"立管なしで簡素"},
         {name:"給湯器 エコキュート 370L",qty:"1基",unit:"¥350,000",total:350000,note:"夫婦2人対応"},
         {name:"雨水タンク 200L+雨樋一式",qty:"1式",unit:"¥80,000",total:80000,note:""},
         {name:"その他衛生器具一式",qty:"一式",unit:"¥220,000",total:220000,note:""},
       ]},
      {cat:"バリアフリー設備（介護対応）",emoji:"♿",total:1800000,color:"#c89020",
       items:[
         {name:"システムバス 1620（車椅子対応・段差ゼロ・浴槽手すり・滑り止め床）",qty:"1基",unit:"¥780,000",total:780000,note:"介護想定"},
         {name:"全所手すり配置（廊下・トイレ×2・浴室・玄関・寝室）",qty:"一式",unit:"¥280,000",total:280000,note:"高さ800mm統一"},
         {name:"段差解消・スロープ（玄関+室内）",qty:"一式",unit:"¥220,000",total:220000,note:"勾配1/15以下"},
         {name:"浴室暖房乾燥機（ヒートショック予防）",qty:"1基",unit:"¥180,000",total:180000,note:"必須装備"},
         {name:"緊急通報システム + 防犯センサー一式",qty:"一式",unit:"¥220,000",total:220000,note:"親族+地域包括連動"},
         {name:"リフトアップ便座（将来介助対応）",qty:"1基",unit:"¥120,000",total:120000,note:""},
       ]},
      {cat:"外装",emoji:"🖤",total:1100000,color:"#888",
       items:[
         {name:"ガルバリウム波板 黒",qty:"130 m²",unit:"¥1,350/m²",total:175500,note:""},
         {name:"杉板水平張り（南面アクセント）",qty:"25 m²",unit:"¥4,800/m²",total:120000,note:""},
         {name:"タイベック + 胴縁 + コーキング",qty:"一式",unit:"¥430,000",total:430000,note:""},
         {name:"玄関スロープ（タイル+両側手すり）",qty:"一式",unit:"¥220,500",total:220500,note:"バリアフリー"},
         {name:"軒・水切り金物一式（広縁深軒）",qty:"一式",unit:"¥154,000",total:154000,note:"夏の日射遮蔽"},
       ]},
      {cat:"暖房・空調・換気",emoji:"❄️",total:1200000,color:"#4ab8d0",
       items:[
         {name:"全館空調（ヒートポンプ式・温度差5℃以下・ヒートショック予防）",qty:"1式",unit:"¥700,000",total:700000,note:"ZEH対応"},
         {name:"床暖房 LDK 22m²（電気式）",qty:"1式",unit:"¥300,000",total:300000,note:""},
         {name:"24時間第一種熱交換換気",qty:"1式",unit:"¥200,000",total:200000,note:"ZEH要件"},
       ]},
      {cat:"太陽光・蓄電池",emoji:"☀️",total:600000,color:"#f0c040",
       items:[
         {name:"太陽光4kW パネル（系統連系）",qty:"1式",unit:"¥420,000",total:420000,note:"年¥4〜5万売電"},
         {name:"パワーコンディショナー一式",qty:"1式",unit:"¥130,000",total:130000,note:""},
         {name:"系統連系・売電契約一式",qty:"一式",unit:"¥50,000",total:50000,note:""},
       ]},
      {cat:"断熱・気密+基礎",emoji:"⚓",total:2000000,color:"#7080e0",
       items:[
         {name:"スタイロフォーム 50mm 床下",qty:"60 m²",unit:"¥1,200/m²",total:72000,note:""},
         {name:"気密テープ + 先張りシート",qty:"一式",unit:"¥250,000",total:250000,note:""},
         {name:"基礎 生コン 凍結深度300mm",qty:"8 m³",unit:"¥18,000/m³",total:144000,note:""},
         {name:"型枠・鉄筋・アンカー一式",qty:"一式",unit:"¥820,000",total:820000,note:"べた基礎63m²+耐震金物"},
         {name:"地業（砕石・防湿シート）+地盤調査",qty:"一式",unit:"¥514,000",total:514000,note:""},
         {name:"断熱補強・気流止め一式",qty:"一式",unit:"¥200,000",total:200000,note:""},
       ]},
      {cat:"設計監理+附帯工事",emoji:"📋",total:1800000,color:"#c06080",
       items:[
         {name:"建築確認申請（バリアフリー認定）",qty:"一式",unit:"¥300,000",total:300000,note:"高齢者住宅補助対応"},
         {name:"設計図一式（意匠+構造+設備+バリアフリー）",qty:"一式",unit:"¥600,000",total:600000,note:"建築士設計"},
         {name:"完了検査・引き渡し書類+瑕疵保険+ZEH申請",qty:"一式",unit:"¥350,000",total:350000,note:""},
         {name:"電気引込60A+分電盤+配線+照明一式",qty:"一式",unit:"¥250,000",total:250000,note:"スイッチ高1100mm統一"},
         {name:"都市ガス引込+通信(光ファイバー)配線",qty:"一式",unit:"¥150,000",total:150000,note:""},
         {name:"足場(全周2層・平屋)+運搬+建具金物・防蟻処理",qty:"一式",unit:"¥150,000",total:150000,note:""},
       ]},
    ],
    steps: [
      {week:"W1",phase:"設計確認・地盤調査",icon:"📋",cost:0,diff:"★★☆☆☆",people:"設計士1人",
       desc:"バリアフリー認定+建築確認申請。地盤調査でSWS試験。郊外は近隣との距離余裕あり。", tools:["SWS試験機"],tips:"バリアフリー認定で補助金が手厚い。図面段階で介護動線を確認。"},
      {week:"W2〜3",phase:"基礎工事（べた基礎・段差ゼロ仕様）",icon:"⚓",cost:1300000,diff:"★★★☆☆",people:"4人",
       desc:"63m²のべた基礎+床下断熱。玄関スロープの基礎も同時施工。床仕上げ時に段差ゼロにするためレベル精度シビア。", tools:["ミニユンボ","型枠","鉄筋","レベル"],tips:"基礎レベル±2mm以内で仕上げないと段差ゼロにならない。"},
      {week:"W4〜5",phase:"土台・骨組",icon:"🪵",cost:1400000,diff:"★★★☆☆",people:"4人",
       desc:"プレカット材で平屋骨組み。広縁の柱・桁も同時に建てる。", tools:["インパクト","丸ノコ","レベル"],tips:"平屋は2週間で骨組み完了する規模。"},
      {week:"W6〜11",phase:"SIPs+ALC耐火被覆取付",icon:"🔷",cost:6200000,diff:"★★★★☆",people:"4〜5人",
       desc:"130m²の壁パネル+65m²の屋根パネル+ALC30mm耐火被覆を6週間で施工。準防火地域納まりに注意。", tools:["インパクト","コーキングガン","リフト"],tips:"平屋でも気密性能はC値0.7以下を目標。"},
      {week:"W12〜13",phase:"屋根・外装・玄関スロープ",icon:"🖤",cost:1100000,diff:"★★★☆☆",people:"3〜4人",
       desc:"ガルバ130m²+杉板アクセント+広縁深軒+玄関スロープタイル仕上げ。", tools:["丸ノコ","タッカー","コーキング"],tips:"スロープ勾配は1/15以下、両側手すり必須。"},
      {week:"W14〜15",phase:"窓・断熱・気密",icon:"🪟",cost:3500000,diff:"★★★★☆",people:"3〜4人",
       desc:"南面大開口W4.5m+樹脂引違い5枚+樹脂窓4枚+玄関+水回り窓を取付。気密測定でC値0.7目標。", tools:["気密テープ","気密測定機"],tips:"大開口は3人がかり。動線確保。"},
      {week:"W16〜17",phase:"設備工事（電気・配管・空調・太陽光）",icon:"⚡",cost:3400000,diff:"★★★★☆",people:"4〜5人",
       desc:"全館空調+床暖+電気+ガス+水道+給湯+太陽光4kW+24時間換気。バリアフリー想定の手元コンセント追加。", tools:["ダクト工具","配管工具","配線工具"],tips:"スイッチ高さは1100mm(車椅子対応)に統一。"},
      {week:"W18〜20",phase:"内装・バリアフリー設備",icon:"🪵",cost:5600000,diff:"★★★★☆",people:"4〜6人",
       desc:"杉羽目板150m²+コルクフローリング60m²+システムキッチン+UB1620バリアフリー+引戸8枚+漆喰+全所手すり配置。", tools:["フィニッシュネイラー","左官鏝","測定器"],tips:"手すり高さは800mm統一。引戸レールはフラット型(段差ゼロ)。"},
      {week:"W21",phase:"緊急通報システム+最終バリアフリー検査",icon:"🔔",cost:1000000,diff:"★★☆☆☆",people:"3人",
       desc:"緊急通報システム+防犯センサー+リフトアップ便座取付。バリアフリー法・福祉のまちづくり条例の検査。", tools:["配線工具","測定器"],tips:"緊急通報は親族+地域包括支援センター連動を推奨。"},
      {week:"W22",phase:"検査・引き渡し",icon:"✨",cost:500000,diff:"★★☆☆☆",people:"3人",
       desc:"建築完了検査+気密測定+BELS評価+ZEH申請+高齢者住宅補助申請+瑕疵保険+引き渡し。", tools:["気密測定機"],tips:"高齢者住宅補助は事前協議が肝。書類完璧に。"},
    ],
    routes: [
      {name:"セルフビルド+建築士監修",cost:27000000,color:"#a86060",hi:true},
      {name:"補助金後（高齢者住宅+ZEH）",cost:24950000,color:"rgba(80,200,160,.9)",gr:true},
      {name:"工務店依頼",cost:45000000,color:"#555"},
      {name:"将来貸し出し収益（年）",cost:-2400000,color:"#a86060",note:"民泊¥20万/月想定"},
    ],
    floorSvg: `<svg viewBox="0 0 380 300" style="width:100%;background:#050505;display:block">
      <text x="20" y="20" fill="#a86060" font-size="9" font-weight="bold">ROOTS — 60m²（平屋・段差ゼロ・引戸中心）</text>
      <rect x="20" y="40" width="320" height="220" fill="none" stroke="#a86060" stroke-width="3"/>
      <rect x="20" y="220" width="320" height="40" fill="rgba(160,120,80,.12)" stroke="#a07850" stroke-width="1.5"/>
      <text x="180" y="244" fill="#a07850" font-size="9" text-anchor="middle">広縁（南面・1,200mm深）</text>
      <rect x="20" y="40" width="180" height="180" fill="rgba(168,96,96,.04)" stroke="#a86060" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="110" y="115" fill="#ddd" font-size="13" text-anchor="middle">LDK</text>
      <text x="110" y="132" fill="#666" font-size="9" text-anchor="middle">22 m² · 大開口W4.5m</text>
      <text x="110" y="150" fill="#666" font-size="8" text-anchor="middle">アイランドキッチン(低め)</text>
      <rect x="200" y="40" width="100" height="100" fill="rgba(168,96,96,.06)" stroke="#a86060" stroke-width="1.5"/>
      <text x="250" y="80" fill="#ddd" font-size="11" text-anchor="middle">主寝室</text>
      <text x="250" y="95" fill="#666" font-size="8" text-anchor="middle">15 m²</text>
      <text x="250" y="115" fill="#a86060" font-size="7" text-anchor="middle">→ WC隣接</text>
      <rect x="200" y="140" width="100" height="80" fill="rgba(70,184,208,.06)" stroke="#4ab8d0" stroke-width="1.5"/>
      <text x="250" y="178" fill="#4ab8d0" font-size="10" text-anchor="middle">書斎/趣味室</text>
      <text x="250" y="194" fill="#666" font-size="8" text-anchor="middle">8 m²</text>
      <rect x="300" y="40" width="40" height="80" fill="rgba(80,184,160,.08)" stroke="#50b8a0" stroke-width="1.5"/>
      <text x="320" y="74" fill="#50b8a0" font-size="8" text-anchor="middle">UB</text>
      <text x="320" y="86" fill="#666" font-size="6.5" text-anchor="middle">1620</text>
      <text x="320" y="100" fill="#666" font-size="6" text-anchor="middle">バリア</text>
      <text x="320" y="110" fill="#666" font-size="6" text-anchor="middle">フリー</text>
      <rect x="300" y="120" width="40" height="50" fill="rgba(80,184,160,.06)" stroke="#50b8a0" stroke-width="1.5"/>
      <text x="320" y="146" fill="#50b8a0" font-size="8" text-anchor="middle">WC①</text>
      <text x="320" y="158" fill="#666" font-size="6" text-anchor="middle">寝室隣接</text>
      <rect x="300" y="170" width="40" height="50" fill="rgba(80,184,160,.06)" stroke="#50b8a0" stroke-width="1.5"/>
      <text x="320" y="196" fill="#50b8a0" font-size="8" text-anchor="middle">WC②</text>
      <text x="320" y="208" fill="#666" font-size="6" text-anchor="middle">玄関側</text>
      <line x1="200" y1="80" x2="200" y2="120" stroke="#a86060" stroke-width="2" stroke-dasharray="2,2"/>
      <text x="195" y="100" fill="#a86060" font-size="6" text-anchor="end">引戸</text>
      <line x1="200" y1="160" x2="200" y2="200" stroke="#a86060" stroke-width="2" stroke-dasharray="2,2"/>
      <text x="195" y="180" fill="#a86060" font-size="6" text-anchor="end">引戸</text>
      <polygon points="340,180 360,200 340,220" fill="rgba(168,120,96,.2)" stroke="#a07850" stroke-width="1.5"/>
      <text x="354" y="206" fill="#a07850" font-size="6" text-anchor="middle">玄関</text>
      <text x="354" y="216" fill="#a07850" font-size="6" text-anchor="middle">スロープ</text>
      <rect x="40" y="216" width="120" height="6" fill="#4ab8d0" opacity=".7"/>
      <text x="100" y="212" fill="#4ab8d0" font-size="7" text-anchor="middle">大開口 W4,500</text>
      <line x1="20" y1="275" x2="340" y2="275" stroke="#333" stroke-width="1"/>
      <text x="20" y="288" fill="#666" font-size="7.5">9,000 mm</text>
    </svg>`,
    elevSvg: `<svg viewBox="0 0 360 220" style="width:100%;background:#050505;display:block">
      <text x="20" y="14" fill="#a86060" font-size="9" font-weight="bold">ROOTS — 南立面（平屋・準防火対応・バリアフリー）</text>
      <line x1="10" y1="190" x2="350" y2="190" stroke="#333" stroke-width="1.5" stroke-dasharray="4,3"/>
      <rect x="40" y="80" width="280" height="110" fill="rgba(28,30,32,.95)" stroke="#666" stroke-width="2"/>
      <polygon points="30,80 180,40 330,80" fill="rgba(26,26,26,.98)" stroke="#a86060" stroke-width="2"/>
      <line x1="30" y1="80" x2="330" y2="80" stroke="#a07850" stroke-width="3"/>
      <text x="180" y="76" fill="#a07850" font-size="6.5" text-anchor="middle">広縁の深い軒（夏の日射遮蔽）</text>
      <rect x="60" y="100" width="160" height="80" fill="rgba(70,184,208,.1)" stroke="#4ab8d0" stroke-width="2"/>
      <line x1="140" y1="100" x2="140" y2="180" stroke="#4ab8d0" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="140" y="146" fill="#4ab8d0" font-size="8" text-anchor="middle">大開口 W4.5m × H2.2m</text>
      <rect x="240" y="100" width="36" height="16" fill="rgba(70,184,208,.08)" stroke="#4ab8d0" stroke-width="1"/>
      <text x="258" y="111" fill="#4ab8d0" font-size="6" text-anchor="middle">寝室窓</text>
      <rect x="240" y="120" width="40" height="60" fill="rgba(55,36,18,.4)" stroke="#888" stroke-width="1.5"/>
      <text x="260" y="156" fill="#888" font-size="7" text-anchor="middle">玄関</text>
      <polygon points="280,180 320,180 320,190 280,190" fill="rgba(168,120,96,.4)" stroke="#a07850" stroke-width="1.5"/>
      <text x="300" y="200" fill="#a07850" font-size="6.5" text-anchor="middle">スロープ（勾配1/15）</text>
      <rect x="120" y="50" width="120" height="20" fill="rgba(168,96,96,.15)" stroke="rgba(168,96,96,.3)" stroke-width="1" rx="2"/>
      <text x="180" y="64" fill="rgba(168,96,96,.7)" font-size="7" text-anchor="middle">太陽光4kW（系統連系）</text>
      <text x="20" y="146" fill="#666" font-size="7" text-anchor="middle">1F</text>
      <line x1="40" y1="200" x2="320" y2="200" stroke="#444" stroke-width="1"/>
      <text x="180" y="214" fill="#555" font-size="8.5" text-anchor="middle">9,000 mm（4,000mm高・平屋）</text>
    </svg>`,
  },
];

// アップグレードオプションも build-data.js から流用したいので空配列で初期化（実際は build-data.js をロードしないため必須）
window.BUILD_UPGRADES = [];
window.BUILD_COSTDOWNS = [];
