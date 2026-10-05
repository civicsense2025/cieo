import SwiftUI
import MotionKit

public struct FieldDiffAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fielddiff", category: "Workflow", name: "Field diff rows",
        summary: "Each row shows the old value and Theo’s new one. Choosing a value draws a strike across the other and fades it, then the chosen one’s plate fills success 60ms later and the badge swaps. Accept all and Revert all run the same change down the list 70ms apart, the decided count rolls, and a header button turns ink once every row agrees.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    /// nil = pending, false = kept old value, true = took new value.
    @State private var picks: [Bool?] = [nil, nil, nil]
    public init() {}

    private let fields = [("title", "Spring launch", "Spring season"), ("price", "$18", "$20"), ("status", "Draft", "Published")]
    private var decided: Int { picks.compactMap { $0 }.count }

    public var body: some View {
        AtomStage(hint: "Click a value to choose it, or undo") {
            AgCard {
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("Changed by Theo").font(.headline)
                        Spacer()
                        HStack(spacing: 2) { RollingDigits(decided); Text("of 3 decided") }.font(.caption).foregroundStyle(.secondary)
                        Button("Revert all") { all(false) }.buttonStyle(AgPress())
                        Button("Accept all") { all(true) }.buttonStyle(AgPress(tone: decided == 3 ? nil : .info))
                    }
                    ForEach(fields.indices, id: \.self) { i in row(i) }
                }
            }
            .frame(maxWidth: 430)
        }
    }

    private func row(_ i: Int) -> some View {
        let f = fields[i], pick = picks[i]
        return VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(f.0).font(.caption.monospaced())
                Spacer()
                AgChip(text: pick == nil ? "Pending" : pick! ? "Accepted" : "Reverted", tone: pick == nil ? .neutral : pick! ? .success : .neutral)
            }
            HStack {
                value(f.1, chosen: pick == false, struck: pick == true) { toggle(i, false) }
                Image(systemName: "arrow.right").foregroundStyle(.secondary).accessibilityHidden(true)
                value(f.2, chosen: pick == true, struck: pick == false) { toggle(i, true) }
            }
        }
    }

    private func value(_ text: String, chosen: Bool, struck: Bool, _ tap: @escaping () -> Void) -> some View {
        Button(action: tap) {
            Text(text).strikethrough(struck).opacity(struck ? 0.4 : 1).frame(maxWidth: .infinity)
        }
        .buttonStyle(AgPress(tone: chosen ? .success : nil))
        .accessibilityAddTraits(chosen ? .isSelected : [])
    }

    private func toggle(_ i: Int, _ v: Bool) { withMotion(.base, reduceMotion: reduce) { picks[i] = picks[i] == v ? nil : v } }
    private func all(_ v: Bool) {
        Task { @MainActor in
            for i in picks.indices {
                withMotion(.base, reduceMotion: reduce) { picks[i] = v }
                try? await Task.sleep(nanoseconds: 70_000_000)
            }
        }
    }
}
