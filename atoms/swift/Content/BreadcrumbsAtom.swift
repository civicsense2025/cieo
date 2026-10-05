import SwiftUI
import MotionKit

public struct BreadcrumbsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "breadcrumbs", category: "Content", name: "Breadcrumbs",
        summary: "Middle crumbs fold into one ellipsis button. Each crumb’s width springs to zero while its text fades, so the trail closes from the inside out.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var collapsed = false
    private let names = ["Home", "Docs", "Guides", "Blocks", "Tabs"]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 24) {
                HStack(spacing: 0) {
                    crumb(0)
                    Fold(open: collapsed, delay: 0.1) {
                        HStack(spacing: 0) {
                            slash
                            Button { set(false) } label: {
                                Text("…").padding(.horizontal, 6)
                                    .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.08)))
                            }
                            .buttonStyle(.plain).accessibilityLabel("Show full path")
                        }
                    }
                    ForEach(1..<5, id: \.self) { i in
                        Fold(open: !collapsed || i == 4, delay: Double(i - 1) * 0.03) { HStack(spacing: 0) { slash; crumb(i) } }
                    }
                }
                .font(.footnote).lineLimit(1)
                Button(collapsed ? "Expand" : "Collapse") { set(!collapsed) }.buttonStyle(.bordered)
            }
        }
    }

    private var slash: some View { Text("/").foregroundStyle(.tertiary).padding(.horizontal, 6) }

    private func crumb(_ i: Int) -> some View {
        Text(names[i]).foregroundStyle(i == 4 ? Color.primary : Color.secondary).fontWeight(i == 4 ? .semibold : .regular)
    }

    private func set(_ c: Bool) { collapsed = c }

    /// Width springs between zero and the measured width while the content fades.
    private struct Fold<Content: View>: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let open: Bool
        let delay: Double
        @ViewBuilder let content: Content
        @State private var width: CGFloat?
        var body: some View {
            content.fixedSize()
                .background(GeometryReader { g in Color.clear.onAppear { width = g.size.width }.onChange(of: g.size.width) { _, w in width = w } })
                .opacity(open ? 1 : 0)
                .frame(width: open ? width : 0, alignment: .leading)
                .clipped()
                .animation(reduce ? nil : .motion(.base).delay(delay), value: open)
                .accessibilityHidden(!open)
        }
    }
}
