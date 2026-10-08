import SwiftUI
import Cieo

private struct ToastItem: Identifiable { let id = UUID(); let kind: Int; let text: String }

private struct ToastCard: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let item: ToastItem
    let depth: Int
    let onDismiss: () -> Void
    @State private var x = Track(0, preset: .base)
    @State private var held = false
    @State private var hx = 0.0
    @State private var gone = false
    @State private var vel = DataVelocity()

    private var color: Color { item.kind == 0 ? .green : item.kind == 1 ? .red : .orange }

    var body: some View {
        TimelineView(.motion(x)) { ctx in
            let px = held ? hx : x.value(at: ctx.date.timeIntervalSinceReferenceDate)
            HStack(spacing: 10) {
                Image(systemName: item.kind == 0 ? "checkmark" : "exclamationmark.circle").font(.footnote.weight(.bold)).foregroundStyle(color)
                Text(item.text).font(.caption.weight(.medium)).frame(maxWidth: .infinity, alignment: .leading)
                Text(item.kind == 0 ? "Undo" : item.kind == 1 ? "Retry" : "Manage").font(.caption.weight(.medium)).foregroundStyle(item.kind == 0 ? Color.secondary : color)
            }
            .padding(.horizontal, 14).padding(.vertical, 12)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
            .offset(x: px)
            .opacity((gone ? 0 : 1) * min(1, max(0, Double(3 - depth))) * (1 - min(1, abs(px) / 420)))
        }
        .scaleEffect(1 - Double(depth) * 0.05, anchor: .bottom)
        .offset(y: -Double(depth) * 10)
        .animation(reduce ? nil : .motion(.base), value: depth)
        .animation(reduce ? nil : .motion(.snap), value: gone)
        .allowsHitTesting(depth == 0 && !gone)
        .gesture(DragGesture(minimumDistance: 4)
            .onChanged { d in
                if !held { held = true; hx = x.value(at: DataMotion.now); vel.reset() }
                hx = d.translation.width
                vel.add(hx, at: d.time.timeIntervalSinceReferenceDate)
            }
            .onEnded { _ in
                held = false
                let out = abs(hx) > 100 || abs(vel.v) > 600
                let dir = hx == 0 ? (vel.v < 0 ? -1.0 : 1.0) : (hx < 0 ? -1.0 : 1.0)
                if reduce { x.jump(out ? dir * 420 : 0) } else { x.release(from: hx, velocity: vel.v, to: out ? dir * 420 : 0, at: DataMotion.now) }
                if out { dismiss() }
            })
        .task { try? await Task.sleep(for: .seconds(6)); if !held { dismiss() } }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(item.kind == 1 ? .isStaticText : [])
    }

    private func dismiss() {
        guard !gone else { return }
        gone = true
        Task { try? await Task.sleep(for: .milliseconds(260)); onDismiss() }
    }
}

public struct ToastStackAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "toast", category: "Admin", name: "Toast stack",
        summary: "Success, warning and error toasts carry their status color on the icon and the action. New toasts push older ones back in depth. Drag one sideways 1:1; a long or fast swipe flings it out from release velocity, a short one springs home.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let messages: [(Int, String)] = [(0, "Page published"), (1, "Couldn’t reach the domain"), (0, "Invite sent to maya@studio.co"), (2, "Storage 90% full"), (0, "Draft saved")]
    @State private var toasts: [ToastItem] = []   // newest first
    @State private var next = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Swipe a toast sideways to dismiss") {
            VStack {
                Button("Show toast") {
                    let m = messages[next % messages.count]; next += 1
                    withMotion(.base, reduceMotion: reduce) { toasts.insert(ToastItem(kind: m.0, text: m.1), at: 0) }
                    if toasts.count > 4 { toasts.removeLast() }
                }
                .buttonStyle(.borderedProminent)
                Spacer()
                ZStack(alignment: .bottom) {
                    ForEach(Array(toasts.enumerated()), id: \.element.id) { i, item in
                        ToastCard(item: item, depth: i) { toasts.removeAll { $0.id == item.id } }
                            .transition(reduce ? .identity : .opacity.combined(with: .offset(y: 16)))
                    }
                }
                .frame(width: 300, height: 120, alignment: .bottom)
            }
            .frame(minHeight: 220)
        }
    }
}
