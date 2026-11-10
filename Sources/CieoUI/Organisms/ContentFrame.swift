import SwiftUI

/// One idea on one ground: a top bar (topic and page count), the content centred in the space between, and a
/// bottom bar (wordmark and source). Everything is left-aligned. `ground` chooses the role: `.page` for claims and
/// numbers, `.block` for someone's own words or a call to act (text switches to `onBlock`).
public struct ContentFrame<Top: View, Content: View, Bottom: View>: View {
    public enum Ground: Sendable { case page, block }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    private let ground: Ground
    private let top: Top
    private let content: Content
    private let bottom: Bottom

    public init(ground: Ground = .page, @ViewBuilder top: () -> Top, @ViewBuilder content: () -> Content,
                @ViewBuilder bottom: () -> Bottom) {
        self.ground = ground; self.top = top(); self.content = content(); self.bottom = bottom()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.section) {
            top
            Spacer(minLength: metrics.section)
            VStack(alignment: .leading, spacing: metrics.loose) { content }
                .frame(maxWidth: .infinity, alignment: .leading)
            Spacer(minLength: metrics.section)
            bottom
        }
        .padding(metrics.section)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(ground == .block ? theme.block : theme.background)
        .environment(\.componentTheme, framed)
    }

    /// On a block ground, foreground and secondary text take the block's partners, so atoms inside read correctly.
    private var framed: Theme {
        guard ground == .block else { return theme }
        var t = theme
        t.foreground = theme.onBlock
        t.secondary = theme.onBlockSecondary
        return t
    }
}
