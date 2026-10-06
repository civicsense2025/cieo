import SwiftUI
import Cieo

public struct MergeStepAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mergestep", category: "Writing", name: "Merge preview stepper",
        summary: "The record title swaps while the field plate slides behind the rows with its far edge trailing 60 ms. A missing field rings in the danger color with a note.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let records = [
        (title: "Acme buyout — draft 3", fields: [("Buyer", "Acme Corp", false), ("Price", "$42M", false), ("Close date", "Missing", true)]),
        (title: "Acme buyout — draft 4", fields: [("Buyer", "Acme Corp", false), ("Price", "$44M", false), ("Close date", "June 30", false)]),
        (title: "Globex merger — draft 1", fields: [("Buyer", "Missing", true), ("Price", "$9M", false), ("Close date", "July 12", false)]),
    ]
    private let rowH = 56.0, gap = 6.0
    @State private var cur = 0
    @State private var top = 124.0
    @State private var bottom = 180.0
    public init() {}

    private var bad: Bool { records[cur].fields.contains(where: \.2) }

    public var body: some View {
        AtomStage(hint: "Step through merge candidates") {
            VStack(alignment: .leading, spacing: 8) {
                SwapText(records[cur].title).font(.headline).frame(height: 22, alignment: .leading)
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(Color.accentColor.opacity(0.14))
                        .frame(height: bottom - top).offset(y: top)
                    VStack(spacing: gap) {
                        ForEach(records[cur].fields.indices, id: \.self) { i in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(records[cur].fields[i].0).font(.caption).foregroundStyle(.secondary)
                                Text(records[cur].fields[i].1).font(.callout)
                                    .padding(.horizontal, 10).padding(.vertical, 5)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .background(.background, in: RoundedRectangle(cornerRadius: 9))
                                    .overlay(RoundedRectangle(cornerRadius: 9)
                                        .stroke(records[cur].fields[i].2 && bad ? Color.red : Color.secondary.opacity(0.25), lineWidth: 1.5))
                            }
                            .frame(height: rowH, alignment: .top)
                        }
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: cur)
                HStack {
                    Text("Record \(cur + 1) of \(records.count)").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    SwapText(bad ? "\(records[cur].fields.first(where: \.2)?.0 ?? "Field") is missing" : "").font(.caption).foregroundStyle(.red)
                }.frame(height: 18)
                HStack {
                    Button("Prev") { go(cur - 1) }.buttonStyle(.bordered).disabled(cur == 0)
                    Spacer()
                    ForEach(records.indices, id: \.self) { i in
                        Button("\(i + 1)") { go(i) }.buttonStyle(.bordered)
                            .tint(i == cur ? .accentColor : nil)
                            .accessibilityAddTraits(i == cur ? .isSelected : [])
                    }
                    Spacer()
                    Button("Next") { go(cur + 1) }.buttonStyle(.borderedProminent).disabled(cur == records.count - 1)
                }
            }
            .frame(maxWidth: 340)
        }
    }

    /// The plate's leading edge moves on snap and the far edge follows 60 ms later.
    private func go(_ n: Int) {
        let c = max(0, min(records.count - 1, n))
        let nt = Double(max(0, records[c].fields.firstIndex(where: \.2) ?? 0)) * (rowH + gap), nb = nt + rowH
        guard !reduce else { cur = c; top = nt; bottom = nb; return }
        let down = nt >= top
        cur = c
        withAnimation(.motion(.snap).delay(down ? Motion.lag : 0)) { top = nt }
        withAnimation(.motion(.snap).delay(down ? 0 : Motion.lag)) { bottom = nb }
    }
}
