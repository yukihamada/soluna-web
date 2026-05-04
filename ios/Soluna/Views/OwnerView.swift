import SwiftUI

struct OwnerView: View {
    @StateObject private var authService = AuthService.shared

    var body: some View {
        NavigationStack {
            if authService.isLoggedIn {
                OwnerDashboard()
            } else {
                LoginView()
            }
        }
        .task {
            if authService.isLoggedIn {
                await authService.fetchMe()
            }
        }
    }
}

// MARK: - Login View

struct LoginView: View {
    @StateObject private var authService = AuthService.shared
    @State private var email = ""
    @State private var otpCode = ""
    @State private var otpSent = false
    @State private var showStaffLogin = false
    @State private var staffId = ""
    @State private var staffPassword = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                Spacer().frame(height: 60)

                VStack(spacing: 6) {
                    Text("SOLUNA")
                        .font(.system(size: 14, weight: .heavy))
                        .tracking(6)
                        .foregroundStyle(Color("Gold"))
                    Text("CABIN CLUB")
                        .font(.system(size: 9, weight: .bold))
                        .tracking(4)
                        .foregroundStyle(Color("Gold").opacity(0.5))
                }
                .padding(.bottom, 40)

                if otpSent {
                    otpVerifyForm
                } else if showStaffLogin {
                    staffLoginForm
                } else {
                    memberLoginForm
                }

                if let error = authService.errorMessage {
                    Text(error)
                        .font(.system(size: 11))
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .padding(.top, 8)
                }

                Spacer().frame(height: 40)

                VStack(spacing: 12) {
                    if !showStaffLogin && !otpSent {
                        Button {
                            withAnimation { showStaffLogin = true }
                        } label: {
                            Text("スタッフ・オーナーIDでログイン")
                                .font(.system(size: 11))
                                .foregroundStyle(Color("Gold").opacity(0.4))
                        }
                    } else if showStaffLogin {
                        Button {
                            withAnimation { showStaffLogin = false; authService.errorMessage = nil }
                        } label: {
                            Text("← メールで確認")
                                .font(.system(size: 11))
                                .foregroundStyle(Color("Gold").opacity(0.6))
                        }
                    }
                    Link("会員権を取得する", destination: URL(string: "https://solun.art/buy.html")!)
                        .font(.system(size: 11))
                        .foregroundStyle(.gray.opacity(0.5))
                }
                .padding(.bottom, 48)
            }
        }
        .background(Color(hex: "050505"))
        .navigationTitle("オーナー")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Step 1: Email entry

    private var memberLoginForm: some View {
        VStack(spacing: 20) {
            VStack(spacing: 6) {
                Text("メールアドレスを入力")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(.white)
                Text("6桁のログインコードをお送りします")
                    .font(.system(size: 11))
                    .foregroundStyle(.gray)
            }
            .padding(.bottom, 4)

            VStack(spacing: 12) {
                TextField("メールアドレス", text: $email)
                    .keyboardType(.emailAddress)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.never)
                    .solunaTextFieldStyle()

                Button {
                    Task {
                        let sent = await authService.sendMemberLink(email: email)
                        if sent { withAnimation { otpSent = true } }
                    }
                } label: {
                    HStack(spacing: 8) {
                        if authService.isLoading {
                            ProgressView().tint(Color(hex: "050505")).scaleEffect(0.85)
                        }
                        Text(authService.isLoading ? "送信中..." : "コードを送信")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "050505"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(!email.contains("@") || authService.isLoading ? Color("Gold").opacity(0.3) : Color("Gold"))
                    .clipShape(Capsule())
                }
                .disabled(!email.contains("@") || authService.isLoading)
            }
            .padding(.horizontal, 32)
        }
    }

    // MARK: - Step 2: OTP code entry

    private var otpVerifyForm: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle().fill(Color("Gold").opacity(0.1)).frame(width: 80, height: 80)
                Image(systemName: "envelope.badge.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(Color("Gold"))
            }
            VStack(spacing: 6) {
                Text("コードを入力")
                    .font(.system(size: 18, weight: .heavy))
                Text("\(email) に\n6桁のコードを送りました")
                    .font(.system(size: 12))
                    .foregroundStyle(.gray)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }

            VStack(spacing: 12) {
                TextField("123456", text: $otpCode)
                    .keyboardType(.numberPad)
                    .font(.system(size: 28, weight: .bold, design: .monospaced))
                    .multilineTextAlignment(.center)
                    .solunaTextFieldStyle()

                Button {
                    Task {
                        let ok = await authService.verifyOTP(email: email, code: otpCode)
                        if !ok { otpCode = "" }
                    }
                } label: {
                    HStack(spacing: 8) {
                        if authService.isLoading {
                            ProgressView().tint(Color(hex: "050505")).scaleEffect(0.85)
                        }
                        Text(authService.isLoading ? "確認中..." : "ログイン")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "050505"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 15)
                    .background(otpCode.count == 6 && !authService.isLoading ? Color("Gold") : Color("Gold").opacity(0.3))
                    .clipShape(Capsule())
                }
                .disabled(otpCode.count != 6 || authService.isLoading)

                Button {
                    withAnimation { otpSent = false; otpCode = ""; authService.errorMessage = nil }
                } label: {
                    Text("別のメールアドレスで試す")
                        .font(.system(size: 12))
                        .foregroundStyle(Color("Gold").opacity(0.7))
                }
            }
            .padding(.horizontal, 32)
        }
    }

    // MARK: - Staff login (ID/Password — hidden)

    private var staffLoginForm: some View {
        VStack(spacing: 12) {
            TextField("オーナーID / スタッフID", text: $staffId)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
                .solunaTextFieldStyle()
            SecureField("パスワード", text: $staffPassword)
                .solunaTextFieldStyle()
            Button {
                Task { await authService.login(id: staffId, password: staffPassword) }
            } label: {
                HStack {
                    if authService.isLoading { ProgressView().tint(Color(hex: "050505")) }
                    Text("ログイン").font(.system(size: 14, weight: .bold))
                }
                .foregroundStyle(Color(hex: "050505"))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(
                    !staffId.isEmpty && !staffPassword.isEmpty && !authService.isLoading
                        ? Color("Gold") : Color("Gold").opacity(0.3)
                )
                .clipShape(Capsule())
            }
            .disabled(staffId.isEmpty || staffPassword.isEmpty || authService.isLoading)
        }
        .padding(.horizontal, 32)
    }
}

// MARK: - Custom dark TextField style

struct SolunaTextFieldModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(12)
            .background(Color(hex: "0a0a0a"))
            .cornerRadius(8)
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.white.opacity(0.08)))
            .foregroundStyle(.white)
    }
}

extension View {
    func solunaTextFieldStyle() -> some View {
        modifier(SolunaTextFieldModifier())
    }
}

// MARK: - Owner Dashboard

struct StayInfo: Codable {
    let used: Int
    let remaining: Int
    let total: Int
}

struct MyPurchase: Codable, Identifiable {
    let id: String
    let property_id: String
    let quantity: Int
    let status: String
    let tag_id: String?
    let amount_jpy: Int?
    let created_at: String?
}

struct OwnerDashboard: View {
    @StateObject private var authService = AuthService.shared
    @EnvironmentObject private var appState: AppState
    @State private var stayInfo: StayInfo?
    @State private var myPurchases: [MyPurchase] = []
    @State private var showReferralShare = false

    private let baseURL = "https://solun.art"

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Welcome banner
                welcomeBanner

                // Next event card
                NextEventCard()

                // Stats row
                HStack(spacing: 10) {
                    StatCard(value: "\(stayInfo?.total ?? 8)", unit: "泊", label: "年間利用権")
                    StatCard(value: "\(stayInfo?.used ?? 0)", unit: "泊", label: "利用済み")
                    StatCard(value: "\(stayInfo?.remaining ?? 8)", unit: "泊", label: "残り")
                }

                // Quick purchase card (one-click)
                QuickPurchaseCard()

                // Quick actions
                VStack(spacing: 2) {
                    NavigationLink(destination: BookingView()) {
                        QuickAction(icon: "calendar.badge.plus", title: "宿泊予約", subtitle: "物件を選んで日程を決める")
                    }
                    .buttonStyle(.plain)

                    NavigationLink(destination: WorkPartyView()) {
                        QuickAction(icon: "wrench.and.screwdriver", title: "Work Party", subtitle: "次回: 6/11-13 OFF-GRID CABIN")
                    }
                    .buttonStyle(.plain)

                    NavigationLink(destination: PurchaseView(prefilledEmail: authService.currentUser?.id ?? "")) {
                        QuickAction(icon: "slider.horizontal.3", title: "口数を指定して購入", subtitle: "1〜5口 | 詳細設定")
                    }
                    .buttonStyle(.plain)

                    Button {
                        showReferralShare = true
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "person.2.fill")
                            Text("友達を招待する")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color(hex: "4a9a6a").opacity(0.15))
                        .foregroundStyle(Color(hex: "4a9a6a"))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color(hex: "4a9a6a").opacity(0.3), lineWidth: 1))
                    }
                    .sheet(isPresented: $showReferralShare) {
                        ReferralShareView()
                    }
                }

                // My purchases
                if !myPurchases.isEmpty {
                    myPurchasesSection
                }

                // Legal links
                HStack(spacing: 0) {
                    Link("プライバシーポリシー", destination: URL(string: "https://solun.art/privacy.html")!)
                    Text(" · ").foregroundStyle(.gray.opacity(0.3))
                    Link("利用規約", destination: URL(string: "https://solun.art/terms.html")!)
                    Text(" · ").foregroundStyle(.gray.opacity(0.3))
                    Link("特定商取引法", destination: URL(string: "https://solun.art/tokushoho.html")!)
                }
                .font(.system(size: 10))
                .foregroundStyle(.gray.opacity(0.4))
                .frame(maxWidth: .infinity)

                // Logout
                Button { authService.logout() } label: {
                    HStack {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("ログアウト")
                    }
                    .font(.system(size: 12))
                    .foregroundStyle(.gray)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                }
            }
            .padding(16)
        }
        .background(Color(hex: "050505"))
        .navigationTitle("ダッシュボード")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await fetchStayInfo()
            await fetchMyPurchases()
        }
        .onChange(of: appState.pendingPurchaseSuccessId) { _, _ in
            // Refresh purchases when a payment completes
            Task { await fetchMyPurchases() }
        }
    }

    private var welcomeBanner: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("ようこそ、オーナー")
                .font(.system(size: 22, weight: .heavy))
            HStack {
                Text("SOLUNA CABIN CLUB メンバー")
                    .font(.system(size: 11))
                    .foregroundStyle(Color("Gold"))
                Spacer()
                if let user = authService.currentUser {
                    Text(user.id)
                        .font(.system(size: 10))
                        .foregroundStyle(.gray)
                }
            }
        }
        .padding(20)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(colors: [Color("Gold").opacity(0.08), .clear], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color("Gold").opacity(0.15), lineWidth: 1))
    }

    private var myPurchasesSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("CABIN CLUB 保有口数")
                .font(.system(size: 9, weight: .heavy))
                .tracking(2)
                .foregroundStyle(.gray)

            ForEach(myPurchases) { purchase in
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(purchase.property_id.uppercased())
                            .font(.system(size: 13, weight: .bold))
                            .foregroundStyle(.white)
                        if let tagId = purchase.tag_id {
                            Text(String(tagId.prefix(16)) + "...")
                                .font(.system(size: 9, design: .monospaced))
                                .foregroundStyle(.gray)
                        }
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("\(purchase.quantity)口")
                            .font(.system(size: 16, weight: .heavy))
                            .foregroundStyle(Color("Gold"))
                        Text(purchase.status == "paid" ? "確認済" : "確認中")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(purchase.status == "paid" ? .green : .orange)
                    }
                }
                .padding(14)
                .background(Color(hex: "0a0a0a"))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(Color("Gold").opacity(0.1), lineWidth: 1)
                )
            }
        }
    }

    private func fetchStayInfo() async {
        guard let url = URL(string: "\(baseURL)/api/v1/owner/stays") else { return }
        do {
            let (data, response) = try await authService.authenticatedRequest(url: url)
            if response.statusCode == 200 {
                stayInfo = try JSONDecoder().decode(StayInfo.self, from: data)
            }
        } catch {
            print("Failed to fetch stay info: \(error)")
        }
    }

    private func fetchMyPurchases() async {
        guard let user = authService.currentUser,
              let url = URL(string: "\(baseURL)/api/cabin/purchases/mine?email=\(user.id)") else { return }
        do {
            let (data, response) = try await URLSession.shared.data(from: url)
            if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 {
                myPurchases = (try? JSONDecoder().decode([MyPurchase].self, from: data)) ?? []
            }
        } catch {
            print("Failed to fetch purchases: \(error)")
        }
    }
}

// MARK: - Next Event Card

struct NextEventCard: View {
    var body: some View {
        NavigationLink(destination: WorkPartyView()) {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 6) {
                    Image(systemName: "calendar.badge.clock")
                        .font(.system(size: 12))
                        .foregroundStyle(Color(hex: "f59e0b"))
                    Text("次のイベント")
                        .font(.system(size: 9, weight: .heavy))
                        .tracking(2)
                        .foregroundStyle(Color(hex: "f59e0b"))
                    Spacer()
                    Text("申込受付中")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(Color(hex: "f59e0b"))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color(hex: "f59e0b").opacity(0.15))
                        .clipShape(Capsule())
                }

                Text("OFF-GRID CABIN Work Party")
                    .font(.system(size: 16, weight: .heavy))
                    .foregroundStyle(.white)

                HStack(spacing: 6) {
                    Image(systemName: "calendar")
                        .font(.system(size: 11))
                        .foregroundStyle(.gray)
                    Text("6/11(水) 〜 6/13(金)")
                        .font(.system(size: 12))
                        .foregroundStyle(.gray)
                }

                HStack(spacing: 6) {
                    Image(systemName: "mappin")
                        .font(.system(size: 11))
                        .foregroundStyle(.gray)
                    Text("北海道 弟子屈 / 完全自立型コンテナ")
                        .font(.system(size: 11))
                        .foregroundStyle(.gray)
                }

                HStack {
                    Text("電力系統・内装・フル稼働テスト")
                        .font(.system(size: 10))
                        .foregroundStyle(.gray.opacity(0.6))
                    Spacer()
                    HStack(spacing: 4) {
                        Text("参加申込")
                            .font(.system(size: 12, weight: .bold))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 10, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "050505"))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color(hex: "f59e0b"))
                    .clipShape(Capsule())
                }
                .padding(.top, 4)
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(
                    colors: [Color(hex: "f59e0b").opacity(0.08), Color(hex: "0a0a0a")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(Color(hex: "f59e0b").opacity(0.2), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Reusable Components

struct StatCard: View {
    let value: String
    let unit: String
    let label: String

    var body: some View {
        VStack(spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(value)
                    .font(.system(size: 24, weight: .heavy))
                    .foregroundStyle(Color("Gold"))
                Text(unit)
                    .font(.system(size: 10))
                    .foregroundStyle(.gray)
            }
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 10))
    }
}

struct QuickAction: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(Color("Gold"))
                .frame(width: 36, height: 36)
                .background(Color("Gold").opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 8))
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(.white)
                Text(subtitle)
                    .font(.system(size: 10))
                    .foregroundStyle(.gray)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 10))
                .foregroundStyle(.gray.opacity(0.3))
        }
        .padding(14)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

// MARK: - Quick Purchase Card (one-click purchase from dashboard)

struct QuickPurchaseCard: View {
    @StateObject private var authService = AuthService.shared
    @EnvironmentObject private var appState: AppState

    @State private var bondingInfo: BondingInfo?
    @State private var isLoading = true
    @State private var isCheckingOut = false
    @State private var stripeURL: URL?
    @State private var showSafari = false
    @State private var purchaseId: String?
    @State private var showCryptoSheet = false
    @State private var errorMessage: String?

    private let baseURL = "https://solun.art"

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("CABIN CLUB 口数購入")
                        .font(.system(size: 9, weight: .heavy))
                        .tracking(2)
                        .foregroundStyle(Color(hex: "c8a455"))
                    Text("美留和グランド")
                        .font(.system(size: 16, weight: .heavy))
                        .foregroundStyle(.white)
                    Text("北海道 弟子屈 · 100口限定")
                        .font(.system(size: 10))
                        .foregroundStyle(.gray)
                }
                Spacer()
                if isLoading {
                    ProgressView().tint(Color(hex: "c8a455"))
                } else if let info = bondingInfo {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("¥\(formatted(info.price))")
                            .font(.system(size: 20, weight: .heavy))
                            .foregroundStyle(Color(hex: "c8a455"))
                        Text("\(info.sold)/100口 売約済")
                            .font(.system(size: 9))
                            .foregroundStyle(.gray)
                    }
                }
            }

            HStack(spacing: 8) {
                Button {
                    Task { await checkoutWithCard() }
                } label: {
                    HStack(spacing: 6) {
                        if isCheckingOut {
                            ProgressView().tint(Color(hex: "050505"))
                                .scaleEffect(0.75)
                        } else {
                            Image(systemName: "creditcard.fill")
                                .font(.system(size: 11))
                        }
                        Text(isCheckingOut ? "処理中..." : "1口 カードで購入")
                            .font(.system(size: 13, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "050505"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 13)
                    .background(
                        bondingInfo != nil && !isCheckingOut
                            ? Color(hex: "c8a455")
                            : Color(hex: "c8a455").opacity(0.35)
                    )
                    .clipShape(Capsule())
                }
                .disabled(bondingInfo == nil || isCheckingOut)

                Button {
                    showCryptoSheet = true
                } label: {
                    HStack(spacing: 5) {
                        Image(systemName: "bitcoinsign.circle.fill")
                            .font(.system(size: 12))
                        Text("USDC")
                            .font(.system(size: 13, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "c8a455"))
                    .padding(.horizontal, 18)
                    .padding(.vertical, 13)
                    .background(Color(hex: "c8a455").opacity(0.1))
                    .clipShape(Capsule())
                    .overlay(Capsule().stroke(Color(hex: "c8a455").opacity(0.3), lineWidth: 1))
                }
            }

            if let errorMessage {
                Text(errorMessage)
                    .font(.system(size: 11))
                    .foregroundStyle(.red)
            }
        }
        .padding(16)
        .background(
            LinearGradient(
                colors: [Color(hex: "c8a455").opacity(0.07), Color(hex: "0a0a0a")],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "c8a455").opacity(0.25), lineWidth: 1))
        .task { await fetchBondingInfo() }
        .sheet(isPresented: $showSafari) {
            if let url = stripeURL {
                SafariView(url: url) {
                    showSafari = false
                    if let pid = purchaseId {
                        Task { await pollForSuccess(purchaseId: pid) }
                    }
                }
                .ignoresSafeArea()
            }
        }
        .sheet(isPresented: $showCryptoSheet) {
            if let info = bondingInfo {
                CryptoPaymentSheet(
                    bondingInfo: info,
                    quantity: 1,
                    buyerEmail: authService.currentUser?.id ?? ""
                )
            }
        }
    }

    private func fetchBondingInfo() async {
        isLoading = true
        defer { isLoading = false }
        guard let url = URL(string: "\(baseURL)/api/v1/bonding/village") else { return }
        if let (data, _) = try? await URLSession.shared.data(from: url) {
            bondingInfo = try? JSONDecoder().decode(BondingInfo.self, from: data)
        }
        if bondingInfo == nil {
            bondingInfo = BondingInfo(price: 5300000, sold: 0, remaining: 100)
        }
    }

    private func checkoutWithCard() async {
        guard bondingInfo != nil, let email = authService.currentUser?.id else { return }
        isCheckingOut = true
        errorMessage = nil
        defer { isCheckingOut = false }

        guard let url = URL(string: "\(baseURL)/api/cabin/purchase/checkout") else { return }
        let body: [String: Any] = [
            "property_id": "village",
            "quantity": 1,
            "name": authService.currentUser?.id ?? "",
            "email": email
        ]
        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.httpBody = bodyData
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let (data, response) = try await URLSession.shared.data(for: req)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let urlStr = json["url"] as? String,
                  let stripeUrl = URL(string: urlStr) else {
                let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
                errorMessage = msg ?? "決済の開始に失敗しました"
                return
            }
            if let pid = json["purchase_id"] as? String { purchaseId = pid }
            stripeURL = stripeUrl
            showSafari = true
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }

    private func pollForSuccess(purchaseId: String) async {
        guard let url = URL(string: "\(baseURL)/api/cabin/purchase/status/\(purchaseId)") else { return }
        for _ in 0..<8 {
            if let (data, response) = try? await URLSession.shared.data(from: url),
               let http = response as? HTTPURLResponse, http.statusCode == 200,
               let result = try? JSONDecoder().decode(PurchaseStatusResponse.self, from: data),
               result.status == "paid" {
                appState.pendingPurchaseSuccessId = purchaseId
                return
            }
            try? await Task.sleep(nanoseconds: 2_000_000_000)
        }
    }

    private func formatted(_ value: Int) -> String {
        let f = NumberFormatter(); f.numberStyle = .decimal
        return f.string(from: NSNumber(value: value)) ?? "\(value)"
    }
}

// MARK: - Crypto Payment Sheet

struct CryptoPaymentSheet: View {
    let bondingInfo: BondingInfo
    let quantity: Int
    let buyerEmail: String

    @Environment(\.dismiss) private var dismiss
    @State private var txSignature = ""
    @State private var isSubmitting = false
    @State private var showSuccess = false
    @State private var errorMessage: String?
    @State private var copied = false

    private let solanaAddress = "BeWJUYAp1rijxcNmYe9hvKCt9UvA4sHJvPKVGqrd5gmo"
    private let baseURL = "https://solun.art"

    var usdcAmount: Double {
        Double(bondingInfo.price * quantity) / 150.0
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {

                    // Amount
                    VStack(spacing: 6) {
                        Text("支払い金額")
                            .font(.system(size: 11))
                            .foregroundStyle(.gray)
                        Text(String(format: "%.0f USDC", usdcAmount))
                            .font(.system(size: 36, weight: .heavy))
                            .foregroundStyle(Color(hex: "c8a455"))
                        Text("(¥\(priceFormatted) 相当 / 1口)")
                            .font(.system(size: 11))
                            .foregroundStyle(.gray)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(20)
                    .background(Color(hex: "c8a455").opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: 14))

                    // Address
                    VStack(alignment: .leading, spacing: 10) {
                        Text("送金先アドレス (Solana · USDC)")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.gray)

                        HStack(spacing: 10) {
                            Text(solanaAddress)
                                .font(.system(size: 9, design: .monospaced))
                                .foregroundStyle(Color(hex: "c8a455"))
                                .lineLimit(2)
                                .fixedSize(horizontal: false, vertical: true)
                            Spacer(minLength: 4)
                            Button {
                                UIPasteboard.general.string = solanaAddress
                                copied = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { copied = false }
                            } label: {
                                Label(copied ? "コピー済" : "コピー", systemImage: copied ? "checkmark" : "doc.on.doc")
                                    .font(.system(size: 11, weight: .bold))
                                    .foregroundStyle(copied ? .green : Color(hex: "c8a455"))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 7)
                                    .background(Color(hex: "c8a455").opacity(0.1))
                                    .clipShape(Capsule())
                            }
                        }
                        .padding(14)
                        .background(Color(hex: "0f0f0f"))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.white.opacity(0.06)))

                        Text("Phantom / Backpack など Solana ウォレットから上記アドレスへ USDC を送金してください。")
                            .font(.system(size: 10))
                            .foregroundStyle(.gray.opacity(0.6))
                    }

                    // TX signature input
                    VStack(alignment: .leading, spacing: 8) {
                        Text("トランザクション署名を貼り付け")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.gray)
                        TextField("送金後のTX署名 (Base58)", text: $txSignature, axis: .vertical)
                            .font(.system(size: 11, design: .monospaced))
                            .textFieldStyle(.roundedBorder)
                            .lineLimit(2...4)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)
                        Text("ウォレットアプリの「トランザクション詳細」からコピーできます。")
                            .font(.system(size: 10))
                            .foregroundStyle(.gray.opacity(0.5))
                    }

                    if let errorMessage {
                        Text(errorMessage).font(.system(size: 12)).foregroundStyle(.red)
                    }

                    if showSuccess {
                        Label("確認を受け付けました。24時間以内にメールでご連絡します。", systemImage: "checkmark.circle.fill")
                            .font(.system(size: 13))
                            .foregroundStyle(.green)
                            .padding(.top, 4)
                    } else {
                        Button {
                            Task { await submitCrypto() }
                        } label: {
                            HStack(spacing: 8) {
                                if isSubmitting { ProgressView().tint(Color(hex: "050505")) }
                                Text("支払い確認を送信")
                                    .font(.system(size: 14, weight: .bold))
                            }
                            .foregroundStyle(Color(hex: "050505"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(
                                !txSignature.trimmingCharacters(in: .whitespaces).isEmpty && !isSubmitting
                                    ? Color(hex: "c8a455")
                                    : Color(hex: "c8a455").opacity(0.3)
                            )
                            .clipShape(Capsule())
                        }
                        .disabled(txSignature.trimmingCharacters(in: .whitespaces).isEmpty || isSubmitting)
                    }
                }
                .padding(16)
            }
            .background(Color(hex: "050505"))
            .navigationTitle("USDC で支払う")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }.foregroundStyle(.gray)
                }
            }
        }
    }

    private var priceFormatted: String {
        let f = NumberFormatter(); f.numberStyle = .decimal
        return f.string(from: NSNumber(value: bondingInfo.price)) ?? "\(bondingInfo.price)"
    }

    private func submitCrypto() async {
        isSubmitting = true; errorMessage = nil
        defer { isSubmitting = false }
        guard let url = URL(string: "\(baseURL)/api/cabin/purchase/crypto") else { return }
        let body: [String: Any] = [
            "property_id": "village",
            "quantity": quantity,
            "email": buyerEmail,
            "tx_signature": txSignature.trimmingCharacters(in: .whitespaces),
            "chain": "solana",
            "usdc_amount": String(format: "%.0f", usdcAmount)
        ]
        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.httpBody = bodyData
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        do {
            let (_, response) = try await URLSession.shared.data(for: req)
            if let http = response as? HTTPURLResponse, http.statusCode == 200 || http.statusCode == 201 {
                showSuccess = true
            } else {
                errorMessage = "送信に失敗しました。しばらくしてから再試行してください。"
            }
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }
}
