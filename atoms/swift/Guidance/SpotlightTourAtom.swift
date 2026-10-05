import SwiftUI
import Cieo

public struct SpotlightTourAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tour", category: "Guidance", name: "Spotlight tour",
        summary: "The spotlight is one hole whose position, size and radius spring from target to target, so the dimmed area never flickers. The tooltip glides alongside and its text swaps with each step.")

    private let steps: [(id: String, title: String, body: String)] = [
        ("pages", "Your pages", "Every page lives here. Drag to reorder them."),
        ("preview", "Preview", "See the page as a reader would, on any device."),
        ("publish", "Publish", "Sends every changed page live at once.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = -1
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var lastStep = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Start the tour") {
            VStack(spacing: 10) {
                ZStack(alignment: .topLeading) {
                    ui
                    if step >= 0 || lastStep >= 0 { overlay }
                }
                .coordinateSpace(name: "tour")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .frame(width: 400, height: 230)
                .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                Button("Start tour") { withMotion(.base, reduceMotion: reduce) { step = 0; lastStep = 0 } }.buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    private var ui: some View {
        VStack(spacing: 12) {
            HStack(spacing: 10) {
                Text("Pages").padding(.horizontal, 10).padding(.vertical, 6).background(.quaternary, in: Capsule()).reportFrame("pages", in: "tour")
                Spacer()
                Text("Preview").padding(.horizontal, 10).padding(.vertical, 6).background(.quaternary, in: Capsule()).reportFrame("preview", in: "tour")
                Text("Publish").foregroundStyle(.background).padding(.horizontal, 10).padding(.vertical, 6)
                    .background(Color.primary, in: Capsule()).reportFrame("publish", in: "tour")
            }.font(.footnote.weight(.medium))
            RoundedRectangle(cornerRadius: 8).fill(.quaternary.opacity(0.7)).frame(height: 120)
        }.padding(16)
    }

    private var overlay: some View {
        let s = max(0, step), r = (frames[steps[s].id] ?? .zero).insetBy(dx: -6, dy: -6)
        let right = r.maxX + 14 + 200 < 400
        let tip = CGPoint(x: right ? r.maxX + 14 + 100 : max(8 + 100, r.maxX - 120), y: right ? max(8 + 45, r.midY) : r.maxY + 14 + 45)
        return ZStack(alignment: .topLeading) {
            Color.black.opacity(0.5)
                .mask(Rectangle().overlay(RoundedRectangle(cornerRadius: 10).frame(width: r.width, height: r.height)
                    .position(x: r.midX, y: r.midY).blendMode(.destinationOut)).compositingGroup())
                .allowsHitTesting(false)
            VStack(alignment: .leading, spacing: 6) {
                ZStack(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(steps[s].title).font(.footnote.weight(.semibold))
                        Text(steps[s].body).font(.caption).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
                    }.id(s).motionTransition(.swap())
                }
                HStack {
                    Text("\(s + 1) of \(steps.count)").font(.caption2).foregroundStyle(.secondary)
                    Spacer()
                    if s > 0 { Button("Back") { go(s - 1) }.buttonStyle(.borderless) }
                    Button(s == steps.count - 1 ? "Done" : "Next") { go(s + 1) }.buttonStyle(.borderless).fontWeight(.semibold)
                }.font(.caption)
            }
            .padding(10).frame(width: 200, height: 90, alignment: .topLeading)
            .background(.background, in: RoundedRectangle(cornerRadius: 10)).shadow(color: .black.opacity(0.2), radius: 8, y: 2)
            .position(tip).opacity(step >= 0 ? 1 : 0)
        }
        .opacity(step >= 0 ? 1 : 0)
        .animation(reduce ? nil : .motion(.base), value: step)
        .allowsHitTesting(step >= 0)
    }

    private func go(_ n: Int) {
        if n >= steps.count { withMotion(.snap, reduceMotion: reduce) { step = -1 } }
        else { withMotion(.base, reduceMotion: reduce) { step = n; lastStep = n } }
    }
}
