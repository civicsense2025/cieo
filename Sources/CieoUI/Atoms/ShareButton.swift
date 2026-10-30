import SwiftUI

/// Opens the system share sheet for a link. Only absolute http and https links are ever shared; any other
/// link (or none) draws the button disabled. The host owns the URL and any analytics.
public struct ShareButton: View {
    /// How the button draws itself. `.iconOnly` shows just the share glyph at a full touch target and
    /// speaks the label instead, for toolbars and dense action rows.
    public enum Display: Sendable {
        case labeled
        case iconOnly
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    /// The link the sheet shares, or nil when the given link was refused.
    let url: URL?
    private let subject: String?
    private let message: String?
    private let label: LocalizedStringKey
    let display: Display

    /// `subject` and `message` go to the share sheet; `label` is the visible word, "Share" by default, and
    /// the spoken name when `display` is `.iconOnly`.
    public init(_ url: URL?, subject: String? = nil, message: String? = nil, label: LocalizedStringKey = "Share",
                display: Display = .labeled) {
        self.url = url.flatMap { Self.isShareableURL($0) ? $0 : nil }
        self.subject = subject
        self.message = message
        self.label = label
        self.display = display
    }

    public init(urlString: String, subject: String? = nil, message: String? = nil, label: LocalizedStringKey = "Share",
                display: Display = .labeled) {
        self.init(URL(string: urlString), subject: subject, message: message, label: label, display: display)
    }

    /// True only for absolute http and https URLs; anything else (javascript:, data:, relative paths) is never shared.
    public static func isShareableURL(_ url: URL) -> Bool {
        guard let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" else { return false }
        return url.host?.isEmpty == false
    }

    public static func isShareableURL(_ string: String) -> Bool {
        URL(string: string).map { isShareableURL($0) } ?? false
    }

    private var glyph: some View {
        InlineGlyph { icons(.share) }.accessibilityHidden(true)
    }

    @ViewBuilder
    private var content: some View {
        switch display {
        case .labeled:
            HStack(alignment: .firstTextBaseline) {
                glyph
                Text(label)
            }
        case .iconOnly:
            glyph
                .font(typography.glyph)
                .foregroundStyle(theme.secondary)
                .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                .contentShape(.rect)
        }
    }

    @ViewBuilder
    private var control: some View {
        if let url {
            ShareLink(item: url, subject: subject.map { Text($0) }, message: message.map { Text($0) }) { content }
        } else {
            Button {} label: { content }
                .disabled(true)
        }
    }

    public var body: some View {
        switch display {
        case .labeled:
            control.buttonStyle(ActionButtonStyle(.quiet))
        case .iconOnly:
            control.buttonStyle(.plain)
                .accessibilityLabel(Text(label))
        }
    }
}

#Preview("ShareButton") {
    VStack {
        ShareButton(urlString: "https://example.com/post/1", subject: "A post")
        ShareButton(urlString: "https://example.com/post/1", display: .iconOnly)
        ShareButton(urlString: "javascript:alert(1)")
    }
}
