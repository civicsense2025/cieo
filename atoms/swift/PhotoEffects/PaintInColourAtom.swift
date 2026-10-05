import SwiftUI
import MotionKit

public struct PaintInColourAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-paint", category: "Photo effects", name: "Paint in colour",
        summary: "A soft brush paints the colour photo through a black-and-white print. Every cell of the mask stores when it was painted, so the heal is a pure function of time: it holds for 1.4 s, then the colour drains back over 2.6 s, and painting again resets the hold. Reveal all opens from the centre outward. Use when: a story or campaign hero invites people to explore, or to show what a restoration or colourisation changed.")
    @State private var painted: [Int: Date] = [:]           // cell -> when it was painted (or will be)
    @State private var live = Date()
    public init() {}
    private let cols = 36, rows = 24

    /// Colour amount for a cell is a pure function of its age: holds 1.4 s, then drains over 2.6 s.
    private func amount(_ since: Date, _ now: Date) -> Double {
        let age = now.timeIntervalSince(since)
        return age < 0 ? 0 : (age < 1.4 ? 1 : 1 - phSmooth((age - 1.4) / 2.6))
    }

    public var body: some View {
        AtomStage(hint: "Paint over the print; the colour drains back on its own") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    TimelineView(.animation(paused: painted.isEmpty)) { ctx in
                        ZStack {
                            phPhoto(2, g.size).grayscale(1).contrast(1.1)
                            phPhoto(2, g.size).mask(
                                Canvas { c, size in
                                    let cw = size.width / CGFloat(cols), ch = size.height / CGFloat(rows)
                                    for (k, d) in painted {
                                        let a = amount(d, ctx.date)
                                        if a > 0.01 { c.fill(Path(ellipseIn: CGRect(x: CGFloat(k % cols) * cw - cw, y: CGFloat(k / cols) * ch - ch, width: cw * 3, height: ch * 3)), with: .color(.white.opacity(a * 0.5))) }
                                    }
                                }.frame(width: g.size.width, height: g.size.height))
                        }
                        .onChange(of: ctx.date) { _, now in
                            if painted.values.allSatisfy({ now.timeIntervalSince($0) > 4.2 }) { painted = [:] }
                        }
                    }
                    .contentShape(Rectangle())
                    .gesture(DragGesture(minimumDistance: 0).onChanged { v in
                        let k = Int(phClamp(Double(v.location.x / g.size.width)) * Double(cols - 1)) + Int(phClamp(Double(v.location.y / g.size.height)) * Double(rows - 1)) * cols
                        painted[k] = Date()           // painting again resets the hold
                    })
                    .accessibilityLabel("Print").accessibilityHint("Drag to paint colour")
                }
                .frame(height: 170).clipShape(RoundedRectangle(cornerRadius: 12))
                Button("Reveal all") {
                    // opens from the centre outward
                    let now = Date()
                    for k in 0..<(cols * rows) {
                        let dx = Double(k % cols) - Double(cols) / 2, dy = Double(k / cols) - Double(rows) / 2
                        painted[k] = now.addingTimeInterval(sqrt(dx * dx + dy * dy) * 0.04)
                    }
                }.buttonStyle(.bordered).controlSize(.small)
            }
        }
    }
}
