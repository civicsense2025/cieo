import SwiftUI
import Cieo

public struct TranscribeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "transcribe", category: "Writing", name: "Live transcription caret",
        summary: "Words blur in one by one while a soft caret rides the last word. Tapping a word pulses it like a replay.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let words = "The harbor bell rang twice before the gulls rose over the breakwater".split(separator: " ").map(String.init)
    @State private var shown = 0
    @State private var live = true
    @State private var pulsed: Int?
    @State private var timer: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap a word to hear it again") {
            VStack(alignment: .leading, spacing: 8) {
                WritingFlow(spacing: 5, lineSpacing: 4) {
                    ForEach(words.indices, id: \.self) { i in
                        if i < shown {
                            Text(words[i]).font(.system(size: 13.5))
                                .blur(radius: 0)
                                .scaleEffect(pulsed == i ? 1.15 : 1)
                                .background(pulsed == i ? Color.accentColor.opacity(0.25) : .clear)
                                .onTapGesture { replay(i) }
                                .motionTransition(.swap())
                                .animation(reduce ? nil : .motion(.base), value: shown)
                        }
                    }
                    Rectangle().fill(.primary.opacity(0.6))
                        .frame(width: 2, height: 18)
                        .opacity(live ? 1 : 0.25)
                }
                .frame(maxWidth: 340, minHeight: 120, alignment: .topLeading)
                .accessibilityLabel(words.prefix(shown).joined(separator: " "))
                Toggle("Live", isOn: $live)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
                    .onChange(of: live) { _, v in if v { start() } else { timer?.cancel() } }
            }
        }
        .onAppear { start() }
        .onDisappear { timer?.cancel() }
    }

    private func start() {
        timer?.cancel()
        guard shown < words.count else { return }
        timer = Task {
            while shown < words.count {
                try? await Task.sleep(for: .milliseconds(reduce ? 0 : 180))
                if Task.isCancelled || !live { return }
                withMotion(.base, reduceMotion: reduce) { shown += 1 }
            }
        }
    }

    private func replay(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { pulsed = i }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
            withMotion(.base, reduceMotion: reduce) { if pulsed == i { pulsed = nil } }
        }
    }
}
