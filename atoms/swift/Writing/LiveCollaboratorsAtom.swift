import SwiftUI
import MotionKit

public struct LiveCollaboratorsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "presence", category: "Writing", name: "Live collaborators",
        summary: "Remote cursors glide word to word with name flags, and each person’s avatar joins the stack with a ring in their color. Positions are scheduled on the clock, so the scene replays identically.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Person { let name: String; let color: Color; let delay: Double; let seq: [Int] }
    private let people = [Person(name: "Maya", color: .accentColor, delay: 0, seq: [3, 9, 14, 20, 26]), Person(name: "Theo", color: .orange, delay: 1.6, seq: [24, 11, 17, 2, 22])]
    private let words = "Ship the pricing page on Tuesday, then the members area on Thursday. Maya owns copy and Theo owns the checkout flow. We review together Friday morning.".split(separator: " ").map(String.init)
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var xs = [Track(0, preset: .base), Track(0, preset: .base)]
    @State private var ys = [Track(0, preset: .base), Track(0, preset: .base)]
    @State private var shown = [Track(0, preset: .base), Track(0, preset: .base)]
    @State private var steps = [-1, -1]
    @State private var joined = [0.0, 0.0]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Two collaborators edit on a fixed schedule") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Launch plan").font(.caption.weight(.semibold))
                    Spacer()
                    TimelineView(.animation) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        HStack(spacing: -6) { ForEach(people.indices, id: \.self) { avatar($0, t) } }
                    }
                }
                ZStack(alignment: .topLeading) {
                    WritingWords(words: words, space: "doc", font: .caption).frame(maxWidth: .infinity, alignment: .leading)
                    TimelineView(.animation) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        ZStack(alignment: .topLeading) { ForEach(people.indices, id: \.self) { cursor($0, t) } }
                    }
                    .allowsHitTesting(false)
                }
                .coordinateSpace(name: "doc").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .accessibilityLabel(words.joined(separator: " "))
            }
            .padding(16).frame(maxWidth: 380).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
        .task { await schedule() }
    }

    private func cursor(_ i: Int, _ t: Double) -> some View {
        let p = max(0, min(1, shown[i].value(at: t)))
        return VStack(alignment: .leading, spacing: 0) {
            Text(people[i].name).font(.system(size: 10.5, weight: .semibold)).foregroundStyle(.white).padding(.horizontal, 5).padding(.vertical, 1)
                .background(people[i].color, in: UnevenRoundedRectangle(topLeadingRadius: 4, bottomLeadingRadius: 0, bottomTrailingRadius: 4, topTrailingRadius: 4))
            Rectangle().fill(people[i].color).frame(width: 2, height: 18)
        }
        .offset(x: xs[i].value(at: t), y: ys[i].value(at: t) - 16).opacity(p)
        .accessibilityHidden(true)
    }

    private func avatar(_ i: Int, _ t: Double) -> some View {
        let p = max(0, min(1, shown[i].value(at: t))), ring = max(0, 1 - (t - joined[i]) / 0.9) * (joined[i] > 0 ? 1 : 0)
        return Text(String(people[i].name.prefix(1))).font(.system(size: 11, weight: .semibold)).foregroundStyle(.white)
            .frame(width: 26, height: 26).background(people[i].color, in: Circle())
            .background(Circle().fill(people[i].color.opacity(ring * 0.6)).frame(width: 26 + 8 * ring, height: 26 + 8 * ring))
            .opacity(p).scaleEffect(0.6 + 0.4 * p).accessibilityLabel("\(people[i].name) is editing")
    }

    /// Cursor positions are scheduled on the clock: step k lands at delay + 1.3·k.
    private func schedule() async {
        let start = DataMotion.now
        while !Task.isCancelled {
            for (i, person) in people.enumerated() {
                let k = Int(((DataMotion.now - start) - person.delay) / 1.3)
                guard k >= 0, k != steps[i], let f = frames[person.seq[k % person.seq.count] % words.count] else { continue }
                let first = steps[i] < 0
                steps[i] = k
                let x = f.maxX, y = f.minY + 2
                if first || reduce { xs[i].jump(x); ys[i].jump(y) } else { DataMotion.retarget(&xs[i], to: x, reduce: false); DataMotion.retarget(&ys[i], to: y, reduce: false) }
                if first { DataMotion.retarget(&shown[i], to: 1, reduce: reduce); joined[i] = DataMotion.now }
            }
            try? await Task.sleep(for: .milliseconds(50))
        }
    }
}
