import SwiftUI
import Cieo

public struct ReviewStarsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reviewstars", category: "Storefront", name: "Review stars input",
        summary: "Fill follows the pointer while held, then settles on release. The caption swaps to the score and submit morphs into a held thanks.")
    private let labels = ["Tap a star", "Poor", "Fair", "Good", "Great", "Loved it"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var score = 0
    @State private var live: Double = 0
    @State private var held = false
    @State private var done = false
    public init() {}
    public var body: some View {
        AtomStage(hint: "Drag across, release to settle, then submit") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Rate your order").font(.callout.weight(.semibold))
                HStack(spacing: 4) { ForEach(1...5, id: \.self) { i in
                    Button { withMotion(.base, reduceMotion: reduce) { score = i; live = Double(i) } } label: {
                        Image(systemName: Double(i) <= (held ? live : Double(score)) ? "star.fill" : "star")
                            .font(.title3).foregroundStyle(.orange).frame(width: 36, height: 36)
                    }.buttonStyle(.plain).accessibilityLabel("\(i) stars")
                } }
                .gesture(DragGesture(minimumDistance: 2).onChanged { v in held = true; live = min(5, max(1, Double(Int((v.location.x) / 36) + 1))) }
                    .onEnded { _ in held = false; withMotion(.base, reduceMotion: reduce) { score = max(1, Int(round(live))) } })
                SwapText(labels[score]).font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button(done ? "Thanks — posted" : "Submit review") { withMotion(.base, reduceMotion: reduce) { done = true } }
                        .buttonStyle(.borderedProminent).controlSize(.small).disabled(score == 0 || done).tint(done ? .green : .accentColor)
                    Toggle("Half stars", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
                }
            }.frame(width: 300)
        }
    }
}
