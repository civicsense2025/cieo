import SwiftUI
import Cieo

public struct CharacterLimitRingAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "charring", category: "Social", name: "Character limit ring",
        summary: "The ring fills with the length of the post. Under 20 characters left it grows slightly and shows the countdown inside; past the limit it turns danger, the number goes negative and Post is disabled.")

    private let max = 140
    @State private var text = "Spring launch is Thursday. Members get first-day access to every drop, and yearly plans now save 20%."
    public init() {}

    public var body: some View {
        let left = max - text.count
        let near = left < 20, over = left < 0
        AtomStage(hint: "Type past the limit") {
            VStack(spacing: 10) {
                TextField("What’s new?", text: $text, axis: .vertical).lineLimit(3...3).textFieldStyle(.plain)
                HStack(spacing: 10) {
                    Spacer()
                    ZStack {
                        Circle().stroke(.quaternary, lineWidth: 2.5)
                        Circle().trim(from: 0, to: Swift.min(1, Double(text.count) / Double(max)))
                            .stroke(over ? Color.red : near ? Color.orange : Color.accentColor, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                        if near { Text("\(left)").font(.system(size: 9, weight: .medium)).monospacedDigit().foregroundStyle(over ? Color.red : .secondary) }
                    }
                    .frame(width: 22, height: 22).scaleEffect(near ? 1.2 : 1)
                    .motion(.base, value: text.count).motion(.base, value: near)
                    .accessibilityElement().accessibilityLabel("Characters left").accessibilityValue("\(left)")
                    PreviewAction("Post").buttonStyle(.borderedProminent).controlSize(.small).disabled(over || text.isEmpty)
                }
            }
            .padding(12).frame(maxWidth: 320)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }
}
