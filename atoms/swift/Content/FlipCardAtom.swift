import SwiftUI
import Cieo

public struct FlipCardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "flip", category: "Content", name: "Flip card",
        summary: "One rotation track on the soft spring. The card sinks 3% at the midpoint so the flip has depth without a bounce.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var back = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap or press Return") {
            Button { withMotion(.soft, reduceMotion: reduce) { back.toggle() } } label: {
                Faces(angle: back ? 180 : 0)
                    .frame(width: 220, height: 140)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Flip card")
            .accessibilityValue(back ? "Showing details" : "Showing plan")
        }
    }

    /// Animatable so the face swap and the sink follow the rotation angle on every frame.
    private struct Faces: View, Animatable {
        var angle: Double
        var animatableData: Double {
            get { angle }
            set { angle = newValue }
        }
        var body: some View {
            ZStack {
                VStack(alignment: .leading) {
                    Text("Plan").font(.footnote).foregroundStyle(.secondary)
                    Spacer()
                    Text("Studio").font(.title2.weight(.bold))
                }
                .padding(16).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.07)))
                .opacity(angle < 90 ? 1 : 0)

                Text("Unlimited pages, custom domains, member areas and priority support.")
                    .font(.footnote).foregroundStyle(.background)
                    .padding(16).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .background(RoundedRectangle(cornerRadius: 14).fill(.primary))
                    .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))
                    .opacity(angle >= 90 ? 1 : 0)
            }
            .rotation3DEffect(.degrees(angle), axis: (x: 0, y: 1, z: 0), perspective: 0.4)
            .scaleEffect(1 - 0.03 * sin(Double.pi * min(1, max(0, angle / 180))))
        }
    }
}
