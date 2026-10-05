import SwiftUI
import MotionKit

/// Height of each panel's content, keyed by top item, so the panel can morph to the next one's height.
struct MegaHeightKey: PreferenceKey {
    static let defaultValue: [Int: CGFloat] = [:]
    static func reduce(value: inout [Int: CGFloat], nextValue: () -> [Int: CGFloat]) {
        value.merge(nextValue()) { $1 }
    }
}

/// Content that arrives after the panel: rises 6 pt from 0.45 opacity, staggered, after the old content has left.
struct MegaRise: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let index: Int
    let count: Int
    var lead: Double = Motion.exit
    @State private var shown = false
    func body(content: Content) -> some View {
        content
            .opacity(shown ? 1 : Motion.arriveOpacity)
            .offset(y: shown ? 0 : 6)
            .onAppear {
                withAnimation(reduce ? nil : .motion(.base).delay(lead + Motion.stagger(index, of: count, gap: 0.03))) { shown = true }
            }
    }
}

extension View {
    func megaRise(_ index: Int, of count: Int = 6, lead: Double = Motion.exit) -> some View {
        modifier(MegaRise(index: index, count: count, lead: lead))
    }
}

/// One plate that glides between frames. The edges toward the direction of travel move first, the others follow `Motion.lag` later.
struct MegaPlate: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let frame: CGRect?
    var radius: CGFloat = 8
    @State private var x0: CGFloat = 0
    @State private var x1: CGFloat = 0
    @State private var y0: CGFloat = 0
    @State private var y1: CGFloat = 0
    @State private var shown = false

    var body: some View {
        RoundedRectangle(cornerRadius: radius, style: .continuous)
            .fill(.quaternary)
            .frame(width: max(0, x1 - x0), height: max(0, y1 - y0))
            .position(x: (x0 + x1) / 2, y: (y0 + y1) / 2)
            .opacity(shown ? 1 : 0)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
            .onAppear { if let frame { jump(frame); shown = true } }
            .onChange(of: frame) { old, new in
                guard let new else { withMotion(.base, reduceMotion: reduce) { shown = false }; return }
                guard let old, shown, !reduce else {
                    jump(new)
                    withMotion(.snap, reduceMotion: reduce) { shown = true }
                    return
                }
                let right = new.minX >= old.minX, down = new.minY >= old.minY
                withAnimation(.motion(.base).delay(right ? Motion.lag : 0)) { x0 = new.minX }
                withAnimation(.motion(.base).delay(right ? 0 : Motion.lag)) { x1 = new.maxX }
                withAnimation(.motion(.base).delay(down ? Motion.lag : 0)) { y0 = new.minY }
                withAnimation(.motion(.base).delay(down ? 0 : Motion.lag)) { y1 = new.maxY }
            }
    }

    private func jump(_ r: CGRect) {
        var t = Transaction()
        t.disablesAnimations = true
        withTransaction(t) { x0 = r.minX; x1 = r.maxX; y0 = r.minY; y1 = r.maxY }
    }
}

/// Title and description link that tints on hover on the snap spring.
struct MegaRow: View {
    let title: String
    var detail: String?
    var symbol: String?
    @State private var hover = false
    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            if let symbol { Image(systemName: symbol).foregroundStyle(hover ? Color.accentColor : .secondary).frame(width: 20) }
            VStack(alignment: .leading, spacing: 1) {
                Text(title).font(.callout.weight(.medium)).foregroundStyle(hover ? Color.accentColor : .primary)
                if let detail { Text(detail).font(.caption).foregroundStyle(.secondary) }
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 4)
        .contentShape(Rectangle())
        .onHover { hover = $0 }
        .motion(.snap, value: hover)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isLink)
    }
}

/// A top bar of items with one panel under it. Hover waits 120 ms to open; moving between items keeps the panel,
/// morphs its height, and swaps content (old out in 100 ms, new in from the direction of travel). Leaving closes after 220 ms.
struct MegaShell<Panel: View>: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let items: [String]
    let hint: String
    @ViewBuilder var panel: (Int) -> Panel
    @State private var open: Int?
    @State private var pending: Int?
    @State private var dir: CGFloat = 1
    @State private var task: Task<Void, Never>?
    @State private var heights: [Int: CGFloat] = [:]

    var body: some View {
        AtomStage(hint: hint) {
            ZStack(alignment: .top) {
                RoundedRectangle(cornerRadius: 10).fill(.quaternary.opacity(0.35)).accessibilityHidden(true)
                VStack(spacing: 0) {
                    bar
                    if let open { panelView(open).transition(.motionPresence) }
                    Spacer(minLength: 0)
                }
            }
            .onHover { inside in
                if inside { task?.cancel() } else { schedule(close: true) }
            }
        }
    }

    private var bar: some View {
        HStack(spacing: 4) {
            ForEach(items.indices, id: \.self) { i in
                Button { show(i, toggle: true) } label: {
                    Text(items[i]).font(.callout.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 8)
                        .overlay(alignment: .bottom) {
                            Rectangle().fill(Color.accentColor).frame(height: 2)
                                .scaleEffect(x: pending == i ? 1 : 0, anchor: .leading)
                                .motion(.soft, value: pending)
                        }
                }
                .buttonStyle(.plain)
                .onHover { inside in
                    if inside { task?.cancel(); schedule(open: i) } else if pending == i { task?.cancel(); pending = nil }
                }
                .accessibilityValue(open == i ? "expanded" : "collapsed")
            }
            Spacer()
        }
        .padding(.horizontal, 8)
        .background(.background)
    }

    private func panelView(_ i: Int) -> some View {
        let swap = AnyTransition.asymmetric(
            insertion: .opacity.combined(with: .offset(x: 10 * dir)).animation(.motion(.base).delay(Motion.exit)),
            removal: .opacity.animation(.motionExit))
        return ZStack(alignment: .top) {
            panel(i)
                .fixedSize(horizontal: false, vertical: true)
                .background(GeometryReader { g in Color.clear.preference(key: MegaHeightKey.self, value: [i: g.size.height]) })
                .id(i)
                .transition(reduce ? .identity : swap)
        }
        .frame(height: heights[i], alignment: .top)
        .clipped()
        .onPreferenceChange(MegaHeightKey.self) { heights = $0 }
        .animation(reduce ? nil : .motion(.soft), value: heights[i])
        .padding(12)
        .background(.background, in: RoundedRectangle(cornerRadius: 10, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(.quaternary))
        .shadow(color: .black.opacity(0.08), radius: 10, y: 4)
        .padding(.horizontal, 8)
    }

    private func schedule(open i: Int) {
        if open != nil { show(i); return }
        pending = i
        task = Task {
            try? await Task.sleep(for: .milliseconds(120))
            guard !Task.isCancelled else { return }
            show(i)
        }
    }

    private func schedule(close: Bool) {
        task?.cancel()
        task = Task {
            try? await Task.sleep(for: .milliseconds(220))
            guard !Task.isCancelled else { return }
            withMotion(.snap, reduceMotion: reduce) { open = nil }
        }
    }

    private func show(_ i: Int, toggle: Bool = false) {
        pending = nil
        if toggle, open == i { withMotion(.snap, reduceMotion: reduce) { open = nil }; return }
        dir = (open ?? -1) <= i ? 1 : -1
        withMotion(.base, reduceMotion: reduce) { open = i }
    }
}

/// Blur and fade used when a row leaves or arrives in a filtered list.
struct MegaBlur: ViewModifier {
    let radius: CGFloat
    let opacity: Double
    func body(content: Content) -> some View { content.blur(radius: radius).opacity(opacity) }
}

extension AnyTransition {
    /// Leaves by blurring out in 100 ms; arrives last, on base.
    static var megaBlur: AnyTransition {
        .asymmetric(
            insertion: .modifier(active: MegaBlur(radius: 0, opacity: 0), identity: MegaBlur(radius: 0, opacity: 1)).animation(.motion(.base).delay(Motion.exit)),
            removal: .modifier(active: MegaBlur(radius: 5, opacity: 0), identity: MegaBlur(radius: 0, opacity: 1)).animation(.motionExit))
    }
}
