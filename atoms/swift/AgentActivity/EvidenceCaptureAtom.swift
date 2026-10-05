import SwiftUI
import MotionKit

public struct EvidenceCaptureAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "evidencecapture", category: "Agent activity", name: "Evidence capture",
        summary: "The agent scrolls to the element and a capture frame snaps in around it, leading edges first with the trailing edges 60ms behind, while the rest of the page dims. The region flashes once, lifts off the page as a snapshot, and shrinks and travels into the tray, landing in the slot that has just opened for it. Only when it lands does the saved-screenshots count roll up. Open any thumbnail and it grows from its own slot into a viewer with who captured it and the element it shows; arrows swap between shots.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [String: CGRect] = [:]
    @State private var shots: [String] = []
    @State private var ring: String?
    @State private var dim = false
    @State private var flash = false
    @State private var flying: (CGRect, Bool)?
    @State private var viewing: Int?
    @Namespace private var ns
    public init() {}

    private let order = ["heading", "field", "button"]

    public var body: some View {
        AtomStage(hint: "Capture, then open a thumbnail") {
            ZStack {
                VStack(alignment: .leading, spacing: 8) {
                    HStack { AgentMark(size: 22); Text("Reading the page").font(.caption); Spacer(); Button("Capture") { capture() }.buttonStyle(AgPress(tone: .info)) }
                    ZStack(alignment: .topLeading) {
                        AgMockPage().overlay(Color.black.opacity(dim ? 0.18 : 0).clipShape(RoundedRectangle(cornerRadius: 10)))
                        if let r = ring, let f = frames[r] { AgFrameRing(frame: f) }
                        if let (f, landed) = flying {
                            RoundedRectangle(cornerRadius: 3).fill(Color.accentColor.opacity(0.5)).frame(width: landed ? 40 : f.width, height: landed ? 28 : f.height)
                                .position(x: landed ? 300 : f.midX, y: landed ? 238 : f.midY)
                        }
                        Color.white.opacity(flash ? 0.5 : 0).allowsHitTesting(false)
                    }
                    .agFrames($frames).frame(height: 190)
                    HStack {
                        Text("Saved screenshots").font(.caption.weight(.semibold)); RollingDigits(shots.count).font(.caption)
                        Spacer()
                        ForEach(shots.indices, id: \.self) { i in
                            Button { withMotion(.base, reduceMotion: reduce) { viewing = i } } label: {
                                RoundedRectangle(cornerRadius: 3).fill(Color.accentColor.opacity(0.4)).frame(width: 40, height: 28)
                                    .matchedGeometryEffect(id: i, in: ns)
                            }.buttonStyle(.plain).accessibilityLabel("Open screenshot \(i + 1)").transition(.opacity)
                        }
                    }.frame(height: 30)
                }
                if let v = viewing, v < shots.count {
                    ZStack {
                        Color.black.opacity(0.3).onTapGesture { withMotion(.base, reduceMotion: reduce) { viewing = nil } }
                        VStack(spacing: 8) {
                            RoundedRectangle(cornerRadius: 8).fill(Color.accentColor.opacity(0.4)).frame(width: 220, height: 120).matchedGeometryEffect(id: v, in: ns)
                            SwapText("Captured by Claude · \(shots[v])").font(.caption)
                            HStack {
                                Button { step(-1) } label: { Image(systemName: "chevron.left") }.accessibilityLabel("Previous")
                                Button { step(1) } label: { Image(systemName: "chevron.right") }.accessibilityLabel("Next")
                                Button { withMotion(.base, reduceMotion: reduce) { viewing = nil } } label: { Image(systemName: "xmark") }.accessibilityLabel("Close")
                            }.buttonStyle(AgPress())
                        }
                        .padding(14).background(.background, in: RoundedRectangle(cornerRadius: 12)).shadow(radius: 10)
                    }
                }
            }
            .frame(maxWidth: 340)
            .animation(reduce ? nil : .motion(.base), value: shots.count)
        }
    }

    private func step(_ d: Int) { withMotion(.base, reduceMotion: reduce) { viewing = ((viewing ?? 0) + d + shots.count) % shots.count } }

    private func capture() {
        let key = order[shots.count % order.count]
        guard let f = frames[key] else { return }
        Task { @MainActor in
            withMotion(.base, reduceMotion: reduce) { ring = key; dim = true }
            try? await Task.sleep(nanoseconds: 450_000_000)
            withMotion(.snap, reduceMotion: reduce) { flash = true }
            try? await Task.sleep(nanoseconds: 100_000_000)
            withMotion(.snap, reduceMotion: reduce) { flash = false }
            flying = (f, false)
            try? await Task.sleep(nanoseconds: 60_000_000)
            withMotion(.soft, reduceMotion: reduce) { flying = (f, true); ring = nil; dim = false }
            try? await Task.sleep(nanoseconds: 450_000_000)
            flying = nil
            withMotion(.base, reduceMotion: reduce) { shots.append(key) }
        }
    }
}
