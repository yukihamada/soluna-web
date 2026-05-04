import Foundation

struct AuthUser: Codable {
    let id: String
    let role: String?
}

struct LoginRequest: Codable {
    let id: String
    let password: String
}

struct MagicLinkRequest: Codable {
    let email: String
}

struct MagicLinkVerifyRequest: Codable {
    let token: String
}

@MainActor
class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var isLoggedIn = false
    @Published var currentUser: AuthUser?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var nahAccess: Int = 0
    @Published var memberType: String = "member"

    var isOwner: Bool { nahAccess == 1 || memberType == "admin" }

    private let baseURL = "https://solun.art"
    private let isLoggedInKey = "soluna_is_logged_in"
    private let memberTokenKey = "soluna_member_token"
    private let memberEmailKey = "soluna_member_email"

    var memberToken: String? {
        get { UserDefaults.standard.string(forKey: memberTokenKey) }
        set { UserDefaults.standard.set(newValue, forKey: memberTokenKey) }
    }
    var isMember: Bool { memberToken != nil }

    private init() {
        // Restore member session if available
        if let email = UserDefaults.standard.string(forKey: memberEmailKey),
           UserDefaults.standard.string(forKey: memberTokenKey) != nil {
            isLoggedIn = true
            currentUser = AuthUser(id: email, role: "member")
        } else {
            isLoggedIn = UserDefaults.standard.bool(forKey: isLoggedInKey)
        }
    }

    // MARK: - Login with ID/Password

    func login(id: String, password: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/cabin/auth/login") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = LoginRequest(id: id, password: password)
        request.httpBody = try? JSONEncoder().encode(body)

        do {
            let (data, response) = try await URLSession.shared.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                errorMessage = "サーバーに接続できません"
                return
            }

            if httpResponse.statusCode == 200 {
                // Session cookie is automatically stored by HTTPCookieStorage
                saveCookies(from: httpResponse, url: url)
                isLoggedIn = true
                UserDefaults.standard.set(true, forKey: isLoggedInKey)
                await fetchMe()
            } else {
                let message = String(data: data, encoding: .utf8) ?? ""
                errorMessage = "ログインに失敗しました: \(message)"
            }
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }

    // MARK: - Member Login (email-based, for buyers)

    /// Verify an activation token (from email deep link) and create a 30-day member session.
    func loginWithActivationToken(_ token: String) async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/cabin/member/verify-token") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONEncoder().encode(["token": token])

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let sessionToken = json["token"] as? String,
                  let email = json["email"] as? String else {
                if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let err = json["error"] as? String {
                    errorMessage = err
                } else {
                    errorMessage = "認証に失敗しました"
                }
                return
            }
            memberToken = sessionToken
            UserDefaults.standard.set(email, forKey: memberEmailKey)
            isLoggedIn = true
            currentUser = AuthUser(id: email, role: "member")
            UserDefaults.standard.set(true, forKey: isLoggedInKey)
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
        }
    }

    /// Send a member activation link to the given email (must have a paid purchase).
    func sendMemberLink(email: String) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/soluna/otp") else { return false }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["email": email])

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            if status == 200 { return true }
            let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
            errorMessage = msg ?? "送信に失敗しました (status \(status))"
            return false
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
            return false
        }
    }

    func verifyOTP(email: String, code: String) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/soluna/verify") else { return false }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["email": email, "code": code])

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            let status = (response as? HTTPURLResponse)?.statusCode ?? 0
            if status == 200,
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let token = json["token"] as? String {
                memberToken = token
                UserDefaults.standard.set(email, forKey: memberEmailKey)
                UserDefaults.standard.set(true, forKey: isLoggedInKey)
                isLoggedIn = true
                currentUser = AuthUser(id: email, role: "member")
                return true
            }
            let msg = (try? JSONSerialization.jsonObject(with: data) as? [String: Any])?["error"] as? String
            errorMessage = msg ?? "コードが違います"
            return false
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
            return false
        }
    }

    // MARK: - Magic Link

    func sendMagicLink(email: String) async -> Bool {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        guard let url = URL(string: "\(baseURL)/api/cabin/magic-link/send") else { return false }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = MagicLinkRequest(email: email)
        request.httpBody = try? JSONEncoder().encode(body)

        do {
            let (_, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse else { return false }
            if httpResponse.statusCode == 200 {
                return true
            } else {
                errorMessage = "メール送信に失敗しました"
                return false
            }
        } catch {
            errorMessage = "通信エラー: \(error.localizedDescription)"
            return false
        }
    }

    // MARK: - Check Auth Status

    func fetchMe() async {
        // Member sessions are stored locally — no server verification needed
        if isMember, let email = UserDefaults.standard.string(forKey: memberEmailKey) {
            currentUser = AuthUser(id: email, role: "member")
            isLoggedIn = true
            return
        }

        guard let url = URL(string: "\(baseURL)/api/cabin/auth/me") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        attachCookies(to: &request, url: url)

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                logout()
                return
            }
            let user = try JSONDecoder().decode(AuthUser.self, from: data)
            currentUser = user
            isLoggedIn = true
            UserDefaults.standard.set(true, forKey: isLoggedInKey)
        } catch {
            logout()
        }
    }

    func fetchSolunaMe() async {
        guard let token = memberToken,
              let url = URL(string: "\(baseURL)/api/soluna/me") else { return }
        var req = URLRequest(url: url)
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let member = json["member"] as? [String: Any] else { return }
        nahAccess = (member["nah_access"] as? Int) ?? 0
        memberType = (member["member_type"] as? String) ?? "member"
    }

    // MARK: - Logout

    func logout() {
        isLoggedIn = false
        currentUser = nil
        UserDefaults.standard.set(false, forKey: isLoggedInKey)
        memberToken = nil
        UserDefaults.standard.removeObject(forKey: memberEmailKey)

        // Clear cookies for solun.art
        if let url = URL(string: baseURL),
           let cookies = HTTPCookieStorage.shared.cookies(for: url) {
            for cookie in cookies {
                HTTPCookieStorage.shared.deleteCookie(cookie)
            }
        }
    }

    // MARK: - Cookie Helpers

    private func saveCookies(from response: HTTPURLResponse, url: URL) {
        guard let headerFields = response.allHeaderFields as? [String: String] else { return }
        let cookies = HTTPCookie.cookies(withResponseHeaderFields: headerFields, for: url)
        for cookie in cookies {
            HTTPCookieStorage.shared.setCookie(cookie)
        }
    }

    private func attachCookies(to request: inout URLRequest, url: URL) {
        if let cookies = HTTPCookieStorage.shared.cookies(for: url) {
            let headers = HTTPCookie.requestHeaderFields(with: cookies)
            for (key, value) in headers {
                request.setValue(value, forHTTPHeaderField: key)
            }
        }
    }

    // MARK: - Authenticated Request Helper

    func authenticatedRequest(url: URL, method: String = "GET", body: Data? = nil) async throws -> (Data, HTTPURLResponse) {
        var request = URLRequest(url: url)
        request.httpMethod = method
        if let body = body {
            request.httpBody = body
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }
        attachCookies(to: &request, url: url)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        return (data, httpResponse)
    }
}
