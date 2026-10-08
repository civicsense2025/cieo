import SwiftUI
import Cieo

public struct PopoverAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "popover", category: "Overlays", name: "Popover",
        summary: "The panel and its arrow grow out of the trigger on one spring. Copy swaps in a success check, then reverts. Clicking outside or pressing Escape closes it faster than it opened.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var copied = false
    @State private var resetTask: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage {
            ZStack(alignment: .top) {
                if open { Color.clear.contentShape(Rectangle()).onTapGesture { set(false) } }
                Button { set(!open) } label: {
                    Label("Share", systemImage: "link").font(.callout.weight(.medium))
                        .foregroundStyle(.background).padding(.horizontal, 14).frame(height: 36)
                        .background(Capsule().fill(.primary))
                }
                .buttonStyle(.plain)
                .accessibilityHint(open ? "Close share panel" : "Open share panel")
                .overlay(alignment: .top) {
                    if open {
                        panel.alignmentGuide(.top) { $0[.top] - 46 }
                            .transition(reduce ? .identity : .basicsPop(rise: -6))
                    }
                }
            }
            .frame(maxHeight: .infinity, alignment: .top)
            .onKeyPress(.escape) { set(false); return .handled }
        }
    }

    private var panel: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Anyone with the link can view").font(.footnote.weight(.semibold))
            HStack(spacing: 6) {
                Text("example.com/p/spring-launch").font(.caption).lineLimit(1)
                    .padding(.horizontal, 9).frame(maxWidth: .infinity, minHeight: 32, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.15)).opacity(0.10))
                copyButton
            }
        }
        .padding(14).frame(width: 260)
        .basicsPanel()
        .overlay(alignment: .top) {
            Rectangle().fill(.background).frame(width: 10, height: 10)
                .rotationEffect(.degrees(45)).offset(y: -5).allowsHitTesting(false)
        }
    }

    private var copyButton: some View {
        Button(action: copy) {
            ZStack {
                if copied {
                    Label("Copied", systemImage: "checkmark").motionTransition(.swap(drift: 3))
                } else {
                    Text("Copy").motionTransition(.swap(drift: 3))
                }
            }
            .font(.caption.weight(.medium)).foregroundStyle(copied ? Color.green : Color.primary)
            .frame(width: 76, height: 32)
            .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.15)).opacity(0.10))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .motion(.base, value: copied)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(copied ? "Copied" : "Copy link")
    }

    private func set(_ on: Bool) {
        withMotion(on ? .base : .snap, reduceMotion: reduce) { open = on }
    }

    private func copy() {
        copied = true
        resetTask?.cancel()
        resetTask = Task {
            try? await Task.sleep(for: .seconds(1.6))
            guard !Task.isCancelled else { return }
            copied = false
        }
    }
}
