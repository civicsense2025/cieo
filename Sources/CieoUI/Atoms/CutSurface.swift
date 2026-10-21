import SwiftUI

/// A photo or flat colour block cut into a `CutShape`. With no content it is a plain block of `fill`.
/// Content fills the frame and is clipped, so a resizable, `scaledToFill` image keeps its proportions.
public struct CutSurface<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    private let kind: CutShape.Kind
    private let fill: Color?
    private let content: Content
    private let isDecorative: Bool

    public init(_ kind: CutShape.Kind, fill: Color? = nil, @ViewBuilder content: () -> Content) {
        self.kind = kind
        self.fill = fill
        self.content = content()
        self.isDecorative = Content.self == EmptyView.self
    }

    public var body: some View {
        Rectangle().fill(fill ?? theme.surface)
            .overlay { content }
            .clipShape(CutShape(kind))
            .contentShape(CutShape(kind))
            .accessibilityHidden(isDecorative)
    }
}

public extension CutSurface where Content == EmptyView {
    /// A decorative colour block. It is hidden from assistive technologies.
    init(_ kind: CutShape.Kind, fill: Color? = nil) {
        self.init(kind, fill: fill) { EmptyView() }
    }
}
