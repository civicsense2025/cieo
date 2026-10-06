import SwiftUI
import Cieo

public struct ScriveningsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "scrivenings", category: "Writing", name: "Joined scenes",
        summary: "Tick scenes to stitch them into one scroll. Divider titles swap without overlap while the joined height springs to fit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let scenes = ["Arrival", "The letter", "Storm"]
    private let bodies = [
        "Mara reaches the lake house after dark, every light on.",
        "An unsent letter on the table names the buyer of the orchard.",
        "Rain takes the power out; they talk by candlelight until dawn."
    ]
    @State private var sel: Set<Int> = [0, 2]
    @State private var tweak = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tick scenes to stitch them together") {
            VStack(spacing: 8) {
                HStack {
                    ForEach(scenes.indices, id: \.self) { i in
                        Button(scenes[i]) { toggle(i) }
                            .buttonStyle(.bordered).frame(minHeight: 32)
                            .opacity(sel.contains(i) ? 1 : 0.55)
                            .accessibilityAddTraits(sel.contains(i) ? .isSelected : [])
                    }
                }
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(ordered, id: \.self) { si in
                        if si != ordered.first {
                            Text("§ \(loopIndex(si) + 1) · \(scenes[si])")
                                .font(.system(size: 12.5)).foregroundStyle(.secondary)
                                .id("div\(si)").motionTransition(.swap())
                        }
                        Text(bodies[si]).font(.system(size: 14))
                    }
                    if ordered.isEmpty { Text("Nothing stitched yet — tick a scene above.").font(.system(size: 14)).foregroundStyle(.secondary) }
                }
                .padding(14).background(.quaternary.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                .animation(reduce ? nil : .motion(.base), value: sel)
                Toggle("Stitch dividers", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .frame(maxWidth: 340)
        }
    }

    private var ordered: [Int] { sel.sorted() }
    private func loopIndex(_ si: Int) -> Int { ordered.firstIndex(of: si) ?? 0 }
    private func toggle(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) {
            if sel.contains(i) { sel.remove(i) } else { sel.insert(i) }
        }
    }
}
