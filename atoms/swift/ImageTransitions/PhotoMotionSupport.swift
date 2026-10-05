import SwiftUI
import Cieo

/// A value that chases a target on a critically damped spring, read once per frame. Not a View: owned by `PhFollow`.
final class PhClock {
    var track: Track
    var preset: SpringPreset
    var epoch = 0
    private(set) var lastSet = -10.0
    private let t0 = Date()
    init(_ v: Double, _ p: SpringPreset) { track = Track(v, preset: p); preset = p }
    var now: Double { Date().timeIntervalSince(t0) }
    var value: Double { track.value(at: now) }
    var settled: Bool { now - lastSet > preset.settleTime() + 0.05 }
    func sync(_ target: Double, epoch e: Int, reduce: Bool) {
        if e != epoch { epoch = e; track.jump(0); lastSet = now }
        guard target != track.target else { return }
        if reduce { track.jump(target) } else { track.set(target, preset: preset, at: now) }
        lastSet = now
    }
    func release(from: Double, velocity: Double, to: Double, reduce: Bool, preset p: SpringPreset? = nil) {
        if let p { preset = p }
        if reduce { track.jump(to) } else { track.release(from: from, velocity: velocity, to: to, preset: preset, at: now) }
        lastSet = now
    }
}

/// Hands `content` a spring-smoothed copy of `target` every frame, then stops the timeline once settled.
/// Changing `epoch` restarts from 0, so a transition can replay while a new target is set.
struct PhFollow<Content: View>: View {
    let target: Double
    var preset: SpringPreset = .soft
    var epoch = 0
    @ViewBuilder var content: (Double) -> Content
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var clock: PhClock?
    @State private var idle = false

    var body: some View {
        let c = clock ?? PhClock(target, preset)
        let _ = { c.preset = preset; c.sync(target, epoch: epoch, reduce: reduce) }()
        TimelineView(.animation(paused: idle)) { _ in content(c.value) }
            .onAppear { if clock == nil { clock = c } }
            .task(id: "\(target)-\(epoch)") {
                idle = false
                try? await Task.sleep(nanoseconds: UInt64((preset.settleTime() + 0.15) * 1_000_000_000))
                idle = true
            }
    }
}

struct PhFrame {
    var from: Int
    var to: Int
    var p: Double
    var dir: Double
    var origin: UnitPoint
    var size: CGSize
}

/// A photo frame that steps through `count` photos; `effect` draws the transition from `from` to `to` at progress `p`.
struct PhSlideshow<Effect: View>: View {
    var hint = "Tap the photo or use Next"
    var count = 3
    var preset: SpringPreset = .soft
    var golden = false
    @ViewBuilder var effect: (PhFrame) -> Effect
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var from = 0
    @State private var to = 0
    @State private var epoch = 0
    @State private var dir = 1.0
    @State private var origin = UnitPoint.center
    @State private var size = CGSize(width: 300, height: 200)
    @State private var last = Date.distantPast

    var body: some View {
        AtomStage(hint: hint) {
            VStack(spacing: 12) {
                PhFollow(target: 1, preset: preset, epoch: epoch) { p in
                    effect(PhFrame(from: from, to: to, p: p, dir: dir, origin: origin, size: size))
                        .frame(width: size.width, height: size.height)
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(1.5, contentMode: .fit)
                .background(GeometryReader { g in Color.clear.onAppear { size = g.size }.onChange(of: g.size) { _, s in size = s } })
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .contentShape(Rectangle())
                .onTapGesture { l in
                    origin = UnitPoint(x: l.x / max(1, size.width), y: l.y / max(1, size.height))
                    step(1)
                }
                .accessibilityElement()
                .accessibilityLabel("Photo \(to + 1) of \(count)")
                .accessibilityAdjustableAction { d in step(d == .increment ? 1 : -1) }
                HStack {
                    Button { step(-1) } label: { Label("Back", systemImage: "chevron.left") }
                    Spacer()
                    Text("\(to + 1) / \(count)").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                    Spacer()
                    Button { step(1) } label: { Label("Next", systemImage: "chevron.right").labelStyle(.titleAndIcon) }
                }
                .buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    private func step(_ d: Int) {
        guard Date().timeIntervalSince(last) > 0.25 else { return }
        last = Date()
        from = to
        to = (to + d + count) % count
        dir = Double(d)
        epoch += 1
    }
}

/// A drag-driven position in items. Follows the finger 1:1, rubber-bands past the ends, and on release
/// settles on the nearest item from the flick's projected distance on a critically damped spring.
struct PhPager<Content: View>: View {
    let count: Int
    var loop = false
    var itemFraction: CGFloat = 0.72
    var axis: Axis = .horizontal
    var preset: SpringPreset = .soft
    var maxStep = 8
    /// Optional two-way link to the current item; also lets outside controls move the pager.
    var index: Binding<Int>?
    /// Bump by n to step n items (used by buttons and autoplay).
    var advance = 0
    /// Called on release with the unclamped position; returns how many items to append (infinite feeds).
    var onRelease: (Double) -> Int = { _ in 0 }
    @ViewBuilder var content: (_ pos: Double, _ size: CGSize, _ item: CGFloat) -> Content
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var clock = PhClock(0, .soft)
    @State private var live: Double?
    @State private var base = 0.0
    @State private var idle = true
    @State private var key = 0

    private func rubber(_ x: Double) -> Double {
        let hi = Double(count - 1)
        if loop { return x }
        return x < 0 ? x * 0.35 : (x > hi ? hi + (x - hi) * 0.35 : x)
    }

    var body: some View {
        GeometryReader { g in
            let item = (axis == .horizontal ? g.size.width : g.size.height) * itemFraction
            TimelineView(.animation(paused: idle && live == nil)) { _ in
                content(rubber(live ?? clock.value), g.size, item)
            }
            .contentShape(Rectangle())
            .gesture(drag(item))
            .task(id: key) {
                idle = false
                try? await Task.sleep(nanoseconds: UInt64((preset.settleTime() + 0.2) * 1_000_000_000))
                idle = true
            }
            .accessibilityElement()
            .accessibilityLabel("Carousel")
            .accessibilityValue("Item \(Int((clock.value).rounded()) + 1) of \(count)")
            .accessibilityAdjustableAction { d in step(d == .increment ? 1 : -1) }
            .onChange(of: advance) { o, n in step(Double(n - o)) }
            .onChange(of: index?.wrappedValue) { _, n in goTo(n) }
        }
    }

    private func settle(from raw: Double, velocity: Double, to: Double) {
        clock.release(from: raw, velocity: velocity, to: to, reduce: reduce)
        key += 1
        index?.wrappedValue = ((Int(to.rounded()) % count) + count) % count
    }

    private func step(_ n: Double) {
        let to = clock.track.target + n
        settle(from: clock.value, velocity: 0, to: loop ? to : min(max(to, 0), Double(count - 1)))
    }

    private func goTo(_ n: Int?) {
        guard let n else { return }
        let cur = clock.track.target, m = Double(count)
        if Int(cur.rounded()) == n { return }
        var d = Double(n) - cur
        if loop { d = d.truncatingRemainder(dividingBy: m); if d > m / 2 { d -= m }; if d < -m / 2 { d += m } }
        settle(from: clock.value, velocity: 0, to: cur + d)
    }

    private func drag(_ item: CGFloat) -> some Gesture {
        DragGesture(minimumDistance: 4)
            .onChanged { v in
                if live == nil { base = clock.value }
                let d = axis == .horizontal ? v.translation.width : v.translation.height
                live = base - Double(d / item)
            }
            .onEnded { v in
                let d = axis == .horizontal ? v.translation.width : v.translation.height
                let e = axis == .horizontal ? v.predictedEndTranslation.width : v.predictedEndTranslation.height
                let proj = Double((e - d) / item)
                let raw = live ?? clock.value
                let extra = onRelease(raw)
                var to = (raw - proj).rounded()
                to = min(max(to, base - Double(maxStep)), base + Double(maxStep))
                if !loop { to = min(max(to, 0), Double(count - 1 + extra)) }
                live = nil
                clock.release(from: raw, velocity: -proj * 2.5, to: to, reduce: reduce)
                key += 1
                index?.wrappedValue = ((Int(to.rounded()) % count) + count) % count
            }
    }
}

func phSmooth(_ t: Double) -> Double { let x = min(max(t, 0), 1); return x * x * (3 - 2 * x) }
func phClamp(_ x: Double, _ lo: Double = 0, _ hi: Double = 1) -> Double { min(max(x, lo), hi) }
/// Maps `x` in [a, b] to 0...1.
func phRange(_ x: Double, _ a: Double, _ b: Double) -> Double { phClamp((x - a) / max(0.0001, b - a)) }

/// A photo of exactly `size`, so effects can offset, scale and mask it predictably.
func phPhoto(_ seed: Int, _ size: CGSize, golden: Double = 0) -> some View {
    AtomPhoto(seed: seed, goldenHour: golden).frame(width: size.width, height: size.height)
}

/// A circle mask centred on `c` with radius `r`, in a `size` box.
func phCircle(_ c: CGPoint, _ r: Double, _ size: CGSize) -> some View {
    Circle().frame(width: max(0.1, 2 * r), height: max(0.1, 2 * r)).position(c).frame(width: size.width, height: size.height)
}

/// A soft-edged reveal mask: a white-to-clear gradient whose edge travels from `start` to `end` as `p` goes 0...1.
func phSoftEdge(_ p: Double, soft: Double = 0.25, start: UnitPoint = .top, end: UnitPoint = .bottom) -> LinearGradient {
    let hi = phClamp(p * (1 + soft))
    let lo = phClamp(p * (1 + soft) - soft)
    return LinearGradient(stops: [.init(color: .white, location: lo), .init(color: .clear, location: max(hi, lo))], startPoint: start, endPoint: end)
}
