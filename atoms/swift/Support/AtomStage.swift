import SwiftUI

/// Shared borderless preview spacing. The host owns width and scrolling.
public struct AtomStage<Content: View>: View {
    let hint: String?
    let content: Content

    public init(hint: String? = nil, @ViewBuilder content: () -> Content) {
        self.hint = hint
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 12) {
            content.frame(maxWidth: .infinity)
            if let hint {
                Text(hint).font(.caption).foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .frame(minHeight: 280)
    }
}
