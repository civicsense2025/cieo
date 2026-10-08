import SwiftUI
import Cieo

public struct PlaceRateAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "placerate", category: "Maps", name: "Place rating",
        summary: "Stars ink left-to-right. The chip morphs its width and the count rolls. Skip swaps the hint and rests unrated.")

    @State private var rating = 0.0
    @State private var anon = false
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}

    private func star(_ i: Int) -> some View {
        let on = Double(i) - 0.5 <= rating
        return Image(systemName: on ? "star.fill" : "star")
            .font(.title2).foregroundStyle(on ? Color.primary : Color.secondary.opacity(0.4))
            .scaleEffect(on ? 1 : 0.92)
            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.03), value: rating)
            .onTapGesture { withMotion(.base, reduceMotion: reduce) { rating = Double(i) } }
            .accessibilityLabel("\(i) stars")
    }

    public var body: some View {
        AtomStage(hint: "Tap stars, or Skip") {
            VStack(spacing: 8) {
                Text("Rate Ferry Building").font(.callout.weight(.semibold)).lineSpacing(4)
                HStack(spacing: 4) {
                    ForEach(1...5, id: \.self) { i in star(i) }
                }
                .accessibilityElement(children: .contain).accessibilityLabel("Stars")
                HStack(spacing: 6) {
                    RollingDigits(String(format: "%.1f", rating)).font(.caption.weight(.semibold))
                    SwapText(rating > 0 ? "Thanks — rated" : "Tap a star", drift: 4)
                        .font(.caption).foregroundStyle(.secondary)
                }
                .padding(.horizontal, 12).padding(.vertical, 4)
                .background(Capsule().fill(.secondary.opacity(0.12)))
                .animation(reduce ? nil : .motion(.base), value: rating)
                Button("Skip") { withMotion(.base, reduceMotion: reduce) { rating = 0 } }
                    .buttonStyle(.bordered).controlSize(.small)
                HStack { Text("Left-to-right fill, chip follows").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Anonymous", isOn: $anon).labelsHidden().controlSize(.mini) }
            }
            .padding(14).frame(maxWidth: 340)
            .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 4, y: 1))
        }
    }
}
