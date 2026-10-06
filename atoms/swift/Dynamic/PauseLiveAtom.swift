import SwiftUI
import Cieo

public struct PauseLiveAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pauselive", category: "Dynamic", name: "Pause-live buffer",
        summary: "Freeze raises a paused pill with a rolling backlog count. Resume drains the backlog top-down with stagger, then the pill settles back to live.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let events = ["build passed", "preview ready", "edge cached", "tests green",
                          "bundle cut", "canary at 5%", "rollback armed", "logs shipped"]
    @State private var items = ["build passed", "preview ready", "edge cached", "tests green"]
    @State private var backlog: [String] = []
    @State private var frozen = false
    @State private var keepBuffer = true
    @State private var tick = 0
    private let timer = Timer.publish(every: 1.4, on: .main, in: .common).autoconnect()
    public init() {}

    public var body: some View {
        AtomStage(hint: "Freeze to pile up · resume drains top-down") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Deploy feed").font(.headline)
                    Spacer()
                    HStack(spacing: 6) {
                        Circle().fill(frozen ? Color.orange : Color.green).frame(width: 8, height: 8)
                        Text(frozen ? "Paused · \(backlog.count) buffered" : "Live")
                            .font(.caption).monospacedDigit()
                    }
                }
                VStack(spacing: 0) {
                    ForEach(items.indices, id: \.self) { i in
                        HStack {
                            Text(items[i]).font(.subheadline)
                            Spacer()
                            Text("#\(tick - (items.count - 1 - i))").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                        }
                        .frame(minHeight: 34)
                        .transition(.opacity.combined(with: .move(edge: .top)))
                        if i < items.count - 1 { Divider() }
                    }
                }
                .frame(minHeight: 136, alignment: .top)
                .animation(reduce ? nil : .motion(.base), value: items)
                Text(frozen ? "Holding · \(backlog.count) waiting" : "Live · caught up")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                HStack {
                    Button(frozen ? "Resume" : "Freeze") {
                        withAnimation(reduce ? nil : .motion(.base)) {
                            frozen.toggle()
                            if !frozen {
                                let waiting = backlog
                                backlog = []
                                for (i, ev) in waiting.enumerated() {
                                    withAnimation(reduce ? nil : .motion(.base).delay(0.1 + Double(i) * 0.12)) {
                                        items.append(ev); items.removeFirst(); tick += 1
                                    }
                                }
                            }
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.regular)
                    Spacer()
                    Toggle("keep buffer", isOn: $keepBuffer).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.checkbox)
                }
            }
            .frame(maxWidth: 420)
        }
        .onReceive(timer) { _ in
            guard !frozen else {
                if keepBuffer { backlog.append("\(events[tick % events.count]) · #\(tick)"); tick += 1 }
                return
            }
            guard backlog.isEmpty else { return }
            withAnimation(reduce ? nil : .motion(.base)) {
                items.append(events[tick % events.count]); items.removeFirst(); tick += 1
            }
        }
    }
}
