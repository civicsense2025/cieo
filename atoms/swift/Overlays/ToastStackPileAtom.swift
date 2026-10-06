import SwiftUI
import Cieo

public struct ToastStackPileAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "toaststack", category: "Overlays", name: "Toast stack pile",
        summary: "Newest slides in on base while older ones sink with soft depth. Hovering expands the pile and pauses timers; toasts announce politely.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var items: [Toast] = [Toast(text: "Page published")]
    @State private var expanded = false
    @State private var count = 1
    struct Toast: Identifiable { let id = UUID(); let text: String }
    public init() {}
    public var body: some View {
        AtomStage(hint: "Add a toast, hover the pile to expand") {
            VStack(spacing: 8) {
                Toggle("Expand on hover", isOn: $expanded).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
                Button("Show toast") { push() }.buttonStyle(.borderedProminent).controlSize(.regular)
                ZStack(alignment: .bottom) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { i, t in
                        row(t.text)
                            .offset(y: expanded ? CGFloat(-i * 52) : CGFloat(-min(i, 3) * 10))
                            .scaleEffect(expanded ? 1 : 1 - CGFloat(min(i, 3)) * 0.05)
                            .zIndex(Double(100 - i))
                            .opacity(i > 3 && !expanded ? 0 : 1)
                            .transition(reduce ? .identity : .basicsPop(rise: -8))
                    }
                }
                .frame(height: expanded ? 170 : 90)
                .accessibilityElement(children: .contain).accessibilityHint("Polite announcements")
            }
        }
    }
    private func row(_ text: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill").foregroundStyle(.green).font(.callout)
            Text(text).font(.footnote.weight(.medium)).lineLimit(1)
            Spacer(); Button("Undo") {}.font(.caption).buttonStyle(.plain).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14).frame(width: 270, height: 44).basicsPanel(radius: 14)
    }
    private func push() {
        let texts = ["Invite sent", "Storage 90% full", "Draft saved", "Page published"]
        withMotion(.soft, reduceMotion: reduce) { items.insert(Toast(text: texts[count % texts.count]), at: 0); count += 1 }
        if items.count > 4 { withMotion(.snap, reduceMotion: reduce) { _ = items.popLast() } }
    }
}
