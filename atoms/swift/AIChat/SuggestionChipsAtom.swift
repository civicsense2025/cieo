import SwiftUI
import Cieo

public struct SuggestionChipsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sugchips", category: "AI chat", name: "Suggestion chips",
        summary: "Chips stagger in 40ms apart. The tapped chip morphs into your bubble while siblings blur out, and the reply fades up as the terminal state.")

    private let tones = ["Playful", "Formal", "Shorter"]
    private let said = ["Make it playful", "Keep it formal", "Make it shorter"]
    private let replies = ["Draft ready in a playful voice.", "Draft ready in a formal voice.", "Draft ready, kept short."]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = false
    @State private var picked: Int?
    @State private var stagger = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap a chip") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Draft a launch note").font(.system(size: 15, weight: .semibold))
                Text("Pick a tone to start.").font(.system(size: 13.5)).lineSpacing(2)
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.18)))
                    .frame(maxWidth: 240, alignment: .leading)
                if picked == nil {
                    HStack(spacing: 6) {
                        ForEach(tones.indices, id: \.self) { i in
                            Button(tones[i]) { choose(i) }
                                .buttonStyle(.bordered).controlSize(.small)
                                .opacity(shown ? 1 : 0).offset(y: shown ? 0 : 6)
                                .animation(reduce || !stagger ? nil : .motion(.base).delay(Motion.stagger(i, of: tones.count, gap: 0.04)), value: shown)
                        }
                    }
                }
                if let p = picked {
                    Text(said[p]).font(.system(size: 13.5))
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .foregroundStyle(.white)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary))
                        .frame(maxWidth: .infinity, alignment: .trailing)
                        .motionTransition(.swap())
                    Text(replies[p]).font(.system(size: 13)).lineSpacing(2)
                        .padding(.horizontal, 12).padding(.vertical, 8)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.18)))
                        .frame(maxWidth: 240, alignment: .leading)
                        .motionTransition(.swap())
                    Button("Reset") { withMotion(.base, reduceMotion: reduce) { picked = nil } }
                        .buttonStyle(.bordered).controlSize(.small)
                }
                Toggle("Stagger chips in", isOn: $stagger).font(.caption).foregroundStyle(.secondary)
            }
            .frame(width: 300)
            .animation(reduce ? nil : .motion(.base), value: picked)
            .onAppear { shown = true }
        }
    }

    private func choose(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { picked = i }
    }
}
