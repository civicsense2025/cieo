import SwiftUI
import Cieo

public struct TokenInspectorAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tokeninspector", category: "Foundations", name: "Token inspector",
        summary: "Spring, swap, lag and digits tokens in one panel. The probe runs the picked spring live.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var probe = Track(0, preset: .base)
    @State private var pick = 1
    private let names = ["snap", "base", "soft", "lazy"]
    private let presets: [SpringPreset] = [.snap, .base, .soft, .lazy]
    private let rows = [("snap · ω34", "200ms"), ("base · ω22", "300ms"), ("soft · ω15", "440ms"),
                        ("lazy · ω9", "740ms"), ("swap exit", "100ms"), ("edge lag", "60ms")]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Every token in one panel · probe runs live") {
            VStack(spacing: 8) {
                ForEach(rows, id: \.0) { r in
                    HStack {
                        Text(r.0).font(.system(size: 13, design: .monospaced))
                        Spacer()
                        Text(r.1).font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                    }
                }
                TimelineView(.animation(paused: reduce)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    VStack(spacing: 8) {
                        GeometryReader { g in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 8).fill(.quaternary)
                                Circle().fill(Color.accentColor).frame(width: 14, height: 14)
                                    .offset(x: 8 + CGFloat(probe.value(at: t)) * max(1, g.size.width - 30))
                            }
                        }
                        .frame(height: 32)
                        Text("probe \(String(format: "%.3f", probe.value(at: t))) · \(names[pick])")
                            .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                    }
                }
                Button("Probe") {
                    let v = probe.target > 0.5 ? 0.0 : 1.0
                    if reduce { probe.jump(v) } else { probe.set(v, preset: presets[pick], at: Date().timeIntervalSinceReferenceDate) }
                }
                .buttonStyle(.borderedProminent).frame(maxWidth: .infinity, minHeight: 36)
                HStack(spacing: 8) {
                    Text("Spring").font(.caption).foregroundStyle(.secondary)
                    ForEach(0..<4, id: \.self) { i in
                        Button(names[i]) { pick = i; probe.preset = presets[i] }
                            .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    }
                }
            }
            .frame(maxWidth: 340)
        }
    }
}
