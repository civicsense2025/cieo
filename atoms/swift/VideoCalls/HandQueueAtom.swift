import SwiftUI
import Cieo

public struct HandQueueAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "handqueue", category: "Video calls", name: "Hand-raise queue",
        summary: "Raised hands rise into the queue staggered 40 ms apart on base, each with a rolling order digit. Lowering fades a row out; the last hand out swaps the header to a clear terminal.")

    private let names = ["Maya", "Theo", "Ada", "Jonas"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var order: [Int] = [1]
    @State private var slow = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Raise and lower hands; lower every hand to clear") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Hand-raise queue").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Hands rise in order; lowering clears the queue.").font(.system(size: 12)).foregroundStyle(.secondary)
                HStack {
                    SwapText(order.isEmpty ? "Queue clear ✓" : "Up next")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(order.isEmpty ? .green : .primary)
                    Spacer()
                    if !order.isEmpty {
                        Text("\(order.count) waiting").font(.system(size: 12)).foregroundStyle(.secondary)
                    }
                }
                VStack(spacing: 6) {
                    ForEach(Array(order.enumerated()), id: \.element) { index, id in
                        HStack(spacing: 8) {
                            RollingDigits(index + 1).font(.system(size: 13)).frame(width: 16)
                            Text(names[id]).font(.system(size: 13.5)).frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .frame(height: 36)
                        .animation(reduce ? nil : .motion(.base).delay(Double(index) * (slow ? 0.09 : 0.04)), value: order)
                        .motionTransition(.presence)
                    }
                }
                VStack(spacing: 0) {
                    ForEach(0..<names.count, id: \.self) { i in
                        HStack {
                            Text(names[i]).font(.system(size: 13.5))
                            Spacer()
                            Button(order.contains(i) ? "Lower" : "Raise") {
                                withMotion(.base, reduceMotion: reduce) {
                                    if order.contains(i) { order.removeAll { $0 == i } }
                                    else { order.append(i) }
                                }
                            }
                            .buttonStyle(.bordered).controlSize(.small)
                        }
                        .padding(.vertical, 8)
                        .overlay(alignment: .top) {
                            if i > 0 { Divider() }
                        }
                    }
                }
                Toggle("Slow stagger", isOn: $slow)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
    }
}
