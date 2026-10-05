import SwiftUI
import Cieo

public struct PayButtonAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "payment", category: "Documents", name: "Pay button",
        summary: "Processing keeps the button in place with a spinner. Success fills it with the success color; a decline fills it with danger and opens a fix-it message. Both settle back to a retryable state.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase { case idle, busy, paid, declined }
    @State private var phase = Phase.idle
    @State private var message = 0          // 0 none, 1 paid, 2 declined
    @State private var decline = false
    @State private var run: Task<Void, Never>?
    public init() {}

    private var fill: Color { phase == .paid ? .green : phase == .declined ? .red : Color.primary }

    public var body: some View {
        AtomStage(hint: "Pay, then try the declined card") {
            VStack(alignment: .leading, spacing: 10) {
                HStack { Text("Invoice INV-0042").font(.caption).foregroundStyle(.secondary); Spacer(); Text("$64.80").fontWeight(.semibold).monospacedDigit() }
                Button(action: pay) {
                    ZStack { label.id(phase).motionTransition(.swap()) }
                        .fontWeight(.medium).foregroundStyle(phase == .paid || phase == .declined ? AnyShapeStyle(Color.white) : AnyShapeStyle(.background))
                        .frame(maxWidth: .infinity).frame(height: 44)
                        .background(fill, in: RoundedRectangle(cornerRadius: 11))
                        .animation(reduce ? nil : .motion(.base), value: phase)
                }
                .buttonStyle(.plain).disabled(phase != .idle)
                ZStack(alignment: .leading) {
                    if message == 1 { Text("Receipt sent to billing@northstudio.co").foregroundStyle(.green).motionTransition(.swap()) }
                    if message == 2 { Text("Your bank declined the card. Try another card.").foregroundStyle(.red).motionTransition(.swap()) }
                }
                .font(.caption).frame(maxWidth: .infinity, minHeight: 20, alignment: .leading)
                .animation(reduce ? nil : .motion(.base), value: message)
                Toggle("Simulate a declined card", isOn: $decline).font(.caption).foregroundStyle(.secondary).disabled(phase != .idle)
            }
            .padding(16).frame(maxWidth: 300)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
        .onDisappear { run?.cancel() }
    }

    @ViewBuilder private var label: some View {
        switch phase {
        case .idle: Text("Pay $64.80")
        case .busy:
            HStack(spacing: 8) {
                TimelineView(.animation(paused: reduce)) { ctx in
                    Image(systemName: "arrow.2.circlepath").rotationEffect(.degrees(reduce ? 0 : (ctx.date.timeIntervalSinceReferenceDate * 420).truncatingRemainder(dividingBy: 360)))
                }
                Text("Processing")
            }
        case .paid: Label("Paid", systemImage: "checkmark")
        case .declined: Label("Declined", systemImage: "xmark")
        }
    }

    private func pay() {
        guard phase == .idle else { return }
        let fail = decline
        run = Task {
            withMotion(.base, reduceMotion: reduce) { phase = .busy; message = 0 }
            try? await Task.sleep(for: .milliseconds(1200))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { phase = fail ? .declined : .paid; message = fail ? 2 : 1 }
            try? await Task.sleep(for: .milliseconds(fail ? 1800 : 2800))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { phase = .idle; if !fail { message = 0 } }
        }
    }
}
