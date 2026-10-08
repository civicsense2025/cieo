import SwiftUI
import Cieo

public struct ToastStackPileAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "toaststack", category: "Overlays", name: "Toast stack pile",
        summary: "New toasts slide in while older ones sink with soft depth. Expand the stack to review each local notification; Dismiss removes only that notification.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var items: [Toast] = [Toast(text: "Page published")]
    @State private var expanded = false
    @State private var hovering = false
    private var spread: Bool { expanded || hovering }
    @State private var count = 1
    struct Toast: Identifiable { let id = UUID(); let text: String }
    public init() {}
    public var body: some View {
        AtomStage(hint: "Add a toast, then expand the stack to review or dismiss it") {
            VStack(spacing: 8) {
                Toggle("Expand stack", isOn: $expanded).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
                Button("Show toast") { push() }.buttonStyle(.borderedProminent).controlSize(.regular)
                let layout = spread ? AnyLayout(VStackLayout(spacing: 8)) : AnyLayout(ZStackLayout(alignment: .bottom))
                layout {
                    ForEach(Array(items.enumerated()), id: \.element.id) { i, t in
                        row(t)
                            .offset(y: spread ? 0 : CGFloat(-min(i, 3) * 10))
                            .scaleEffect(spread ? 1 : 1 - CGFloat(min(i, 3)) * 0.05)
                            .zIndex(Double(100 - i))
                            .accessibilityHidden(!spread && i > 0)
                            .allowsHitTesting(spread || i == 0)
                            .transition(reduce ? .identity : .basicsPop(rise: -8))
                    }
                }
                .frame(minHeight: spread ? 0 : 90)
                .onHover { hovering = $0 }
                .accessibilityElement(children: .contain)
            }
        }
    }
    private func row(_ toast: Toast) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill").foregroundStyle(.green).font(.callout)
            Text(toast.text).font(.footnote.weight(.medium))
            Spacer(); Button("Dismiss") {
                withMotion(.snap, reduceMotion: reduce) { items.removeAll { $0.id == toast.id } }
            }.font(.caption).buttonStyle(.plain).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14).padding(.vertical, 8).frame(maxWidth: 270, minHeight: 44).basicsPanel(radius: 14)
    }
    private func push() {
        let texts = ["Invite sent", "Storage 90% full", "Draft saved", "Page published"]
        withMotion(.soft, reduceMotion: reduce) { items.insert(Toast(text: texts[count % texts.count]), at: 0); count += 1 }
        if items.count > 4 { withMotion(.snap, reduceMotion: reduce) { _ = items.popLast() } }
    }
}
