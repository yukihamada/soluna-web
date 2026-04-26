import SwiftUI

struct WorkParty: Codable, Identifiable {
    let id: String
    let title: String
    let property_name: String?
    let start_date: String
    let end_date: String
    let max_participants: Int?
    let signup_count: Int?
    let description: String?

    // Legacy field support
    var capacity: Int { max_participants ?? 8 }
    var signed_up: Int { signup_count ?? 0 }
    var remainingSlots: Int { max(capacity - signed_up, 0) }
}

struct WorkPartySignupRequest: Codable {
    let name: String
    let email: String
    let travel_method: String
    let note: String
}

struct WorkPartyView: View {
    @State private var parties: [WorkParty] = []
    @State private var isLoading = false
    @State private var selectedParty: WorkParty?
    @State private var showSignupSheet = false

    private let baseURL = "https://solun.art"

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                zamnaCard

                if isLoading {
                    ProgressView()
                        .tint(Color(hex: "c8a455"))
                        .frame(maxWidth: .infinity, minHeight: 200)
                } else if parties.isEmpty {
                    emptyState
                } else {
                    ForEach(parties) { party in
                        workPartyCard(party)
                    }
                }
            }
            .padding(16)
        }
        .background(Color(hex: "050505"))
        .navigationTitle("Work Party")
        .navigationBarTitleDisplayMode(.inline)
        .task { await fetchParties() }
        .sheet(isPresented: $showSignupSheet) {
            if let party = selectedParty {
                WorkPartySignupSheet(party: party) {
                    await fetchParties()
                }
            }
        }
    }

    // MARK: - ZAMNA Event Card

    private var zamnaCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 6) {
                Text("ZAMNA × SOLUNA FEST HAWAII 2026")
                    .font(.system(size: 9, weight: .heavy))
                    .tracking(1.5)
                    .foregroundStyle(Color(hex: "c8a455"))
                Spacer()
                Text("日程調整中")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundStyle(Color(hex: "c8a455"))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color(hex: "c8a455").opacity(0.12))
                    .clipShape(Capsule())
            }

            Text("この木は\n覚えている")
                .font(.system(size: 22, weight: .heavy))
                .foregroundStyle(.white)
                .lineSpacing(4)

            HStack(spacing: 16) {
                Label("Oahu, Hawaii", systemImage: "mappin.circle")
                    .font(.system(size: 11))
                    .foregroundStyle(.gray)
                Label("2026", systemImage: "calendar")
                    .font(.system(size: 11))
                    .foregroundStyle(.gray)
            }

            Text("WhoMadeWho · Mathame · Korolova")
                .font(.system(size: 11))
                .foregroundStyle(.gray.opacity(0.7))

            NavigationLink(destination: SafariView(url: URL(string: "https://solun.art/zamna")!) {}) {
                Text("詳細・事前登録")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Color(hex: "050505"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color(hex: "c8a455"))
                    .clipShape(Capsule())
            }
            .buttonStyle(.plain)
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [Color(hex: "c8a455").opacity(0.1), Color(hex: "0a0a0a")],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color(hex: "c8a455").opacity(0.25), lineWidth: 1)
        )
    }

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "wrench.and.screwdriver")
                .font(.system(size: 36))
                .foregroundStyle(Color(hex: "c8a455").opacity(0.5))
            Text("現在予定されているWork Partyはありません")
                .font(.system(size: 13))
                .foregroundStyle(.gray)
        }
        .frame(maxWidth: .infinity, minHeight: 200)
    }

    private func workPartyCard(_ party: WorkParty) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(party.title)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(.white)
                    Text(party.property_name ?? "")
                        .font(.system(size: 11))
                        .foregroundStyle(Color(hex: "c8a455"))
                }
                Spacer()
                slotsTag(remaining: party.remainingSlots)
            }

            HStack(spacing: 16) {
                Label(party.start_date + " - " + party.end_date, systemImage: "calendar")
                    .font(.system(size: 11))
                    .foregroundStyle(.gray)
            }

            if let desc = party.description, !desc.isEmpty {
                Text(desc)
                    .font(.system(size: 12))
                    .foregroundStyle(.gray.opacity(0.8))
                    .lineLimit(3)
            }

            Button {
                selectedParty = party
                showSignupSheet = true
            } label: {
                Text(party.remainingSlots > 0 ? "参加を申し込む" : "満員")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(party.remainingSlots > 0 ? Color(hex: "050505") : .gray)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        party.remainingSlots > 0
                            ? Color(hex: "c8a455")
                            : Color(hex: "1a1a1a")
                    )
                    .clipShape(Capsule())
            }
            .disabled(party.remainingSlots <= 0)
        }
        .padding(16)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color(hex: "c8a455").opacity(0.1), lineWidth: 1)
        )
    }

    private func slotsTag(remaining: Int) -> some View {
        Text("残り\(remaining)枠")
            .font(.system(size: 10, weight: .bold))
            .foregroundStyle(remaining > 0 ? Color(hex: "c8a455") : .red)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(
                (remaining > 0 ? Color(hex: "c8a455") : .red).opacity(0.1)
            )
            .clipShape(Capsule())
    }

    private func fetchParties() async {
        isLoading = true
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/v1/work-parties") else { return }

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            parties = try JSONDecoder().decode([WorkParty].self, from: data)
        } catch {
            print("Failed to fetch work parties: \(error)")
            // Fallback sample for display
            parties = [
                WorkParty(
                    id: "wp-offgrid-0611",
                    title: "OFF-GRID CABIN 建設 DAY1-3",
                    property_name: "OFF-GRID CABIN",
                    start_date: "2026-06-11",
                    end_date: "2026-06-13",
                    max_participants: 10,
                    signup_count: 3,
                    description: "太陽光パネル設置・V2H接続・内装・換気システム・フル稼働テスト"
                )
            ]
        }
    }
}

// MARK: - Signup Sheet

struct WorkPartySignupSheet: View {
    let party: WorkParty
    let onComplete: () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var travelMethod = "車"
    @State private var note = ""
    @State private var isSubmitting = false
    @State private var errorMessage: String?
    @State private var showSuccess = false

    private let baseURL = "https://solun.art"
    private let travelMethods = ["車", "飛行機+レンタカー", "電車+バス", "その他"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    // Party info header
                    VStack(alignment: .leading, spacing: 6) {
                        Text(party.title)
                            .font(.system(size: 17, weight: .bold))
                        Text("\(party.property_name ?? "") | \(party.start_date) - \(party.end_date)")
                            .font(.system(size: 12))
                            .foregroundStyle(Color(hex: "c8a455"))
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(hex: "c8a455").opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 12))

                    // Form fields
                    formField(label: "お名前") {
                        TextField("山田 太郎", text: $name)
                            .textFieldStyle(.roundedBorder)
                    }

                    formField(label: "メールアドレス") {
                        TextField("email@example.com", text: $email)
                            .textFieldStyle(.roundedBorder)
                            .keyboardType(.emailAddress)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)
                    }

                    formField(label: "移動手段") {
                        Picker("移動手段", selection: $travelMethod) {
                            ForEach(travelMethods, id: \.self) { method in
                                Text(method).tag(method)
                            }
                        }
                        .pickerStyle(.segmented)
                    }

                    formField(label: "備考（任意）") {
                        TextField("アレルギー、到着時間など", text: $note, axis: .vertical)
                            .textFieldStyle(.roundedBorder)
                            .lineLimit(3...5)
                    }

                    if let errorMessage {
                        Text(errorMessage)
                            .font(.system(size: 12))
                            .foregroundStyle(.red)
                    }

                    if showSuccess {
                        Label("申込が完了しました", systemImage: "checkmark.circle.fill")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(.green)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    } else {
                        Button {
                            Task { await submit() }
                        } label: {
                            HStack {
                                if isSubmitting {
                                    ProgressView()
                                        .tint(Color(hex: "050505"))
                                }
                                Text("申し込む")
                                    .font(.system(size: 14, weight: .bold))
                            }
                            .foregroundStyle(Color(hex: "050505"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(
                                canSubmit && !isSubmitting
                                    ? Color(hex: "c8a455")
                                    : Color(hex: "c8a455").opacity(0.3)
                            )
                            .clipShape(Capsule())
                        }
                        .disabled(!canSubmit || isSubmitting)
                    }
                }
                .padding(16)
            }
            .background(Color(hex: "050505"))
            .navigationTitle("Work Party 申込")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                        .foregroundStyle(.gray)
                }
            }
        }
    }

    private var canSubmit: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !email.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private func formField<Content: View>(label: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(.gray)
            content()
        }
    }

    private func submit() async {
        isSubmitting = true
        errorMessage = nil
        defer { isSubmitting = false }

        guard let url = URL(string: "\(baseURL)/api/v1/work-parties/\(party.id)/signup") else { return }

        let signup = WorkPartySignupRequest(
            name: name.trimmingCharacters(in: .whitespaces),
            email: email.trimmingCharacters(in: .whitespaces),
            travel_method: travelMethod,
            note: note.trimmingCharacters(in: .whitespaces)
        )

        guard let bodyData = try? JSONEncoder().encode(signup) else { return }

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

            if httpResponse.statusCode == 200 || httpResponse.statusCode == 201 {
                showSuccess = true
                await onComplete()
                try? await Task.sleep(nanoseconds: 1_500_000_000)
                dismiss()
            } else {
                let msg = String(data: data, encoding: .utf8) ?? "不明なエラー"
                errorMessage = "申込に失敗しました: \(msg)"
            }
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }
}
