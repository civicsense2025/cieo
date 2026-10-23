import Cieo
import SwiftUI

/// The inbox: `ConversationListItem` rows that glide to their new places when the order changes, with
/// arrow-key movement on the Mac and iPad keyboards. The host owns the conversations and their order.
///
/// It draws a plain stack, so put it in a `ScrollView` (there is no windowing for very long inboxes).
public struct ConversationList<Item: Identifiable, Row: View>: View where Item.ID == String {
    @Environment(\.componentMetrics) private var metrics
    @FocusState private var focusedId: String?
    private let label: LocalizedStringKey
    private let items: [Item]
    private let order: [String]?
    @Binding private var selection: String?
    private let row: (Item) -> Row

    /// - Parameters:
    ///   - label: Names the list for VoiceOver, such as "Conversations".
    ///   - items: The conversations in any order; their ids and `order` decide where they appear.
    ///   - order: Ids in display order. When it changes the rows glide to their new places, so a chat with a
    ///     new message can jump to the top. Items missing from it follow in the order given.
    ///   - selection: The id of the open conversation. Marks that row current; a row tap writes it.
    ///   - row: Builds a `ConversationListItem` for an item.
    public init(_ label: LocalizedStringKey, items: [Item], order: [String]? = nil,
                selection: Binding<String?> = .constant(nil), @ViewBuilder row: @escaping (Item) -> Row) {
        self.label = label
        self.items = items
        self.order = order
        _selection = selection
        self.row = row
    }

    private var shown: [Item] {
        let byId = Dictionary(items.map { ($0.id, $0) }, uniquingKeysWith: { first, _ in first })
        let ids = Self.conversationOrder(items.map(\.id), order: order)
        return ids.compactMap { byId[$0] }
    }

    public var body: some View {
        let rows = shown
        let ids = rows.map(\.id)
        VStack(spacing: metrics.tight) {
            ForEach(rows) { item in row(item) }
        }
        .environment(\.conversationListContext, ConversationListContext(
            selectedId: selection, select: { selection = $0 }, focus: $focusedId))
        .motion(.base, value: ids)
        .onKeyPress(keys: [.upArrow, .downArrow, .home, .end]) { press in
            guard let name = Self.keyName(press.key) else { return .ignored }
            let current = focusedId.flatMap { ids.firstIndex(of: $0) } ?? -1
            guard let next = Self.conversationRove(key: name, current: current, count: ids.count) else { return .ignored }
            focusedId = ids[next]
            return .handled
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(label))
    }

    // MARK: - Pure helpers

    /// Display order: ids in `order` first (unknown ids dropped, repeats ignored), then any remaining ids in
    /// their given order. Without `order`, the given order.
    public static func conversationOrder<ID: Hashable>(_ ids: [ID], order: [ID]? = nil) -> [ID] {
        let known = Set(ids)
        var seen = Set<ID>()
        var first: [ID] = []
        for id in order ?? [] where known.contains(id) && seen.insert(id).inserted { first.append(id) }
        return first + ids.filter { !seen.contains($0) }
    }

    /// Which row should take focus first: the one last focused, else the selected one, else the first. Nil
    /// for an empty list.
    public static func conversationTabbable<ID: Hashable>(_ ids: [ID], activeId: ID?, selectedId: ID? = nil) -> ID? {
        if let activeId, ids.contains(activeId) { return activeId }
        if let selectedId, ids.contains(selectedId) { return selectedId }
        return ids.first
    }

    /// Row index a key moves focus to, or nil for keys that do nothing. "ArrowUp" and "ArrowDown" step,
    /// "Home" and "End" jump, and it stops at both ends. `current` is -1 when no row has focus.
    public static func conversationRove(key: String, current: Int, count: Int) -> Int? {
        guard count > 0 else { return nil }
        switch key {
        case "ArrowDown": return min(count - 1, current + 1)
        case "ArrowUp": return max(0, current < 0 ? 0 : current - 1)
        case "Home": return 0
        case "End": return count - 1
        default: return nil
        }
    }

    static func keyName(_ key: KeyEquivalent) -> String? {
        switch key {
        case .upArrow: "ArrowUp"
        case .downArrow: "ArrowDown"
        case .home: "Home"
        case .end: "End"
        default: nil
        }
    }
}

#Preview {
    struct Chat: Identifiable { let id: String; let title: String }
    return ScrollView {
        ConversationList("Conversations", items: [Chat(id: "a", title: "Design"), Chat(id: "b", title: "Ben")], order: ["b", "a"]) { chat in
            ConversationListItem(id: chat.id, title: chat.title, preview: "hello", time: "9:41") {
                GroupAvatar(people: [GroupAvatarPerson(name: chat.title, initials: String(chat.title.prefix(1)))])
            }
        }
    }.padding()
}
