import SwiftUI
import Cieo

public struct CullDeckAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-cull-deck", category: "Galleries", name: "Cull deck: keep or reject by throwing",
        summary: "The top photo follows the pointer one to one and tilts with how far it has travelled, while the photo beneath it rises and grows by exactly the same amount, so the deck advances as you pull rather than after you let go. Let go and the throw is judged by where it was heading: distance plus a fifth of a second of velocity. A keep carries your speed into a flight that shrinks and re-crops the photo into the next empty slot of the tray. A reject leaves on the other side and fades. Undo returns the last photo along its own path, and the tray slot empties. Keys do the same with no velocity. Use when a shoot has to be sorted quickly and every decision should leave a visible trace.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var top = 0
    @State private var rests: [Int: CGSize] = [:]
    @State private var kept: [Int] = []
    public init() {}
    private let count = 6

    public var body: some View {
        AtomStage(hint: "Throw right to keep, left to reject; Undo returns the last one") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    ZStack { ForEach(0..<count, id: \.self) { card($0, g.size) } }
                        .frame(width: g.size.width, height: g.size.height)
                }.frame(height: 170)
                HStack(spacing: 6) {
                    ForEach(0..<count, id: \.self) { s in
                        ZStack {
                            RoundedRectangle(cornerRadius: 4).fill(.quaternary).opacity(0.10)
                            if s < kept.count { phPhoto(kept[s], CGSize(width: 30, height: 24)).clipShape(RoundedRectangle(cornerRadius: 4)).transition(.opacity) }
                        }.frame(width: 30, height: 24)
                    }
                    Spacer()
                    Button("Undo") { undo() }.disabled(top == 0).buttonStyle(.bordered).controlSize(.small)
                }
                .motion(.base, value: kept)
            }
        }
    }

    private func undo() {
        guard top > 0 else { return }
        kept.removeAll { $0 == top - 1 }
        withMotion(.base, reduceMotion: reduce) { top -= 1 }
        rests[top] = .zero            // back along its own path; the tray slot empties
    }

    @ViewBuilder private func card(_ i: Int, _ size: CGSize) -> some View {
        let w = size.width * 0.62, h = size.height * 0.92
        let slot = CGSize(width: -size.width * 0.35, height: size.height * 0.62)
        PhDrag(preset: .base, enabled: i == top, rest: rests[i] ?? .zero,
               decide: { o, extra in
                   // judged by where it was heading: distance plus a fifth of a second of velocity
                   let reach = o.width + extra.width * 0.2
                   if reach > w * 0.45 { return CGSize(width: slot.width + CGFloat(kept.count) * 36, height: slot.height) }
                   if reach < -w * 0.45 { return CGSize(width: -size.width * 1.3, height: 0) }
                   return .zero
               },
               onRelease: { to in
                   guard to != .zero else { return }
                   rests[i] = to
                   if to.height > 0 { kept.append(i) }
                   withMotion(.base, reduceMotion: reduce) { top = i + 1 }
               },
               content: { o, _ in
            let fly = phClamp(Double(o.height) / Double(slot.height))               // keep flights shrink and re-crop
            let pull = phClamp(Double(abs(o.width)) / Double(w * 0.6))               // the card beneath rises by the same amount
            ZStack {
                // the top card draws the two beneath it, so they can rise by exactly what it has travelled
                if i == top {
                    ForEach(1...2, id: \.self) { d in
                        if i + d < count {
                            let k = Double(d) - (d == 1 ? pull : 0)
                            phPhoto(i + d, CGSize(width: w, height: h)).clipShape(RoundedRectangle(cornerRadius: 12))
                                .scaleEffect(1 - 0.06 * k).offset(y: CGFloat(k) * 8)
                        }
                    }
                }
                if i <= top {
                    phPhoto(i, CGSize(width: w * (1 - 0.7 * fly), height: h * (1 - 0.7 * fly)))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .rotationEffect(.degrees(Double(o.width) / Double(w) * 12))
                        .offset(o).opacity(o.width < -size.width * 0.6 ? 0 : 1)
                }
            }
        })
        .zIndex(Double(count - i))
        .accessibilityHidden(i != top)
        .accessibilityLabel("Photo \(i + 1)")
        .accessibilityAction(named: "Keep") { rests[i] = CGSize(width: slot.width + CGFloat(kept.count) * 36, height: slot.height); kept.append(i); withMotion(.base, reduceMotion: reduce) { top = i + 1 } }
        .accessibilityAction(named: "Reject") { rests[i] = CGSize(width: -size.width * 1.3, height: 0); withMotion(.base, reduceMotion: reduce) { top = i + 1 } }
    }
}
