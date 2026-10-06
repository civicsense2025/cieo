import SwiftUI
import Cieo

public struct TemplateAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "template", category: "Writing", name: "Template inserter",
        summary: "Tiles stagger in. Picking one grows the doc block open and swaps its content.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel = -1
    @State private var shown = false
    private let names = ["Quote", "List", "Table"]
    private let bodies = ["\u{201C}Design is the sentence the product speaks.\u{201D}", "\u{2610} Outline \u{2014} \u{2610} Draft \u{2014} \u{2611} Ship", "Mon 12 \u{00B7} Tue 8 \u{00B7} Wed 15 pages"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a tile to insert it") {
            VStack(spacing: 10) {
                HStack(spacing: 6) {
                    ForEach(names.indices, id: \.self) { i in
                        Button(names[i]) { insert(i) }.buttonStyle(.bordered)
                            .opacity(shown ? 1 : 0).offset(y: shown ? 0 : 10)
                            .animation(reduce ? nil : .motion(.base).delay(0.06 * Double(i)), value: shown)
                    }
                }
                VStack(alignment: .leading, spacing: 6) {
                    if sel < 0 { Text("Pick a template to insert").font(.callout).foregroundStyle(.secondary) }
                    else { VStack(alignment: .leading) { Text(names[sel]).bold(); Text(bodies[sel]).font(.callout).foregroundStyle(.secondary) }.id(sel).motionTransition(.swap()) }
                }.padding(12).frame(maxWidth: .infinity, minHeight: 110, alignment: .topLeading)
                .background(.quaternary).clipShape(RoundedRectangle(cornerRadius: 10))
                .animation(reduce ? nil : .motion(.base), value: sel)
            }.frame(maxWidth: 320)
        }.onAppear { withMotion(.base, reduceMotion: reduce) { shown = true } }
    }

    private func insert(_ i: Int) { withMotion(.base, reduceMotion: reduce) { sel = i } }
}
