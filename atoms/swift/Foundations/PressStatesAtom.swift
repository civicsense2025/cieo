import SwiftUI
import Cieo

public struct PressStatesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pressstates", category: "Foundations", name: "Press states",
        summary: "The universal press: snap in under the finger, spring back on release. Force only changes the dip.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var scale = Track(1, preset: .snap)
    @State private var force = "medium"
    private let dips = ["light": 0.97, "medium": 0.94, "firm": 0.90]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Press in on snap, release on base — one feel everywhere") {
            VStack(spacing: 16) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    Button("Hold me") {}
                        .buttonStyle(.borderedProminent)
                        .frame(maxWidth: .infinity, minHeight: 56)
                        .scaleEffect(min(1.05, max(0.8, scale.value(at: t))))
                        .simultaneousGesture(DragGesture(minimumDistance: 0)
                            .onChanged { _ in press() }
                            .onEnded { _ in release() })
                }
                TimelineView(.animation(paused: reduce)) { ctx in
                    Text("scale \(String(format: "%.3f", scale.value(at: ctx.date.timeIntervalSinceReferenceDate))) · \(force)")
                        .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                }
                HStack(spacing: 8) {
                    Text("Force").font(.caption).foregroundStyle(.secondary)
                    ForEach(["light", "medium", "firm"], id: \.self) { f in
                        Button(f) { force = f }
                            .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                            .tint(force == f ? .accentColor : nil)
                    }
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private func press() {
        let dip = dips[force] ?? 0.94
        if reduce { scale.jump(dip) } else { scale.set(dip, preset: .snap, at: Date().timeIntervalSinceReferenceDate) }
    }

    private func release() {
        if reduce { scale.jump(1) } else { scale.set(1, preset: .base, at: Date().timeIntervalSinceReferenceDate) }
    }
}
