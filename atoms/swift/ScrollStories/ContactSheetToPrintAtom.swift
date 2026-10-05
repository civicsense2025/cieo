import SwiftUI
import Cieo

public struct ContactSheetToPrintAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txs-contactsheet", category: "Scroll stories", name: "Contact sheet to print",
        summary: "Use when a case study or portfolio piece should show the edit, not just the result. Three acts on one pinned sheet: a loupe travels the contact sheet frame by frame in reading order and settles on the keeper (0–32%); a grease-pencil box draws around it (32–46%); then the sheet pushes in around that frame and fades while the frame itself grows into the full-bleed print, so the print visibly comes from its cell (46–92%), and the caption arrives last. All of it is scrubbed by scroll. Reduced motion cuts between the three states.")
    public init() {}
    private let cols = 5, rows = 3, keeper = 8

    public var body: some View {
        PhScrollStory(hint: "Scroll: loupe, grease-pencil box, then the print", length: 4, height: 250) { p, s in
            let cw = (s.width - 24 - 4 * 4) / 5, ch = (s.height - 24 - 2 * 4) / 3
            let cell = { (k: Int) -> CGRect in CGRect(x: 12 + CGFloat(k % cols) * (cw + 4), y: 12 + CGFloat(k / cols) * (ch + 4), width: cw, height: ch) }
            let a1 = phRange(p, 0, 0.32), a2 = phRange(p, 0.32, 0.46), a3 = phSmooth(phRange(p, 0.46, 0.92))
            // act 1: the loupe visits frames in reading order and settles on the keeper
            let pos = a1 * Double(keeper), i = Int(pos), f = CGFloat(pos - Double(i))
            let from = cell(i), to = cell(min(keeper, i + 1))
            let lens = CGPoint(x: from.midX + (to.midX - from.midX) * f, y: from.midY + (to.midY - from.midY) * f)
            let k = cell(keeper)
            ZStack {
                Color(white: 0.1)
                // act 3: the sheet pushes in around the keeper and fades
                ZStack {
                    ForEach(0..<(cols * rows), id: \.self) { n in phPhoto(n, cell(n).size).clipShape(RoundedRectangle(cornerRadius: 3)).offset(x: cell(n).minX - s.width / 2 + cell(n).width / 2, y: cell(n).minY - s.height / 2 + cell(n).height / 2) }
                    Circle().stroke(.white, lineWidth: 2).frame(width: 44, height: 44).position(lens).opacity(1 - a3)
                    // act 2: a grease-pencil box draws around it
                    RoundedRectangle(cornerRadius: 2).trim(from: 0, to: a2).stroke(Color.red, lineWidth: 2)
                        .frame(width: k.width + 6, height: k.height + 6).position(x: k.midX, y: k.midY)
                }
                .frame(width: s.width, height: s.height)
                .scaleEffect(1 + 4 * a3, anchor: UnitPoint(x: k.midX / s.width, y: k.midY / s.height)).opacity(1 - a3)
                // the print grows out of its own cell into full bleed
                phPhoto(keeper, CGSize(width: k.width + (s.width - k.width) * a3, height: k.height + (s.height - k.height) * a3))
                    .clipShape(RoundedRectangle(cornerRadius: 3 + 8 * a3))
                    .position(x: k.midX + (s.width / 2 - k.midX) * a3, y: k.midY + (s.height / 2 - k.midY) * a3)
                    .opacity(a3 > 0 ? 1 : 0)
                Text("Frame 9, the keeper").font(.caption.weight(.semibold)).foregroundStyle(.white).shadow(radius: 3)
                    .opacity(phRange(p, 0.92, 1)).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomLeading).padding(14)
            }
        }
    }
}
