import SwiftUI

/// Content and recovery belong to the caller; no network or session state is inferred.
public struct StatePanel<Actions: View>: View {
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    private let symbol: String
    private let actions: Actions

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, symbol: String,
                @ViewBuilder actions: () -> Actions)
    {
        self.title = title; self.detail = detail; self.symbol = symbol; self.actions = actions()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: Metrics.standard) {
            SymbolMark(symbol)
            Text(title).font(.title2.bold()).accessibilityAddTraits(.isHeader)
            Text(detail).foregroundStyle(.secondary)
            actions.buttonStyle(ActionButtonStyle())
        }.padding(.vertical, Metrics.compact).frame(maxWidth: .infinity, alignment: .leading)
    }
}
