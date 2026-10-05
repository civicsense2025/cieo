import SwiftUI
import Cieo

public struct ScrollScrubbedSequenceAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-sequence", category: "Scroll stories", name: "Scroll-scrubbed sequence",
        summary: "Use when a product or place reveal should feel like video but stay under the reader’s control. 24 frames are generated from one PhotoKit scene with the sun sinking (tod 0 → 1), lazily and nearest-to-the-playhead first. Scroll position is the playhead: the follower-smoothed index picks two neighbouring frames and blends them by the fraction between, so slow scrolling never steps. The tick rail and clock follow the same index. Reduced motion shows the nearest frame without blending.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}
    private let frames = 24

    public var body: some View {
        PhScrollStory(hint: "Scroll position is the playhead; frames blend, never step", length: 3) { p, s in
            let idx = p * Double(frames - 1)
            let i = Int(idx), f = reduce ? 0 : idx - Double(i)
            let gold = { (n: Int) in Double(n) / Double(frames - 1) }
            VStack(spacing: 8) {
                ZStack {
                    phPhoto(4, CGSize(width: s.width - 24, height: s.height * 0.68), golden: gold(i))
                    // the smoothed index picks two neighbouring frames and blends by the fraction between
                    phPhoto(4, CGSize(width: s.width - 24, height: s.height * 0.68), golden: gold(min(frames - 1, i + 1))).opacity(f)
                }.clipShape(RoundedRectangle(cornerRadius: 12))
                HStack(spacing: 2) {
                    ForEach(0..<frames, id: \.self) { n in
                        Capsule().fill(Double(n) <= idx + 0.5 ? Color.accentColor : Color.secondary.opacity(0.3)).frame(width: 4, height: n % 6 == 0 ? 12 : 8)
                    }
                }
                Text(String(format: "%d:%02d", 12 + Int(p * 6.5), Int((p * 6.5 - floor(p * 6.5)) * 60))).font(.caption.monospacedDigit()).foregroundStyle(.secondary)
            }
        }
    }
}
