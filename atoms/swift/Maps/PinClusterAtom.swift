import SwiftUI
import MotionKit

public struct PinClusterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "cluster", category: "Maps", name: "Pin cluster",
        summary: "Opening the cluster sends each pin out from its center to its own place, 30ms apart, while the count fades. Clicking the map gathers them back in reverse order.")

    private let places: [CGPoint] = [(0.18, 0.3), (0.32, 0.62), (0.44, 0.22), (0.62, 0.7), (0.74, 0.34), (0.86, 0.58)].map { CGPoint(x: $0.0, y: $0.1) }
    private let center = CGPoint(x: 0.5, y: 0.48)
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open the cluster, tap the map to close") {
            GeometryReader { g in
                ZStack {
                    Rectangle().fill(.quaternary.opacity(0.4)).contentShape(Rectangle()).onTapGesture { if open { set(false) } }
                    ForEach(places.indices, id: \.self) { i in
                        let d = Double(open ? i : places.count - 1 - i) * 0.03, p = open ? places[i] : center
                        Circle().fill(Color.accentColor).overlay(Circle().strokeBorder(.background, lineWidth: 2)).frame(width: 14, height: 14)
                            .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
                            .position(x: p.x * g.size.width, y: p.y * g.size.height)
                            .opacity(open ? 1 : 0)
                            .animation(reduce ? nil : .motion(.base).delay(d), value: open)
                            .accessibilityHidden(!open).accessibilityLabel("Pin \(i + 1)")
                    }
                    Button { set(true) } label: {
                        Text("\(places.count)").font(.footnote.weight(.bold)).foregroundStyle(.background)
                            .frame(width: 34, height: 34).background(Circle().fill(Color.accentColor))
                    }
                    .buttonStyle(.plain).accessibilityLabel("\(places.count) places, open cluster")
                    .position(x: center.x * g.size.width, y: center.y * g.size.height)
                    .scaleEffect(open ? 0.7 : 1).opacity(open ? 0 : 1).allowsHitTesting(!open)
                    .animation(reduce ? nil : open ? .motion(.snap) : .motion(.base).delay(0.25), value: open)
                }
            }
            .frame(width: 380, height: 220).clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }

    private func set(_ v: Bool) { open = v }
}
