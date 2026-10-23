import SwiftUI

/// A filled "Follow" that becomes an outlined "Following"; pointing at or focusing "Following" previews
/// "Unfollow" in the danger colour. The host owns the follow state. The button's width follows the word it
/// shows on the base spring, and VoiceOver reads what is shown ("Unfollow Ava").
public struct FollowButton: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Binding private var following: Bool
    private let name: String?
    private let onToggle: (() -> Void)?
    @State private var hovering = false
    @State private var settled = false
    @State private var textWidth: CGFloat?
    @FocusState private var focused: Bool

    /// `name` is who is being followed, for the spoken name ("Follow Ava"). `onToggle` runs after each press.
    public init(following: Binding<Bool>, name: String? = nil, onToggle: (() -> Void)? = nil) {
        _following = following
        self.name = name
        self.onToggle = onToggle
    }

    /// Visible label. `previewing` only matters while following: it shows the action a press would take.
    public static func followLabel(following: Bool, previewing: Bool) -> String {
        guard following else { return "Follow" }
        return previewing ? "Unfollow" : "Following"
    }

    /// The spoken name always equals the visible word plus the person when known: "Follow Ava", "Following Ava", "Unfollow Ava" while the preview shows. No selected or toggle trait is added.
    public static func spokenLabel(following: Bool, previewing: Bool, name: String?) -> String {
        let word = followLabel(following: following, previewing: previewing)
        guard let name, !name.isEmpty else { return word }
        return "\(word) \(name)"
    }

    private var previewing: Bool { following && !settled && (hovering || focused) }
    private var shown: String { Self.followLabel(following: following, previewing: previewing) }

    private var foreground: Color {
        guard following else { return theme.onAccent }
        return previewing ? theme.danger : theme.foreground
    }

    public var body: some View {
        Button {
            settled = true
            following.toggle()
            onToggle?()
        } label: {
            Text(LocalizedStringKey(shown))
                .font(typography.action)
                .lineLimit(1)
                .fixedSize()
                .background(GeometryReader { proxy in
                    Color.clear.preference(key: FollowTextWidthKey.self, value: proxy.size.width)
                })
                .frame(width: textWidth)
                .contentTransition(.opacity)
                .padding(.horizontal, metrics.standard)
                .frame(minHeight: metrics.touchTarget)
                .foregroundStyle(foreground)
                .background(following ? Color.clear : theme.accent, in: .capsule)
                .overlay {
                    if following {
                        Capsule().strokeBorder(previewing ? theme.danger : theme.border, lineWidth: metrics.hairline)
                    }
                }
                .contentShape(.capsule)
        }
        .buttonStyle(.plain)
        .focused($focused)
        .onPreferenceChange(FollowTextWidthKey.self) { textWidth = $0 > 0 ? $0 : nil }
        .motionAnimation(.base, value: textWidth)
        .motionAnimation(.base, value: shown)
        .onHover { inside in
            hovering = inside
            if !inside { settled = false }
        }
        .onChange(of: focused) { _, isFocused in if !isFocused { settled = false } }
        .accessibilityLabel(Self.spokenLabel(following: following, previewing: previewing, name: name))
    }
}

private struct FollowTextWidthKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = max(value, nextValue()) }
}

#Preview("FollowButton") {
    struct Demo: View {
        @State private var a = false
        @State private var b = true
        var body: some View {
            HStack {
                FollowButton(following: $a, name: "Ava")
                FollowButton(following: $b, name: "Ben")
            }
        }
    }
    return Demo()
}
