import SwiftUI
import Cieo

public struct CompileRunAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "compilerun", category: "Writing", name: "Compile run",
        summary: "Run creeps the bar most of the way on the clock, then springs it shut. Chapter ticks land one after another and the status swaps to open the book.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var progress: CGFloat = 0
    @State private var tweak = true
    @State private var ticks = 0
    @State private var done = false
    @State private var running = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Run builds the manuscript") {
            VStack(spacing: 8) {
                GeometryReader { g in
                    Capsule().fill(.quaternary.opacity(0.4))
                        .overlay(alignment: .leading) {
                            Capsule().fill(done ? .green : .primary)
                                .frame(width: g.size.width * progress)
                                .animation(reduce ? nil : .motion(.base), value: progress)
                        }
                }
                .frame(height: 8)
                HStack {
                    ForEach(0..<5, id: \.self) { i in
                        Text("ch\(i + 1)").font(.system(size: 12)).foregroundStyle(.secondary)
                            .opacity(i < ticks ? 1 : 0.25)
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.06), value: ticks)
                    }
                }
                HStack {
                    ZStack(alignment: .leading) { status.id(done).motionTransition(.swap()) }
                        .font(.system(size: 14)).frame(width: 170, height: 20, alignment: .leading)
                        .animation(reduce ? nil : .motion(.base), value: done)
                    Spacer()
                    Button(running ? "…" : "Run") { run() }
                        .buttonStyle(.borderedProminent).frame(minHeight: 32).disabled(running)
                }
                Toggle("Weave footnotes", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .frame(maxWidth: 320)
        }
    }

    @ViewBuilder private var status: some View {
        if done { Text("Open manuscript →").foregroundStyle(.green).fontWeight(.semibold) }
        else if running { Text("Weaving chapters…").foregroundStyle(.secondary) }
        else { Text("Ready to compile").foregroundStyle(.secondary) }
    }

    private func run() {
        guard !running else { return }
        running = true; done = false; ticks = 0
        withAnimation(reduce ? nil : .linear(duration: 2.2)) { progress = 0.9 }
        for i in 1...5 {
            DispatchQueue.main.asyncAfter(deadline: .now() + (reduce ? 0 : 0.4 + Double(i) * 0.06)) {
                withMotion(.base, reduceMotion: reduce) { ticks = i }
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + (reduce ? 0 : 2.4)) {
            withMotion(.base, reduceMotion: reduce) { progress = 1; done = true; running = false }
        }
    }
}
