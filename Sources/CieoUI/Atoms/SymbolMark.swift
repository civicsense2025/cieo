import SwiftUI

/// Decorative glyph; the adjacent text owns meaning and the accessible name.
public struct SymbolMark: View {
    private let symbol: String
    @ScaledMetric(relativeTo: .title2) private var size = 28
    public init(_ symbol: String) {
        self.symbol = symbol
    }

    public var body: some View {
        Image(systemName: symbol).font(.system(size: size)).accessibilityHidden(true)
    }
}
