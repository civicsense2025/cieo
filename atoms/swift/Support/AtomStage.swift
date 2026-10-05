import SwiftUI

/// The neutral frame every Swift atom renders in: fixed size, card background, and a one-line hint.
public struct AtomStage<Content: View>: View {
    let hint: String?
    let content: Content

    public init(hint: String? = nil, @ViewBuilder content: () -> Content) {
        self.hint = hint
        self.content = content()
    }

    public var body: some View {
        VStack(spacing: 12) {
            content.frame(maxWidth: .infinity, maxHeight: .infinity)
            if let hint {
                Text(hint).font(.caption).foregroundStyle(.secondary)
            }
        }
        .padding(20)
        .frame(minWidth: 320, minHeight: 280)
    }
}
