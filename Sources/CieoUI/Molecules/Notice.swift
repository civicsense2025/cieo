import SwiftUI

public struct Notice: View {
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let symbol: String

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String = "info.circle") {
        self.title = title; self.detail = detail; self.symbol = symbol
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: Metrics.compact) {
            Label(title, systemImage: symbol).font(.headline)
            Text(detail).foregroundStyle(.secondary)
        }.frame(maxWidth: .infinity, alignment: .leading)
            .accessibilityElement(children: .combine)
    }
}
