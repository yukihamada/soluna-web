import SwiftUI

struct AIChatMessage: Identifiable {
    let id = UUID()
    let role: String
    let content: String
}

// MARK: - Quiz State

enum QuizStep {
    case start, environment, budget, timing, result
}

struct AIChatView: View {
    @State private var messages: [AIChatMessage] = []
    @State private var inputText = ""
    @State private var isLoading = false
    @FocusState private var focused: Bool
    @State private var quizStep: QuizStep = .start
    @State private var quizEnv: String = ""
    @State private var quizBudget: String = ""
    @State private var quizTiming: String = ""

    private let baseURL = "https://solun.art"

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 2) {
                            if messages.isEmpty {
                                quizFlow
                                    .id("quiz")
                            } else {
                                ForEach(messages) { msg in
                                    bubble(msg).id(msg.id)
                                }
                                if isLoading {
                                    typingDots.id("loading")
                                }
                            }
                        }
                        .padding(.vertical, 12)
                    }
                    .onChange(of: messages.count) { _, _ in
                        withAnimation { proxy.scrollTo(messages.last?.id, anchor: .bottom) }
                    }
                    .onChange(of: isLoading) { _, v in
                        if v { withAnimation { proxy.scrollTo("loading", anchor: .bottom) } }
                    }
                }

                // Input bar (only when past quiz)
                if !messages.isEmpty || quizStep == .result {
                    inputBar
                }
            }
            .background(Color(hex: "050505"))
            .navigationTitle("AI")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                if !messages.isEmpty {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button {
                            messages = []
                            quizStep = .start
                        } label: {
                            Image(systemName: "arrow.counterclockwise")
                                .font(.system(size: 14))
                                .foregroundStyle(Color(hex: "c8a455").opacity(0.6))
                        }
                    }
                }
            }
        }
    }

    // MARK: - Quiz Flow

    @ViewBuilder
    private var quizFlow: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 8) {
                Circle()
                    .fill(Color(hex: "c8a455").opacity(0.12))
                    .frame(width: 56, height: 56)
                    .overlay(Image(systemName: "sparkles").font(.system(size: 22)).foregroundStyle(Color(hex: "c8a455")))
                Text("どんな滞在を探していますか？")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundStyle(.white)
                Text("3つ答えるだけで最適な物件をご提案します")
                    .font(.system(size: 12))
                    .foregroundStyle(.gray)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 40)

            switch quizStep {
            case .start:
                quizCard(
                    step: "1 / 3", question: "どんな環境が好きですか？",
                    choices: [
                        ("mountain.2.fill", "山・森・大自然", "山"),
                        ("water.waves",     "海・ビーチ",     "海"),
                        ("train.side.front.car", "都市近く", "都市近く"),
                        ("globe",          "こだわらない",   "なんでも"),
                    ]
                ) { choice in
                    quizEnv = choice; quizStep = .environment
                }

            case .environment:
                quizCard(
                    step: "2 / 3", question: "1口あたりの予算感は？",
                    choices: [
                        ("yensign.circle",      "〜500万円",       "〜500万"),
                        ("yensign.circle.fill", "500万〜2000万円", "500万〜2000万"),
                        ("crown",               "2000万円以上",    "2000万以上"),
                        ("questionmark.circle", "まだ検討中",      "未定"),
                    ]
                ) { choice in
                    quizBudget = choice; quizStep = .budget
                }

            case .budget:
                quizCard(
                    step: "3 / 3", question: "いつ頃から使いたいですか？",
                    choices: [
                        ("calendar",             "今すぐ",     "すぐ"),
                        ("calendar.badge.clock", "半年以内",   "半年以内"),
                        ("calendar.badge.plus",  "1年以上先",  "1年以上先"),
                        ("eye",                  "まず見てみたい", "検討中"),
                    ]
                ) { choice in
                    quizTiming = choice
                    quizStep = .result
                    let q = "おすすめ物件を教えてください。環境：\(quizEnv)、予算：\(quizBudget)、時期：\(quizTiming)"
                    messages.append(AIChatMessage(role: "user", content: q))
                    Task { await sendToAPI(text: q) }
                }

            case .result, .timing:
                EmptyView()
            }

            // Manual input shortcut
            Button {
                quizStep = .result
                messages.append(AIChatMessage(role: "user", content: "物件を探しています"))
                Task { await sendToAPI(text: "SOLUNAの物件について教えてください") }
            } label: {
                Text("自由に質問する")
                    .font(.system(size: 12))
                    .foregroundStyle(Color(hex: "c8a455").opacity(0.5))
            }
            .padding(.bottom, 20)
        }
        .padding(.horizontal, 20)
    }

    private func quizCard(step: String, question: String, choices: [(String, String, String)], onSelect: @escaping (String) -> Void) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(step)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(Color(hex: "c8a455").opacity(0.6))
                Spacer()
            }
            Text(question)
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(.white)

            VStack(spacing: 8) {
                ForEach(choices, id: \.0) { icon, label, value in
                    Button { onSelect(value) } label: {
                        HStack(spacing: 12) {
                            Image(systemName: icon)
                                .font(.system(size: 16))
                                .foregroundStyle(Color(hex: "c8a455"))
                                .frame(width: 24)
                            Text(label)
                                .font(.system(size: 14))
                                .foregroundStyle(.white)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 11))
                                .foregroundStyle(.gray.opacity(0.4))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(Color(hex: "111111"))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.white.opacity(0.05), lineWidth: 1))
                    }
                }
            }
        }
        .padding(20)
        .background(Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "c8a455").opacity(0.12), lineWidth: 1))
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("物件・予約・投資、何でも聞いてください", text: $inputText, axis: .vertical)
                .font(.system(size: 14))
                .foregroundStyle(.white)
                .focused($focused)
                .lineLimit(1...5)
                .padding(11)
                .background(Color(hex: "111111"))
                .clipShape(RoundedRectangle(cornerRadius: 22))
                .overlay(RoundedRectangle(cornerRadius: 22).stroke(Color.white.opacity(0.08)))

            Button { Task { await send() } } label: {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(
                        inputText.trimmingCharacters(in: .whitespaces).isEmpty || isLoading
                            ? Color(hex: "c8a455").opacity(0.25)
                            : Color(hex: "c8a455")
                    )
            }
            .disabled(inputText.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(Color(hex: "080808"))
        .overlay(alignment: .top) {
            Rectangle().fill(Color.white.opacity(0.05)).frame(height: 1)
        }
    }

    // MARK: - Bubble

    @ViewBuilder
    private func bubble(_ msg: AIChatMessage) -> some View {
        let isUser = msg.role == "user"
        HStack(alignment: .bottom, spacing: 8) {
            if isUser { Spacer(minLength: 56) }
            if !isUser {
                Circle()
                    .fill(Color(hex: "c8a455").opacity(0.15))
                    .frame(width: 28, height: 28)
                    .overlay(Image(systemName: "sparkles").font(.system(size: 12)).foregroundStyle(Color(hex: "c8a455")))
            }
            Text(msg.content)
                .font(.system(size: 14))
                .foregroundStyle(isUser ? Color(hex: "040404") : .white.opacity(0.9))
                .lineSpacing(4)
                .padding(.horizontal, 13)
                .padding(.vertical, 9)
                .background(isUser ? Color(hex: "c8a455") : Color(hex: "111111"))
                .clipShape(RoundedRectangle(cornerRadius: 17))
                .textSelection(.enabled)
            if !isUser { Spacer(minLength: 56) }
            if isUser {
                Circle()
                    .fill(Color(hex: "c8a455").opacity(0.12))
                    .frame(width: 28, height: 28)
                    .overlay(Image(systemName: "person.fill").font(.system(size: 12)).foregroundStyle(Color(hex: "c8a455")))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 3)
    }

    // MARK: - Typing dots

    private var typingDots: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(Color(hex: "c8a455").opacity(0.15))
                .frame(width: 28, height: 28)
                .overlay(Image(systemName: "sparkles").font(.system(size: 12)).foregroundStyle(Color(hex: "c8a455")))
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    Circle()
                        .fill(Color(hex: "c8a455").opacity(0.5))
                        .frame(width: 5, height: 5)
                        .offset(y: isLoading ? -3 : 0)
                        .animation(.easeInOut(duration: 0.4).repeatForever().delay(Double(i) * 0.12), value: isLoading)
                }
            }
            .padding(.horizontal, 14).padding(.vertical, 10)
            .background(Color(hex: "111111"))
            .clipShape(RoundedRectangle(cornerRadius: 17))
            Spacer()
        }
        .padding(.horizontal, 12).padding(.vertical, 3)
    }

    // MARK: - Send

    private func send() async {
        let text = inputText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty else { return }
        inputText = ""
        focused = false
        messages.append(AIChatMessage(role: "user", content: text))
        await sendToAPI(text: text)
    }

    private func sendToAPI(text: String) async {
        isLoading = true
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/soluna/chat") else {
            messages.append(AIChatMessage(role: "assistant", content: fallback(for: text)))
            return
        }
        let history = messages.dropLast().map { ["role": $0.role, "content": $0.content] }
        let body: [String: Any] = ["question": text, "history": history]
        guard let data = try? JSONSerialization.data(withJSONObject: body) else { return }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"; req.httpBody = data
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token = AuthService.shared.memberToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        do {
            let (respData, resp) = try await URLSession.shared.data(for: req)
            if let http = resp as? HTTPURLResponse, http.statusCode == 200,
               let json = try? JSONSerialization.jsonObject(with: respData) as? [String: Any],
               let answer = json["answer"] as? String {
                messages.append(AIChatMessage(role: "assistant", content: answer))
            } else {
                messages.append(AIChatMessage(role: "assistant", content: fallback(for: text)))
            }
        } catch {
            messages.append(AIChatMessage(role: "assistant", content: fallback(for: text)))
        }
    }

    private func fallback(for q: String) -> String {
        let lq = q.lowercased()
        if lq.contains("山") || lq.contains("森") || lq.contains("北海道") {
            if lq.contains("〜500万") || lq.contains("500万以下") {
                return "予算500万以内なら **インスタントハウス（¥120万/口）** がおすすめです。北海道弟子屈のオフグリッド設計で、年30泊の利用権付き。まずは小さく始められます。"
            }
            return "北海道の物件は **THE LODGE（¥490万）**・**NESTING（¥890万）**・**TAPKOP（¥8,000万）** があります。天然温泉・タワーサウナ・専任シェフ付きと、価格帯で体験が変わります。"
        }
        if lq.contains("海") || lq.contains("ハワイ") || lq.contains("ビーチ") {
            return "ハワイ物件は **HONOLULU BEACH VILLA（¥2,800万）** と **HAWAII KAI HOUSE（¥3,800万）** が2026年11月オープン予定です。年30泊の優先滞在権付き。"
        }
        if lq.contains("都市近く") || lq.contains("熱海") || lq.contains("atami") {
            return "都市近くなら **WHITE HOUSE 熱海（¥1,900万/口）** がベスト。東京から新幹線45分、相模湾一望のガラス張り邸宅で年36泊利用できます。"
        }
        if lq.contains("2000万以上") || lq.contains("高級") {
            return "高予算なら **WHITE HOUSE 熱海（¥1,900万）** や **HONOLULU BEACH VILLA（¥2,800万）** がおすすめです。市場相場（Airbnb ¥90,000〜150,000/泊）に対し、オーナー利用は大幅にお得になります。"
        }
        if lq.contains("投資") || lq.contains("roi") || lq.contains("利回り") {
            return "THE LODGEを例にすると：1口¥490万で年30泊利用権。Airbnb相場¥52,000×30泊＝年間¥156万相当のバリュー。約3.1年分の「宿泊コスト」で永続的な権利を取得できます。"
        }
        return "物件・予約・投資・イベントについて何でも聞いてください。\n例：「予算500万で北海道の物件を探している」「1口でどれくらいお得？」「ハワイはいつから？」"
    }
}
