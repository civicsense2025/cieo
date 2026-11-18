import Cieo
import SwiftUI

/// Composed authentication card combining email `LabeledTextInput`, `AuthPasswordField`,
/// optional `AuthOtpInput` verification step, and `ActionButton(phase:)` with `MotionHaptic` feedback.
public struct AuthSignInCard: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentMotion) private var motionConfig

    private let title: LocalizedStringKey
    private let subtitle: LocalizedStringKey?
    private let submitTitle: LocalizedStringKey
    @Binding private var email: String
    @Binding private var password: String
    private let requiresOtp: Bool
    @Binding private var otpCode: String
    private let emailError: LocalizedStringKey?
    private let passwordError: Text?
    private let otpError: Text?
    private let phase: AsyncActionPhase
    private let onSubmit: () -> Void

    public init(
        title: LocalizedStringKey = "Sign in",
        subtitle: LocalizedStringKey? = nil,
        submitTitle: LocalizedStringKey = "Continue",
        email: Binding<String>,
        password: Binding<String>,
        requiresOtp: Bool = false,
        otpCode: Binding<String> = .constant(""),
        emailError: LocalizedStringKey? = nil,
        passwordError: Text? = nil,
        otpError: Text? = nil,
        phase: AsyncActionPhase = .idle,
        onSubmit: @escaping () -> Void
    ) {
        self.title = title
        self.subtitle = subtitle
        self.submitTitle = submitTitle
        _email = email
        _password = password
        self.requiresOtp = requiresOtp
        _otpCode = otpCode
        self.emailError = emailError
        self.passwordError = passwordError
        self.otpError = otpError
        self.phase = phase
        self.onSubmit = onSubmit
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.standard) {
            Heading(title, detail: subtitle, level: .title)

            LabeledField("Email", text: $email, error: emailError)
                #if os(iOS)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)
                .textContentType(.username)
                #elseif os(macOS)
                .textContentType(.username)
                #endif

            AuthPasswordField(text: $password, error: passwordError)
                .textContentType(.password)

            if requiresOtp {
                AuthOtpInput(code: $otpCode, length: 6, error: otpError)
            }

            if let failure = phase.failureMessage {
                StatusLabel(failure, icon: .error, tone: .danger)
            }

            ActionButton(submitTitle, phase: phase, action: onSubmit)
        }
        .padding(metrics.section)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(theme.surface, in: .rect(cornerRadius: metrics.cornerSurface))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.cornerSurface)
        .motionAnimation(motionConfig.layout, value: requiresOtp)
        .motionHaptic(trigger: phase) { _, next in next.haptic }
        .accessibilityElement(children: .contain)
    }
}
