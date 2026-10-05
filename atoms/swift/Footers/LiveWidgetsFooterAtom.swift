import SwiftUI
import Cieo

public struct LiveWidgetsFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz4-live", category: "Footers", name: "Footer with live widgets",
        summary: "Time, conditions and the ticker are all computed from the clock. Picking an office rolls the hours, minutes and seconds digit by digit, rolls the temperature, and blur-swaps the icon and the condition text, 100ms out then in. Seconds roll once a second. The now-playing ticker moves at constant speed on a velocity track: hovering, focusing or pressing pause eases the speed to zero on a critically damped spring, and releasing eases it back.")
    public init() {}
    public var body: some View { FootPage(blocks: 1) { LiveFooter() } }
}

private final class Ticker {
    var x = 0.0
    var last: Double?
    var speed = Track(1, preset: .soft)
    func advance(_ now: Double, pxPerSecond: Double) -> Double {
        if let last { x += speed.value(at: now) * pxPerSecond * (now - last) }
        last = now
        return x
    }
}

private struct LiveFooter: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var office = 0
    @State private var paused = false
    @State private var ticker = Ticker()
    private let offices: [(String, String, Int, String, String)] = [
        ("London", "Europe/London", 14, "cloud.sun", "Partly cloudy"), ("Tokyo", "Asia/Tokyo", 22, "sun.max", "Clear"), ("New York", "America/New_York", 9, "cloud.rain", "Light rain")]
    private let track = "Now playing: Slow Rivers, Quiet Machines, Evening Static, Paper Lanterns, "

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Picker("Office", selection: $office) { ForEach(offices.indices, id: \.self) { Text(offices[$0].0).tag($0) } }.pickerStyle(.segmented).frame(maxWidth: 280)
            HStack(spacing: 14) {
                TimelineView(.periodic(from: .now, by: 1)) { ctx in
                    var cal = Calendar.current; let _ = cal.timeZone = TimeZone(identifier: offices[office].1) ?? .current
                    let c = cal.dateComponents([.hour, .minute, .second], from: ctx.date)
                    HStack(spacing: 0) { RollingDigits(String(format: "%02d", c.hour ?? 0)); Text(":"); RollingDigits(String(format: "%02d", c.minute ?? 0)); Text(":"); RollingDigits(String(format: "%02d", c.second ?? 0)) }
                        .font(.title3.monospacedDigit().weight(.semibold))
                }
                HStack(spacing: 4) { RollingDigits(offices[office].2); Text("°C") }.font(.callout)
                HStack(spacing: 4) { ZStack { Image(systemName: offices[office].3).id(office).transition(.opacity.animation(.motion(.base).delay(Motion.exit))) }; SwapText(offices[office].4) }
                    .font(.caption).foregroundStyle(.secondary).animation(reduce ? nil : .motion(.base), value: office)
            }
            ticker_
        }
        .padding(.vertical, 14).overlay(alignment: .top) { Divider() }
    }

    private var ticker_: some View {
        HStack(spacing: 8) {
            Button { setPaused(!paused) } label: { Image(systemName: paused ? "play.fill" : "pause.fill").frame(width: 24, height: 24) }
                .buttonStyle(.plain).accessibilityLabel(paused ? "Play ticker" : "Pause ticker")
            TimelineView(.animation(paused: reduce)) { ctx in
                let w = Double(track.count) * 6.6
                let x = ticker.advance(ctx.date.timeIntervalSinceReferenceDate, pxPerSecond: 30).truncatingRemainder(dividingBy: w)
                HStack(spacing: 0) { ForEach(0..<3, id: \.self) { _ in Text(track).font(.caption.monospaced()).fixedSize() } }
                    .offset(x: -x).frame(maxWidth: .infinity, alignment: .leading).clipped()
            }
            .onHover { setPaused($0 || paused, hover: true) }
            .accessibilityLabel("Now playing ticker")
        }
    }

    private func setPaused(_ p: Bool, hover: Bool = false) {
        if !hover { paused = p }
        ticker.speed.set(p ? 0 : 1, at: Date().timeIntervalSinceReferenceDate)
    }
}
