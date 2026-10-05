import SwiftUI
import MotionKit

public struct BottomNavigationBarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "navbar", category: "Navigation", name: "Bottom navigation bar",
        summary: "The active indicator pill grows outward from the icon’s center while the previous one shrinks back into it. Icon and label ink in on the same spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var active = 0
    private let items = [("Home", "house"), ("Search", "magnifyingglass"), ("Library", "books.vertical"), ("Profile", "person")]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap a destination") {
            HStack(spacing: 0) {
                ForEach(items.indices, id: \.self) { i in
                    let on = active == i
                    Button { withMotion(.base, reduceMotion: reduce) { active = i } } label: {
                        VStack(spacing: 4) {
                            ZStack {
                                Capsule().fill(Color.accentColor.opacity(0.18))
                                    .frame(width: on ? 56 : 0, height: 30).opacity(on ? 1 : 0)
                                Image(systemName: items[i].1).font(.system(size: 18, weight: .medium))
                            }
                            .frame(width: 56, height: 30)
                            Text(items[i].0).font(.caption).fontWeight(on ? .semibold : .regular)
                        }
                        .foregroundStyle(on ? Color.primary : Color.secondary)
                        .frame(maxWidth: .infinity).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityAddTraits(on ? .isSelected : [])
                }
            }
            .padding(.horizontal, 6).padding(.vertical, 10).frame(maxWidth: 320)
            .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
        }
    }
}
