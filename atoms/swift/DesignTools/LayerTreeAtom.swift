import SwiftUI
import Cieo

public struct LayerTreeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "layers", category: "Design tools", name: "Layer tree",
        summary: "Groups open and close on a height spring with their chevrons turning. The selection plate slides between rows with lagging edges, and hiding a layer fades its name while the eye closes. Density switches row height; thumbs adds a color chip slot.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Node { let name: String; let depth: Int; let parent: Int?; let group: Bool; let tint: Color }
    private let nodes = [Node(name: "Hero", depth: 0, parent: nil, group: true, tint: .olive), Node(name: "Heading", depth: 1, parent: 0, group: false, tint: .orange),
                         Node(name: "Button", depth: 1, parent: 0, group: true, tint: .blue), Node(name: "Label", depth: 2, parent: 2, group: false, tint: .blue),
                         Node(name: "Icon", depth: 2, parent: 2, group: false, tint: .gray), Node(name: "Image", depth: 1, parent: 0, group: false, tint: .red)]
    @State private var open = Array(repeating: Track(1, preset: .base), count: 6)
    @State private var visible = Array(repeating: Track(1, preset: .base), count: 6)
    @State private var selected = 0
    @State private var hiTop = 0.0
    @State private var hiBottom = 30.0
    @State private var dense = false
    @State private var thumbs = false
    public init() {}

    private var rowH: Double { dense ? 24 : 30 }

    /// 0...1 openness of every ancestor group, multiplied: how much of this row is showing.
    private func factor(_ i: Int, _ t: Double) -> Double {
        var f = 1.0, p = nodes[i].parent
        while let g = p { f *= max(0, min(1, open[g].value(at: t))); p = nodes[g].parent }
        return f
    }

    private func targetY(_ i: Int) -> Double {
        (0..<i).reduce(0) { acc, j in
            var f = 1.0, p = nodes[j].parent
            while let g = p { f *= open[g].target; p = nodes[g].parent }
            return acc + rowH * f
        }
    }

    public var body: some View {
        AtomStage(hint: "Open groups, select rows, hide layers") {
            VStack(spacing: 8) {
                TimelineView(.motion(open, visible)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    let fs = nodes.indices.map { factor($0, t) }
                    ZStack(alignment: .topLeading) {
                        RoundedRectangle(cornerRadius: 7).fill(.quaternary).frame(height: hiBottom - hiTop).offset(y: hiTop)
                        ForEach(nodes.indices, id: \.self) { i in
                            row(i, t).opacity(fs[i]).allowsHitTesting(fs[i] > 0.5)
                                .offset(y: nodes.indices.filter { $0 < i }.reduce(0) { $0 + rowH * fs[$1] })
                        }
                    }
                    .padding(6).frame(width: 280, alignment: .topLeading).frame(height: rowH * 6 + 12, alignment: .top)
                    .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                }
                .accessibilityElement(children: .contain).accessibilityLabel("Layers")
                HStack(spacing: 6) {
                    Text("Density").font(.caption).foregroundStyle(.secondary)
                    Picker("Density", selection: $dense) { Text("Comfortable").tag(false); Text("Dense").tag(true) }
                        .pickerStyle(.segmented).frame(width: 190)
                        .onChange(of: dense) { _, _ in withMotion(.base, reduceMotion: reduce) { select(selected) } }
                    Toggle("Thumbs", isOn: $thumbs).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.mini)
                }
            }
        }
    }

    private func row(_ i: Int, _ t: Double) -> some View {
        let n = nodes[i], v = max(0, min(1, visible[i].value(at: t))), o = max(0, min(1, open[i].value(at: t)))
        return HStack(spacing: 6) {
            if thumbs {
                RoundedRectangle(cornerRadius: 5).fill(n.tint.opacity(0.7)).frame(width: 16, height: 16)
                    .motionTransition(.swap())
            }
            Group {
                if n.group {
                    Button { DataMotion.retarget(&open[i], to: open[i].target > 0.5 ? 0 : 1, reduce: reduce) } label: {
                        Image(systemName: "chevron.down").font(.system(size: 10, weight: .semibold)).rotationEffect(.degrees(-90 * (1 - o)))
                    }
                    .buttonStyle(.plain).accessibilityLabel("\(open[i].target > 0.5 ? "Collapse" : "Expand") \(n.name)")
                } else { Color.clear }
            }
            .frame(width: 14).foregroundStyle(.secondary)
            Text(n.name).font(.subheadline).opacity(0.35 + 0.65 * v).frame(maxWidth: .infinity, alignment: .leading)
            Button { DataMotion.retarget(&visible[i], to: visible[i].target > 0.5 ? 0 : 1, reduce: reduce) } label: {
                ZStack {
                    Image(systemName: "eye").font(.caption)
                    Path { p in p.move(to: CGPoint(x: 2, y: 2)); p.addLine(to: CGPoint(x: 14, y: 14)) }
                        .trim(from: 0, to: 1 - v).stroke(style: StrokeStyle(lineWidth: 1.5, lineCap: .round)).frame(width: 16, height: 16)
                }
                .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain).accessibilityLabel("\(visible[i].target > 0.5 ? "Hide" : "Show") \(n.name)")
        }
        .padding(.leading, 8 + Double(n.depth) * 16).padding(.trailing, 6).frame(height: rowH).contentShape(Rectangle())
        .onTapGesture { select(i) }
        .accessibilityElement(children: .contain).accessibilityAddTraits(i == selected ? .isSelected : [])
    }

    /// The plate's leading edge moves first and its trailing edge follows 60 ms later.
    private func select(_ i: Int) {
        selected = i
        let top = targetY(i), bottom = top + rowH
        guard !reduce else { hiTop = top; hiBottom = bottom; return }
        let down = top >= hiTop
        withAnimation(.motion(.base).delay(down ? Motion.lag : 0)) { hiTop = top }
        withAnimation(.motion(.base).delay(down ? 0 : Motion.lag)) { hiBottom = bottom }
    }
}

private extension Color {
    static var olive: Color { Color(hue: 0.17, saturation: 0.6, brightness: 0.4) }
}
