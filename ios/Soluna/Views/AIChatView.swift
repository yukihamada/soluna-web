import SwiftUI

struct AIChatMessage: Identifiable {
    let id = UUID()
    let role: String
    let content: String
}

// MARK: - Quiz

enum QuizStep: Int, CaseIterable {
    case purpose, environment, groupSize, budget, timing, result
}

struct QuizAnswers {
    var purpose: String = ""
    var environment: String = ""
    var groupSize: String = ""
    var budget: String = ""
    var timing: String = ""
}

struct AIChatView: View {
    @State private var messages: [AIChatMessage] = []
    @State private var inputText = ""
    @State private var isLoading = false
    @FocusState private var focused: Bool
    @State private var quizStep: QuizStep = .purpose
    @State private var answers = QuizAnswers()

    private let baseURL = "https://solun.art"

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 2) {
                            if messages.isEmpty {
                                quizFlow.id("quiz")
                            } else {
                                ForEach(messages) { msg in
                                    bubble(msg).id(msg.id)
                                }
                                if isLoading { typingDots.id("loading") }
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
                            quizStep = .purpose
                            answers = QuizAnswers()
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
        VStack(spacing: 20) {
            quizHeader

            Group {
                switch quizStep {
                case .purpose:
                    quizCard(step: "1 / 5", question: "どんな目的で使いますか？",
                             choices: [
                                ("house.fill",           "別荘として共同購入したい",  "purchase"),
                                ("chart.line.uptrend.xyaxis", "不動産として投資したい", "invest"),
                                ("hammer.fill",          "Work Partyに参加・建設したい", "work_party"),
                                ("music.note.house.fill","ZAMNA FESTに参加したい",   "fest"),
                             ]) { v in
                        if v == "work_party" { finishWithWorkParty() }
                        else if v == "fest"  { finishWithFest() }
                        else { answers.purpose = v; advance() }
                    }

                case .environment:
                    quizCard(step: "2 / 5", question: "どんな環境が好みですか？",
                             choices: [
                                ("mountain.2.fill",      "山・森・大自然",    "mountain"),
                                ("water.waves",          "海・ビーチ・南国",  "sea"),
                                ("train.side.front.car", "都市から近い場所",  "city"),
                                ("globe",                "特にこだわらない",  "any"),
                             ]) { v in answers.environment = v; advance() }

                case .groupSize:
                    quizCard(step: "3 / 5", question: "主に何人で使いますか？",
                             choices: [
                                ("person.fill",       "1〜2人（カップル・ソロ）", "small"),
                                ("person.2.fill",     "3〜6人（家族・少人数）",   "medium"),
                                ("person.3.fill",     "7人以上（グループ・仲間）","large"),
                                ("questionmark",      "状況によって変わる",       "varies"),
                             ]) { v in answers.groupSize = v; advance() }

                case .budget:
                    quizCard(step: "4 / 5", question: "1口あたりの予算感は？",
                             choices: [
                                ("yensign",                    "〜500万円",       "low"),
                                ("yensign.circle",             "500万〜2,000万円","mid"),
                                ("yensign.circle.fill",        "2,000万〜4,000万円","high"),
                                ("crown.fill",                 "4,000万円以上",   "premium"),
                             ]) { v in answers.budget = v; advance() }

                case .timing:
                    quizCard(step: "5 / 5", question: "いつ頃から使い始めたいですか？",
                             choices: [
                                ("calendar.badge.exclamationmark", "今すぐ・今年中に", "now"),
                                ("calendar",                       "半年〜1年以内に",  "soon"),
                                ("calendar.badge.plus",            "1年以上先でもOK", "later"),
                                ("eye",                            "まず情報収集中",   "exploring"),
                             ]) { v in
                        answers.timing = v
                        let rec = makeRecommendation()
                        messages.append(AIChatMessage(role: "user", content: quizSummary()))
                        messages.append(AIChatMessage(role: "assistant", content: rec))
                        quizStep = .result
                    }

                case .result:
                    EmptyView()
                }
            }

            Button {
                quizStep = .result
            } label: {
                Text("スキップして自由に質問する →")
                    .font(.system(size: 12))
                    .foregroundStyle(Color(hex: "c8a455").opacity(0.45))
            }
            .padding(.bottom, 20)
        }
        .padding(.horizontal, 20)
    }

    private var quizHeader: some View {
        VStack(spacing: 8) {
            Circle()
                .fill(Color(hex: "c8a455").opacity(0.12))
                .frame(width: 52, height: 52)
                .overlay(
                    Image(systemName: "sparkles")
                        .font(.system(size: 20))
                        .foregroundStyle(Color(hex: "c8a455"))
                )
            Text("5つの質問で最適な物件を提案します")
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(.white)
            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2).fill(Color.white.opacity(0.06)).frame(height: 3)
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color(hex: "c8a455"))
                        .frame(width: geo.size.width * (Double(quizStep.rawValue) / 5.0), height: 3)
                        .animation(.easeInOut(duration: 0.3), value: quizStep)
                }
            }
            .frame(height: 3)
            .padding(.top, 4)
        }
        .padding(.top, 36)
    }

    private func advance() {
        withAnimation(.easeInOut(duration: 0.25)) {
            quizStep = QuizStep(rawValue: quizStep.rawValue + 1) ?? .result
        }
    }

    private func finishWithWorkParty() {
        let msg = "Work Partyについて教えてください"
        messages.append(AIChatMessage(role: "user", content: msg))
        quizStep = .result
        Task { await sendToAPI(text: msg) }
    }

    private func finishWithFest() {
        let msg = "ZAMNA × SOLUNA FEST HAWAIIについて教えてください"
        messages.append(AIChatMessage(role: "user", content: msg))
        quizStep = .result
        Task { await sendToAPI(text: msg) }
    }

    private func quizSummary() -> String {
        let purposeLabel = ["purchase": "別荘として購入", "invest": "投資目的"]
        let envLabel = ["mountain": "山・森", "sea": "海・ビーチ", "city": "都市近く", "any": "こだわらない"]
        let sizeLabel = ["small": "1〜2人", "medium": "3〜6人", "large": "7人以上", "varies": "状況による"]
        let budgetLabel = ["low": "〜500万", "mid": "500万〜2000万", "high": "2000万〜4000万", "premium": "4000万以上"]
        let timingLabel = ["now": "今すぐ", "soon": "半年〜1年", "later": "1年以上先", "exploring": "情報収集中"]
        return [
            purposeLabel[answers.purpose] ?? "",
            envLabel[answers.environment] ?? "",
            sizeLabel[answers.groupSize] ?? "",
            budgetLabel[answers.budget] ?? "",
            timingLabel[answers.timing] ?? "",
        ].filter { !$0.isEmpty }.joined(separator: " · ")
    }

    // MARK: - Recommendation Engine

    private func makeRecommendation() -> String {
        let env = answers.environment
        let budget = answers.budget       // low / mid / high / premium
        let size = answers.groupSize      // small / medium / large / varies
        let timing = answers.timing       // now / soon / later / exploring
        let purpose = answers.purpose     // purchase / invest

        // ── 海・ビーチ ──────────────────────────────
        if env == "sea" {
            if budget == "premium" {
                return """
                ✨ あなたへのおすすめ：HAWAII KAI HOUSE

                📍 ハワイ州ホノルル・ハワイカイ
                💰 ¥3,800万/口　年30泊
                🏄 波音が聞こえるビーチフロント平屋

                Airbnb相場¥175,000/泊に対し、オーナー利用は¥120,000。年30泊で約¥165万のバリュー差。\(timing == "now" || timing == "soon" ? "\n\n⚡ 2026年11月オープン予定。今から口数を確保しておくのがベストです。" : "")

                📩 詳細・相談はマイページからどうぞ。
                """
            } else {
                return """
                ✨ あなたへのおすすめ：HONOLULU BEACH VILLA

                📍 5827 Kalanianaʻole Hwy, Honolulu
                💰 ¥2,800万/口　年30泊
                🌺 ハナウマ湾まで5分・ワイキキ20分

                Airbnb相場¥150,000/泊に対し、オーナー利用は¥85,000。年30泊で約¥195万のバリュー差。\(timing == "now" || timing == "soon" ? "\n\n⚡ 2026年11月オープン予定。早めの申込がおすすめです。" : "")

                📩 詳細・相談はマイページからどうぞ。
                """
            }
        }

        // ── 都市近く ────────────────────────────────
        if env == "city" {
            return """
            ✨ あなたへのおすすめ：WHITE HOUSE 熱海

            📍 静岡県熱海市・相模湾一望
            💰 ¥1,900万/口　年36泊
            🚄 東京から新幹線45分

            \(size == "large" ? "10名まで宿泊可。大人数でも使いやすいガラス張りの白邸。" : "カップル・家族に人気。全面ガラスから相模湾を望む開放感が魅力。")
            Airbnb相場¥90,000/泊、オーナー利用¥55,000。年36泊で約¥126万お得。\(timing == "now" ? "\n\n⚡ 現在稼働中。すぐに利用できます。" : "")

            📩 詳細・相談はマイページからどうぞ。
            """
        }

        // ── 山・森 or any ────────────────────────────
        if budget == "low" {
            return """
            ✨ あなたへのおすすめ：インスタントハウス

            📍 北海道 弟子屈町・美留和
            💰 ¥120万/口　年30泊
            🌿 オフグリッド設計のコンパクトな暮らし

            SOLUNAで最も手が届きやすい入口。Airbnb相場¥32,000/泊、オーナー利用¥25,000。まず小さく始めて、コミュニティを体験するのに最適です。\(timing == "now" ? "\n\n⚡ 現在稼働中。" : "")

            📩 詳細・相談はマイページからどうぞ。
            """
        }

        if budget == "mid" {
            if size == "large" {
                return """
                ✨ あなたへのおすすめ：THE LODGE

                📍 北海道 弟子屈町・美留和
                💰 ¥490万/口　年30泊
                ♨️ 天然温泉pH9.2・8名まで

                グループ利用に対応できる広さと温泉が魅力。Airbnb相場¥52,000/泊、オーナー利用¥35,000。年30泊で約¥51万お得です。\(timing == "now" ? "\n\n⚡ 現在稼働中。" : "")

                📩 詳細・相談はマイページからどうぞ。
                """
            } else {
                return """
                ✨ あなたへのおすすめ：NESTING

                📍 北海道 弟子屈町・美留和の森
                💰 ¥890万/口　年30泊
                🧖 タワーサウナ＋ジャグジー・6名まで

                VUILD設計のデジタルファブリケーション建築。少人数で贅沢に使うのに最適。Airbnb相場¥44,000/泊、オーナー利用¥38,000。\(timing == "now" ? "\n\n⚡ 現在稼働中。" : "")

                📩 詳細・相談はマイページからどうぞ。
                """
            }
        }

        if budget == "high" || budget == "premium" {
            if purpose == "invest" {
                return """
                ✨ 投資目的ならTAPKOP

                📍 北海道 弟子屈町・阿寒摩周国立公園
                💰 ¥8,000万/口　年30泊
                👨‍🍳 専任シェフ・9,000坪の完全プライベートリゾート

                PAN-PROJECTS設計の国内最高峰クラスのリゾート。1泊¥340,000相当の体験を年30泊。コミュニティのトップ層が集まる環境への参加権でもあります。

                📩 詳細は個別相談で。マイページからお問い合わせください。
                """
            }
            return """
            ✨ あなたへのおすすめ：TAPKOP

            📍 北海道 弟子屈町・阿寒摩周国立公園
            💰 ¥8,000万/口　年30泊
            👨‍🍳 専任シェフ・バレルバス・サウナ・9,000坪

            PAN-PROJECTS設計の完全プライベートリゾート。\(size == "large" ? "12名まで宿泊可能で大人数にも対応。" : "カップルから小グループまで、完全プライベートな空間。")1泊¥340,000相当の体験を年30泊できます。

            📩 詳細は個別相談で。マイページからお問い合わせください。
            """
        }

        // fallback
        return """
        📋 ご回答ありがとうございます！

        条件（\(quizSummary())）に合う物件をご案内します。物件一覧タブから各物件の詳細をご覧いただくか、下の入力欄で詳しく聞いてください。

        例：「THE LODGEについてもっと教えて」「熱海の物件の予約方法は？」
        """
    }

    // MARK: - Quiz Card

    private func quizCard(step: String, question: String,
                          choices: [(String, String, String)],
                          onSelect: @escaping (String) -> Void) -> some View {
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
                                .font(.system(size: 15))
                                .foregroundStyle(Color(hex: "c8a455"))
                                .frame(width: 22)
                            Text(label)
                                .font(.system(size: 14))
                                .foregroundStyle(.white)
                                .multilineTextAlignment(.leading)
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.system(size: 10))
                                .foregroundStyle(.gray.opacity(0.35))
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
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(hex: "c8a455").opacity(0.1), lineWidth: 1))
        .transition(.asymmetric(
            insertion: .move(edge: .trailing).combined(with: .opacity),
            removal: .move(edge: .leading).combined(with: .opacity)
        ))
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("さらに質問してください", text: $inputText, axis: .vertical)
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

    // MARK: - Typing Dots

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
        inputText = ""; focused = false
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

    // MARK: - Fallback

    private func fallback(for q: String) -> String {
        let lq = q.lowercased()
        if lq.contains("work party") || lq.contains("workparty") || lq.contains("建設") || lq.contains("参加したい") {
            return "Work Party 🔨\n\n次回：6/11〜13\n場所：北海道 弟子屈 OFF-GRID CABIN\n内容：電力系統・内装の建設作業\n参加費：無料（宿泊・食事付き）\n\n参加希望はコミュニティタブかinfo@solun.artまで。建築・電気・DIY経験者歓迎！"
        }
        if lq.contains("zamna") || lq.contains("フェス") || lq.contains("アーティスト") || lq.contains("チケット") {
            return "ZAMNA × SOLUNA FEST HAWAII 2026 🌺\n\n出演：WhoMadeWho・Mathame・Korolova\n会場：Oahu, Hawaii\n日程：2026年（調整中）\n\nチケット情報はメール登録で優先案内。コミュニティタブで話しましょう！"
        }
        if lq.contains("北海道") || lq.contains("lodge") || lq.contains("tapkop") || lq.contains("nesting") {
            return "北海道の物件：\n・THE LODGE ¥490万（天然温泉・30泊）\n・NESTING ¥890万（タワーサウナ・30泊）\n・TAPKOP ¥8,000万（専任シェフ・30泊）\n・インスタントハウス ¥120万（オフグリッド・30泊）\n\n詳しくは物件タブからどうぞ。"
        }
        if lq.contains("熱海") || lq.contains("atami") {
            return "WHITE HOUSE 熱海 🏖\n¥1,900万/口・年36泊\n東京から新幹線45分・相模湾一望\nAirbnb相場¥90,000に対しオーナー利用¥55,000。"
        }
        if lq.contains("ハワイ") || lq.contains("hawaii") || lq.contains("海") {
            return "ハワイ物件（2026年11月オープン予定）：\n・HONOLULU BEACH VILLA ¥2,800万（年30泊）\n・HAWAII KAI HOUSE ¥3,800万（年30泊）\n\nどちらもハワイカイエリアのビーチ近く。"
        }
        if lq.contains("投資") || lq.contains("roi") || lq.contains("利回り") || lq.contains("元") {
            return "例：THE LODGE（¥490万/口・年30泊）\nAirbnb相場¥52,000×30泊＝¥156万/年相当\n→ 約3.1年分の宿泊価値で永続利用権を取得\n\n詳細シミュレーションは物件詳細タブで確認できます。"
        }
        if lq.contains("予約") || lq.contains("泊") {
            return "予約は物件タブ → 物件詳細 → 予約タブから申込できます（ログイン必要）。クーポンをお持ちの場合はクーポン予約、まだの場合は宿泊申込フォームからどうぞ。"
        }
        return "物件・予約・投資・Work Party・ZAMNAについて何でも聞いてください。\n\n例：\n「THE LODGEの投資ROIは？」\n「ハワイの物件を予約するには？」\n「次のWork Partyはいつ？」"
    }
}
