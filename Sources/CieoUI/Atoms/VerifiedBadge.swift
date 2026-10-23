import SwiftUI

/// A small seal with a check that marks an account as verified. The host decides who is verified; this
/// only draws it. The glyph comes from the `verified` icon slot and is read as "Verified".
public struct VerifiedBadge: View {
    /// `sm` sits inline with caption text, `md` with body text.
    public enum Size: String, Sendable, CaseIterable { case sm, md }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    private let label: Text
    private let size: Size

    /// Unknown size names fall back to `md`, the same as the web twin.
    public static func size(_ raw: String?) -> Size {
        raw == Size.sm.rawValue ? .sm : .md
    }

    /// `label` is the spoken name; it defaults to "Verified".
    public init(label: Text = Text("Verified"), size: Size = .md) {
        self.label = label
        self.size = size
    }

    public init(label: LocalizedStringKey, size: Size = .md) {
        self.init(label: Text(label), size: size)
    }

    public var body: some View {
        InlineGlyph(font: size == .sm ? typography.detail : typography.body) { icons(.verified) }
            .font(size == .sm ? typography.detail : typography.body)
            .foregroundStyle(theme.accent)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(label)
            .accessibilityAddTraits(.isImage)
    }
}
