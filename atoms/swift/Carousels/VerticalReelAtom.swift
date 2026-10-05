import SwiftUI
import Cieo

public struct VerticalReelAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-reel", category: "Carousels", name: "Vertical reel",
        summary: "Vertical drag is 1:1 and a flick moves at most one reel, like Reels and Shorts; captions trail their photo slightly so the move reads as depth. Pulling up past the last reel fills a ring; released past the mark, the next four are appended and the same release velocity carries straight into the first of them. The arrow keys and buttons do the same, including loading the next set. Use when each item fills a phone screen and people move through them one at a time.")
    @State private var count = 3
    @State private var advance = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Flick up for the next reel; pull past the last to load more") {
            HStack(spacing: 14) {
                PhPager(count: count, itemFraction: 1, axis: .vertical, maxStep: 1, advance: advance, onRelease: { raw in
                    // past the mark, four more are appended and the same release carries on into them
                    if raw - Double(count - 1) > 0.3 { count += 4; return 4 }
                    return 0
                }) { pos, size, item in
                    ZStack {
                        ForEach(0..<count, id: \.self) { i in
                            let d = Double(i) - pos
                            ZStack(alignment: .bottomLeading) {
                                phPhoto(i, CGSize(width: size.width, height: size.height))
                                Text("Reel \(i + 1)").font(.headline).foregroundStyle(.white).shadow(radius: 3).padding(12)
                                    .offset(y: CGFloat(d) * 18)       // the caption trails its photo
                            }
                            .frame(width: size.width, height: size.height).clipShape(RoundedRectangle(cornerRadius: 14))
                            .offset(y: CGFloat(d) * size.height).opacity(abs(d) < 1.2 ? 1 : 0)
                        }
                    }.frame(width: size.width, height: size.height)
                }
                .frame(width: 150, height: 240)
                VStack(spacing: 10) {
                    Button { advance -= 1 } label: { Image(systemName: "chevron.up") }.accessibilityLabel("Previous reel")
                    Button { advance += 1 } label: { Image(systemName: "chevron.down") }.accessibilityLabel("Next reel")
                }.buttonStyle(.bordered)
            }
        }
    }
}
