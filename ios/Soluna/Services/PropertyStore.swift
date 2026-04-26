import Foundation
import Combine

@MainActor
class PropertyStore: ObservableObject {
    @Published var properties: [Property] = []
    @Published var selectedProperty: Property?
    @Published var searchText = ""
    @Published var isLoading = false

    static let baseURL = "https://solun.art"
    static let cdnURL = "https://soluna-teshikaga.fly.dev"

    private static let cacheKey = "cached_properties_json"

    var filteredProperties: [Property] {
        let list = searchText.isEmpty ? properties : properties.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.location.localizedCaseInsensitiveContains(searchText)
        }
        return list
    }

    var openProperties: [Property] { properties.filter { $0.status == .open } }
    var comingProperties: [Property] { properties.filter { $0.status == .coming } }
    var planProperties: [Property] { properties.filter { $0.status == .plan } }

    /// Upcoming Work Party events across all properties
    var upcomingWorkParties: [(property: Property, item: ScheduleItem)] {
        properties.flatMap { property in
            property.schedule
                .filter { $0.isHighlight && !$0.isDone }
                .map { (property: property, item: $0) }
        }
    }

    func fetchProperties() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let url = URL(string: "\(Self.baseURL)/api/v1/properties")!
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode([Property].self, from: data)
            properties = decoded
            // Cache on success
            UserDefaults.standard.set(data, forKey: Self.cacheKey)
        } catch {
            print("API fetch failed: \(error)")
            // Try offline cache
            if let cached = UserDefaults.standard.data(forKey: Self.cacheKey),
               let decoded = try? JSONDecoder().decode([Property].self, from: cached) {
                print("Loaded from offline cache")
                properties = decoded
            } else {
                print("Using built-in fallback")
                properties = Property.allProperties
            }
        }
    }

    /// Fetch schedule for a specific property from API, falling back to local data
    func fetchSchedule(propertyId: String) async -> [ScheduleItem] {
        do {
            let url = URL(string: "\(Self.baseURL)/api/v1/properties/\(propertyId)")!
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode(Property.self, from: data)
            // Update local property schedule
            if let idx = properties.firstIndex(where: { $0.id == propertyId }) {
                properties[idx] = decoded
            }
            return decoded.schedule
        } catch {
            // Fallback to local data
            return properties.first(where: { $0.id == propertyId })?.schedule ?? []
        }
    }
}
