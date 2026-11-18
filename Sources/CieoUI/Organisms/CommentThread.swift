import Cieo
import SwiftUI

/// Comments as a tree: nested replies hanging off a rail, a depth cap and a "View more replies" button
/// per branch. The host draws every row (a `Comment`) from a closure that receives the node, its depth
/// and its replies view (nil when there are none) to pass on to `Comment.replies`.
public struct CommentThread<Node: CommentTreeNode, Row: View>: View {
    nonisolated static var maximumDepth: Int { 32 }
    @SwiftUI.State private var inner: Set<Node.ID> = []
    private let label: Text
    private let items: [Node]
    private let maxDepth: Int
    private let initialReplies: Int
    private let moreLabel: (Int) -> String
    private let branchLabel: ((Node) -> String)?
    private let newIDs: Set<Node.ID>
    private let expanded: Binding<Set<Node.ID>>?
    private let row: (Node, Int, AnyView?) -> Row

    public init(label: Text, items: [Node], maxDepth: Int = 3, initialReplies: Int = 2,
                expanded: Binding<Set<Node.ID>>? = nil, newIDs: Set<Node.ID> = [],
                moreLabel: @escaping (Int) -> String = CommentTree.moreRepliesLabel,
                branchLabel: ((Node) -> String)? = nil,
                @ViewBuilder row: @escaping (Node, Int, AnyView?) -> Row) {
        self.label = label; self.items = items; self.maxDepth = Self.boundedDepth(maxDepth)
        self.initialReplies = initialReplies; self.expanded = expanded; self.newIDs = newIDs
        self.moreLabel = moreLabel; self.branchLabel = branchLabel; self.row = row
    }

    public init(label: LocalizedStringKey, items: [Node], maxDepth: Int = 3, initialReplies: Int = 2,
                expanded: Binding<Set<Node.ID>>? = nil, newIDs: Set<Node.ID> = [],
                moreLabel: @escaping (Int) -> String = CommentTree.moreRepliesLabel,
                branchLabel: ((Node) -> String)? = nil,
                @ViewBuilder row: @escaping (Node, Int, AnyView?) -> Row) {
        self.init(label: Text(label), items: items, maxDepth: maxDepth, initialReplies: initialReplies,
                  expanded: expanded, newIDs: newIDs, moreLabel: moreLabel, branchLabel: branchLabel, row: row)
    }

    private var openIDs: Set<Node.ID> { expanded?.wrappedValue ?? inner }

    nonisolated static func boundedDepth(_ depth: Int) -> Int {
        Swift.min(maximumDepth, Swift.max(0, depth))
    }

    private func open(_ id: Node.ID) {
        if let expanded { expanded.wrappedValue.insert(id) } else { inner.insert(id) }
    }

    public var body: some View {
        let shared = Shared(row: row, maxDepth: maxDepth, initial: initialReplies, moreLabel: moreLabel,
                            branchLabel: branchLabel, fresh: newIDs, open: openIDs, reveal: open)
        Branch(shared: shared, parent: nil, entries: Self.levelEntries(items, level: 0, maxDepth: maxDepth), depth: 0)
            .accessibilityElement(children: .contain)
            .accessibilityLabel(label)
    }

    /// Entries at `level`: past the cap, everything below is shown here, flattened, in order.
    nonisolated static func levelEntries(_ children: [Node]?, level: Int, maxDepth: Int) -> [Node] {
        guard let children, !children.isEmpty else { return [] }
        let limit = boundedDepth(maxDepth)
        guard level <= limit else { return [] }
        return level >= limit ? CommentTree.flattenReplies(children) : children
    }

    struct Shared {
        let row: (Node, Int, AnyView?) -> Row
        let maxDepth: Int
        let initial: Int
        let moreLabel: (Int) -> String
        let branchLabel: ((Node) -> String)?
        let fresh: Set<Node.ID>
        let open: Set<Node.ID>
        let reveal: (Node.ID) -> Void
    }

    struct Branch: View {
        @Environment(\.componentTheme) private var theme
        @Environment(\.componentTypography) private var typography
        @Environment(\.componentMetrics) private var metrics
        @Environment(\.renderPolicy) private var policy
        @Environment(\.accessibilityReduceMotion) private var reduceMotion
        let shared: Shared
        let parent: Node?
        let entries: [Node]
        let depth: Int

        var body: some View {
            let expanded = parent.map { shared.open.contains($0.id) } ?? true
            let (visible, hidden) = CommentTree.visibleReplies(children: entries, expanded: expanded, initial: shared.initial)
            VStack(alignment: .leading, spacing: 0) { // literal-ok: flush stack, the pieces touch by design
                ForEach(visible) { node in
                    let kids = CommentThread.levelEntries(node.children, level: depth + 1, maxDepth: shared.maxDepth)
                    shared.row(node, depth, kids.isEmpty ? nil : AnyView(Branch(shared: shared, parent: node, entries: kids, depth: depth + 1)))
                        .environment(\.commentHasNextSibling, node.id != visible.last?.id || hidden > 0)
                        .modifier(RiseIn(active: shared.fresh.contains(node.id)))
                        .transition(.opacity)
                }
                if hidden > 0 { moreButton(hidden) }
            }
            .accessibilityElement(children: .contain)
            .accessibilityLabel(parent.flatMap { p in shared.branchLabel.map { Text($0(p)) } } ?? Text(verbatim: ""))
        }

        private func moreButton(_ hidden: Int) -> some View {
            Button {
                guard let parent else { return }
                withMotion(.soft, reduceMotion: reduceMotion || !policy.allowsMotion) { shared.reveal(parent.id) }
                AccessibilityNotification.LayoutChanged().post()
            } label: {
                Text(shared.moreLabel(hidden)).font(typography.strongDetail).foregroundStyle(theme.accent)
                    .frame(minHeight: metrics.touchTarget, alignment: .leading)
                    .padding(.leading, metrics.avatarSmall + metrics.medium)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .contentShape(.rect)
            }
            .buttonStyle(.plain)
            .background(alignment: .topLeading) {
                if depth > 0 {
                    RailElbow(railX: -(metrics.medium + (depth <= 1 ? metrics.avatar : metrics.avatarSmall) / 2),
                              avatarCentreY: metrics.touchTarget / 2, avatarLeft: metrics.avatarSmall,
                              radius: metrics.standard, continues: false)
                        .stroke(theme.track, style: StrokeStyle(lineWidth: metrics.rail, lineCap: .round))
                        .allowsHitTesting(false).accessibilityHidden(true)
                }
            }
        }
    }
}

/// The short rise from partial opacity for a comment that just arrived.
private struct RiseIn: ViewModifier {
    @Environment(\.renderPolicy) private var policy
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @SwiftUI.State private var arrived: Bool
    init(active: Bool) { _arrived = SwiftUI.State(initialValue: !active) }

    func body(content: Content) -> some View {
        let instant = arrived || reduceMotion || !policy.allowsMotion
        content
            .opacity(instant ? 1 : MotionTokens.arriveOpacity)
            .offset(y: instant ? 0 : MotionTokens.drift)
            .onAppear {
                guard !arrived else { return }
                withMotion(.base, reduceMotion: reduceMotion || !policy.allowsMotion) { arrived = true }
            }
    }
}
