import SwiftUI

struct BookingView: View {
    @StateObject private var authService = AuthService.shared
    @State private var selectedTab = 0  // 0=SOLUNA, 1=NOT A HOTEL
    @State private var selectedSolunaSlug = "lodge"
    @State private var selectedNahId = "aoshima"
    @State private var checkinDate = Date()
    @State private var checkoutDate = Calendar.current.date(byAdding: .day, value: 1, to: Date())!
    @State private var guests = 2
    @State private var notes = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String?
    @State private var successMessage: String?

    private let baseURL = "https://solun.art"

    private let solunaProps: [(slug: String, name: String, location: String)] = [
        ("lodge",    "THE LODGE",         "北海道 弟子屈"),
        ("nesting",  "NESTING",           "北海道 弟子屈"),
        ("atami",    "WHITE HOUSE 熱海",  "静岡県 熱海"),
        ("instant",  "インスタントハウス", "北海道 弟子屈"),
        ("tapkop",   "TAPKOP",            "北海道 弟子屈"),
        ("honolulu", "HONOLULU BEACH VILLA", "ハワイ ホノルル"),
        ("maui",     "HAWAII KAI HOUSE",  "ハワイ ホノルル"),
    ]

    private let nahProps: [(id: String, name: String, location: String)] = [
        ("aoshima",      "NOT A HOTEL AOSHIMA",    "宮崎"),
        ("nah_nasu",     "NOT A HOTEL NASU",        "栃木"),
        ("nah_kitakaru", "NOT A HOTEL 北軽井沢",    "群馬"),
        ("nah_ishigaki", "NOT A HOTEL ISHIGAKI",    "沖縄"),
        ("nah_fuji",     "NOT A HOTEL FUJI",        "静岡"),
        ("nah_setouchi", "NOT A HOTEL SETOUCHI",    "岡山"),
    ]

    private static let df: DateFormatter = {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f
    }()

    var nightCount: Int {
        max(Calendar.current.dateComponents([.day], from: checkinDate, to: checkoutDate).day ?? 0, 0)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if authService.isOwner {
                    Picker("", selection: $selectedTab) {
                        Text("SOLUNA").tag(0)
                        Text("NOT A HOTEL").tag(1)
                    }
                    .pickerStyle(.segmented)
                }

                // Property picker
                sectionCard(title: selectedTab == 0 ? "SOLUNA 物件" : "NOT A HOTEL 物件") {
                    if selectedTab == 0 {
                        Picker("物件", selection: $selectedSolunaSlug) {
                            ForEach(solunaProps, id: \.slug) { p in
                                VStack(alignment: .leading) {
                                    Text(p.name)
                                    Text(p.location).font(.caption).foregroundStyle(.gray)
                                }
                                .tag(p.slug)
                            }
                        }
                        .pickerStyle(.wheel)
                        .frame(height: 120)
                        .clipped()
                    } else {
                        Picker("物件", selection: $selectedNahId) {
                            ForEach(nahProps, id: \.id) { p in
                                VStack(alignment: .leading) {
                                    Text(p.name)
                                    Text(p.location).font(.caption).foregroundStyle(.gray)
                                }
                                .tag(p.id)
                            }
                        }
                        .pickerStyle(.wheel)
                        .frame(height: 120)
                        .clipped()
                    }
                }

                // Dates
                sectionCard(title: "日程") {
                    VStack(spacing: 16) {
                        DatePicker("チェックイン", selection: $checkinDate,
                                   in: Date()..., displayedComponents: .date)
                            .tint(Color(hex: "c8a455"))
                        DatePicker("チェックアウト", selection: $checkoutDate,
                                   in: Calendar.current.date(byAdding: .day, value: 1, to: checkinDate)!...,
                                   displayedComponents: .date)
                            .tint(Color(hex: "c8a455"))
                        HStack {
                            Text("宿泊数").font(.system(size: 13)).foregroundStyle(.gray)
                            Spacer()
                            Text("\(nightCount)泊")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundStyle(Color(hex: "c8a455"))
                        }
                    }
                }

                // Guests
                sectionCard(title: "人数") {
                    Stepper("\(guests)名", value: $guests, in: 1...20)
                        .foregroundStyle(.white)
                }

                // Notes
                sectionCard(title: "備考（任意）") {
                    TextField("到着時間・特別なご要望など", text: $notes, axis: .vertical)
                        .font(.system(size: 14))
                        .foregroundStyle(.white)
                        .lineLimit(2...4)
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 12))
                        .foregroundStyle(.red)
                        .padding(.horizontal, 4)
                }

                if let successMessage {
                    Text(successMessage)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(.green)
                        .padding(.horizontal, 4)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                }

                Button {
                    Task { await submit() }
                } label: {
                    HStack {
                        if isSubmitting { ProgressView().tint(Color(hex: "050505")) }
                        Text("予約申込を送る")
                            .font(.system(size: 14, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "050505"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(nightCount > 0 && !isSubmitting
                                ? Color(hex: "c8a455")
                                : Color(hex: "c8a455").opacity(0.3))
                    .clipShape(Capsule())
                }
                .disabled(nightCount <= 0 || isSubmitting)
            }
            .padding(16)
        }
        .background(Color(hex: "050505"))
        .navigationTitle("宿泊予約")
        .navigationBarTitleDisplayMode(.inline)
        .task { await authService.fetchSolunaMe() }
        .onChange(of: checkinDate) { _, v in
            if checkoutDate <= v {
                checkoutDate = Calendar.current.date(byAdding: .day, value: 1, to: v)!
            }
        }
    }

    // MARK: - Submit

    private func submit() async {
        isSubmitting = true; errorMessage = nil; successMessage = nil
        defer { isSubmitting = false }

        guard let token = authService.memberToken else {
            errorMessage = "ログインが必要です"
            return
        }

        let cin = Self.df.string(from: checkinDate)
        let cout = Self.df.string(from: checkoutDate)

        if selectedTab == 1 && authService.isOwner {
            // NAH booking via KAGI
            await submitNAH(token: token, cin: cin, cout: cout)
        } else {
            // SOLUNA booking
            await submitSoluna(token: token, cin: cin, cout: cout)
        }
    }

    private func submitSoluna(token: String, cin: String, cout: String) async {
        guard let url = URL(string: "\(baseURL)/api/soluna/stay") else { return }
        let body: [String: Any] = [
            "slug": selectedSolunaSlug,
            "check_in": cin,
            "check_out": cout,
            "guests": guests,
            "notes": notes,
        ]
        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.httpBody = bodyData
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        do {
            let (data, resp) = try await URLSession.shared.data(for: req)
            let http = resp as? HTTPURLResponse
            if http?.statusCode == 200 || http?.statusCode == 201 {
                let json = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                let propName = json?["property"] as? String ?? selectedSolunaSlug
                successMessage = "✅ \(propName)\n\(cin) 〜 \(cout)\n申込を受け付けました。24時間以内にご連絡します。"
            } else {
                let json = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                errorMessage = (json?["error"] as? String) ?? "送信に失敗しました"
            }
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }

    private func submitNAH(token: String, cin: String, cout: String) async {
        guard let url = URL(string: "\(baseURL)/api/soluna/nah/reserve") else { return }
        let body: [String: Any] = [
            "property": selectedNahId,
            "check_in": cin,
            "check_out": cout,
            "guests": guests,
            "note": notes,
        ]
        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.httpBody = bodyData
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        do {
            let (data, resp) = try await URLSession.shared.data(for: req)
            let http = resp as? HTTPURLResponse
            if http?.statusCode == 200 || http?.statusCode == 201 {
                let json = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                let rid = json?["reservation_id"] as? String ?? ""
                successMessage = "✅ NOT A HOTEL 予約完了\n\(cin) 〜 \(cout)\n予約ID: \(rid)"
            } else {
                let json = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])
                errorMessage = (json?["error"] as? String) ?? "送信に失敗しました"
            }
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }

    // MARK: - Section Card

    private func sectionCard<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 13, weight: .bold))
                .foregroundStyle(.white)
            content()
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}
