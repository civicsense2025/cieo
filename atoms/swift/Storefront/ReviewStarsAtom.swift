import SwiftUI
import Cieo

public struct ReviewStarsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reviewstars", category: "Storefront", name: "Review stars input",
        summary: "Fill follows the pointer while held, then settles on release. The caption swaps to the score and submit morphs into a held thanks.")
    private let labels = ["Tap a star", "Poor", "Fair", "Good", "Great", "Loved it"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var score: Double = 0
    @State private var live: Double = 0
    @State private var held = false
    @State private var done = false
    @State private var halfStars = true
    public init() {}
    private var shownScore: Double { held ? live : score }
    private func starSymbol(for index: Int) -> String {
        let v = shownScore
        if v >= Double(index) { return "star.fill" }
        if halfStars && v >= Double(index) - 0.5 { return "star.leadinghalf.filled" }
        return "star"
    }
    public var body: some View {
        AtomStage(hint: "Drag across, release to settle, then submit") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Rate your order").font(.callout.weight(.semibold))
                HStack(spacing: 4) { ForEach(1...5, id: \.self) { i in
                    Button { withMotion(.base, reduceMotion: reduce) { score = Double(i); live = Double(i) } } label: {
                        Image(systemName: starSymbol(for: i))
                            .font(.title3).foregroundStyle(.orange).frame(width: 36, height: 36)
                    }.buttonStyle(.plain).accessibilityLabel("\(i) stars")
                } }
                .gesture(DragGesture(minimumDistance: 2).onChanged { v in
                    held = true
                    let raw = min(5, max(0.5, v.location.x / 36 + 0.5))
                    live = halfStars ? (raw * 2).rounded() / 2 : max(1, raw.rounded())
                }
                    .onEnded { _ in held = false; withMotion(.base, reduceMotion: reduce) { score = halfStars ? max(0.5, (live * 2).rounded() / 2) : max(1, live.rounded()) } })
                SwapText(labels[min(5, Int(score.rounded()))]).font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button(done ? "Thanks — posted" : "Submit review") { withMotion(.base, reduceMotion: reduce) { done = true } }
                        .buttonStyle(.borderedProminent).controlSize(.small).disabled(score == 0 || done).tint(done ? .green : .accentColor)
                    Toggle("Half stars", isOn: $halfStars).font(.caption).foregroundStyle(.secondary)
                }
            }.frame(maxWidth: 300)
        }
    }
}
