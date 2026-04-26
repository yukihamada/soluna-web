import SwiftUI
import MapKit

struct GuideData: Codable {
    let slug: String
    let name: String
    let checkin_time: String?
    let checkout_time: String?
    let address: String?
    let wifi_ssid: String?
    let wifi_password: String?
    let door_code: String?
    let map_url: String?
    let notes: String?
    let template: String?
}

struct GuideView: View {
    let slug: String
    @StateObject private var authService = AuthService.shared
    @State private var guide: GuideData?
    @State private var isLoading = true
    @State private var copiedField: String?

    private let baseURL = "https://solun.art"

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView()
                    .tint(Color(hex: "c8a455"))
                    .frame(maxWidth: .infinity, minHeight: 200)
            } else if let guide = guide {
                VStack(alignment: .leading, spacing: 16) {
                    // Check-in / out times
                    if guide.checkin_time != nil || guide.checkout_time != nil {
                        infoSection(title: "チェックイン / チェックアウト") {
                            if let ci = guide.checkin_time {
                                infoRow(label: "チェックイン", value: ci)
                            }
                            if let co = guide.checkout_time {
                                infoRow(label: "チェックアウト", value: co)
                            }
                        }
                    }

                    // Address + map
                    if let address = guide.address {
                        infoSection(title: "アクセス") {
                            infoRow(label: "住所", value: address, copyable: true)
                            if let mapURL = guide.map_url, let url = URL(string: mapURL) {
                                Link(destination: url) {
                                    Label("Google マップで開く", systemImage: "map.fill")
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundStyle(Color(hex: "c8a455"))
                                        .padding(.top, 4)
                                }
                            }
                        }
                    }

                    // Wi-Fi
                    if guide.wifi_ssid != nil {
                        infoSection(title: "Wi-Fi") {
                            if let ssid = guide.wifi_ssid {
                                infoRow(label: "ネットワーク名", value: ssid, copyable: true)
                            }
                            if let pwd = guide.wifi_password {
                                infoRow(label: "パスワード", value: pwd, copyable: true)
                            }
                        }
                    }

                    // Door code (owner-only)
                    if let code = guide.door_code {
                        infoSection(title: "ドアコード", accentColor: Color(hex: "c8a455")) {
                            HStack {
                                Text(code)
                                    .font(.system(size: 28, weight: .heavy, design: .monospaced))
                                    .foregroundStyle(Color(hex: "c8a455"))
                                Spacer()
                                copyButton(value: code, field: "door")
                            }
                            Text("このコードはオーナー・ゲストのみに表示されます")
                                .font(.system(size: 10))
                                .foregroundStyle(.gray.opacity(0.5))
                        }
                    }

                    // Notes
                    if let notes = guide.notes, !notes.isEmpty {
                        infoSection(title: "ご案内") {
                            Text(notes)
                                .font(.system(size: 13))
                                .foregroundStyle(.gray.opacity(0.8))
                                .lineSpacing(6)
                        }
                    }

                    // Template
                    if let template = guide.template, !template.isEmpty {
                        infoSection(title: "チェックイン案内テンプレート") {
                            Text(template)
                                .font(.system(size: 11, design: .monospaced))
                                .foregroundStyle(.gray.opacity(0.7))
                                .lineSpacing(5)
                                .textSelection(.enabled)
                        }
                    }
                }
                .padding(16)
            } else {
                VStack(spacing: 12) {
                    Image(systemName: "lock.doc")
                        .font(.system(size: 40))
                        .foregroundStyle(Color(hex: "c8a455").opacity(0.4))
                    Text("ガイド情報はオーナー・ゲストのみ閲覧できます")
                        .font(.system(size: 13))
                        .foregroundStyle(.gray)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity, minHeight: 200)
                .padding(40)
            }
        }
        .background(Color(hex: "050505"))
        .task { await fetchGuide() }
    }

    // MARK: - UI Components

    private func infoSection<Content: View>(
        title: String,
        accentColor: Color = .gray,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 9, weight: .heavy))
                .tracking(2)
                .foregroundStyle(.gray)

            VStack(alignment: .leading, spacing: 10) {
                content()
            }
            .padding(14)
            .background(Color(hex: "0a0a0a"))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(accentColor.opacity(0.15), lineWidth: 1))
        }
    }

    private func infoRow(label: String, value: String, copyable: Bool = false) -> some View {
        HStack(alignment: .top) {
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(.gray)
                .frame(width: 110, alignment: .leading)
            Text(value)
                .font(.system(size: 12, weight: .semibold))
                .foregroundStyle(.white.opacity(0.85))
                .fixedSize(horizontal: false, vertical: true)
            Spacer()
            if copyable {
                copyButton(value: value, field: label)
            }
        }
    }

    private func copyButton(value: String, field: String) -> some View {
        Button {
            UIPasteboard.general.string = value
            copiedField = field
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { copiedField = nil }
        } label: {
            Image(systemName: copiedField == field ? "checkmark" : "doc.on.doc")
                .font(.system(size: 11))
                .foregroundStyle(copiedField == field ? .green : Color(hex: "c8a455"))
        }
    }

    // MARK: - API

    private func fetchGuide() async {
        isLoading = true
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/soluna/guide/\(slug)") else { return }
        var req = URLRequest(url: url)
        if let token = authService.memberToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let (data, response) = try? await URLSession.shared.data(for: req),
           let http = response as? HTTPURLResponse, http.statusCode == 200 {
            guide = try? JSONDecoder().decode(GuideData.self, from: data)
        }
    }
}
