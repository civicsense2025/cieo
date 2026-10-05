import SwiftUI
import MotionKit

public struct RefPickerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "refpicker", category: "Workflow", name: "Reference row picker",
        summary: "The list rises from the field with a plate that follows hover and arrow keys on lagging edges. Picking a row measures its rect and the chip starts there at the row’s size and radius, then x, y, width, height and radius spring to the chip’s slot in the field while the row’s text swaps for the chip’s. The row fades out and the rows below slide up; the field grows to wrap the next chip. Removing a chip fades it, then the others slide over and the row returns to the list.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var chosen: [Int] = []
    @State private var hover: CGRect = .zero
    @Namespace private var ns
    public init() {}

    private let records = ["Maya Okafor", "Theo Lindqvist", "Priya Raman", "Ben Alvarez", "Sofia Marin"]

    public var body: some View {
        AtomStage(hint: "Pick records; tap a chip to remove it") {
            VStack(alignment: .leading, spacing: 6) {
                Text("Authors").font(.callout.weight(.medium))
                Button { withMotion(.base, reduceMotion: reduce) { open.toggle() } } label: {
                    HStack {
                        if chosen.isEmpty { Text("Choose records").foregroundStyle(.secondary) }
                        else {
                            HStack(spacing: 6) {
                                ForEach(chosen, id: \.self) { i in
                                    Button { remove(i) } label: { Label(records[i], systemImage: "xmark").labelStyle(.titleAndIcon).font(.caption) }
                                        .buttonStyle(AgPress())
                                        .matchedGeometryEffect(id: i, in: ns)
                                        .transition(.opacity)
                                }
                            }
                        }
                        Spacer()
                        Image(systemName: "chevron.down").rotationEffect(.degrees(open ? 180 : 0))
                            .animation(reduce ? nil : .motion(.snap), value: open)
                    }
                    .padding(8).frame(minHeight: 44)
                    .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
                    .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(open ? Color.accentColor : Color.secondary.opacity(0.4)))
                }
                .buttonStyle(.plain).accessibilityLabel("Authors, choose records")
                if open { list.transition(reduce ? .identity : .motionPresence) }
            }
            .frame(maxWidth: 390)
        }
    }

    private var list: some View {
        VStack(spacing: 0) {
            let remaining = records.indices.filter { !chosen.contains($0) }
            ForEach(remaining, id: \.self) { i in
                Button { pick(i) } label: {
                    VStack(alignment: .leading, spacing: 0) {
                        Text(records[i]).font(.callout.weight(.medium))
                        Text("/people/" + records[i].lowercased().replacingOccurrences(of: " ", with: "-")).font(.caption).foregroundStyle(.secondary)
                    }.frame(maxWidth: .infinity, alignment: .leading).padding(.vertical, 5).padding(.horizontal, 10)
                        .matchedGeometryEffect(id: i, in: ns, isSource: false)
                }
                .buttonStyle(AgPress()).transition(.opacity)
            }
            if remaining.isEmpty { Text("No matching records.").font(.caption).foregroundStyle(.secondary).padding(10) }
        }
        .padding(4)
        .background(.background, in: RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.quaternary))
        .shadow(radius: 6, y: 2)
    }

    private func pick(_ i: Int) { withMotion(.base, reduceMotion: reduce) { chosen.append(i) } }
    private func remove(_ i: Int) { withMotion(.base, reduceMotion: reduce) { chosen.removeAll { $0 == i } } }
}
