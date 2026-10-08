import SwiftUI
import Cieo

public struct RunningTimerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "timer", category: "Admin kit", name: "Running timer",
        summary: "Start morphs one button: the width springs to the new label, the fill goes from ink to danger, and Start and Stop swap by the blur rule while the task select swaps to its title. The h:mm:ss readout is read from the clock, and each digit that changes rolls in as its own swap. Stop rolls the digits down to zero, and the entry enters at the top of the log while the older rows spring down a slot and the last one fades out.")

    private struct Entry: Identifiable { let id = UUID(); let task: String; let secs: Int; var shown = true }
    private let tasks = ["Write launch post", "Pricing page QA", "Member emails"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var task = 0
    @State private var running = false
    @State private var secs = 0
    @State private var log: [Entry] = []
    public init() {}

    public var body: some View {
        AtomStage(hint: "Start, then stop the timer") {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 12) {
                    ZStack(alignment: .leading) {
                        if running { Text(tasks[task]).font(.footnote.weight(.medium)).motionTransition(.swap()) }
                        else { Picker("Task", selection: $task) { ForEach(tasks.indices, id: \.self) { Text(tasks[$0]).tag($0) } }.labelsHidden().frame(width: 170).motionTransition(.swap()) }
                    }.frame(width: 170, alignment: .leading)
                    HStack(spacing: 0) {
                        RollingDigits(String(secs / 3600)); Text(":"); RollingDigits(String(format: "%02d", secs / 60 % 60)); Text(":"); RollingDigits(String(format: "%02d", secs % 60))
                    }.font(.title3.weight(.medium)).accessibilityElement(children: .ignore).accessibilityLabel("Elapsed").accessibilityValue("\(secs / 60) minutes \(secs % 60) seconds")
                    Button(action: toggle) { ZStack { Text(running ? "Stop" : "Start").id(running).motionTransition(.swap()) }
                        .font(.footnote.weight(.semibold)).foregroundStyle(Color(white: 1, opacity: 0.95)).frame(width: running ? 60 : 68, height: 30).background(Capsule().fill(running ? Color.red : Color.primary)) }
                        .buttonStyle(.plain)
                }.animation(reduce ? nil : .motion(.base), value: running)
                VStack(spacing: 0) { ForEach(log) { e in
                    EditorHeightReveal(progress: e.shown ? 1 : 0) { HStack { Text(e.task).font(.footnote); Spacer(); Text(String(format: "%d:%02d", e.secs / 60, e.secs % 60)).font(.caption).monospacedDigit().foregroundStyle(.secondary) }.frame(height: 32).overlay(alignment: .bottom) { Divider() } }.clipped()
                } }.frame(maxWidth: 340, alignment: .top)
            }
            .frame(maxWidth: 340)
        }
        .task(id: running) {
            guard running else { return }
            let start = Date.timeIntervalSinceReferenceDate - Double(secs)
            while !Task.isCancelled { try? await Task.sleep(for: .milliseconds(250)); if Task.isCancelled { return }; let s = Int(Date.timeIntervalSinceReferenceDate - start); if s != secs { secs = s } }
        }
    }

    private func toggle() {
        if !running { withMotion(.base, reduceMotion: reduce) { running = true }; return }
        let e = Entry(task: tasks[task], secs: secs, shown: false)
        withMotion(.base, reduceMotion: reduce) { running = false; secs = 0; log.insert(e, at: 0); if log.count > 3 { log.removeLast() } }
        DispatchQueue.main.async { withMotion(.base, reduceMotion: reduce) { if let i = log.firstIndex(where: { $0.id == e.id }) { log[i].shown = true } } }
    }
}
