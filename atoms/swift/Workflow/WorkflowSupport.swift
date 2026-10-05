import SwiftUI
import MotionKit

/// Shared pieces for the workflow, status, MCP and agent atoms. All names start with `Ag` so they never collide with other atoms.
enum AgTone {
    case neutral, info, success, warning, danger
    var color: Color {
        switch self {
        case .neutral: .secondary
        case .info: .accentColor
        case .success: .green
        case .warning: .orange
        case .danger: .red
        }
    }
}

/// A small status chip. Fill, label colour and icon morph together when the tone changes.
struct AgChip: View {
    let text: String
    var tone: AgTone = .neutral
    var icon: String?
    var body: some View {
        HStack(spacing: 4) {
            if let icon { Image(systemName: icon).imageScale(.small).accessibilityHidden(true) }
            SwapText(text)
        }
        .font(.caption.weight(.medium))
        .foregroundStyle(tone.color)
        .padding(.horizontal, 8).padding(.vertical, 3)
        .background(tone.color.opacity(0.14), in: Capsule())
        .overlay(Capsule().strokeBorder(tone.color.opacity(0.35)))
        .motion(.base, value: text)
        .motion(.base, value: tone.color)
        .accessibilityElement(children: .combine)
    }
}

/// Press feedback on snap: a quiet scale, never a bounce. `tone` fills the button when set.
struct AgPress: ButtonStyle {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var tone: AgTone?
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.callout.weight(.medium))
            .padding(.horizontal, 12).padding(.vertical, 6)
            .foregroundStyle(tone == nil ? Color.primary : Color.white)
            .background(tone?.color ?? Color.primary.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(reduce ? nil : .motion(.snap), value: configuration.isPressed)
            .animation(reduce ? nil : .motion(.base), value: tone?.color)
    }
}

struct AgCard<Content: View>: View {
    @ViewBuilder var content: Content
    var body: some View {
        content.padding(12)
            .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(.quaternary))
    }
}

private struct AgHeightKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}

/// Height springs open first, then the content fades in 70 ms later. Closing fades first, then the space collapses.
struct AgReveal<Content: View>: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let open: Bool
    @ViewBuilder var content: Content
    @State private var height: CGFloat = 0
    var body: some View {
        content
            .fixedSize(horizontal: false, vertical: true)
            .background(GeometryReader { Color.clear.preference(key: AgHeightKey.self, value: $0.size.height) })
            .onPreferenceChange(AgHeightKey.self) { height = $0 }
            .opacity(open ? 1 : 0)
            .animation(reduce ? nil : (open ? .motion(.base).delay(0.07) : .motionExit), value: open)
            .frame(height: open ? height : 0, alignment: .top)
            .clipped()
            .animation(reduce ? nil : .motion(.base).delay(open ? 0 : Motion.exit), value: open)
            .animation(reduce ? nil : .motion(.base), value: height)
            .allowsHitTesting(open)
            .accessibilityHidden(!open)
    }
}

/// A continuous spinner. Under Reduce Motion it holds still.
struct AgSpinner: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var size: CGFloat = 14
    var body: some View {
        TimelineView(.animation(paused: reduce)) { ctx in
            let t = reduce ? 0 : ctx.date.timeIntervalSinceReferenceDate
            Circle().trim(from: 0, to: 0.75)
                .stroke(style: StrokeStyle(lineWidth: 2, lineCap: .round))
                .frame(width: size, height: size)
                .rotationEffect(.degrees((t * 360 / 0.9).truncatingRemainder(dividingBy: 360)))
        }
        .accessibilityLabel("Working")
    }
}

/// Runs delayed steps on a main-actor task so a scripted sequence can be cancelled and replayed.
@MainActor final class AgScript: ObservableObject {
    private var task: Task<Void, Never>?
    func run(_ steps: @escaping @MainActor (_ wait: (Double) async -> Bool) async -> Void) {
        task?.cancel()
        task = Task { @MainActor in
            await steps { s in
                try? await Task.sleep(nanoseconds: UInt64(s * 1_000_000_000))
                return !Task.isCancelled
            }
        }
    }
    func stop() { task?.cancel() }
}

extension Animation {
    /// Spring that respects Reduce Motion in one place.
    static func ag(_ p: SpringPreset = .base, _ reduce: Bool) -> Animation? { reduce ? nil : .motion(p) }
}
