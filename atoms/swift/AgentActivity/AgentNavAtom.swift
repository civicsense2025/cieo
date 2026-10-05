import SwiftUI
import MotionKit

public struct AgentNavAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentnav", category: "Agent activity", name: "Agent navigation",
        summary: "When a page is requested, a thin load bar runs, the old page slides out toward where you came from and the new one slides in from the other side. Back reverses the direction. The URL path swaps with it, a chip joins the visited trail (leading edge first), and navigating after going back drops the forward pages. The badge says who drove it: the agent, or you with Back, Forward or a chip.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var trail = ["/"]
    @State private var index = 0
    @State private var forward = true
    @State private var byAgent = true
    @State private var loading = false
    public init() {}

    private let paths = ["/", "/pricing", "/docs", "/signup"]
    private var path: String { trail[index] }

    public var body: some View {
        AtomStage(hint: "Replay sends the agent; Back, Forward and chips are you") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    Button { move(-1) } label: { Image(systemName: "chevron.left") }.disabled(index == 0).accessibilityLabel("Back")
                    Button { move(1) } label: { Image(systemName: "chevron.right") }.disabled(index == trail.count - 1).accessibilityLabel("Forward")
                    HStack(spacing: 4) { Image(systemName: "lock").font(.caption2); Text("demo-shop.local"); SwapText(path) }.font(.caption)
                        .padding(6).frame(maxWidth: .infinity, alignment: .leading).background(.quaternary, in: Capsule())
                    if byAgent { AgentTag() } else { Text("You").font(.caption2.weight(.semibold)).padding(.horizontal, 4).overlay(Capsule().strokeBorder(Color.primary)) }
                }.buttonStyle(AgPress()).fixedSize(horizontal: false, vertical: true)
                GeometryReader { g in
                    Capsule().fill(Color.accentColor).frame(width: loading ? g.size.width : 0, height: 2).opacity(loading ? 1 : 0)
                }.frame(height: 2)
                ZStack {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(path == "/" ? "Home" : String(path.dropFirst()).capitalized).font(.title3.weight(.semibold))
                        ForEach(0..<3, id: \.self) { _ in RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(height: 10) }
                    }
                    .padding(14).frame(maxWidth: .infinity, alignment: .topLeading).frame(height: 120)
                    .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
                    .id(path).transition(reduce ? .identity : .asymmetric(
                        insertion: .offset(x: forward ? 40 : -40).combined(with: .opacity).animation(.motion(.base).delay(Motion.exit)),
                        removal: .offset(x: forward ? -40 : 40).combined(with: .opacity).animation(.motionExit)))
                }.clipped()
                HStack {
                    Text("Visited").font(.caption).foregroundStyle(.secondary)
                    ForEach(trail.indices, id: \.self) { i in
                        Button(trail[i]) { jump(i) }.buttonStyle(AgPress(tone: i == index ? .info : nil)).font(.caption)
                    }
                    Spacer()
                    Button("Replay") { replay() }.buttonStyle(AgPress())
                }
            }
            .frame(maxWidth: 380)
        }
    }

    private func go(_ p: String, agent: Bool) {
        forward = true; byAgent = agent
        withMotion(.soft, reduceMotion: reduce) { loading = true }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 250_000_000)
            withMotion(.base, reduceMotion: reduce) { trail = Array(trail.prefix(index + 1)) + [p]; index = trail.count - 1; loading = false }
        }
    }
    private func move(_ d: Int) { forward = d > 0; byAgent = false; withMotion(.base, reduceMotion: reduce) { index += d } }
    private func jump(_ i: Int) { forward = i > index; byAgent = false; withMotion(.base, reduceMotion: reduce) { index = i } }
    private func replay() {
        withMotion(.base, reduceMotion: reduce) { trail = ["/"]; index = 0 }
        Task { @MainActor in
            for p in paths.dropFirst().prefix(3) { try? await Task.sleep(nanoseconds: 800_000_000); go(p, agent: true) }
        }
    }
}
