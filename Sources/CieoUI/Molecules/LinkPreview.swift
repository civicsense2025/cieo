import SwiftUI

/// A link card: lead image, site and title. The host fetches the metadata; this draws it safely. The
/// whole card is one link for http(s) addresses and a plain card otherwise. While `loading` a
/// skeleton with the same footprint stands in, then cross-fades to the content.
public struct LinkPreview: View {
    /// `large` puts a 16:9 image on top; `compact` puts a square thumbnail on the left.
    public enum Variant: Sendable, CaseIterable { case large, compact }

    /// A lead image. Only absolute http(s) addresses load.
    public struct Image: Equatable, Sendable {
        public let src: String
        /// Text alternative; empty when the title already says it.
        public let alt: String
        public init(src: String, alt: String = "") { self.src = src; self.alt = alt }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.dynamicTypeSize) private var typeSize
    private let url: String
    private let title: String
    private let siteName: String?
    private let summary: String?
    private let image: Image?
    private let favicon: String?
    private let variant: Variant
    private let loading: Bool

    /// The host name without a leading "www.", or an empty string when the address is not http(s).
    public static func displayDomain(_ url: String?) -> String {
        guard let parsed = URL(string: (url ?? "").trimmingCharacters(in: .whitespacesAndNewlines)),
              let scheme = parsed.scheme?.lowercased(), scheme == "http" || scheme == "https",
              let host = parsed.host(percentEncoded: false) else { return "" }
        return host.lowercased().hasPrefix("www.") ? String(host.dropFirst(4)) : host
    }

    /// `summary` shows on the large card only. `siteName` defaults to the domain.
    public init(url: String, title: String, siteName: String? = nil, summary: String? = nil, image: Image? = nil,
                favicon: String? = nil, variant: Variant = .large, loading: Bool = false) {
        self.url = url; self.title = title; self.siteName = siteName; self.summary = summary
        self.image = image; self.favicon = favicon; self.variant = variant; self.loading = loading
    }

    private var destination: URL? { Mention.safeURL(url, allowRelative: false) }
    private var site: String { (siteName?.isEmpty == false ? siteName : nil) ?? Self.displayDomain(url) }

    public var body: some View {
        ZStack {
            if loading {
                layout(media: theme.track, site: Text("example.com"), title: Text(String(repeating: "Placeholder title ", count: 2)),
                       summary: nil)
                    .redacted(reason: .placeholder)
                    .transition(.opacity)
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel("Loading link preview")
            } else if let destination {
                Link(destination: destination) { content }
                    .buttonStyle(.plain)
                    .transition(.opacity)
            } else {
                content.transition(.opacity)
            }
        }
        .motion(.base, value: loading)
    }

    private var content: some View {
        layout(media: mediaView, site: siteRow, title: Text(title), summary: variant == .large ? summary.map { Text($0) } : nil)
            .accessibilityElement(children: .combine)
    }

    @ViewBuilder
    private func layout(media: some View, site: some View, title: Text, summary: Text?) -> some View {
        let stacked = variant == .large || typeSize.isAccessibilitySize
        Group {
            if stacked {
                VStack(alignment: .leading, spacing: 0) { // literal-ok: flush stack, the pieces touch by design
                    if showsMedia { frame16x9(media) }
                    text(site: site, title: title, summary: summary)
                }
            } else {
                HStack(alignment: .top, spacing: 0) { // literal-ok: flush stack, the pieces touch by design
                    if showsMedia { media.frame(width: metrics.thumbnail, height: metrics.thumbnail).clipped() }
                    text(site: site, title: title, summary: summary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(theme.surface, in: .rect(cornerRadius: metrics.corner))
        .clipShape(.rect(cornerRadius: metrics.corner))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
    }

    private var showsMedia: Bool { loading || (image.flatMap { Mention.safeURL($0.src, allowRelative: false) } != nil) }

    private func frame16x9(_ media: some View) -> some View {
        Color.clear
            .aspectRatio(16.0 / 9.0, contentMode: .fit) // literal-ok: the large card's image is 16:9 by definition
            .overlay { media }
            .clipped()
    }

    private func text(site: some View, title: Text, summary: Text?) -> some View {
        VStack(alignment: .leading, spacing: metrics.tight) {
            site
            title.font(typography.strongBody).foregroundStyle(theme.foreground)
                .lineLimit(2).multilineTextAlignment(.leading)
            if let summary {
                summary.font(typography.detail).foregroundStyle(theme.secondary)
                    .lineLimit(2).multilineTextAlignment(.leading)
            }
        }
        .padding(metrics.medium)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder
    private var siteRow: some View {
        let icon = Mention.safeURL(favicon, allowRelative: false)
        if icon != nil || !site.isEmpty {
            HStack(spacing: metrics.tight) {
                if let icon {
                    AsyncImage(url: icon) { phase in
                        if let loaded = phase.image { loaded.resizable().scaledToFit() } else { Color.clear }
                    }
                    .frame(width: metrics.avatarSmall / 2, height: metrics.avatarSmall / 2)
                    .accessibilityHidden(true)
                }
                if !site.isEmpty {
                    Text(site).font(typography.detail).foregroundStyle(theme.secondary).lineLimit(1)
                }
            }
        }
    }

    @ViewBuilder
    private var mediaView: some View {
        if let image, let source = Mention.safeURL(image.src, allowRelative: false) {
            AsyncImage(url: source) { phase in
                switch phase {
                case .success(let loaded):
                    loaded.resizable().scaledToFill().transition(.opacity)
                default:
                    // Same footprint while loading or if it fails, so the card never jumps.
                    theme.track.overlay { InlineGlyph { icons(.link) }.foregroundStyle(theme.secondary).font(typography.prominentGlyph) }
                }
            }
            .accessibilityLabel(image.alt)
            .accessibilityHidden(image.alt.isEmpty)
        }
    }
}
