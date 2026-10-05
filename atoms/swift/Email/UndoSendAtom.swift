import SwiftUI
import MotionKit

public struct UndoSendAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "undosend", category: "Email", name: "Undo send",
        summary: "Send shrinks the draft away and a toast takes over with a ring that empties over 5 seconds. Undo brings the draft back exactly. When the ring runs out, the toast swaps to a success “Sent”.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var draft = true
    @State private var toast = false
    @State private var sent = false
    @State private var started = 0.0
    @State private var run: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Send, then undo within 5 seconds") {
            ZStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("To: maya@studio.co").font(.caption).foregroundStyle(.secondary)
                    Text("Re: Spring launch").font(.caption.weight(.semibold))
                    Text("Looks great. Ship it Thursday.").font(.caption)
                    Button("Send", action: send).buttonStyle(.borderedProminent).frame(maxWidth: .infinity, alignment: .trailing)
                }
                .padding(14).frame(width: 300).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                .opacity(draft ? 1 : 0).offset(y: draft ? 0 : 20).scaleEffect(draft ? 1 : 0.92, anchor: .bottom).allowsHitTesting(draft)
                .animation(reduce ? nil : .motion(draft ? .base : .snap), value: draft)
                VStack { Spacer(); toastView.opacity(toast ? 1 : 0).offset(y: toast ? 0 : 12).allowsHitTesting(toast)
                    .animation(reduce ? nil : .motion(toast ? .base : .snap), value: toast) }
                    .padding(.bottom, 4)
            }
            .frame(minHeight: 240)
        }
        .onDisappear { run?.cancel() }
    }

    private var toastView: some View {
        TimelineView(.animation(paused: !toast || sent)) { ctx in
            let left = sent ? 0 : 5 - (ctx.date.timeIntervalSinceReferenceDate - started)
            HStack(spacing: 10) {
                ZStack {
                    Circle().stroke(.quaternary, lineWidth: 3)
                    Circle().trim(from: 0, to: max(0, min(1, left / 5))).stroke(.primary, style: StrokeStyle(lineWidth: 3, lineCap: .round)).rotationEffect(.degrees(-90))
                }
                .frame(width: 20, height: 20).accessibilityHidden(true)
                ZStack(alignment: .leading) {
                    if sent { Label("Sent to Maya", systemImage: "checkmark").foregroundStyle(.green).fontWeight(.medium).motionTransition(.swap()) }
                    else { Text("Sending in \(max(1, Int(left.rounded(.up)))) s").motionTransition(.swap()) }
                }
                .font(.caption).frame(width: 150, alignment: .leading).animation(reduce ? nil : .motion(.base), value: sent)
                if !sent { Button("Undo", action: undo).buttonStyle(.bordered).controlSize(.small) }
            }
            .padding(.horizontal, 12).padding(.vertical, 10).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(.quaternary))
            .accessibilityElement(children: .contain)
        }
    }

    private func send() {
        run?.cancel()
        sent = false
        draft = false
        run = Task {
            try? await Task.sleep(for: .milliseconds(120))
            if Task.isCancelled { return }
            started = DataMotion.now
            toast = true
            try? await Task.sleep(for: .seconds(5))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { sent = true }
            try? await Task.sleep(for: .milliseconds(2200))
            if Task.isCancelled { return }
            toast = false
            try? await Task.sleep(for: .milliseconds(300))
            draft = true; sent = false
        }
    }

    private func undo() {
        run?.cancel()
        toast = false
        run = Task { try? await Task.sleep(for: .milliseconds(100)); if !Task.isCancelled { draft = true } }
    }
}
