import SwiftUI
import MotionKit

public struct MorphSurfaceAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "surface", category: "Admin", name: "Morph surface",
        summary: "Button, loader, check, dynamic island and toast are one element. Width, height, radius and ink ride springs, and the check fills with the success color. Content swaps by the blur rule. The run is a list of timed events.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Phase: String { case button, loader, check, island, toast
        var size: CGSize {
            switch self { case .button: CGSize(width: 180, height: 52); case .loader, .check: CGSize(width: 52, height: 52)
                          case .island: CGSize(width: 252, height: 44); case .toast: CGSize(width: 300, height: 60) }
        }
        var radius: CGFloat { self == .island ? 22 : self == .toast ? 16 : 26 }
    }
    @State private var phase = Phase.button
    @State private var since = Date()
    @State private var run: Task<Void, Never>?
    public init() {}

    private var filled: Bool { phase != .toast }

    public var body: some View {
        AtomStage(hint: "Click the button") {
            VStack(spacing: 12) {
                Button(action: start) {
                    content.id(phase).motionTransition(.swap())
                        .frame(width: phase.size.width, height: phase.size.height)
                        .foregroundStyle(phase == .check ? AnyShapeStyle(Color.white) : filled ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
                        .background(phase == .check ? AnyShapeStyle(Color.green) : filled ? AnyShapeStyle(.primary) : AnyShapeStyle(.regularMaterial),
                                    in: RoundedRectangle(cornerRadius: phase.radius))
                        .shadow(color: .black.opacity(filled ? 0 : 0.12), radius: 6, y: 2)
                        .clipShape(RoundedRectangle(cornerRadius: phase.radius))
                }
                .buttonStyle(.plain).fontWeight(.medium)
                .animation(reduce ? nil : .motion(.base), value: phase)
                .accessibilityLabel(phase == .button ? "Get started" : phase.rawValue)
                Text(phase.rawValue).font(.caption.monospaced()).foregroundStyle(.secondary)
            }
        }
        .onDisappear { run?.cancel() }
    }

    @ViewBuilder private var content: some View {
        switch phase {
        case .button: Text("Get started")
        case .loader:
            TimelineView(.animation(paused: reduce)) { ctx in
                Image(systemName: "arrow.2.circlepath").rotationEffect(.degrees(reduce ? 0 : (ctx.date.timeIntervalSinceReferenceDate * 420).truncatingRemainder(dividingBy: 360)))
            }
        case .check: CheckDraw(since: since)
        case .island:
            HStack(spacing: 8) {
                Circle().fill(.red).frame(width: 8, height: 8)
                Text("Recording").font(.subheadline)
                TimelineView(.animation(paused: reduce)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    HStack(spacing: 2) {
                        ForEach(0..<9, id: \.self) { i in Capsule().frame(width: 2, height: reduce ? 8 : 4 + 8 * abs(sin(t * 6 + Double(i) * 0.9) * sin(t * 2.3 + Double(i)))) }
                    }
                    .frame(height: 14)
                    Text("0:\(String(format: "%02d", Int(ctx.date.timeIntervalSince(since) * 3) % 60))").font(.caption).monospacedDigit()
                }
            }
        case .toast:
            HStack(spacing: 8) {
                Image(systemName: "checkmark").foregroundStyle(.green).font(.callout.weight(.bold))
                Text("Recording saved"); Text("· Undo").fontWeight(.regular).foregroundStyle(.secondary)
            }
            .font(.subheadline)
        }
    }

    private func start() {
        guard phase == .button, run == nil else { return }
        let plan: [(Double, Phase)] = [(0, .loader), (1.1, .check), (1.9, .island), (3.6, .toast), (5.6, .button)]
        run = Task {
            var elapsed = 0.0
            for (at, next) in plan {
                try? await Task.sleep(for: .seconds(at - elapsed)); elapsed = at
                if Task.isCancelled { return }
                since = Date()
                withMotion(.base, reduceMotion: reduce) { phase = next }
            }
            run = nil
        }
    }
}

/// The check draws itself on the soft spring after the swap lands.
private struct CheckDraw: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let since: Date
    @State private var drawn = false
    var body: some View {
        CheckShape().trim(from: 0, to: drawn || reduce ? 1 : 0)
            .stroke(style: StrokeStyle(lineWidth: 2.25, lineCap: .round, lineJoin: .round)).frame(width: 22, height: 22)
            .onAppear { withAnimation(reduce ? nil : .motion(.soft).delay(0.08)) { drawn = true } }
    }
}

private struct CheckShape: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.width * 5 / 24, y: r.height * 12.5 / 24))
        p.addLine(to: CGPoint(x: r.width * 10 / 24, y: r.height * 17.5 / 24))
        p.addLine(to: CGPoint(x: r.width * 19 / 24, y: r.height * 7 / 24))
        return p
    }
}
