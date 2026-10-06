import SwiftUI
import Cieo

public struct DropAPinAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pindrop", category: "Maps", name: "Drop a pin",
        summary: "The pin falls from above onto the spot and lands on a critically damped spring, so it settles without a bounce. Its shadow sharpens as it lands and a single ring fades out from the point.")

    private struct Drop: Identifiable { let id = UUID(); let at: CGPoint }
    @State private var drops: [Drop] = []
    @State private var showRing = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap the map to drop a pin") {
            VStack(spacing: 6) {
            ZStack {
                Rectangle().fill(.quaternary.opacity(0.4))
                Canvas { ctx, size in
                    for x in stride(from: 0, through: size.width, by: 40) { ctx.stroke(Path { $0.move(to: CGPoint(x: x, y: 0)); $0.addLine(to: CGPoint(x: x, y: size.height)) }, with: .color(.secondary.opacity(0.15))) }
                    for y in stride(from: 0, through: size.height, by: 40) { ctx.stroke(Path { $0.move(to: CGPoint(x: 0, y: y)); $0.addLine(to: CGPoint(x: size.width, y: y)) }, with: .color(.secondary.opacity(0.15))) }
                }.accessibilityHidden(true)
                ForEach(drops) { d in PinView(showRing: showRing).position(d.at).motionTransition(.presence) }
            }
            .frame(width: 380, height: 240).clipShape(RoundedRectangle(cornerRadius: 14)).contentShape(Rectangle())
            .onTapGesture(coordinateSpace: .local) { p in
                withMotion(.base, reduceMotion: reduce) { drops.append(Drop(at: p)) }
                if drops.count > 6 {
                    withMotion(.snap, reduceMotion: reduce) { _ = drops.removeFirst() }
                }
            }
            .accessibilityLabel("Map").accessibilityHint("Tap to drop a pin")
            HStack { Text("Ring on drop").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Ring on drop", isOn: $showRing).labelsHidden().controlSize(.mini) }
            .frame(width: 380)
            }
        }
    }
}

private struct PinView: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let showRing: Bool
    @State private var landed = false
    @State private var ring = false
    var body: some View {
        ZStack {
            Circle().strokeBorder(.primary, lineWidth: 2).frame(width: 48, height: 48)
                .scaleEffect(ring ? 1 : 0.01).opacity(ring ? 0 : (landed ? 0.7 : 0))
            Ellipse().fill(.black.opacity(0.35)).frame(width: 14, height: 6)
                .scaleEffect(landed ? 1 : 0.4).opacity(landed ? 0.9 : 0)
            Pin().fill(.primary).frame(width: 26, height: 34).offset(y: (landed ? 0 : -40) - 17)
        }
        .onAppear {
            withMotion(.base, reduceMotion: reduce) { landed = true }
            if !reduce && showRing { withAnimation(.motion(.soft).delay(0.15)) { ring = true } }
        }
        .accessibilityHidden(true)
    }
}

private struct Pin: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.addEllipse(in: CGRect(x: r.minX + 2, y: r.minY + 2, width: r.width - 4, height: r.width - 4))
        p.move(to: CGPoint(x: r.midX, y: r.maxY)); p.addLine(to: CGPoint(x: r.minX + 4, y: r.midY)); p.addLine(to: CGPoint(x: r.maxX - 4, y: r.midY)); p.closeSubpath()
        return p
    }
}
