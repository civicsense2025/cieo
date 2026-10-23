import SwiftUI

/// An "@handle" inside post text: a link when the host gives a safe address, plain text otherwise.
/// Post content is untrusted, so only http and https addresses (and, optionally, same-app paths the
/// host's `OpenURLAction` can route) ever become links.
public struct Mention: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    private let handle: String
    private let href: String?
    private let name: String?

    /// The handle without a leading "@" and surrounding space. Empty when the input is blank or has
    /// whitespace inside it.
    public static func normalizeHandle(_ raw: String?) -> String {
        let trimmed = (raw ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let bare = trimmed.hasPrefix("@") ? String(trimmed.dropFirst()) : trimmed
        if bare.isEmpty || bare.unicodeScalars.contains(where: { CharacterSet.whitespacesAndNewlines.contains($0) }) {
            return ""
        }
        return bare
    }

    /// The address when it is safe to open: http or https with a host, or (with `allowRelative`) a path,
    /// fragment or query that starts with "/", "#" or "?". Control characters, other schemes and
    /// protocol-relative forms ("//host", "/\\host") give nil.
    public static func safeURL(_ href: String?, allowRelative: Bool = true) -> URL? {
        guard let href else { return nil }
        let value = href.trimmingCharacters(in: .whitespacesAndNewlines)
        if value.isEmpty || value.unicodeScalars.contains(where: { $0.value < 0x20 || $0.value == 0x7f }) { return nil }
        if allowRelative, isRelative(value) { return URL(string: value) }
        guard let url = URL(string: value), let scheme = url.scheme?.lowercased(),
              scheme == "http" || scheme == "https",
              let host = url.host(percentEncoded: false), !host.isEmpty,
              url.user == nil, url.password == nil else { return nil }
        return url
    }

    private static func isRelative(_ value: String) -> Bool {
        guard let first = value.unicodeScalars.first else { return false }
        if first == "#" || first == "?" { return true }
        // Explicit same-app forms only; a bare "x.com/a" is almost always a mistyped outside address.
        if value.hasPrefix("./") || value.hasPrefix("../") { return true }
        guard first == "/" else { return false }
        let second = value.unicodeScalars.dropFirst().first
        return second != "/" && second != "\\"
    }

    /// `href` is the profile address; `name` is the person's display name, read as the accessibility hint.
    public init(handle: String, href: String? = nil, name: String? = nil) {
        self.handle = handle
        self.href = href
        self.name = name
    }

    public var body: some View {
        let clean = Self.normalizeHandle(handle)
        if !clean.isEmpty {
            let text = Text(verbatim: "@" + clean).font(typography.body).foregroundStyle(theme.accent)
            if let url = Self.safeURL(href) {
                Link(destination: url) { text }
                    .accessibilityHint(name.map { Text(verbatim: $0) } ?? Text(verbatim: ""))
            } else {
                text.accessibilityHint(name.map { Text(verbatim: $0) } ?? Text(verbatim: ""))
            }
        }
    }
}
