import Charts
import Cieo
import CieoUI
import SwiftUI

/// Interactive Swift `Charts` spring curve plotter (`x(t)`, `v(t)`, and `Track` impulse superposition),
/// velocity drag pad, and live `AsyncActionState` / `SheetDetentState` / `AgentStore` explorers with haptic log.
public struct PhysicsLabView: View {
    public enum CurveMode: String, CaseIterable, Sendable {
        case position = "Position x(t)"
        case velocity = "Velocity v(t)"
        case superposition = "Retarget Superposition"
    }

    public struct CurveSample: Identifiable, Equatable, Sendable {
        public let id: String
        public let series: String
        public let timeMs: Double
        public let value: Double
    }

    public struct HapticLogEntry: Identifiable, Equatable, Sendable {
        public let id: Int
        public let source: String
        public let haptic: MotionHaptic
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.hapticsPolicy) private var hapticsPolicy

    @State private var curveMode: CurveMode = .position
    @State private var customW: Double = 22
    @State private var customZeta: Double = PhysicsLabView.defaultZeta
    @State private var dragOffset: CGSize = .zero
    @State private var tracker = VelocityTracker()
    @State private var releaseVelocity: CGVector = .zero
    @State private var actionMachine = AsyncActionState()
    @State private var detentMachine = SheetDetentState(detents: [160, 420, 720], selectedDetent: 160)
    @State private var hapticLog: [HapticLogEntry] = []
    @State private var nextLogID = 1
    @State private var agentStore = PhysicsLabView.seededStore()
    @State private var nextSeq = 3

    /// Critically damped, the house default: it settles without overshoot.
    public static let defaultZeta: Double = 1.0
    /// Preset order used for the chart series and their ink-based colors.
    public static let seriesNames = ["snap", "base", "soft", "lazy", "custom"]

    public init() {}

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.section) {
            springChartsSpecimen
            velocityDragSpecimen
            stateAndHapticsSpecimen
            agentStoreSpecimen
        }
    }

    private var springChartsSpecimen: some View {
        let samples = Self.sampleCurves(mode: curveMode, customW: customW, customZeta: customZeta)
        let custom = SpringPreset(w: customW, zeta: customZeta)
        return Specimen(title: "Swift Charts Spring Response & Superposition") {
            FlowStack(spacing: metrics.compact) {
                ForEach(CurveMode.allCases, id: \.self) { mode in
                    SelectionChip(
                        Text(verbatim: mode.rawValue),
                        isSelected: Binding(
                            get: { curveMode == mode },
                            set: { if $0 { curveMode = mode } }
                        )
                    )
                    .chipStyle(.soft)
                }
            }
            HStack(spacing: metrics.compact) {
                Text(verbatim: "ω \(Int(customW))").font(typography.reference)
                Slider(value: $customW, in: 6...48)
                    .accessibilityLabel("Stiffness ω")
                    .accessibilityValue("\(Int(customW))")
                Text(verbatim: String(format: "ζ %.2f", customZeta)).font(typography.reference)
                Slider(value: $customZeta, in: 0.7...1.0)
                    .accessibilityLabel("Damping ratio ζ")
                    .accessibilityValue(String(format: "%.2f", customZeta))
            }
            Chart(samples) { sample in
                LineMark(
                    x: .value("Time (ms)", sample.timeMs),
                    y: .value("Response", sample.value)
                )
                .foregroundStyle(by: .value("Preset", sample.series))
                if curveMode == .superposition {
                    RuleMark(x: .value("Retarget 1", 140))
                        .foregroundStyle(theme.subtle)
                    RuleMark(x: .value("Retarget 2", 300))
                        .foregroundStyle(theme.subtle)
                }
            }
            .chartForegroundStyleScale(domain: Self.seriesNames, range: seriesColors)
            .frame(height: 190)
            Text(verbatim: String(format: "Custom settle time (99.9%%): %.0f ms", custom.settleTime() * 1000))
                .font(typography.reference)
                .foregroundStyle(theme.secondary)
        }
    }

    /// Ink first, accent only for the preset being tuned; no default rainbow palette.
    private var seriesColors: [Color] {
        [theme.foreground, theme.secondary, theme.subtle, theme.borderStrong, theme.accent]
    }

    private var velocityDragSpecimen: some View {
        let projectedX = MotionPhysics.projectMomentum(value: 0, velocity: Double(releaseVelocity.dx), decelerationRate: 0.990)
        return Specimen(title: "VelocityTracker & Rubber-Band Pad") {
            ZStack {
                RoundedRectangle(cornerRadius: metrics.corner).fill(theme.sunken)
                Circle()
                    .fill(theme.accent)
                    .frame(width: metrics.controlLarge, height: metrics.controlLarge)
                    .offset(dragOffset)
            }
            .frame(height: 140)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        dragOffset = CGSize(
                            width: MotionPhysics.rubberBand(overshoot: value.translation.width, dimension: 140),
                            height: MotionPhysics.rubberBand(overshoot: value.translation.height, dimension: 140)
                        )
                        tracker.addSample(
                            CGPoint(x: value.translation.width, y: value.translation.height),
                            at: ProcessInfo.processInfo.systemUptime
                        )
                    }
                    .onEnded { _ in
                        releaseVelocity = tracker.velocity()
                        tracker.reset()
                        dragOffset = .zero
                    }
            )
            .motionAnimation(.base, value: dragOffset == .zero)
            Text(verbatim: "vx: \(Int(releaseVelocity.dx)) pt/s · vy: \(Int(releaseVelocity.dy)) pt/s · projected Δx: \(Int(projectedX)) pt")
                .font(typography.reference)
                .foregroundStyle(theme.secondary)
        }
    }

    private var stateAndHapticsSpecimen: some View {
        Specimen(title: "AsyncActionPhase, Detent Snaps & MotionHaptic Log") {
            Text(verbatim: "Phase: \(phaseSummary) · Detent: \(Int(detentMachine.selectedDetent)) pt · Policy: \(hapticsPolicy.rawValue)")
                .font(typography.reference)
                .foregroundStyle(theme.secondary)
            ActionButton("Submit operation", phase: actionMachine.phase) {
                recordHaptic("AsyncAction.begin", actionMachine.begin().haptic)
            }
            FlowStack(spacing: metrics.compact) {
                ActionButton("Succeed", emphasis: .quiet, sizing: .fitted) {
                    recordHaptic("AsyncAction.succeed", actionMachine.succeed().haptic)
                }
                ActionButton("Timeout", emphasis: .quiet, sizing: .fitted) {
                    recordHaptic("AsyncAction.timeout", actionMachine.timeout().haptic)
                }
                ActionButton("Fail", emphasis: .quiet, sizing: .fitted) {
                    recordHaptic("AsyncAction.fail", actionMachine.fail("Upstream unavailable").haptic)
                }
                ActionButton("Flick Detent +650", emphasis: .quiet, sizing: .fitted) {
                    detentMachine.updateDrag(24)
                    recordHaptic("SheetDetent.endDrag", detentMachine.endDrag(velocity: 650).haptic)
                }
                ActionButton("Reset", emphasis: .quiet, sizing: .fitted) {
                    _ = actionMachine.reset()
                    recordHaptic("SheetDetent.select", detentMachine.select(160).haptic)
                }
            }
            if hapticLog.isEmpty {
                Text("Trigger a state transition or detent flick to inspect emitted MotionHaptic intents.")
                    .font(typography.detail)
                    .foregroundStyle(theme.secondary)
            } else {
                ForEach(hapticLog) { item in
                    HStack(spacing: metrics.compact) {
                        Text(verbatim: "#\(item.id)").font(typography.reference).foregroundStyle(theme.secondary)
                        Text(verbatim: item.source).font(typography.detail)
                        Spacer()
                        StatusChip(String(describing: item.haptic), tone: .active)
                    }
                }
            }
        }
        .motionHaptic(trigger: hapticLog.first?.id) { _, _ in hapticLog.first?.haptic }
    }

    private var agentStoreSpecimen: some View {
        Specimen(title: "AgentStore Contiguous Sequence Reducer") {
            Text(verbatim: "cursor: \(agentStore.cursor) · hasGap: \(agentStore.hasGap) · dropped: \(agentStore.dropped) · activity: \(agentStore.activity.count)")
                .font(typography.reference)
                .foregroundStyle(theme.secondary)
            FlowStack(spacing: metrics.compact) {
                ActionButton("Append event", emphasis: .quiet, sizing: .fitted) {
                    _ = agentStore.apply([
                        .toolCall(seq: nextSeq, at: "now", runId: "r1", agentId: "planner", callId: "c-\(nextSeq)", name: "index.scan", phase: .finished, summary: "OK"),
                    ])
                    nextSeq += 1
                }
                ActionButton("Simulate seq gap", emphasis: .quiet, sizing: .fitted) {
                    _ = agentStore.apply([
                        .runStatus(seq: nextSeq + 2, at: "now", runId: "r1", agentId: "planner", status: .waiting),
                    ])
                }
                ActionButton("Reset store", emphasis: .quiet, sizing: .fitted) {
                    agentStore = Self.seededStore()
                    nextSeq = 3
                }
            }
            AgentActivity(store: agentStore)
        }
    }

    private var phaseSummary: String {
        switch actionMachine.phase {
        case .idle: "idle"
        case .pending: "pending"
        case .succeeded: "succeeded"
        case .failed(let msg): "failed (\(msg))"
        case .canceled: "canceled"
        case .uncertain(let msg): "uncertain (\(msg))"
        }
    }

    private func recordHaptic(_ source: String, _ haptic: MotionHaptic?) {
        guard let haptic else { return }
        let entry = HapticLogEntry(id: nextLogID, source: source, haptic: haptic)
        nextLogID += 1
        hapticLog = Array(([entry] + hapticLog).prefix(5))
    }

    public static func sampleCurves(mode: CurveMode, customW: Double, customZeta: Double) -> [CurveSample] {
        let custom = SpringPreset(w: max(1, customW), zeta: customZeta)
        let presets: [(String, SpringPreset)] = [
            ("snap", .snap), ("base", .base), ("soft", .soft), ("lazy", .lazy), ("custom", custom),
        ]
        let steps = 60
        let horizon = 0.75
        var out: [CurveSample] = []
        for (name, preset) in presets {
            var track = Track(0, preset: preset)
            if mode == .superposition {
                track.set(1.0, preset: preset, at: 0.0)
                track.set(0.35, preset: preset, at: 0.14)
                track.set(1.0, preset: preset, at: 0.30)
            }
            for step in 0...steps {
                let t = horizon * Double(step) / Double(steps)
                let val: Double = switch mode {
                case .position: 1.0 - Motion.resp(t, x0: 1.0, v0: 0, preset)
                case .velocity: -Motion.vel(t, x0: 1.0, v0: 0, preset)
                case .superposition: track.value(at: t)
                }
                out.append(CurveSample(id: "\(name)-\(step)", series: name, timeMs: t * 1000, value: val))
            }
        }
        return out
    }

    @MainActor
    private static func seededStore() -> AgentStore {
        let store = AgentStore()
        _ = store.apply([
            .runStatus(seq: 1, at: "00:01", runId: "r1", agentId: "planner", status: .running),
            .agentStatus(seq: 2, at: "00:02", runId: "r1", agentId: "planner", status: .running, name: "Planner"),
        ])
        return store
    }
}
