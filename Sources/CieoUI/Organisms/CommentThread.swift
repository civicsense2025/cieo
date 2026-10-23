import Cieo
import SwiftUI

/// A comment as the thread needs it: an identity and the replies below it.
public protocol CommentTreeNode: Identifiable where ID: Hashable & Sendable {
    /// The direct replies, in the order to show them.
    var children: [Self] { get }
}

/// A flat comment record: an identity and the identity of what it replies to.
public protocol FlatComment: Identifiable where ID: Hashable & Sendable {
    /// The parent comment's id; nil (or an unknown id) makes this a top-level comment.
    var parentID: ID? { get }
}

/// A host record placed in a tree. `item` carries the host's fields through untouched.
public struct CommentNode<Item: FlatComment>: CommentTreeNode {
    public let item: Item
    private var storedChildren: [CommentNode<Item>]
    private var treeStorage: CommentTreeStorage<Item>?
    private var treeIndex: Int?

    public var children: [CommentNode<Item>] {
        get {
            guard let treeStorage, let treeIndex else { return storedChildren }
            return treeStorage.childIndices[treeIndex].map { index in
                CommentNode(item: treeStorage.items[index], treeStorage: treeStorage, index: index)
            }
        }
        set {
            storedChildren = newValue
            treeStorage = nil
            treeIndex = nil
        }
    }

    public var id: Item.ID { item.id }

    public init(item: Item, children: [CommentNode<Item>] = []) {
        self.item = item
        storedChildren = children
        treeStorage = nil
        treeIndex = nil
    }

    private init(item: Item, treeStorage: CommentTreeStorage<Item>, index: Int) {
        self.item = item
        storedChildren = []
        self.treeStorage = treeStorage
        treeIndex = index
    }

    fileprivate static func tree(items: [Item], childIndices: [[Int]], roots: [Int]) -> [CommentNode<Item>] {
        let storage = CommentTreeStorage(items: items, childIndices: childIndices)
        return roots.map { CommentNode(item: items[$0], treeStorage: storage, index: $0) }
    }
}

fileprivate final class CommentTreeStorage<Item: FlatComment> {
    let items: [Item]
    let childIndices: [[Int]]

    init(items: [Item], childIndices: [[Int]]) {
        self.items = items
        self.childIndices = childIndices
    }
}

private struct DisjointSet<Element: Hashable> {
    private var parent: [Element: Element] = [:]
    private var size: [Element: Int] = [:]

    mutating func add(_ element: Element) {
        parent[element] = element
        size[element] = 1
    }

    mutating func unionIfDisjoint(_ lhs: Element, _ rhs: Element) -> Bool {
        var left = root(lhs)
        var right = root(rhs)
        guard left != right else { return false }
        if size[left, default: 1] < size[right, default: 1] { swap(&left, &right) }
        parent[right] = left
        size[left, default: 1] += size[right, default: 1]
        return true
    }

    private mutating func root(_ element: Element) -> Element {
        var current = element
        while let next = parent[current], next != current { current = next }
        let root = current
        current = element
        while let next = parent[current], next != current {
            parent[current] = root
            current = next
        }
        return root
    }
}

/// The pure tree helpers behind `CommentThread`; the same rules as the web twin.
public enum CommentTree {
    /// Turns a flat list into a tree. Input order is kept, an unknown parent makes a root, a cycle is
    /// broken so this always ends, and a duplicate id keeps the first record.
    public static func buildCommentTree<Item: FlatComment>(flat: [Item]) -> [CommentNode<Item>] {
        var items: [Item.ID: Item] = [:]
        var order: [Item.ID] = []
        for item in flat where items[item.id] == nil {
            items[item.id] = item
            order.append(item.id)
        }
        var childIDs: [Item.ID: [Item.ID]] = [:]
        var roots: [Item.ID] = []
        var components = DisjointSet<Item.ID>()
        for id in order { components.add(id) }
        for id in order {
            guard let parentID = items[id]?.parentID,
                  parentID != id, items[parentID] != nil,
                  components.unionIfDisjoint(id, parentID) else {
                roots.append(id)
                continue
            }
            childIDs[parentID, default: []].append(id)
        }
        let indexByID = Dictionary(uniqueKeysWithValues: order.enumerated().map { ($0.element, $0.offset) })
        let orderedItems = order.map { items[$0]! }
        let childIndices = order.map { (childIDs[$0] ?? []).map { indexByID[$0]! } }
        let rootIndices = roots.map { indexByID[$0]! }
        return CommentNode.tree(items: orderedItems, childIndices: childIndices, roots: rootIndices)
    }

    /// How many comments sit below `node`, at any depth. A comment is counted once, even on malformed data.
    public static func countDescendants<Node: CommentTreeNode>(_ node: Node?) -> Int {
        guard let node else { return 0 }
        var seen: Set<Node.ID> = [node.id]
        var stack = node.children
        var count = 0
        while let next = stack.popLast() {
            guard seen.insert(next.id).inserted else { continue }
            count += 1
            stack.append(contentsOf: next.children)
        }
        return count
    }

    /// The replies to show now and how many stay hidden. Expanded shows all; otherwise the first `initial`
    /// (a whole number of at least 0).
    public static func visibleReplies<N>(children: [N]?, expanded: Bool, initial: Int) -> (visible: [N], hidden: Int) {
        let all = children ?? []
        let first = Swift.max(0, initial)
        if expanded || first >= all.count { return (all, 0) }
        return (Array(all.prefix(first)), all.count - first)
    }

    /// Every comment below `children`, depth first, each once. The thread shows these at its deepest level.
    public static func flattenReplies<Node: CommentTreeNode>(_ children: [Node]?) -> [Node] {
        var out: [Node] = []
        var seen: Set<Node.ID> = []
        var stack = Array((children ?? []).reversed())
        while let node = stack.popLast() {
            guard seen.insert(node.id).inserted else { continue }
            out.append(node)
            stack.append(contentsOf: node.children.reversed())
        }
        return out
    }

    /// The default reveal button text: "View 1 more reply", "View 3 more replies".
    public static func moreRepliesLabel(_ count: Int) -> String {
        count == 1 ? "View 1 more reply" : "View \(count) more replies"
    }
}

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

    /// `maxDepth` is the deepest nesting level; replies below it show at that level, flattened in order.
    /// `initialReplies` is how many replies a branch shows before its button. `expanded` holds the ids of
    /// branches opened past that; leave it nil to let the thread keep them. `newIDs` mark comments that
    /// just arrived so they rise in. `branchLabel` names a reply list from its parent.
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
                withMotion(.soft, reduceMotion: reduceMotion) { shared.reveal(parent.id) }
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
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @SwiftUI.State private var arrived: Bool
    init(active: Bool) { _arrived = SwiftUI.State(initialValue: !active) }

    func body(content: Content) -> some View {
        content
            .opacity(arrived ? 1 : MotionTokens.arriveOpacity)
            .offset(y: arrived || reduceMotion ? 0 : MotionTokens.drift)
            .onAppear {
                guard !arrived else { return }
                withMotion(.base, reduceMotion: reduceMotion) { arrived = true }
            }
    }
}
