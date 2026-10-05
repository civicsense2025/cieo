import SwiftUI
import Cieo

public struct PhotoStackAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-photo-stack", category: "Galleries", name: "Photo stack that fans out",
        summary: "Seven prints sit in a loose pile, each tilted a few degrees. Hover (or tap) and the top print leaves first, then each one beneath it 35ms later, all swinging out about the base of the pile into an arc. The print under the pointer lifts along its own axis while its neighbours lean away from it, and which print that is comes from the angle to the base, not from what is under the cursor, so a lifting print never flickers. Pick one and it travels to the top of the pile as the rest close from the bottom up. Use when a collection needs a compact, tactile preview that opens in place.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var order = Array(0..<7)          // bottom ... top
    @State private var hot: Int?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover or tap to fan out; pick a print to bring it to the top") {
            GeometryReader { g in
                let base = CGPoint(x: g.size.width / 2, y: g.size.height - 20)
                ZStack {
                    ForEach(Array(order.enumerated()), id: \.element) { pos, id in
                        let n = Double(order.count)
                        let slot = Double(pos) - (n - 1) / 2
                        let rank = order.count - 1 - pos                      // top print leaves first
                        let delay = open ? Motion.stagger(rank, of: order.count, gap: 0.035) : Motion.stagger(pos, of: order.count, gap: 0.035)
                        let lean = hot.map { h -> Double in h == pos ? 0 : (pos < h ? -1 : 1) * 5 / Double(abs(pos - h)) } ?? 0
                        phPhoto(id, CGSize(width: 86, height: 108)).clipShape(RoundedRectangle(cornerRadius: 6))
                            .overlay(RoundedRectangle(cornerRadius: 6).stroke(.white, lineWidth: 3))
                            .shadow(radius: 2)
                            .offset(y: open && hot == pos ? -16 : 0)      // lifts along its own axis
                            .rotationEffect(.degrees(open ? slot * 14 + lean : Double((id * 5) % 9 - 4)), anchor: .bottom)
                            .animation(reduce ? nil : .motion(.base).delay(delay), value: open)
                            .animation(reduce ? nil : .motion(.snap), value: hot)
                            .onTapGesture { tap(pos) }
                            .accessibilityLabel("Print \(id + 1)").accessibilityAddTraits(.isButton)
                    }
                }
                .frame(width: 86, height: 108).position(x: base.x, y: base.y - 54)
                .contentShape(Rectangle())
                .onContinuousHover { phase in
                    switch phase {
                    case .active(let p):
                        open = true
                        // which print is under the pointer comes from the angle to the base, not from hit-testing
                        let a = atan2(Double(p.x - base.x), Double(base.y - p.y)) * 180 / .pi
                        hot = min(order.count - 1, max(0, Int((a / 14 + Double(order.count - 1) / 2).rounded())))
                    case .ended: open = false; hot = nil
                    }
                }
            }
            .frame(height: 220)
        }
    }

    private func tap(_ pos: Int) {
        if !open { open = true; return }
        let id = order[pos]
        withMotion(.base, reduceMotion: reduce) { order.remove(at: pos); order.append(id); open = false; hot = nil }
    }
}
