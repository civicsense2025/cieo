import SwiftUI
import MotionKit

public struct ClickToRankAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "rank", category: "Forms", name: "Click to rank",
        summary: "Clicking an item gives it the next rank: a numbered badge grows in and the item springs up into ranked order. Clicking a ranked item removes it and closes the gap.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var ranked: [Int] = []
    private let items = ["Price", "Speed", "Design", "Support", "Integrations"]
    public init() {}

    private func slot(_ i: Int) -> Int {
        if let r = ranked.firstIndex(of: i) { return r }
        return ranked.count + items.indices.filter { !ranked.contains($0) }.firstIndex(of: i)!
    }

    public var body: some View {
        AtomStage {
            VStack(spacing: 8) {
                HStack {
                    Text("Rank by importance").font(.footnote.weight(.semibold))
                    Spacer()
                    Button("Reset") { ranked = [] }.buttonStyle(.bordered).controlSize(.small)
                }
                ZStack(alignment: .top) {
                    ForEach(items.indices, id: \.self) { i in
                        let r = ranked.firstIndex(of: i)
                        let s = slot(i)
                        Button {
                            if let r { ranked.remove(at: r) } else { ranked.append(i) }
                        } label: {
                            HStack(spacing: 0) {
                                Group {
                                    if let r { RollingDigits(r + 1).foregroundStyle(.background).font(.caption.weight(.semibold)) }
                                }
                                .frame(width: 22, height: 22).background(Circle().fill(.primary))
                                .scaleEffect(r != nil ? 1 : 0).frame(width: r != nil ? 32 : 0, alignment: .leading)
                                Text(items[i]).font(.footnote.weight(.medium))
                                Spacer(minLength: 0)
                            }
                            .padding(.horizontal, 12).frame(height: 40)
                            .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.06)))
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .offset(y: CGFloat(s) * 46)
                        .animation(reduce ? nil : .motion(.base).delay(Double(s) * 0.02), value: s)
                        .animation(reduce ? nil : .motion(.base), value: r != nil)
                        .accessibilityLabel(items[i])
                        .accessibilityValue(r.map { "Ranked \($0 + 1)" } ?? "Not ranked")
                    }
                }
                .frame(height: 226, alignment: .top)
            }
            .frame(maxWidth: 300)
        }
    }
}
