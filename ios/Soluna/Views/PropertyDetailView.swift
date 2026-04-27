import SwiftUI
import MapKit

struct PropertyDetailView: View {
    let property: Property
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0
    @StateObject private var authService = AuthService.shared
    @State private var showLoginSheet = false
    @State private var pendingDestination: Int? = nil  // 1=booking, 2=purchase
    @State private var navigateToBooking = false
    @State private var navigateToPurchase = false

    var statusColor: Color {
        switch property.status {
        case .open: return Color(hex: "9bc46d")
        case .coming: return Color(hex: "c8a455")
        case .plan: return .gray
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Photo gallery
                    if !property.galleryURLs.isEmpty {
                        TabView {
                            ForEach(property.galleryURLs, id: \.self) { imgPath in
                                CachedAsyncImage(url: URL(string: "\(PropertyStore.cdnURL)/img/\(imgPath)")) {
                                    Rectangle().fill(Color(hex: "0a0a0a"))
                                }
                                .clipped()
                            }
                        }
                        .tabViewStyle(.page(indexDisplayMode: .always))
                        .frame(height: 280)
                    } else if let img = property.imageURL {
                        CachedAsyncImage(url: URL(string: "\(PropertyStore.cdnURL)/img/\(img).webp")) {
                            Rectangle().fill(Color(hex: "0a0a0a"))
                        }
                        .frame(height: 280)
                        .clipped()
                    }

                    VStack(alignment: .leading, spacing: 16) {
                        // Status + Name
                        HStack(spacing: 6) {
                            Circle().fill(statusColor).frame(width: 7, height: 7)
                            Text(property.status.label)
                                .font(.system(size: 10, weight: .bold))
                                .foregroundStyle(statusColor)
                        }
                        Text(property.name)
                            .font(.system(size: 26, weight: .heavy))
                            .tracking(-0.5)
                        Text(property.location)
                            .font(.system(size: 12))
                            .foregroundStyle(.gray)
                        Text(property.description)
                            .font(.system(size: 13))
                            .foregroundStyle(.gray.opacity(0.7))
                            .lineSpacing(6)

                        // Price
                        if let price = property.price {
                            HStack {
                                Text(price)
                                    .font(.system(size: 20, weight: .heavy))
                                    .foregroundStyle(Color("Gold"))
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color("Gold").opacity(0.06))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color("Gold").opacity(0.2), lineWidth: 1))
                        }

                        // Specs
                        if !property.specs.isEmpty {
                            VStack(spacing: 0) {
                                ForEach(property.specs) { spec in
                                    HStack {
                                        Text(spec.key)
                                            .font(.system(size: 11))
                                            .foregroundStyle(.gray)
                                        Spacer()
                                        Text(spec.value)
                                            .font(.system(size: 11, weight: .semibold))
                                            .foregroundStyle(.white.opacity(0.8))
                                            .multilineTextAlignment(.trailing)
                                    }
                                    .padding(.vertical, 12)
                                    if spec.id != property.specs.last?.id {
                                        Divider().background(Color.white.opacity(0.04))
                                    }
                                }
                            }
                            .padding(16)
                            .background(Color(hex: "0a0a0a"))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        // Schedule
                        if !property.schedule.isEmpty {
                            Text("施工スケジュール")
                                .font(.system(size: 9, weight: .heavy))
                                .tracking(2)
                                .foregroundStyle(.gray)
                                .padding(.top, 8)

                            VStack(alignment: .leading, spacing: 0) {
                                ForEach(property.schedule) { item in
                                    ScheduleRow(item: item)
                                }
                            }
                            .padding(16)
                            .background(Color(hex: "0a0a0a"))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }

                        // Map
                        Map {
                            Marker(property.name, coordinate: property.coordinate)
                                .tint(statusColor)
                        }
                        .mapStyle(.imagery)
                        .frame(height: 200)
                        .clipShape(RoundedRectangle(cornerRadius: 12))

                        // Tab picker
                        Picker("", selection: $selectedTab) {
                            Text("概要").tag(0)
                            Text("予約").tag(1)
                            Text("ガイド").tag(2)
                        }
                        .pickerStyle(.segmented)
                        .padding(.top, 8)

                        if selectedTab == 1 {
                            // Booking button — requires login
                            Button {
                                if authService.isLoggedIn {
                                    navigateToBooking = true
                                } else {
                                    pendingDestination = 1
                                    showLoginSheet = true
                                }
                            } label: {
                                Label("宿泊予約へ", systemImage: "calendar.badge.plus")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(Color(hex: "050505"))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(Color("Gold"))
                                    .clipShape(Capsule())
                            }
                            .background(NavigationLink("", destination: BookingView(), isActive: $navigateToBooking))

                            // Purchase button — requires login
                            Button {
                                if authService.isLoggedIn {
                                    navigateToPurchase = true
                                } else {
                                    pendingDestination = 2
                                    showLoginSheet = true
                                }
                            } label: {
                                Label("口数を購入", systemImage: "creditcard")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundStyle(Color("Gold"))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(Color("Gold").opacity(0.1))
                                    .clipShape(Capsule())
                                    .overlay(Capsule().stroke(Color("Gold").opacity(0.3), lineWidth: 1))
                            }
                            .background(NavigationLink("", destination: PurchaseView(prefilledEmail: ""), isActive: $navigateToPurchase))
                        } else if selectedTab == 2 {
                            GuideView(slug: property.id)
                                .frame(minHeight: 300)
                        } else {
                            // Investment simulator
                            if let sim = InvestmentSim.data[property.id] {
                                investmentCard(sim)
                            }
                            // CTA
                            Link(destination: URL(string: "\(PropertyStore.baseURL)/\(property.url)")!) {
                                Text("Webで詳細を見る")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(Color(hex: "050505"))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(Color("Gold"))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(20)
                }
            }
            .background(Color(hex: "050505"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.gray)
                    }
                }
            }
            .sheet(isPresented: $showLoginSheet, onDismiss: {
                // After login, proceed to pending destination
                guard authService.isLoggedIn else { return }
                if pendingDestination == 1 { navigateToBooking = true }
                else if pendingDestination == 2 { navigateToPurchase = true }
                pendingDestination = nil
            }) {
                NavigationStack {
                    LoginView()
                        .navigationTitle("ログイン")
                        .navigationBarTitleDisplayMode(.inline)
                        .toolbar {
                            ToolbarItem(placement: .topBarLeading) {
                                Button("閉じる") { showLoginSheet = false }
                                    .foregroundStyle(Color("Gold"))
                            }
                        }
                }
            }
        }
    }
}

// MARK: - Investment Simulator Data

struct InvestmentSim {
    let priceYen: Int
    let stayPriceYen: Int
    let nights: Int
    let airbnbPriceYen: Int?

    var annualMarketValue: Int? { airbnbPriceYen.map { $0 * nights } }
    var paybackYears: Double? { annualMarketValue.map { Double(priceYen) / Double($0) } }
    var annualSaving: Int? { airbnbPriceYen.map { ($0 - stayPriceYen) * nights } }

    static func man(_ yen: Int) -> String {
        let man = yen / 10_000
        return man >= 10_000 ? "¥\(man / 10_000)億\(man % 10_000 > 0 ? "\(man % 10_000)万" : "")"
                             : "¥\(man)万"
    }

    static let data: [String: InvestmentSim] = [
        "lodge":    InvestmentSim(priceYen: 4_900_000,  stayPriceYen: 35_000,  nights: 30, airbnbPriceYen: 52_000),
        "nesting":  InvestmentSim(priceYen: 8_900_000,  stayPriceYen: 38_000,  nights: 30, airbnbPriceYen: 44_000),
        "atami":    InvestmentSim(priceYen: 19_000_000, stayPriceYen: 55_000,  nights: 36, airbnbPriceYen: 90_000),
        "instant":  InvestmentSim(priceYen: 1_200_000,  stayPriceYen: 25_000,  nights: 30, airbnbPriceYen: 32_000),
        "tapkop":   InvestmentSim(priceYen: 80_000_000, stayPriceYen: 340_000, nights: 30, airbnbPriceYen: nil),
        "honolulu": InvestmentSim(priceYen: 28_000_000, stayPriceYen: 85_000,  nights: 30, airbnbPriceYen: 150_000),
        "maui":     InvestmentSim(priceYen: 38_000_000, stayPriceYen: 120_000, nights: 30, airbnbPriceYen: 175_000),
        "kumaushi": InvestmentSim(priceYen: 4_800_000,  stayPriceYen: 80_000,  nights: 30, airbnbPriceYen: 100_000),
        "village":  InvestmentSim(priceYen: 4_900_000,  stayPriceYen: 30_000,  nights: 30, airbnbPriceYen: 38_000),
    ]
}

// MARK: - investmentCard (used in PropertyDetailView)

extension PropertyDetailView {
    @ViewBuilder
    func investmentCard(_ sim: InvestmentSim) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("投資シミュレーション")
                    .font(.system(size: 11, weight: .heavy))
                    .tracking(1)
                    .foregroundStyle(Color(hex: "c8a455"))
                Spacer()
                if let years = sim.paybackYears {
                    Text(String(format: "約%.1f年で市場価値回収", years))
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(Color(hex: "9bc46d"))
                        .padding(.horizontal, 8).padding(.vertical, 3)
                        .background(Color(hex: "9bc46d").opacity(0.12))
                        .clipShape(Capsule())
                }
            }

            HStack(spacing: 0) {
                simItem(title: "取得価格", value: InvestmentSim.man(sim.priceYen), sub: "1口")
                Divider().background(Color.white.opacity(0.08)).frame(height: 44)
                simItem(title: "オーナー利用", value: InvestmentSim.man(sim.stayPriceYen), sub: "1泊")
                if let airbnb = sim.airbnbPriceYen {
                    Divider().background(Color.white.opacity(0.08)).frame(height: 44)
                    simItem(title: "Airbnb相場", value: InvestmentSim.man(airbnb), sub: "1泊", accent: false, muted: true)
                }
            }

            if let saving = sim.annualSaving {
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 11))
                        .foregroundStyle(Color(hex: "9bc46d"))
                    Text("年\(sim.nights)泊で市場比 \(InvestmentSim.man(saving)) お得（Airbnb換算）")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(.white.opacity(0.8))
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(hex: "9bc46d").opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
        }
        .padding(16)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "c8a455").opacity(0.15), lineWidth: 1))
        .padding(.bottom, 4)
    }

    private func simItem(title: String, value: String, sub: String, accent: Bool = false, muted: Bool = false) -> some View {
        VStack(spacing: 3) {
            Text(title)
                .font(.system(size: 9))
                .foregroundStyle(.gray)
            Text(value)
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(accent ? Color(hex: "9bc46d") : muted ? Color.gray : .white)
                .minimumScaleFactor(0.7)
            Text(sub)
                .font(.system(size: 9))
                .foregroundStyle(.gray)
        }
        .frame(maxWidth: .infinity)
    }
}

struct ScheduleRow: View {
    let item: ScheduleItem

    var dotColor: Color {
        if item.isDone { return Color(hex: "9bc46d") }
        if item.isHighlight { return Color(hex: "f59e0b") }
        return Color(hex: "333333")
    }

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(spacing: 0) {
                Circle()
                    .fill(dotColor)
                    .frame(width: 10, height: 10)
                if !item.isDone {
                    Rectangle()
                        .fill(Color.white.opacity(0.04))
                        .frame(width: 1, height: 30)
                }
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(item.date)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(dotColor)
                Text(item.title)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(item.isDone ? .gray : .white.opacity(0.7))
                Text(item.detail)
                    .font(.system(size: 10))
                    .foregroundStyle(.gray.opacity(0.5))
                    .lineSpacing(4)
            }
            Spacer()
            if item.isDone {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(Color(hex: "9bc46d"))
                    .font(.system(size: 14))
            }
        }
        .padding(.vertical, 8)
    }
}
