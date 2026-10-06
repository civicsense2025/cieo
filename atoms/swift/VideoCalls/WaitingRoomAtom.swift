import SwiftUI
import Cieo

public struct WaitingRoomAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "waitingroom", category: "Video calls", name: "Waiting-room admit",
        summary: "Each row springs shut on base when its guest is admitted, while a green dot pops on snap and the waiting count rolls its digits. The last admit swaps in an empty terminal.")

    private let guests = [("Priya", "2 min"), ("Sam", "4 min"), ("Jonas", "6 min")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var waiting = [0, 1, 2]
    @State private var popped: Set<Int> = []
    @State private var auto = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Admit everyone to clear the room") {
            VStack(alignment: .leading, spacing: 4) {
                Text("Waiting room").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Admit guests one by one.").font(.system(size: 12)).foregroundStyle(.secondary)
                HStack {
                    Text("Waiting").font(.system(size: 13, weight: .semibold))
                    Spacer()
                    RollingDigits(waiting.count).font(.system(size: 12.5))
                }
                .padding(.bottom, 6)
                VStack(spacing: 0) {
                    ForEach(waiting, id: \.self) { id in
                        HStack(spacing: 10) {
                            ZStack(alignment: .bottomTrailing) {
                                Text(String(guests[id].0.prefix(1)))
                                    .font(.system(size: 13, weight: .semibold))
                                    .frame(width: 32, height: 32)
                                    .background(Circle().fill(.quaternary))
                                Circle().fill(Color.green).frame(width: 12, height: 12)
                                    .overlay(Circle().stroke(.background, lineWidth: 2))
                                    .scaleEffect(popped.contains(id) ? 1 : 0)
                                    .animation(reduce ? nil : .motion(.snap), value: popped)
                            }
                            VStack(alignment: .leading, spacing: 0) {
                                Text(guests[id].0).font(.system(size: 13.5)).lineSpacing(2)
                                Text("waiting \(guests[id].1)").font(.system(size: 12)).foregroundStyle(.secondary)
                            }
                            Spacer()
                            Button("Admit") { admit(id) }
                                .buttonStyle(.bordered).controlSize(.small)
                        }
                        .frame(height: 52)
                        .overlay(alignment: .top) {
                            if id != waiting.first { Divider() }
                        }
                        .motionTransition(.presence)
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: waiting)
                if waiting.isEmpty {
                    Text("✓ Room is clear").font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.green.opacity(0.12)))
                        .motionTransition(.swap(drift: 0))
                }
                HStack {
                    Toggle("Auto-admit", isOn: $auto)
                        .font(.system(size: 12)).foregroundStyle(.secondary)
                    Spacer()
                    Button("Invite back") {
                        withMotion(.base, reduceMotion: reduce) { waiting = [0, 1, 2]; popped = [] }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                }
            }
            .padding(14)
        }
        .task(id: auto) {
            while auto, !waiting.isEmpty, !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1.6))
                if auto, let next = waiting.first { admit(next) }
            }
        }
    }

    private func admit(_ id: Int) {
        withMotion(.snap, reduceMotion: reduce) { popped.insert(id) }
        let delay = reduce ? 0.05 : 0.35
        Task {
            try? await Task.sleep(for: .seconds(delay))
            withMotion(.base, reduceMotion: reduce) { waiting.removeAll { $0 == id } }
        }
    }
}
