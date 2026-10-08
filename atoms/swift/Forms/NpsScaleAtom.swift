import SwiftUI
import Cieo

public struct NpsScaleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "nps", category: "Forms", name: "NPS scale",
        summary: "The selection plate slides across the scale with lagging edges and changes color by band: danger for 0–6, warning for 7–8, success for 9–10. The caption swaps to match.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel: Int?
    @State private var confirmed: Int?
    @State private var note = true
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var run: Task<Void, Never>?
    private let bands = ["Detractor", "Passive", "Promoter"]
    private let notes = ["Tell us what hurt.", "Noted.", "Spread the word."]
    public init() {}

    private func band(_ i: Int) -> Int { i <= 6 ? 0 : i <= 8 ? 1 : 2 }
    private var tint: Color { sel.map { [Color.red, .orange, .green][band($0)] } ?? .clear }
    private var confirmTint: Color { confirmed.map { [Color.red, .orange, .green][$0] } ?? .clear }

    private func pick(_ i: Int) {
        sel = i
        run?.cancel()
        guard note else { confirmed = nil; return }
        let b = band(i)
        if reduce {
            confirmed = b
            return
        }
        run = Task {
            try? await Task.sleep(for: .seconds(0.35))
            if Task.isCancelled { return }
            confirmed = b
        }
    }

    public var body: some View {
        AtomStage {
            VStack(alignment: .leading, spacing: 10) {
                Text("How likely are you to recommend us to a friend?").font(.footnote.weight(.semibold))
                ZStack(alignment: .topLeading) {
                    if let s = sel, let f = frames[s] {
                        EdgesIndicator(frame: f, shape: RoundedRectangle(cornerRadius: 8), style: tint)
                            .motion(.soft, value: s)
                            .motion(.base, value: band(s))
                    }
                    HStack(spacing: 4) {
                        ForEach(0..<11, id: \.self) { i in
                            Button { pick(i) } label: {
                                Text("\(i)").font(.callout.weight(.semibold).monospacedDigit())
                                    .foregroundStyle(sel == i ? Color.white : Color.primary)
                                    .animation(.motion(.base), value: sel)
                                    .frame(maxWidth: .infinity).frame(height: 40)
                                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(sel == i ? 0 : 0.2)).opacity(0.10))
                                    .motion(.base, value: sel)
                                    .contentShape(Rectangle()).reportFrame(i, in: "scale")
                            }
                            .buttonStyle(.plain).accessibilityAddTraits(sel == i ? .isSelected : [])
                        }
                    }
                }
                .coordinateSpace(name: "scale")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                HStack {
                    Text("Not likely")
                    Spacer()
                    SwapText(sel.map { bands[band($0)] } ?? "").foregroundStyle(.primary).fontWeight(.medium)
                    Spacer()
                    Text("Very likely")
                }
                .font(.footnote).foregroundStyle(.secondary)
                SwapText(confirmed.map { "Thanks — \(notes[$0])" } ?? "")
                    .font(.footnote.weight(.medium)).foregroundStyle(confirmTint).frame(height: 20)
                Toggle("Confirmation note", isOn: $note).font(.caption).foregroundStyle(.secondary)
                    .onChange(of: note) {
                        run?.cancel()
                        if !note { confirmed = nil }
                        else if let s = sel { confirmed = band(s) }
                    }
            }
            .frame(maxWidth: 560)
        }
    }
}
