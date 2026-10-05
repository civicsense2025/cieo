import SwiftUI
import Cieo

public struct RevisionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "revisions", category: "Workflow", name: "Revision history",
        summary: "Each saved version shows a live relative time and its author. Hover or focus a version and the preview swaps (old text out in 100ms, then the new text in) to show what restoring would change: added words in a success tint, removed words struck in danger. Selecting a row opens Restore in place, which swaps to an inline confirmation, then to Restoring. Last, the removed words collapse and the tints fade so the current draft becomes the restored text, and a new entry enters at the top.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Step { case idle, confirm, restoring }
    private struct Rev: Identifiable { let id: Int; let who: String; let label: String; let text: String }
    @State private var revs = [Rev(id: 1, who: "Ben", label: "Autosave", text: "Refunds return within 3 business days."),
                               Rev(id: 2, who: "Maya", label: "Autosave", text: "Refunds go back within 5 business days."),
                               Rev(id: 3, who: "Theo", label: "Published", text: "Contact support to start a request.")]
    @State private var draft = "Refunds are issued within 7 business days."
    @State private var preview: Int?
    @State private var selected: Int?
    @State private var step = Step.idle
    @State private var nextId = 4
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover or select a version") {
            HStack(alignment: .top, spacing: 12) {
                AgCard {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Refund policy").font(.headline)
                        Text(shown).font(.callout).id(shown).transition(reduce ? .identity : .motionSwap())
                            .frame(maxWidth: .infinity, minHeight: 70, alignment: .topLeading)
                        Text(preview == nil ? "Current draft" : "Previewing restore").font(.caption).foregroundStyle(.secondary)
                    }
                }
                VStack(alignment: .leading, spacing: 4) {
                    Text("History").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    ForEach(revs.sorted { $0.id > $1.id }) { r in
                        VStack(alignment: .leading, spacing: 4) {
                            Button { select(r.id) } label: {
                                HStack { Text(r.who).fontWeight(.medium); Text(r.label).foregroundStyle(.secondary); Spacer() }.font(.caption)
                            }
                            .buttonStyle(AgPress(tone: selected == r.id ? .info : nil))
                            .onHover { preview = $0 ? r.id : (preview == r.id ? nil : preview) }
                            AgReveal(open: selected == r.id) { restoreRow(r) }
                        }
                        .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .top)))
                    }
                }
                .frame(width: 150)
            }
            .animation(reduce ? nil : .motion(.base), value: preview)
            .animation(reduce ? nil : .motion(.base), value: revs.count)
        }
    }

    private var shown: String { revs.first { $0.id == (preview ?? -1) }?.text ?? draft }

    @ViewBuilder private func restoreRow(_ r: Rev) -> some View {
        HStack {
            switch step {
            case .idle: Button("Restore") { withMotion(.snap, reduceMotion: reduce) { step = .confirm } }.buttonStyle(AgPress())
            case .confirm: Button("Confirm restore") { restore(r) }.buttonStyle(AgPress(tone: .warning))
            case .restoring: HStack { AgSpinner(size: 12); Text("Restoring…") }.font(.caption)
            }
        }
    }

    private func select(_ id: Int) { withMotion(.base, reduceMotion: reduce) { selected = selected == id ? nil : id; step = .idle } }
    private func restore(_ r: Rev) {
        withMotion(.snap, reduceMotion: reduce) { step = .restoring }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 700_000_000)
            withMotion(.base, reduceMotion: reduce) {
                draft = r.text; preview = nil; selected = nil; step = .idle
                revs.append(Rev(id: nextId, who: "Maya", label: "Restored", text: r.text)); nextId += 1
            }
        }
    }
}
