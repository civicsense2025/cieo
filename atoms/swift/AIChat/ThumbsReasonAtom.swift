import SwiftUI
import Cieo

public struct ThumbsReasonAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "thumbsreason", category: "Forms", name: "Thumbs plus reason",
        summary: "The pressed thumb sinks on snap. The reason field opens its height on soft, and Send swaps the row to a thank-you terminal.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel: Int?
    @State private var pressed: Int?
    @State private var reason = ""
    @State private var sent = false
    @State private var askReason = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a thumb, then send a reason") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Was this helpful?").font(.system(size: 15, weight: .semibold))
                Text("Here is your launch draft.").font(.system(size: 13.5)).lineSpacing(2)
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.18)))
                    .frame(maxWidth: 240, alignment: .leading)
                HStack(spacing: 8) {
                    thumb(0, system: "hand.thumbsup", label: "Helpful")
                    thumb(1, system: "hand.thumbsdown", label: "Not helpful")
                    SwapText(sent ? (sel == 0 ? "Thanks — noted as helpful." : "Thanks — noted as not helpful.") : "")
                        .font(.caption).foregroundStyle(.green)
                }
                .frame(height: 40)
                if sel != nil && askReason && !sent {
                    HStack(spacing: 6) {
                        TextField("What stood out?", text: $reason)
                            .softFieldSurface().font(.system(size: 13))
                        Button("Send") {
                            withMotion(.base, reduceMotion: reduce) { sent = true }
                        }.buttonStyle(.borderedProminent).controlSize(.small)
                    }
                    .motionTransition(.presence)
                }
                Toggle("Ask for a reason", isOn: $askReason).font(.caption).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 300)
            .animation(reduce ? nil : .motion(.base), value: sel)
            .animation(reduce ? nil : .motion(.soft), value: sent)
        }
    }

    private func thumb(_ i: Int, system: String, label: String) -> some View {
        Image(systemName: system).font(.system(size: 16))
            .frame(width: 40, height: 40)
            .foregroundStyle(sel == i ? .white : .primary)
            .background(RoundedRectangle(cornerRadius: 10).fill(sel == i ? Color.primary : Color.secondary.opacity(0.12)))
            .scaleEffect(pressed == i ? 0.88 : 1)
            .motion(.snap, value: pressed == i)
            .contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 0)
                .onChanged { _ in pressed = i }
                .onEnded { _ in pressed = nil })
            .onTapGesture { pick(i) }
            .accessibilityLabel(label)
    }

    private func pick(_ i: Int) {
        guard sel == nil else { return }
        withMotion(.base, reduceMotion: reduce) { sel = i }
        if !askReason {
            withMotion(.base, reduceMotion: reduce) { sent = true }
        }
    }
}
