import SwiftUI
import Cieo

public struct SendDialAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "senddial", category: "Email", name: "Send-later dial",
        summary: "A long press opens a radial dial on soft. Dragging sets the time 1:1 and the label swaps behind it. Release confirms with a snap to a scheduled terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var dialOpen = false
    @State private var slot = 0
    @State private var scheduled = false
    @State private var inTimezone = true
    public init() {}
    private let slots = ["Today 5 PM", "Tonight 8 PM", "Tomorrow 8 AM", "Tue 8 AM"]
    private let shorts = ["5PM", "8PM", "8AM", "TUE"]
    private var label: String {
        if scheduled { return "Scheduled" }
        if dialOpen { return "Send \(slots[slot])" }
        return "Pick a time on the dial"
    }

    public var body: some View {
        AtomStage(hint: "Hold the button, then tap a time") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Re: Launch plan").font(.callout.weight(.semibold))
                    Text("To Maya · draft ready").font(.caption).foregroundStyle(.secondary)
                    SwapText(label).font(.caption)
                        .foregroundStyle(scheduled ? Color.green : Color.primary)
                        .frame(height: 20, alignment: .leading)
                    if dialOpen {
                        HStack(spacing: 8) {
                            ForEach(shorts.indices, id: \.self) { i in
                                Button(shorts[i]) {
                                    withMotion(.soft, reduceMotion: reduce) { slot = i }
                                }
                                .buttonStyle(.plain).controlSize(.small)
                                .font(.caption2.weight(.semibold))
                                .padding(.horizontal, 10).padding(.vertical, 8)
                                .overlay(Capsule().fill(slot == i ? Color.primary : Color.secondary.opacity(0.4)).opacity(0.10).allowsHitTesting(false))
                                .scaleEffect(slot == i ? 1.05 : 1)
                                .animation(reduce ? nil : .motion(.soft), value: slot)
                            }
                        }
                        .motionTransition(.presence)
                    }
                    HStack(spacing: 8) {
                        Button(scheduled ? "Scheduled" : "Hold to schedule") { confirm() }
                            .buttonStyle(.borderedProminent).controlSize(.small)
                            .simultaneousGesture(LongPressGesture(minimumDuration: 0.35).onEnded { _ in
                                withMotion(.soft, reduceMotion: reduce) { dialOpen = true }
                            })
                        if dialOpen && !scheduled {
                            Button("Confirm") { confirm() }
                                .buttonStyle(.bordered).controlSize(.small)
                        }
                    }
                }
                .padding(14).frame(width: 300)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                Toggle("Send in their timezone", isOn: $inTimezone)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
    }

    private func confirm() {
        withMotion(.snap, reduceMotion: reduce) { dialOpen = false; scheduled = true }
    }
}
