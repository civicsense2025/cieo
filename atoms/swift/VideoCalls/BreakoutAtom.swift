import SwiftUI
import Cieo

public struct BreakoutAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "breakout", category: "Video calls", name: "Breakout shuffle",
        summary: "Tiles fly from the lobby to room slots staggered on base, room tags swap to seated counts, and a digit clock counts down. At zero a success terminal holds the rooms open.")

    private let names = ["Maya", "Theo", "Ada", "Jonas"]
    private let tints: [Color] = [.green, .orange, .blue, .pink]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shuffled = false
    @State private var seconds = 10
    @State private var length = 10
    @State private var opened = false
    public init() {}

    private func slot(_ i: Int, _ size: CGSize) -> CGPoint {
        if !shuffled { return CGPoint(x: 12 + CGFloat(i) * 76 + 35, y: 14 + 17) }
        let room = i % 2, k = i / 2
        let x = room == 0 ? 12 + CGFloat(k) * 76 + 35 : size.width / 2 + 4 + CGFloat(k) * 76 + 35
        return CGPoint(x: x, y: (room == 0 ? 78 : 124) + 17)
    }

    public var body: some View {
        AtomStage(hint: "Shuffle deals the rooms and starts the clock") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Breakout shuffle").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Tiles fly to rooms; the clock counts down.").font(.system(size: 12)).foregroundStyle(.secondary)
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 12).fill(Color(white: 0.06)).frame(height: 172)
                    Text("Room A · ").font(.system(size: 11.5)).foregroundColor(Color.white.opacity(0.8))
                        + Text(shuffled ? "2 seated ✓" : "waiting").font(.system(size: 11.5))
                        .foregroundColor(shuffled ? Color.green : Color.white.opacity(0.8))
                    Text("Room B · ").font(.system(size: 11.5)).foregroundColor(Color.white.opacity(0.6))
                        + Text(shuffled ? "2 seated ✓" : "waiting").font(.system(size: 11.5))
                        .foregroundColor(shuffled ? Color.green : Color.white.opacity(0.8))
                    GeometryReader { geo in
                        ForEach(0..<names.count, id: \.self) { i in
                            Text(names[i]).font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(.white).frame(width: 70, height: 34)
                                .background(RoundedRectangle(cornerRadius: 8).fill(tints[i].opacity(0.7)))
                                .position(slot(i, geo.size))
                                .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.05), value: shuffled)
                        }
                    }
                }
                .frame(height: 172)
                HStack {
                    Text("Doors open in").font(.system(size: 12)).foregroundStyle(.secondary)
                    RollingDigits(String(format: "%02d:%02d", seconds / 60, seconds % 60)).font(.system(size: 13))
                    Spacer()
                    Button(opened ? "Shuffle again" : "Shuffle") {
                        withMotion(.base, reduceMotion: reduce) {
                            shuffled = true; opened = false; seconds = length
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                }
                if opened {
                    Text("✓ Rooms are open — have fun").font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.green.opacity(0.12)))
                        .motionTransition(.swap(drift: 0))
                }
                HStack(spacing: 6) {
                    Text("Timer").font(.system(size: 12)).foregroundStyle(.secondary)
                    Button("5s") { length = 5 }.buttonStyle(.bordered).controlSize(.mini)
                    Button("10s") { length = 10 }.buttonStyle(.bordered).controlSize(.mini)
                }
            }
            .padding(14)
        }
        .task(id: shuffled) {
            guard shuffled else { return }
            while seconds > 0, !Task.isCancelled {
                try? await Task.sleep(for: .seconds(1))
                seconds -= 1
            }
            if !Task.isCancelled {
                withMotion(.snap, reduceMotion: reduce) { opened = true }
            }
        }
    }
}
