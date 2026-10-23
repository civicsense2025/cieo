import SwiftUI

/// Opens the system share sheet for a link. Only absolute http and https links are ever shared; any other
/// link (or none) draws the button disabled. The host owns the URL and any analytics.
public struct ShareButton: View {
    @Environment(\.componentIcons) private var icons
    private let url: URL?
    private let subject: String?
    private let message: String?
    private let label: LocalizedStringKey

    /// `subject` and `message` go to the share sheet; `label` is the visible word, "Share" by default.
    public init(_ url: URL?, subject: String? = nil, message: String? = nil, label: LocalizedStringKey = "Share") {
        self.url = url.flatMap { Self.isShareableURL($0) ? $0 : nil }
        self.subject = subject
        self.message = message
        self.label = label
    }

    public init(urlString: String, subject: String? = nil, message: String? = nil, label: LocalizedStringKey = "Share") {
        self.init(URL(string: urlString), subject: subject, message: message, label: label)
    }

    /// True only for absolute http and https URLs; anything else (javascript:, data:, relative paths) is never shared.
    public static func isShareableURL(_ url: URL) -> Bool {
        guard let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" else { return false }
        return url.host?.isEmpty == false
    }

    public static func isShareableURL(_ string: String) -> Bool {
        URL(string: string).map { isShareableURL($0) } ?? false
    }

    private var content: some View {
        HStack(alignment: .firstTextBaseline) {
            InlineGlyph { icons(.share) }.accessibilityHidden(true)
            Text(label)
        }
    }

    public var body: some View {
        if let url {
            ShareLink(item: url, subject: subject.map { Text($0) }, message: message.map { Text($0) }) { content }
                .buttonStyle(ActionButtonStyle(.quiet))
        } else {
            Button {} label: { content }
                .buttonStyle(ActionButtonStyle(.quiet))
                .disabled(true)
        }
    }
}

#Preview("ShareButton") {
    VStack {
        ShareButton(urlString: "https://example.com/post/1", subject: "A post")
        ShareButton(urlString: "javascript:alert(1)")
    }
}
