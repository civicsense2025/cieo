import SwiftUI

/// A person beside their name: a portrait, the name in one line, and one detail line such as
/// "R-W.Va. · Sponsor". `compact` is a roll-call entry: a small portrait, the name and a quiet state on one line.
/// VoiceOver reads it as one element.
public struct PersonRow<Photo: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    private let name: Text
    private let detail: Text?
    private let ring: Color?
    private let compact: Bool
    private let grayscale: Bool
    private let photo: () -> Photo

    public init(_ name: Text, detail: Text? = nil, ring: Color? = nil, compact: Bool = false, grayscale: Bool = false,
                @ViewBuilder photo: @escaping () -> Photo) {
        self.name = name; self.detail = detail; self.ring = ring; self.compact = compact
        self.grayscale = grayscale; self.photo = photo
    }

    public var body: some View {
        Group {
            if compact {
                HStack(spacing: metrics.compact) {
                    Portrait(size: .small, ring: ring, grayscale: grayscale, photo: photo)
                    (name + (detail.map { Text(verbatim: " ") + $0.foregroundColor(theme.secondary) } ?? Text(verbatim: "")))
                        .font(typography.detail)
                        .lineLimit(1)
                }
            } else {
                HStack(spacing: metrics.medium) {
                    Portrait(size: .regular, ring: ring, grayscale: grayscale, photo: photo)
                    VStack(alignment: .leading, spacing: metrics.tight) {
                        name.font(typography.strongBody).lineLimit(1).fixedSize()
                        if let detail { detail.font(typography.detail).foregroundStyle(theme.secondary) }
                    }
                }
            }
        }
        .foregroundStyle(theme.foreground)
        .accessibilityElement(children: .combine)
    }
}

public extension PersonRow where Photo == EmptyView {
    init(_ name: Text, detail: Text? = nil, ring: Color? = nil, compact: Bool = false) {
        self.init(name, detail: detail, ring: ring, compact: compact, grayscale: false) { EmptyView() }
    }
}
