import Cieo
import SwiftUI

/// Records a voice reply: a microphone button that becomes a recording row with a clock, a live level,
/// Cancel, Pause or Resume, and Done. Tap mode starts and stops with buttons; hold mode records while
/// the button is held and slides left to cancel. The finished clip goes to the host through
/// `VoiceRecorderModel.onRecorded`; the host owns upload and storage.
///
/// The microphone is asked for only when the person taps record, never on appear. The model stops the
/// recorder and releases the audio session when the view disappears.
public struct VoiceRecorder: View {
    /// How the record button behaves.
    public enum Mode: Sendable, CaseIterable {
        /// Press to start, press Done to stop.
        case tap
        /// Record while the button is held; slide left to cancel.
        case hold
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.renderPolicy) private var policy
    @Environment(\.openURL) private var openURL
    @State private var model: VoiceRecorderModel
    @State private var pulse = false
    @State private var holdOrigin: CGFloat?
    @State private var holdOutcome = VoiceRecorderModel.HoldOutcome.record
    private let mode: Mode
    private let label: Text
    private let onRecorded: ((VoiceRecorderModel.Clip) -> Void)?
    private let onCancel: (() -> Void)?
    private let autoStart: Bool

    /// Uses a model the host owns, so it can read `state` and wire `onRecorded` itself.
    /// `autoStart` begins recording as soon as the recorder appears; pass it only when the recorder
    /// appears because someone just asked to record (a mic button in a composer), never on screen load.
    public init(model: VoiceRecorderModel, mode: Mode = .tap, label: Text = Text("Record a voice reply"), autoStart: Bool = false) {
        _model = State(initialValue: model)
        self.mode = mode
        self.label = label
        self.autoStart = autoStart
        onRecorded = nil
        onCancel = nil
    }

    /// Makes its own model. `maxDuration` is in seconds; recording stops by itself at the limit.
    public init(maxDuration: TimeInterval = 120, // literal-ok: default take limit
                mode: Mode = .tap, label: Text = Text("Record a voice reply"), autoStart: Bool = false,
                onRecorded: @escaping (VoiceRecorderModel.Clip) -> Void, onCancel: (() -> Void)? = nil) {
        _model = State(initialValue: VoiceRecorderModel(maxDuration: maxDuration))
        self.mode = mode
        self.label = label
        self.autoStart = autoStart
        self.onRecorded = onRecorded
        self.onCancel = onCancel
    }

    public var body: some View {
        let phase = model.state.phase
        let active = VoiceRecorderModel.isActive(phase)
        VStack(alignment: .leading, spacing: metrics.compact) {
            ViewThatFits(in: .horizontal) {
                row(phase: phase, active: active, stacked: false)
                row(phase: phase, active: active, stacked: true)
            }
            if phase == .error { errorView }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(label)
        .motionAnimation(.base, value: phase)
        .onAppear {
            if let onRecorded { model.onRecorded = onRecorded }
            if let onCancel { model.onCancel = onCancel }
            if autoStart, model.state.phase == .idle { model.start() }
        }
        .onChange(of: model.announcement) { _, next in
            if let next { AccessibilityNotification.Announcement(next.text).post() }
        }
        .onDisappear { model.teardown() }
        .task(id: PulseKey(recording: phase == .recording, motion: policy.allowsMotion && !reduceMotion)) {
            await runPulse(recording: phase == .recording)
        }
    }

    // MARK: - Pieces

    @ViewBuilder
    private func row(phase: VoiceRecorderModel.Phase, active: Bool, stacked: Bool) -> some View {
        let layout = stacked ? AnyLayout(VStackLayout(alignment: .leading, spacing: metrics.compact))
            : AnyLayout(HStackLayout(spacing: metrics.compact))
        layout {
            if mode == .hold || !active { recordButton(phase: phase, active: active) }
            if active { liveRow(phase: phase, stacked: stacked) }
        }
    }

    private func liveRow(phase: VoiceRecorderModel.Phase, stacked: Bool) -> some View {
        let near = VoiceRecorderModel.isNearLimit(elapsed: Double(model.state.elapsed), maxDuration: model.maxDuration)
        return HStack(spacing: metrics.compact) {
            Circle()
                .fill(theme.danger)
                .frame(width: metrics.standard, height: metrics.standard)
                .scaleEffect(phase == .recording && pulse ? 1.25 : 1) // literal-ok: recording pulse swell
                .opacity(phase == .paused ? Self.pausedDot : 1)
                .accessibilityHidden(true)
            if phase == .requesting {
                Text("Waiting for the microphone").font(typography.detail).foregroundStyle(theme.secondary)
            } else {
                clock(near: near)
                AudioLevelMeter(level: phase == .recording ? model.level : 0)
            }
            if mode == .hold, holdOrigin != nil {
                Text(holdOutcome == .cancel ? "Release to cancel" : "Slide left to cancel")
                    .font(typography.detail).foregroundStyle(holdOutcome == .cancel ? theme.danger : theme.secondary)
                    .accessibilityHidden(true)
            }
            if !stacked { Spacer(minLength: 0) }
            actions(phase: phase)
        }
    }

    private static let pausedDot = 0.4 // literal-ok: a paused dot is dimmed, not pulsing

    private func clock(near: Bool) -> some View {
        let elapsed = Double(model.state.elapsed)
        let shown = near ? "-" + VoiceRecorderModel.formatClock(Double(VoiceRecorderModel.remainingSeconds(elapsed: elapsed, maxDuration: model.maxDuration)))
            : VoiceRecorderModel.formatClock(elapsed)
        return Text(shown)
            .font(typography.value)
            .foregroundStyle(near ? theme.danger : theme.foreground)
            .contentTransition(.numericText())
            .accessibilityLabel(near ? Text("Time left") : Text("Elapsed time"))
            .accessibilityValue(VoiceRecorderModel.spokenClock(near
                ? Double(VoiceRecorderModel.remainingSeconds(elapsed: elapsed, maxDuration: model.maxDuration)) : elapsed))
    }

    @ViewBuilder
    private func actions(phase: VoiceRecorderModel.Phase) -> some View {
        IconButton(.discard, label: "Cancel recording") { model.cancel() }
        if mode == .tap, phase != .requesting {
            IconButton(phase == .paused ? .play : .pause, label: phase == .paused ? "Resume recording" : "Pause recording") {
                model.togglePause()
            }
            IconButton(.check, label: "Stop recording", prominent: true) { model.stop() }
        }
    }

    @ViewBuilder
    private func recordButton(phase: VoiceRecorderModel.Phase, active: Bool) -> some View {
        let recording = phase == .recording || phase == .paused
        let name = mode == .hold && recording ? Text("Stop recording") : label
        let face = InlineGlyph { icons(.microphone) }
            .font(typography.prominentGlyph)
            .foregroundStyle(active ? theme.onAccent : theme.accent)
            .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
            .background(active ? theme.accent : theme.tint, in: .circle)
            .contentShape(.circle)
        if mode == .hold {
            face
                .gesture(holdGesture)
                .accessibilityElement(children: .ignore)
                .accessibilityLabel(name)
                .accessibilityAddTraits(.isButton)
                .accessibilityAction { recording ? model.stop() : model.start() }
        } else {
            Button { model.start() } label: { face }
                .buttonStyle(.plain)
                .accessibilityLabel(name)
        }
    }

    private var holdGesture: some Gesture {
        DragGesture(minimumDistance: 0)
            .onChanged { value in
                if holdOrigin == nil {
                    guard !VoiceRecorderModel.isActive(model.state.phase) else { return }
                    holdOrigin = value.startLocation.x
                    holdOutcome = .record
                    model.start()
                }
                guard let origin = holdOrigin else { return }
                let next = VoiceRecorderModel.holdGesture(dx: Double(value.location.x - origin))
                if next != holdOutcome {
                    holdOutcome = next
                    if next == .cancel { model.announceReleaseToCancel() }
                }
            }
            .onEnded { value in
                guard let origin = holdOrigin else { return }
                let outcome = VoiceRecorderModel.holdGesture(dx: Double(value.location.x - origin))
                holdOrigin = nil
                holdOutcome = .record
                if outcome == .cancel || model.state.phase == .requesting { model.cancel() }
                else if model.state.phase == .recording { model.stop() }
            }
    }

    private var errorView: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            StatusLabel(errorText, icon: .error, tone: .danger)
            HStack(spacing: metrics.compact) {
                if model.state.reason != .unsupported {
                    ActionButton("Try again", emphasis: .quiet) { model.start() }
                }
                if model.state.reason == .denied, let url = Self.settingsURL {
                    ActionButton("Open Settings", emphasis: .quiet) { openURL(url) }
                }
            }
        }
    }

    private var errorText: String {
        switch model.state.reason {
        case .denied: VoiceRecorderModel.announcementText(.denied)
        case .unsupported: VoiceRecorderModel.announcementText(.unsupported)
        default: VoiceRecorderModel.announcementText(.failed)
        }
    }

    /// The system page where the person can allow the microphone.
    static var settingsURL: URL? {
        #if os(iOS)
        URL(string: UIApplication.openSettingsURLString)
        #else
        URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")
        #endif
    }

    // MARK: - Recording pulse

    private struct PulseKey: Hashable { let recording: Bool; let motion: Bool }

    /// The recording dot pulses only while recording and motion is allowed; the task ends when the view
    /// leaves the screen or the take stops, and the dot is static under Reduce Motion.
    private func runPulse(recording: Bool) async {
        guard recording, policy.allowsMotion, !reduceMotion else { pulse = false; return }
        while !Task.isCancelled {
            withMotion(.lazy, reduceMotion: reduceMotion) { pulse.toggle() }
            try? await Task.sleep(for: .seconds(0.8)) // literal-ok: pulse period
        }
        pulse = false
    }
}

#Preview("VoiceRecorder") {
    VStack(alignment: .leading, spacing: 24) { // literal-ok: preview layout
        VoiceRecorder(onRecorded: { _ in })
        VoiceRecorder(mode: .hold, onRecorded: { _ in }) // literal-ok: preview
    }
    .padding()
}
