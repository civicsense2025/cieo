import SwiftUI
import Cieo

public struct ToggleGroupAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "togglegroup", category: "Inputs", name: "Toggle group",
        summary: "Formatting buttons are independent, so each fills on its own spring. Alignment is single-choice, so one plate slides between options with lagging edges.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var bold = false
    @State private var italic = false
    @State private var underline = false
    @State private var align = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    private let alignments: [(label: String, icon: String, alignment: Alignment)] = [
        ("Align left", "text.alignleft", .leading), ("Align center", "text.aligncenter", .center), ("Align right", "text.alignright", .trailing),
    ]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 14) {
                HStack(spacing: 10) {
                    HStack(spacing: 0) {
                        toggle("B", "Bold", $bold).fontWeight(.bold)
                        toggle("I", "Italic", $italic).italic()
                        toggle("U", "Underline", $underline).underline()
                    }
                    .padding(3).background(Capsule().fill(Color.primary.opacity(0.06)))
                    ZStack(alignment: .topLeading) {
                        if let f = frames[align] {
                            EdgesIndicator(frame: f, shape: RoundedRectangle(cornerRadius: 7), style: Color.primary.opacity(0.14))
                        }
                        HStack(spacing: 0) {
                            ForEach(alignments.indices, id: \.self) { i in
                                Button { withMotion(.base, reduceMotion: reduce) { align = i } } label: {
                                    Image(systemName: alignments[i].icon).font(.footnote)
                                        .frame(width: 32, height: 30).contentShape(Rectangle()).reportFrame(i, in: "align")
                                }
                                .buttonStyle(.plain)
                                .accessibilityLabel(alignments[i].label)
                                .accessibilityAddTraits(align == i ? .isSelected : [])
                            }
                        }
                    }
                    .coordinateSpace(name: "align")
                    .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    .padding(3).background(Capsule().fill(Color.primary.opacity(0.06)))
                }
                Text("Spring launch notes").font(.callout)
                    .bold(bold).italic(italic).underline(underline)
                    .padding(.horizontal, 14).padding(.vertical, 12)
                    .frame(maxWidth: .infinity, alignment: alignments[align].alignment)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
            }
            .frame(maxWidth: 300)
        }
    }

    private func toggle(_ glyph: String, _ label: String, _ on: Binding<Bool>) -> some View {
        Button { on.wrappedValue.toggle() } label: {
            Text(glyph).font(.callout)
                .frame(width: 32, height: 30)
                .background(RoundedRectangle(cornerRadius: 7).fill(Color.primary.opacity(on.wrappedValue ? 0.14 : 0)))
                .contentShape(Rectangle())
                .motion(.base, value: on.wrappedValue)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
        .accessibilityAddTraits(.isToggle)
        .accessibilityValue(on.wrappedValue ? "On" : "Off")
    }
}
