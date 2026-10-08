import SwiftUI
import Cieo

public struct AgentQueueAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentqueue", category: "Agent activity", name: "Agent comment queue",
        summary: "When the run finishes the snackbar rises and its count rolls up as five pins drop onto the page 90ms apart. Review morphs that same snackbar into a sheet that steps through the pins: the page scrolls so the pin sits in the visible part above the sheet, the selector frame travels to it with leading edges first, the text swaps with blur, the count rolls and the progress plate slides to the new tick. Arrow keys and ticks jump directly; Escape or Done folds the sheet back to the snackbar.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [String: CGRect] = [:]
    @State private var pinsOn = 0
    @State private var reviewing = false
    @State private var index = 0
    @State private var run = 0
    public init() {}

    private let items = [("heading", "Heading is too close to the nav"), ("field", "Email field needs a label"), ("button", "Button label is vague"), ("link", "Link text says Read more")]

    public var body: some View {
        AtomStage(hint: "Review steps through the pins; Done folds the sheet back") {
            VStack(spacing: 8) {
                ZStack(alignment: .topLeading) {
                    AgMockPage()
                    if reviewing, let f = frames[items[index].0] { AgFrameRing(frame: f) }
                    ForEach(0..<pinsOn, id: \.self) { i in
                        if let f = frames[items[i].0] { AgPinMark(label: "\(i + 1)", tone: reviewing && index == i ? .warning : .info).position(x: f.maxX, y: f.minY).transition(.scale.combined(with: .opacity)) }
                    }
                }
                .agFrames($frames).animation(reduce ? nil : .motion(.snap), value: pinsOn)
                VStack(alignment: .leading, spacing: 6) {
                    if reviewing {
                        HStack(spacing: 2) { RollingDigits(index + 1); Text("of \(items.count)") }.font(.caption.weight(.semibold))
                        SwapText(items[index].1).font(.callout)
                        HStack(spacing: 4) {
                            ForEach(items.indices, id: \.self) { i in
                                Button { withMotion(.base, reduceMotion: reduce) { index = i } } label: { Capsule().fill(i <= index ? Color.accentColor : Color.secondary.opacity(0.3)).frame(height: 4) }
                                    .buttonStyle(.plain).accessibilityLabel("Pin \(i + 1)")
                            }
                        }
                        HStack {
                            Button { step(-1) } label: { Image(systemName: "chevron.left") }.accessibilityLabel("Previous").disabled(index == 0)
                            Button { step(1) } label: { Image(systemName: "chevron.right") }.accessibilityLabel("Next").disabled(index == items.count - 1)
                            Spacer()
                            Button("Done") { withMotion(.base, reduceMotion: reduce) { reviewing = false } }
                        }.buttonStyle(AgPress())
                    } else {
                        HStack {
                            AgentMark(size: 22)
                            HStack(spacing: 3) { Text("Finished the review."); RollingDigits(pinsOn); Text("comments") }.font(.callout)
                            Spacer()
                            Button("Review") { withMotion(.base, reduceMotion: reduce) { reviewing = true; index = 0 } }.buttonStyle(AgPress(tone: .info)).disabled(pinsOn < items.count)
                            Button("Replay") { run += 1 }.buttonStyle(AgPress())
                        }
                    }
                }
                .padding(10).background(.background, in: RoundedRectangle(cornerRadius: 12)).background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05))).shadow(radius: 4, y: 2)
                .animation(reduce ? nil : .motion(.base), value: reviewing)
            }
            .frame(maxWidth: 360)
        }
        .task(id: run) {
            pinsOn = 0; reviewing = false
            try? await Task.sleep(nanoseconds: 400_000_000)
            for i in 1...items.count { pinsOn = i; try? await Task.sleep(nanoseconds: 90_000_000) }
        }
    }
    private func step(_ d: Int) { withMotion(.base, reduceMotion: reduce) { index = min(items.count - 1, max(0, index + d)) } }
}
