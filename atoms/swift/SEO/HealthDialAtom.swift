import SwiftUI
import Cieo

public struct HealthDialAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "healthdial", category: "SEO", name: "Audit health dial",
        summary: "Two concentric rings fill on the same soft spring while the composite score rolls its digits. The verdict swaps in only once the run settles, and holds as the terminal state.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var perf = 0.0
    @State private var tech = 0.0
    @State private var score = 0
    @State private var verdict = ""
    @State private var separate = true
    @State private var task: Task<Void, Never>?
    public init() {}

    private var band: String { score >= 80 ? "Healthy" : score >= 50 ? "Needs work" : "Poor" }
    private var tint: Color { score >= 80 ? .green : score >= 50 ? .orange : .red }

    public var body: some View {
        AtomStage(hint: "Run a new audit") {
            VStack(spacing: 6) {
                ZStack {
                    Circle().stroke(.quaternary, lineWidth: 11).frame(width: 124, height: 124)
                    Circle().stroke(.quaternary, lineWidth: 11).frame(width: 92, height: 92)
                    Circle().trim(from: 0, to: perf / 100).stroke(tint, style: StrokeStyle(lineWidth: 11, lineCap: .round))
                        .rotationEffect(.degrees(-90)).frame(width: 124, height: 124)
                        .motion(.soft, value: perf)
                    Circle().trim(from: 0, to: tech / 100).stroke(separate ? Color.accentColor : tint, style: StrokeStyle(lineWidth: 11, lineCap: .round))
                        .rotationEffect(.degrees(-90)).frame(width: 92, height: 92)
                        .motion(.soft, value: tech)
                    VStack(spacing: 0) {
                        RollingDigits(score).font(.system(size: 30, weight: .semibold))
                        Text("of 100 · 24 checks").font(.caption2).foregroundStyle(.secondary)
                    }
                }
                .frame(width: 148, height: 148)
                SwapText(verdict).font(.subheadline.weight(.semibold)).foregroundStyle(tint).frame(height: 22)
                Text("Outer ring: performance · inner: technical").font(.caption).foregroundStyle(.secondary)
                Toggle("Show rings separately", isOn: $separate).font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.checkbox)
                Button("Run audit", action: run).font(.caption).buttonStyle(.borderless)
            }
        }
        .onAppear(perform: run)
    }

    private func run() {
        task?.cancel()
        let p = Double(Int.random(in: 38...97)), q = Double(Int.random(in: 38...97))
        let s = Int(((p + q) / 2).rounded())
        withMotion(.soft, reduceMotion: reduce) { verdict = "" }
        if reduce { perf = p; tech = q; score = s; verdict = band; return }
        perf = 0; tech = 0; score = 0
        withMotion(.soft, reduceMotion: false) { perf = p; tech = q; score = s }
        task = Task {
            try? await Task.sleep(for: .seconds(SpringPreset.soft.settleTime()))
            if !Task.isCancelled { verdict = band }
        }
    }
}
