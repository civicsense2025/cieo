import SwiftUI
import Cieo

public struct WireFeedAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "wirefeed", category: "Writing", name: "Wire-feed ticker",
        summary: "New wires push the stack with a 60ms stagger while the badge count rolls. Pause stops the feed.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var wires = ["Wire 2", "Wire 1"]
    @State private var tweak = true
    @State private var paused = false
    @State private var timer: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "New wires push the stack") {
            VStack(spacing: 8) {
                HStack {
                    Text("Wires **\(wires.count)**").font(.subheadline)
                    Spacer()
                    Button("New wire") { add() }.buttonStyle(.bordered).frame(minHeight: 32)
                    Button(paused ? "Resume" : "Pause") { paused.toggle() }.buttonStyle(.bordered).frame(minHeight: 32)
                }
                VStack(spacing: 8) {
                    ForEach(Array(wires.enumerated()), id: \.offset) { i, w in
                        Text(w).font(.system(size: 14)).padding(14).frame(maxWidth: .infinity, alignment: .leading)
                            .background(.quaternary).clipShape(RoundedRectangle(cornerRadius: 8))
                            .transition(.move(edge: .top).combined(with: .opacity))
                            .animation(reduce ? nil : .motion(.base).delay(0.06 * Double(i)), value: wires)
                    }
                }
                Toggle("Auto-fetch wires", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }.frame(maxWidth: 320)
        }
        .onAppear { start() }.onDisappear { timer?.cancel() }
    }

    private func add() { withMotion(.base, reduceMotion: reduce) { wires.insert("Wire \(wires.count + 1)", at: 0); wires = Array(wires.prefix(4)) } }
    private func start() { timer = Task { while true { try? await Task.sleep(for: .milliseconds(2600)); if Task.isCancelled { return }; if !paused { add() } } } }
}
