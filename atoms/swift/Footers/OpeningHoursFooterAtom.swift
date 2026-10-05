import SwiftUI
import Cieo

public struct OpeningHoursFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz7-hours", category: "Footers", name: "Footer with map, contact and opening hours",
        summary: "Today comes from the clock and is marked by a tint plate that slides between rows with its leading edge first. The status chip is one pill that morphs between open (success), closing soon in the last hour (warning) and closed (danger): it blends color, resizes to its new text, and the text blur-swaps. The Preview buttons set another time so you can see each state. The map placeholder drags 1:1 with a rubber band and settles back on release.")
    public init() {}
    public var body: some View { FootPage(blocks: 1) { HoursFooter() } }
}

private struct HoursFooter: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var preview = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var drag = CGSize.zero
    @State private var tx = Track(0, preset: .soft)
    @State private var ty = Track(0, preset: .soft)
    @State private var settling = false
    private let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    private let chips: [(String, Color)] = [("Open now", .green), ("Closing soon", .orange), ("Closed", .red)]
    private let limit: CGFloat = 36

    var body: some View {
        let today = Calendar.current.component(.weekday, from: .now) - 1
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top, spacing: 14) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 0) {
                        SwapText(chips[preview].0).font(.caption.weight(.semibold)).foregroundStyle(chips[preview].1)
                            .padding(.horizontal, 10).padding(.vertical, 4)
                            .background(chips[preview].1.opacity(0.16), in: Capsule())
                    }
                    .animation(reduce ? nil : .motion(.base), value: preview)
                    VStack(spacing: 0) {
                        ForEach(days.indices, id: \.self) { i in
                            HStack { Text(days[i]); Spacer(); Text(i == 0 ? "Closed" : "9:00 – 17:00").foregroundStyle(.secondary) }
                                .font(.caption).padding(.horizontal, 8).padding(.vertical, 4).reportFrame(i, in: "hours")
                        }
                    }
                    .background { MegaPlate(frame: frames[AnyHashable(today)], radius: 6) }
                    .coordinateSpace(name: "hours").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    .frame(width: 150)
                }
                VStack(alignment: .leading, spacing: 6) {
                    TimelineView(.animation(paused: !settling)) { ctx in
                        let now = ctx.date.timeIntervalSinceReferenceDate
                        let off = settling ? CGSize(width: tx.value(at: now), height: ty.value(at: now)) : drag
                        AtomPhoto(seed: 9).frame(height: 92).offset(off).frame(height: 92).clipShape(RoundedRectangle(cornerRadius: 8))
                            .contentShape(Rectangle()).gesture(mapDrag)
                    }
                    Text("12 Market Street").font(.caption); Text("hello@example.com").font(.caption).foregroundStyle(.secondary)
                }
            }
            HStack(spacing: 6) {
                Text("Preview").font(.caption2).foregroundStyle(.secondary)
                ForEach(chips.indices, id: \.self) { i in
                    Button(["Open", "Closing", "Closed"][i]) { withMotion(.base, reduceMotion: reduce) { preview = i } }.buttonStyle(.bordered).controlSize(.mini)
                }
            }
        }
        .padding(.vertical, 14).overlay(alignment: .top) { Divider() }
    }

    private func rubber(_ v: CGFloat) -> CGFloat {
        abs(v) <= limit ? v : (v < 0 ? -1 : 1) * (limit + (abs(v) - limit) * 0.3)
    }

    private var mapDrag: some Gesture {
        DragGesture()
            .onChanged { v in settling = false; drag = CGSize(width: rubber(v.translation.width), height: rubber(v.translation.height)) }
            .onEnded { v in
                let now = Date().timeIntervalSinceReferenceDate
                let vx = (v.predictedEndTranslation.width - v.translation.width) * 2, vy = (v.predictedEndTranslation.height - v.translation.height) * 2
                if reduce { drag = .zero; return }
                tx.release(from: drag.width, velocity: vx * 0.1, to: 0, preset: .soft, at: now)
                ty.release(from: drag.height, velocity: vy * 0.1, to: 0, preset: .soft, at: now)
                settling = true
                Task { try? await Task.sleep(for: .seconds(1.2)); settling = false; drag = .zero }
            }
    }
}
