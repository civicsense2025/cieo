import SwiftUI

/// The edge of a frame: one piece on the leading side and one on the trailing side, such as a topic chip and a
/// page count along the top, or a wordmark and a source along the bottom. The trailing piece wraps under the
/// leading one when the width is too narrow, so neither truncates.
public struct FrameBar<Leading: View, Trailing: View>: View {
    public enum Edge: Sendable { case top, bottom }

    @Environment(\.componentMetrics) private var metrics
    private let edge: Edge
    private let leading: Leading
    private let trailing: Trailing

    public init(_ edge: Edge = .top, @ViewBuilder leading: () -> Leading, @ViewBuilder trailing: () -> Trailing) {
        self.edge = edge; self.leading = leading(); self.trailing = trailing()
    }

    public var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: edge == .top ? .center : .bottom, spacing: metrics.loose) {
                leading.fixedSize()
                Spacer(minLength: metrics.medium)
                trailing.multilineTextAlignment(.trailing)
            }
            VStack(alignment: .leading, spacing: metrics.compact) { leading; trailing }
        }
    }
}
