import Foundation
import UserNotifications
import UIKit

/// Manages push notification registration and token upload to the SOLUNA server.
final class NotificationService: NSObject, ObservableObject {
    static let shared = NotificationService()

    @Published var isAuthorized = false
    private let baseURL = "https://solun.art"

    private override init() {
        super.init()
    }

    // MARK: - Permission

    /// Request notification permission and register for remote notifications.
    func requestAuthorization() {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound, .badge]) { [weak self] granted, error in
            DispatchQueue.main.async {
                self?.isAuthorized = granted
            }
            if let error {
                print("[NotificationService] authorization error: \(error)")
                return
            }
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }

    // MARK: - Token upload

    /// Convert raw device token data to hex string and POST to server.
    func registerToken(_ deviceToken: Data, propertyIds: [String] = []) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        print("[NotificationService] device token: \(token)")

        guard let url = URL(string: "\(baseURL)/api/v1/push/register") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "token": token,
            "platform": "ios",
            "property_ids": propertyIds,
        ]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error {
                print("[NotificationService] register failed: \(error)")
                return
            }
            if let http = response as? HTTPURLResponse {
                print("[NotificationService] register status: \(http.statusCode)")
            }
        }.resume()
    }
}
