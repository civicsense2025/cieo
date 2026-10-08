import SwiftUI

/// Tab hover cards: rest-then-rise, glide tab-to-tab, preview crossfades.
public struct TabCardsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tabcards", category: "Chrome", name: "Tab Cards", summary: "Tab hover cards: rest-then-rise, glide tab-to-tab, preview crossfades.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var current = 0
    @State private var shown = false
    @State private var pinned = false
    private let tabs = [("Docs", "Editor draft autosaves here."), ("Inbox", "4 unread threads wait here."), ("Charts", "Weekly actives, up 12%.")]

    public init() {}
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Tab hover cards").font(.system(size: 15, weight: .semibold))
            Text("Rest 300ms to preview · ←→ move · Enter pins · Esc dismisses")
                .font(.system(size: 12.5)).foregroundStyle(.secondary)
            VStack(spacing: 8) {
                HStack(spacing: 8) {
                    ForEach(tabs.indices, id: \.self) { i in
                        Button(tabs[i].0) { current = i; shown = true }
                            .frame(maxWidth: .infinity, minHeight: 32)
                    }
                }
                .focusable(true)
                .directionKeys { dir in
                    if dir == .right { current = (current + 1) % tabs.count; shown = true }
                    else if dir == .left { current = (current + tabs.count - 1) % tabs.count; shown = true }
                }
                .escapeKey { pinned = false; shown = false }
                ZStack {
                    if shown {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(tabs[current].0).font(.system(size: 13.5, weight: .semibold))
                            Text(tabs[current].1).font(.system(size: 12.5)).foregroundStyle(.secondary)
                            Text(pinned ? "Pinned · \(tabs[current].0) ✓" : "Tab \(current + 1) of \(tabs.count)")
                                .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
                        }
                        .padding(.horizontal, 16).padding(.vertical, 14)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(.background, in: RoundedRectangle(cornerRadius: 10))
                        .transition(reduce ? .opacity : .opacity.combined(with: .move(edge: .bottom)))
                        .id(current)
                    }
                }
                .frame(height: 132, alignment: .top)
                .animation(reduce ? nil : .spring(response: 0.3), value: current)
                .animation(reduce ? nil : .spring(response: 0.3), value: shown)
                Button(pinned ? "Unpin" : "Pin card") { pinned.toggle(); shown = true }
                    .frame(minHeight: 32)
            }
            .padding(15)
            .frame(maxWidth: 460)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
        }
    }
}
