import SwiftUI

struct PropertyListView: View {
    @EnvironmentObject var store: PropertyStore
    @Environment(\.horizontalSizeClass) private var sizeClass
    @State private var selectedProperty: Property?

    var body: some View {
        if sizeClass == .regular {
            // iPad: 2-column split view
            NavigationSplitView {
                propertyList
                    .navigationTitle("物件一覧")
                    .navigationBarTitleDisplayMode(.inline)
                    .searchable(text: $store.searchText, prompt: "物件を検索")
            } detail: {
                if let property = selectedProperty {
                    PropertyDetailView(property: property)
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "building.2")
                            .font(.system(size: 40))
                            .foregroundStyle(.gray.opacity(0.3))
                        Text("物件を選択してください")
                            .font(.system(size: 14))
                            .foregroundStyle(.gray)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color(hex: "050505"))
                }
            }
            .tint(Color("Gold"))
        } else {
            // iPhone: existing stack layout
            NavigationStack {
                propertyList
                    .navigationTitle("物件一覧")
                    .navigationBarTitleDisplayMode(.inline)
                    .searchable(text: $store.searchText, prompt: "物件を検索")
                    .sheet(item: $selectedProperty) { property in
                        PropertyDetailView(property: property)
                            .presentationDetents([.large])
                            .presentationDragIndicator(.visible)
                    }
            }
        }
    }

    private var propertyList: some View {
        ScrollView {
            LazyVStack(spacing: 2) {
                // ZAMNA banner
                zamnaBanner

                // Open
                if !store.openProperties.isEmpty {
                    SectionHeader(title: "稼働中", color: Color(hex: "9bc46d"))
                    ForEach(store.openProperties) { property in
                        PropertyCard(property: property, isSelected: selectedProperty?.id == property.id && sizeClass == .regular)
                            .onTapGesture { selectedProperty = property }
                    }
                }
                // Coming
                if !store.comingProperties.isEmpty {
                    SectionHeader(title: "建設中", color: Color(hex: "c8a455"))
                    ForEach(store.comingProperties) { property in
                        PropertyCard(property: property, isSelected: selectedProperty?.id == property.id && sizeClass == .regular)
                            .onTapGesture { selectedProperty = property }
                    }
                }
                // Plan
                if !store.planProperties.isEmpty {
                    SectionHeader(title: "計画中", color: .gray)
                    ForEach(store.planProperties) { property in
                        PropertyCard(property: property, isSelected: selectedProperty?.id == property.id && sizeClass == .regular)
                            .onTapGesture { selectedProperty = property }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 40)
        }
        .background(Color(hex: "050505"))
    }

    private var zamnaBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "music.note.house.fill")
                .font(.system(size: 18))
                .foregroundStyle(Color(hex: "c8a455"))
            VStack(alignment: .leading, spacing: 2) {
                Text("ZAMNA × SOLUNA FEST HAWAII 2026")
                    .font(.system(size: 10, weight: .heavy))
                    .tracking(0.5)
                    .foregroundStyle(Color(hex: "c8a455"))
                Text("WhoMadeWho · Mathame · Korolova · 日程調整中")
                    .font(.system(size: 10))
                    .foregroundStyle(.white.opacity(0.45))
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 10))
                .foregroundStyle(Color(hex: "c8a455").opacity(0.4))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color(hex: "0d0b08"))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color(hex: "c8a455").opacity(0.15), lineWidth: 1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .padding(.top, 12)
        .onTapGesture {
            if let url = URL(string: "https://solun.art/zamna") {
                UIApplication.shared.open(url)
            }
        }
    }
}

struct SectionHeader: View {
    let title: String
    let color: Color

    var body: some View {
        HStack {
            Circle().fill(color).frame(width: 6, height: 6)
            Text(title)
                .font(.system(size: 9, weight: .heavy))
                .tracking(2)
                .foregroundStyle(color)
            Spacer()
        }
        .padding(.top, 24)
        .padding(.bottom, 8)
    }
}

struct PropertyCard: View {
    let property: Property
    var isSelected: Bool = false

    var statusColor: Color {
        switch property.status {
        case .open: return Color(hex: "9bc46d")
        case .coming: return Color(hex: "c8a455")
        case .plan: return .gray
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            // Thumbnail
            if let img = property.imageURL {
                CachedAsyncImage(url: URL(string: "\(PropertyStore.cdnURL)/img/\(img).webp")) {
                    Rectangle().fill(Color(hex: "0a0a0a"))
                }
                .frame(width: 72, height: 72)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            } else {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(hex: "0a0a0a"))
                    .frame(width: 72, height: 72)
                    .overlay(
                        Image(systemName: "building.2")
                            .foregroundStyle(.gray.opacity(0.3))
                    )
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(property.name)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.white)
                Text(property.location)
                    .font(.system(size: 10))
                    .foregroundStyle(.gray)
                HStack(spacing: 4) {
                    Circle().fill(statusColor).frame(width: 5, height: 5)
                    Text(property.status.label)
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(statusColor)
                    if let price = property.price {
                        Text("\u{00b7}")
                            .foregroundStyle(.gray.opacity(0.3))
                        Text(price)
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(Color("Gold"))
                    }
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 10))
                .foregroundStyle(.gray.opacity(0.3))
        }
        .padding(14)
        .background(isSelected ? Color("Gold").opacity(0.08) : Color(hex: "0a0a0a"))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isSelected ? Color("Gold").opacity(0.3) : Color.white.opacity(0.04), lineWidth: 1)
        )
    }
}
