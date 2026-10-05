import SwiftUI
import Cieo

public struct ConflictAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "conflict", category: "Workflow", name: "Conflict recovery",
        summary: "While you edit, a newer version arrives: the banner’s height springs open first, pushing the draft down, then its content fades in 70ms later. Compare swaps the draft for mine and theirs side by side, and the changed lines light up one after another. Keep mine or Use theirs swaps back to the draft (theirs blur-swaps the two changed lines), then the banner fades out, its space collapses and the chip turns Saved.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Mode { case draft, compare }
    @State private var banner = false
    @State private var mode = Mode.draft
    @State private var useTheirs = false
    @State private var saved = false
    @State private var lit = -1
    public init() {}

    private let lines = [["Opens April 12 at Harbor Hall."], ["Tickets $18, under 12 free.", "Tickets $20, under 14 free."],
                         ["Doors at 6 pm, talk at 7."], ["Walk or ride, parking is tight.", "Bike racks are by the east door."]]

    public var body: some View {
        AtomStage(hint: "Tap Newer version to simulate an incoming edit") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Spring launch").font(.headline)
                    Spacer()
                    AgChip(text: saved ? "Saved" : "Unsaved", tone: saved ? .success : .neutral)
                    Button("Newer version") { arrive() }.buttonStyle(AgPress()).disabled(banner || saved)
                }
                AgReveal(open: banner) {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Theo saved a newer version while you were editing.", systemImage: "exclamationmark.triangle")
                            .font(.callout).foregroundStyle(.orange)
                        HStack {
                            Button(mode == .draft ? "Compare" : "Back to draft") { toggle() }.buttonStyle(AgPress())
                            Button("Keep mine") { resolve(theirs: false) }.buttonStyle(AgPress())
                            Button("Use theirs") { resolve(theirs: true) }.buttonStyle(AgPress())
                        }
                    }
                    .padding(10).background(Color.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                }
                AgCard {
                    ZStack {
                        if mode == .draft { draft.transition(reduce ? .identity : .motionSwap()) }
                        else { compare.transition(reduce ? .identity : .motionSwap()) }
                    }
                    .animation(reduce ? nil : .motion(.base), value: mode)
                    .animation(reduce ? nil : .motion(.base), value: useTheirs)
                }
            }
        }
    }

    private var draft: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(lines.indices, id: \.self) { i in
                let l = lines[i]
                Text(l.count > 1 && useTheirs ? l[1] : l[0]).font(.callout).id("\(i)\(useTheirs)")
                    .transition(reduce ? .identity : .motionSwap())
            }
        }.frame(maxWidth: .infinity, alignment: .leading)
    }

    private var compare: some View {
        HStack(alignment: .top, spacing: 10) {
            ForEach(0..<2, id: \.self) { side in
                VStack(alignment: .leading, spacing: 6) {
                    Text(side == 0 ? "Mine · unsaved" : "Theirs · Theo").font(.caption.weight(.semibold))
                    ForEach(lines.indices, id: \.self) { i in
                        let l = lines[i]
                        Text(l.count > side ? l[side] : l[0]).font(.caption)
                            .padding(3).frame(maxWidth: .infinity, alignment: .leading)
                            .background((l.count > 1 && lit >= i ? Color.orange.opacity(0.2) : .clear), in: RoundedRectangle(cornerRadius: 4))
                    }
                }
            }
        }
    }

    private func arrive() { withMotion(.base, reduceMotion: reduce) { banner = true } }
    private func toggle() {
        withMotion(.base, reduceMotion: reduce) { mode = mode == .draft ? .compare : .draft; lit = -1 }
        guard mode == .compare else { return }
        Task { @MainActor in
            for i in 0..<lines.count where lines[i].count > 1 {
                try? await Task.sleep(nanoseconds: 120_000_000)
                withMotion(.snap, reduceMotion: reduce) { lit = i }
            }
        }
    }
    private func resolve(theirs: Bool) {
        withMotion(.base, reduceMotion: reduce) { mode = .draft; useTheirs = theirs; lit = -1 }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 250_000_000)
            withMotion(.base, reduceMotion: reduce) { banner = false; saved = true }
        }
    }
}
