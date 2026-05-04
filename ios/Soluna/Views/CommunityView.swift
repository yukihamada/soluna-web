import SwiftUI

struct CommunityMessage: Codable, Identifiable {
    let id: Int
    let member_id: Int?
    let display_name: String
    let member_type: String?
    let message: String
    let is_ai: IntBool?
    let reply_to_id: Int?
    let reply_preview: String?
    let image_url: String?
    let created_at: String
    var reactions: [String: Int]?
}

// Server sends is_ai as 0/1 integer
struct IntBool: Codable {
    let value: Bool
    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let i = try? c.decode(Int.self) { value = i != 0 }
        else { value = (try? c.decode(Bool.self)) ?? false }
    }
    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        try c.encode(value)
    }
}

private struct SendMessageResponse: Codable {
    let ok: Bool?
    let message: CommunityMessage?
}

struct CommunityView: View {
    @StateObject private var authService = AuthService.shared
    @State private var messages: [CommunityMessage] = []
    @State private var inputText = ""
    @State private var isLoading = false
    @State private var isSending = false
    @State private var sendError: String? = nil
    @State private var sseTask: Task<Void, Never>?
    @State private var showLoginSheet = false
    @FocusState private var focused: Bool

    private let baseURL = "https://solun.art"
    private let emojis = ["❤️","🔥","🌊","🏔️","🌺","🙏","👏","✨","🎶","🌿","🫧","🐻"]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if isLoading && messages.isEmpty {
                    ProgressView()
                        .tint(Color(hex: "c8a455"))
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if messages.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 44))
                            .foregroundStyle(Color(hex: "c8a455").opacity(0.3))
                        Text("コミュニティへようこそ")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(.white.opacity(0.7))
                        Text("メッセージを送って会話を始めましょう")
                            .font(.system(size: 12))
                            .foregroundStyle(.gray)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 0) {
                                ForEach(messages) { msg in
                                    MessageRow(msg: msg, onReact: { emoji in
                                        Task { await react(messageId: msg.id, emoji: emoji) }
                                    })
                                    .id(msg.id)
                                }
                            }
                            .padding(.vertical, 8)
                        }
                        .background(Color(hex: "050505"))
                        .onChange(of: messages.count) { _, _ in
                            if let last = messages.last {
                                withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                            }
                        }
                    }
                }

                // Input bar
                inputBar
            }
            .background(Color(hex: "050505"))
            .navigationTitle("コミュニティ")
            .navigationBarTitleDisplayMode(.inline)
            .safeAreaInset(edge: .top, spacing: 0) {
                zamnaBanner
            }
            .task {
                await fetchMessages()
                startSSE()
            }
            .onDisappear { sseTask?.cancel() }
        }
    }

    // MARK: - ZAMNA Banner

    private var zamnaBanner: some View {
        Button {
            if let url = URL(string: "https://solun.art/zamna") {
                UIApplication.shared.open(url)
            }
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "music.note.house.fill")
                    .font(.system(size: 13))
                    .foregroundStyle(Color(hex: "c8a455"))
                Text("ZAMNA × SOLUNA FEST HAWAII 2026 — WhoMadeWho · Mathame · Korolova")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(Color(hex: "c8a455"))
                    .lineLimit(1)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 9))
                    .foregroundStyle(Color(hex: "c8a455").opacity(0.5))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .background(Color(hex: "0d0b08"))
            .overlay(alignment: .bottom) {
                Divider().background(Color(hex: "c8a455").opacity(0.1))
            }
        }
    }

    // MARK: - Input bar

    private var inputBar: some View {
        VStack(spacing: 0) {
            Divider().background(Color.white.opacity(0.05))

            if let err = sendError {
                Text(err)
                    .font(.system(size: 11))
                    .foregroundStyle(Color.red.opacity(0.8))
                    .padding(.horizontal, 16)
                    .padding(.top, 6)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            if authService.isLoggedIn {
                HStack(spacing: 10) {
                    TextField("メッセージを入力...", text: $inputText, axis: .vertical)
                        .font(.system(size: 14))
                        .foregroundStyle(.white)
                        .padding(10)
                        .background(Color(hex: "0f0f0f"))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.white.opacity(0.08)))
                        .lineLimit(1...4)
                        .focused($focused)
                        .onSubmit { Task { await sendMessage() } }

                    Button {
                        Task { await sendMessage() }
                    } label: {
                        Image(systemName: isSending ? "hourglass" : "arrow.up.circle.fill")
                            .font(.system(size: 28))
                            .foregroundStyle(
                                !inputText.trimmingCharacters(in: .whitespaces).isEmpty && !isSending
                                    ? Color(hex: "c8a455")
                                    : Color(hex: "c8a455").opacity(0.3)
                            )
                    }
                    .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty || isSending)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
            } else {
                Button { showLoginSheet = true } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "person.crop.circle")
                            .font(.system(size: 15))
                        Text("ログインしてメッセージを送る")
                            .font(.system(size: 13, weight: .semibold))
                    }
                    .foregroundStyle(Color(hex: "050505"))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color(hex: "c8a455"))
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
        }
        .background(Color(hex: "080808"))
        .sheet(isPresented: $showLoginSheet) {
            NavigationStack {
                LoginView()
                    .navigationTitle("ログイン")
                    .navigationBarTitleDisplayMode(.inline)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("閉じる") { showLoginSheet = false }
                                .foregroundStyle(Color(hex: "c8a455"))
                        }
                    }
            }
        }
    }

    // MARK: - API

    private func fetchMessages() async {
        isLoading = true
        defer { isLoading = false }
        guard let url = URL(string: "\(baseURL)/api/soluna/community/messages") else { return }
        var req = URLRequest(url: url)
        if let token = authService.memberToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let (data, _) = try? await URLSession.shared.data(for: req),
           let decoded = try? JSONDecoder().decode([CommunityMessage].self, from: data) {
            messages = decoded
        }
    }

    private func sendMessage() async {
        let text = inputText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        guard let token = authService.memberToken else {
            showLoginSheet = true
            return
        }
        isSending = true
        sendError = nil
        defer { isSending = false }
        inputText = ""
        focused = false

        guard let url = URL(string: "\(baseURL)/api/soluna/community/message") else { return }
        let body: [String: Any] = ["message": text]
        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.httpBody = bodyData
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        do {
            let (data, response) = try await URLSession.shared.data(for: req)
            let http = response as? HTTPURLResponse
            let status = http?.statusCode ?? 0
            if status == 200 || status == 201 {
                if let wrapper = try? JSONDecoder().decode(SendMessageResponse.self, from: data),
                   let msg = wrapper.message {
                    await MainActor.run { messages.append(msg) }
                } else {
                    await fetchMessages()
                }
            } else if status == 429 {
                let err = (try? JSONDecoder().decode([String: String].self, from: data))?["error"]
                await MainActor.run { sendError = err ?? "送信が速すぎます"; inputText = text }
            } else if status == 401 {
                await MainActor.run { showLoginSheet = true; inputText = text }
            } else {
                await fetchMessages()
            }
        } catch {
            await MainActor.run { sendError = "送信に失敗しました"; inputText = text }
        }
    }

    private func react(messageId: Int, emoji: String) async {
        guard let url = URL(string: "\(baseURL)/api/soluna/community/react") else { return }
        let body: [String: Any] = ["message_id": messageId, "emoji": emoji]
        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.httpBody = bodyData
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = authService.memberToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        _ = try? await URLSession.shared.data(for: req)
        await fetchMessages()
    }

    private func startSSE() {
        sseTask?.cancel()
        sseTask = Task {
            await self.runSSE()
        }
    }

    private func runSSE() async {
        guard let url = URL(string: "\(baseURL)/api/soluna/community/stream") else { return }
        var req = URLRequest(url: url)
        req.timeoutInterval = 300
        if let token = authService.memberToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        do {
            let (stream, _) = try await URLSession.shared.bytes(for: req)
            var buffer = ""
            for try await line in stream.lines {
                guard !Task.isCancelled else { break }
                if line.hasPrefix("data: ") {
                    let json = String(line.dropFirst(6))
                    if let data = json.data(using: .utf8),
                       let msg = try? JSONDecoder().decode(CommunityMessage.self, from: data) {
                        await MainActor.run {
                            if !self.messages.contains(where: { $0.id == msg.id }) {
                                self.messages.append(msg)
                            }
                        }
                    }
                }
                _ = buffer
            }
        } catch {
            // SSE connection ended or errored — normal lifecycle
        }
    }
}

// MARK: - Message Row

struct MessageRow: View {
    let msg: CommunityMessage
    let onReact: (String) -> Void
    @State private var showEmojis = false

    private let emojis = ["❤️","🔥","🌊","🏔️","🌺","🙏","👏","✨","🎶","🌿","🫧","🐻"]

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                Circle()
                    .fill(avatarColor)
                    .frame(width: 28, height: 28)
                    .overlay(
                        Text(String(msg.display_name.prefix(1)))
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.white)
                    )

                VStack(alignment: .leading, spacing: 1) {
                    HStack(spacing: 6) {
                        Text(msg.display_name)
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(.white)
                        if msg.is_ai?.value == true {
                            Text("AI")
                                .font(.system(size: 8, weight: .heavy))
                                .foregroundStyle(Color(hex: "c8a455"))
                                .padding(.horizontal, 5).padding(.vertical, 1)
                                .background(Color(hex: "c8a455").opacity(0.15))
                                .clipShape(Capsule())
                        }
                        if msg.member_type == "owner" || msg.member_type == "admin" {
                            Text("OWNER")
                                .font(.system(size: 7, weight: .heavy))
                                .foregroundStyle(Color(hex: "c8a455"))
                                .padding(.horizontal, 5).padding(.vertical, 1)
                                .background(Color(hex: "c8a455").opacity(0.12))
                                .overlay(Capsule().stroke(Color(hex: "c8a455").opacity(0.3), lineWidth: 0.5))
                                .clipShape(Capsule())
                        }
                        Text(formatTime(msg.created_at))
                            .font(.system(size: 9))
                            .foregroundStyle(.gray.opacity(0.5))
                    }
                }
                Spacer()
            }

            if let preview = msg.reply_preview {
                HStack(spacing: 6) {
                    Rectangle()
                        .fill(Color(hex: "c8a455").opacity(0.4))
                        .frame(width: 2)
                    Text(preview)
                        .font(.system(size: 10))
                        .foregroundStyle(.gray)
                        .lineLimit(1)
                }
                .padding(.leading, 34)
            }

            Text(msg.message)
                .font(.system(size: 14))
                .foregroundStyle(.white.opacity(0.88))
                .lineSpacing(4)
                .padding(.leading, 34)
                .textSelection(.enabled)

            // Reactions + add button
            HStack(spacing: 6) {
                if let reactions = msg.reactions, !reactions.isEmpty {
                    ForEach(Array(reactions.keys.sorted()), id: \.self) { emoji in
                        if let count = reactions[emoji], count > 0 {
                            Button { onReact(emoji) } label: {
                                Text("\(emoji) \(count)")
                                    .font(.system(size: 11))
                                    .foregroundStyle(.white.opacity(0.7))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 3)
                                    .background(Color.white.opacity(0.05))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }

                Button {
                    withAnimation(.spring(duration: 0.2)) { showEmojis.toggle() }
                } label: {
                    Image(systemName: "face.smiling")
                        .font(.system(size: 12))
                        .foregroundStyle(.gray.opacity(0.4))
                }
            }
            .padding(.leading, 34)

            if showEmojis {
                LazyVGrid(columns: Array(repeating: GridItem(.fixed(32)), count: 12), spacing: 4) {
                    ForEach(emojis, id: \.self) { emoji in
                        Button {
                            onReact(emoji)
                            withAnimation { showEmojis = false }
                        } label: {
                            Text(emoji).font(.system(size: 18))
                        }
                    }
                }
                .padding(.leading, 34)
                .transition(.scale.combined(with: .opacity))
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
    }

    private var avatarColor: Color {
        let colors: [Color] = [
            Color(hex: "c8a455"), Color(hex: "6b9c5a"), Color(hex: "5a7fa0"),
            Color(hex: "9c6b8a"), Color(hex: "a07c5a")
        ]
        let idx = abs(msg.display_name.hashValue) % colors.count
        return colors[idx]
    }

    private func formatTime(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) {
            let rel = RelativeDateTimeFormatter()
            rel.unitsStyle = .abbreviated
            return rel.localizedString(for: date, relativeTo: Date())
        }
        return iso.prefix(10).description
    }
}
