import Cieo
import SwiftUI

/// A quiet icon button with a rolling count: a toggle (like, repost) when `isOn` is given, a plain action
/// (reply, share) otherwise. The host owns the state and the number. While pressed the icon dips on the snap
/// spring; under Reduce Motion it stays still.
public struct CountButton<Icon: View, ActiveIcon: View>: View {
    /// The colour the on (or pressed) state takes.
    public enum Tone: Sendable, CaseIterable { case neutral, accent, danger, success }

    /// Scale the icon dips to while pressed.
    public static var dip: CGFloat { 0.8 } // literal-ok: the shared press-dip contract with the web (COUNT_BUTTON_DIP)

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.isEnabled) private var isEnabled
    private let label: String
    private let count: Int?
    private let unit: String?
    private let tone: Tone
    private let isOn: Binding<Bool>?
    private let action: (() -> Void)?
    private let icon: Icon
    private let activeIcon: ActiveIcon?

    /// `label` is the verb ("Like"); `count` and `unit` extend the spoken name ("Like, 164 likes").
    /// Pass `isOn` for a toggle, or `action` for a plain button (or both: `action` runs after each toggle).
    public init(_ label: String, count: Int? = nil, unit: String? = nil, tone: Tone = .neutral,
                isOn: Binding<Bool>? = nil, action: (() -> Void)? = nil,
                @ViewBuilder icon: () -> Icon, @ViewBuilder activeIcon: () -> ActiveIcon) {
        self.label = label; self.count = count; self.unit = unit; self.tone = tone
        self.isOn = isOn; self.action = action
        self.icon = icon(); self.activeIcon = activeIcon()
    }

    /// Accessible name that carries the exact count: "Like, 164 likes". A zero, missing or invalid count gives just the label.
    public static func countButtonLabel(_ label: String, count: Int? = nil, unit: String? = nil) -> String {
        guard let count, count > 0 else { return label }
        return "\(label), \(CompactCount.spokenCount(Double(count), unit: unit))"
    }

    private var on: Bool { isOn?.wrappedValue ?? false }
    private var tint: Color {
        switch tone {
        case .neutral: theme.foreground
        case .accent: theme.accent
        case .danger: theme.danger
        case .success: theme.success
        }
    }

    public var body: some View {
        Button {
            isOn?.wrappedValue.toggle()
            action?()
        } label: { EmptyView() }
        .buttonStyle(CountButtonStyle { pressed in
            HStack(spacing: metrics.tight) {
                glyphs
                    .scaleEffect(pressed && !reduceMotion ? Self.dip : 1)
                    .motionAnimation(.snap, value: pressed)
                if let count {
                    CompactCount(count, unit: unit)
                }
            }
            .foregroundStyle(on ? tint : theme.secondary)
            .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
            .contentShape(.rect)
        })
        .accessibilityLabel(Self.countButtonLabel(label, count: count, unit: unit))
        .accessibilityAddTraits(isOn == nil ? [] : (on ? [.isToggle, .isSelected] : [.isToggle]))
    }

    @ViewBuilder private var glyphs: some View {
        if let activeIcon {
            ZStack {
                icon.opacity(on ? 0 : 1)
                activeIcon.opacity(on ? 1 : 0)
            }
            .motionAnimation(.snap, value: on)
        } else {
            icon
        }
    }
}

public extension CountButton where ActiveIcon == EmptyView {
    /// A button whose icon stays the same in both states; the colour alone marks "on".
    init(_ label: String, count: Int? = nil, unit: String? = nil, tone: Tone = .neutral,
         isOn: Binding<Bool>? = nil, action: (() -> Void)? = nil, @ViewBuilder icon: () -> Icon) {
        self.init(label, count: count, unit: unit, tone: tone, isOn: isOn, action: action, icon: icon) { EmptyView() }
    }
}

/// Hands the pressed state to the label so only the icon dips, not the whole row.
private struct CountButtonStyle<Content: View>: ButtonStyle {
    let build: (Bool) -> Content
    init(@ViewBuilder _ build: @escaping (Bool) -> Content) { self.build = build }
    func makeBody(configuration: Configuration) -> some View { build(configuration.isPressed) }
}

#Preview("CountButton") {
    struct Demo: View {
        @State private var liked = true
        var body: some View {
            HStack {
                CountButton("Like", count: 164, unit: "likes", tone: .danger, isOn: $liked) {
                    Image(systemName: "heart") // literal-ok: preview only
                } activeIcon: {
                    Image(systemName: "heart.fill") // literal-ok: preview only
                }
                CountButton("Reply", count: 12, unit: "replies") {
                    Image(systemName: "bubble.left") // literal-ok: preview only
                }
            }
        }
    }
    return Demo()
}
