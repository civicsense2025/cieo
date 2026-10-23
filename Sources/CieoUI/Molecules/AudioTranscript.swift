import Cieo
import SwiftUI

/// Word-by-word follow-along text for a clip. The spoken word sits on a highlight that glides from word to
/// word (it jumps under Reduce Motion), and with `onSeek` a tap on any word jumps there. The view scrolls
/// to keep the spoken word in sight unless the reader scrolled in the last four seconds. The host owns time.
public struct AudioTranscript: View {
    /// A word with the seconds it starts and ends.
    public struct Word: Sendable, Equatable {
        /// The word as written, with its punctuation.
        public var text: String
        /// Second the word starts.
        public var start: TimeInterval
        /// Second the word ends.
        public var end: TimeInterval

        public init(_ text: String, start: TimeInterval, end: TimeInterval) {
            self.text = text
            self.start = start
            self.end = end
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Namespace private var glide
    @State private var lastUserScroll: Date?
    private let words: [Word]
    private let current: TimeInterval
    private let label: String
    private let scrolls: Bool
    private let onSeek: ((TimeInterval) -> Void)?

    /// `label` names the transcript ("Transcript of Voice note from Ana"). Without `onSeek` it is read-only
    /// follow-along. Set `scrolls` to false when the host places the transcript inside its own scroll view.
    public init(words: [Word], current: TimeInterval, label: String, scrolls: Bool = true,
                onSeek: ((TimeInterval) -> Void)? = nil) {
        self.words = words
        self.current = current
        self.label = label
        self.scrolls = scrolls
        self.onSeek = onSeek
    }

    public var body: some View {
        let active = Self.activeWordIndex(words, at: current)
        Group {
            if scrolls {
                ScrollViewReader { proxy in
                    ScrollView { flow(active: active) }
                        .simultaneousGesture(DragGesture().onChanged { _ in lastUserScroll = Date() })
                        .onChange(of: active) { _, index in
                            guard index >= 0,
                                  Self.shouldAutoScroll(now: Date().timeIntervalSinceReferenceDate,
                                                        lastUserScroll: lastUserScroll?.timeIntervalSinceReferenceDate)
                            else { return }
                            withMotion(.soft, reduceMotion: reduceMotion) { proxy.scrollTo(index, anchor: .center) }
                        }
                }
            } else {
                flow(active: active)
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(label)
    }

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private func flow(active: Int) -> some View {
        FlowStack(spacing: .zero) {
            ForEach(Array(words.enumerated()), id: \.offset) { index, word in
                wordView(word, isActive: index == active).id(index)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .motion(.base, value: active)
    }

    @ViewBuilder
    private func wordView(_ word: Word, isActive: Bool) -> some View {
        let text = Text(word.text)
            .font(typography.body)
            .foregroundStyle(isActive ? theme.foreground : theme.secondary)
            .padding(.horizontal, metrics.tight)
            .padding(.vertical, metrics.tight)
            .background {
                if isActive {
                    RoundedRectangle(cornerRadius: metrics.corner / 2) // literal-ok: half the corner step
                        .fill(theme.tint)
                        .matchedGeometryEffect(id: "highlight", in: glide, isSource: true)
                }
            }
        if let onSeek {
            Button { onSeek(word.start) } label: { text.contentShape(.rect) }
                .buttonStyle(.plain)
                .accessibilityAddTraits(isActive ? .isSelected : [])
        } else {
            text.accessibilityAddTraits(isActive ? .isSelected : [])
        }
    }

    // MARK: Pure helpers

    /// Index of the word being spoken at time `t`: the last word that has started. Gaps keep the previous
    /// word until the next starts; -1 before the first word or with no words. Words must be sorted by start.
    public static func activeWordIndex(_ words: [Word], at t: TimeInterval) -> Int {
        guard t.isFinite else { return -1 }
        var lo = 0, hi = words.count - 1, found = -1
        while lo <= hi {
            let mid = (lo + hi) / 2
            if words[mid].start <= t { found = mid; lo = mid + 1 } else { hi = mid - 1 }
        }
        return found
    }

    /// Next focus-marker index for a key, clamped to the words; nil for keys that do nothing. Keys use the
    /// web names ("ArrowRight", "Home").
    public static func transcriptKeyStep(_ key: String, index: Int, count: Int) -> Int? {
        guard count > 0 else { return nil }
        let last = count - 1
        let at = min(last, max(0, index))
        switch key {
        case "ArrowRight", "ArrowDown": return min(last, at + 1)
        case "ArrowLeft", "ArrowUp": return max(0, at - 1)
        case "Home": return 0
        case "End": return last
        default: return nil
        }
    }

    /// Quiet time after the reader last scrolled before following the audio again, in seconds.
    public static let quietSeconds: TimeInterval = 4 // literal-ok: reading pause before auto-follow resumes

    /// True when the reader has not scrolled by hand within the quiet period.
    public static func shouldAutoScroll(now: TimeInterval, lastUserScroll: TimeInterval?,
                                        quiet: TimeInterval = AudioTranscript.quietSeconds) -> Bool {
        guard let lastUserScroll else { return true }
        return now - lastUserScroll >= quiet
    }

    /// New scroll offset that brings a word into view (centred), or nil when it is already fully visible.
    public static func transcriptScrollTop(wordTop: CGFloat, wordHeight: CGFloat, viewHeight: CGFloat,
                                           scrollTop: CGFloat) -> CGFloat? {
        if wordTop >= scrollTop, wordTop + wordHeight <= scrollTop + viewHeight { return nil }
        return max(0, wordTop + wordHeight / 2 - viewHeight / 2)
    }
}

#Preview("Transcript") {
    AudioTranscript(words: [.init("Hello", start: 1, end: 1.5), .init("there,", start: 1.6, end: 2), .init("friend.", start: 3, end: 3.6)],
                    current: 1.7, label: "Transcript", scrolls: false) { _ in }
        .padding()
}
