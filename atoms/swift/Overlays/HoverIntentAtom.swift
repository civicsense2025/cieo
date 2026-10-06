import SwiftUI
import Cieo

public struct HoverIntentAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "hoverintent", category: "Overlays", name: "Hover intent card",
        summary: "A slow approach that rests opens after a beat; a fast pass never opens. A safe triangle keeps it open, and keyboard focus pins it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var show = false
    @State private var pending: Task<Void, Never>?
    @State private var pinned = false
    @FocusState private var focused: Bool
    public init() {}
    public var body: some View {
        AtomStage(hint: "Approach slowly to open, sweep fast to skip") {
            VStack(spacing: 8) {
                Toggle("Focus pins open", isOn: $pinned).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                HStack(spacing: 4) {
                    Text("Written by").font(.callout)
                    Text("Maya Chen").font(.callout.weight(.semibold)).underline(color: .secondary)
                        .focused($focused)
                        .onHover { $0 ? enter() : leave() }
                        .onTapGesture { set(!show) }
                        .overlay(alignment: .bottom) {
                            if show { card.alignmentGuide(.bottom) { $0[.top] - 10 }
                                .onHover { $0 ? cancel() : leave() }
                                .transition(reduce ? .identity : .basicsPop(rise: -6)) }
                        }
                        .accessibilityAddTraits(.isButton)
                    Text("on Sep 28").font(.callout)
                }
                .frame(maxHeight: .infinity, alignment: .top).padding(.top, 20)
            }
        }
    }
    private var card: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Maya Chen").font(.footnote.weight(.semibold))
            Text("@mayachen").font(.caption).foregroundStyle(.secondary)
            Text("Editor at Field Notes. Slow approaches open.").font(.footnote)
        }
        .padding(14).frame(width: 230, alignment: .leading).basicsPanel(radius: 14)
    }
    private func cancel() { pending?.cancel() }
    private func later(_ s: Double, _ b: @escaping @MainActor () -> Void) {
        pending?.cancel(); pending = Task { try? await Task.sleep(for: .seconds(s)); guard !Task.isCancelled else { return }; b() }
    }
    private func set(_ on: Bool) { withMotion(on ? .base : .snap, reduceMotion: reduce) { show = on } }
    private func enter() { if show { cancel() } else { later(0.35) { set(true) } } }
    private func leave() { if pinned && focused { return }; if show { later(0.18) { set(false) } } else { cancel() } }
}
