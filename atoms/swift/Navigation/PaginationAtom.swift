import SwiftUI
import Cieo

public struct PaginationAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pagination", category: "Navigation", name: "Pagination",
        summary: "The number strip slides to keep the current page centered, clamped at the ends. The active plate moves with lagging edges, so it stretches on long jumps.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    private let count = 12
    private let cell: CGFloat = 36
    public init() {}

    private var offset: CGFloat { -min(max(0, CGFloat(cur) * cell - 72), CGFloat(count - 5) * cell) }

    public var body: some View {
        AtomStage {
            HStack(spacing: 6) {
                Button { go(cur - 1) } label: { Image(systemName: "chevron.left").frame(width: 34, height: 34) }
                    .buttonStyle(.bordered).disabled(cur == 0).accessibilityLabel("Previous page")
                ZStack(alignment: .topLeading) {
                    EdgesIndicator(frame: CGRect(x: CGFloat(cur) * cell + 2, y: 0, width: cell - 4, height: 34),
                                   shape: RoundedRectangle(cornerRadius: 9), style: Color.primary)
                    HStack(spacing: 0) {
                        ForEach(0..<count, id: \.self) { i in
                            Button { go(i) } label: {
                                Text("\(i + 1)").font(.callout.weight(.medium).monospacedDigit())
                                    .foregroundStyle(cur == i ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
                                    .frame(width: cell, height: 34).contentShape(Rectangle())
                                    .motion(.base, value: cur)
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("Page \(i + 1)")
                            .accessibilityAddTraits(cur == i ? .isSelected : [])
                        }
                    }
                }
                .frame(width: CGFloat(count) * cell, height: 34, alignment: .topLeading)
                .offset(x: offset)
                .frame(width: 180, alignment: .leading).clipped()
                Button { go(cur + 1) } label: { Image(systemName: "chevron.right").frame(width: 34, height: 34) }
                    .buttonStyle(.bordered).disabled(cur == count - 1).accessibilityLabel("Next page")
            }
        }
    }

    private func go(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { cur = min(count - 1, max(0, i)) }
    }
}
