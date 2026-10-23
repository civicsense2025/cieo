import SwiftUI

/// Plain post text turned into safe inline text: links, @mentions, #tags and line breaks. It never
/// interprets markup, and only http(s) addresses become links. Links shorten to their site and path
/// while the full address stays the link target, so a long URL never takes over a post.
public struct RichText: View {
    /// What a run of the text is.
    public enum TokenKind: String, Sendable, CaseIterable { case text, url, mention, tag, lineBreak }

    /// One piece of the text. Joining every `value` rebuilds the original (line breaks as newlines).
    public struct Token: Equatable, Sendable {
        public let kind: TokenKind
        /// The text as written; a URL keeps its original spelling.
        public let value: String
        /// The full address for `url` tokens, always http or https.
        public let href: String?
        public init(kind: TokenKind, value: String, href: String? = nil) {
            self.kind = kind; self.value = value; self.href = href
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    private let text: String
    private let maxUrlLength: Int
    private let mentionURL: ((String) -> String?)?
    private let tagURL: ((String) -> String?)?

    // MARK: Pure helpers

    private static let trailing: Set<Character> = [".", ",", ";", ":", "!", "?", "\"", "'", "’", "”", "…", "]", "}"]

    /// Splits a matched address from the punctuation that ends the sentence around it: sentence
    /// punctuation, and a closing parenthesis only when it has no opening partner in the address.
    public static func trimUrl(_ raw: String) -> (url: String, rest: String) {
        var chars = Array(raw)
        while let last = chars.last {
            let closesStray = last == ")" && chars.filter { $0 == ")" }.count > chars.filter { $0 == "(" }.count
            if trailing.contains(last) || closesStray { chars.removeLast() } else { break }
        }
        let url = String(chars)
        return (url, String(raw.dropFirst(url.count)))
    }

    private static let localhost = try! NSRegularExpression(pattern: "^https?://localhost\\b", options: [.caseInsensitive])
    private static let scheme = try! NSRegularExpression(pattern: "^https?://", options: [.caseInsensitive])

    private static func href(for url: String) -> String? {
        let full = matches(scheme, url) ? url : "https://" + url
        guard let safe = Mention.safeURL(full, allowRelative: false) else { return nil }
        let hasDot = safe.host(percentEncoded: false)?.contains(".") ?? false
        return hasDot || matches(localhost, full) ? full : nil
    }

    private static func matches(_ regex: NSRegularExpression, _ value: String) -> Bool {
        regex.firstMatch(in: value, range: NSRange(value.startIndex..., in: value)) != nil
    }

    private static let pattern: NSRegularExpression = {
        let source = [
            "(?<break>\\r\\n|\\r|\\n)",
            "(?<url>https?:\\/\\/[^\\s<>]+|(?<![\\p{L}\\p{N}_@./:#%-])(?:www\\.)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,}\\/[^\\s<>]*)",
            "(?<mention>(?<![\\p{L}\\p{N}_@./:#&])@[\\p{L}\\p{N}_](?:[\\p{L}\\p{N}_.]{0,28}[\\p{L}\\p{N}_])?)",
            "(?<tag>(?<![\\p{L}\\p{N}_&#/])#\\p{L}[\\p{L}\\p{N}_]*)",
        ].joined(separator: "|")
        return try! NSRegularExpression(pattern: source, options: [.caseInsensitive])
    }()

    /// Splits post text into text, url, mention, tag and line-break tokens. The same input always gives
    /// the same tokens; URLs shed trailing punctuation; emails and mid-word "@" are not mentions; and a
    /// scheme other than http(s) never becomes a link.
    public static func tokenizeRichText(_ text: String?) -> [Token] {
        let source = text ?? ""
        var out: [Token] = []
        func pushText(_ value: String) {
            if value.isEmpty { return }
            if let prev = out.last, prev.kind == .text {
                out[out.count - 1] = Token(kind: .text, value: prev.value + value)
            } else {
                out.append(Token(kind: .text, value: value))
            }
        }
        let ns = source as NSString
        var cursor = 0
        for match in pattern.matches(in: source, range: NSRange(location: 0, length: ns.length)) {
            pushText(ns.substring(with: NSRange(location: cursor, length: match.range.location - cursor)))
            cursor = match.range.location + match.range.length
            func group(_ name: String) -> String? {
                let r = match.range(withName: name)
                return r.location == NSNotFound ? nil : ns.substring(with: r)
            }
            if group("break") != nil {
                out.append(Token(kind: .lineBreak, value: "\n"))
            } else if let raw = group("url") {
                let (url, rest) = trimUrl(raw)
                if let href = href(for: url) {
                    out.append(Token(kind: .url, value: url, href: href))
                    pushText(rest)
                } else {
                    pushText(raw)
                }
            } else if let mention = group("mention") {
                out.append(Token(kind: .mention, value: mention))
            } else if let tag = group("tag") {
                out.append(Token(kind: .tag, value: tag))
            }
        }
        pushText(ns.substring(from: cursor))
        return out
    }

    /// The display form of an address: no scheme, no "www.", no trailing slash, and the end ellipsized so
    /// the result is at most `max` characters (counted as Unicode scalars, as the web twin does).
    public static func shortenUrl(_ url: String?, max: Int = 28) -> String {
        var bare = (url ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        if let r = bare.range(of: "^[a-z][a-z0-9+.-]*://", options: [.regularExpression, .caseInsensitive]) { bare.removeSubrange(r) }
        if let r = bare.range(of: "^www\\.", options: [.regularExpression, .caseInsensitive]) { bare.removeSubrange(r) }
        if bare.hasSuffix("/") { bare.removeLast() }
        let limit = Swift.max(1, max)
        let scalars = Array(bare.unicodeScalars)
        if scalars.count <= limit { return bare }
        var view = String.UnicodeScalarView()
        view.append(contentsOf: scalars.prefix(limit - 1))
        return String(view) + "…"
    }

    /// The styled text for `text`: link runs carry the shortened text with the full address as the link;
    /// mentions and tags become links only when the host's closure gives a safe address.
    public static func attributedString(_ text: String?, maxUrlLength: Int = 28, accent: Color? = nil,
                                        mentionURL: ((String) -> String?)? = nil,
                                        tagURL: ((String) -> String?)? = nil) -> AttributedString {
        var result = AttributedString()
        for token in tokenizeRichText(text) {
            var run: AttributedString
            switch token.kind {
            case .text:
                run = AttributedString(token.value)
            case .lineBreak:
                run = AttributedString("\n")
            case .url:
                run = AttributedString(shortenUrl(token.value, max: maxUrlLength))
                if let href = token.href { run.link = URL(string: href) }
            case .mention:
                run = AttributedString(token.value)
                if let url = Mention.safeURL(mentionURL?(String(token.value.dropFirst()))) { run.link = url }
                if let accent { run.foregroundColor = accent }
            case .tag:
                run = AttributedString(token.value)
                if let url = Mention.safeURL(tagURL?(String(token.value.dropFirst()))) { run.link = url }
                if let accent { run.foregroundColor = accent }
            }
            result.append(run)
        }
        return result
    }

    /// `mentionURL` and `tagURL` build a profile or tag address from the handle or tag (without "@" or
    /// "#"). Without them mentions are plain text and tags are not links. `maxUrlLength` is the longest
    /// visible link text before it is ellipsized.
    public init(_ text: String, maxUrlLength: Int = 28, mentionURL: ((String) -> String?)? = nil,
                tagURL: ((String) -> String?)? = nil) {
        self.text = text
        self.maxUrlLength = maxUrlLength
        self.mentionURL = mentionURL
        self.tagURL = tagURL
    }

    public var body: some View {
        Text(Self.attributedString(text, maxUrlLength: maxUrlLength, accent: theme.accent,
                                   mentionURL: mentionURL, tagURL: tagURL))
            .font(typography.body)
            .foregroundStyle(theme.foreground)
            .tint(theme.accent)
    }
}
