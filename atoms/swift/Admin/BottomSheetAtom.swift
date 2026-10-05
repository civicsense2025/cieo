import SwiftUI
import MotionKit

public struct BottomSheetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sheet", category: "Admin", name: "Bottom sheet (mobile only)",
        summary: "For phone layouts only: on wider screens Studio’s admin slides sheets in from the side (see Side detail sheet). Opens on the base spring. Dragging the grabber follows the finger; pulling up rubber-bands. Release past 30% or with a fast flick closes it from that velocity.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let height = 200.0
    @State private var y = Track(210, preset: .base)
    @State private var held = false
    @State private var hy = 0.0
    @State private var startY = 0.0
    @State private var vel = DataVelocity()
    public init() {}

    private func settle(to value: Double) { DataMotion.retarget(&y, to: value, reduce: reduce) }

    public var body: some View {
        AtomStage(hint: "Drag the sheet down to close") {
            TimelineView(.animation) { ctx in
                let v = held ? hy : y.value(at: ctx.date.timeIntervalSinceReferenceDate)
                let o = max(0, min(1, 1 - v / height))
                ZStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Pages").fontWeight(.semibold)
                        Text("Home · About · Journal · Contact").font(.caption).foregroundStyle(.secondary)
                        Button("Page settings") { settle(to: 0) }.buttonStyle(.borderedProminent).padding(.top, 8)
                        Spacer()
                    }
                    .padding(16).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    Color.primary.opacity(o * 0.35).allowsHitTesting(o > 0.5).onTapGesture { settle(to: height + 10) }
                    sheet.offset(y: v)
                }
                .frame(width: 250, height: 300)
                .background(.quaternary.opacity(0.5))
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
    }

    private var sheet: some View {
        VStack(alignment: .leading, spacing: 10) {
            Capsule().fill(.quaternary).frame(width: 36, height: 4).frame(maxWidth: .infinity).frame(height: 26)
            Text("Page settings").font(.subheadline.weight(.semibold)).padding(.horizontal, 16)
            ForEach([("Show in navigation", "On"), ("Search indexing", "Allowed"), ("Slug", "/about")], id: \.0) { row in
                HStack { Text(row.0); Spacer(); Text(row.1).foregroundStyle(.secondary) }.font(.caption).padding(.horizontal, 16)
            }
            Spacer()
        }
        .frame(height: height).frame(maxWidth: .infinity)
        .background(.background, in: UnevenRoundedRectangle(topLeadingRadius: 16, topTrailingRadius: 16))
        .shadow(color: .black.opacity(0.15), radius: 8)
        .gesture(DragGesture(minimumDistance: 2)
            .onChanged { d in
                if !held { held = true; startY = y.value(at: DataMotion.now); vel.reset() }
                let v = startY + d.translation.height
                hy = v < 0 ? DataMotion.rubber(v, limit: 30) : v
                vel.add(hy, at: d.time.timeIntervalSinceReferenceDate)
            }
            .onEnded { _ in
                held = false
                let close = hy > height * 0.3 || vel.v > 500
                if reduce { y.jump(close ? height + 10 : 0) } else { y.release(from: hy, velocity: vel.v, to: close ? height + 10 : 0, at: DataMotion.now) }
            })
        .accessibilityLabel("Page settings sheet")
        .accessibilityAction(named: "Close") { settle(to: height + 10) }
    }
}
