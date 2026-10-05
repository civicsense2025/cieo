import SwiftUI
import Cieo

public struct ContactSheetLoupeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-contact-loupe", category: "Galleries", name: "Contact sheet with a loupe",
        summary: "A round loupe follows the pointer on a snap spring, so it trails the hand by a few frames instead of being glued to it. What it shows is the sheet itself, scaled 3.4 times about the lens centre, so frames cross the glass continuously and picks you have marked show up inside it. The lens pops in on enter and out on leave, and its label swaps (out, then in) as the centre crosses from one frame to the next. On touch the lens sits above the finger so it is never hidden by it; from the keyboard it parks on the focused frame. Use when people must judge sharpness or expression across many small frames without opening each one.")
    @State private var point = CGPoint(x: 150, y: 90)
    @State private var active = false
    public init() {}
    private let cols = 6, rows = 4
    private let picks: Set<Int> = [2, 9, 14, 21]

    private func sheet(_ s: CGSize) -> some View {
        let cw = (s.width - CGFloat(cols - 1) * 4) / CGFloat(cols), ch = (s.height - CGFloat(rows - 1) * 4) / CGFloat(rows)
        return ZStack(alignment: .topLeading) {
            ForEach(0..<(cols * rows), id: \.self) { k in
                ZStack(alignment: .topTrailing) {
                    phPhoto(k, CGSize(width: cw, height: ch)).clipShape(RoundedRectangle(cornerRadius: 3))
                    if picks.contains(k) { Image(systemName: "star.fill").font(.system(size: 6)).foregroundStyle(.yellow).padding(2) }
                }
                .offset(x: CGFloat(k % cols) * (cw + 4), y: CGFloat(k / cols) * (ch + 4))
            }
        }.frame(width: s.width, height: s.height, alignment: .topLeading)
    }

    public var body: some View {
        AtomStage(hint: "Move over the sheet; the lens trails the hand a few frames") {
            GeometryReader { g in
                let s = g.size
                // the lens trails the pointer on a snap spring, one spring per axis
                PhFollow(target: Double(point.x), preset: .snap) { lx in
                    PhFollow(target: Double(point.y), preset: .snap) { ly in
                        let c = CGPoint(x: lx, y: ly)
                        let frame = min(cols * rows - 1, Int(max(0, c.y) / s.height * CGFloat(rows)) * cols + Int(max(0, c.x) / s.width * CGFloat(cols)))
                        ZStack {
                            sheet(s)
                            ZStack {
                                Color(white: 0.1)
                                // the sheet itself, scaled 3.4 times about the lens centre
                                sheet(s).scaleEffect(3.4, anchor: UnitPoint(x: c.x / s.width, y: c.y / s.height))
                            }
                            .mask(phCircle(c, 46, s))
                            .overlay(Circle().stroke(.white, lineWidth: 2).frame(width: 92, height: 92).position(c))
                            .overlay(SwapText("Frame \(frame + 1)").font(.caption2.weight(.semibold)).foregroundStyle(.white).position(x: c.x, y: c.y + 58))
                            .scaleEffect(active ? 1 : 0.4, anchor: UnitPoint(x: c.x / s.width, y: c.y / s.height)).opacity(active ? 1 : 0)
                            .motion(.snap, value: active)
                        }
                    }
                }
                .frame(width: s.width, height: s.height)
                .contentShape(Rectangle())
                .onContinuousHover { phase in
                    switch phase {
                    case .active(let p): point = p; active = true
                    case .ended: active = false
                    }
                }
                .gesture(DragGesture(minimumDistance: 0)
                    // on touch the lens sits above the finger so it is never hidden by it
                    .onChanged { v in point = CGPoint(x: v.location.x, y: v.location.y - 56); active = true }
                    .onEnded { _ in active = false })
                .accessibilityLabel("Contact sheet, 24 frames").accessibilityHint("Move the pointer to magnify")
            }
            .frame(height: 210)
        }
    }
}
