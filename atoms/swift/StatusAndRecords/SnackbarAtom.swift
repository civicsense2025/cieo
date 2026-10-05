import SwiftUI
import MotionKit

public struct SnackbarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "snackbar", category: "Status and records", name: "Snackbar with action",
        summary: "The snackbar rises from the bottom edge while a thin bar under it drains over six seconds. Hovering or focusing the snackbar pauses the countdown and resuming pushes the deadline back by exactly the paused time. Open swaps its label to Done with a tint morph, the countdown freezes, and the snackbar leaves 0.9s later. Dismiss and the timeout use the same exit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = false
    @State private var done = false
    @State private var hovering = false
    @State private var deadline = Date()
    @State private var frozen: Double = 6
    private let duration = 6.0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover to pause the countdown") {
            ZStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack { Text("Pages").font(.headline); Spacer(); Button("Export pages") { show() }.buttonStyle(AgPress(tone: .info)) }
                    ForEach([("Spring launch", "Published"), ("Pricing", "Published"), ("Team", "Draft")], id: \.0) { r in
                        HStack { Text(r.0); Spacer(); Text(r.1).foregroundStyle(.secondary) }.font(.callout)
                    }
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).padding(10)
                if shown { bar.transition(reduce ? .identity : .motionPresence).padding(10) }
            }
            .frame(maxWidth: 420, minHeight: 220)
            .animation(reduce ? nil : .motion(.base), value: shown)
        }
        .task(id: shown) {
            while shown, !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 50_000_000)
                if !hovering, !done, Date() >= deadline { dismiss() }
            }
        }
    }

    private var bar: some View {
        VStack(spacing: 0) {
            HStack {
                Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                VStack(alignment: .leading, spacing: 0) { Text("Export ready").font(.callout.weight(.medium)); Text("pages-2026-10.zip, 4.2 MB").font(.caption).foregroundStyle(.secondary) }
                Spacer()
                Button { open() } label: { HStack(spacing: 4) { if done { Image(systemName: "checkmark") }; SwapText(done ? "Done" : "Open") } }
                    .buttonStyle(AgPress(tone: done ? .success : nil))
                Button { dismiss() } label: { Image(systemName: "xmark") }.buttonStyle(.plain).accessibilityLabel("Dismiss")
            }.padding(10)
            TimelineView(.animation(paused: reduce || done)) { _ in
                let remaining = done ? frozen : hovering ? frozen : max(0, deadline.timeIntervalSinceNow)
                GeometryReader { g in Rectangle().fill(Color.accentColor).frame(width: g.size.width * remaining / duration) }.frame(height: 3)
            }
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 10)).clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.quaternary)).shadow(radius: 6, y: 2)
        .onHover { h in
            if h { frozen = max(0, deadline.timeIntervalSinceNow) } else { deadline = Date().addingTimeInterval(frozen) }
            hovering = h
        }
    }

    private func show() {
        done = false; hovering = false; deadline = Date().addingTimeInterval(duration); frozen = duration
        withMotion(.base, reduceMotion: reduce) { shown = true }
    }
    private func open() {
        frozen = max(0, deadline.timeIntervalSinceNow)
        withMotion(.base, reduceMotion: reduce) { done = true }
        Task { @MainActor in try? await Task.sleep(nanoseconds: 900_000_000); dismiss() }
    }
    private func dismiss() { withMotion(.snap, reduceMotion: reduce) { shown = false } }
}
