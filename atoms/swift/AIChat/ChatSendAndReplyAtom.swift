import SwiftUI
import Cieo

public struct ChatSendAndReplyAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "chatthread", category: "AI chat", name: "Chat send and reply",
        summary: "Your message lifts out of the input and travels to the thread as a bubble. A typing indicator then pulses in a wave and morphs into the reply bubble, growing to fit the text before the words fade in.")

    private struct Message: Identifiable { let id = UUID(); let mine: Bool; var text: String? }
    private let replies = ["Yes. QA signed off this morning, so Thursday works.", "I’ll draft the announcement and send it over by noon.", "Pricing page is live in preview if you want a look first."]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var messages: [Message] = []
    @State private var draft = "Can we ship Thursday?"
    @State private var busy = false
    @State private var turn = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Send a message") {
            VStack(spacing: 0) {
                VStack(spacing: 8) {
                    Spacer(minLength: 0)
                    ForEach(messages) { m in
                        bubble(m).frame(maxWidth: .infinity, alignment: m.mine ? .trailing : .leading)
                            .transition(reduce ? .identity : .modifier(active: Lift(y: m.mine ? 40 : 8), identity: Lift(y: 0)))
                    }
                }
                .padding(12).frame(maxHeight: .infinity).clipped()
                Divider()
                HStack(spacing: 6) {
                    TextField("Message", text: $draft).textFieldStyle(.plain).padding(.horizontal, 12).padding(.vertical, 8)
                        .background(Capsule().fill(.quaternary).opacity(0.10)).onSubmit(send)
                    Button("Send", action: send).buttonStyle(.borderedProminent).controlSize(.small).disabled(busy || draft.isEmpty)
                }.padding(8)
            }
            .frame(width: 330, height: 290)
            .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private func bubble(_ m: Message) -> some View {
        ZStack {
            if let text = m.text {
                Text(text).font(.subheadline).fixedSize(horizontal: false, vertical: true)
                    .transition(reduce ? .identity : .opacity.animation(.motion(.base).delay(0.12)))
            } else { Dots() }
        }
        .padding(.horizontal, 12).padding(.vertical, 8).frame(maxWidth: 240, alignment: m.mine ? .trailing : .leading)
        .fixedSize(horizontal: m.text == nil, vertical: false)
        .foregroundStyle(m.mine ? Color(white: 1, opacity: 0.95) : .primary)
        .background(RoundedRectangle(cornerRadius: 18).fill(m.mine ? Color.primary : Color.secondary.opacity(0.18)))
        .animation(reduce ? nil : .motion(.base), value: m.text)
    }

    private func send() {
        let text = draft.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty, !busy else { return }
        busy = true; draft = ""
        withMotion(.base, reduceMotion: reduce) { messages.append(Message(mine: true, text: text)); trim() }
        let reply = Message(mine: false, text: nil)
        Task {
            try? await Task.sleep(for: .seconds(0.45))
            withMotion(.base, reduceMotion: reduce) { messages.append(reply); trim() }
            try? await Task.sleep(for: .seconds(1.65))
            withMotion(.base, reduceMotion: reduce) {
                if let i = messages.firstIndex(where: { $0.id == reply.id }) { messages[i].text = replies[turn % replies.count] }
            }
            draft = ["Great, thanks.", "Perfect.", "Sounds good."][turn % 3]; turn += 1; busy = false
        }
    }

    private func trim() { if messages.count > 6 { messages.removeFirst(messages.count - 6) } }
}

private struct Lift: ViewModifier {
    let y: CGFloat
    func body(content: Content) -> some View { content.offset(y: y).opacity(y == 0 ? 1 : Motion.arriveOpacity) }
}

private struct Dots: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    var body: some View {
        TimelineView(.animation(paused: reduce)) { tl in
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { i in
                    let w = reduce ? 0.5 : 0.5 + 0.5 * sin(tl.date.timeIntervalSinceReferenceDate * 6 - Double(i) * 0.9)
                    Circle().fill(.secondary).frame(width: 7, height: 7).opacity(0.35 + 0.65 * w).offset(y: -2 * w)
                }
            }.padding(.vertical, 4)
        }.accessibilityLabel("Typing")
    }
}
