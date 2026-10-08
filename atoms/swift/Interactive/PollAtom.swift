import SwiftUI
import Cieo

public struct PollAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "poll", category: "Interactive", name: "Poll",
        summary: "Each option morphs in place into its result bar. Fills stagger, percentages count up and the chosen row keeps a check.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let options: [(String, Double)] = [("Booking calendar", 38), ("Course player", 27), ("Job board", 21), ("Map directory", 14)]
    @State private var fill = Array(repeating: Track(0, preset: .base), count: 4)
    @State private var label = Array(repeating: Track(0, preset: .base), count: 4)
    @State private var check = Array(repeating: Track(0, preset: .base), count: 4)
    @State private var voted = -1
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick an option") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Which block should ship next?").fontWeight(.semibold).padding(.bottom, 4)
                TimelineView(.motion(fill, label, check)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 8) { ForEach(options.indices, id: \.self) { row($0, t) } }
                }
                Button("Reset", action: reset).buttonStyle(.bordered).padding(.top, 6)
            }
            .frame(maxWidth: 340)
        }
    }

    private func row(_ i: Int, _ t: Double) -> some View {
        let v = fill[i].value(at: t), c = max(0, min(1, check[i].value(at: t)))
        return Button { vote(i) } label: {
            HStack {
                Image(systemName: "checkmark").font(.caption.weight(.bold)).frame(width: 14 * c).opacity(c).clipped()
                Text(options[i].0)
                Spacer()
                Text("\(Int(v.rounded()))%").font(.caption).monospacedDigit().opacity(max(0, min(1, label[i].value(at: t))))
            }
            .padding(.horizontal, 12).padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .background(alignment: .leading) {
                GeometryReader { g in Rectangle().fill(.quaternary).frame(width: g.size.width * max(0, min(1, v / 100))) }
            }
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .overlay(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.12 + 0.88 * c)).opacity(0.10).allowsHitTesting(false))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(voted >= 0)
        .accessibilityValue(voted >= 0 ? "\(Int(v.rounded())) percent" : "")
    }

    private func vote(_ i: Int) {
        guard voted < 0 else { return }
        voted = i
        for j in options.indices {
            let d = Double(j) * 0.05
            DataMotion.retarget(&fill[j], to: options[j].1 + (j == i ? 1 : 0), delay: d, reduce: reduce)
            DataMotion.retarget(&label[j], to: 1, delay: Motion.exit + d, reduce: reduce)
            DataMotion.retarget(&check[j], to: j == i ? 1 : 0, reduce: reduce)
        }
    }

    private func reset() {
        voted = -1
        for j in options.indices {
            DataMotion.retarget(&fill[j], to: 0, reduce: reduce)
            DataMotion.retarget(&label[j], to: 0, preset: .snap, reduce: reduce)
            DataMotion.retarget(&check[j], to: 0, reduce: reduce)
        }
    }
}
