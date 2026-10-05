import SwiftUI
import MotionKit

public struct HoverCardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "hovercard", category: "Overlays", name: "Hover card",
        summary: "Opens only after the pointer rests for 400ms, so passing over the link does nothing. Leaving starts a 150ms grace period, and moving into the card cancels it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var show = false
    @State private var pending: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Rest the pointer on the name, or tap it") {
            HStack(spacing: 4) {
                Text("Written by")
                Text("@mayachen").fontWeight(.semibold).underline(color: .secondary)
                    .onHover { $0 ? enter() : leave() }
                    .onTapGesture { later(0) { set(!show) } }
                    .overlay(alignment: .bottom) {
                        if show {
                            card.alignmentGuide(.bottom) { $0[.top] - 10 }
                                .onHover { $0 ? cancel() : leave() }
                                .transition(reduce ? .identity : .basicsPop(rise: -6))
                        }
                    }
                    .accessibilityAddTraits(.isButton)
                Text("on Sep 28")
            }
            .font(.callout)
            .frame(maxHeight: .infinity, alignment: .top).padding(.top, 28)
        }
    }

    private var card: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 10) {
                Circle().fill(Color.accentColor).frame(width: 40, height: 40)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Maya Chen").font(.footnote.weight(.semibold))
                    Text("@mayachen").font(.footnote).foregroundStyle(.secondary)
                }
            }
            Text("Editor at Field Notes. Writes about rivers, routes and slow mornings.").font(.footnote)
            Text("212 following · 1.4k followers").font(.footnote).foregroundStyle(.secondary)
        }
        .fontWeight(.regular)
        .padding(14).frame(width: 240, alignment: .leading)
        .basicsPanel()
    }

    private func cancel() { pending?.cancel() }

    private func later(_ seconds: Double, _ body: @escaping @MainActor () -> Void) {
        pending?.cancel()
        pending = Task {
            try? await Task.sleep(for: .seconds(seconds))
            guard !Task.isCancelled else { return }
            body()
        }
    }

    private func set(_ on: Bool) { withMotion(on ? .base : .snap, reduceMotion: reduce) { show = on } }
    private func enter() { if show { cancel() } else { later(0.4) { set(true) } } }
    private func leave() { if show { later(0.15) { set(false) } } else { cancel() } }
}
