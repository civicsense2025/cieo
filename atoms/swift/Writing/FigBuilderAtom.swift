import SwiftUI
import Cieo

public struct FigBuilderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "figbuilder", category: "Writing", name: "Figure builder",
        summary: "Captions spring to ranked slots while the page count rolls. Add a figure to re-rank.")
    private struct FigEntry: Identifiable, Equatable { let id: Int }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var figs = [FigEntry(id: 1), FigEntry(id: 2)]
    @State private var nextId = 3
    @State private var tweak = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Figures rank into slots") {
            VStack(spacing: 8) {
                HStack { Text("Pages **\(figs.count)**").font(.subheadline); Spacer(); Button("Add figure") { add() }.buttonStyle(.borderedProminent).frame(minHeight: 32) }
                VStack(spacing: 8) {
                    ForEach(figs) { f in
                        HStack {
                            if tweak { Text("Fig \(f.id)").bold() }
                            Text("caption \(f.id)").foregroundStyle(.secondary)
                        }.font(.system(size: 14))
                            .padding(.horizontal, 10).frame(height: 32, alignment: .leading).frame(maxWidth: .infinity, alignment: .leading)
                            .background(.quaternary).clipShape(RoundedRectangle(cornerRadius: 8))
                            .transition(.move(edge: .top).combined(with: .opacity))
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: figs)
                .animation(reduce ? nil : .motion(.base), value: tweak)
                Toggle("Number figures", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }.frame(maxWidth: 320)
        }
    }

    private func add() {
        withMotion(.base, reduceMotion: reduce) {
            figs.append(FigEntry(id: nextId))
            nextId += 1
            figs = Array(figs.suffix(5))
        }
    }
}
