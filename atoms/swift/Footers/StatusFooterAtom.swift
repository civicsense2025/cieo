import SwiftUI
import Cieo

public struct StatusFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-status", category: "Footers", name: "Footer with live status",
        summary: "The pill is one element. Switching state morphs its dot and tint along green, amber, red on a single value; the label swaps out then in while the pill springs to the new text width. Next, the incident note opens beneath it (height first, then content) and, if the details list is open, each affected service dot changes colour 45ms after the last. Clicking the pill opens the per-service list; if the page was at the bottom it stays pinned there.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var state = 0
    @State private var details = false
    @State private var noteOpen = false
    @State private var noteText = false
    private let labels = ["All systems operational", "Degraded performance", "Partial outage"]
    private let services = ["API", "Dashboard", "Email"]
    public init() {}
    public var body: some View {
        AtomStage(hint: "Switch the state; click the pill") {
            VStack(alignment: .leading, spacing: 8) {
                Picker("State", selection: $state) { Text("OK").tag(0); Text("Degraded").tag(1); Text("Outage").tag(2) }.pickerStyle(.segmented).frame(maxWidth: 240)
                Button { withMotion(.soft, reduceMotion: reduce) { details.toggle() } } label: {
                    HStack(spacing: 6) {
                        Circle().frame(width: 8, height: 8).modifier(StatusTint(v: Double(state), fillsBackground: false))
                        SwapText(labels[state]).font(.caption.weight(.medium))
                    }
                    .padding(.horizontal, 10).padding(.vertical, 6)
                    .modifier(StatusTint(v: Double(state), fillsBackground: true))
                    .animation(reduce ? nil : .motion(.base), value: state)
                }
                .buttonStyle(.plain).accessibilityValue(labels[state])
                VStack(alignment: .leading, spacing: 4) {
                    if noteOpen { Text("We are investigating elevated errors. Updates every 15 minutes.").font(.caption).foregroundStyle(.secondary).opacity(noteText ? 1 : 0).fixedSize(horizontal: false, vertical: true) }
                }
                .clipped()
                if details {
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(services.indices, id: \.self) { i in
                            HStack(spacing: 6) {
                                Circle().frame(width: 7, height: 7).modifier(StatusTint(v: Double(max(0, state - i)), fillsBackground: false))
                                    .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.045), value: state)
                                Text(services[i]).font(.caption)
                            }
                        }
                    }.motionTransition(.presence)
                }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .onChange(of: state) { _, s in
                let show = s > 0
                if reduce { noteOpen = show; noteText = show; return }
                if show { withAnimation(.motion(.soft)) { noteOpen = true }; withAnimation(.motion(.base).delay(Motion.exit)) { noteText = true } }
                else { withAnimation(.motionExit) { noteText = false }; withAnimation(.motion(.soft).delay(Motion.lag)) { noteOpen = false } }
            }
        }
    }
}

/// Fills with green, amber or red depending on `v` (0, 1, 2) and interpolates along that line while `v` animates.
private struct StatusTint: ViewModifier, Animatable {
    var v: Double
    let fillsBackground: Bool
    var animatableData: Double { get { v } set { v = newValue } }
    private var color: Color {
        let hue = v <= 1 ? 0.36 - 0.25 * v : 0.11 - 0.11 * (v - 1)
        return Color(hue: hue, saturation: 0.75, brightness: 0.78)
    }
    func body(content: Content) -> some View {
        if fillsBackground { content.background(color.opacity(0.16), in: Capsule()) } else { content.foregroundStyle(color) }
    }
}
