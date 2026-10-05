import SwiftUI
import MotionKit

public struct DismissibleAlertAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "alert", category: "Content", name: "Dismissible alert",
        summary: "Fades and blurs out first, then the space collapses so content below never jumps while text is still visible.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = true
    @State private var open = true
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 14) {
                BasicsHeightReveal(open: open) {
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "info.circle").foregroundStyle(Color.accentColor).padding(.top, 1)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Scheduled maintenance").fontWeight(.semibold)
                            Text("Editing pauses Sunday 02:00–02:30 UTC.").foregroundStyle(.secondary)
                        }
                        .font(.footnote)
                        Spacer(minLength: 0)
                        Button(action: dismiss) { Image(systemName: "xmark").font(.footnote.weight(.semibold)) }
                            .buttonStyle(.plain).foregroundStyle(.secondary)
                            .accessibilityLabel("Dismiss")
                    }
                    .padding(.vertical, 12).padding(.leading, 14).padding(.trailing, 12)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.accentColor.opacity(0.12)))
                    .opacity(shown ? 1 : 0)
                    .blur(radius: shown ? 0 : 4)
                }
                Text("Content below the alert").font(.footnote).foregroundStyle(.secondary)
                Button("Restore", action: restore).buttonStyle(.bordered)
            }
            .frame(maxWidth: 360)
        }
    }

    private func dismiss() {
        withAnimation(reduce ? nil : .motion(.snap)) { shown = false }
        withAnimation(reduce ? nil : .motion(.base).delay(Motion.exit)) { open = false }
    }

    private func restore() {
        withAnimation(reduce ? nil : .motion(.base)) { open = true }
        withAnimation(reduce ? nil : .motion(.base).delay(0.12)) { shown = true }
    }
}
