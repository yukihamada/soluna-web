"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type TestStatus = "replied" | "awaiting" | "pending" | "scheduled" | "done";
const STATUS: Record<TestStatus, { label: string; color: string }> = {
  replied:   { label: "返信済み",   color: "#4ade80" },
  awaiting:  { label: "返信待ち",   color: "#f59e0b" },
  pending:   { label: "未着手",     color: "rgba(255,255,255,0.35)" },
  scheduled: { label: "日程確定",   color: "#60a5fa" },
  done:      { label: "完了",       color: "#a78bfa" },
};

type EmailEvent = { date: string; from: string; subject: string; summary: string };

type TestItem = {
  id: string;
  category: string;
  name: string;
  method: string;
  contact: string;
  email: string;
  status: TestStatus;
  fee?: string;
  specimen?: string;
  schedule?: string;
  emails: EmailEvent[];
  nextAction: string;
};

type OutreachItem = {
  id: string;
  category: string;
  name: string;
  org: string;
  email: string;
  status: TestStatus;
  sentDate: string;
  subject: string;
  purpose: string;
  hasReply: boolean;
  replyNotes?: string;
  nextAction: string;
  emails?: EmailEvent[];
};

const TESTS: TestItem[] = [
  {
    id: "thermal",
    category: "菌糸体パネル",
    name: "熱伝導率試験",
    method: "JIS A 1412-2（HFM法）",
    contact: "山田優花@GBRC",
    email: "yu-yamada@gbrc.or.jp",
    status: "replied",
    fee: "¥110,000（税込、n=1）",
    specimen: "300×300×40mm",
    schedule: "2026年6月下旬〜7月上旬",
    emails: [
      { date: "2026-04-27 17:42", from: "濱田→GBRC玉井", subject: "【試験申込】菌糸体複合材料パネルの性能評価試験", summary: "4項目（吸音・熱伝導率・曲げ強度・難燃性）の試験を正式申込。試験体: 600×600×40mm、6月中旬完成予定。" },
      { date: "2026-04-27 18:36", from: "山田優花@GBRC→濱田", subject: "お問合せの試験につきまして（熱伝導率試験）", summary: "JIS A 1412-2 HFM法、23℃、300×300mm×厚10〜50mm、n=1、¥110,000税込。装置空きあり随時実施可。試験体データシート・依頼書・業務約款を添付。送付先: 吹田市藤白台5-8-1 環境試験室 山田宛。" },
      { date: "2026-04-27 22:36(JST)", from: "濱田→山田", subject: "Re: お問合せの試験につきまして（熱伝導率試験）", summary: "正式申込。材料: 菌糸体複合材料パネル（カワラタケ菌糸体＋おがくず70%＋籾殻30%）、300×300×40mm、ホウ砂防火処理＋亜麻仁油防水処理。6月中旬完成・6月下旬〜7月上旬希望。試験依頼書記入後返送予定。搬入方法確認依頼。" },
    ],
    nextAction: "▶ 山田様からの送付先・搬入方法の返信待ち。届いたら試験依頼書に記入してyu-yamada@gbrc.or.jpへ返送。",
  },
  {
    id: "bending",
    category: "菌糸体パネル",
    name: "曲げ強さ試験",
    method: "JIS A 5905（参考）",
    contact: "久保優樹@GBRC",
    email: "y-kubo@gbrc.or.jp",
    status: "replied",
    fee: "¥73,000税抜（n=3）/ ¥98,000税抜（n=6）",
    specimen: "600×600×40mm → 幅50mm×スパン600mm+50mm=650mm に切断",
    schedule: "2026年6月下旬〜7月上旬",
    emails: [
      { date: "2026-04-27 17:42", from: "濱田→GBRC玉井", subject: "【試験申込】菌糸体複合材料パネルの性能評価試験", summary: "4項目の試験を正式申込。" },
      { date: "2026-04-27 20:02", from: "久保優樹@GBRC→濱田", subject: "お問合せについて（曲げ強さ試験）", summary: "JIS A 5905参考。試験体: 幅50mm×スパン600mm（厚40mm×15）。費用: ¥73,000税抜（縦横各1体n=2）/ ¥98,000税抜（縦横各3体n=6）。n=3推奨。支持棒・加圧棒半径・載荷速度・スパンの指定が必要。送付先: 吹田市藤白台5-8-1 環境試験室 久保宛。依頼書・業務約款を添付。" },
      { date: "2026-04-27 22:36(JST)", from: "濱田→久保", subject: "Re: お問合せについて（曲げ強さ試験）", summary: "n=3（¥73,000税抜）で正式申込。材料: 菌糸体複合材料パネル、元パネル600×600×40mm → 指定寸法に切断納品。6月中旬完成・6月下旬〜7月上旬希望。正確な切断寸法（幅・長さ）・送付先・搬入方法の確認依頼。" },
    ],
    nextAction: "▶ 久保様からの切断寸法・送付先・搬入方法の返信待ち。届いたら試験依頼書に記入してy-kubo@gbrc.or.jpへ返送。",
  },
  {
    id: "sound",
    category: "菌糸体パネル",
    name: "吸音性能試験",
    method: "残響室法 または 管内法（NRC算出）",
    contact: "GBRC 玉井裕",
    email: "yu-tamai@gbrc.or.jp",
    status: "awaiting",
    fee: "TBD",
    specimen: "600×600×40mm",
    schedule: "2026年6月下旬〜7月上旬",
    emails: [
      { date: "2026-04-27 17:42", from: "濱田→GBRC玉井", subject: "【試験申込】菌糸体複合材料パネルの性能評価試験", summary: "吸音性能試験を申込項目に含めて送付。担当者からの返信待ち。" },
    ],
    nextAction: "担当者からの返信待ち。1週間以内に返信なければyu-tamai@gbrc.or.jpへ確認メール。",
  },
  {
    id: "fire",
    category: "菌糸体パネル",
    name: "難燃性試験",
    method: "コーンカロリーメーター法 または JIS A 1321",
    contact: "GBRC 玉井裕",
    email: "yu-tamai@gbrc.or.jp",
    status: "awaiting",
    fee: "TBD",
    specimen: "600×600×40mm",
    schedule: "2026年6月下旬〜7月上旬",
    emails: [
      { date: "2026-04-27 17:42", from: "濱田→GBRC玉井", subject: "【試験申込】菌糸体複合材料パネルの性能評価試験", summary: "難燃性試験を申込項目に含めて送付。担当者からの返信待ち。" },
    ],
    nextAction: "担当者からの返信待ち。1週間以内に返信なければyu-tamai@gbrc.or.jpへ確認メール。",
  },
  {
    id: "bamboo",
    category: "竹集成パネル",
    name: "壁倍率（構造）試験 / 大臣認定",
    method: "壁倍率評価（建築基準法 告示準拠）→ 大臣認定取得",
    contact: "今西達也@GBRC（TEL: 06-6834-7913）",
    email: "imanishi@gbrc.or.jp",
    status: "scheduled",
    fee: "TBD",
    specimen: "竹集成パネル（無接着剤熱圧縮） 12mm/18mm/24mm 写真・図面を事前送付",
    schedule: "5/7（木）13:00-15:00 Web打合せ確定",
    emails: [
      { date: "2026-04-23", from: "濱田→今西@GBRC", subject: "【性能評価相談】竹集成パネル（無接着剤熱圧縮）の試験・認定について", summary: "竹集成パネルの壁倍率試験・大臣認定について相談。仕様: 170℃×10MPa圧縮、引張強度140MPa、曲げ強度80MPa、12/18/24mm。" },
      { date: "2026-04-24 11:35", from: "今西@GBRC→濱田", subject: "RE: 竹材の構造試験について（壁倍率）", summary: "大臣認定取得に向けて前向きに検討。特殊材料のため性能協 木質構造部会の審議＋国交省判断が必要。製造品質・ばらつき・耐久性が評価ポイント。形状・構成がわかる写真・図面を求む。打合せ候補日を送るよう依頼。Web可。" },
      { date: "2026-04-25 17:43", from: "濱田→今西@GBRC", subject: "RE: 竹材の構造試験について（壁倍率）", summary: "写真・図面を添付して返信。打合せ候補: 5/7（水）13:00-15:00 / 5/9（金）14:00-16:00 / 5/13（火）13:00-15:00を提案。" },
      { date: "2026-04-27 11:00", from: "今西@GBRC→濱田", subject: "RE: 竹材の構造試験について（壁倍率）", summary: "【打合せ確定】5/7（木）13:00-15:00。仕様書を見たが形状がわからない。⚠ 釘打ち試験項目がない。⚠ 耐久性試験項目もない。⚠ 「木質接着複合パネル」の大臣認定はGBRCではできない→日本建築センターになる。国交省への問い合わせが必要な可能性あり。" },
      { date: "2026-04-27 22:35(JST)", from: "濱田→今西@GBRC（誤送）", subject: "RE: 竹材の構造試験について（壁倍率）", summary: "【誤り】「詳細なスペック情報（170℃×10MPa×30分の熱圧縮工程、強度データ等）およびJAS認定取得へのステップをご説明いただき」と記述→今西様からご提供いただいていない情報を誤ってそのように書いてしまった。" },
      { date: "2026-04-27 18:49", from: "今西@GBRC→濱田", subject: "RE: 竹材の構造試験について（壁倍率）", summary: "「詳細なスペック情報〜はこれまでご提供しておりません。どちらからお聞きになった情報でしょうか」と指摘。菌糸体複合材料パネルについても「今回初めて伺いました」。5/7打合せにて情報を整理・確認したい。" },
      { date: "2026-04-28 00:26(JST)", from: "濱田→今西@GBRC【お詫び】", subject: "Re: 竹材の構造試験について（壁倍率）", summary: "「詳細なスペック情報〜」は弊社の自社調査・社内資料に基づくもので今西様からのご提供ではないと訂正・お詫び。菌糸体は玉井様経由で別ルート申込み済みと説明。5/7（木）13:00-15:00の打合せ継続。事前に写真・図面をお送りします。" },
    ],
    nextAction: "▶ 5/7（木）13:00-15:00 Web打合せ（今西達也 06-6834-7913）。【事前に必須】竹集成パネルの写真・図面を送付。⚠ 打合せで確認事項: ①釘打ち試験の要否 ②耐久性試験の要否 ③木質接着複合パネル分類→日本建築センターへ移管の可否",
  },
];

const OUTREACH: OutreachItem[] = [
  {
    id: "hokudai-mycelium",
    category: "建材研究",
    name: "菌糸体パネル試験体製作 技術相談",
    org: "北海道大学 林産製造学研究室（玉井裕 教授）",
    email: "kyomu@agr.hokudai.ac.jp",
    status: "awaiting",
    sentDate: "2026-04-28",
    subject: "【菌糸体複合材料パネル試験体製作のご相談】SOLUNA合同会社",
    purpose: "カワラタケ菌糸体+おがくず70%+籾殻30%のパネル試験体（300×300×40mm / 600×600×40mm）製作の技術指導・協力依頼。",
    hasReply: false,
    nextAction: "▶ 返信待ち。玉井教授の専門（担子菌栽培・菌床製造）がまさに直撃。",
  },
  {
    id: "oshima-kinoko",
    category: "建材研究",
    name: "菌糸体パネル試験体製作 製造依頼",
    org: "おしま菌床きのこセンター（社会福祉法人侑愛会）",
    email: "kinokocenter@yuai.jp",
    status: "awaiting",
    sentDate: "2026-04-28",
    subject: "【菌糸体パネル試験体製作のご依頼】SOLUNA合同会社",
    purpose: "カスタムサイズ菌床の製作依頼。菌床製造実績豊富。北斗市（函館近郊）。",
    hasReply: false,
    nextAction: "▶ 返信待ち。対応可否・費用・納期を確認。",
  },
  {
    id: "soubetsu",
    category: "土地・物件",
    name: "壮瞥町字蟠渓 山林物件 78,777㎡",
    org: "さくらホーム（担当: 柬理 修也）",
    email: "kanri@sakurahome.jp",
    status: "replied",
    sentDate: "2026-04-23",
    subject: "壮瞥町字蟠渓 山林物件（78,777㎡）のお問い合わせ",
    purpose: "SOLUNAビレッジ候補地となる北海道有珠郡壮瞥町字蟠渓の山林物件（約78,777㎡・500万円）の購入検討",
    hasReply: true,
    replyNotes: "担当: 柬理 修也（かんり のぶや）kanri@sakurahome.jp / 090-8370-6421。①現地案内不可（遠方、場所特定していない山林）②蟠渓引湯不明③役場協議実績なし④価格は「多少交渉可能」。⚠ 境界非明示・おそらく接道なし・現地状況不明の「現状売買」と明言。手元資料を送付済み。",
    emails: [
      { date: "2026-04-23 02:35(PDT)", from: "濱田→さくらホーム", subject: "壮瞥町字蟠渓 山林物件（78,777㎡）のお問い合わせ", summary: "SOLUNAビレッジ（音楽・アート・ウェルネス・武道の体験型宿泊8棟）候補地として問い合わせ。①現地案内②蟠渓温泉引湯③グランピング用途の役場協議実績④価格交渉の余地を確認。" },
      { date: "2026-04-24 09:41 JST", from: "柬理 修也@さくらホーム→濱田", subject: "Re: 壮瞥町字蟠渓 山林物件（78,777㎡）のお問い合わせ", summary: "①現地案内不可（場所特定していない山林・弊社遠方）②温泉引湯は把握外③役場協議実績なし④価格は多少交渉可能。あくまで「現状売買（境界非明示・おそらく接道なし・現地状況不明）」。図面等の手元資料を送付。" },
    ],
    nextAction: "⚠ 境界非明示・接道なし（おそらく）の現状売買。建築確認不可の可能性大。キャンプ場・農業用途での活用を検討するか判断が必要。継続交渉する場合は kanri@sakurahome.jp / 090-8370-6421 へ。",
  },
  {
    id: "clt-epfl",
    category: "CLT工法",
    name: "CLT ツールフリー接合 共同研究",
    org: "EPFL (Prof. Yves Weinand / IBOIS)",
    email: "yves.weinand@epfl.ch",
    status: "awaiting",
    sentDate: "2026-04-27",
    subject: "Collaboration on tool-free CLT joinery for rural cabin construction — SOLUNA Japan",
    purpose: "工具不要なCLTインターロッキング接合技術の共同研究。SOLUNAビレッジの小屋設計への応用。",
    hasReply: false,
    replyNotes: "ibois@epfl.ch は 550 unknown mailbox でバウンス（メールアドレス無効）。yves.weinand@epfl.ch への直接送信は成功したが返信なし。",
    emails: [
      { date: "2026-04-26 10:50 EDT", from: "濱田→ibois@epfl.ch / yves.weinand@epfl.ch", subject: "Collaboration on tool-free CLT joinery for rural cabin construction — SOLUNA Japan", summary: "IBOIS（Weinand教授）へCLTインターロッキング接合（ファスナー・接着剤不要）の共同研究打診。compas_wood・Augmented Carpentry研究への言及、北海道・瀬戸内の小屋建設プロジェクト（10m²未満）への応用、3DプリントPA12-CFコネクタの組み合わせ、Dr. Nicolas Roteauの東大コネクション触れ。" },
      { date: "2026-04-26 16:51 CEST", from: "EPFL postmaster→濱田（バウンス）", subject: "Non remis: Collaboration on tool-free CLT joinery...", summary: "ibois@epfl.ch が「550 unknown mailbox」でバウンス。EPFL mail.chが拒否。yves.weinand@epfl.ch への返信は届いているはずだが返信なし。" },
    ],
    nextAction: "⚠ ibois@epfl.ch はバウンス済み（無効アドレス）。yves.weinand@epfl.ch へ直接送付済みだが返信なし。EPFL IBOISの正しい連絡先フォーム/メールを調査して再コンタクトすること。",
  },
  {
    id: "momigara-utokyo",
    category: "建材研究",
    name: "籾殻圧縮ボード 建材利用 共同研究",
    org: "東京大学 木質材料学研究室（青木謙治先生）",
    email: "aoken@g.ecc.u-tokyo.ac.jp",
    status: "replied",
    sentDate: "2026-04-22",
    subject: "【共同研究のご相談】籾殻圧縮ボードの建材利用 — SOLUNA合同会社",
    purpose: "籾殻を主原料とした圧縮ボードの建材・断熱材としての性能評価・共同研究の打診。杉CLT-籾殻ボード-竹集成材の3層SIPsパネル開発。",
    hasReply: true,
    replyNotes: "青木謙治先生（aoken@g.ecc.u-tokyo.ac.jp）から2026-04-24に返信。五十嵐先生からの転送経由。「木材（農学）と建築（工学）の中間領域」が研究室の専門で「最もマッチする分野」との認識。「面白い取り組み」と評価。「一度お話伺って意見交換できれば」とポジティブ。",
    emails: [
      { date: "2026-04-22 17:03 JST", from: "濱田→東大 aquarius lab", subject: "【共同研究のご相談】籾殻圧縮ボードの建材利用 — SOLUNA合同会社", summary: "籾殻圧縮ボードをコア材としたSIPsパネル（杉CLT 12mm + 籾殻ボード 120mm + 竹集成材 12mm）の開発について共同研究打診。製造条件・3層接合強度・建築基準法認定・共同研究の可能性を相談。" },
      { date: "2026-04-24 17:58 JST", from: "青木謙治先生@東大→濱田", subject: "Re: 【共同研究のご相談】籾殻圧縮ボードの建材利用", summary: "五十嵐先生よりメールを転送してもらった。木質材料学研究室（木材農学×建築工学の中間領域）が最もマッチすると判断。「なかなか面白い取り組み」と評価。「よろしければ一度お話伺って意見交換できれば」とポジティブ返信。aoken@g.ecc.u-tokyo.ac.jp" },
      { date: "2026-04-28 00:26 JST", from: "濱田→青木先生", subject: "Re: 【共同研究のご相談】籾殻圧縮ボードの建材利用", summary: "お礼と打合せ候補日を提案: ①5/13（火）14:00-15:00 ②5/15（木）13:00-14:00 ③5/19（月）15:00-16:00。30-45分Zoomを想定。概要資料の事前送付も提案。" },
    ],
    nextAction: "▶ 青木先生（aoken@g.ecc.u-tokyo.ac.jp）からの日程返信待ち。候補: 5/13, 5/15, 5/19。返信次第、籾殻SIPsパネル仕様書を事前送付。",
  },
  {
    id: "momigara-kyoto",
    category: "建材研究",
    name: "籾殻ボード×木質構造パネル 共同研究",
    org: "京都大学 生存圏研究所（五十田博 教授）",
    email: "hisoda00@gmail.com",
    status: "replied",
    sentDate: "2026-04-22",
    subject: "【共同研究のご相談】籾殻圧縮ボード×木質構造パネル — SOLUNA合同会社",
    purpose: "籾殻圧縮ボードと木質構造パネルの複合建材システム（杉CLT+籾殻ボード+竹集成材）の共同研究打診。五十田博教授（木質構造）・梅村研二教授（循環材料創成）宛。",
    hasReply: true,
    replyNotes: "五十田博教授から個人メール（hisoda00@gmail.com）で返信あり。面談OK：オンライン / 京都宇治 / 東京での面談が可能。また北海道道立総合研究機構 林産試験場（設備が立派・今回の案件に対応可）を紹介。",
    emails: [
      { date: "2026-04-22 04:03 EDT", from: "濱田→京大 生存圏研究所（webmaster@rish.kyoto-u.ac.jp）", subject: "【共同研究のご相談】籾殻圧縮ボード×木質構造パネル — SOLUNA合同会社", summary: "五十田博教授・梅村研二教授宛に籾殻SIPsパネル開発の共同研究打診。構造性能評価・耐震性能・バイオマス系バインダー・建築基準法認定・共同研究の可能性を相談。日下部（広報委員会）が両先生に転送。" },
      { date: "2026-04-24 JST", from: "五十田博 教授@京大（hisoda00@gmail.com）→濱田", subject: "Re: 【共同研究のご相談】籾殻圧縮ボード×木質構造パネル", summary: "面談OK。オンライン・京都宇治・東京（出張機会あり）で可能。⭐ 北海道道立総合研究機構 林産試験場を紹介（設備が立派・今回の案件に対応可）。URL: hro.or.jp/forest/research/fpri" },
    ],
    nextAction: "▶ 五十田先生（hisoda00@gmail.com）へ面談日程を返信。北海道道立総合研究機構 林産試験場にも別途コンタクト。",
  },
  {
    id: "clt-okhotsk",
    category: "CLT工法",
    name: "CLTパネル調達 + 竹集成パネル熱圧縮加工",
    org: "協同組合オホーツクウッドピア（北見市留辺蘂）",
    email: "info@okhotsk-woodpia.or.jp",
    status: "awaiting",
    sentDate: "2026-04-27",
    subject: "CLTパネルの調達 / 竹集成パネル熱圧縮加工のご相談",
    purpose: "①道内唯一のCLT製造工場。②CLT製造設備（高温高圧プレス）を竹材（170℃×10MPa）に転用できないか相談。③弟子屈プロジェクト向けCLT調達。",
    hasReply: false,
    emails: [
      { date: "2026-04-27", from: "濱田→オホーツクウッドピア", subject: "CLTパネルの調達について — SOLUNA 弟子屈プロジェクト", summary: "北海道弟子屈のSOLUNAビレッジ建設用CLTパネルの国内調達を相談。" },
      { date: "2026-04-28", from: "濱田→オホーツクウッドピア", subject: "竹集成パネル（無接着剤熱圧縮）試験体製作のご相談 — SOLUNA", summary: "170℃×10MPa熱圧縮の竹集成パネル試験体製作の相談。CLTプレス設備の竹材転用可否・費用・竹材仕入れ対応を確認依頼。" },
    ],
    nextAction: "▶ 両件の返信待ち（CLT調達 + 竹集成パネル熱圧縮対応可否）。5/7 GBRC打合せでサイズ確定後、具体的な発注へ。",
  },
  {
    id: "fpri-hokkaido",
    category: "建材研究",
    name: "建材性能試験・技術相談",
    org: "北海道道立総合研究機構 林産試験場（旭川市西神楽）",
    email: "—",
    status: "pending",
    sentDate: "2026-04-28",
    subject: "【建材試験・技術相談】菌糸体パネル・竹集成パネル — SOLUNA",
    purpose: "五十田博教授（京大）から紹介。菌糸体パネル・竹集成パネルの構造性能・耐久性試験と製作技術相談。GBRCより設備が充実している可能性あり。",
    hasReply: false,
    nextAction: "▶ メール非公開のため問い合わせフォーム（hro.or.jp/forest/research/fpri）から連絡。または代表 0166-75-4233へ電話。五十田先生紹介の旨を伝えること。",
  },
  {
    id: "mycelium-mogu",
    category: "建材研究",
    name: "Mycelium吸音パネル 調達相談",
    org: "Mogu.bio",
    email: "sales@mogu.bio",
    status: "awaiting",
    sentDate: "2026-04-27",
    subject: "Mycelium acoustic panels inquiry — SOLUNA project, Hokkaido Japan",
    purpose: "菌糸体吸音パネルの商業製品として既存ソリューションの調達・比較検討。",
    hasReply: false,
    nextAction: "返信待ち。",
  },
  {
    id: "hokkaido-fpri",
    category: "建材研究",
    name: "籾殻ボード・竹建材 性能試験 相談",
    org: "北海道道立総合研究機構 林産試験場",
    email: "—",
    status: "pending",
    sentDate: "2026-04-28",
    subject: "【建材性能試験のご相談】籾殻圧縮ボード・竹集成パネル — SOLUNA合同会社",
    purpose: "五十田博教授（京大）より紹介。籾殻SIPsパネルおよび竹集成パネルの構造性能・耐久性試験の相談。設備が立派で今回の案件に対応可能とのこと。",
    hasReply: false,
    nextAction: "▶ 未連絡。hro.or.jp/forest/research/fpri で連絡先を確認してコンタクト。五十田先生紹介の旨を伝えること。",
  },
  {
    id: "3d-connector",
    category: "接合技術",
    name: "3Dプリント構造コネクター 研究協働",
    org: "Enabler Inc.",
    email: "mail@yukihamada.jp",
    status: "pending",
    sentDate: "2026-04-27",
    subject: "3Dプリント構造コネクターの研究協働のご相談 — SOLUNA / Enabler Inc.",
    purpose: "3Dプリント技術を用いた木造建築向け構造コネクターの研究・開発打診。",
    hasReply: false,
    nextAction: "社内検討中。",
  },
  {
    id: "cnc-clt",
    category: "CLT工法",
    name: "CLT CNCインターロック加工 プロトタイプ",
    org: "国内CNCメーカー",
    email: "—",
    status: "pending",
    sentDate: "2026-04-27",
    subject: "CLTパネルのCNCインターロック加工・プロトタイプ製作のご相談 — SOLUNA",
    purpose: "CLTパネルのCNC精密加工でツールフリー接合プロトタイプの製作依頼。",
    hasReply: false,
    nextAction: "送付先を特定して正式依頼。",
  },
  {
    id: "suzuko-clt",
    category: "CLT工法",
    name: "CLT製造委託・プレカット工場紹介",
    org: "株式会社鈴工（三重県伊勢市）",
    email: "hiroyuki.suzuki@suzuko-inc.com",
    status: "replied",
    sentDate: "2026-04-22",
    subject: "【製造委託のご相談】籾殻圧縮ボード+CLTパネル組立 — SOLUNA",
    purpose: "CLT加工・全国プレカット工場ネットワークを持つ鈴工への製造委託相談。籾殻圧縮ボード+CLTサンドパネルの製造を依頼。",
    hasReply: true,
    replyNotes: "鈴木啓之さん（080-4404-6744）から2026-04-28に返信。「大変面白い取り組み」と評価。CLT12mmの仕様確認（3層合計12mm or 各層12mm？）と電話での詳細確認を希望。→ 濱田より返信済：北海道弟子屈が拠点、CLT12mmは各層12mm（外面・内面それぞれ12mm）と説明。鈴木さんからの電話日程待ち。",
    emails: [
      { date: "2026-04-22 17:02 JST", from: "濱田→鈴工", subject: "【製造委託のご相談】杉CLTサンドパネル / 籾殻圧縮ボード+CLTパネル組立", summary: "杉CLTサンドパネル（外面CLT12mm+断熱コア120mm+内面竹集成12mm）の製造委託を相談。仕様書URL送付。" },
      { date: "2026-04-28 07:38 JST", from: "鈴木啓之@鈴工→濱田", subject: "Re:【製造委託のご相談】籾殻圧縮ボード+CLTパネル組立", summary: "電話で何度か連絡したが留守電のためメール。「面白い取り組み」と評価。全国プレカット工場紹介可能。CLTが12mmとあるが3層合計か各層12mmか仕様確認が必要。東京在住か北海道か確認し、電話での詳細打合せを希望。" },
      { date: "2026-04-28（返信済）", from: "濱田→鈴木", subject: "Re: 製造委託のご相談", summary: "北海道弟子屈が拠点。CLT12mmは各層12mm（外面・内面それぞれ12mm、計36mm+断熱コア）と説明。電話での打合せ希望。" },
    ],
    nextAction: "▶ 鈴木さん（080-4404-6744）からの電話日程連絡待ち。CLT仕様（各層12mm）説明済み。",
  },
  {
    id: "tsugite-tlo",
    category: "CLT工法",
    name: "Tsugite 商用ライセンス相談",
    org: "東京大学TLO（shigeta@todaitlo.jp）",
    email: "shigeta@todaitlo.jp",
    status: "awaiting",
    sentDate: "2026-04-28",
    subject: "Tsugite 商用利用のご相談 — 弟子屈 天空道場プロジェクト",
    purpose: "Maria Larsson氏開発のTsugite（ツールフリー木材接合システム）のCLTへの応用・商用ライセンス取得の相談。天空道場（10〜30m²）プロトタイプへの応用。",
    hasReply: false,
    emails: [
      { date: "2026-04-28 13:31 JST", from: "濱田→東大TLO", subject: "Tsugite 商用利用のご相談 — 弟子屈 天空道場プロジェクト", summary: "北海道弟子屈の天空道場（BJJ道場）建設にTsugiteのツールフリー接合をCLTに応用するプロトタイプ製作を検討。①商用ライセンス取得方法・費用 ②研究者との技術相談の可否 ③国内CNC業者との連携事例 を問い合わせ。" },
    ],
    nextAction: "▶ 返信待ち。商用ライセンス費用・技術相談可否・CNC業者連携事例を確認。",
  },
  {
    id: "spiral-pile",
    category: "基礎工法",
    name: "スクリューパイル基礎 施工相談",
    org: "株式会社スパイラルパイル（info@spiral-pile.co.jp）",
    email: "info@spiral-pile.co.jp",
    status: "awaiting",
    sentDate: "2026-04-24",
    subject: "スクリューパイル基礎 複数棟施工のご相談（北海道弟子屈・2026年夏）",
    purpose: "弟子屈美留和地区の9.9m²以下独立棟×最大5棟へのスクリューパイル基礎（凍結深度対応・移設可能）施工の相談。",
    hasReply: false,
    emails: [
      { date: "2026-04-24 03:17 JST", from: "濱田→スパイラルパイル", subject: "スクリューパイル基礎 複数棟施工のご相談（北海道弟子屈・2026年夏）", summary: "弟子屈美留和地区（凍結深度120cm・原野やや湿地）に9.9m²以下×5棟の施工相談。凍結深度対応パイル仕様・1棟あたり施工費・5棟同時割引・移設対応・弟子屈出張施工の可否を問い合わせ。" },
    ],
    nextAction: "▶ 返信待ち。凍結深度120cm対応パイル仕様・施工費・移設対応・出張施工の可否を確認。",
  },
  {
    id: "hodumi-pile",
    category: "基礎工法",
    name: "スクリュー杭 基礎工事 見積依頼",
    org: "穂積トレイド株式会社（info@hodumi.co.jp）",
    email: "info@hodumi.co.jp",
    status: "awaiting",
    sentDate: "2026-04-25",
    subject: "【お見積もり依頼】北海道弟子屈・凍結深度対応のスクリュー杭 — SOLUNA合同会社",
    purpose: "弟子屈熊牛原野でのコードウッドサウナ（8m²）＋ストローベイル離れ（50〜66m²）2案件のスクリュー杭基礎見積依頼。",
    hasReply: false,
    emails: [
      { date: "2026-04-25 01:44 JST", from: "濱田→穂積トレイド", subject: "【お見積もり依頼】北海道弟子屈・凍結深度対応のスクリュー杭", summary: "【案件1】コードウッドサウナ（8m²・コンクリ不使用・杭6〜8本）【案件2】ストローベイル離れ（50〜66m²・建確あり）。凍結深度80〜120cm・原野やや湿地。概算コスト・現地施工の可否を問い合わせ。" },
    ],
    nextAction: "▶ 返信待ち。2案件の概算費用・弟子屈出張施工の可否を確認。",
  },
  {
    id: "fabtech-cnc",
    category: "CLT工法",
    name: "CNC木材加工 見積依頼",
    org: "Fabtech（info@fabtech-sapporo.jp）",
    email: "info@fabtech-sapporo.jp",
    status: "awaiting",
    sentDate: "2026-04-24",
    subject: "CNC木材加工のお見積もり依頼（弟子屈・建材プロジェクト）",
    purpose: "道産合板（ラーチ/トドマツ 18mm）のCNCルーター加工依頼。フィンガージョイント・ポケット加工。サンプル4枚→月次発注継続。",
    hasReply: false,
    emails: [
      { date: "2026-04-24 03:13 JST", from: "濱田→Fabtech", subject: "CNC木材加工のお見積もり依頼（弟子屈・建材プロジェクト）", summary: "18mm道産合板1220×2440mm 4〜24枚のCNCルーター加工依頼。DXFデータによるネスティング設計済み。フィンガージョイント・ポケット加工含む。サンプル4枚から開始し問題なければ月次発注継続。道内調達・道内加工・弟子屈配送希望。" },
    ],
    nextAction: "▶ 返信待ち。見積もり・対応可否・弟子屈配送の可否を確認。",
  },
  {
    id: "teshikaga-kensetsu",
    category: "行政手続き",
    name: "弟子屈町 建設前事前相談",
    org: "弟子屈町役場 建設課建築係",
    email: "kensetsu@town.teshikaga.hokkaido.jp",
    status: "replied",
    sentDate: "2026-04-22",
    subject: "【建設相談】北海道弟子屈でのストローベイル建築について",
    purpose: "弟子屈町での建設前事前相談。用途区域・開発規制・非居住建築の許認可についての相談。",
    hasReply: true,
    replyNotes: "建設課建築係 主任 鈴木敬章さんから返信（015-482-2941直通）。用途区域等を調べるため建設予定地の地番をメールまたは電話で教えてほしいとのこと。⚠ 地番の返信が必要。",
    emails: [
      { date: "2026-04-22 22:52 JST", from: "弟子屈町（自動受付）→濱田", subject: "【ホームページより】お問い合わせありがとうございました", summary: "問い合わせ受付確認メール。" },
      { date: "2026-04-23 10:43 JST", from: "鈴木敬章@弟子屈町建設課→濱田", subject: "【弟子屈町】ホームページよりお問い合わせ頂いたご相談の内容確認について", summary: "用途区域等を調べるため建設予定地の地番をメールまたは電話でお知らせください。担当: 鈴木敬章主任（015-482-2941直通）。" },
    ],
    nextAction: "⚠ 要対応：地番をkensetsu@town.teshikaga.hokkaido.jpに返信すること。村501番1（美留和）ほかの地番を連絡。担当: 鈴木敬章（015-482-2941）",
  },
];

const CONTACTS = [
  { name: "今西達也", org: "GBRC", email: "imanishi@gbrc.or.jp", role: "竹材構造試験 窓口 / 5/7打合せ", tel: "" },
  { name: "玉井裕", org: "GBRC", email: "yu-tamai@gbrc.or.jp", role: "壁倍率試験・総合窓口", tel: "072-768-8201" },
  { name: "山田優花", org: "GBRC", email: "yu-yamada@gbrc.or.jp", role: "熱伝導率試験 担当", tel: "06-6834-0603" },
  { name: "久保優樹", org: "GBRC", email: "y-kubo@gbrc.or.jp", role: "曲げ強さ試験 担当", tel: "06-6834-0603" },
  { name: "青木謙治 先生", org: "東京大学 木質材料学研究室", email: "aoken@g.ecc.u-tokyo.ac.jp", role: "木質材料学（農学×建築工学）/ 打合せ日程調整中（5/13, 5/15, 5/19候補）", tel: "" },
  { name: "五十田 博 教授", org: "京都大学 生存圏研究所", email: "hisoda00@gmail.com", role: "木質構造科学 / 返信済・面談調整待ち。林産試験場を紹介", tel: "" },
  { name: "柬理 修也（かんりのぶや）", org: "さくらホーム", email: "kanri@sakurahome.jp", role: "壮瞥町 山林物件 担当", tel: "090-8370-6421" },
  { name: "鈴木 啓之", org: "株式会社鈴工", email: "hiroyuki.suzuki@suzuko-inc.com", role: "CLT製造委託・全国プレカット工場ネットワーク / 電話日程待ち", tel: "080-4404-6744" },
  { name: "鈴木 敬章（主任）", org: "弟子屈町役場 建設課建築係", email: "kensetsu@town.teshikaga.hokkaido.jp", role: "建設前事前相談 / ⚠ 地番情報を返信する必要あり", tel: "015-482-2941" },
];

const SCHEDULE = [
  { date: "2026-04-23〜24", event: "GBRC 今西様へ竹材構造試験の相談メール送付", done: true },
  { date: "2026-04-24", event: "東大・京大へ籾殻圧縮ボード共同研究打診", done: true },
  { date: "2026-04-24", event: "さくらホームへ壮瞥町山林物件（78,777㎡）問い合わせ", done: true },
  { date: "2026-04-22", event: "株式会社鈴工へCLT製造委託相談メール送付", done: true },
  { date: "2026-04-22", event: "弟子屈町役場建設課へ建設前事前相談メール送付", done: true },
  { date: "2026-04-23 10:43", event: "弟子屈町建設課 鈴木敬章主任より返信：地番情報の提供依頼（015-482-2941）", done: true },
  { date: "2026-04-24", event: "スパイラルパイル・穂積トレイドへスクリュー杭基礎相談メール送付", done: true },
  { date: "2026-04-24", event: "Fabtech（info@fabtech-sapporo.jp）へCNC木材加工見積依頼送付", done: true },
  { date: "2026-04-26〜27", event: "EPFL Weinand教授・オホーツクウッドピア・mogu.bioへ打診", done: true },
  { date: "2026-04-27 17:42", event: "GBRC玉井様へ菌糸体パネル4項目の試験申込メール送付", done: true },
  { date: "2026-04-27 18:36", event: "山田優花@GBRCより熱伝導率試験の詳細・依頼書受領", done: true },
  { date: "2026-04-27 20:02", event: "久保優樹@GBRCより曲げ強さ試験の詳細・依頼書受領", done: true },
  { date: "2026-04-27 18:49", event: "今西達也@GBRCより竹材構造試験の追加詳細受領", done: true },
  { date: "2026-04-27 21:xx", event: "GBRC 今西・山田・久保の3名へ返信送付（今西様へはお詫びメール含む）", done: true },
  { date: "2026-04-28", event: "北大 林産製造学研究室（玉井教授）へ菌糸体パネル試験体製作相談メール送付", done: true },
  { date: "2026-04-28", event: "おしま菌床きのこセンターへ試験体製作依頼メール送付", done: true },
  { date: "2026-04-28", event: "オホーツクウッドピアへ竹集成パネル熱圧縮加工相談メール送付", done: true },
  { date: "2026-04-28 07:38", event: "鈴工 鈴木啓之さんより返信：CLT仕様確認・電話打合せ希望 → 濱田より仕様説明返信済", done: true },
  { date: "2026-04-28 13:31", event: "東大TLOへTsugite商用ライセンス相談メール送付（shigeta@todaitlo.jp）", done: true },
  { date: "⚠ 要対応", event: "弟子屈町建設課（鈴木敬章 015-482-2941）へ地番情報を返信（村501番1ほか）", done: false },
  { date: "2026-04-28〜29", event: "五十田教授（hisoda00@gmail.com）へ面談日程返信・林産試験場コンタクト", done: false },
  { date: "2026-05-上旬", event: "今西様へ竹集成パネルの写真・図面を事前送付", done: false },
  { date: "2026-05-07（木）13:00-15:00", event: "今西達也@GBRC Web打合せ確定 — 釘試験・耐久性試験・日本建築センター移管可否を確認", done: false },
  { date: "2026-05-上旬", event: "試験依頼書を記入・GBRCへ返送（熱伝導率・曲げ強さ）", done: false },
  { date: "2026-05-上旬", event: "玉井様へ竹材壁倍率試験の正式申込メール", done: false },
  { date: "2026-05-13 or 5/15 or 5/19", event: "東大 青木謙治先生との打合せ（籾殻圧縮ボード・菌糸体パネル）— 日程確認待ち", done: false },
  { date: "2026-05-中旬", event: "吸音・難燃試験担当者確認（返信なければフォローアップ）", done: false },
  { date: "2026-05-中旬", event: "さくらホーム・EPFL・東大の返信内容に基づき次ステップ協議", done: false },
  { date: "2026-06-中旬", event: "試験体サンプル完成（菌糸体パネル）・GBRC搬送", done: false },
  { date: "2026-06-下旬", event: "全試験実施開始（GBRC 大阪府茨木市）", done: false },
  { date: "2026-07-上旬", event: "全試験完了・結果取得・建築確認申請資料作成", done: false },
  { date: "2026-09-〜", event: "SOLUNAビレッジ建設開始（北海道弟子屈町 美留和地区）", done: false },
];

const BUDGET = [
  { item: "熱伝導率試験（JIS A 1412-2, n=1）税込", amount: 110000, status: "見積確定" },
  { item: "曲げ強さ試験（JIS A 5905, n=3）税抜", amount: 73000, status: "見積確定" },
  { item: "吸音性能試験（NRC算出）", amount: 0, status: "未見積" },
  { item: "難燃性試験（コーンカロリーメーター）", amount: 0, status: "未見積" },
  { item: "竹材壁倍率試験（建築基準法）", amount: 0, status: "未見積" },
  { item: "試験体製作・搬送費", amount: 0, status: "未見積" },
];

type SolunaUnit = {
  id: string; no: string; name: string; category: string;
  desc: string; price: string; status: "available" | "development" | "planned";
  specs: string[]; nextAction: string;
};

const CONSTRUCTION_STEPS = [
  { day: "Day 0（先行）", title: "鋼管杭基礎打設", diy: false, team: "重機 + 2名", desc: "凍結深度120cmをクリアする鋼管杭を圧入。コンクリート養生不要のため翌日即作業開始可。土間コン不使用・床下通気確保。基礎工事は外注（北海道対応業者を手配）。", materials: ["鋼管杭（凍結深度120cm対応）", "鋼板シム（水平調整用）", "アンカーボルトM16"], cost: "¥50〜70万（外注）" },
  { day: "Day 1", title: "土台・根太 + 床パネル設置", diy: true, team: "4人 / 6〜8h", desc: "防腐処理土台材を杭天端に固定→根太を引いた上に床SIPsパネル（厚100mm）を並べてビス留め・発泡ウレタン充填。平坦な作業床が半日で完成。", materials: ["土台材 105×105 防腐処理", "根太材（防腐処理）", "床SIPsパネル厚100mm（杉CLTサンドパネル）", "発泡ウレタン", "気密テープ"], cost: "材料費込" },
  { day: "Day 2", title: "壁パネル建て方", diy: true, team: "6人 / 8〜10h", desc: "工場プレカット済み壁SIPsをチェーンブロックで吊りながら建て方。電気配線チェイスは工場加工済みのため現場穿孔なし。コーナーパネルから固め、直線壁を順に建てていく。1棟の壁が1日で閉まる。", materials: ["壁SIPsパネル（200〜350kg/枚）", "発泡ウレタン", "気密テープ", "スパイン連結金物"], cost: "材料費込" },
  { day: "Day 3", title: "屋根パネル + 防水シート", diy: false, team: "4〜5人 / 8h（高所注意）", desc: "屋根SIPsパネル（厚200mm）を壁天端に載せ構造用接着剤+ビスで固定。全パネル固定後即日タイベックハウスラップを全面貼りして雨仕舞い完了。この時点で躯体は完成。", materials: ["屋根SIPsパネル厚200mm（300〜500kg/枚）", "タイベックハウスラップ", "構造用接着剤", "板金鼻隠し"], cost: "材料費込" },
  { day: "Day 4〜10", title: "外装・サッシ・設備仕上げ", diy: true, team: "4人 / 7日間", desc: "通気胴縁→焼杉外装縦張り（ネイルガン）、サッシ建て込み・防水テープ処理、HRV換気ユニット設置、電気・給排水接続。内装はWork Partyでオーナーが参加できる工程。", materials: ["通気胴縁18mm", "焼杉外装（SUMIGAKI®炭化カラマツ）", "サッシ（トリプルガラス Uw1.0以下）", "HRV全熱交換ユニット"], cost: "¥30〜60万" },
  { day: "Day 14前後", title: "完成・引渡し", diy: false, team: "—", desc: "竣工検査・気密測定（ブロアドア C値≤0.5確認）・Airbnb撮影・初回稼働。在来工法の約1/3の工期で建物が完成。", materials: [], cost: "—" },
];

const SOLUNA_UNITS: SolunaUnit[] = [
  {
    id: "roof-grid",
    no: "06",
    name: "ルーフグリッド",
    category: "屋根システム",
    desc: "カラマツ製モジュラー屋根フレーム。910mm角グリッドにソーラー・草屋根・天窓・焼き板・竹パネルを自由配置。積雪2m（3.0kN/m²）対応。屋根の外観を決定するコアパーツ。",
    price: "¥85,000〜（フレーム）",
    status: "development",
    specs: ["素材: 北海道産カラマツ間伐材", "グリッドピッチ: 910mm角モジュール", "積雪対応: 3.0kN/m²（弟子屈地域基準）", "搭載オプション: ソーラーパネル / 草屋根 / 天窓 / 焼杉 / 竹パネル"],
    nextAction: "▶ 寸法仕様書を作成してオホーツクウッドピアに試作打診。ルーフグリッド+竹SIPsの屋根ユニット化を検討。5/7 今西様打合せ後に屋根仕様を確定。",
  },
  {
    id: "smart-window",
    no: "07",
    name: "スマートウィンドウ",
    category: "窓ユニット",
    desc: "竹集成枠（無接着剤熱圧縮）+ペア〜トリプルKrガラス+PDLC調光フィルム。スイッチひとつで透明⟷すりガラスに切替。SOLUNAビレッジのプライバシー管理に対応。",
    price: "¥28,000〜85,000/枠",
    status: "development",
    specs: ["枠材: 竹集成（170℃×10MPa熱圧縮）", "ガラス: ペア / トリプル / Kr充填 Uw1.0以下", "調光: PDLC電動フィルム（透明⟷すりガラス）", "サイズ: 910×910〜1,820×2,730mm モジュール対応"],
    nextAction: "▶ 竹集成パネル構造試験（5/7 今西様打合せ）後に枠材サンプル製作へ。GBRC窓枠認定の可能性を今西様に確認。",
  },
];

// ---- Nav tree structure ----
type NavSection = {
  id: string;
  label: string;
  icon: string;
  children: { id: string; label: string }[];
};

const NAV: NavSection[] = [
  {
    id: "tests",
    label: "GBRC試験",
    icon: "🔬",
    children: [
      { id: "test-菌糸体パネル", label: "菌糸体パネル" },
      { id: "test-竹集成パネル", label: "竹集成パネル" },
    ],
  },
  {
    id: "outreach",
    label: "アウトリーチ",
    icon: "📬",
    children: [
      { id: "out-土地・物件", label: "土地・物件" },
      { id: "out-CLT工法", label: "CLT工法" },
      { id: "out-建材研究", label: "建材研究" },
      { id: "out-接合技術", label: "接合技術" },
    ],
  },
  {
    id: "schedule",
    label: "スケジュール",
    icon: "📅",
    children: [],
  },
  {
    id: "budget",
    label: "予算",
    icon: "💴",
    children: [],
  },
  {
    id: "contacts",
    label: "担当者",
    icon: "👤",
    children: [],
  },
  {
    id: "koho",
    label: "工法",
    icon: "🏗️",
    children: [
      { id: "koho-steps", label: "建設工程" },
      { id: "koho-units", label: "SOLUNAユニット" },
    ],
  },
];

// ---- List item types for center pane ----
type ListItem =
  | { kind: "test"; data: TestItem }
  | { kind: "outreach"; data: OutreachItem }
  | { kind: "schedule" }
  | { kind: "budget" }
  | { kind: "contacts" }
  | { kind: "koho-steps" }
  | { kind: "koho-units" };

function getListItems(selectedNav: string, outreachData: OutreachItem[]): ListItem[] {
  if (selectedNav.startsWith("test-")) {
    const cat = selectedNav.replace("test-", "");
    return TESTS.filter(t => t.category === cat).map(data => ({ kind: "test" as const, data }));
  }
  if (selectedNav === "tests") {
    return TESTS.map(data => ({ kind: "test" as const, data }));
  }
  if (selectedNav.startsWith("out-")) {
    const cat = selectedNav.replace("out-", "");
    return outreachData.filter(o => o.category === cat).map(data => ({ kind: "outreach" as const, data }));
  }
  if (selectedNav === "outreach") {
    return outreachData.map(data => ({ kind: "outreach" as const, data }));
  }
  if (selectedNav === "schedule") return [{ kind: "schedule" }];
  if (selectedNav === "budget") return [{ kind: "budget" }];
  if (selectedNav === "contacts") return [{ kind: "contacts" }];
  if (selectedNav === "koho" || selectedNav === "koho-steps") return [{ kind: "koho-steps" as const }];
  if (selectedNav === "koho-units") return [{ kind: "koho-units" as const }];
  return [];
}

function StatusBadge({ status, small }: { status: TestStatus; small?: boolean }) {
  const s = STATUS[status];
  return (
    <span style={{
      padding: small ? "2px 7px" : "3px 10px",
      borderRadius: 20,
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      background: `${s.color}22`,
      color: s.color,
      border: `1px solid ${s.color}44`,
      whiteSpace: "nowrap",
      flexShrink: 0,
    }}>
      {s.label}
    </span>
  );
}

// ---- Center pane list row ----
function TestRow({ item, selected, onSelect }: { item: TestItem; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: selected ? "rgba(201,169,98,0.12)" : "transparent",
        borderLeft: selected ? "3px solid rgba(201,169,98,0.8)" : "3px solid transparent",
        transition: "background 0.12s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <StatusBadge status={item.status} small />
        <span style={{ color: selected ? "#fff" : "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{item.name}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.contact}</span>
        <span style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>{item.fee || "TBD"}</span>
      </div>
      {item.schedule && (
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, marginTop: 2 }}>{item.schedule}</div>
      )}
    </div>
  );
}

function OutreachRow({ item, selected, onSelect }: { item: OutreachItem; selected: boolean; onSelect: () => void }) {
  const statusKey: TestStatus = item.hasReply ? "replied" : item.status;
  return (
    <div
      onClick={onSelect}
      style={{
        padding: "12px 16px",
        cursor: "pointer",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: selected ? "rgba(201,169,98,0.12)" : "transparent",
        borderLeft: selected ? "3px solid rgba(201,169,98,0.8)" : "3px solid transparent",
        transition: "background 0.12s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <StatusBadge status={statusKey} small />
        <span style={{ color: selected ? "#fff" : "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{item.name}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.org}</span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{item.sentDate}</span>
      </div>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.purpose}</div>
    </div>
  );
}

// ---- Reading pane ----
function TestDetail({ item }: { item: TestItem }) {
  const isOwnEmail = item.email === "mail@yukihamada.jp";
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <StatusBadge status={item.status} />
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{item.category}</span>
          {isOwnEmail && (
            <span style={{ color: "rgba(201,169,98,0.8)", fontSize: 11 }}>📧 mail@yukihamada.jp</span>
          )}
        </div>
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>{item.name}</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>{item.method}</p>
      </div>

      {/* Specs grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "担当者", value: item.contact },
          { label: "メール", value: <a href={`mailto:${item.email}`} style={{ color: "#60a5fa", fontSize: 13 }}>{item.email}</a> },
          { label: "費用", value: item.fee || "TBD" },
          { label: "試験体", value: item.specimen || "—" },
          { label: "スケジュール", value: item.schedule || "—" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Email timeline */}
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>メールタイムライン</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {item.emails.map((em, i) => {
          const isSent = em.from.startsWith("濱田");
          return (
            <div key={i} style={{
              background: isSent ? "rgba(201,169,98,0.07)" : "rgba(96,165,250,0.07)",
              border: `1px solid ${isSent ? "rgba(201,169,98,0.18)" : "rgba(96,165,250,0.18)"}`,
              borderRadius: 8,
              padding: "12px 14px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: isSent ? "rgba(201,169,98,0.9)" : "#60a5fa", fontSize: 12, fontWeight: 600 }}>{em.from}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{em.date}</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 500, margin: "0 0 4px" }}>{em.subject}</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{em.summary}</p>
            </div>
          );
        })}
      </div>

      {/* Next action */}
      <div style={{ background: "rgba(255,80,80,0.07)", border: "1px solid rgba(255,80,80,0.18)", borderRadius: 8, padding: "12px 16px" }}>
        <p style={{ color: "rgba(255,100,100,0.9)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>次のアクション</p>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{item.nextAction}</p>
      </div>
    </div>
  );
}

function OutreachDetail({ item }: { item: OutreachItem }) {
  const isOwnEmail = item.email === "mail@yukihamada.jp";
  const statusKey: TestStatus = item.hasReply ? "replied" : item.status;
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <StatusBadge status={statusKey} />
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{item.category}</span>
          {isOwnEmail && (
            <span style={{ color: "rgba(201,169,98,0.8)", fontSize: 11 }}>📧 mail@yukihamada.jp</span>
          )}
        </div>
        <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>{item.name}</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>{item.org}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "メール", value: item.email !== "—" ? <a href={`mailto:${item.email}`} style={{ color: "#60a5fa", fontSize: 13 }}>{item.email}</a> : <span style={{ color: "rgba(255,255,255,0.35)" }}>—</span> },
          { label: "送信日", value: item.sentDate },
          { label: "返信", value: item.hasReply ? "あり" : "なし" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Subject */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 6px" }}>件名</p>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>{item.subject}</p>
      </div>

      {/* Purpose */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 6px" }}>目的</p>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0, lineHeight: 1.7 }}>{item.purpose}</p>
      </div>

      {/* Reply notes */}
      {item.replyNotes && (
        <div style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <p style={{ color: "#60a5fa", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", margin: "0 0 6px" }}>返信内容</p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0, lineHeight: 1.7 }}>{item.replyNotes}</p>
        </div>
      )}

      {/* Email timeline */}
      {item.emails && item.emails.length > 0 && (
        <>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>メールタイムライン</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {item.emails.map((em, i) => {
              const isSent = em.from.startsWith("濱田");
              return (
                <div key={i} style={{
                  background: isSent ? "rgba(201,169,98,0.07)" : "rgba(96,165,250,0.07)",
                  border: `1px solid ${isSent ? "rgba(201,169,98,0.18)" : "rgba(96,165,250,0.18)"}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: isSent ? "rgba(201,169,98,0.9)" : "#60a5fa", fontSize: 12, fontWeight: 600 }}>{em.from}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{em.date}</span>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 500, margin: "0 0 4px" }}>{em.subject}</p>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{em.summary}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Next action */}
      <div style={{ background: item.hasReply ? "rgba(74,222,128,0.07)" : "rgba(255,80,80,0.07)", border: `1px solid ${item.hasReply ? "rgba(74,222,128,0.18)" : "rgba(255,80,80,0.18)"}`, borderRadius: 8, padding: "12px 16px" }}>
        <p style={{ color: item.hasReply ? "#4ade80" : "rgba(255,100,100,0.9)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>次のアクション</p>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{item.nextAction}</p>
      </div>
    </div>
  );
}

function SchedulePanel() {
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>スケジュール</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {SCHEDULE.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 2 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: s.done ? "#4ade80" : "rgba(255,255,255,0.15)", border: s.done ? "none" : "2px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
              {i < SCHEDULE.length - 1 && <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.07)", minHeight: 28 }} />}
            </div>
            <div style={{ paddingBottom: 20 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, margin: "0 0 3px" }}>{s.date}</p>
              <p style={{ color: s.done ? "#4ade80" : "rgba(255,255,255,0.8)", fontSize: 13, margin: 0 }}>{s.event}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetPanel() {
  const totalConfirmed = BUDGET.filter(b => b.status === "見積確定").reduce((s, b) => s + b.amount, 0);
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>予算</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10, marginBottom: 4 }}>
          {["試験項目", "費用（税込）", "ステータス"].map(h => (
            <span key={h} style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        {BUDGET.map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0 16px", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{b.item}</span>
            <span style={{ color: b.amount > 0 ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: b.amount > 0 ? 600 : 400, textAlign: "right" }}>
              {b.amount > 0 ? `¥${b.amount.toLocaleString()}` : "—"}
            </span>
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: b.status === "見積確定" ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.04)", color: b.status === "見積確定" ? "#4ade80" : "rgba(255,255,255,0.3)", border: `1px solid ${b.status === "見積確定" ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}`, whiteSpace: "nowrap" }}>
              {b.status}
            </span>
          </div>
        ))}
        <div style={{ padding: "16px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>確定合計</span>
          <span style={{ color: "rgba(201,169,98,0.9)", fontSize: 20, fontWeight: 700 }}>¥{totalConfirmed.toLocaleString()}</span>
        </div>
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 14px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0, lineHeight: 1.7 }}>
            吸音性能・難燃性・竹材壁倍率試験の見積は返信待ち。全試験完了予算の概算: <strong style={{ color: "rgba(255,255,255,0.7)" }}>¥400,000〜600,000</strong>（推定）
          </p>
        </div>
      </div>
    </div>
  );
}

function ContactsPanel({ contacts }: { contacts: typeof CONTACTS }) {
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>担当者</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {contacts.map((c, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 18px" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", margin: "0 0 4px" }}>{c.org}</p>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 2px" }}>{c.name}</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "0 0 10px" }}>{c.role}</p>
            <a href={`mailto:${c.email}`} style={{ color: "#60a5fa", fontSize: 12, display: "block", marginBottom: c.tel ? 4 : 0 }}>{c.email}</a>
            {c.tel && <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>TEL: {c.tel}</span>}
          </div>
        ))}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 18px" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", margin: "0 0 4px" }}>GBRC 所在地</p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "0 0 6px", lineHeight: 1.7 }}>〒565-0873 大阪府茨木市 藤白台5丁目8-1</p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "0 0 4px" }}>TEL: 06-6834-0603 / FAX: 06-6834-0618</p>
          <a href="https://www.gbrc.or.jp/" target="_blank" rel="noopener" style={{ color: "#60a5fa", fontSize: 12 }}>www.gbrc.or.jp</a>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "16px 18px" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", margin: "0 0 6px" }}>試験空き状況</p>
          <a href="https://sites.google.com/view/gbrc-testblankday-list" target="_blank" rel="noopener" style={{ color: "#60a5fa", fontSize: 12, display: "block", marginBottom: 6 }}>GBRCテストカレンダー →</a>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>6月下旬〜7月上旬の試験枠を確認し、玉井様へ日程提案すること。</p>
        </div>
      </div>
    </div>
  );
}

function ConstructionStepsPanel() {
  const UNIT_STATUS: Record<string, { label: string; color: string }> = {
    available:   { label: "調達可", color: "#4ade80" },
    development: { label: "開発中", color: "#f59e0b" },
    planned:     { label: "計画中", color: "rgba(255,255,255,0.35)" },
  };
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>建設工程</h2>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "0 0 24px" }}>
        スクリューパイル → 根太 → パネル → 屋根 の4ステップ。26m²ユニット、躯体完成3日。
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {CONSTRUCTION_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.diy ? "rgba(201,169,98,0.15)" : "rgba(255,255,255,0.06)", border: `2px solid ${s.diy ? "rgba(201,169,98,0.5)" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: s.diy ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.4)" }}>
                {i + 1}
              </div>
              {i < CONSTRUCTION_STEPS.length - 1 && <div style={{ width: 2, flex: 1, background: "rgba(255,255,255,0.06)", minHeight: 20, margin: "4px 0" }} />}
            </div>
            <div style={{ paddingBottom: 24, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{s.day}</span>
                <span style={{ padding: "2px 7px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: s.diy ? "rgba(201,169,98,0.12)" : "rgba(255,255,255,0.06)", color: s.diy ? "rgba(201,169,98,0.85)" : "rgba(255,255,255,0.35)", border: `1px solid ${s.diy ? "rgba(201,169,98,0.25)" : "rgba(255,255,255,0.1)"}` }}>
                  {s.diy ? "DIY可" : "外注/注意"}
                </span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{s.team}</span>
              </div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>{s.title}</p>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, margin: "0 0 10px", lineHeight: 1.7 }}>{s.desc}</p>
              {s.materials.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                  {s.materials.map((m, j) => (
                    <span key={j} style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>{m}</span>
                  ))}
                </div>
              )}
              <span style={{ color: "rgba(201,169,98,0.7)", fontSize: 11, fontWeight: 600 }}>{s.cost}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, background: "rgba(201,169,98,0.05)", border: "1px solid rgba(201,169,98,0.15)", borderRadius: 10, padding: "14px 16px" }}>
        <p style={{ color: "rgba(201,169,98,0.8)", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>コスト概算（26m²ユニット・自作）</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "SIPsパネル（工場プレカット）", value: "¥120〜150万" },
            { label: "鋼管杭基礎（外注）", value: "¥50〜70万" },
            { label: "外装・サッシ・設備", value: "¥55〜95万" },
            { label: "合計（DIY）", value: "¥230〜320万" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>{label}</span>
              <span style={{ color: "rgba(201,169,98,0.85)", fontSize: 12, fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  void UNIT_STATUS;
}

function SolunaUnitsPanel() {
  const STATUS_COLOR: Record<string, string> = { available: "#4ade80", development: "#f59e0b", planned: "rgba(255,255,255,0.35)" };
  const STATUS_LABEL: Record<string, string> = { available: "調達可", development: "開発中", planned: "計画中" };
  return (
    <div style={{ padding: "24px", overflowY: "auto", height: "100%" }}>
      <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 6px" }}>SOLUNAオリジナルユニット</h2>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "0 0 24px" }}>
        屋根と窓はSOLUNA独自設計。竹集成・カラマツ間伐材を使った国産ユニット。
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SOLUNA_UNITS.map(u => (
          <div key={u.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <div style={{ background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 8, padding: "6px 10px", flexShrink: 0 }}>
                <span style={{ color: "rgba(201,169,98,0.8)", fontSize: 12, fontWeight: 700 }}>{u.no}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>{u.name}</h3>
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: `${STATUS_COLOR[u.status]}22`, color: STATUS_COLOR[u.status], border: `1px solid ${STATUS_COLOR[u.status]}44` }}>
                    {STATUS_LABEL[u.status]}
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: 0 }}>{u.category}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <p style={{ color: "rgba(201,169,98,0.85)", fontSize: 13, fontWeight: 700, margin: 0 }}>{u.price}</p>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 12px", lineHeight: 1.7 }}>{u.desc}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              {u.specs.map((sp, i) => (
                <span key={i} style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>{sp}</span>
              ))}
            </div>
            <div style={{ background: "rgba(255,80,80,0.06)", border: "1px solid rgba(255,80,80,0.15)", borderRadius: 8, padding: "10px 12px" }}>
              <p style={{ color: "rgba(255,100,100,0.85)", fontSize: 10, letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 3 }}>次のアクション</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{u.nextAction}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Empty state ----
function EmptyReading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.2)", fontSize: 14, flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 36 }}>←</span>
      <span>リストからアイテムを選択してください</span>
    </div>
  );
}

// ---- Main component ----
export default function ConstructionAdmin() {
  const [auth, setAuth] = useState(false);
  const [key, setKey] = useState("");
  const [selectedNav, setSelectedNav] = useState<string>("tests");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tests: true,
    outreach: true,
    schedule: true,
    budget: true,
    contacts: true,
  });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dbOutreach, setDbOutreach] = useState<OutreachItem[] | null>(null);
  const [dbContacts, setDbContacts] = useState<typeof CONTACTS | null>(null);

  useEffect(() => {
    if (!auth) return;
    const adminKey = key || "LIFEISART";
    fetch("/api/admin/construction/outreach", { headers: { "x-admin-key": adminKey } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setDbOutreach(data); }).catch(() => {});
    fetch("/api/admin/construction/contact", { headers: { "x-admin-key": adminKey } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setDbContacts(data); }).catch(() => {});
  }, [auth, key]);

  const outreachData = dbOutreach ?? OUTREACH;
  const contactsData = dbContacts ?? CONTACTS;

  if (!auth) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "48px 40px", width: 340 }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" }}>SOLUNA Admin</p>
          <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 600, marginBottom: 24 }}>建材試験管理</h2>
          <input
            type="password"
            placeholder="Admin Key"
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && key === "LIFEISART") setAuth(true); }}
            style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
          <button
            onClick={() => { if (key === "LIFEISART") setAuth(true); }}
            style={{ marginTop: 12, width: "100%", padding: "12px 0", background: "rgba(201,169,98,0.85)", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  const totalConfirmed = BUDGET.filter(b => b.status === "見積確定").reduce((s, b) => s + b.amount, 0);
  const repliedOutreach = outreachData.filter(o => o.hasReply).length;

  // Derive list items for center pane
  const listItems = getListItems(selectedNav, outreachData);
  const isSinglePanel = ["schedule", "budget", "contacts", "koho", "koho-steps", "koho-units"].includes(selectedNav);

  // Resolve selected item for reading pane
  function resolveSelectedItem() {
    if (!selectedItemId) return null;
    const testItem = TESTS.find(t => t.id === selectedItemId);
    if (testItem) return { kind: "test" as const, data: testItem };
    const outreachItem = outreachData.find(o => o.id === selectedItemId);
    if (outreachItem) return { kind: "outreach" as const, data: outreachItem };
    return null;
  }
  const selectedItem = resolveSelectedItem();

  function toggleSection(id: string) {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function selectNav(id: string) {
    setSelectedNav(id);
    setSelectedItemId(null);
  }

  return (
    <div style={{ height: "100vh", background: "#080808", color: "#fff", fontFamily: "Inter, -apple-system, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
        <Link href="/admin" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textDecoration: "none" }}>← Admin</Link>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
        <div>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>SOLUNA 建設プロジェクト</span>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginLeft: 12 }}>建材試験 & アウトリーチ管理</span>
        </div>
        {/* Summary pills */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "GBRC試験", value: `${TESTS.length}項目` },
            { label: "返信済", value: `${TESTS.filter(t => t.status === "replied").length}件` },
            { label: "アウトリーチ", value: `${outreachData.length}件` },
            { label: "返信あり", value: `${repliedOutreach}件` },
            { label: "確定費用", value: `¥${totalConfirmed.toLocaleString()}` },
          ].map((c, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "5px 12px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{c.label}</span>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Three-column layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left sidebar — nav tree */}
        <div style={{ width: 240, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto", background: "rgba(0,0,0,0.2)" }}>
          <div style={{ padding: "12px 8px" }}>
            {NAV.map(section => (
              <div key={section.id}>
                {/* Section header */}
                <div
                  onClick={() => {
                    toggleSection(section.id);
                    selectNav(section.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: selectedNav === section.id ? "rgba(201,169,98,0.1)" : "transparent",
                    borderLeft: selectedNav === section.id ? "2px solid rgba(201,169,98,0.7)" : "2px solid transparent",
                    marginBottom: 2,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{section.icon}</span>
                  <span style={{ color: selectedNav === section.id ? "rgba(201,169,98,0.95)" : "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, flex: 1 }}>{section.label}</span>
                  {section.children.length > 0 && (
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>{expandedSections[section.id] ? "▼" : "▶"}</span>
                  )}
                </div>
                {/* Children */}
                {expandedSections[section.id] && section.children.map(child => (
                  <div
                    key={child.id}
                    onClick={() => selectNav(child.id)}
                    style={{
                      padding: "6px 12px 6px 34px",
                      cursor: "pointer",
                      borderRadius: 6,
                      background: selectedNav === child.id ? "rgba(201,169,98,0.1)" : "transparent",
                      borderLeft: selectedNav === child.id ? "2px solid rgba(201,169,98,0.6)" : "2px solid transparent",
                      marginBottom: 1,
                    }}
                  >
                    <span style={{ color: selectedNav === child.id ? "rgba(201,169,98,0.9)" : "rgba(255,255,255,0.5)", fontSize: 12 }}>{child.label}</span>
                  </div>
                ))}
                <div style={{ height: 4 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Center list pane */}
        {!isSinglePanel && (
          <div style={{ flex: 1, minWidth: 300, borderRight: "1px solid rgba(255,255,255,0.07)", overflowY: "auto", background: "#080808" }}>
            {/* List header */}
            <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "#080808", zIndex: 1 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
                {selectedNav.replace("test-", "").replace("out-", "")} — {listItems.length}件
              </span>
            </div>
            {listItems.map(item => {
              if (item.kind === "test") {
                return (
                  <TestRow
                    key={item.data.id}
                    item={item.data}
                    selected={selectedItemId === item.data.id}
                    onSelect={() => setSelectedItemId(item.data.id)}
                  />
                );
              }
              if (item.kind === "outreach") {
                return (
                  <OutreachRow
                    key={item.data.id}
                    item={item.data}
                    selected={selectedItemId === item.data.id}
                    onSelect={() => setSelectedItemId(item.data.id)}
                  />
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Right reading pane */}
        <div style={{ width: isSinglePanel ? undefined : 360, flex: isSinglePanel ? 1 : undefined, flexShrink: 0, overflowY: "auto", background: "#080808" }}>
          {isSinglePanel ? (
            selectedNav === "schedule" ? <SchedulePanel /> :
            selectedNav === "budget" ? <BudgetPanel /> :
            selectedNav === "contacts" ? <ContactsPanel contacts={contactsData} /> :
            (selectedNav === "koho" || selectedNav === "koho-steps") ? <ConstructionStepsPanel /> :
            selectedNav === "koho-units" ? <SolunaUnitsPanel /> : null
          ) : (
            selectedItem ? (
              selectedItem.kind === "test" ? <TestDetail item={selectedItem.data} /> :
              selectedItem.kind === "outreach" ? <OutreachDetail item={selectedItem.data} /> : null
            ) : (
              <EmptyReading />
            )
          )}
        </div>
      </div>
    </div>
  );
}
