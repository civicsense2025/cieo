import SwiftUI

/// A row of items the reader swipes sideways, snapping to each item. Touch devices swipe; on the Mac,
/// where there is no swipe, previous and next buttons page the rail. The host owns the one vertical scroll.
public struct ContentRail<Item: Identifiable, Card: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @State private var position: Item.ID?
    private let items: [Item]
    private let itemWidth: CGFloat
    private let spacing: CGFloat
    private let margin: CGFloat
    private let label: Text
    private let card: (Item) -> Card

    /// `label` names the rail for VoiceOver and the Mac's paging buttons, for example "Top stories".
    public init(_ items: [Item], itemWidth: CGFloat = 260, spacing: CGFloat = 12, margin: CGFloat = 16,
                label: Text, @ViewBuilder card: @escaping (Item) -> Card)
    {
        self.items = items
        self.itemWidth = Self.dimension(itemWidth, fallback: 260, floor: 44)
        self.spacing = Self.dimension(spacing, fallback: 12, floor: 0)
        self.margin = Self.dimension(margin, fallback: 16, floor: 0)
        self.label = label
        self.card = card
    }

    static func dimension(_ value: CGFloat, fallback: CGFloat, floor: CGFloat) -> CGFloat {
        value.isFinite ? max(floor, value) : fallback
    }

    /// The item a paging button moves to, held to the ends of the rail.
    public static func neighbour(of index: Int?, step: Int, count: Int) -> Int? {
        guard count > 0 else { return nil }
        return min(count - 1, max(0, (index ?? 0) + step))
    }

    public var body: some View {
        if !items.isEmpty {
            VStack(alignment: .trailing, spacing: metrics.compact) {
                #if os(macOS)
                pager
                #endif
                ScrollView(.horizontal, showsIndicators: false) {
                    LazyHStack(alignment: .top, spacing: spacing) {
                        ForEach(items) { item in
                            card(item).frame(width: itemWidth, alignment: .topLeading)
                        }
                    }
                    .scrollTargetLayout()
                }
                .contentMargins(.horizontal, margin, for: .scrollContent)
                .scrollTargetBehavior(.viewAligned)
                .scrollPosition(id: $position, anchor: .leading)
                .accessibilityElement(children: .contain)
                .accessibilityLabel(label)
            }
        }
    }

    private var index: Int? {
        position.flatMap { id in items.firstIndex { $0.id == id } }
    }

    private var pager: some View {
        HStack(spacing: metrics.tight) {
            pageButton(.previous, step: -1, name: Text("Previous"))
            pageButton(.next, step: 1, name: Text("Next"))
        }
        .padding(.trailing, margin)
    }

    private func pageButton(_ icon: ComponentIcon, step: Int, name: Text) -> some View {
        let target = Self.neighbour(of: index, step: step, count: items.count)
        let atEnd = target == (index ?? 0)
        return IconButton(icon, label: name + Text(", ") + label) {
            guard let target else { return }
            withAnimation(.snappy) { position = items[target].id }
        }
        .background(Circle().fill(theme.surface))
        .disabled(atEnd)
    }
}
