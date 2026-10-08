import SwiftUI
import Cieo

public struct ChecklistAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "checklist", category: "Content", name: "Checklist",
        summary: "The box fills, the check draws, and a strike line runs through the text, each 40ms after the last. The done count rolls. All four done swaps the header to a success pill.")
    @State private var done: [Bool] = [true, true, false, false]
    @State private var celebrate = true
    private let titles = ["Connect a domain", "Write the about page", "Turn on members", "Publish"]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 0) {
                    Text("Launch checklist")
                    Spacer()
                    ZStack(alignment: .trailing) {
                        if done.allSatisfy({ $0 }) && celebrate {
                            Text("All done ✓").font(.caption2.weight(.semibold)).foregroundStyle(Color.accentColor)
                                .padding(.horizontal, 10).padding(.vertical, 2)
                                .background(Capsule().fill(Color.accentColor.opacity(0.15)))
                                .motionTransition(.swap(drift: 0))
                        } else {
                            HStack(spacing: 0) {
                                RollingDigits(done.filter { $0 }.count)
                                Text(" of 4 done")
                            }
                            .motionTransition(.swap(drift: 0))
                        }
                    }
                    .frame(minWidth: 92, alignment: .trailing)
                }
                .font(.footnote).foregroundStyle(.secondary)
                VStack(spacing: 4) {
                    ForEach(titles.indices, id: \.self) { i in Row(title: titles[i], on: $done[i]) }
                }
                Toggle("Celebrate", isOn: $celebrate).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
            }
            .frame(maxWidth: 300)
        }
    }

    private struct Row: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let title: String
        @Binding var on: Bool

        private func anim(_ delay: Double) -> Animation? { reduce ? nil : .motion(.base).delay(on ? delay : 0) }

        var body: some View {
            Button { on.toggle() } label: {
                HStack(spacing: 10) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 5).fill(on ? Color.primary : Color.clear)
                            .animation(anim(0), value: on)
                        RoundedRectangle(cornerRadius: 5).fill(on ? Color.primary : Color.primary.opacity(0.25)).opacity(0.10)
                            .animation(anim(0), value: on)
                        Tick().trim(from: 0, to: on ? 1 : 0)
                            .stroke(.background, style: StrokeStyle(lineWidth: 2.2, lineCap: .round, lineJoin: .round))
                            .frame(width: 11, height: 11)
                            .animation(anim(0.04), value: on)
                    }
                    .frame(width: 18, height: 18)
                    Text(title).font(.callout)
                        .foregroundStyle(on ? Color.secondary : Color.primary)
                        .animation(anim(0.08), value: on)
                        .overlay(alignment: .leading) {
                            GeometryReader { g in
                                Rectangle().fill(Color.secondary).frame(width: on ? g.size.width : 0, height: 1.5)
                                    .position(x: (on ? g.size.width : 0) / 2, y: g.size.height * 0.55)
                                    .animation(anim(0.08), value: on)
                            }
                        }
                    Spacer(minLength: 0)
                }
                .padding(.vertical, 6).contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityAddTraits(.isToggle)
            .accessibilityValue(on ? "Done" : "Not done")
        }
    }

    private struct Tick: Shape {
        func path(in r: CGRect) -> Path {
            var p = Path()
            p.move(to: CGPoint(x: r.width * 0.12, y: r.height * 0.52))
            p.addLine(to: CGPoint(x: r.width * 0.4, y: r.height * 0.8))
            p.addLine(to: CGPoint(x: r.width * 0.88, y: r.height * 0.22))
            return p
        }
    }
}
