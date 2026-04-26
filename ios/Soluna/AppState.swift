import Foundation
import Combine

/// Global app state for deep-link routing and cross-view coordination.
@MainActor
class AppState: ObservableObject {
    static let shared = AppState()

    /// Set when `soluna://purchase/success?purchase_id=xxx` fires.
    @Published var pendingPurchaseSuccessId: String?

    /// Set when we want to scroll to / show work-party tab from a card tap.
    @Published var showWorkPartyTab = false

    /// Set when `soluna://login?token=XXX` fires — triggers member auto-login.
    @Published var pendingMemberActivationToken: String?

    private init() {}

    func handleURL(_ url: URL) {
        guard url.scheme == "soluna" else { return }
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        switch url.host {
        case "login":
            if let token = components?.queryItems?.first(where: { $0.name == "token" })?.value {
                pendingMemberActivationToken = token
            }
        case "purchase":
            if url.pathComponents.contains("success"),
               let purchaseId = components?.queryItems?.first(where: { $0.name == "purchase_id" })?.value {
                pendingPurchaseSuccessId = purchaseId
            }
        default:
            break
        }
    }
}
