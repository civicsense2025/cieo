import SwiftUI
import Cieo

public struct StylePaintAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stylepaint", category: "Writing", name: "Style gallery painter",
        summary: "Hovering a plate slides its highlight, swaps the style name, and retargets the preview.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel = 0
    @State private var tweak = true
    private let styles = ["Memo", "Brief", "Manuscript"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover a style to preview it") {
            VStack(spacing: 8) {
                HStack(spacing: 2) {
                    ForEach(styles.indices, id: \.self) { i in
                        Button(styles[i]) { pick(i) }.buttonStyle(.plain).frame(minHeight: 32).padding(.horizontal, 10).padding(.vertical, 6)
                            .background(RoundedRectangle(cornerRadius: 8).fill(sel == i ? Color.primary.opacity(0.08) : Color.clear))
                            .onHover { if $0 { pick(i) } }
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: sel)
                HStack(spacing: 8) { Text("Style").foregroundStyle(.secondary); Text(styles[sel]).bold().id(sel).motionTransition(.swap()) }.font(.system(size: 14))
                VStack(alignment: .leading, spacing: 8) {
                    Text("The spring collection opens Thursday").font(.system(size: [15, 18, 21][sel], weight: .semibold))
                    Text("Members get first-day access to every drop, in stores and online.").font(.system(size: 14)).foregroundStyle(.secondary)
                }.padding(14).background(.quaternary).clipShape(RoundedRectangle(cornerRadius: 10))
                .animation(reduce ? nil : .motion(.soft), value: sel)
                Toggle("Preview on hover", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }.frame(maxWidth: 320)
        }
    }

    private func pick(_ i: Int) { withMotion(.base, reduceMotion: reduce) { sel = i } }
}
