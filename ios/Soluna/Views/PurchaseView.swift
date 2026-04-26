import SwiftUI

// MARK: - Models

struct BondingInfo: Codable {
    let price: Int
    let sold: Int
    let remaining: Int
}

struct PurchaseStatusResponse: Codable {
    let status: String
    let tag_id: String?
    let property_id: String?
    let quantity: Int?
    let buyer_name: String?
}

// MARK: - PurchaseView

struct PurchaseView: View {
    let prefilledEmail: String

    init(prefilledEmail: String = "") {
        self.prefilledEmail = prefilledEmail
    }

    @StateObject private var authService = AuthService.shared
    @EnvironmentObject private var appState: AppState

    @State private var bondingInfo: BondingInfo?
    @State private var isLoadingPrice = true
    @State private var buyerName = ""
    @State private var buyerEmail = ""
    @State private var quantity = 1
    @State private var isCheckingOut = false
    @State private var stripeURL: URL?
    @State private var showSafari = false
    @State private var purchaseId: String?
    @State private var purchaseResult: PurchaseStatusResponse?
    @State private var isPolling = false
    @State private var errorMessage: String?

    // Payment options
    enum PaymentMethod: String, CaseIterable {
        case card = "card"
        case installment = "installment"
        case bank = "bank"
        case crypto = "crypto"
        var label: String {
            switch self {
            case .card: return "カード一括"
            case .installment: return "分割払い"
            case .bank: return "銀行振込"
            case .crypto: return "USDC"
            }
        }
        var icon: String {
            switch self {
            case .card: return "creditcard"
            case .installment: return "calendar.badge.clock"
            case .bank: return "building.columns"
            case .crypto: return "bitcoinsign.circle"
            }
        }
    }
    @State private var selectedPayment: PaymentMethod = .card
    @State private var referralCode = ""
    @State private var referralDiscount = 0
    @State private var isValidatingReferral = false
    @State private var showBankSheet = false
    @State private var bankTransferInfo: [String: String] = [:]
    @State private var showCryptoSheet = false

    private let baseURL = "https://solun.art"
    private let propertyId = "village"   // 美留和グランド — bonding curve property

    var body: some View {
        Group {
            if let result = purchaseResult, result.status == "paid" {
                PurchaseSuccessView(result: result, onDone: {
                    purchaseResult = nil
                    appState.pendingPurchaseSuccessId = nil
                })
            } else {
                purchaseFormView
            }
        }
        .task { await fetchBondingInfo() }
        .onChange(of: appState.pendingPurchaseSuccessId) { _, newId in
            if let id = newId, let pid = purchaseId, id == pid {
                Task { await pollStatus(purchaseId: pid, maxAttempts: 10) }
            }
        }
        .sheet(isPresented: $showSafari) {
            if let url = stripeURL {
                SafariView(url: url) {
                    showSafari = false
                    // User closed browser — poll status in case payment completed
                    if let pid = purchaseId {
                        Task { await pollStatus(purchaseId: pid, maxAttempts: 8) }
                    }
                }
                .ignoresSafeArea()
            }
        }
    }

    // MARK: - Form View

    private var purchaseFormView: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Hero banner
                heroBanner

                // Bonding curve price card
                priceCard

                // Quantity
                quantitySelector

                // Payment method selector
                paymentMethodSelector

                // Buyer info
                buyerInfoSection

                // Referral code
                referralCodeSection

                // Installment info
                if selectedPayment == .installment, let info = bondingInfo {
                    let total = info.price * quantity - referralDiscount
                    let monthly = Int(ceil(Double(total) / 60.0))
                    VStack(alignment: .leading, spacing: 6) {
                        Text("分割払い詳細")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Color(hex: "c8a455"))
                        Text("月額 ¥\(monthly.formatted()) × 60回（5年間）")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(.white)
                        Text("初回お支払いで即日会員証発行。途中解約不可。")
                            .font(.system(size: 10))
                            .foregroundStyle(.gray)
                    }
                    .padding(14)
                    .background(Color(hex: "c8a455").opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color(hex: "c8a455").opacity(0.2), lineWidth: 1))
                }

                // Error
                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 12))
                        .foregroundStyle(.red)
                        .padding(.horizontal, 4)
                }

                // CTA
                ctaButton

                // Legal disclaimer
                VStack(alignment: .leading, spacing: 6) {
                    Text("【重要】本サービスについて")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.gray.opacity(0.6))
                    Text("本サービスは施設利用会員権（年間8泊利用権）の提供です。不動産売買・投資商品ではありません。会員権の転売・譲渡は運営事務局を通じてのみ可能です。元本保証はありません。")
                        .font(.system(size: 10))
                        .foregroundStyle(.gray.opacity(0.4))
                        .lineSpacing(3)
                }
                .padding(12)
                .background(Color.white.opacity(0.03))
                .clipShape(RoundedRectangle(cornerRadius: 8))

                // Fine print
                Text("※ ご購入後、確認メールに会員番号・利用権詳細をお送りします。Stripe による安全な決済です。")
                    .font(.system(size: 10))
                    .foregroundStyle(.gray.opacity(0.5))
                    .padding(.top, 4)
            }
            .padding(16)
        }
        .background(Color(hex: "050505"))
        .navigationTitle("口数を購入")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if !prefilledEmail.isEmpty {
                buyerEmail = prefilledEmail
            } else if let user = authService.currentUser {
                buyerEmail = user.id
            }
        }
    }

    private var heroBanner: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("SOLUNA CABIN CLUB")
                .font(.system(size: 9, weight: .heavy))
                .tracking(3)
                .foregroundStyle(Color(hex: "c8a455"))
            Text("美留和グランド 口数購入")
                .font(.system(size: 20, weight: .heavy))
                .tracking(-0.4)
            Text("北海道 弟子屈 32,337坪 | 100口限定 · 紹介制")
                .font(.system(size: 11))
                .foregroundStyle(.gray)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            LinearGradient(
                colors: [Color(hex: "c8a455").opacity(0.08), Color(hex: "0a0a0a")],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color(hex: "c8a455").opacity(0.15), lineWidth: 1)
        )
    }

    private var priceCard: some View {
        VStack(spacing: 12) {
            if isLoadingPrice {
                ProgressView()
                    .tint(Color(hex: "c8a455"))
                    .frame(maxWidth: .infinity, minHeight: 80)
            } else if let info = bondingInfo {
                VStack(spacing: 8) {
                    HStack(alignment: .bottom, spacing: 6) {
                        Text("¥\(formatted(info.price))")
                            .font(.system(size: 28, weight: .heavy))
                            .foregroundStyle(Color(hex: "c8a455"))
                        Text("/ 口")
                            .font(.system(size: 13))
                            .foregroundStyle(.gray)
                            .padding(.bottom, 4)
                        Spacer()
                        bondingProgressView(info: info)
                    }

                    HStack(spacing: 12) {
                        infoChip(label: "販売済", value: "\(info.sold)口")
                        infoChip(label: "残り", value: "\(info.remaining)口")
                        infoChip(label: "完売価格", value: "¥1,480万")
                    }

                    // Progress bar
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color(hex: "1a1a1a"))
                                .frame(height: 6)
                            RoundedRectangle(cornerRadius: 4)
                                .fill(
                                    LinearGradient(
                                        colors: [Color(hex: "c8a455"), Color(hex: "f0a030")],
                                        startPoint: .leading, endPoint: .trailing
                                    )
                                )
                                .frame(
                                    width: geo.size.width * CGFloat(info.sold) / 100.0,
                                    height: 6
                                )
                        }
                    }
                    .frame(height: 6)
                }
            }
        }
        .padding(16)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color(hex: "c8a455").opacity(0.1), lineWidth: 1)
        )
    }

    private var quantitySelector: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("購入口数")
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(.gray)

            HStack(spacing: 0) {
                Button {
                    if quantity > 1 { quantity -= 1 }
                } label: {
                    Image(systemName: "minus")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(quantity > 1 ? Color(hex: "c8a455") : .gray)
                        .frame(width: 44, height: 44)
                }
                .disabled(quantity <= 1)

                Text("\(quantity)口")
                    .font(.system(size: 18, weight: .heavy))
                    .foregroundStyle(.white)
                    .frame(minWidth: 70)

                Button {
                    let maxQ = min(5, bondingInfo?.remaining ?? 1)
                    if quantity < maxQ { quantity += 1 }
                } label: {
                    let maxQ = min(5, bondingInfo?.remaining ?? 1)
                    Image(systemName: "plus")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(quantity < maxQ ? Color(hex: "c8a455") : .gray)
                        .frame(width: 44, height: 44)
                }
                .disabled(quantity >= min(5, bondingInfo?.remaining ?? 1))

                Spacer()

                if let info = bondingInfo {
                    Text("合計 ¥\(formatted(info.price * quantity))")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
            .padding(.horizontal, 8)
            .background(Color(hex: "0a0a0a"))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
            )

            Text("1口につき年間8泊の利用権（全棟共通）。最大5口まで購入可。")
                .font(.system(size: 10))
                .foregroundStyle(.gray.opacity(0.6))
        }
    }

    private var buyerInfoSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("購入者情報")
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(.gray)

            VStack(spacing: 10) {
                formField(label: "お名前") {
                    TextField("山田 太郎", text: $buyerName)
                        .textFieldStyle(.roundedBorder)
                }
                formField(label: "メールアドレス") {
                    TextField("email@example.com", text: $buyerEmail)
                        .textFieldStyle(.roundedBorder)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }
            }
        }
    }

    private var paymentMethodSelector: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("支払い方法")
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(.gray)
            HStack(spacing: 8) {
                ForEach(PaymentMethod.allCases, id: \.self) { method in
                    Button {
                        selectedPayment = method
                    } label: {
                        VStack(spacing: 4) {
                            Image(systemName: method.icon)
                                .font(.system(size: 14))
                            Text(method.label)
                                .font(.system(size: 9, weight: .bold))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .foregroundStyle(selectedPayment == method ? Color(hex: "050505") : Color(hex: "c8a455"))
                        .background(selectedPayment == method ? Color(hex: "c8a455") : Color(hex: "c8a455").opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color(hex: "c8a455").opacity(0.3), lineWidth: 1))
                    }
                }
            }
        }
    }

    private var referralCodeSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("紹介コード（任意）")
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(.gray)
            HStack(spacing: 8) {
                TextField("例: YUKI2024", text: $referralCode)
                    .textFieldStyle(.roundedBorder)
                    .autocorrectionDisabled()
                    .textInputAutocapitalization(.characters)
                Button {
                    Task { await validateReferral() }
                } label: {
                    if isValidatingReferral {
                        ProgressView().tint(Color(hex: "c8a455"))
                    } else {
                        Text("適用")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(Color(hex: "c8a455"))
                    }
                }
                .disabled(referralCode.isEmpty || isValidatingReferral)
            }
            if referralDiscount > 0 {
                HStack(spacing: 4) {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                        .font(.system(size: 12))
                    Text("紹介コード適用 → ¥\(NumberFormatter.localizedString(from: referralDiscount as NSNumber, number: .decimal))引き")
                        .font(.system(size: 11))
                        .foregroundStyle(.green)
                }
            }
        }
    }

    private var ctaButton: some View {
        Button {
            Task { await startCheckout() }
        } label: {
            HStack(spacing: 8) {
                if isCheckingOut || isPolling {
                    ProgressView().tint(Color(hex: "050505"))
                }
                if isPolling {
                    Text("確認中...")
                        .font(.system(size: 14, weight: .bold))
                } else {
                    Image(systemName: selectedPayment.icon)
                        .font(.system(size: 12))
                    Text(ctaLabel)
                        .font(.system(size: 14, weight: .bold))
                }
            }
            .foregroundStyle(Color(hex: "050505"))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(
                canPurchase && !isCheckingOut && !isPolling
                    ? Color(hex: "c8a455")
                    : Color(hex: "c8a455").opacity(0.3)
            )
            .clipShape(Capsule())
        }
        .disabled(!canPurchase || isCheckingOut || isPolling)
        .sheet(isPresented: $showBankSheet) {
            BankTransferSheet(info: bankTransferInfo)
        }
        .sheet(isPresented: $showCryptoSheet) {
            CryptoPaymentView(
                propertyId: propertyId, quantity: quantity,
                bondingInfo: bondingInfo, referralDiscount: referralDiscount,
                email: buyerEmail
            )
        }
    }

    private var ctaLabel: String {
        switch selectedPayment {
        case .card: return "カードで購入する"
        case .installment:
            if let info = bondingInfo {
                let total = info.price * quantity - referralDiscount
                let monthly = Int(ceil(Double(total) / 60.0))
                return "¥\(NumberFormatter.localizedString(from: monthly as NSNumber, number: .decimal))/月 × 60回"
            }
            return "分割払いで購入する"
        case .bank: return "振込先を確認する"
        case .crypto: return "USDCで支払う"
        }
    }

    // MARK: - Helpers

    private var canPurchase: Bool {
        !buyerEmail.trimmingCharacters(in: .whitespaces).isEmpty &&
        bondingInfo != nil &&
        (bondingInfo?.remaining ?? 0) > 0
    }

    private func formField<Content: View>(label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(.gray)
            content()
        }
    }

    private func infoChip(label: String, value: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .font(.system(size: 13, weight: .heavy))
                .foregroundStyle(.white)
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(.gray)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(Color(hex: "151515"))
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }

    private func bondingProgressView(info: BondingInfo) -> some View {
        VStack(alignment: .trailing, spacing: 2) {
            Text("\(info.sold)/100")
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(Color(hex: "c8a455"))
            Text("口販売済")
                .font(.system(size: 9))
                .foregroundStyle(.gray)
        }
    }

    private func formatted(_ value: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
    }

    // MARK: - API

    private func fetchBondingInfo() async {
        isLoadingPrice = true
        defer { isLoadingPrice = false }
        guard let url = URL(string: "\(baseURL)/api/v1/bonding/village") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            bondingInfo = try JSONDecoder().decode(BondingInfo.self, from: data)
        } catch {
            print("Failed to fetch bonding info: \(error)")
            // Fallback
            bondingInfo = BondingInfo(price: 5300000, sold: 0, remaining: 100)
        }
    }

    private func validateReferral() async {
        guard !referralCode.isEmpty else { return }
        isValidatingReferral = true
        defer { isValidatingReferral = false }
        let code = referralCode.uppercased().trimmingCharacters(in: .whitespaces)
        guard let url = URL(string: "\(baseURL)/api/referral/validate?code=\(code)") else { return }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let valid = json["valid"] as? Bool, valid,
               let discount = json["discount_jpy"] as? Int {
                referralDiscount = discount
            } else {
                referralDiscount = 0
                errorMessage = "紹介コードが無効です"
            }
        } catch {
            errorMessage = "通信エラー"
        }
    }

    private func startCheckout() async {
        isCheckingOut = true
        errorMessage = nil
        defer { isCheckingOut = false }

        let email = buyerEmail.trimmingCharacters(in: .whitespaces)
        let name = buyerName.trimmingCharacters(in: .whitespaces)

        // Crypto and bank handled by sheets
        if selectedPayment == .crypto {
            showCryptoSheet = true
            return
        }

        let endpoint: String
        switch selectedPayment {
        case .installment: endpoint = "/api/cabin/purchase/installment"
        case .bank: endpoint = "/api/cabin/purchase/bank"
        default: endpoint = "/api/cabin/purchase/checkout"
        }

        guard let url = URL(string: "\(baseURL)\(endpoint)") else { return }
        var body: [String: Any] = [
            "property_id": propertyId,
            "quantity": quantity,
            "name": name,
            "email": email
        ]
        if referralDiscount > 0 {
            body["referral_code"] = referralCode.uppercased().trimmingCharacters(in: .whitespaces)
        }
        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = bodyData
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse else {
                errorMessage = "サーバーに接続できません"
                return
            }
            let json = (try? JSONSerialization.jsonObject(with: data) as? [String: Any]) ?? [:]

            if httpResponse.statusCode == 200 {
                if selectedPayment == .bank {
                    // Show bank transfer sheet
                    if let bank = json["bank"] as? [String: Any] {
                        bankTransferInfo = bank.compactMapValues { "\($0)" }
                    }
                    if let pid = json["purchase_id"] as? String { purchaseId = pid }
                    showBankSheet = true
                } else if let urlStr = json["url"] as? String, let stripeUrl = URL(string: urlStr) {
                    if let pid = json["purchase_id"] as? String { purchaseId = pid }
                    stripeURL = stripeUrl
                    showSafari = true
                } else {
                    errorMessage = json["error"] as? String ?? "決済の開始に失敗しました"
                }
            } else {
                errorMessage = json["error"] as? String ?? "エラーが発生しました"
            }
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }

    private func pollStatus(purchaseId: String, maxAttempts: Int) async {
        isPolling = true
        defer { isPolling = false }

        guard let url = URL(string: "\(baseURL)/api/cabin/purchase/status/\(purchaseId)") else { return }

        for attempt in 0..<maxAttempts {
            do {
                let (data, response) = try await URLSession.shared.data(from: url)
                if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200,
                   let result = try? JSONDecoder().decode(PurchaseStatusResponse.self, from: data) {
                    if result.status == "paid" {
                        purchaseResult = result
                        appState.pendingPurchaseSuccessId = nil
                        return
                    }
                }
            } catch {
                print("Poll attempt \(attempt) failed: \(error)")
            }
            if attempt < maxAttempts - 1 {
                try? await Task.sleep(nanoseconds: 2_000_000_000) // 2s
            }
        }
        // Timed out — show a soft message
        errorMessage = "決済確認中です。しばらくしてからダッシュボードを確認してください。"
    }
}

// MARK: - Bank Transfer Sheet

struct BankTransferRow: View {
    let key: String
    let value: String
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text(key)
                    .font(.system(size: 12))
                    .foregroundStyle(.gray)
                    .frame(width: 90, alignment: .leading)
                Text(value)
                    .font(.system(size: 13, weight: key == "振込金額" ? .bold : .regular))
                    .foregroundStyle(key == "振込金額" ? Color(hex: "c8a455") : .white)
                Spacer()
            }
            .padding(.vertical, 12)
            .padding(.horizontal, 16)
            Divider().background(Color.white.opacity(0.06))
        }
    }
}

struct BankTransferSheet: View {
    let info: [String: String]
    @Environment(\.dismiss) private var dismiss
    @State private var copied = false

    private func bankRows() -> [(String, String)] {
        let bankName = (info["bank_name"] ?? "") + " " + (info["branch_name"] ?? "")
        let amountStr = info["amount"] ?? "0"
        let amountFormatted = "¥" + (Int(amountStr).map { NumberFormatter.localizedString(from: $0 as NSNumber, number: .decimal) } ?? amountStr)
        return [
            ("振込先銀行", bankName),
            ("口座種別", info["account_type"] ?? ""),
            ("口座番号", info["account_number"] ?? ""),
            ("口座名義", info["account_holder"] ?? ""),
            ("振込金額", amountFormatted),
            ("識別番号", info["reference"] ?? ""),
        ]
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("下記口座へお振込みください")
                        .font(.system(size: 14))
                        .foregroundStyle(.gray)
                        .padding(.top, 8)

                    VStack(spacing: 0) {
                        ForEach(bankRows(), id: \.0) { row in
                            BankTransferRow(key: row.0, value: row.1)
                        }
                    }
                    .background(Color(hex: "0d0d0d"))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    Button {
                        let text = "振込先: \(info["bank_name"] ?? "") \(info["branch_name"] ?? "") / \(info["account_type"] ?? "") \(info["account_number"] ?? "") / \(info["account_holder"] ?? "") / ¥\(info["amount"] ?? "") / 識別番号: \(info["reference"] ?? "")"
                        UIPasteboard.general.string = text
                        copied = true
                    } label: {
                        Label(copied ? "コピーしました" : "振込情報をコピー", systemImage: copied ? "checkmark" : "doc.on.doc")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color(hex: "c8a455").opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                            .foregroundStyle(Color(hex: "c8a455"))
                            .font(.system(size: 13, weight: .bold))
                    }

                    VStack(alignment: .leading, spacing: 6) {
                        Text("※ 振込依頼人名の末尾に識別番号を必ずご入力ください")
                            .font(.system(size: 11))
                            .foregroundStyle(.gray.opacity(0.6))
                        Text("※ 振込確認後2〜3営業日以内に会員証をメールでお送りします")
                            .font(.system(size: 11))
                            .foregroundStyle(.gray.opacity(0.6))
                        Text("※ 振込手数料はお客様負担です")
                            .font(.system(size: 11))
                            .foregroundStyle(.gray.opacity(0.6))
                    }
                }
                .padding(20)
            }
            .background(Color(hex: "050505"))
            .navigationTitle("銀行振込のご案内")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("閉じる") { dismiss() }
                        .foregroundStyle(Color(hex: "c8a455"))
                }
            }
        }
    }
}

// MARK: - Crypto Payment View (USDC)

struct CryptoPaymentView: View {
    let propertyId: String
    let quantity: Int
    let bondingInfo: BondingInfo?
    let referralDiscount: Int
    let email: String
    @Environment(\.dismiss) private var dismiss
    @State private var txSignature = ""
    @State private var isSending = false
    @State private var sent = false
    @State private var errorMessage: String?
    private let walletAddress = "BeWJUYAp1rijxcNmYe9hvKCt9UvA4sHJvPKVGqrd5gmo"

    var usdcAmount: String {
        guard let info = bondingInfo else { return "—" }
        let jpy = info.price * quantity - referralDiscount
        return String(format: "%.2f", Double(jpy) / 150.0)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("送金先アドレス（Solana · USDC）")
                            .font(.system(size: 11, weight: .bold)).foregroundStyle(.gray)
                        HStack {
                            Text(walletAddress)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundStyle(Color(hex: "c8a455"))
                                .lineLimit(2)
                            Button {
                                UIPasteboard.general.string = walletAddress
                            } label: {
                                Image(systemName: "doc.on.doc").font(.system(size: 14))
                                    .foregroundStyle(Color(hex: "c8a455"))
                            }
                        }
                        .padding(12)
                        .background(Color(hex: "0d0d0d"))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }

                    HStack {
                        VStack(alignment: .leading) {
                            Text("送金額").font(.system(size: 11)).foregroundStyle(.gray)
                            Text("\(usdcAmount) USDC")
                                .font(.system(size: 22, weight: .heavy))
                                .foregroundStyle(Color(hex: "c8a455"))
                        }
                        Spacer()
                        VStack(alignment: .trailing) {
                            Text("ネットワーク").font(.system(size: 11)).foregroundStyle(.gray)
                            Text("Solana").font(.system(size: 14, weight: .bold))
                        }
                    }
                    .padding(14)
                    .background(Color(hex: "0d0d0d"))
                    .clipShape(RoundedRectangle(cornerRadius: 10))

                    VStack(alignment: .leading, spacing: 8) {
                        Text("送金後、TX署名を入力してください")
                            .font(.system(size: 12, weight: .bold)).foregroundStyle(.gray)
                        TextField("トランザクション署名（Base58）", text: $txSignature)
                            .textFieldStyle(.roundedBorder)
                            .font(.system(size: 11, design: .monospaced))
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)
                    }

                    if let err = errorMessage {
                        Text(err).font(.system(size: 12)).foregroundStyle(.red)
                    }

                    Button {
                        Task { await submitCrypto() }
                    } label: {
                        HStack {
                            if isSending { ProgressView().tint(Color(hex: "050505")) }
                            Text(sent ? "送信しました" : "送金確認を依頼する")
                                .font(.system(size: 14, weight: .bold))
                        }
                        .frame(maxWidth: .infinity).padding(.vertical, 14)
                        .background(!txSignature.isEmpty && !sent ? Color(hex: "c8a455") : Color(hex: "c8a455").opacity(0.3))
                        .foregroundStyle(Color(hex: "050505"))
                        .clipShape(Capsule())
                    }
                    .disabled(txSignature.isEmpty || isSending || sent)

                    Text("※ 24時間以内に手動確認し、会員証をお送りします。")
                        .font(.system(size: 11)).foregroundStyle(.gray.opacity(0.5))
                }
                .padding(20)
            }
            .background(Color(hex: "050505"))
            .navigationTitle("USDC支払い")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("閉じる") { dismiss() }.foregroundStyle(Color(hex: "c8a455"))
                }
            }
        }
    }

    private func submitCrypto() async {
        isSending = true; errorMessage = nil
        defer { isSending = false }
        guard let url = URL(string: "https://solun.art/api/cabin/purchase/crypto") else { return }
        let body: [String: Any] = [
            "property_id": propertyId, "quantity": quantity,
            "email": email, "tx_signature": txSignature,
            "chain": "solana", "usdc_amount": usdcAmount
        ]
        guard let data = try? JSONSerialization.data(withJSONObject: body) else { return }
        var req = URLRequest(url: url); req.httpMethod = "POST"; req.httpBody = data
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        do {
            let (_, response) = try await URLSession.shared.data(for: req)
            if (response as? HTTPURLResponse)?.statusCode == 200 { sent = true }
            else { errorMessage = "送信に失敗しました" }
        } catch { errorMessage = "通信エラー" }
    }
}

// MARK: - Purchase Success View

struct PurchaseSuccessView: View {
    let result: PurchaseStatusResponse
    let onDone: () -> Void

    @State private var showConfetti = false

    var body: some View {
        ScrollView {
            VStack(spacing: 28) {
                Spacer(minLength: 40)

                // Success icon with pulse animation
                ZStack {
                    Circle()
                        .fill(Color(hex: "c8a455").opacity(0.08))
                        .frame(width: 120, height: 120)
                        .scaleEffect(showConfetti ? 1.2 : 1.0)
                        .animation(.easeInOut(duration: 1.4).repeatForever(autoreverses: true), value: showConfetti)

                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 52))
                        .foregroundStyle(Color(hex: "c8a455"))
                }

                VStack(spacing: 8) {
                    Text("ご購入ありがとうございます")
                        .font(.system(size: 22, weight: .heavy))
                        .multilineTextAlignment(.center)
                    Text("SOLUNA CABIN CLUB オーナーへようこそ")
                        .font(.system(size: 12))
                        .foregroundStyle(Color(hex: "c8a455"))
                }

                // Purchase details card
                VStack(alignment: .leading, spacing: 14) {
                    detailRow(label: "物件", value: (result.property_id ?? "village").uppercased())
                    detailRow(label: "口数", value: "\(result.quantity ?? 1)口")
                    if let name = result.buyer_name, !name.isEmpty {
                        detailRow(label: "オーナー名", value: name)
                    }
                    if let tagId = result.tag_id {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("NFTタグID")
                                .font(.system(size: 10))
                                .foregroundStyle(.gray)
                            Text(tagId)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundStyle(Color(hex: "c8a455"))
                                .textSelection(.enabled)
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(hex: "0a0a0a"))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(Color(hex: "c8a455").opacity(0.2), lineWidth: 1)
                        )
                    }
                }
                .padding(18)
                .background(Color(hex: "0a0a0a"))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color(hex: "c8a455").opacity(0.15), lineWidth: 1)
                )

                // Next steps
                nextStepsCard

                VStack(spacing: 10) {
                    Button {
                        onDone()
                    } label: {
                        Text("ダッシュボードへ")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(Color(hex: "050505"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color(hex: "c8a455"))
                            .clipShape(Capsule())
                    }

                    Text("確認メールをお送りしました。NFTタグIDを保管してください。")
                        .font(.system(size: 10))
                        .foregroundStyle(.gray.opacity(0.5))
                        .multilineTextAlignment(.center)
                }

                Spacer(minLength: 40)
            }
            .padding(20)
        }
        .background(Color(hex: "050505"))
        .onAppear { showConfetti = true }
    }

    private var nextStepsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("NEXT STEPS")
                .font(.system(size: 9, weight: .heavy))
                .tracking(2)
                .foregroundStyle(Color(hex: "c8a455"))

            nextStep(number: "01", title: "確認メールを確認", desc: "NFTタグIDと領収書をメールでお送りしました")
            nextStep(number: "02", title: "Work Partyに参加", desc: "次回 6/11-13 OFF-GRID CABIN Work Partyにご参加ください")
            nextStep(number: "03", title: "宿泊予約を開始", desc: "ダッシュボードから年間8泊の利用権を使って予約できます")
        }
        .padding(16)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private func detailRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(.gray)
            Spacer()
            Text(value)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(.white)
        }
    }

    private func nextStep(number: String, title: String, desc: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text(number)
                .font(.system(size: 9, weight: .heavy))
                .foregroundStyle(Color(hex: "c8a455"))
                .frame(width: 22, height: 22)
                .background(Color(hex: "c8a455").opacity(0.1))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.system(size: 12, weight: .bold))
                    .foregroundStyle(.white)
                Text(desc)
                    .font(.system(size: 10))
                    .foregroundStyle(.gray)
            }
        }
    }
}
