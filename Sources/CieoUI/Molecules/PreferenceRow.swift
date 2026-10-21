import SwiftUI

public struct PreferenceRow: View {
    @Environment(\.componentMetrics) private var metrics
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
            Heading(title, detail: detail, level: .heading, isHeader: false)
        }
        .frame(minHeight: metrics.touchTarget)
    }
}
