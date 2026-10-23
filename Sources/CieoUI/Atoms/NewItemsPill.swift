import Cieo
import SwiftUI

/// A capsule that slides in from the edge of a feed when new items arrive, rolls its count as more come
/// and leaves when there are none. The host owns the list and what "show" does. The first appearance
/// is announced once; later increments are silent so VoiceOver is not interrupted.
public struct NewItemsPill: View {
    /// Which edge the pill slides in from.
    public enum Placement: Sendable, CaseIterable { case top, bottom }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var last: Int
    private let count: Int
    private let placement: Placement
    private let label: (Int) -> String
    private let onShow: () -> Void

    private static let locale = Locale(identifier: "en")

    private static func grouped(_ n: Int) -> String {
        n.formatted(.number.locale(locale))
    }

    /// Whole, non-negative count; anything else is 0.
    public static func clampNewItems(_ n: Double) -> Int {
        n.isFinite ? Int(Swift.max(0, n.rounded(.down))) : 0
    }

    /// The default label: "1 new reply", "3 new replies". Negative counts read as zero.
    public static func newItemsLabel(_ n: Int) -> String {
        let whole = Swift.max(0, n)
        return "\(grouped(whole)) new \(whole == 1 ? "reply" : "replies")"
    }

    /// What to announce: the label only when the pill first appears (0 to n), nothing on increments (nil),
    /// and empty once it is gone.
    public static func announcement(previous: Int, next: Int, label: (Int) -> String) -> String? {
        if previous == 0 && next > 0 { return label(next) }
        if next == 0 { return "" }
        return nil
    }

    /// Splits a label into the number that rolls and the words after it. A label that does not start with
    /// the exact number shows whole, without a roll.
    public static func splitNewItemsLabel(_ text: String, count n: Int) -> (rolls: Bool, rest: String) {
        let exact = grouped(Swift.max(0, n))
        return text.hasPrefix(exact) ? (true, String(text.dropFirst(exact.count))) : (false, text)
    }

    /// `onShow` runs when the pill is pressed; the host scrolls to or reveals the new items.
    public init(count: Int, placement: Placement = .top, label: @escaping (Int) -> String = NewItemsPill.newItemsLabel,
                onShow: @escaping () -> Void) {
        let n = Swift.max(0, count)
        self.count = n
        self.placement = placement
        self.label = label
        self.onShow = onShow
        _last = State(initialValue: n)
    }

    public var body: some View {
        let shown = count > 0 ? count : last
        let split = Self.splitNewItemsLabel(label(shown), count: shown)
        ZStack {
            if count > 0 {
                Button(action: onShow) {
                    HStack(spacing: 0) { // literal-ok: flush stack, the pieces touch by design
                        if split.rolls {
                            Text(shown, format: .number.notation(.compactName)) // compact count, as the web CompactCount
                                .contentTransition(.numericText(value: Double(shown)))
                        }
                        Text(split.rest)
                    }
                    .font(typography.strongDetail)
                    .foregroundStyle(theme.onAccent)
                    .padding(.horizontal, metrics.medium)
                    .frame(minHeight: metrics.touchTarget)
                    .background(theme.accent, in: .capsule)
                    .contentShape(.capsule)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(label(shown))
                .transition(edgeTransition)
            }
        }
        .frame(maxWidth: .infinity)
        .motion(.base, value: count > 0)
        .motion(.base, value: shown)
        .onAppear {
            if let message = Self.announcement(previous: 0, next: count, label: label), !message.isEmpty { announce(message) }
        }
        .onChange(of: count) { old, new in
            if new > 0 { last = new }
            if let message = Self.announcement(previous: old, next: new, label: label), !message.isEmpty { announce(message) }
        }
    }

    private var edgeTransition: AnyTransition {
        let edge: Edge = placement == .top ? .top : .bottom
        return reduceMotion ? .opacity : .move(edge: edge).combined(with: .opacity)
    }

    private func announce(_ message: String) {
        AccessibilityNotification.Announcement(message).post()
    }
}
