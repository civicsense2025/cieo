import SwiftUI
import MotionKit

public struct AgentAccessAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentaccess", category: "MCP and agents", name: "Agent permission matrix",
        summary: "Each cell is a checkbox. Toggling springs the fill and check, and the cell takes a full outline (ink for added, red with a faint check for removed) so the change is visible before saving. The pending panel grows up from the bottom edge and each change enters as its own row. The header chip morphs to Can publish or delete as soon as one of those grants is on. Save swaps to a spinner, then Saved, collapses the rows and settles every outline; Discard springs everything back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var grants: [[Bool]] = [[true, true, false], [true, false, false], [false, false, false]]
    @State private var saved: [[Bool]] = [[true, true, false], [true, false, false], [false, false, false]]
    @State private var saving = false
    @State private var justSaved = false
    public init() {}

    private let rows = ["Pages", "Media", "Settings"]
    private let cols = ["Read", "Write", "Publish or delete"]
    private var changes: [(Int, Int)] { (0..<3).flatMap { r in (0..<3).compactMap { c in grants[r][c] != saved[r][c] ? (r, c) : nil } } }
    private var risky: Bool { grants.contains { $0[2] } }

    public var body: some View {
        AtomStage(hint: "Toggle cells; changes are pending until Save") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Image(systemName: "square.fill").accessibilityHidden(true)
                        Text("Assistant").font(.headline); Spacer()
                        AgChip(text: risky ? "Can publish or delete" : "Read and edit", tone: risky ? .warning : .neutral)
                    }
                    Grid(horizontalSpacing: 10, verticalSpacing: 6) {
                        GridRow { Text(""); ForEach(cols, id: \.self) { Text($0).font(.caption2).foregroundStyle(.secondary) } }
                        ForEach(0..<3, id: \.self) { r in
                            GridRow {
                                Text(rows[r]).font(.callout).frame(maxWidth: .infinity, alignment: .leading)
                                ForEach(0..<3, id: \.self) { c in cell(r, c) }
                            }
                        }
                    }
                    AgReveal(open: !changes.isEmpty || justSaved) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(justSaved ? "Saved" : "Pending changes").font(.caption.weight(.semibold))
                            if !justSaved {
                                ForEach(changes.indices, id: \.self) { i in
                                    let ch = changes[i]
                                    Text("\(grants[ch.0][ch.1] ? "Add" : "Remove") \(cols[ch.1]) on \(rows[ch.0])").font(.caption)
                                        .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .bottom)))
                                }
                                HStack {
                                    Button("Discard") { withMotion(.base, reduceMotion: reduce) { grants = saved } }.buttonStyle(AgPress())
                                    Button { save() } label: { HStack(spacing: 4) { if saving { AgSpinner(size: 12) }; SwapText(saving ? "Saving" : "Save") } }.buttonStyle(AgPress(tone: .info)).disabled(saving)
                                }
                            }
                        }
                    }
                    .animation(reduce ? nil : .motion(.base), value: changes.count)
                }
            }
            .frame(maxWidth: 420)
        }
    }

    private func cell(_ r: Int, _ c: Int) -> some View {
        let on = grants[r][c], added = on && !saved[r][c], removed = !on && saved[r][c]
        return Button { withMotion(.snap, reduceMotion: reduce) { grants[r][c].toggle(); justSaved = false } } label: {
            Image(systemName: "checkmark").font(.caption.weight(.bold))
                .foregroundStyle(on ? Color.white : removed ? Color.red.opacity(0.4) : .clear)
                .frame(width: 28, height: 28)
                .background(on ? Color.accentColor : Color.clear, in: RoundedRectangle(cornerRadius: 6))
                .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(added ? Color.primary : removed ? Color.red : Color.secondary.opacity(0.4), lineWidth: added || removed ? 2 : 1))
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(cols[c]) on \(rows[r])").accessibilityValue(on ? "granted" : "not granted")
    }

    private func save() {
        withMotion(.snap, reduceMotion: reduce) { saving = true }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 800_000_000)
            withMotion(.base, reduceMotion: reduce) { saved = grants; saving = false; justSaved = true }
            try? await Task.sleep(nanoseconds: 1_200_000_000)
            withMotion(.base, reduceMotion: reduce) { justSaved = false }
        }
    }
}
