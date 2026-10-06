import SwiftUI
import Cieo

public struct StatCountAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "statcount", category: "Landing", name: "Stat count-up",
        summary: "The count fires once at 50% visibility and rides lazy rolling digits to 12,840. Only after the number settles does the caption swap from counting to the final label.")

    private let target = 12840.0
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var progress = 0.0
    @State private var fired = false
    @State private var settled = false
    public init() {}

    private var value: Int { Int(progress * target) }

    public var body: some View {
        AtomStage(hint: "Counts once at 50% in view") {
            VStack(spacing: 8) {
                Text("Powering small teams").font(.headline)
                Text("\(value)").font(.title.weight(.semibold)).monospacedDigit()
                ZStack {
                    if settled { Text("paying members").font(.caption).foregroundStyle(.secondary).id(1).motionTransition(.swap()) }
                    else { Text("counting…").font(.caption).foregroundStyle(.secondary).id(0).motionTransition(.swap()) }
                }
                Button("Replay") { replay() }.font(.caption).buttonStyle(.borderless)
            }.frame(width: 320)
            .onAppear { fire() }
        }
    }

    private func fire() {
        guard !fired else { return }
        fired = true
        if reduce { progress = 1; settled = true; return }
        withMotion(.lazy, reduceMotion: reduce) { progress = 1 }
        Task {
            try? await Task.sleep(for: .seconds(1.6))
            withMotion(.base, reduceMotion: reduce) { settled = true }
        }
    }

    private func replay() {
        var t = Transaction(); t.disablesAnimations = true
        withTransaction(t) { progress = 0; settled = false; fired = false }
        fire()
    }
}
