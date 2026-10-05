import SwiftUI
import MotionKit

public struct CountdownAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "countdown", category: "Data", name: "Countdown",
        summary: "Remaining time is computed from the clock each frame. Only digits that change roll, each on its own swap.")
    @State private var start = Date()
    private let total = 2 * 3600 + 14 * 60 + 9
    public init() {}

    private func parts(_ now: Date) -> [String] {
        let s = max(0, Int((Double(total) - now.timeIntervalSince(start)).rounded(.up)))
        return [s / 3600, s / 60 % 60, s % 60].map { String(format: "%02d", $0) }
    }

    public var body: some View {
        AtomStage(hint: "Only the digits that change roll") {
            TimelineView(.periodic(from: .now, by: 0.1)) { ctx in
                let p = parts(ctx.date)
                VStack(spacing: 6) {
                    HStack(alignment: .firstTextBaseline, spacing: 0) {
                        ForEach(p.indices, id: \.self) { i in
                            if i > 0 { Text(":").foregroundStyle(.tertiary).padding(.horizontal, 4) }
                            RollingDigits(p[i])
                        }
                    }
                    .font(.system(size: 40, weight: .semibold))
                    HStack(spacing: 34) { Text("hours"); Text("min"); Text("sec") }.font(.caption).foregroundStyle(.secondary)
                    Text("until doors open").font(.caption).foregroundStyle(.secondary).padding(.top, 8)
                }
                .accessibilityElement(children: .ignore)
                .accessibilityLabel("Time until doors open")
                .accessibilityValue("\(Int(p[0]) ?? 0) hours \(Int(p[1]) ?? 0) minutes")
            }
        }
    }
}
