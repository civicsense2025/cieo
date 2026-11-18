import SwiftUI
import Cieo

public struct WireFeedAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "wirefeed", category: "Writing", name: "Wire-feed ticker",
        summary: "New wires push the stack with a 60ms stagger while the badge count rolls. Pause stops the feed.")
    private struct WireEntry: Identifiable, Equatable { let id: Int; var label: String { "Wire \(id)" } }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var wires = [WireEntry(id: 2), WireEntry(id: 1)]
    @State private var nextId = 3
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
                    ForEach(Array(wires.enumerated()), id: \.element.id) { i, w in
                        Text(w.label).font(.system(size: 14)).padding(14).frame(maxWidth: .infinity, alignment: .leading)
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

    private func add() {
        withMotion(.base, reduceMotion: reduce) {
            wires.insert(WireEntry(id: nextId), at: 0)
            nextId += 1
            wires = Array(wires.prefix(4))
        }
    }
    private func start() { timer = Task { while true { try? await Task.sleep(for: .milliseconds(2600)); if Task.isCancelled { return }; if !paused && tweak { add() } } } }
}
