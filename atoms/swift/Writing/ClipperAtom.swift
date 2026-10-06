import SwiftUI
import Cieo

public struct ClipperAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "clipper", category: "Writing", name: "Clip drop target",
        summary: "Dragging over the card warms its tint. Dropping grows the saved preview down from nothing. The cover starts soft and sharpens, then the title trades places with a saved line and its check.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var over = false
    @State private var saved = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the chip onto the card") {
            VStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Drop here to save").font(.callout.weight(.semibold))
                    Text("Drag the quote chip onto this card").font(.caption).foregroundStyle(.secondary)
                    if saved {
                        RoundedRectangle(cornerRadius: 10).fill(.quaternary).frame(height: 96)
                            .blur(radius: reduce ? 0 : 0)
                            .transition(.asymmetric(insertion: .move(edge: .top).combined(with: .opacity), removal: .opacity))
                        Text("✓ Saved").font(.caption)
                            .id(saved).motionTransition(.swap())
                    }
                }
                .padding(16)
                .frame(maxWidth: 320)
                .background(over ? Color.accentColor.opacity(0.15) : Color.clear)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(over ? Color.accentColor : Color.primary.opacity(0.2), style: StrokeStyle(lineWidth: 2, dash: [8])))
                .animation(reduce ? nil : .motion(.snap), value: over)
                .animation(reduce ? nil : .motion(.base), value: saved)
                Text("“Write what you notice.”")
                    .font(.caption).padding(.horizontal, 14).padding(.vertical, 8)
                    .overlay(Capsule().stroke(.quaternary))
                    .gesture(DragGesture(minimumDistance: 4)
                        .onChanged { _ in if !over { withMotion(.snap, reduceMotion: reduce) { over = true } } }
                        .onEnded { v in
                            withMotion(.snap, reduceMotion: reduce) { over = false }
                            if v.translation.height > 20 {
                                withMotion(.base, reduceMotion: reduce) { saved = true }
                            }
                        })
                HStack {
                    Button("Clip") { withMotion(.base, reduceMotion: reduce) { saved = true } }.buttonStyle(.borderedProminent)
                    Spacer()
                    Button("Reset") { withMotion(.base, reduceMotion: reduce) { saved = false; over = false } }.buttonStyle(.bordered)
                }
                .frame(maxWidth: 320)
            }
        }
    }
}
