import SwiftUI

/// One answer in a poll.
public struct PollOption: Identifiable, Equatable, Sendable {
    /// Stable id the host stores.
    public let id: String
    public let label: String
    /// Votes this option has, including the current person's.
    public var votes: Int

    public init(id: String, label: String, votes: Int) {
        self.id = id; self.label = label; self.votes = votes
    }
}

/// One question with several options. Before a vote each option is a button; after a vote (or when closed)
/// each row morphs into its result bar on the soft spring with a 50 ms stagger and its percentage counts up.
/// The host owns the counts and the vote.
public struct Poll<Footnote: View>: View {
    /// Gap between rows revealing their result, in milliseconds, and the longest total wait.
    public static var staggerMilliseconds: Int { 50 }
    public static var staggerCapMilliseconds: Int { 300 }

    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentTypography) private var typography
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let question: Text
    private let options: [PollOption]
    private let voted: String?
    private let closed: Bool
    private let onVote: (String) -> Void
    private let footnote: Footnote

    /// `voted` is the id this person chose, or nil. `closed` shows results even without a vote.
    public init(question: Text, options: [PollOption], voted: String? = nil, closed: Bool = false,
                onVote: @escaping (String) -> Void, @ViewBuilder footnote: () -> Footnote) {
        self.question = question; self.options = options; self.voted = voted; self.closed = closed
        self.onVote = onVote; self.footnote = footnote()
    }

    /// Whole-number percentages that sum to exactly 100 (largest-remainder rounding; ties go to the earlier option).
    /// All zeros when there are no votes.
    public static func pollPercentages(_ votes: [Int]) -> [Int] {
        let clean = votes.map { max(0, $0) }
        let total = clean.reduce(0, +)
        guard total > 0 else { return clean.map { _ in 0 } }
        let exact = clean.map { Double($0) / Double(total) * 100 }
        var floors = exact.map { Int($0.rounded(.down)) }
        var left = 100 - floors.reduce(0, +)
        var order: [(index: Int, remainder: Double)] = []
        for (index, value) in exact.enumerated() {
            order.append((index: index, remainder: value - value.rounded(.down)))
        }
        order.sort { a, b in a.remainder != b.remainder ? a.remainder > b.remainder : a.index < b.index }
        for entry in order where left > 0 {
            floors[entry.index] += 1
            left -= 1
        }
        return floors
    }

    /// Sentence announced after a vote: "Vote counted. Option A leads with 54%." Ties and empty polls are named honestly.
    public static func pollAnnouncement(_ options: [PollOption]) -> String {
        let pct = pollPercentages(options.map(\.votes))
        let top = pct.max() ?? 0
        guard top > 0 else { return "Vote counted." }
        let leaders = options.enumerated().filter { pct[$0.offset] == top }.map(\.element)
        if leaders.count == 1 { return "Vote counted. \(leaders[0].label) leads with \(top)%." }
        return "Vote counted. \(leaders.map(\.label).joined(separator: " and ")) are tied at \(top)%."
    }

    private var showsResults: Bool { closed || voted != nil }
    private var percentages: [Int] { Self.pollPercentages(options.map(\.votes)) }
    private var total: Int { options.reduce(0) { $0 + max(0, $1.votes) } }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            question.font(typography.heading).accessibilityAddTraits(.isHeader)
            VStack(spacing: metrics.compact) {
                ForEach(Array(options.enumerated()), id: \.element.id) { index, option in
                    PollRow(option: option, percent: percentages[index],
                            leader: (percentages.max() ?? 0) > 0 && percentages[index] == percentages.max(),
                            chosen: voted == option.id, results: showsResults,
                            delay: min(index * Self.staggerMilliseconds, Self.staggerCapMilliseconds)) { onVote(option.id) }
                }
            }
            .accessibilityElement(children: .contain)
            HStack(spacing: metrics.tight) {
                CompactCount(total, unit: total == 1 ? "vote" : "votes", hideZero: false)
                Text(total == 1 ? "vote" : "votes")
                if closed { Text("· Closed") }
            }
            .font(typography.detail)
            footnote.font(typography.detail)
        }
        .accessibilityElement(children: .contain)
        .onChange(of: voted) { old, new in
            if old == nil, new != nil { AccessibilityNotification.Announcement(Self.pollAnnouncement(options)).post() }
        }
    }
}

public extension Poll where Footnote == EmptyView {
    init(question: Text, options: [PollOption], voted: String? = nil, closed: Bool = false,
         onVote: @escaping (String) -> Void) {
        self.init(question: question, options: options, voted: voted, closed: closed, onVote: onVote) { EmptyView() }
    }
}

/// One option that is a button before the vote and a result bar after.
private struct PollRow: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let option: PollOption
    let percent: Int
    let leader: Bool
    let chosen: Bool
    let results: Bool
    let delay: Int
    let vote: () -> Void
    @State private var revealed = false

    private var shownPercent: Int { results && revealed ? percent : 0 }

    private var row: some View {
        ZStack(alignment: .leading) {
            GeometryReader { proxy in
                Rectangle()
                    .fill(chosen || leader ? theme.tint : theme.track)
                    .frame(width: proxy.size.width * CGFloat(shownPercent) / 100)
                    .accessibilityHidden(true)
            }
            HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                Text(verbatim: option.label).font(typography.body)
                if chosen { InlineGlyph(font: typography.body) { icons(.check) }.accessibilityHidden(true) }
                Spacer(minLength: metrics.compact)
                if results {
                    Text(verbatim: "\(shownPercent)%")
                        .font(typography.value)
                        .contentTransition(.numericText(value: Double(shownPercent)))
                        .accessibilityHidden(true)
                }
            }
            .padding(.horizontal, metrics.medium)
            .padding(.vertical, metrics.compact)
        }
        .frame(minHeight: metrics.touchTarget)
        .foregroundStyle(theme.foreground)
        .background(results ? theme.surface : Color.clear)
        .clipShape(.rect(cornerRadius: metrics.corner))
        .componentBorder(results ? nil : theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        .contentShape(.rect(cornerRadius: metrics.corner))
    }

    var body: some View {
        Group {
            if results {
                row
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel(Text(verbatim: option.label))
                    .accessibilityValue(Text(verbatim: "\(percent)%, \(option.votes) \(option.votes == 1 ? "vote" : "votes")\(chosen ? ", your vote" : "")"))
            } else {
                Button(action: vote) { row }.buttonStyle(.plain)
                    .accessibilityLabel(Text(verbatim: option.label))
            }
        }
        .motionAnimation(.soft, value: shownPercent)
        .task(id: results) {
            guard results else { revealed = false; return }
            if !reduceMotion { try? await Task.sleep(for: .milliseconds(delay)) }
            revealed = true
        }
    }
}

#Preview("Poll") {
    struct Demo: View {
        @State private var voted: String?
        var body: some View {
            Poll(question: Text("Which topic next?"),
                 options: [PollOption(id: "a", label: "Voting", votes: 54 + (voted == "a" ? 1 : 0)),
                           PollOption(id: "b", label: "Courts", votes: 46 + (voted == "b" ? 1 : 0))],
                 voted: voted) { voted = $0 }
                .padding()
        }
    }
    return Demo()
}
