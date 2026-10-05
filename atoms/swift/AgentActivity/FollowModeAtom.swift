import SwiftUI
import Cieo

public struct FollowModeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "followmode", category: "Agent activity", name: "Follow the agent",
        summary: "With Follow on, your viewport is a second, softer spring chasing the agent’s scroll, so it trails by a beat and never jerks. The moment you scroll yourself (wheel, touch, keys or scrollbar) follow breaks: the toggle turns off, the frame loses its accent edge and a Resume chip springs in, pointing up or down toward the agent. Resume glides from where you are to where the agent is.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var agentY: CGFloat = 0
    @State private var viewY: CGFloat = 0
    @State private var following = true
    @State private var dragStart: CGFloat?
    @State private var tick = 0
    public init() {}

    private let pageH: CGFloat = 700, viewH: CGFloat = 200
    private let targets: [CGFloat] = [0, 160, 330, 500, 260]

    public var body: some View {
        AtomStage(hint: "Scroll yourself to break Follow; Resume glides back") {
            VStack(spacing: 8) {
                HStack {
                    Toggle("Follow agent", isOn: Binding(get: { following }, set: { v in setFollow(v) })).toggleStyle(.switch)
                    Spacer()
                    if !following {
                        Button { setFollow(true) } label: { Label("Resume following", systemImage: agentY > viewY ? "arrow.down" : "arrow.up") }
                            .buttonStyle(AgPress(tone: .info)).transition(.scale(scale: 0.9).combined(with: .opacity))
                    }
                }
                ZStack(alignment: .topLeading) {
                    VStack(alignment: .leading, spacing: 10) {
                        ForEach(0..<7, id: \.self) { i in
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Section \(i + 1)").font(.callout.weight(.semibold))
                                RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(height: 8)
                                RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(width: 160, height: 8)
                            }.frame(height: 90, alignment: .top)
                        }
                    }
                    .padding(12).frame(height: pageH, alignment: .top).offset(y: -viewY)
                    .overlay(alignment: .topLeading) { AgCursor().offset(x: 200, y: agentY + 40 - viewY).animation(reduce ? nil : .motion(.base), value: agentY) }
                }
                .frame(height: viewH).clipped()
                .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
                .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(following ? Color.accentColor : Color.secondary.opacity(0.3), lineWidth: following ? 2 : 1))
                .gesture(DragGesture().onChanged { v in
                    if following { setFollow(false) }
                    let s = dragStart ?? viewY; dragStart = s
                    viewY = min(pageH - viewH, max(0, s - v.translation.height))
                }.onEnded { _ in dragStart = nil })
                .animation(reduce ? nil : .motion(.base), value: following)
            }
            .frame(maxWidth: 360)
            .animation(reduce ? nil : .motion(.base), value: following)
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: 2_200_000_000)
                tick += 1
                withMotion(.soft, reduceMotion: reduce) {
                    agentY = targets[tick % targets.count]
                    if following { viewY = agentY }
                }
            }
        }
    }

    private func setFollow(_ on: Bool) {
        following = on
        if on { withMotion(.soft, reduceMotion: reduce) { viewY = agentY } }
    }
}
