import SwiftUI

struct ReferralShareView: View {
    @StateObject private var authService = AuthService.shared
    @State private var referralCode = ""
    @State private var isLoading = true
    @State private var copied = false
    @Environment(\.dismiss) private var dismiss

    private let baseURL = "https://solun.art"

    var shareURL: URL {
        URL(string: "\(baseURL)/buy?ref=\(referralCode)") ?? URL(string: baseURL)!
    }

    var shareText: String {
        "SOLUNAに入会しませんか？北海道の秘境オフグリッドビレッジ、年間8泊の施設利用権。私のコードで¥30万引きになります。\n\(shareURL.absoluteString)"
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 28) {
                    // Header
                    VStack(spacing: 8) {
                        Text("REFERRAL")
                            .font(.system(size: 9, weight: .heavy))
                            .tracking(4)
                            .foregroundStyle(Color(hex: "c8a455"))
                        Text("友達を招待する")
                            .font(.system(size: 24, weight: .heavy))
                        Text("紹介した相手が入会すると\nあなたに¥20万の宿泊クレジットが付与されます")
                            .font(.system(size: 13))
                            .foregroundStyle(.gray)
                            .multilineTextAlignment(.center)
                            .lineSpacing(4)
                    }
                    .padding(.top, 8)

                    // Reward cards
                    HStack(spacing: 12) {
                        rewardCard(icon: "person.badge.plus", title: "紹介した人", value: "¥20万", label: "宿泊クレジット付与", color: "c8a455")
                        rewardCard(icon: "tag.fill", title: "紹介された人", value: "¥30万", label: "入会金割引", color: "4a9a6a")
                    }

                    // Referral code display
                    VStack(spacing: 10) {
                        Text("あなたの紹介コード")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.gray)

                        if isLoading {
                            ProgressView().tint(Color(hex: "c8a455"))
                                .frame(height: 56)
                        } else {
                            HStack(spacing: 12) {
                                Text(referralCode)
                                    .font(.system(size: 24, weight: .heavy, design: .monospaced))
                                    .foregroundStyle(Color(hex: "c8a455"))
                                    .frame(maxWidth: .infinity)
                                Button {
                                    UIPasteboard.general.string = referralCode
                                    copied = true
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
                                } label: {
                                    Image(systemName: copied ? "checkmark" : "doc.on.doc")
                                        .font(.system(size: 16))
                                        .foregroundStyle(copied ? .green : Color(hex: "c8a455"))
                                }
                            }
                            .padding(18)
                            .background(Color(hex: "c8a455").opacity(0.08))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(hex: "c8a455").opacity(0.25), lineWidth: 1))
                        }

                        Text("https://solun.art/buy?ref=\(referralCode)")
                            .font(.system(size: 10, design: .monospaced))
                            .foregroundStyle(.gray.opacity(0.5))
                    }

                    // Share buttons
                    VStack(spacing: 10) {
                        // Native share sheet
                        ShareLink(item: shareURL, subject: Text("SOLUNAに招待"), message: Text(shareText)) {
                            HStack(spacing: 8) {
                                Image(systemName: "square.and.arrow.up")
                                Text("共有する")
                                    .font(.system(size: 14, weight: .bold))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color(hex: "c8a455"))
                            .foregroundStyle(Color(hex: "050505"))
                            .clipShape(Capsule())
                        }

                        // X (Twitter)
                        Button {
                            let text = "北海道の秘境に年8泊できるSOLUNA。仲間を紹介するとお互いにお得です。\n\(shareURL.absoluteString) @soluna_art"
                            let encoded = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
                            if let url = URL(string: "https://twitter.com/intent/tweet?text=\(encoded)") {
                                UIApplication.shared.open(url)
                            }
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "bird")
                                Text("X (Twitter) でシェア")
                                    .font(.system(size: 14, weight: .bold))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color(hex: "151515"))
                            .foregroundStyle(.white)
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(Color.white.opacity(0.1), lineWidth: 1))
                        }

                        // LINE
                        Button {
                            let text = "SOLUNAに招待します！私のコードで¥30万引き → \(shareURL.absoluteString)"
                            let encoded = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? ""
                            if let url = URL(string: "https://line.me/R/share?text=\(encoded)") {
                                UIApplication.shared.open(url)
                            }
                        } label: {
                            HStack(spacing: 8) {
                                Image(systemName: "message.fill")
                                Text("LINEでシェア")
                                    .font(.system(size: 14, weight: .bold))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(Color(hex: "06c755").opacity(0.15))
                            .foregroundStyle(Color(hex: "06c755"))
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(Color(hex: "06c755").opacity(0.3), lineWidth: 1))
                        }
                    }

                    Spacer(minLength: 40)
                }
                .padding(20)
            }
            .background(Color(hex: "050505"))
            .navigationTitle("友達を招待する")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("閉じる") { dismiss() }
                        .foregroundStyle(Color(hex: "c8a455"))
                }
            }
        }
        .task { await fetchReferralCode() }
    }

    private func rewardCard(icon: String, title: String, value: String, label: String, color: String) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(Color(hex: color))
            Text(title)
                .font(.system(size: 10))
                .foregroundStyle(.gray)
            Text(value)
                .font(.system(size: 18, weight: .heavy))
                .foregroundStyle(Color(hex: color))
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(Color(hex: color).opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(hex: color).opacity(0.2), lineWidth: 1))
    }

    private func fetchReferralCode() async {
        isLoading = true
        defer { isLoading = false }
        guard let userEmail = authService.currentUser?.id,
              let url = URL(string: "\(baseURL)/api/v1/me/referral?email=\(userEmail)") else {
            referralCode = "SOLUNA01"
            return
        }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let code = json["referral_code"] as? String {
                referralCode = code
            } else {
                referralCode = "SOLUNA01"
            }
        } catch {
            referralCode = "SOLUNA01"
        }
    }
}
