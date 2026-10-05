import SwiftUI
import MotionKit

public struct OfflineBannerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "offline", category: "Guidance", name: "Offline banner",
        summary: "Losing the connection drops a warning banner that pushes content down. Reconnecting swaps the text to a spinner, then to a success message, and the banner leaves after a moment.")

    private enum Msg { case off, sync, on }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var visible = false
    @State private var msg = Msg.off
    @State private var flow: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Go offline, then reconnect") {
            VStack(spacing: 10) {
                ZStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Drafts").font(.headline)
                        ForEach(["Spring launch post", "Pricing table", "Welcome email"], id: \.self) { Text($0).font(.footnote).foregroundStyle(.secondary) }
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).padding(16)
                    .offset(y: visible ? 38 : 0)
                    banner.frame(height: 38).offset(y: visible ? 0 : -38)
                }
                .frame(width: 320, height: 200).clipped()
                .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                Button(!visible ? "Go offline" : "Reconnect", action: toggle).buttonStyle(.bordered).controlSize(.small)
                    .disabled(visible && msg != .off)
            }
        }
    }

    private var banner: some View {
        ZStack {
            Group {
                switch msg {
                case .off: HStack(spacing: 8) { Pulse(); Text("You’re offline. Changes will sync later.") }
                case .sync: HStack(spacing: 8) { Spin(); Text("Reconnecting and syncing 3 changes…") }
                case .on: Label("Back online. All changes synced.", systemImage: "checkmark").foregroundStyle(.green).fontWeight(.medium)
                }
            }.id(msg).motionTransition(.swap())
        }
        .font(.footnote).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading).padding(.horizontal, 14)
        .background(msg == .on ? Color.green.opacity(0.18) : Color.orange.opacity(0.22))
        .animation(reduce ? nil : .motion(.base), value: msg)
    }

    private func toggle() {
        flow?.cancel()
        if !visible { msg = .off; withMotion(.base, reduceMotion: reduce) { visible = true }; return }
        withMotion(.base, reduceMotion: reduce) { msg = .sync }
        flow = Task {
            try? await Task.sleep(for: .seconds(1.2)); if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { msg = .on }
            try? await Task.sleep(for: .seconds(1.6)); if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { visible = false }
        }
    }
}

private struct Pulse: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var body: some View {
        TimelineView(.animation(paused: reduce)) { tl in
            Circle().fill(.orange).frame(width: 8, height: 8).opacity(reduce ? 1 : 0.55 + 0.45 * cos(tl.date.timeIntervalSinceReferenceDate * 4))
        }.accessibilityHidden(true)
    }
}

private struct Spin: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var body: some View {
        TimelineView(.animation(paused: reduce)) { tl in
            Circle().trim(from: 0, to: 0.25).stroke(style: StrokeStyle(lineWidth: 2.5, lineCap: .round)).frame(width: 13, height: 13)
                .rotationEffect(.degrees(reduce ? 0 : tl.date.timeIntervalSinceReferenceDate * 420))
        }.accessibilityHidden(true)
    }
}
