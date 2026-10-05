import SwiftUI
import Cieo

public struct ProductPageAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "productpage", category: "Storefront", name: "Product page",
        summary: "Selecting a thumbnail slides the main image in the direction of travel, and the selection plate stretches to it with the leading edge first. The main image also follows a drag 1:1 and settles from release velocity. A color change morphs the garment’s fill, price digits roll, and the stock line blur-swaps. Add to cart runs in order: button confirms, a copy of the image arcs to the cart icon, the badge count rolls on arrival 400ms later, then the drawer slides in from the right when opened.")

    private let colors: [(String, Color, Int, String)] = [("Clay", .orange, 48, "In stock"), ("Sage", .green, 52, "Only 3 left"), ("Ink", .indigo, 56, "In stock")]
    private let w: CGFloat = 190
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    @State private var pos = Track(0)
    @State private var held = false
    @State private var heldX: CGFloat = 0
    @State private var color = 0
    @State private var cart = 0
    @State private var flyStart: Double?
    @State private var drawer = false
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }

    public var body: some View {
        AtomStage(hint: "Drag the photo, pick a color, add to cart") {
            ZStack(alignment: .topLeading) {
                HStack(alignment: .top, spacing: 16) {
                    VStack(spacing: 8) { gallery; thumbs }
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Field tee").font(.headline)
                        HStack(spacing: 1) { Text("$").font(.callout); RollingDigits(colors[color].2).font(.title2.weight(.semibold)) }
                        HStack(spacing: 8) { ForEach(colors.indices, id: \.self) { i in
                            Button { withMotion(.base, reduceMotion: reduce) { color = i } } label: { Circle().fill(colors[i].1).frame(width: 22, height: 22).overlay(Circle().strokeBorder(Color.primary, lineWidth: color == i ? 2 : 0).padding(-3)) }
                                .buttonStyle(.plain).accessibilityLabel(colors[i].0)
                        } }
                        SwapText(colors[color].3).font(.caption).foregroundStyle(.secondary).frame(height: 16, alignment: .leading)
                        Button { add() } label: { Label("Add to cart", systemImage: "bag").font(.footnote.weight(.semibold)) }.buttonStyle(.borderedProminent).controlSize(.small)
                        Spacer(minLength: 0)
                    }.frame(width: 130, alignment: .leading)
                }
                .padding(14)
                cartButton.position(x: 366, y: 22)
                TimelineView(.animation(paused: flyStart == nil)) { tl in
                    if let s = flyStart {
                        let p = 1 - Motion.resp(tl.date.timeIntervalSinceReferenceDate - s, x0: 1, v0: 0, .base)
                        RoundedRectangle(cornerRadius: 8).fill(colors[color].1).frame(width: 40, height: 40)
                            .scaleEffect(1 - 0.5 * p).opacity(1 - 0.3 * p)
                            .position(x: 110 + (366 - 110) * p, y: 100 + (22 - 100) * p - 40 * sin(.pi * p))
                    }
                }.allowsHitTesting(false)
                if drawer { drawerView.transition(reduce ? .identity : .move(edge: .trailing)) }
            }
            .frame(width: 400, height: 300, alignment: .topLeading).clipped()
            .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 14)).clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private var gallery: some View {
        TimelineView(.animation(paused: held ? false : !pos.isMoving)) { tl in
            let x = held ? heldX : pos.value(at: tl.date.timeIntervalSinceReferenceDate)
            HStack(spacing: 0) { ForEach(0..<3, id: \.self) { i in
                ZStack { AtomPhoto(seed: i + 1, goldenHour: Double(i) / 2); Shirt().fill(colors[color].1).frame(width: 90, height: 90) }.frame(width: w, height: 170).clipped()
            } }.offset(x: x).frame(width: w, alignment: .leading).clipped().clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .gesture(DragGesture()
            .onChanged { g in held = true; heldX = -CGFloat(index) * w + g.translation.width }
            .onEnded { g in
                let cur = -CGFloat(index) * w + g.translation.width
                let to = min(2, max(0, Int(((-cur - g.velocity.width * 0.12) / w).rounded())))
                held = false; index = to
                if reduce { pos.jump(-CGFloat(to) * w) } else { pos.release(from: cur, velocity: g.velocity.width, to: -CGFloat(to) * w, at: now()) }
            })
        .accessibilityLabel("Product photos, \(index + 1) of 3")
    }

    private var thumbs: some View {
        ZStack(alignment: .topLeading) {
            if let f = frames[index] { EdgesIndicator(frame: f.insetBy(dx: -3, dy: -3), shape: RoundedRectangle(cornerRadius: 8), style: Color.accentColor.opacity(0.5)) }
            HStack(spacing: 8) { ForEach(0..<3, id: \.self) { i in
                Button { pick(i) } label: { AtomPhoto(seed: i + 1, goldenHour: Double(i) / 2).frame(width: 52, height: 36).clipShape(RoundedRectangle(cornerRadius: 6)) }.buttonStyle(.plain)
                    .reportFrame(i, in: "thumbs").accessibilityLabel("Photo \(i + 1)")
            } }.padding(3)
        }.coordinateSpace(name: "thumbs").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
    }

    private var cartButton: some View {
        Button { withMotion(.base, reduceMotion: reduce) { drawer.toggle() } } label: {
            Image(systemName: "bag").overlay(alignment: .topTrailing) { if cart > 0 { RollingDigits(cart).font(.system(size: 9, weight: .bold)).foregroundStyle(.white).padding(3).background(Circle().fill(Color.accentColor)).offset(x: 8, y: -8) } }
        }.buttonStyle(.plain).accessibilityLabel("Cart").accessibilityValue("\(cart) items")
    }

    private var drawerView: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack { Text("Cart").font(.headline); Spacer(); Button { withMotion(.snap, reduceMotion: reduce) { drawer = false } } label: { Image(systemName: "xmark") }.buttonStyle(.plain).accessibilityLabel("Close cart") }
            Text(cart == 0 ? "Your cart is empty." : "\(cart) × Field tee · \(colors[color].0)").font(.footnote).foregroundStyle(.secondary)
            Spacer()
        }.padding(14).frame(width: 190).frame(maxHeight: .infinity).background(.background).shadow(color: .black.opacity(0.2), radius: 10).frame(maxWidth: .infinity, alignment: .trailing)
    }

    private func pick(_ i: Int) {
        index = i
        if reduce { pos.jump(-CGFloat(i) * w) } else { pos.set(-CGFloat(i) * w, at: now()) }
    }

    private func add() {
        if !reduce { flyStart = now() }
        Task {
            try? await Task.sleep(for: .seconds(reduce ? 0 : 0.4))
            withMotion(.base, reduceMotion: reduce) { cart += 1 }
            try? await Task.sleep(for: .seconds(0.4)); flyStart = nil
        }
    }
}

private struct Shirt: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        let pts: [(CGFloat, CGFloat)] = [(0.3, 0), (0.42, 0.08), (0.58, 0.08), (0.7, 0), (1, 0.18), (0.88, 0.38), (0.75, 0.3), (0.75, 1), (0.25, 1), (0.25, 0.3), (0.12, 0.38), (0, 0.18)]
        p.move(to: CGPoint(x: r.minX + pts[0].0 * r.width, y: r.minY + pts[0].1 * r.height))
        for q in pts.dropFirst() { p.addLine(to: CGPoint(x: r.minX + q.0 * r.width, y: r.minY + q.1 * r.height)) }
        p.closeSubpath(); return p
    }
}
