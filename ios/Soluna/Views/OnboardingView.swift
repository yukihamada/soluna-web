import SwiftUI

private struct OnboardingItem: Identifiable {
    let id = UUID()
    let icon: String
    let tag: String
    let title: String
    let location: String
    let description: String
    let accentColor: Color
}

private let onboardingItems: [OnboardingItem] = [
    OnboardingItem(
        icon: "house.fill",
        tag: "ATAMI · SHIZUOKA",
        title: "ホワイトハウス熱海",
        location: "静岡県 熱海市",
        description: "太平洋を望む全白の邸宅。SOLUNA 最初の聖域、ここから旅が始まる。",
        accentColor: Color(hex: "e8e0d0")
    ),
    OnboardingItem(
        icon: "mountain.2.fill",
        tag: "WAKAYAMA",
        title: "和歌山の土地",
        location: "和歌山県",
        description: "紀伊半島の山懐に広がる豊かな原野。次の拠点候補として取得した秘境の土地。",
        accentColor: Color(hex: "6db88a")
    ),
    OnboardingItem(
        icon: "flame.fill",
        tag: "MIRUKAWA · HOKKAIDO",
        title: "美留和タワーサウナ",
        location: "北海道 弟子屈 美留和",
        description: "32,337坪の大地に建てる塔型サウナ。摩周湖を望む絶景と薪の香り。",
        accentColor: Color(hex: "e86a3a")
    ),
    OnboardingItem(
        icon: "leaf.fill",
        tag: "LODGE NESTING",
        title: "ロッジ ネスティング",
        location: "北海道 弟子屈 美留和",
        description: "森に巣くう木造ロッジ。オーナーが集い、焚き火を囲む季節の宿。",
        accentColor: Color(hex: "8b6c42")
    ),
    OnboardingItem(
        icon: "bolt.fill",
        tag: "OFF-GRID",
        title: "インスタントハウス",
        location: "北海道 弟子屈 美留和",
        description: "V2H × 太陽光の完全自立型コンテナ住宅。電気代ゼロ、接続ゼロ、自由100%。",
        accentColor: Color(hex: "c8a455")
    ),
    OnboardingItem(
        icon: "star.fill",
        tag: "TAPKOP",
        title: "TAPKOP",
        location: "北海道 弟子屈 美留和",
        description: "アイヌ語で「丸い丘」。大地の頂に建つ瞑想と創造の場。",
        accentColor: Color(hex: "9b8bc2")
    ),
    OnboardingItem(
        icon: "building.columns.fill",
        tag: "MASTER PLAN",
        title: "8棟の計画",
        location: "北海道 弟子屈 美留和グランド",
        description: "タワーサウナ、ロッジ、インスタントハウス……8棟が揃うとき、この土地は村になる。",
        accentColor: Color(hex: "c8a455")
    ),
    OnboardingItem(
        icon: "moon.stars.fill",
        tag: "KUMAUSHI · HOKKAIDO",
        title: "天空の道場",
        location: "北海道 標茶町 熊牛",
        description: "雲の上に浮かぶ武道道場。Work Party で共に建て、共に鍛える究極の聖地。",
        accentColor: Color(hex: "5bafd6")
    )
]

struct OnboardingView: View {
    @Binding var isPresented: Bool

    @State private var currentIndex = 0
    @State private var dragOffset: CGFloat = 0
    @State private var isAnimating = false

    var body: some View {
        ZStack {
            Color(hex: "050505").ignoresSafeArea()

            VStack(spacing: 0) {
                // Progress dots
                HStack(spacing: 6) {
                    ForEach(0..<onboardingItems.count, id: \.self) { i in
                        Capsule()
                            .fill(i == currentIndex ? Color(hex: "c8a455") : Color.white.opacity(0.2))
                            .frame(width: i == currentIndex ? 20 : 6, height: 6)
                            .animation(.spring(response: 0.35), value: currentIndex)
                    }
                }
                .padding(.top, 60)
                .padding(.bottom, 32)

                // Card
                TabView(selection: $currentIndex) {
                    ForEach(0..<onboardingItems.count, id: \.self) { i in
                        OnboardingCard(item: onboardingItems[i])
                            .tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.spring(response: 0.5, dampingFraction: 0.8), value: currentIndex)

                // Buttons
                VStack(spacing: 12) {
                    if currentIndex == onboardingItems.count - 1 {
                        Button {
                            withAnimation(.spring(response: 0.5)) {
                                UserDefaults.standard.set(true, forKey: "hasShownOnboarding")
                                isPresented = false
                            }
                        } label: {
                            Text("SOLUNA をはじめる")
                                .font(.system(size: 15, weight: .heavy))
                                .tracking(1)
                                .foregroundStyle(Color(hex: "050505"))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 17)
                                .background(Color(hex: "c8a455"))
                                .clipShape(Capsule())
                        }
                        .padding(.horizontal, 32)
                        .transition(.opacity.combined(with: .scale))
                    } else {
                        Button {
                            withAnimation(.spring(response: 0.45, dampingFraction: 0.8)) {
                                currentIndex += 1
                            }
                        } label: {
                            HStack(spacing: 8) {
                                Text("次へ")
                                    .font(.system(size: 15, weight: .bold))
                                Image(systemName: "arrow.right")
                                    .font(.system(size: 13, weight: .bold))
                            }
                            .foregroundStyle(Color(hex: "c8a455"))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 17)
                            .background(Color(hex: "c8a455").opacity(0.1))
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(Color(hex: "c8a455").opacity(0.3), lineWidth: 1))
                        }
                        .padding(.horizontal, 32)
                    }

                    Button {
                        UserDefaults.standard.set(true, forKey: "hasShownOnboarding")
                        isPresented = false
                    } label: {
                        Text("スキップ")
                            .font(.system(size: 12))
                            .foregroundStyle(.gray.opacity(0.5))
                    }
                }
                .padding(.bottom, 48)
            }
        }
    }
}

private struct OnboardingCard: View {
    let item: OnboardingItem
    @State private var appeared = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Icon circle
            ZStack {
                Circle()
                    .fill(item.accentColor.opacity(0.1))
                    .frame(width: 90, height: 90)
                Circle()
                    .fill(item.accentColor.opacity(0.06))
                    .frame(width: 120, height: 120)
                Image(systemName: item.icon)
                    .font(.system(size: 36))
                    .foregroundStyle(item.accentColor)
            }
            .padding(.bottom, 28)
            .opacity(appeared ? 1 : 0)
            .scaleEffect(appeared ? 1 : 0.7)
            .animation(.spring(response: 0.5, dampingFraction: 0.7).delay(0.05), value: appeared)

            Text(item.tag)
                .font(.system(size: 9, weight: .heavy))
                .tracking(3)
                .foregroundStyle(item.accentColor.opacity(0.8))
                .padding(.bottom, 10)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.4).delay(0.15), value: appeared)

            Text(item.title)
                .font(.system(size: 30, weight: .heavy))
                .tracking(-0.5)
                .foregroundStyle(.white)
                .padding(.bottom, 6)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 12)
                .animation(.spring(response: 0.5).delay(0.2), value: appeared)

            Text(item.location)
                .font(.system(size: 12))
                .foregroundStyle(item.accentColor.opacity(0.7))
                .padding(.bottom, 18)
                .opacity(appeared ? 1 : 0)
                .animation(.easeOut(duration: 0.4).delay(0.25), value: appeared)

            Text(item.description)
                .font(.system(size: 14))
                .foregroundStyle(.white.opacity(0.7))
                .lineSpacing(5)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : 8)
                .animation(.easeOut(duration: 0.5).delay(0.3), value: appeared)
        }
        .padding(.horizontal, 36)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading)
        .padding(.bottom, 32)
        .onAppear { appeared = true }
        .onDisappear { appeared = false }
    }
}
