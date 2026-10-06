import SwiftUI
import Cieo

public struct DateSignAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "datesign", category: "Documents", name: "Date signed",
        summary: "The calendar disc glides to the picked day while the date swaps in below. The pick holds a signed-and-dated terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var day = 2
    private let days = ["Mon 6", "Tue 7", "Wed 8", "Thu 9", "Fri 10"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a day — the disc glides over") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Date signed").font(.headline)
                    HStack(spacing: 4) {
                        ForEach(0..<days.count, id: \.self) { i in
                            Button(days[i]) { withMotion(.base, reduceMotion: reduce) { day = i } }
                                .frame(width: 36, height: 36).font(.caption)
                                .fontWeight(i == day ? .bold : .regular)
                                .foregroundStyle(i == day ? Color.accentColor : .primary)
                                .background(i == day ? Color.accentColor.opacity(0.18) : .clear, in: Circle())
                                .overlay(i == day ? Circle().stroke(Color.accentColor, lineWidth: 2) : nil)
                        }
                    }
                    ZStack(alignment: .leading) {
                        Text("October \(days[day].suffix(2)), 2026").id(day).motionTransition(.swap())
                    }
                    .font(.headline).frame(maxWidth: .infinity, minHeight: 28, alignment: .leading)
                    ZStack(alignment: .leading) {
                        Text("Signed October \(days[day].suffix(2)) ✓").foregroundStyle(.green).id(day).motionTransition(.swap())
                    }
                    .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                }
                .padding(16).frame(maxWidth: 340)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("Include time of signing", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
