import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @State private var showOnboarding = !UserDefaults.standard.bool(forKey: "hasShownOnboarding")
    @EnvironmentObject private var appState: AppState
    @StateObject private var authService = AuthService.shared

    var body: some View {
        ZStack {
            TabView(selection: $selectedTab) {
                PropertyListView()
                    .tabItem {
                        Image(systemName: "building.2.fill")
                        Text("物件")
                    }
                    .tag(0)

                AIChatView()
                    .tabItem {
                        Image(systemName: "sparkles")
                        Text("AI")
                    }
                    .tag(1)

                CommunityView()
                    .tabItem {
                        Image(systemName: "bubble.left.and.bubble.right.fill")
                        Text("コミュニティ")
                    }
                    .tag(2)

                OwnerView()
                    .tabItem {
                        Image(systemName: "person.fill")
                        Text("マイページ")
                    }
                    .tag(3)

                MapTourView()
                    .tabItem {
                        Image(systemName: "map.fill")
                        Text("マップ")
                    }
                    .tag(4)
            }
            .tint(Color("Gold"))

            if showOnboarding {
                OnboardingView(isPresented: $showOnboarding)
                    .transition(.opacity)
                    .zIndex(10)
            }
        }
        .animation(.easeInOut(duration: 0.4), value: showOnboarding)
        .onChange(of: appState.pendingMemberActivationToken) { _, token in
            guard let token else { return }
            appState.pendingMemberActivationToken = nil
            selectedTab = 3 // Switch to owner tab
            Task { await authService.loginWithActivationToken(token) }
        }
    }
}
