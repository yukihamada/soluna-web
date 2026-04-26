import SwiftUI
import MapKit

struct MapTourView: View {
    @EnvironmentObject var store: PropertyStore
    @State private var position: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 38, longitude: 137),
            span: MKCoordinateSpan(latitudeDelta: 20, longitudeDelta: 20)
        )
    )
    @State private var tourStep = -1
    @State private var badgeText = "SOLUNA \u{2014} \u{5168}11\u{7269}\u{4ef6}"
    @State private var selectedProperty: Property?
    @State private var tourCompleted = false
    @State private var showDetailSheet = false

    private let tourStops: [(lat: Double, lng: Double, zoom: Double, badge: String, propertyId: String)] = [
        (35.097, 139.072, 0.02, "ATAMI \u{2014} \u{9759}\u{5ca1}\u{770c} \u{71b1}\u{6d77}\u{5e02}", "whitehouse-atami"),
        (35.115, 139.052, 0.01, "ATAMI 2 \u{2014} \u{958b}\u{767a}\u{4e88}\u{5b9a}\u{5730}", "atami-2"),
        (33.720, 135.360, 0.05, "WAKAYAMA \u{2014} \u{548c}\u{6b4c}\u{5c71}\u{770c} \u{718a}\u{91ce}\u{53e4}\u{9053}", "wakayama"),
        (43.590, 144.440, 0.15, "HOKKAIDO \u{2014} \u{5317}\u{6d77}\u{9053} \u{5f1f}\u{5b50}\u{5c48}", "tapkop")
    ]

    var body: some View {
        ZStack(alignment: .top) {
            Map(position: $position) {
                ForEach(store.properties) { property in
                    Annotation(property.name, coordinate: property.coordinate, anchor: .bottom) {
                        PropertyPin(status: property.status)
                            .onTapGesture {
                                selectedProperty = property
                                if tourCompleted {
                                    // After tour: show mini card, not sheet
                                } else {
                                    showDetailSheet = true
                                }
                            }
                    }
                }
            }
            .mapStyle(.imagery(elevation: .realistic))
            .mapControls { MapCompass() }

            // Badge
            Text(badgeText)
                .font(.system(size: 9, weight: .heavy))
                .tracking(3)
                .foregroundStyle(Color("Gold"))
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(Color("Gold").opacity(0.35), lineWidth: 1))
                .padding(.top, 12)

            // Mini card overlay at bottom (after tour)
            if tourCompleted, let property = selectedProperty {
                VStack {
                    Spacer()
                    MiniPropertyCard(property: property) {
                        showDetailSheet = true
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.spring(response: 0.4, dampingFraction: 0.85), value: selectedProperty?.id)
            }
        }
        .sheet(isPresented: $showDetailSheet) {
            if let property = selectedProperty {
                PropertyDetailView(property: property)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
        }
        .onAppear { startTour() }
    }

    private func startTour() {
        guard tourStep == -1 else { return }
        Task {
            try? await Task.sleep(for: .seconds(1.5))
            for (i, stop) in tourStops.enumerated() {
                tourStep = i
                badgeText = stop.badge
                withAnimation(.easeInOut(duration: 2.0)) {
                    position = .region(MKCoordinateRegion(
                        center: CLLocationCoordinate2D(latitude: stop.lat, longitude: stop.lng),
                        span: MKCoordinateSpan(latitudeDelta: stop.zoom, longitudeDelta: stop.zoom)
                    ))
                }
                // Show popup during tour
                if let prop = store.properties.first(where: { $0.id == stop.propertyId }) {
                    try? await Task.sleep(for: .seconds(2.5))
                    selectedProperty = prop
                    showDetailSheet = true
                    try? await Task.sleep(for: .seconds(2.5))
                    showDetailSheet = false
                    selectedProperty = nil
                }
            }
            badgeText = "SOLUNA \u{2014} \u{5168}11\u{7269}\u{4ef6}"
            withAnimation {
                tourCompleted = true
            }
        }
    }
}

struct MiniPropertyCard: View {
    let property: Property
    let onDetailTap: () -> Void

    var statusColor: Color {
        switch property.status {
        case .open: return Color(hex: "9bc46d")
        case .coming: return Color(hex: "c8a455")
        case .plan: return .gray
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "mappin.circle.fill")
                    .foregroundStyle(Color("Gold"))
                    .font(.system(size: 14))
                Text(property.name)
                    .font(.system(size: 14, weight: .heavy))
                    .foregroundStyle(.white)
                Spacer()
                HStack(spacing: 4) {
                    Circle().fill(statusColor).frame(width: 6, height: 6)
                    Text(property.status.label)
                        .font(.system(size: 10, weight: .bold))
                        .foregroundStyle(statusColor)
                }
            }

            HStack {
                Text(property.location)
                    .font(.system(size: 11))
                    .foregroundStyle(.gray)
                if let price = property.price {
                    Text("/")
                        .foregroundStyle(.gray.opacity(0.3))
                        .font(.system(size: 10))
                    Text(price)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(Color("Gold"))
                }
                Spacer()
            }

            Button(action: onDetailTap) {
                HStack(spacing: 4) {
                    Text("詳細を見る")
                        .font(.system(size: 12, weight: .bold))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 10, weight: .bold))
                }
                .foregroundStyle(Color("Gold"))
            }
        }
        .padding(16)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.3), radius: 10, y: 5)
    }
}

struct PropertyPin: View {
    let status: PropertyStatus

    var color: Color {
        switch status {
        case .open: return Color(hex: "9bc46d")
        case .coming: return Color(hex: "c8a455")
        case .plan: return Color(hex: "3a3a3a")
        }
    }

    var body: some View {
        ZStack {
            Circle()
                .fill(color)
                .frame(width: 28, height: 28)
                .shadow(color: .black.opacity(0.5), radius: 6, y: 3)
            Circle()
                .fill(Color(hex: "050505"))
                .frame(width: 8, height: 8)
        }
    }
}
