import SwiftUI
import Cieo

public struct MemoryToggleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "memtoggle", category: "AI chat", name: "Memory toggle",
        summary: "The knob slides with trailing edges on base. The saved-fact chip opens its width first, then the text fades in as the terminal state.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var on = false
    @State private var chipOpen = false
    @State private var chipText = false
    @State private var showSource = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Flip the switch to save the fact") {
            VStack(alignment: .leading, spacing: 10) {
                Text("Memory").font(.system(size: 15, weight: .semibold))
                HStack {
                    Text("Remember details").font(.system(size: 13.5))
                    Spacer()
                    Toggle("Remember details", isOn: $on)
                        .labelsHidden().toggleStyle(.switch).controlSize(.regular)
                        .onChange(of: on) { _, next in flip(next) }
                }
                if chipOpen {
                    HStack(spacing: 8) {
                        Image(systemName: "bookmark.fill").font(.system(size: 13)).foregroundStyle(.secondary)
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Prefers morning standup").font(.system(size: 13))
                            if showSource {
                                Text("from yesterday’s chat").font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.18)))
                    .opacity(chipText ? 1 : 0)
                    .motionTransition(.presence)
                }
                SwapText(on ? "Saved to memory" : "Memory off — nothing saved")
                    .font(.caption).foregroundStyle(on ? .green : .secondary)
                    .frame(height: 18, alignment: .leading)
                Toggle("Show source", isOn: $showSource).font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 300)
            .animation(reduce ? nil : .motion(.base), value: on)
        }
    }

    private func flip(_ next: Bool) {
        if reduce {
            chipOpen = next
            chipText = next
            return
        }
        if next {
            withMotion(.base, reduceMotion: reduce) { chipOpen = true }
            Task {
                try? await Task.sleep(for: .seconds(Motion.exit))
                withMotion(.base, reduceMotion: reduce) { chipText = true }
            }
        } else {
            withMotion(.snap, reduceMotion: reduce) {
                chipText = false
                chipOpen = false
            }
        }
    }
}
