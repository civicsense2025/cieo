import SwiftUI

public struct PreferenceRow: View {
    private let title: LocalizedStringKey
    private let detail: LocalizedStringKey
    @Binding private var isOn: Bool

    public init(_ title: LocalizedStringKey, detail: LocalizedStringKey, isOn: Binding<Bool>) {
        self.title = title
        self.detail = detail
        _isOn = isOn
    }

    public var body: some View {
        Toggle(isOn: $isOn) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.headline)
                Text(detail).font(.subheadline).foregroundStyle(.secondary)
            }
        }
        .frame(minHeight: Metrics.touchTarget)
    }
}
