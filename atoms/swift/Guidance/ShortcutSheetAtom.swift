import SwiftUI
import Cieo

public struct ShortcutSheetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "shortcutsheet", category: "Guidance", name: "Shortcut sheet",
        summary: "Holding springs the sheet up; keycaps snap under the pointer and the grid swaps by category. Release snaps shut — the resting form is the terminal.")

    private let groups: [(name: String, keys: [(key: String, action: String)])] = [
        ("General", [("⌘K", "Command menu"), ("⌘S", "Save draft"), ("⌘⏎", "Publish")]),
        ("Edit", [("⌘Z", "Undo"), ("⇧⌘Z", "Redo"), ("⌘D", "Duplicate")])]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var cat = 0
    @State private var pressed: String?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hold the button · tap a keycap") {
            VStack(spacing: 8) {
                VStack(spacing: 6) {
                    Text("Editor").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                    Text("Hold the button to peek at shortcuts.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                    Text("Hold for shortcuts").font(.footnote.weight(.medium)).foregroundStyle(.background)
                        .padding(.horizontal, 14).padding(.vertical, 8).background(Color.primary, in: RoundedRectangle(cornerRadius: 9))
                        .frame(minHeight: 32)
                        .onLongPressGesture(minimumDuration: 0.2, pressing: { p in
                            withMotion(p ? .base : .snap, reduceMotion: reduce) { open = p }
                        }, perform: {})
                    if open {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text("Shortcuts").font(.footnote.weight(.semibold))
                                Spacer()
                                Text("release to close").font(.caption).foregroundStyle(.secondary)
                            }
                            ZStack(alignment: .topLeading) {
                                VStack(spacing: 6) {
                                    ForEach(groups[cat].keys, id: \.key) { k in
                                        Button { tap(k.key) } label: {
                                            HStack(spacing: 10) {
                                                Text(k.key).font(.caption.monospacedDigit()).frame(minWidth: 30, minHeight: 28)
                                                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 7))
                                                    .scaleEffect(pressed == k.key ? 0.92 : 1)
                                                Text(k.action).font(.system(size: 13)).lineSpacing(3)
                                                Spacer()
                                            }
                                        }.buttonStyle(.plain)
                                    }
                                }.id(cat).motionTransition(.swap())
                            }
                        }
                        .padding(12).background(.background, in: RoundedRectangle(cornerRadius: 10))
                        .shadow(color: .black.opacity(0.2), radius: 8, y: 2)
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(maxWidth: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                .animation(reduce ? nil : .motion(.base), value: open)
                HStack(spacing: 6) {
                    Text("Keys:").font(.caption).foregroundStyle(.secondary)
                    ForEach(groups.indices, id: \.self) { i in
                        Button(groups[i].name) { withMotion(.base, reduceMotion: reduce) { cat = i } }
                            .buttonStyle(.bordered).controlSize(.mini)
                    }
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }

    private func tap(_ key: String) {
        withMotion(.snap, reduceMotion: reduce) { pressed = key }
        Task { try? await Task.sleep(for: .seconds(0.25)); withMotion(.snap, reduceMotion: reduce) { pressed = nil } }
    }
}
