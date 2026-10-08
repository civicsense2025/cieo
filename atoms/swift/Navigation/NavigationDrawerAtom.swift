import SwiftUI
import Cieo

public struct NavigationDrawerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "drawer", category: "Navigation", name: "Navigation drawer",
        summary: "The drawer slides in from the edge while its links follow 35ms apart. It tracks a drag 1:1, rubber-bands when pulled past open, and closes past halfway or on a fast flick.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var x = Track(-200)
    @State private var held = false
    @State private var hx = 0.0
    @State private var sx = 0.0
    @State private var tOpen = -9.0
    private let width = 200.0
    private let links = ["Home", "Events", "Members", "Library", "Settings"]
    public init() {}

    private func now() -> Double { Date().timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Swipe the drawer left to close it, or tap outside") {
            TimelineView(.animation(paused: reduce && !held)) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let v = held ? hx : x.value(at: t)
                let p = min(1, max(0, 1 + v / width))
                ZStack(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 8) {
                            Button { set(true) } label: { Image(systemName: "line.3.horizontal").frame(width: 36, height: 36) }
                                .buttonStyle(.plain).accessibilityLabel("Open navigation")
                            Text("Common Room").fontWeight(.semibold)
                            Spacer()
                        }
                        .padding(.horizontal, 10).frame(height: 50)
                        Divider()
                        Text("Swipe the drawer left to close it, or tap outside.").font(.footnote)
                            .foregroundStyle(.secondary).padding(14)
                        Spacer()
                    }
                    Color.black.opacity(p * 0.3).allowsHitTesting(p > 0.5).onTapGesture { set(false) }
                        .accessibilityHidden(p < 0.5)
                    drawer(t: t).offset(x: v)
                        .gesture(DragGesture(minimumDistance: 4)
                            .onChanged { g in
                                if !held {
                                    held = true
                                    sx = x.value(at: now()) - g.translation.width
                                }
                                let raw = sx + g.translation.width
                                hx = raw > 0 ? 30 * (1 - exp(-raw / 30)) : raw
                            }
                            .onEnded { g in
                                held = false
                                let vx = g.velocity.width
                                let to = (hx < -width / 2 || vx < -500) ? -width : 0
                                if reduce { x.jump(to) } else { x.release(from: hx, velocity: vx, to: to, at: now()) }
                            })
                }
                .frame(width: 260, height: 300)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.05)))
            }
        }
    }

    private func drawer(t: Double) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Common Room").fontWeight(.semibold).padding(.horizontal, 10).padding(.bottom, 10)
            ForEach(links.indices, id: \.self) { i in
                let q = x.target == 0 ? min(1, max(0, 1 - Motion.resp(t - tOpen - (0.06 + Double(i) * 0.035), x0: 1, v0: 0, .base))) : 1
                Button { set(false) } label: {
                    Text(links[i]).font(.callout.weight(.medium)).frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 10).padding(.vertical, 9)
                        .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(i == 0 ? 0.08 : 0)))
                }
                .buttonStyle(.plain)
                .opacity(q).offset(x: (1 - q) * -10)
            }
            Spacer()
        }
        .padding(.vertical, 16).padding(.horizontal, 10)
        .frame(width: width).frame(maxHeight: .infinity)
        .background(Rectangle().fill(.background).shadow(color: .black.opacity(0.2), radius: 14, x: 4))
    }

    private func set(_ open: Bool) {
        if reduce { x.jump(open ? 0 : -width); return }
        x.set(open ? 0 : -width, at: now())
        if open { tOpen = now() }
    }
}
