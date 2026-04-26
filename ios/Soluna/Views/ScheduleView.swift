import SwiftUI

struct ScheduleView: View {
    @EnvironmentObject var store: PropertyStore

    var propertiesWithSchedule: [Property] {
        store.properties.filter { !$0.schedule.isEmpty }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 20) {
                    // Upcoming Work Parties highlight
                    if !store.upcomingWorkParties.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(spacing: 6) {
                                Image(systemName: "flame.fill")
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color(hex: "f59e0b"))
                                Text("UPCOMING WORK PARTIES")
                                    .font(.system(size: 9, weight: .heavy))
                                    .tracking(2)
                                    .foregroundStyle(Color(hex: "f59e0b"))
                            }

                            ForEach(store.upcomingWorkParties, id: \.item.id) { entry in
                                HStack(spacing: 12) {
                                    VStack(spacing: 2) {
                                        Circle()
                                            .fill(Color(hex: "f59e0b"))
                                            .frame(width: 10, height: 10)
                                    }
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(entry.property.name)
                                            .font(.system(size: 10, weight: .bold))
                                            .foregroundStyle(Color("Gold"))
                                        Text(entry.item.title)
                                            .font(.system(size: 13, weight: .heavy))
                                            .foregroundStyle(.white)
                                        Text("\(entry.item.date) \u{2014} \(entry.item.detail)")
                                            .font(.system(size: 11))
                                            .foregroundStyle(.gray)
                                    }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.system(size: 10))
                                        .foregroundStyle(.gray.opacity(0.3))
                                }
                                .padding(14)
                                .background(Color(hex: "f59e0b").opacity(0.06))
                                .clipShape(RoundedRectangle(cornerRadius: 10))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(Color(hex: "f59e0b").opacity(0.2), lineWidth: 1)
                                )
                            }
                        }
                        .padding(18)
                        .background(Color(hex: "0a0a0a"))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color(hex: "f59e0b").opacity(0.1), lineWidth: 1)
                        )
                    }

                    // All property schedules
                    ForEach(propertiesWithSchedule) { property in
                        VStack(alignment: .leading, spacing: 12) {
                            // Header
                            HStack(spacing: 8) {
                                Circle()
                                    .fill(property.status == .open ? Color(hex: "9bc46d") : Color(hex: "c8a455"))
                                    .frame(width: 6, height: 6)
                                Text(property.name)
                                    .font(.system(size: 14, weight: .heavy))
                                    .foregroundStyle(.white)
                                Spacer()
                                Text(property.status.label)
                                    .font(.system(size: 9, weight: .bold))
                                    .foregroundStyle(property.status == .open ? Color(hex: "9bc46d") : Color(hex: "c8a455"))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(
                                        Capsule()
                                            .fill((property.status == .open ? Color(hex: "9bc46d") : Color(hex: "c8a455")).opacity(0.1))
                                    )
                            }

                            // Timeline
                            ForEach(property.schedule) { item in
                                ScheduleRow(item: item)
                            }
                        }
                        .padding(18)
                        .background(Color(hex: "0a0a0a"))
                        .clipShape(RoundedRectangle(cornerRadius: 14))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14)
                                .stroke(Color.white.opacity(0.04), lineWidth: 1)
                        )
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 20)
            }
            .background(Color(hex: "050505"))
            .navigationTitle("スケジュール")
            .navigationBarTitleDisplayMode(.inline)
            .refreshable {
                // Pull-to-refresh: re-fetch schedules from API
                await store.fetchProperties()
            }
        }
    }
}
