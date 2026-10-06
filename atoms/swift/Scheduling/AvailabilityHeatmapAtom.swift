import SwiftUI
import Cieo

public struct AvailabilityHeatmapAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "heatmap", category: "Scheduling", name: "Availability heatmap",
        summary: "Cells rest in soft green-amber tints by free count. Tapping a cell swaps in its count; a booking ring holds on the chosen cell.")

    private let days = ["M", "T", "W", "T", "F"]
    private let team = [3, 1, 2, 0, 2, 1, 3, 3, 1, 0, 2, 2, 1, 3, 1, 0, 1, 2, 2, 3]
    private let mine = [1, 0, 1, 2, 0, 2, 1, 0, 1, 2, 0, 2, 2, 0, 1, 1, 0, 1, 1, 2]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var useMine = false
    @State private var pick: Int?
    @State private var cells: [Track] = (0..<20).map { _ in Track(0) }
    @State private var ready = false
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private func tint(_ v: Double) -> Color { Color(hue: 0.33 - 0.22 * v, saturation: 0.35, brightness: 0.92) }

    public var body: some View {
        AtomStage(hint: "Tap a cell for the free count") {
            TimelineView(.motion(cells)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate
                VStack(spacing: 10) {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 5), spacing: 6) {
                        ForEach(days.indices, id: \.self) { d in
                            Text(days[d]).font(.system(size: 12)).foregroundStyle(.secondary)
                        }
                        ForEach(0..<20, id: \.self) { i in
                            let set = useMine ? mine : team
                            ZStack {
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(tint(cells[i].value(at: t)))
                                    .overlay(RoundedRectangle(cornerRadius: 8)
                                        .strokeBorder(pick == i ? Color.primary : Color.secondary.opacity(0.25)))
                                if pick == i {
                                    Text("\(set[i])").font(.system(size: 12, weight: .semibold)).monospacedDigit()
                                } else {
                                    Circle().fill(.secondary.opacity(0.4)).frame(width: 6, height: 6)
                                }
                            }
                            .frame(height: 32)
                            .onTapGesture { pick = (pick == i) ? nil : i }
                            .accessibilityLabel("\(set[i]) free")
                        }
                    }
                    HStack {
                        Button("Team") { flip(false) }.font(.system(size: 12))
                            .padding(.horizontal, 12).frame(minHeight: 32)
                            .background(.background, in: RoundedRectangle(cornerRadius: 8))
                            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(!useMine ? Color.primary : Color.secondary.opacity(0.25)))
                        Button("Mine") { flip(true) }.font(.system(size: 12))
                            .padding(.horizontal, 12).frame(minHeight: 32)
                            .background(.background, in: RoundedRectangle(cornerRadius: 8))
                            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(useMine ? Color.primary : Color.secondary.opacity(0.25)))
                    }
                    .foregroundStyle(.secondary)
                }
                .frame(width: 300)
            }
        }
        .onAppear { if !ready { ready = true; paint(instant: true) } }
    }

    private func flip(_ m: Bool) {
        useMine = m; pick = nil; paint()
    }

    private func paint(instant: Bool = false) {
        let set = useMine ? mine : team, t = now()
        for i in set.indices {
            if instant || reduce { cells[i].jump(Double(set[i]) / 3) }
            else { cells[i].set(Double(set[i]) / 3, at: t) }
        }
    }
}
