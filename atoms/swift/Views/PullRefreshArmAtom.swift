import SwiftUI
import Cieo

public struct PullRefreshArmAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "ptrarm", category: "Views", name: "Pull-to-refresh arm",
        summary: "The header stretches with rising resistance the further you pull. Past the threshold the arrow turns into a release cue. Let go and the spinner holds while fresh rows height-spring in one by one, landing on an updated terminal.")

    private enum Phase { case idle, armed, loading, done }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pull: CGFloat = 0
    @State private var phase = Phase.idle
    @State private var opened = false
    @State private var stiff = false
    private let rows = ["Water board votes 4–3 on rates", "Bus route 12 quietly disappears", "Library hours survive the cut"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pull the list down, release past 64pt") {
            VStack(spacing: 8) {
                VStack(spacing: 0) {
                    VStack(spacing: 2) {
                        Image(systemName: phase == .done ? "checkmark" : "arrow.up")
                            .font(.footnote.weight(.semibold))
                            .frame(width: 28, height: 28)
                            .background(.quaternary, in: Circle())
                            .foregroundStyle(phase == .armed ? Color.accentColor : .secondary)
                            .rotationEffect(.degrees(Double(min(pull, 90) / 90 * 180)))
                            .opacity(phase == .loading ? 0 : 1)
                        Text(phase == .armed ? "Release to refresh" : phase == .done ? "Updated just now ✓" : "Pull to refresh")
                            .font(.caption).foregroundStyle(.secondary)
                            .id("st-\(phase == .done)").motionTransition(.swap(drift: 0))
                    }
                    .frame(height: 8 + pull).clipped()
                    if phase == .loading {
                        ProgressView().controlSize(.small).padding(.vertical, 6)
                            .transition(.opacity.animation(reduce ? nil : .motion(.snap)))
                    }
                    ForEach(Array(rows.enumerated()), id: \.offset) { k, r in
                        Text(r).font(.footnote).padding(.vertical, 8)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .id("row\(opened)-\(k)")
                            .motionTransition(.swap(drift: 6))
                            .animation(reduce ? nil : (opened ? .motion(.soft).delay(Double(k) * 0.07) : .motionExit), value: opened)
                        if k < 2 { Divider() }
                    }
                    Spacer(minLength: 0)
                }
                .padding(.horizontal, 14)
                .frame(width: 320, height: 280, alignment: .top)
                .background(.background, in: RoundedRectangle(cornerRadius: 12))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
                .gesture(DragGesture(minimumDistance: 6).onChanged { g in
                    guard phase != .loading, g.translation.height > 0 else { return }
                    let dy = g.translation.height
                    pull = dy < 64 ? dy : 64 + rubber(dy - 64, stiff ? 60 : 110)
                    phase = pull > 64 ? .armed : .idle
                }.onEnded { _ in
                    guard phase != .loading else { return }
                    if pull > 64 {
                        withMotion(.base, reduceMotion: reduce) { phase = .loading; pull = 54 }
                        Task {
                            try? await Task.sleep(for: .seconds(reduce ? 0.06 : 0.9))
                            withMotion(.base, reduceMotion: reduce) { opened.toggle(); pull = 0; phase = .done }
                        }
                    } else {
                        withMotion(.base, reduceMotion: reduce) { pull = 0; phase = .idle }
                    }
                })
                Toggle("Stiff pull", isOn: $stiff).font(.caption).foregroundStyle(.secondary).frame(maxWidth: 320)
            }
        }
    }

    private func rubber(_ x: CGFloat, _ d: CGFloat) -> CGFloat {
        d * (1 - 1 / (abs(x) * 0.55 / d + 1)) * (x >= 0 ? 1 : -1)
    }
}
