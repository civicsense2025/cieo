import SwiftUI
import Cieo

public struct PlaceSheetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "placesheet", category: "Maps", name: "Place card sheet",
        summary: "The sheet drags through peek, half and full and settles on the nearest stop. Photos cross-fade while the rating rolls. The map never moves.")

    @State private var detent = 0
    @State private var photos = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the card up, tap Go for full") {
            VStack(spacing: 6) {
                ZStack(alignment: .bottom) {
                    mapGrid.frame(height: 250 - CGFloat(detent) * 8).motion(.base, value: detent)
                    VStack(spacing: 8) {
                        Capsule().fill(.secondary.opacity(0.5)).frame(width: 36, height: 4)
                        HStack(spacing: 12) {
                            if photos {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(detent == 2 ? .brown.opacity(0.5) : .blue.opacity(0.35))
                                    .frame(width: 64, height: 64)
                                    .overlay(SwapText(detent == 2 ? "inside" : "", drift: 4).font(.caption).foregroundStyle(.white.opacity(0.9)))
                                    .motionTransition(.swap())
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Ferry Building").font(.callout.weight(.semibold)).lineSpacing(4)
                                Text("Marketplace · 0.3 mi away").font(.subheadline).foregroundStyle(.secondary).lineSpacing(4)
                                HStack(spacing: 4) {
                                    RollingDigits("48")
                                    Text("· 2,140 reviews").font(.caption).foregroundStyle(.secondary)
                                }.monospacedDigit()
                            }
                            Spacer()
                            Button("Go") { withMotion(.soft, reduceMotion: reduce) { detent = 2 } }
                                .buttonStyle(.borderedProminent).controlSize(.small)
                        }
                        if detent == 2 {
                            Text("Farmers market Saturdays, ferry terminal, bay views from the deck.")
                                .font(.subheadline).foregroundStyle(.secondary).lineSpacing(6)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .motionTransition(.presence)
                        }
                    }
                    .padding(14)
                    .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 6, y: 2))
                    .padding(12)
                    .offset(y: detent == 0 ? 118 - 118 : detent == 1 ? 0 : -56)
                    .animation(reduce ? nil : .motion(.soft), value: detent)
                    .gesture(DragGesture(minimumDistance: 8).onEnded { g in
                        withMotion(.soft, reduceMotion: reduce) {
                            detent = g.translation.height < -30 ? min(2, detent + 1) : g.translation.height > 30 ? max(0, detent - 1) : detent
                        }
                    })
                    .accessibilityLabel("Place card").accessibilityHint("Drag to resize the sheet")
                }
                .frame(width: 380).clipShape(RoundedRectangle(cornerRadius: 14))
                HStack { Text("Drag the sheet · map stays live").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Photos", isOn: $photos).labelsHidden().controlSize(.mini) }
                    .frame(width: 380)
            }
        }
    }

    private var mapGrid: some View {
        ZStack {
            Rectangle().fill(.quaternary.opacity(0.4))
            Canvas { ctx, size in
                for x in stride(from: 0, through: size.width, by: 40) { ctx.stroke(Path { $0.move(to: CGPoint(x: x, y: 0)); $0.addLine(to: CGPoint(x: x, y: size.height)) }, with: .color(.secondary.opacity(0.15))) }
            }.accessibilityHidden(true)
        }
    }
}
