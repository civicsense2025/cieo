import SwiftUI
import Cieo

public struct EmbedCardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "embedcard", category: "Newsletter", name: "Embed card",
        summary: "The card grows from 97% of the trigger. A valid submit swaps to a success check, then collapses to a referral row.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var joined = false
    @State private var email = ""
    public init() {}

    private var valid: Bool { email.range(of: #"^[^\s@]+@[^\s@]+\.[^\s@]+$"#, options: .regularExpression) != nil }

    public var body: some View {
        AtomStage(hint: "Open, then join") {
            VStack(spacing: 8) {
                if !open {
                    Button("Get the Sunday letter") {
                        withMotion(.base, reduceMotion: reduce) { open = true }
                    }
                    .buttonStyle(.bordered).controlSize(.regular)
                    .transition(reduce ? .identity : .scale(scale: 0.97).combined(with: .opacity))
                }
                if open {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Stay in the loop").font(.callout.weight(.semibold))
                        Text("One thoughtful email a week.").font(.footnote).foregroundStyle(.secondary)
                        if !joined {
                            HStack(spacing: 8) {
                                TextField("you@example.com", text: $email)
                                    .textFieldStyle(.plain).padding(.horizontal, 12).frame(height: 44)
                                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                                Button("Join") {
                                    guard valid else { return }
                                    withMotion(.base, reduceMotion: reduce) { joined = true }
                                }
                                .buttonStyle(.borderedProminent).controlSize(.regular)
                            }
                            .transition(reduce ? .identity : .opacity)
                        }
                        ZStack(alignment: .leading) {
                            if joined {
                                Label("You're on the list — refer a friend", systemImage: "checkmark")
                                    .font(.footnote.weight(.semibold)).foregroundStyle(.green).id(1)
                            }
                        }
                        .motionTransition(.swap())
                        .animation(reduce ? nil : .motion(.base), value: joined)
                        Button("Reset") {
                            withMotion(.snap, reduceMotion: reduce) { open = false; joined = false; email = "" }
                        }.font(.caption).buttonStyle(.borderless)
                    }
                    .padding(16).frame(maxWidth: 340)
                    .background(.background, in: RoundedRectangle(cornerRadius: 14))
                    .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
                    .transition(reduce ? .identity : .scale(scale: 0.97).combined(with: .opacity))
                }
            }
            .animation(reduce ? nil : .motion(.base), value: open)
        }
    }
}
