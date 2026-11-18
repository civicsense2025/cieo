import SwiftUI

/// OTP verification code input field that sanitizes typed and pasted text to ASCII digits 0-9 (other scripts map to their ASCII value).
public struct AuthOtpInput: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    @Binding private var code: String
    @State private var fieldText: String
    @FocusState private var isFocused: Bool
    private let length: Int
    private let error: Text?
    private let onComplete: ((String) -> Void)?

    public init(
        code: Binding<String>,
        length: Int = 6,
        error: Text? = nil,
        onComplete: ((String) -> Void)? = nil
    ) {
        _code = code
        let resolvedLength = max(1, min(12, length))
        _fieldText = State(initialValue: Self.sanitize(code.wrappedValue, length: resolvedLength))
        self.length = resolvedLength
        self.error = error
        self.onComplete = onComplete
    }

    public var body: some View {
        let sanitized = Self.sanitize(code, length: length)

        VStack(alignment: .leading, spacing: metrics.compact) {
            Text(verbatim: strings.otpTitle)
                .font(typography.fieldLabel)
                .foregroundStyle(theme.foreground)
            ZStack(alignment: .leading) {
                TextField(strings.otpTitle, text: $fieldText)
                    .textFieldStyle(.plain)
                    .focused($isFocused)
                    #if os(iOS)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    #elseif os(macOS)
                    .textContentType(.oneTimeCode)
                    #endif
                    // The real field stays in the accessibility tree (VoiceOver reads and edits the code through it); it is only hidden visually.
                    .foregroundStyle(Color.clear)
                    .tint(Color.clear)
                    .onChange(of: fieldText) { _, typed in
                        let clean = Self.sanitize(typed, length: length)
                        if typed != clean { fieldText = clean }
                        if code != clean {
                            code = clean
                            if clean.count == length { onComplete?(clean) }
                        }
                    }
                    .onChange(of: code) { _, external in
                        let clean = Self.sanitize(external, length: length)
                        if fieldText != clean { fieldText = clean }
                    }
                HStack(spacing: metrics.compact) {
                    ForEach(0..<length, id: \.self) { index in
                        digitCell(at: index, in: sanitized)
                    }
                }
                .contentShape(Rectangle())
                .onTapGesture { isFocused = true }
                .accessibilityHidden(true)
            }
            if let error {
                StatusLabel(error, icon: .error, tone: .danger)
            }
        }
        .motionAnimation(motionConfig.selection, value: sanitized)
        .accessibilityElement(children: .contain)
    }

    private func digitCell(at index: Int, in sanitized: String) -> some View {
        let char = index < sanitized.count
            ? String(sanitized[sanitized.index(sanitized.startIndex, offsetBy: index)])
            : ""
        let isActiveCursor = isFocused && index == min(sanitized.count, length - 1)
        let borderColor: Color = error != nil
            ? theme.danger
            : (isActiveCursor ? theme.focus : (char.isEmpty ? theme.border : theme.accent))
        return Text(verbatim: char)
            .font(typography.value)
            .foregroundStyle(theme.foreground)
            .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
            .background(theme.surface, in: .rect(cornerRadius: metrics.corner))
            .componentBorder(borderColor, width: metrics.hairline, cornerRadius: metrics.corner)
    }

    /// Strips non-digits and truncates to `length`.
    public static func sanitize(_ input: String, length: Int) -> String {
        var digits = ""
        for scalar in input.unicodeScalars where scalar.properties.numericType == .decimal {
            guard let value = scalar.properties.numericValue, (0...9).contains(value) else { continue }
            digits.append(String(Int(value)))
            if digits.count >= max(0, length) { break }
        }
        return digits
    }
}
