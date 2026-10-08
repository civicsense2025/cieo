import SwiftUI
import Cieo

public struct ShipCheckAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "shipcheck", category: "Writing", name: "Ship checklist",
        summary: "Each check fills its box, draws the tick, then runs the strike 40 ms later. The ring fills and the count rolls with every step, and the ship button swaps into a success stamp on the last one.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let steps = ["Proof the draft", "Set the cover art", "Pick the send time"]
    @State private var done = [false, false, false]
    @State private var tweak = true
    public init() {}

    private var count: Int { done.filter { $0 }.count }
    private var all: Bool { count == steps.count }
    private var frac: Double { Double(count) / Double(steps.count) }

    public var body: some View {
        AtomStage(hint: "Finish all three to stamp it shipped") {
            VStack(spacing: 8) {
                HStack {
                    Text("Ship readiness").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    Spacer()
                    ZStack {
                        Circle().stroke(.quaternary, lineWidth: 2.5)
                        Circle().trim(from: 0, to: frac).stroke(.green, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                            .animation(reduce ? nil : .motion(.base), value: frac)
                    }
                    .frame(width: 20, height: 20)
                    HStack(spacing: 2) { RollingDigits(count); Text("of 3") }
                        .font(.system(size: 12.5)).foregroundStyle(.secondary)
                }
                ForEach(steps.indices, id: \.self) { i in row(i) }
                HStack {
                    Button { ship() } label: {
                        ZStack { SwapText(all ? "✓ Shipped" : "Ship issue") }
                            .frame(minWidth: 110, minHeight: 34)
                    }
                    .buttonStyle(.borderedProminent).frame(minHeight: 32).tint(all ? .green : .accentColor)
                    .animation(reduce ? nil : .motion(.base), value: all)
                    Button("Reset") { reset() }.buttonStyle(.bordered).frame(minHeight: 32)
                }
                Toggle("Stamp on complete", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .frame(width: 300)
        }
    }

    private func row(_ i: Int) -> some View {
        Button { withMotion(.base, reduceMotion: reduce) { done[i].toggle() } } label: {
            HStack(spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 5)
                        .fill(done[i] ? Color.primary : .clear)
                        .animation(reduce ? nil : .motion(.base), value: done[i])
                    RoundedRectangle(cornerRadius: 5).fill(done[i] ? Color.primary : Color.primary.opacity(0.25)).opacity(0.10)
                    CheckTick(t: done[i] ? 1 : 0)
                        .stroke(.background, lineWidth: 2.5).frame(width: 10, height: 10)
                        .animation(reduce ? nil : .motion(.base), value: done[i])
                }
                .frame(width: 18, height: 18)
                Text(steps[i]).font(.system(size: 14))
                    .foregroundStyle(done[i] ? .secondary : .primary)
                    .overlay(alignment: .leading) {
                        Rectangle().fill(.secondary).frame(height: 1.5)
                            .scaleEffect(x: done[i] ? 1 : 0, anchor: .leading)
                            .animation(reduce ? nil : .motion(.base).delay(done[i] ? 0.04 : 0), value: done[i])
                    }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain).frame(minHeight: 32)
        .accessibilityLabel(steps[i])
        .accessibilityAddTraits(done[i] ? .isSelected : [])
    }

    private func ship() {
        guard let i = done.firstIndex(of: false) else { return }
        withMotion(.base, reduceMotion: reduce) { done[i] = true }
    }

    private func reset() { withMotion(.base, reduceMotion: reduce) { done = [false, false, false] } }
}

private struct CheckTick: Shape {
    var t: Double
    var animatableData: Double {
        get { t }
        set { t = newValue }
    }
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.minX + r.width * 0.15, y: r.midY))
        p.addLine(to: CGPoint(x: r.minX + r.width * 0.45, y: r.maxY - r.height * 0.15))
        p.addLine(to: CGPoint(x: r.maxX - r.width * 0.1, y: r.minY + r.height * 0.2))
        return p.trimmedPath(from: 0, to: max(0, min(1, t)))
    }
}
