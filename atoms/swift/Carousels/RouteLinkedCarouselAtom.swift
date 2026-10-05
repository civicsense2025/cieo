import SwiftUI
import MotionKit

public struct RouteLinkedCarouselAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "txc-route", category: "Carousels", name: "Route-linked carousel",
        summary: "The carousel position is the hiker’s place on the trail: the marker, the inked part of the route, the clock and the mile counter are all computed from the same scroll value, and each stop’s photo is lit for its hour, warming from midday to golden hour. Dragging the marker along the map scrubs the carousel, and arrow keys step stop to stop on either one. Inspired by Strava route replays and Apple Maps guides; changed: the map is a second handle on one rail, not a separate view. Use when slides happen in a place or in sequence and showing where you are matters, such as itineraries, tours or timelines.")
    @State private var stop = 0
    public init() {}
    private let hours = ["9:00", "11:30", "14:00", "17:30"]

    private var route: Path {
        Path { p in
            p.move(to: CGPoint(x: 0.04, y: 0.7))
            p.addCurve(to: CGPoint(x: 0.4, y: 0.35), control1: CGPoint(x: 0.16, y: 0.3), control2: CGPoint(x: 0.28, y: 0.7))
            p.addCurve(to: CGPoint(x: 0.96, y: 0.4), control1: CGPoint(x: 0.55, y: 0.05), control2: CGPoint(x: 0.8, y: 0.8))
        }
    }

    public var body: some View {
        AtomStage(hint: "One scroll value drives the photo, marker, ink and clock") {
            VStack(spacing: 10) {
                PhPager(count: hours.count, itemFraction: 0.8, index: $stop) { pos, size, item in
                    let g = phClamp(pos / Double(hours.count - 1))
                    ZStack {
                        ForEach(hours.indices, id: \.self) { i in
                            // each stop's photo is lit for its hour, warming toward golden hour
                            phPhoto(0, CGSize(width: item - 8, height: size.height), golden: Double(i) / 3)
                                .clipShape(RoundedRectangle(cornerRadius: 10)).offset(x: CGFloat(Double(i) - pos) * item)
                        }
                    }
                    .frame(width: size.width, height: size.height)
                    .overlay(alignment: .topLeading) {
                        Text("\(String(format: "%.1f", g * 6.4)) mi").font(.caption.monospacedDigit()).padding(6)
                            .background(.regularMaterial, in: Capsule()).padding(6)
                    }
                }
                .frame(height: 130)
                GeometryReader { g in
                    let sz = g.size
                    let t = Double(stop) / Double(hours.count - 1)
                    let r = route.applying(CGAffineTransform(scaleX: sz.width, y: sz.height))
                    ZStack {
                        r.stroke(.quaternary, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        r.trimmedPath(from: 0, to: t).stroke(Color.accentColor, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                        Circle().fill(Color.accentColor).frame(width: 14, height: 14)
                            .position(r.trimmedPath(from: 0, to: max(0.001, t)).currentPoint ?? .zero)
                        ForEach(hours.indices, id: \.self) { i in
                            let pt = r.trimmedPath(from: 0, to: max(0.001, Double(i) / 3)).currentPoint ?? .zero
                            Button { stop = i } label: { Text(hours[i]).font(.caption2).padding(4).background(.background, in: Capsule()) }
                                .buttonStyle(.plain).position(x: pt.x, y: pt.y - 16)
                        }
                    }
                    .motion(.soft, value: stop)
                }
                .frame(height: 80)
            }
        }
    }
}
