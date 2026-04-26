import Foundation
import CoreLocation

enum PropertyStatus: String, Codable, CaseIterable {
    case open = "open"
    case coming = "coming"
    case plan = "plan"

    var label: String {
        switch self {
        case .open: return "稼働中"
        case .coming: return "建設中"
        case .plan: return "計画中"
        }
    }

    var color: String {
        switch self {
        case .open: return "StatusOpen"
        case .coming: return "StatusComing"
        case .plan: return "StatusPlan"
        }
    }
}

struct Property: Identifiable, Codable, Hashable {
    static func == (lhs: Property, rhs: Property) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }

    let id: String
    let name: String
    let location: String
    let description: String
    let latitude: Double
    let longitude: Double
    let status: PropertyStatus
    let url: String
    let imageURL: String?
    let galleryURLs: [String]
    let price: String?
    let specs: [PropertySpec]
    let schedule: [ScheduleItem]

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

struct PropertySpec: Codable, Identifiable {
    var id: String { key }
    let key: String
    let value: String
}

struct ScheduleItem: Codable, Identifiable {
    var id: String { date + title }
    let date: String
    let title: String
    let detail: String
    let isDone: Bool
    let isHighlight: Bool
}

extension Property {
    static let allProperties: [Property] = [
        Property(
            id: "whitehouse-atami",
            name: "WHITE HOUSE 熱海",
            location: "静岡県 熱海市",
            description: "プール付き・東京から45分。相模湾を望む崖上ヴィラ。稼働中。",
            latitude: 35.097, longitude: 139.072,
            status: .open, url: "atami.html",
            imageURL: "atami_cliff_view",
            galleryURLs: ["atami_cliff_view.webp"],
            price: nil,
            specs: [
                PropertySpec(key: "アクセス", value: "東京から45分"),
                PropertySpec(key: "設備", value: "プライベートプール"),
                PropertySpec(key: "ビュー", value: "180° オーシャンビュー")
            ],
            schedule: [
                ScheduleItem(date: "完了", title: "建設・開業", detail: "崖上ヴィラ完成。稼働中", isDone: true, isHighlight: false)
            ]
        ),
        Property(
            id: "atami-2",
            name: "熱海２",
            location: "静岡県 熱海市 / 山上",
            description: "WHITE HOUSE上方の山林。崖上パノラマの開発予定地。",
            latitude: 35.115, longitude: 139.052,
            status: .coming, url: "atami.html",
            imageURL: nil,
            galleryURLs: [],
            price: nil,
            specs: [],
            schedule: [
                ScheduleItem(date: "計画中", title: "開発予定", detail: "WHITE HOUSE上方の山林開発", isDone: false, isHighlight: false)
            ]
        ),
        Property(
            id: "wakayama",
            name: "SOLUNA 和歌山",
            location: "和歌山県 / 熊野古道",
            description: "熊野古道・瞑想・断食・ヨガ。2028年着工予定。",
            latitude: 33.720, longitude: 135.360,
            status: .plan, url: "wakayama.html",
            imageURL: "wakayama_real1",
            galleryURLs: ["wakayama_real1.jpg", "wakayama_real2.jpg", "wakayama_render1.jpg"],
            price: nil,
            specs: [
                PropertySpec(key: "エリア", value: "世界遺産 熊野古道"),
                PropertySpec(key: "着工", value: "2028年予定"),
                PropertySpec(key: "コンセプト", value: "瞑想・断食・ヨガ")
            ],
            schedule: [
                ScheduleItem(date: "2028年", title: "着工予定", detail: "先行登録受付中", isDone: false, isHighlight: false)
            ]
        ),
        Property(
            id: "tapkop",
            name: "TAPKOP",
            location: "北海道 弟子屈 / 阿寒摩周国立公園",
            description: "1泊34万円・★5.0 Airbnb稼働中。PAN-PROJECTS設計 266㎡。",
            latitude: 43.527, longitude: 144.465,
            status: .open, url: "tapkop-story.html",
            imageURL: "tapkop_real1",
            galleryURLs: ["tapkop_real1.webp", "tapkop_real4.webp", "tapkop_real5.webp"],
            price: "¥3,900万/口",
            specs: [
                PropertySpec(key: "1泊単価", value: "¥340,000"),
                PropertySpec(key: "年間売上", value: "¥5,000万（参考）"),
                PropertySpec(key: "Airbnb", value: "★ 5.0"),
                PropertySpec(key: "面積", value: "266㎡"),
                PropertySpec(key: "設計", value: "PAN-PROJECTS")
            ],
            schedule: [
                ScheduleItem(date: "完了", title: "稼働中", detail: "Airbnb スーパーホスト6年継続", isDone: true, isHighlight: false)
            ]
        ),
        Property(
            id: "the-lodge",
            name: "THE LODGE",
            location: "北海道 弟子屈 / 美留和",
            description: "天然温泉付き・最大12名収容。星空温泉と北海道の静けさ。",
            latitude: 43.530, longitude: 144.390,
            status: .open, url: "lodge-story.html",
            imageURL: "lodge_new1",
            galleryURLs: ["lodge_new1.webp", "lodge_interior.webp", "village_night_milkyway.webp"],
            price: nil,
            specs: [
                PropertySpec(key: "収容", value: "最大12名"),
                PropertySpec(key: "温泉", value: "天然温泉 源泉かけ流し"),
                PropertySpec(key: "暖房", value: "薪ストーブ")
            ],
            schedule: [
                ScheduleItem(date: "完了", title: "稼働中", detail: "天然温泉付きロッジ。スーパーホスト認定", isDone: true, isHighlight: false),
                ScheduleItem(date: "計画中", title: "露天デッキ拡張", detail: "サウナ棟増築予定", isDone: false, isHighlight: false)
            ]
        ),
        Property(
            id: "miruwa-grand",
            name: "美留和グランド",
            location: "北海道 弟子屈 / 32,337坪",
            description: "8棟100人ビレッジ。コンテナ・ドーム・タワーサウナ・ログ。",
            latitude: 43.540, longitude: 144.395,
            status: .coming, url: "miruwa-grand.html",
            imageURL: "miruwa_land_real1",
            galleryURLs: ["miruwa_land_real1.jpg", "dome_exterior_winter.webp", "sauna_tower.webp"],
            price: "¥530万〜/口（ボンディングカーブ）",
            specs: [
                PropertySpec(key: "面積", value: "32,337坪（106,899㎡）"),
                PropertySpec(key: "口数", value: "100口限定・紹介制"),
                PropertySpec(key: "利用権", value: "年8泊・全棟利用可"),
                PropertySpec(key: "完売時価格", value: "¥1,480万")
            ],
            schedule: [
                ScheduleItem(date: "完了", title: "土地取得済", detail: "32,337坪取得完了", isDone: true, isHighlight: false),
                ScheduleItem(date: "2026年", title: "着工準備中", detail: "8棟ビレッジ建設開始", isDone: false, isHighlight: true)
            ]
        ),
        Property(
            id: "dome-house",
            name: "DOME HOUSE",
            location: "北海道 弟子屈 / SOLUNA村",
            description: "球面ドーム・残響0.8秒の音響空間。映画・音楽・瞑想に最適。",
            latitude: 43.534, longitude: 144.382,
            status: .coming, url: "dome-story.html",
            imageURL: "dome_exterior_winter",
            galleryURLs: [],
            price: nil,
            specs: [
                PropertySpec(key: "直径", value: "9m"),
                PropertySpec(key: "残響時間", value: "0.8秒"),
                PropertySpec(key: "音響", value: "32ch イマーシブ")
            ],
            schedule: [
                ScheduleItem(date: "2026年6月", title: "設計確定・EPS発注", detail: "建築確認申請", isDone: false, isHighlight: false),
                ScheduleItem(date: "2026年9月", title: "ドーム本体搬入", detail: "72時間で組立", isDone: false, isHighlight: true),
                ScheduleItem(date: "2027年3月", title: "竣工", detail: "32ch音響完成", isDone: false, isHighlight: false)
            ]
        ),
        Property(
            id: "offgrid-cabin",
            name: "OFF-GRID CABIN",
            location: "北海道 弟子屈 / 完全自立型",
            description: "Solar+V2H・井戸+雨水。電力・水道完全独立型コンテナ。",
            latitude: 43.537, longitude: 144.378,
            status: .coming, url: "offgrid.html",
            imageURL: nil,
            galleryURLs: [],
            price: nil,
            specs: [
                PropertySpec(key: "電力", value: "太陽光3.2kW + Tesla V2H 14kWh"),
                PropertySpec(key: "水道", value: "井戸 + 雨水1,000L×2"),
                PropertySpec(key: "通信", value: "Starlink")
            ],
            schedule: [
                ScheduleItem(date: "〜6/10", title: "事前準備完了", detail: "基礎・コンテナ・電気ラフイン・V2H搬入", isDone: true, isHighlight: false),
                ScheduleItem(date: "6/11", title: "DAY1: 電力系統", detail: "太陽光パネル・V2H接続・蓄電テスト", isDone: false, isHighlight: true),
                ScheduleItem(date: "6/12", title: "DAY2: 内装・給排水", detail: "薪ストーブ・キッチン・換気システム", isDone: false, isHighlight: true),
                ScheduleItem(date: "6/13", title: "DAY3: フル稼働テスト", detail: "全設備テスト・完全オフグリッド試泊", isDone: false, isHighlight: true)
            ]
        ),
        Property(
            id: "tenku-dojo",
            name: "天空道場",
            location: "北海道 弟子屈 / 熊牛原野",
            description: "BJJ道場+バレルサウナ+星空テラス。",
            latitude: 43.640, longitude: 144.420,
            status: .coming, url: "kumaushi.html",
            imageURL: "kumaushi_a_rooftop_mats",
            galleryURLs: ["kumaushi_a_rooftop_mats.webp"],
            price: "¥900万/口",
            specs: [
                PropertySpec(key: "コンセプト", value: "BJJ道場 + サウナ + 星空テラス"),
                PropertySpec(key: "構造", value: "コンテナ2棟"),
                PropertySpec(key: "電力", value: "Tesla V2H + 太陽光")
            ],
            schedule: [
                ScheduleItem(date: "5月", title: "基礎・コンテナ完了", detail: "スクリューパイル・コンテナ2棟設置", isDone: true, isHighlight: false),
                ScheduleItem(date: "7月", title: "部材発注", detail: "薪ストーブ・サウナ・V2H", isDone: false, isHighlight: false),
                ScheduleItem(date: "8月", title: "断熱・電気", detail: "断熱施工・Starlink・デッキ根太", isDone: false, isHighlight: false),
                ScheduleItem(date: "9月上旬", title: "大型部材到着", detail: "サウナ・V2H・バレルバス搬入", isDone: false, isHighlight: false),
                ScheduleItem(date: "9/20-21", title: "WORK PARTY", detail: "デッキ板貼り・煙突接続・初火入れ・試泊", isDone: false, isHighlight: true),
                ScheduleItem(date: "2027年4月", title: "正式開業", detail: "¥80,000/泊", isDone: false, isHighlight: false)
            ]
        ),
        Property(
            id: "soluna-zero",
            name: "SOLUNA ZERO",
            location: "北海道 屈斜路 / 地下施設",
            description: "40ftコンテナ16本を地中に埋める。地下回廊200m・総工費¥10億。",
            latitude: 43.558, longitude: 144.345,
            status: .plan, url: "collection.html",
            imageURL: nil,
            galleryURLs: [],
            price: nil,
            specs: [
                PropertySpec(key: "構造", value: "40ftコンテナ × 16本 地中埋設"),
                PropertySpec(key: "規模", value: "地下回廊200m"),
                PropertySpec(key: "総工費", value: "¥10億")
            ],
            schedule: []
        ),
        Property(
            id: "nesting",
            name: "NESTING",
            location: "東京近郊 / リトリートヴィラ",
            description: "東京から2時間以内・モダン和風。10区画・静寂のリトリート。",
            latitude: 35.680, longitude: 139.795,
            status: .coming, url: "nesting-story.html",
            imageURL: "nesting_wide",
            galleryURLs: [],
            price: nil,
            specs: [
                PropertySpec(key: "アクセス", value: "東京から2時間"),
                PropertySpec(key: "区画", value: "10区画限定"),
                PropertySpec(key: "スタイル", value: "和モダン")
            ],
            schedule: [
                ScheduleItem(date: "完了", title: "土地取得", detail: "用地選定・取得完了", isDone: true, isHighlight: false),
                ScheduleItem(date: "2026 Q3", title: "設計確定", detail: "和モダン建築・10区画配置", isDone: false, isHighlight: false),
                ScheduleItem(date: "2027 Q3", title: "竣工・開業", detail: "静寂のリトリート", isDone: false, isHighlight: false)
            ]
        )
    ]
}
