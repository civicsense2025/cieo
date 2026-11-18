import SwiftUI

/// Password field with multi-segment strength meter and accessible show/hide toggle.
public struct AuthPasswordField: View {
    private static let segmentCount = 4

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    @Binding private var text: String
    @State private var isRevealed = false
    private let error: Text?

    public init(text: Binding<String>, error: Text? = nil) {
        _text = text
        self.error = error
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            Text(verbatim: strings.passwordTitle)
                .font(typography.fieldLabel)
                .foregroundStyle(theme.foreground)
            HStack(spacing: metrics.compact) {
                Group {
                    if isRevealed {
                        TextField(strings.passwordTitle, text: $text)
                    } else {
                        SecureField(strings.passwordTitle, text: $text)
                    }
                }
                .textFieldStyle(.plain)
                .font(typography.field)
                Button {
                    isRevealed.toggle()
                } label: {
                    HStack(spacing: metrics.tight) {
                        InlineGlyph { icons(isRevealed ? .eyeOff : .eye) }
                            .accessibilityHidden(true)
                        Text(verbatim: isRevealed ? strings.passwordHide : strings.passwordShow)
                            .font(typography.strongDetail)
                    }
                    .foregroundStyle(theme.secondary)
                    .frame(minHeight: metrics.touchTarget)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(verbatim: isRevealed ? strings.passwordHideLabel : strings.passwordShowLabel))
            }
            .fieldChrome(appearance: ControlAppearance(border: error != nil ? theme.danger : theme.border))
            strengthMeter
            if let error {
                StatusLabel(error, icon: .error, tone: .danger)
            }
        }
        .accessibilityElement(children: .contain)
    }

    private var strengthMeter: some View {
        let score = Self.strengthScore(text)
        let (label, color) = strengthDisplay(score)
        return HStack(spacing: metrics.compact) {
            HStack(spacing: metrics.tight) {
                ForEach(0..<Self.segmentCount, id: \.self) { index in
                    Capsule()
                        .fill(index < score ? color : theme.track)
                        .frame(height: metrics.thinBar)
                }
            }
            .motionAnimation(motionConfig.progress, value: score)
            Text(verbatim: label)
                .font(typography.detail)
                .foregroundStyle(theme.secondary)
                .fixedSize()
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(verbatim: strings.passwordStrengthLabel))
        .accessibilityValue(Text(verbatim: label))
    }

    private func strengthDisplay(_ score: Int) -> (String, Color) {
        switch score {
        case 0: (strings.passwordStrengthTooWeak, theme.danger)
        case 1: (strings.passwordStrengthWeak, theme.warning)
        case 2: (strings.passwordStrengthOkay, theme.warning)
        case 3: (strings.passwordStrengthStrong, theme.success)
        default: (strings.passwordStrengthVeryStrong, theme.success)
        }
    }

    /// Computes a password strength score from `0` (too weak) to `4` (very strong).
    public static func strengthScore(_ password: String) -> Int {
        let minLength = 8 // literal-ok: minimum password length policy, not styling
        guard password.count >= minLength else { return 0 }
        var score = 1
        if password.contains(where: \.isUppercase) && password.contains(where: \.isLowercase) { score += 1 }
        if password.contains(where: \.isNumber) { score += 1 }
        let specials = CharacterSet.alphanumerics.inverted
        if password.unicodeScalars.contains(where: specials.contains) { score += 1 }
        return min(Self.segmentCount, score)
    }
}
