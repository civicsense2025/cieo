import SwiftUI
import Cieo

public struct LoyaltyAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "loyalty", category: "Storefront", name: "Loyalty stamp card",
        summary: "A stamp presses to 80% then fills softly while digits roll. The sixth stamp swaps the card into a reward pill that holds as the terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var count = 0
    @State private var pressed = -1
    public init() {}
    public var body: some View {
        AtomStage(hint: "Tap a stamp; the sixth morphs to a reward") {
            VStack(alignment: .leading, spacing: 8) {
                HStack { Text("Coffee club").font(.callout.weight(.semibold)); RollingDigits(count).font(.footnote).foregroundStyle(.secondary) }
                if count >= 6 {
                    HStack { Text("Free drink unlocked").font(.footnote.weight(.semibold)); Spacer()
                        PreviewAction("Claim").buttonStyle(.bordered).controlSize(.small) }
                    .padding(14).background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12))
                    .motionTransition(.swap())
                } else {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                        ForEach(0..<6, id: \.self) { i in
                            Button { withMotion(.soft, reduceMotion: reduce) { count = min(6, count + 1) } } label: {
                                Image(systemName: i < count ? "cup.and.saucer.fill" : "cup.and.saucer")
                                    .font(.title3).frame(maxWidth: .infinity).frame(height: 56)
                                    .background(i < count ? Color.accentColor.opacity(0.15) : Color.primary.opacity(0.06), in: RoundedRectangle(cornerRadius: 12))
                                    .foregroundStyle(i < count ? Color.accentColor : Color.secondary)
                            }.buttonStyle(.plain).accessibilityLabel("Stamp \(i + 1)")
                            .scaleEffect(pressed == i ? 0.8 : 1).motion(.snap, value: pressed)
                            .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged { _ in pressed = i }.onEnded { _ in pressed = -1 })
                        }
                    }
                }
                Toggle("Reset after claim", isOn: .constant(false)).font(.caption).foregroundStyle(.secondary)
            }.frame(maxWidth: 300)
        }
    }
}
