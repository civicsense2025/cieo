import SwiftUI
import Cieo

public struct StepperHeaderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stepheader", category: "Forms", name: "Stepper header",
        summary: "The active plate glides with its leading edge first. The connector fills toward the new step, then the node inks. Finished steps swap their numbers for checks, and extra steps fade at the scrolled edges.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var wide = false
    @State private var cur = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    private var names: [String] { wide ? ["Invite", "Team", "Details", "Plan", "Review", "Done"] : ["Invite", "Details", "Review", "Done"] }
    public init() {}

    public var body: some View {
        AtomStage(hint: "Click any step; done steps swap to checks") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 8) {
                    ScrollView(.horizontal, showsIndicators: false) {
                        ZStack(alignment: .topLeading) {
                            EdgesIndicator(frame: plateFrame, shape: RoundedRectangle(cornerRadius: 14), style: Color(.quaternarySystemFill))
                            HStack(spacing: 2) {
                                ForEach(names.indices, id: \.self) { i in
                                    if i > 0 {
                                        GeometryReader { g in
                                            ZStack(alignment: .leading) {
                                                RoundedRectangle(cornerRadius: 1).fill(.quaternary)
                                                RoundedRectangle(cornerRadius: 1).fill(Color.accentColor)
                                                    .frame(width: g.size.width * segFill(i))
                                            }
                                        }.frame(width: 22, height: 2)
                                    }
                                    Button { go(i) } label: {
                                        HStack(spacing: 6) {
                                            ZStack {
                                                Circle().fill(i < cur ? Color.accentColor : Color.clear)
                                                    .frame(width: 18, height: 18)
                                                if i < cur { Text("✓").font(.caption2.weight(.bold)).foregroundStyle(.white) }
                                                else { Text("\(i + 1)").font(.caption2.weight(.semibold)).foregroundStyle(i == cur ? .primary : .secondary) }
                                            }
                                            .id("n\(i)-\(i < cur)")
                                            .motionTransition(.swap(drift: 0))
                                            Text(names[i]).font(.footnote.weight(i == cur ? .semibold : .regular))
                                        }
                                        .padding(.horizontal, 10).frame(height: 28)
                                        .foregroundStyle(i == cur ? .primary : .secondary)
                                    }
                                    .buttonStyle(.plain).reportFrame(i, in: "sh")
                                    .accessibilityAddTraits(i == cur ? .isSelected : [])
                                }
                            }
                        }
                    }
                    .coordinateSpace(name: "sh").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    .mask(edgeFades)
                    .animation(reduce ? nil : .motion(.base), value: cur)
                    Text("Step \(cur + 1) of \(names.count) · \(names[cur])").font(.caption).foregroundStyle(.secondary)
                }
                .padding(14)
                .frame(maxWidth: 360)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12)).clipShape(RoundedRectangle(cornerRadius: 12))
                Toggle("6 steps (overflow)", isOn: $wide).font(.caption).foregroundStyle(.secondary).frame(maxWidth: 360)
                    .onChange(of: wide) { _, _ in
                        withMotion(.base, reduceMotion: reduce) { cur = min(cur, names.count - 1) }
                    }
            }
        }
    }

    private var plateFrame: CGRect {
        let f = frames[cur] ?? .zero
        return CGRect(x: f.minX, y: 0, width: f.width, height: 28)
    }

    private func segFill(_ i: Int) -> CGFloat { cur >= i ? 1 : 0 }

    private var edgeFades: some View {
        LinearGradient(stops: [
            .init(color: .clear, location: 0), .init(color: .black, location: 0.06),
            .init(color: .black, location: 0.94), .init(color: .clear, location: 1)],
            startPoint: .leading, endPoint: .trailing)
    }

    private func go(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { cur = i }
    }
}
