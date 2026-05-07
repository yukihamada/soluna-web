// ── SOLUNA BUILD MANUAL DATA ───────────────────────────────────────────────
// 910mmモジュールシステムに基づく日本伝統軸組工法の木材・金物・工具データ
// 各プランID: mini / standard / large / xl / villa / grand

window.MANUAL = {

  // ===== MINI (9.9m²) 3,640×2,730mm =====
  mini: {
    footprint: [3640, 2730],
    wallH: 2800,
    ridgeH: 3800,
    roofPitch: "5/10（約27°）",
    structure: "木造軸組工法 + SIPsパネル（壁・屋根）910×1820mm 単層",
    // 柱位置: 3×2グリッド、1820mmピッチ (0,0)基点
    posts: [
      [0, 0], [1820, 0], [3640, 0],
      [0, 2730], [1820, 2730], [3640, 2730]
    ],
    lumber: [
      // 土台（ヒノキ KD 防腐処理）
      { code:"T1", part:"土台（桁行）", species:"ヒノキ KD", section:"105×105", length:3640, qty:2, note:"防腐処理済み・アンカーボルト穴加工" },
      { code:"T2", part:"土台（梁間）", species:"ヒノキ KD", section:"105×105", length:2730, qty:2, note:"防腐処理済み" },
      { code:"T3", part:"大引",         species:"杉 KD",   section:"105×105", length:1820, qty:2, note:"束石に載る" },

      // 柱
      { code:"C1", part:"隅柱（4本）",  species:"杉 KD",   section:"105×105", length:2800, qty:4, note:"面取り加工" },
      { code:"C2", part:"管柱",         species:"杉 KD",   section:"105×105", length:2800, qty:2, note:"中間柱" },

      // 梁・桁
      { code:"B1", part:"軒桁（桁行）", species:"杉 KD",   section:"105×105", length:3640, qty:2, note:"柱頭に乗る" },
      { code:"B2", part:"梁（梁間）",   species:"杉 KD",   section:"105×210", length:2730, qty:2, note:"スパン2.7m対応" },
      { code:"B3", part:"ロフト梁",     species:"杉 KD",   section:"105×210", length:2730, qty:1, note:"FL+1400mm位置" },
      { code:"B4", part:"棟木",         species:"杉 KD",   section:"105×105", length:3640, qty:1, note:"頂部" },

      // 垂木（455mmピッチ、棟木長3640mm → 約8本/面×2面=16本）
      { code:"R1", part:"垂木",         species:"杉 KD",   section:"45×105",  length:1550, qty:16, note:"@455mmピッチ 勾配なり" },

      // 間柱（455mmピッチ、周長(3640+2730)×2=12740mm ÷ 455 ≒ 28本 − 開口部考慮で20本）
      { code:"S1", part:"間柱",         species:"杉 KD",   section:"45×105",  length:2660, qty:20, note:"@455mmピッチ 開口部除く" },

      // 根太（303mmピッチ、奥行2730mm ÷ 303 ≒ 9本）
      { code:"F1", part:"根太",         species:"杉 KD",   section:"45×105",  length:2730, qty:9, note:"@303mmピッチ" },

      // 合板類（枚数計算）
      { code:"P1", part:"床合板（構造用28mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:6,  note:"28mm厚・剛床" },
      { code:"P2", part:"壁合板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:14, note:"12mm厚・面材耐力壁" },
      { code:"P3", part:"野地板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:8,  note:"12mm厚・屋根下地" },
      { code:"L1", part:"ロフト床（パーティクルボード18mm）", species:"パーティクルボード", section:"910×1820（枚）", length:0, qty:3, note:"ロフト床" },
    ],
    hardware: [
      { name:"ホールダウン金物 HD-B25",  qty:"4個",    note:"隅柱足元・基礎固定" },
      { name:"羽子板ボルト M12",         qty:"8セット", note:"梁・桁接合部" },
      { name:"アンカーボルト M12×500",   qty:"8本",    note:"土台固定" },
      { name:"柱脚金物 KJ-R",            qty:"6個",    note:"柱脚固定" },
      { name:"短冊金物・山形プレート",   qty:"20枚",   note:"各接合部補強" },
      { name:"垂木掛け金物",             qty:"16個",   note:"垂木端部固定" },
      { name:"コーススレッド 65mm",      qty:"500本",  note:"合板固定" },
      { name:"コーススレッド 90mm",      qty:"300本",  note:"構造材接合" },
      { name:"防水透湿シート（タイベック）", qty:"1巻", note:"壁下地・外気遮断" },
      { name:"ゴムアスルーフィング 940×20m", qty:"1本", note:"屋根防水下地" },
      { name:"気密テープ 75mm×50m",     qty:"3巻",    note:"合板継ぎ目気密処理" },
      { name:"アスファルト系防湿シート", qty:"1巻",    note:"床下防湿" },
    ],
    tools: [
      { name:"丸ノコ（165mm）",      note:"木材カット全般" },
      { name:"電動ドリルドライバー", note:"下穴・コーススレッド" },
      { name:"インパクトドライバー", note:"構造材締結" },
      { name:"レーザー水平器",       note:"柱・土台の水平・垂直出し" },
      { name:"墨壺・墨さし",         note:"墨出し・位置決め" },
      { name:"大工さし金（スコヤ）", note:"直角確認" },
      { name:"ジグソー",             note:"開口部切抜き" },
      { name:"チェーンソー（任意）", note:"木材粗加工" },
      { name:"仮設足場（単管）",     note:"棟上げ時・高所作業" },
      { name:"チェーンブロック 1t", note:"梁の吊り上げ" },
      { name:"水糸・水杭",           note:"基礎位置出し" },
      { name:"コンベックス 5.5m",    note:"計測" },
      { name:"金づち・ハンマー",     note:"ピン打ち・仮組み" },
      { name:"仮筋交い材",           note:"棟上げ時倒壊防止" },
    ]
  },

  // ===== STANDARD (24.8m²) 5,460×4,550mm =====
  standard: {
    footprint: [5460, 4550],
    wallH: 2800,
    ridgeH: 3800,
    roofPitch: "5/10（約27°）",
    structure: "木造軸組工法 + SIPsパネル",
    // 柱位置: 4×3グリッド、1820mmピッチ
    posts: [
      [0, 0],    [1820, 0],    [3640, 0],    [5460, 0],
      [0, 2275], [1820, 2275], [3640, 2275], [5460, 2275],
      [0, 4550], [1820, 4550], [3640, 4550], [5460, 4550],
    ],
    lumber: [
      // 土台
      { code:"T1", part:"土台（桁行）", species:"ヒノキ KD", section:"105×105", length:5460, qty:2, note:"防腐処理・アンカー穴" },
      { code:"T2", part:"土台（梁間）", species:"ヒノキ KD", section:"105×105", length:4550, qty:2, note:"防腐処理" },
      { code:"T3", part:"大引",         species:"杉 KD",   section:"105×105", length:4550, qty:4, note:"@1365mmピッチ" },

      // 柱
      { code:"C1", part:"隅柱（4本）",  species:"杉 KD",   section:"105×105", length:2800, qty:4, note:"面取り加工" },
      { code:"C2", part:"管柱",         species:"杉 KD",   section:"105×105", length:2800, qty:8, note:"中間柱" },

      // 梁・桁
      { code:"B1", part:"軒桁（桁行）", species:"杉 KD",   section:"105×105", length:5460, qty:2, note:"" },
      { code:"B2", part:"梁（梁間大梁）", species:"杉 KD", section:"105×210", length:4550, qty:3, note:"スパン4.5m対応" },
      { code:"B3", part:"棟木",         species:"杉 KD",   section:"105×105", length:5460, qty:1, note:"" },
      { code:"B4", part:"母屋",         species:"杉 KD",   section:"105×105", length:5460, qty:2, note:"中間母屋 各面1本" },

      // 垂木（455mmピッチ、棟木長5460mm → 約12本/面×2面=24本）
      { code:"R1", part:"垂木",         species:"杉 KD",   section:"45×105",  length:1800, qty:24, note:"@455mmピッチ" },

      // 間柱（周長(5460+4550)×2=20020mm ÷ 455 ≒ 44 − 開口部で34本）
      { code:"S1", part:"間柱",         species:"杉 KD",   section:"45×105",  length:2660, qty:34, note:"@455mmピッチ" },

      // 根太（303mmピッチ、奥行4550÷303≒15本）
      { code:"F1", part:"根太",         species:"杉 KD",   section:"45×105",  length:4550, qty:15, note:"@303mmピッチ" },

      // 合板類（面積: 5.46×4.55=24.8m²）
      { code:"P1", part:"床合板（構造用28mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:18, note:"28mm厚・剛床" },
      { code:"P2", part:"壁合板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:36, note:"12mm厚・面材耐力壁" },
      { code:"P3", part:"野地板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:20, note:"SIPs屋根下地" },
    ],
    hardware: [
      { name:"ホールダウン金物 HD-B25",      qty:"8個",    note:"隅柱・主要柱足元" },
      { name:"羽子板ボルト M12",             qty:"20セット", note:"梁・桁接合部全数" },
      { name:"アンカーボルト M12×500",       qty:"14本",   note:"土台固定" },
      { name:"柱脚金物 KJ-R",                qty:"12個",   note:"全柱脚" },
      { name:"短冊金物・山形プレート",       qty:"40枚",   note:"各接合補強" },
      { name:"垂木掛け金物",                 qty:"24個",   note:"垂木端部" },
      { name:"コーススレッド 65mm",          qty:"1000本", note:"合板・内装固定" },
      { name:"コーススレッド 90mm",          qty:"500本",  note:"構造材" },
      { name:"防水透湿シート（タイベック シルバー）", qty:"1巻", note:"外壁下地" },
      { name:"ゴムアスルーフィング",         qty:"2本",    note:"屋根防水" },
      { name:"気密テープ 75mm×50m",         qty:"5巻",    note:"合板継ぎ目・開口部" },
      { name:"先張り気密シート",             qty:"1巻",    note:"窓・ドア先張り処理" },
    ],
    tools: [
      { name:"丸ノコ（165mm）",      note:"木材カット全般" },
      { name:"電動ドリルドライバー", note:"下穴・コーススレッド" },
      { name:"インパクトドライバー", note:"構造材締結" },
      { name:"レーザー水平器",       note:"柱・土台の水平・垂直出し" },
      { name:"墨壺・墨さし",         note:"墨出し・位置決め" },
      { name:"大工さし金（スコヤ）", note:"直角確認" },
      { name:"ジグソー",             note:"開口部切抜き" },
      { name:"仮設足場（単管）",     note:"棟上げ・外壁高所作業" },
      { name:"チェーンブロック 1t", note:"梁の吊り上げ" },
      { name:"水糸・水杭",           note:"基礎位置出し" },
      { name:"コンベックス 5.5m",    note:"計測全般" },
      { name:"気密測定器（C値）",    note:"気密検査（外注可）" },
      { name:"コーキングガン",       note:"SIPs継ぎ目・開口部シール" },
      { name:"仮筋交い材",           note:"棟上げ時倒壊防止" },
      { name:"ミニユンボ（レンタル）", note:"基礎掘削効率化" },
    ]
  },

  // ===== LARGE (39.7m²) 7,280×5,460mm =====
  large: {
    footprint: [7280, 5460],
    wallH: 2800,
    ridgeH: 3800,
    roofPitch: "5/10（約27°）",
    structure: "木造軸組工法 + SIPsパネル",
    // 柱位置: 5×3グリッド、1820mmピッチ
    posts: [
      [0, 0],    [1820, 0],    [3640, 0],    [5460, 0],    [7280, 0],
      [0, 2730], [1820, 2730], [3640, 2730], [5460, 2730], [7280, 2730],
      [0, 5460], [1820, 5460], [3640, 5460], [5460, 5460], [7280, 5460],
    ],
    lumber: [
      // 土台
      { code:"T1", part:"土台（桁行）", species:"ヒノキ KD", section:"105×105", length:7280, qty:2, note:"防腐処理・アンカー穴" },
      { code:"T2", part:"土台（梁間）", species:"ヒノキ KD", section:"105×105", length:5460, qty:2, note:"防腐処理" },
      { code:"T3", part:"大引",         species:"杉 KD",   section:"105×105", length:5460, qty:5, note:"@1820mmピッチ" },

      // 柱
      { code:"C1", part:"隅柱（4本）",  species:"杉 KD",   section:"105×105", length:2800, qty:4,  note:"面取り加工" },
      { code:"C2", part:"管柱",         species:"杉 KD",   section:"105×105", length:2800, qty:11, note:"中間柱" },

      // 梁・桁（スパン5.46mは105×150に増強）
      { code:"B1", part:"軒桁（桁行）", species:"杉 KD",   section:"105×150", length:7280, qty:2, note:"大スパン対応" },
      { code:"B2", part:"梁（大梁）",   species:"杉 KD",   section:"105×240", length:5460, qty:4, note:"スパン5.46m対応・集成材可" },
      { code:"B3", part:"棟木",         species:"杉 KD",   section:"105×150", length:7280, qty:1, note:"" },
      { code:"B4", part:"母屋",         species:"杉 KD",   section:"105×105", length:7280, qty:2, note:"各面1本" },

      // 垂木（455mmピッチ、7280mm → 約16本/面×2面=32本）
      { code:"R1", part:"垂木",         species:"杉 KD",   section:"45×105",  length:1950, qty:32, note:"@455mmピッチ" },

      // 間柱（周長(7280+5460)×2=25480mm ÷ 455 ≒ 56 − 開口で44本）
      { code:"S1", part:"間柱",         species:"杉 KD",   section:"45×105",  length:2660, qty:44, note:"@455mmピッチ 開口除く" },

      // 根太（303mmピッチ、5460÷303≒18本）
      { code:"F1", part:"根太",         species:"杉 KD",   section:"45×105",  length:5460, qty:18, note:"@303mmピッチ" },

      // 合板類（7.28×5.46=39.7m²）
      { code:"P1", part:"床合板（構造用28mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:28, note:"28mm剛床" },
      { code:"P2", part:"壁合板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:56, note:"面材耐力壁" },
      { code:"P3", part:"野地板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:30, note:"屋根下地" },
    ],
    hardware: [
      { name:"ホールダウン金物 HD-B25",      qty:"8個",    note:"隅柱・主要柱足元" },
      { name:"羽子板ボルト M12",             qty:"30セット", note:"梁・桁接合部全数" },
      { name:"アンカーボルト M12×500",       qty:"18本",   note:"土台固定" },
      { name:"柱脚金物 KJ-R",                qty:"15個",   note:"全柱脚" },
      { name:"短冊金物・山形プレート",       qty:"60枚",   note:"各接合補強" },
      { name:"垂木掛け金物",                 qty:"32個",   note:"垂木端部" },
      { name:"梁受け金物（ビス止め式）",     qty:"20個",   note:"梁端部" },
      { name:"コーススレッド 65mm",          qty:"1500本", note:"合板固定" },
      { name:"コーススレッド 90mm",          qty:"800本",  note:"構造材" },
      { name:"防水透湿シート（タイベック シルバー）", qty:"2巻", note:"外壁下地" },
      { name:"ゴムアスルーフィング",         qty:"3本",    note:"屋根防水" },
      { name:"気密テープ 75mm×50m",         qty:"8巻",    note:"合板継ぎ目・開口部" },
    ],
    tools: [
      { name:"丸ノコ（165mm）",         note:"木材カット全般" },
      { name:"電動ドリルドライバー",    note:"下穴・コーススレッド" },
      { name:"インパクトドライバー",    note:"構造材締結" },
      { name:"レーザー水平器",          note:"柱・土台の水平・垂直出し" },
      { name:"墨壺・墨さし",            note:"墨出し" },
      { name:"ジグソー",                note:"開口部切抜き" },
      { name:"仮設足場（枠組み足場）",  note:"外壁・屋根高所作業" },
      { name:"チェーンブロック 2t",    note:"大梁吊り上げ" },
      { name:"ミニユンボ（レンタル）",  note:"基礎掘削" },
      { name:"気密測定器",              note:"C値検査" },
      { name:"コーキングガン",          note:"各種シール" },
      { name:"仮筋交い材",              note:"棟上げ時" },
    ]
  },

  // ===== XL (66m²) 9,100×7,280mm =====
  xl: {
    footprint: [9100, 7280],
    wallH: 2800,
    ridgeH: 3800,
    roofPitch: "5/10（約27°）",
    structure: "木造軸組工法 + SIPsパネル",
    // 柱位置: 5×5グリッド（桁行4スパン×2275mm, 梁間4スパン×1820mm）
    posts: [
      [0, 0],    [2275, 0],    [4550, 0],    [6825, 0],    [9100, 0],
      [0, 1820], [2275, 1820], [4550, 1820], [6825, 1820], [9100, 1820],
      [0, 3640], [2275, 3640], [4550, 3640], [6825, 3640], [9100, 3640],
      [0, 5460], [2275, 5460], [4550, 5460], [6825, 5460], [9100, 5460],
      [0, 7280], [2275, 7280], [4550, 7280], [6825, 7280], [9100, 7280],
    ],
    lumber: [
      // 土台
      { code:"T1", part:"土台（桁行）", species:"ヒノキ KD", section:"105×105", length:9100, qty:2, note:"防腐処理・アンカー穴" },
      { code:"T2", part:"土台（梁間）", species:"ヒノキ KD", section:"105×105", length:7280, qty:2, note:"防腐処理" },
      { code:"T3", part:"大引",         species:"杉 KD",   section:"105×105", length:7280, qty:6, note:"@1820mmピッチ（9100mm方向）" },

      // 柱（5×5=25本）
      { code:"C1", part:"隅柱（4本）",  species:"杉 KD",   section:"105×105", length:2800, qty:4,  note:"面取り加工" },
      { code:"C2", part:"管柱",         species:"杉 KD",   section:"105×105", length:2800, qty:21, note:"中間柱" },

      // 梁・桁（大スパン対応）
      { code:"B1", part:"軒桁（桁行）", species:"杉 KD",   section:"105×150", length:9100, qty:2, note:"分割継手可" },
      { code:"B2", part:"梁（大梁）",   species:"杉 KD",   section:"105×240", length:7280, qty:5, note:"スパン7.28m・集成材推奨" },
      { code:"B3", part:"棟木",         species:"杉 KD",   section:"105×150", length:9100, qty:1, note:"" },
      { code:"B4", part:"母屋",         species:"杉 KD",   section:"105×105", length:9100, qty:2, note:"各面1本" },
      { code:"B5", part:"小屋束",       species:"杉 KD",   section:"105×105", length:500,  qty:6, note:"棟束・母屋束" },

      // 垂木（455mmピッチ、9100mm → 約20本/面×2面=40本）
      { code:"R1", part:"垂木",         species:"杉 KD",   section:"45×105",  length:2450, qty:40, note:"@455mmピッチ（7280深さ対応）" },

      // 間柱（周長(9100+7280)×2=32760mm ÷ 455 ≒ 72 − 開口で58本）
      { code:"S1", part:"間柱",         species:"杉 KD",   section:"45×105",  length:2660, qty:58, note:"@455mmピッチ 開口除く" },

      // 根太（364mmピッチ、9100mm方向: 9100/364≒25本）
      { code:"F1", part:"根太",         species:"杉 KD",   section:"45×105",  length:7280, qty:25, note:"@364mmピッチ" },

      // 合板類（9.1×7.28=66m²）
      { code:"P1", part:"床合板（構造用28mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:40, note:"28mm剛床" },
      { code:"P2", part:"壁合板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:86, note:"面材耐力壁（周長32760mm）" },
      { code:"P3", part:"野地板（構造用12mm）",  species:"構造用合板", section:"910×1820（枚）", length:0, qty:44, note:"屋根下地" },
    ],
    hardware: [
      { name:"ホールダウン金物 HD-B25",      qty:"10個",   note:"隅柱・主要柱足元" },
      { name:"羽子板ボルト M12",             qty:"40セット", note:"全梁・桁接合" },
      { name:"アンカーボルト M12×500",       qty:"24本",   note:"土台固定" },
      { name:"柱脚金物 KJ-R",                qty:"20個",   note:"全柱脚" },
      { name:"短冊金物・山形プレート",       qty:"80枚",   note:"各接合補強" },
      { name:"垂木掛け金物",                 qty:"40個",   note:"垂木端部" },
      { name:"梁受け金物（ビス止め式）",     qty:"30個",   note:"梁端部" },
      { name:"コーススレッド 65mm",          qty:"2000本", note:"合板固定" },
      { name:"コーススレッド 90mm",          qty:"1000本", note:"構造材" },
      { name:"防水透湿シート（タイベック シルバー）", qty:"2巻", note:"外壁下地" },
      { name:"ゴムアスルーフィング",         qty:"4本",    note:"屋根防水" },
      { name:"気密テープ 75mm×50m",         qty:"10巻",   note:"合板継ぎ目・開口部" },
      { name:"先張り気密シート",             qty:"2巻",    note:"窓・ドア先張り" },
    ],
    tools: [
      { name:"丸ノコ（165mm）",         note:"木材カット全般" },
      { name:"電動ドリルドライバー",    note:"下穴・コーススレッド" },
      { name:"インパクトドライバー",    note:"構造材締結" },
      { name:"レーザー水平器",          note:"柱・土台の水平・垂直" },
      { name:"墨壺・墨さし",            note:"墨出し" },
      { name:"ジグソー",                note:"開口部切抜き" },
      { name:"仮設足場（枠組み足場）",  note:"外壁・屋根高所" },
      { name:"移動式クレーン（ユニック）", note:"大梁・SIPsパネル搬入" },
      { name:"ミニユンボ（レンタル）",  note:"基礎掘削" },
      { name:"気密測定器",              note:"C値検査" },
      { name:"コーキングガン",          note:"各種シール" },
      { name:"レベル（光波測量機）",    note:"大規模基礎位置出し" },
    ]
  },

  // ===== VILLA (116m²) 9,100×6,370mm 2階建て =====
  villa: {
    footprint: [9100, 6370],
    wallH: 2800,
    ridgeH: 6800,
    roofPitch: "5/10（約27°）",
    structure: "木造軸組工法 + SIPsパネル 2階建て（要構造設計士確認）",
    // 柱位置: 5×4グリッド（XLと同フットプリント、2階建て）
    posts: [
      [0, 0],    [2275, 0],    [4550, 0],    [6825, 0],    [9100, 0],
      [0, 2123], [2275, 2123], [4550, 2123], [6825, 2123], [9100, 2123],
      [0, 4247], [2275, 4247], [4550, 4247], [6825, 4247], [9100, 4247],
      [0, 6370], [2275, 6370], [4550, 6370], [6825, 6370], [9100, 6370],
    ],
    lumber: [
      { code:"T1", part:"土台（桁行）", species:"ヒノキ KD", section:"105×105", length:9100, qty:2, note:"防腐処理・アンカー穴加工" },
      { code:"T2", part:"土台（梁間）", species:"ヒノキ KD", section:"105×105", length:6370, qty:2, note:"防腐処理" },
      { code:"T3", part:"大引",         species:"杉 KD",   section:"105×105", length:6370, qty:6, note:"@1820mmピッチ" },
      { code:"C1", part:"1F 隅柱・管柱", species:"杉 KD",  section:"105×105", length:2800, qty:20, note:"1F全柱" },
      { code:"C2", part:"2F 柱",        species:"杉 KD",   section:"105×105", length:2800, qty:20, note:"2F全柱（同グリッド）" },
      { code:"B1", part:"軒桁（桁行）", species:"杉 KD",   section:"105×150", length:9100, qty:2, note:"分割継手可" },
      { code:"B2", part:"1F→2F 床梁（大梁）", species:"集成材", section:"105×300", length:6370, qty:5, note:"2階床を受ける主要梁" },
      { code:"B3", part:"2F 軒桁",      species:"杉 KD",   section:"105×150", length:9100, qty:2, note:"2F外壁天端" },
      { code:"B4", part:"棟木",         species:"杉 KD",   section:"105×150", length:9100, qty:1, note:"" },
      { code:"B5", part:"母屋",         species:"杉 KD",   section:"105×105", length:9100, qty:2, note:"各面1本" },
      { code:"R1", part:"垂木",         species:"杉 KD",   section:"45×105",  length:2150, qty:40, note:"@455mmピッチ" },
      { code:"S1", part:"間柱（1F）",   species:"杉 KD",   section:"45×105",  length:2660, qty:54, note:"@455mmピッチ 開口除く" },
      { code:"S2", part:"間柱（2F）",   species:"杉 KD",   section:"45×105",  length:2660, qty:54, note:"@455mmピッチ 開口除く" },
      { code:"F1", part:"根太（1F）",   species:"杉 KD",   section:"45×105",  length:6370, qty:25, note:"@364mmピッチ" },
      { code:"F2", part:"根太（2F）",   species:"杉 KD",   section:"45×105",  length:6370, qty:25, note:"@364mmピッチ" },
      { code:"P1", part:"床合板（28mm）1F+2F", species:"構造用合板", section:"910×1820（枚）", length:0, qty:70, note:"28mm剛床（2層分）" },
      { code:"P2", part:"壁合板（12mm）", species:"構造用合板", section:"910×1820（枚）", length:0, qty:160, note:"面材耐力壁 1F+2F" },
      { code:"P3", part:"野地板（12mm）", species:"構造用合板", section:"910×1820（枚）", length:0, qty:44, note:"屋根下地" },
    ],
    hardware: [
      { name:"ホールダウン金物 HD-B25", qty:"16個",   note:"要構造設計士確認" },
      { name:"羽子板ボルト M12",        qty:"60セット", note:"全梁・桁接合" },
      { name:"アンカーボルト M16×600",  qty:"36本",   note:"大規模基礎固定" },
      { name:"柱脚金物（大型）",        qty:"30個",   note:"全柱脚" },
      { name:"コーススレッド 65mm",     qty:"4000本", note:"合板固定" },
      { name:"コーススレッド 90mm",     qty:"2000本", note:"構造材" },
      { name:"防水透湿シート",          qty:"4巻",    note:"外壁下地" },
      { name:"ゴムアスルーフィング",    qty:"6本",    note:"屋根防水" },
      { name:"気密テープ 75mm×50m",    qty:"16巻",   note:"気密処理" },
    ],
    tools: [
      { name:"丸ノコ（165mm）",          note:"木材カット" },
      { name:"インパクトドライバー",     note:"締結全般" },
      { name:"レーザー水平器（長距離）", note:"大規模墨出し" },
      { name:"枠組み足場（リース）",     note:"全周設置" },
      { name:"ユニッククレーン",         note:"大梁・重材搬入" },
      { name:"ミニユンボ",               note:"基礎掘削" },
      { name:"気密測定器",               note:"C値検査" },
      { name:"※要構造設計士監修",       note:"構造・金物計画は必ず設計士確認" },
    ]
  },

  // ===== GRAND (199m²) 13,650×7,280mm 2階建て =====
  grand: {
    footprint: [13650, 7280],
    wallH: 3000,
    ridgeH: 7200,
    roofPitch: "5/10（約27°）",
    structure: "木造軸組工法 + SIPsパネル 2階建て（建築士監修・確認申請必須）",
    // 柱位置: 6×5グリッド（桁行5スパン×2730mm, 梁間4スパン×1820mm）
    posts: [
      [0, 0],    [2730, 0],    [5460, 0],    [8190, 0],    [10920, 0],   [13650, 0],
      [0, 1820], [2730, 1820], [5460, 1820], [8190, 1820], [10920, 1820],[13650, 1820],
      [0, 3640], [2730, 3640], [5460, 3640], [8190, 3640], [10920, 3640],[13650, 3640],
      [0, 5460], [2730, 5460], [5460, 5460], [8190, 5460], [10920, 5460],[13650, 5460],
      [0, 7280], [2730, 7280], [5460, 7280], [8190, 7280], [10920, 7280],[13650, 7280],
    ],
    lumber: [
      { code:"T1", part:"土台（桁行）", species:"ヒノキ KD", section:"105×105", length:6825,  qty:4, note:"継手あり・防腐処理・確認申請必須" },
      { code:"T2", part:"土台（梁間）", species:"ヒノキ KD", section:"105×105", length:7280,  qty:2, note:"防腐処理" },
      { code:"T3", part:"大引",         species:"杉 KD",   section:"105×105", length:7280,  qty:10, note:"@1365mmピッチ（13650÷10）" },
      { code:"C1", part:"1F 柱",        species:"杉 KD",   section:"120×120", length:3000,  qty:30, note:"大断面・要構造確認" },
      { code:"C2", part:"2F 柱",        species:"杉 KD",   section:"120×120", length:3000,  qty:30, note:"2F全柱（同グリッド）" },
      { code:"B1", part:"軒桁（桁行）", species:"集成材",  section:"105×150", length:6825,  qty:4, note:"継手位置設計士指示" },
      { code:"B2", part:"1F→2F 床梁（大梁）", species:"集成材", section:"120×360", length:7280, qty:6, note:"2階床を受ける主要梁・大スパン対応" },
      { code:"B3", part:"2F 軒桁",      species:"集成材",  section:"105×150", length:6825,  qty:4, note:"2F外壁天端・継手あり" },
      { code:"B4", part:"棟木",         species:"集成材",  section:"105×150", length:6825,  qty:2, note:"継手あり" },
      { code:"R1", part:"垂木",         species:"杉 KD",   section:"45×105",  length:2800,  qty:80, note:"@455mmピッチ（13650mm棟）" },
      { code:"S1", part:"間柱（1F）",   species:"杉 KD",   section:"45×105",  length:2860,  qty:100, note:"@455mmピッチ 開口除く" },
      { code:"S2", part:"間柱（2F）",   species:"杉 KD",   section:"45×105",  length:2860,  qty:100, note:"@455mmピッチ 開口除く" },
      { code:"F1", part:"根太（1F）",   species:"杉 KD",   section:"45×105",  length:7280,  qty:38, note:"@364mmピッチ（13650÷364≒37+1）" },
      { code:"F2", part:"根太（2F）",   species:"杉 KD",   section:"45×105",  length:7280,  qty:38, note:"@364mmピッチ" },
      { code:"P1", part:"床合板（28mm）1F+2F", species:"構造用合板", section:"910×1820（枚）", length:0, qty:120, note:"28mm剛床（2層分 199m²）" },
      { code:"P2", part:"壁合板（12mm）", species:"構造用合板", section:"910×1820（枚）", length:0, qty:220, note:"面材耐力壁 1F+2F全周" },
      { code:"P3", part:"野地板（12mm）", species:"構造用合板", section:"910×1820（枚）", length:0, qty:60, note:"屋根下地（13650×7280）" },
    ],
    hardware: [
      { name:"ホールダウン金物 HD-N25", qty:"16個",   note:"大断面対応型・要設計士指示" },
      { name:"羽子板ボルト M16",        qty:"80セット", note:"全梁・桁接合" },
      { name:"アンカーボルト M16×600",  qty:"40本",   note:"布基礎・べた基礎固定" },
      { name:"柱脚金物（大型・耐震）",  qty:"30個",   note:"全柱脚・耐震等級3対応" },
      { name:"コーススレッド 65mm",     qty:"8000本", note:"合板固定" },
      { name:"コーススレッド 90mm",     qty:"4000本", note:"構造材" },
      { name:"防水透湿シート",          qty:"8巻",    note:"外壁下地" },
      { name:"ゴムアスルーフィング",    qty:"10本",   note:"屋根防水" },
      { name:"気密テープ 75mm×50m",    qty:"24巻",   note:"気密処理全周" },
      { name:"先張り気密シート",        qty:"4巻",    note:"開口部先張り" },
    ],
    tools: [
      { name:"丸ノコ（190mm大径）",     note:"厚物・大断面カット" },
      { name:"インパクトドライバー（2台）", note:"作業効率化" },
      { name:"光波測量機（トータルステーション）", note:"大規模建物の位置精度" },
      { name:"枠組み足場（全周リース）", note:"外壁・屋根全周" },
      { name:"ラフタークレーン 25t",    note:"大梁・パネル一括搬入" },
      { name:"ミニユンボ＋ダンプ",      note:"掘削・残土処理" },
      { name:"気密測定器",              note:"C値検査（第三者機関推奨）" },
      { name:"鉄骨足場組立士（外注）",  note:"大規模足場は専門業者へ" },
      { name:"※確認申請必須",           note:"建築士への設計委託・行政申請が必要" },
    ]
  },

}; // end window.MANUAL
