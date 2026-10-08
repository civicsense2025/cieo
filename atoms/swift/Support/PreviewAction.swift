import SwiftUI

/// Example calls to action acknowledge activation without pretending to perform a business operation.
public struct PreviewAction: View {
    private let title: LocalizedStringKey
    @State private var presented = false

    public init(_ title: LocalizedStringKey) {
        self.title = title
    }

    public var body: some View {
        Button(title) { presented = true }
            .accessibilityHint("Shows local example feedback.")
            .popover(isPresented: $presented) {
                VStack(alignment: .leading, spacing: 16) {
                    Label("Action received", systemImage: "checkmark.circle.fill").font(.headline)
                    Text(title).font(.body.weight(.medium))
                    Text("This preview confirms the tap. Connect this control to your app's action and show its pending, success and failure states.")
                        .foregroundStyle(.secondary)
                    Button("Done") { presented = false }
                }
                .padding(24)
                .frame(idealWidth: 320, maxWidth: 400)
                .tint(Color.primary)
            }
    }
}
