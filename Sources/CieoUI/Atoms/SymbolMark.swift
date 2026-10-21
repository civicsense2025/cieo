import SwiftUI

/// Decorative glyph; the adjacent text owns meaning and the accessible name.
public struct SymbolMark: View {
    private let symbol: String
    @ScaledMetric private var size: CGFloat
    public init(_ symbol: String, size: CGFloat = 28) { // literal-ok: default glyph size; no typography role is a fixed point size
        self.symbol = symbol
        _size = ScaledMetric(wrappedValue: size, relativeTo: .title2)
    }

    public var body: some View {
        Image(systemName: symbol).font(.system(size: size)).accessibilityHidden(true) // literal-ok: the caller's symbol and size are the content, not a component style
    }
}
