import SwiftUI
import Cieo

public struct FlyToStripAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txi-flyto", category: "Image transitions", name: "Fly-to strip",
        summary: "The view pulls back in proportion to how fast it is travelling, slides along the strip and settles back in, so a jump of five photos shows more of the set than a step of one, and dragging lifts it slightly so neighbours peek in. Use it when position in the set matters, like chapters or numbered steps.")
    @State private var target = 0
    @State private var held = false
    public init() {}
    private let count = 6

    public var body: some View {
        AtomStage(hint: "Jump by one or by five: the view pulls back with the distance") {
            VStack(spacing: 12) {
                PhFollow(target: Double(target), preset: .soft) { pos in
                    GeometryReader { g in
                        let item = g.size.width * 0.62
                        // pull back in proportion to how far there is still to travel
                        let away = min(1, abs(Double(target) - pos) / 5)
                        let zoom = 1 - 0.28 * phSmooth(away)
                        ZStack {
                            ForEach(0..<count, id: \.self) { i in
                                phPhoto(i, CGSize(width: item - 10, height: g.size.height * 0.8))
                                    .clipShape(RoundedRectangle(cornerRadius: 10))
                                    .opacity(abs(Double(i) - pos) < 0.5 ? 1 : 0.7)
                                    .offset(x: (CGFloat(Double(i) - pos)) * item)
                            }
                        }
                        .frame(width: g.size.width, height: g.size.height)
                        .scaleEffect(zoom).clipped()
                    }
                }
                .frame(height: 150)
                .accessibilityHidden(true)
                HStack(spacing: 6) {
                    ForEach(0..<count, id: \.self) { i in
                        Button("\(i + 1)") { target = i }
                            .buttonStyle(.bordered).controlSize(.small)
                            .tint(i == target ? Color.accentColor : .secondary)
                            .accessibilityLabel("Go to photo \(i + 1)")
                    }
                }
            }
        }
    }
}
