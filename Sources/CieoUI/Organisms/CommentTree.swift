import Foundation

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
