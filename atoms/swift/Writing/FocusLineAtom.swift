import SwiftUI
import Cieo

public struct FocusLineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "focusline", category: "Writing", name: "Focus sentence",
        summary: "One sentence carries full ink while the rest sink dim on the same soft spring, and the caret retargets mid-flight.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var caret = 1
    @State private var tweak = true
    private let lines = ["The house had been empty for years.", "Mara pushed the door and it sang.",
                         "Dust stood up in the light.", "Somewhere upstairs, a floorboard answered."]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Move the caret") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(lines.indices, id: \.self) { i in
                    Text(lines[i]).font(.system(size: 13.5))
                        .opacity(i == caret || !tweak ? 1 : 0.35)
                        .onTapGesture { go(i) }
                }
                .animation(reduce ? nil : .motion(.soft), value: caret)
                .animation(reduce ? nil : .motion(.soft), value: tweak)
                HStack {
                    Button("Prev") { go(caret - 1) }.buttonStyle(.bordered).frame(minHeight: 32)
                    Button("Next") { go(caret + 1) }.buttonStyle(.bordered).frame(minHeight: 32)
                }
                Toggle("Dim rest", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }.frame(maxWidth: 300, alignment: .leading)
        }
    }

    private func go(_ i: Int) {
        let v = (i + lines.count) % lines.count
        if reduce { caret = v } else { withMotion(.soft, reduceMotion: reduce) { caret = v } }
    }
}
