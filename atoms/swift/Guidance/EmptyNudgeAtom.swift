import SwiftUI
import Cieo

public struct EmptyNudgeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "emptynudge", category: "Guidance", name: "Empty nudge",
        summary: "The empty art breathes on a slow clock while the CTA rings once, then goes quiet. Tips rotate underneath and creating a report swaps the card to a success terminal.")

    private let tips = ["Reports land here every Monday.", "Invite a teammate to share the load.", "Star one metric to watch it closely."]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var tip = 0
    @State private var breathe = true
    @State private var done = false
    @State private var pulse = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "The CTA nudges once, then rests") {
            VStack(spacing: 8) {
                VStack(spacing: 8) {
                    TimelineView(.animation(paused: reduce || !breathe || done)) { tl in
                        let s = (reduce || !breathe || done) ? 1 : 1 + 0.025 * sin(tl.date.timeIntervalSinceReferenceDate * 2.2)
                        Image(systemName: "tray").font(.largeTitle).foregroundStyle(.secondary).scaleEffect(s)
                    }
                    .frame(width: 44, height: 44).background(.quaternary, in: RoundedRectangle(cornerRadius: 14))
                    ZStack {
                        if done {
                            VStack(spacing: 4) {
                                Text("First report queued ✓").font(.system(size: 15, weight: .semibold)).foregroundStyle(.green)
                                Text("It will land here on Monday morning.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                                Button("Start over") { withMotion(.base, reduceMotion: reduce) { done = false } }
                                    .buttonStyle(.bordered).controlSize(.small).padding(.top, 2)
                            }.id("done").motionTransition(.swap())
                        } else {
                            VStack(spacing: 2) {
                                Text("No reports yet").font(.system(size: 15, weight: .semibold))
                                Text(tips[tip]).font(.footnote).foregroundStyle(.secondary).lineSpacing(3).id(tip).motionTransition(.swap())
                            }.id("empty").motionTransition(.swap())
                        }
                    }
                    if !done {
                        Button("Create a report") { withMotion(.base, reduceMotion: reduce) { done = true } }
                            .buttonStyle(.borderedProminent).controlSize(.regular).frame(minHeight: 32)
                            .shadow(color: pulse ? Color.accentColor.opacity(0.45) : .clear, radius: pulse ? 7 : 0)
                            .scaleEffect(pulse ? 1.03 : 1)
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 16)
                .frame(maxWidth: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                HStack(spacing: 6) {
                    Text("Tips:").font(.caption).foregroundStyle(.secondary)
                    ForEach(tips.indices, id: \.self) { i in
                        Button("\(i + 1)") { withMotion(.base, reduceMotion: reduce) { tip = i } }.buttonStyle(.bordered).controlSize(.mini)
                    }
                    Button(breathe ? "Air: on" : "Air: off") { breathe.toggle() }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
        .task { await cycle() }
        .onAppear {
            guard !reduce else { return }
            Task {
                try? await Task.sleep(for: .seconds(0.4))
                withMotion(.base, reduceMotion: reduce) { pulse = true }
                try? await Task.sleep(for: .seconds(1.0))
                withMotion(.base, reduceMotion: reduce) { pulse = false }
            }
        }
    }

    private func cycle() async {
        while !Task.isCancelled {
            try? await Task.sleep(for: .seconds(3.2))
            if !done { withMotion(.base, reduceMotion: reduce) { tip = (tip + 1) % tips.count } }
        }
    }
}
