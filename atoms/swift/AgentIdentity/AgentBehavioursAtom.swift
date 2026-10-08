import SwiftUI
import Cieo

public struct AgentBehavioursAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentbehaviours", category: "Agent identity", name: "Agent behaviours",
        summary: "One agent performs eighteen behaviours inside a small web page, each a short loop that ends where it began. It hops to get around and every landing squashes and recovers without bouncing. What it carries trails its body and tilts against the motion. It leans into whatever it pushes, and its face changes mood brows first, then lids, then mouth. The page answers on the same clock: a button squashes, a soft highlight appears, a pin goes in, text is struck through. Asking permission waits for your real Allow or Deny.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var x: CGFloat = 20
    @State private var lift: CGFloat = 0
    @State private var squash = CGSize(width: 1, height: 1)
    @State private var lean = 0.0
    @State private var face = AgFace()
    @State private var look = CGSize.zero
    @State private var prop: String?
    @State private var buttonPressed = false
    @State private var highlight = false
    @State private var pinned = false
    @State private var struck = false
    @State private var asking = false
    @State private var caption = "Pick a behaviour"
    @State private var token = 0
    @State private var current: String?
    public init() {}

    private let behaviours = ["Hop", "Push", "Carry", "Look", "Pin", "Strike", "Ask", "Cheer"]

    public var body: some View {
        AtomStage(hint: "Pick a behaviour, or take the tour") {
            VStack(spacing: 8) {
                ZStack(alignment: .bottomLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04))
                    HStack(spacing: 16) {
                        Spacer(minLength: 100)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Total $48.00").font(.callout).strikethrough(struck).padding(2)
                                .overlay(highlight ? RoundedRectangle(cornerRadius: 4).fill(Color.accentColor).opacity(0.10).allowsHitTesting(false) : nil)
                            Text("Pay now").font(.caption.weight(.semibold)).foregroundStyle(.white).padding(.horizontal, 8).padding(.vertical, 5)
                                .background(Color.accentColor, in: RoundedRectangle(cornerRadius: 6)).scaleEffect(buttonPressed ? 0.94 : 1)
                        }
                    }.padding(12).frame(maxHeight: .infinity, alignment: .top)
                    if pinned { AgPinMark(label: "1").offset(x: 250, y: -105).transition(.scale) }
                    ZStack(alignment: .topTrailing) {
                        AgentIdle { blink, breathe in AgentCharacter(size: 44, face: face, look: look, squash: CGSize(width: squash.width, height: squash.height * breathe), lean: lean, wash: .green, blink: blink) }
                        if let p = prop { Image(systemName: p).font(.caption).offset(x: 12, y: 14).rotationEffect(.degrees(-lean * 1.2)).transition(.scale) }
                    }
                    .offset(x: x, y: -lift - 6)
                    if asking {
                        HStack { Button("Allow") { answer("Thanks!", .happy) }.buttonStyle(AgPress(tone: .success)); Button("Deny") { answer("Understood.", .worried) }.buttonStyle(AgPress()) }
                            .offset(x: 80, y: -80).transition(.opacity)
                    }
                }
                .frame(height: 140).clipped()
                .animation(reduce ? nil : .motion(.base), value: pinned)
                .animation(reduce ? nil : .motion(.base), value: asking)
                SwapText(caption).font(.caption).foregroundStyle(.secondary)
                HStack(spacing: 4) {
                    ForEach(behaviours, id: \.self) { b in Button(b) { run(b) }.buttonStyle(AgPress(tone: current == b ? .info : nil)).font(.caption) }
                }
                HStack { Button("Tour") { tour() }.buttonStyle(AgPress(tone: .info)); Button("Replay") { token += 1; if let c = current { run(c) } }.buttonStyle(AgPress()) }
            }
            .frame(maxWidth: 380)
        }
    }

    private func settle() async {
        withMotion(.base, reduceMotion: reduce) { lean = 0; look = .zero; prop = nil; buttonPressed = false; highlight = false; struck = false; face = AgFace(); pinned = false; asking = false }
        try? await Task.sleep(nanoseconds: 100_000_000)
    }
    private func hop(to nx: CGFloat) async {
        withMotion(.soft, reduceMotion: reduce) { x = nx; lean = nx > x ? 6 : -6 }
        withMotion(.snap, reduceMotion: reduce) { lift = 22; squash = CGSize(width: 0.92, height: 1.1) }
        try? await Task.sleep(nanoseconds: 180_000_000)
        withMotion(.snap, reduceMotion: reduce) { lift = 0; squash = CGSize(width: 1.1, height: 0.88) }
        try? await Task.sleep(nanoseconds: 120_000_000)
        withMotion(.snap, reduceMotion: reduce) { squash = CGSize(width: 1, height: 1); lean = 0 }
        try? await Task.sleep(nanoseconds: 150_000_000)
    }
    private func answer(_ s: String, _ m: AgMood) { withMotion(.base, reduceMotion: reduce) { asking = false; caption = s }; agStage(m, face: $face, reduce: reduce) }

    private func run(_ b: String) {
        current = b; token += 1
        let mine = token
        Task { @MainActor in
            await settle()
            switch b {
            case "Hop": caption = "It hops to get around and the landing squashes"; await hop(to: 150); await hop(to: 20)
            case "Push": caption = "Leans into what it pushes"; await hop(to: 180); withMotion(.base, reduceMotion: reduce) { lean = 12 }; try? await Task.sleep(nanoseconds: 250_000_000)
                withMotion(.snap, reduceMotion: reduce) { buttonPressed = true }; try? await Task.sleep(nanoseconds: 200_000_000); withMotion(.snap, reduceMotion: reduce) { buttonPressed = false }
            case "Carry": caption = "What it carries trails and tilts against the motion"; withMotion(.base, reduceMotion: reduce) { prop = "shippingbox" }; await hop(to: 150); await hop(to: 20)
            case "Look": caption = "Mood moves brows, then lids, then mouth"; agStage(.thinking, face: $face, reduce: reduce); withMotion(.soft, reduceMotion: reduce) { look = CGSize(width: 1, height: -0.3) }; try? await Task.sleep(nanoseconds: 700_000_000); withMotion(.base, reduceMotion: reduce) { highlight = true }
            case "Pin": caption = "The soft highlight appears, then a pin goes in"; await hop(to: 150); withMotion(.base, reduceMotion: reduce) { highlight = true }; try? await Task.sleep(nanoseconds: 350_000_000); withMotion(.snap, reduceMotion: reduce) { pinned = true }
            case "Strike": caption = "Text is struck through"; await hop(to: 150); withMotion(.base, reduceMotion: reduce) { struck = true }
            case "Ask": caption = "Waiting for your Allow or Deny"; agStage(.worried, face: $face, reduce: reduce); withMotion(.base, reduceMotion: reduce) { asking = true }
            default: caption = "Cheers"; agStage(.happy, face: $face, reduce: reduce); await hop(to: 60); await hop(to: 100)
            }
            if mine != token { return }
        }
    }

    private func tour() {
        Task { @MainActor in for b in behaviours where b != "Ask" { run(b); try? await Task.sleep(nanoseconds: 2_000_000_000) } }
    }
}
