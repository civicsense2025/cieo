import SwiftUI
import Cieo

/// The agent's square mark: a rounded square with a star. People are round, agents are square, so nothing relies on colour.
struct AgentMark: View {
    var size: CGFloat = 20
    var body: some View {
        RoundedRectangle(cornerRadius: size * 0.24)
            .strokeBorder(Color.primary, lineWidth: max(1.2, size * 0.07))
            .frame(width: size, height: size)
            .overlay(Image(systemName: "star.fill").font(.system(size: size * 0.46)))
            .accessibilityHidden(true)
    }
}

/// The small "Agent" tag that goes with an agent's name.
struct AgentTag: View {
    var body: some View {
        HStack(spacing: 2) { Image(systemName: "star.fill").font(.system(size: 7)); Text("Agent").font(.system(size: 9, weight: .semibold)) }
            .padding(.horizontal, 4).padding(.vertical, 1)
            .overlay(RoundedRectangle(cornerRadius: 3).fill(Color.primary).opacity(0.10).allowsHitTesting(false))
    }
}

struct AgCursorShape: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.minX, y: r.minY))
        p.addLine(to: CGPoint(x: r.minX, y: r.maxY * 0.85))
        p.addLine(to: CGPoint(x: r.maxX * 0.3, y: r.maxY * 0.65))
        p.addLine(to: CGPoint(x: r.maxX * 0.55, y: r.maxY))
        p.addLine(to: CGPoint(x: r.maxX * 0.7, y: r.maxY * 0.9))
        p.addLine(to: CGPoint(x: r.maxX * 0.45, y: r.maxY * 0.55))
        p.addLine(to: CGPoint(x: r.maxX * 0.85, y: r.maxY * 0.5))
        p.closeSubpath()
        return p
    }
}

/// A pointer. The tip is at the view's top-left corner. `agent` is ink; yours is the accent colour.
struct AgCursor: View {
    var agent = true
    var pressed = false
    var body: some View {
        AgCursorShape().fill(agent ? Color.primary : Color.accentColor)
            .overlay(AgCursorShape().stroke(Color.white, lineWidth: 1))
            .frame(width: 14, height: 18).scaleEffect(pressed ? 0.85 : 1, anchor: .topLeading)
            .shadow(radius: 1).accessibilityHidden(true)
    }
}

/// A square agent pin, with an optional number or glyph. A person's pin would be round.
struct AgPinMark: View {
    var label: String = ""
    var tone: AgTone = .info
    var resolved = false
    var body: some View {
        RoundedRectangle(cornerRadius: 5).fill(resolved ? AgTone.success.color : tone.color).frame(width: 22, height: 22)
            .overlay(Group { if resolved { Image(systemName: "checkmark").font(.caption.weight(.bold)) } else { Text(label).font(.caption.weight(.bold)) } }.foregroundStyle(.white))
            .accessibilityLabel(resolved ? "Resolved pin" : "Agent pin \(label)")
    }
}

/// A small page the agent works on. Its targets report their frames in the "pg" space.
struct AgMockPage: View {
    var title = "Start your review"
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Demo Shop").font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
            Text(title).font(.headline).reportFrame("heading", in: "pg")
            Text("Create a workspace and invite your team.").font(.caption).foregroundStyle(.secondary)
            Text("name@company.com").font(.caption).foregroundStyle(.secondary).padding(7).frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.05))).reportFrame("field", in: "pg")
            Text("Create workspace").font(.caption.weight(.semibold)).foregroundStyle(.white).padding(.horizontal, 10).padding(.vertical, 6)
                .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 6)).reportFrame("button", in: "pg")
            Text("Read more").font(.caption).underline().reportFrame("link", in: "pg")
        }
        .padding(12).frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
    }
}

extension View {
    /// Collects the "pg" frames reported by `AgMockPage` into `frames`.
    func agFrames(_ frames: Binding<[String: CGRect]>) -> some View {
        coordinateSpace(name: "pg").onPreferenceChange(FramePreferenceKey.self) { v in
            frames.wrappedValue = v.reduce(into: [:]) { if let k = $1.key as? String { $0[k] = $1.value } }
        }
    }
}

/// A highlight that stretches along one axis: the leading edge moves first, the trailing edge follows `Motion.lag` later.
struct AgSpan: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var lo: CGFloat, hi: CGFloat
    var vertical = false
    var fill: Color = .accentColor.opacity(0.25)
    @State private var shownLo: CGFloat = 0
    @State private var shownHi: CGFloat = 0
    var body: some View {
        Rectangle().fill(fill)
            .frame(width: vertical ? nil : max(0, shownHi - shownLo), height: vertical ? max(0, shownHi - shownLo) : nil)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: vertical ? .top : .leading)
            .offset(x: vertical ? 0 : shownLo, y: vertical ? shownLo : 0)
            .onAppear { shownLo = lo; shownHi = hi }
            .onChange(of: lo) { old, new in
                if reduce { shownLo = new } else { withAnimation(.motion(.base).delay(new < old ? 0 : Motion.lag)) { shownLo = new } }
            }
            .onChange(of: hi) { old, new in
                if reduce { shownHi = new } else { withAnimation(.motion(.base).delay(new > old ? 0 : Motion.lag)) { shownHi = new } }
            }
            .allowsHitTesting(false).accessibilityHidden(true)
    }
}

/// A rectangle outline that snaps to `frame`: x edges lead and lag, y and height ride the same spring.
struct AgFrameRing: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let frame: CGRect
    var tone: AgTone = .info
    var body: some View {
        EdgesIndicator(frame: frame.insetBy(dx: -3, dy: -3), shape: RoundedRectangle(cornerRadius: 5), style: tone.color.opacity(0.22))
            .animation(reduce ? nil : .motion(.base), value: frame)
    }
}
