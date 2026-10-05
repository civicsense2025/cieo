import SwiftUI
import MotionKit

private struct SuggestionWord: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let text: String
    let color: Color
    let strike: Bool
    let gone: Bool
    let resolved: Bool
    @State private var natural: CGFloat = 0

    var body: some View {
        Text(text).font(.body).fixedSize().lineLimit(1)
            .background(GeometryReader { g in Color.clear.onAppear { natural = g.size.width } })
            .strikethrough(strike, color: resolved ? .clear : color).underline(!strike, color: resolved ? .clear : color)
            .foregroundStyle(resolved ? AnyShapeStyle(.primary) : AnyShapeStyle(color))
            .frame(width: natural > 0 ? natural * (gone ? 0 : 1) : nil, alignment: .leading).clipped()
            .animation(reduce ? nil : (gone ? .motion(.base).delay(Motion.exit) : .motion(.base)), value: gone)
            .opacity(gone ? 0 : 1)
            .animation(reduce ? nil : .motion(.snap), value: gone)
            .animation(reduce ? nil : .motion(.base), value: resolved)
    }
}

public struct SuggestedEditAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "suggestion", category: "Writing", name: "Suggested edit",
        summary: "Accepting fades the struck word and closes its gap, while the inserted word loses its suggestion color. Rejecting does the reverse. The sentence reflows on springs, not jumps.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var outcome = 0       // 0 pending, 1 accepted, 2 rejected
    public init() {}

    public var body: some View {
        AtomStage(hint: "Accept or reject the suggestion") {
            VStack(alignment: .leading, spacing: 12) {
                WritingFlow(spacing: 5, lineSpacing: 4) {
                    ForEach(Array("Our members get".split(separator: " ")), id: \.self) { Text($0).font(.body) }
                    SuggestionWord(text: "early", color: .red, strike: true, gone: outcome == 1, resolved: outcome == 2)
                    SuggestionWord(text: "first-day", color: .green, strike: false, gone: outcome == 2, resolved: outcome == 1)
                    ForEach(Array("access to every drop.".split(separator: " ")), id: \.self) { Text($0).font(.body) }
                }
                .animation(reduce ? nil : .motion(.base), value: outcome)
                .accessibilityElement(children: .combine)
                .accessibilityLabel(outcome == 1 ? "Our members get first-day access to every drop." : outcome == 2 ? "Our members get early access to every drop." : "Our members get early, suggested first-day, access to every drop.")
                HStack {
                    Button("Accept") { set(1) }.buttonStyle(.borderedProminent)
                    Button("Reject") { set(2) }.buttonStyle(.bordered)
                    Spacer()
                    Button("Reset") { set(0) }.buttonStyle(.bordered)
                }
            }
            .frame(maxWidth: 340)
        }
    }

    private func set(_ v: Int) { withMotion(.base, reduceMotion: reduce) { outcome = v } }
}
