import SwiftUI
import Cieo

public struct SketchTextAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sketchtext", category: "Writing", name: "Sketch to text",
        summary: "The ink settles and trades places with typed text. The lines below slide down to make room. Words the reader might doubt blush a warning tint. Retake brings the ink back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var done = false
    @State private var tweak = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Convert swaps ink for text") {
            VStack(alignment: .leading, spacing: 8) {
                ZStack(alignment: .topLeading) {
                    Path { p in
                        p.move(to: CGPoint(x: 12, y: 40))
                        p.addCurve(to: CGPoint(x: 140, y: 28), control1: CGPoint(x: 60, y: 8), control2: CGPoint(x: 90, y: 52))
                        p.addCurve(to: CGPoint(x: 268, y: 34), control1: CGPoint(x: 190, y: 4), control2: CGPoint(x: 230, y: 12))
                    }
                    .stroke(.primary, lineWidth: 3)
                    .frame(height: 60)
                    .opacity(done ? 0 : 1)
                    .animation(reduce ? nil : .motion(.snap), value: done)
                    if done {
                        (Text("Tomorrow: ") + Text("outline the ").foregroundStyle(.orange) + Text("spring essay."))
                            .font(.system(size: 14))
                            .id(done).motionTransition(.swap())
                            .animation(reduce ? nil : .motion(.base), value: done)
                    }
                }
                .frame(maxWidth: 320, minHeight: 90)
                .padding(14)
                .background(.quaternary.opacity(0.2), in: RoundedRectangle(cornerRadius: 10))
                Toggle("Flag unsure words", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
                VStack(alignment: .leading, spacing: 8) {
                    Text("Tomorrow: outline the spring essay.").font(.system(size: 12.5))
                    Text("Reminder set for 8 in the morning.").font(.system(size: 12.5)).foregroundStyle(.secondary)
                }
                .offset(y: reduce ? 0 : (done ? 44 : 0))
                .animation(reduce ? nil : .motion(.base), value: done)
                HStack {
                    Button("Convert") { withMotion(.base, reduceMotion: reduce) { done = true } }.buttonStyle(.borderedProminent).frame(minHeight: 32)
                    Spacer()
                    Button("Retake") { withMotion(.base, reduceMotion: reduce) { done = false } }.buttonStyle(.bordered).frame(minHeight: 32)
                }
            }
            .frame(maxWidth: 320)
        }
    }
}
