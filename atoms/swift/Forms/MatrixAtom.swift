import SwiftUI
import MotionKit

public struct MatrixAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "matrix", category: "Forms", name: "Matrix",
        summary: "Each row has one dot that slides between columns instead of a fresh fill per cell. A row inks a success check once answered.")
    private let columns = ["Poor", "Fair", "Good", "Great"]
    private let rows = ["Page speed", "Editor", "Support"]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 0) {
                GeometryReader { g in
                    let unit = (g.size.width - 20) / 5.5
                    HStack(spacing: 0) {
                        Spacer().frame(width: unit * 1.5)
                        ForEach(columns, id: \.self) { Text($0).frame(width: unit) }
                    }
                }
                .frame(height: 18).font(.footnote).foregroundStyle(.secondary).padding(.bottom, 6)
                ForEach(rows, id: \.self) { name in
                    Divider()
                    Row(name: name, columns: columns)
                }
            }
            .padding(.horizontal, 14).padding(.vertical, 12).frame(maxWidth: 400)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
            .accessibilityElement(children: .contain).accessibilityLabel("Rate each area")
        }
    }

    private struct Row: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let name: String
        let columns: [String]
        @State private var sel: Int?
        @State private var at = 0

        var body: some View {
            GeometryReader { g in
                let unit = (g.size.width - 20) / 5.5
                let cx = unit * 1.5 + unit * (CGFloat(at) + 0.5)
                ZStack(alignment: .leading) {
                    HStack(spacing: 0) {
                        Text(name).font(.footnote.weight(.medium)).frame(width: unit * 1.5, alignment: .leading)
                        ForEach(columns.indices, id: \.self) { j in
                            Button { choose(j) } label: {
                                Circle().strokeBorder(sel == j ? Color.primary : Color.primary.opacity(0.2), lineWidth: 2)
                                    .frame(width: 18, height: 18).frame(width: unit, height: 40).contentShape(Rectangle())
                            }
                            .buttonStyle(.plain).accessibilityLabel(columns[j]).accessibilityAddTraits(sel == j ? .isSelected : [])
                        }
                        Image(systemName: "checkmark").font(.footnote.weight(.bold)).foregroundStyle(.green).frame(width: 20)
                            .opacity(sel != nil ? 1 : 0).scaleEffect(sel != nil ? 1 : 0.6)
                            .animation(reduce ? nil : .motion(.base).delay(Motion.lag * 2), value: sel != nil)
                    }
                    Circle().fill(.primary).frame(width: 10, height: 10)
                        .scaleEffect(sel != nil ? 1 : 0).position(x: cx, y: 20)
                        .animation(reduce ? nil : .motion(.base), value: at)
                        .animation(reduce ? nil : .motion(.base), value: sel != nil)
                        .allowsHitTesting(false)
                }
            }
            .frame(height: 40)
            .accessibilityElement(children: .contain).accessibilityLabel(name)
        }

        private func choose(_ j: Int) {
            if sel == nil {
                var t = Transaction()
                t.disablesAnimations = true
                withTransaction(t) { at = j }
            } else {
                at = j
            }
            withMotion(.base, reduceMotion: reduce) { sel = j }
        }
    }
}
