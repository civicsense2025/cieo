import SwiftUI
import Cieo

public struct UndoToastAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "undotoast", category: "Guidance", name: "Undo toast",
        summary: "Archiving parks the step behind a rising toast whose ring drains over six seconds. Undo restores it with a swapped-in check; expiry and Undo both land quietly.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var gone = false
    @State private var checked = false
    @State private var flow: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Archive parks the step · ring drains in 6s") {
            VStack(spacing: 8) {
                ZStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Roadmap").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                        Text("Archive a step — it waits behind the toast.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                        if !gone {
                            HStack(spacing: 10) {
                                Text("Q3").font(.footnote.weight(.semibold)).foregroundStyle(Color.accentColor)
                                    .frame(width: 30, height: 30).background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                                VStack(alignment: .leading, spacing: 0) {
                                    HStack(spacing: 4) {
                                        Text("Launch checklist").font(.system(size: 14))
                                        if checked { Image(systemName: "checkmark").font(.caption2.weight(.bold)).foregroundStyle(.green).id("ck").motionTransition(.swap()) }
                                    }
                                    Text("4 of 4 · ships Friday").font(.caption).foregroundStyle(.secondary).lineSpacing(3)
                                }
                                Spacer()
                                Button("Archive", action: archive).buttonStyle(.bordered).controlSize(.small)
                            }
                            .padding(.vertical, 8)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                        }
                        Spacer(minLength: 54)
                    }
                    .padding(.horizontal, 14).padding(.vertical, 14)
                    .frame(width: 320, height: 210, alignment: .topLeading)
                    .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                    .clipped()
                    if gone {
                        HStack(spacing: 10) {
                            TimelineView(.animation(paused: reduce)) { tl in
                                Ring(progress: reduce ? 1 : progress(at: tl.date))
                            }.frame(width: 20, height: 20)
                            Text("Step archived").font(.system(size: 13)).lineSpacing(3).foregroundStyle(.white)
                            Spacer()
                            Button("Undo", action: undo).buttonStyle(.borderless).foregroundStyle(.white).fontWeight(.semibold)
                        }
                        .font(.footnote).padding(10).frame(width: 296)
                        .background(Color.primary, in: RoundedRectangle(cornerRadius: 10))
                        .padding(.bottom, 12)
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: gone)
                HStack(spacing: 6) {
                    Text("Demo:").font(.caption).foregroundStyle(.secondary)
                    Button("Replay archive") { reset(); archive() }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }

    @State private var archivedAt = Date.distantPast
    private func progress(at date: Date) -> Double { min(1, max(0, date.timeIntervalSince(archivedAt) / 6)) }

    private func archive() {
        reset()
        archivedAt = Date()
        withMotion(.soft, reduceMotion: reduce) { gone = true }
        withMotion(.base, reduceMotion: reduce) { checked = false }
        flow = Task {
            try? await Task.sleep(for: .seconds(6)); if Task.isCancelled { return }
            withMotion(.snap, reduceMotion: reduce) { gone = false }
        }
    }

    private func undo() {
        flow?.cancel()
        withMotion(.soft, reduceMotion: reduce) { gone = false }
        withMotion(.base, reduceMotion: reduce) { checked = true }
    }

    private func reset() {
        flow?.cancel()
        gone = false; checked = false
    }
}

private struct Ring: View {
    var progress: Double
    var body: some View {
        ZStack {
            Circle().stroke(.white.opacity(0.25), lineWidth: 2.5)
            Circle().trim(from: 0, to: 1 - progress).stroke(.white, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}
