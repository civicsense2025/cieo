import SwiftUI
import Cieo

public struct ReduceMotionAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reducemotion", category: "Foundations", name: "Reduced-motion simulator",
        summary: "Flip the switch and the same demo goes instant: the dot jumps, the label swaps with no blur.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pos = Track(0)
    @State private var text = "Uploading 3 files"
    @State private var on = false
    @State private var simulate = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Simulated reduce flips the demo to instant") {
            VStack(spacing: 16) {
                TimelineView(.animation(paused: true)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 10).fill(.quaternary)
                            Circle().fill(.primary).frame(width: 24, height: 24)
                                .offset(x: 8 + CGFloat(pos.value(at: t)) * max(1, g.size.width - 40))
                        }
                    }
                    .frame(height: 40)
                }
                SwapText(on ? "Shared with 4 people" : text)
                    .font(.body).frame(height: 28)
                Text(instant ? "motion: instant · no blur" : "motion: full spring + blur swap")
                    .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                Button("Run") { run() }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity, minHeight: 36)
                Toggle("Simulate reduced motion", isOn: $simulate)
                    .font(.caption).foregroundStyle(.secondary).tint(Color.accentColor)
            }
            .frame(maxWidth: 340)
        }
    }

    private var instant: Bool { reduce || simulate }

    private func run() {
        on.toggle()
        let t = Date().timeIntervalSinceReferenceDate
        if instant { pos.jump(on ? 1 : 0) } else { pos.set(on ? 1 : 0, at: t) }
    }
}
