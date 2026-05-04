import SwiftUI
import MapKit

struct MapTourView: View {
    @EnvironmentObject var store: PropertyStore
    @State private var position: MapCameraPosition = .region(
        MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: 37.5, longitude: 137.0),
            span: MKCoordinateSpan(latitudeDelta: 22, longitudeDelta: 22)
        )
    )
    @State private var selectedProperty: Property?
    @State private var showDetailSheet = false

    var body: some View {
        ZStack(alignment: .top) {
            Map(position: $position) {
                ForEach(store.properties) { property in
                    Annotation(property.name, coordinate: property.coordinate, anchor: .bottom) {
                        PropertyPin(status: property.status)
                            .onTapGesture {
                                selectedProperty = property
                            }
                    }
                }
            }
            .mapStyle(.imagery(elevation: .realistic))
            .mapControls { MapCompass() }

            // Badge
            Text("SOLUNA \u{2014} \u{5168}11\u{7269}\u{4ef6}")
                .font(.system(size: 9, weight: .heavy))
                .tracking(3)
                .foregroundStyle(Color("Gold"))
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
                .overlay(Capsule().stroke(Color("Gold").opacity(0.35), lineWidth: 1))
                .padding(.top, 12)

            // Mini card at bottom when pin tapped
            if let property = selectedProperty {
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
