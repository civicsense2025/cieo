import SwiftUI
import MotionKit

public struct HoverRackFocusAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-rack", category: "Photo effects", name: "Hover rack focus",
        summary: "Depth comes from the photo itself: each tree row is a flat tone and farther rows are hazier, so luminance sorts into planes. Point anywhere and focus pulls to that plane on a slow critically damped spring while the reticle tightens; blur everywhere else scales with distance from the focal plane and the aperture. Use when: a hero or product shot should guide the eye to what the pointer or the copy is talking about.")
    @State private var focal = 0.8
    @State private var aperture = 1.0
    public init() {}
    private let bands: [Double] = [0.15, 0.4, 0.62, 0.85]

    public var body: some View {
        AtomStage(hint: "Point at a plane: focus pulls there, the rest softens") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    // focus pulls to the plane on a slow critically damped spring
                    PhFollow(target: focal, preset: .soft) { f in
                        ZStack {
                            ForEach(bands.indices, id: \.self) { i in
                                // farther rows are hazier, so luminance sorts into planes; blur grows with distance from focus
                                phPhoto(0, g.size).blur(radius: 14 * aperture * abs(bands[i] - f)).scaleEffect(1.08)
                                    .mask(alignment: .top) {
                                        LinearGradient(stops: [.init(color: i == 0 ? .white : .clear, location: phClamp(bands[i] - 0.2)), .init(color: .white, location: bands[i]), .init(color: i == bands.count - 1 ? .white : .clear, location: phClamp(bands[i] + 0.2))],
                                                       startPoint: .top, endPoint: .bottom)
                                    }
                            }
                            Circle().stroke(.white, lineWidth: 1.5).frame(width: 24 + 22 * aperture * 0.5, height: 24 + 22 * aperture * 0.5)
                                .position(x: g.size.width / 2, y: g.size.height * f).shadow(radius: 2)
                        }
                        .frame(width: g.size.width, height: g.size.height).background(Color.black)
                    }
                    .contentShape(Rectangle())
                    .onContinuousHover { if case .active(let p) = $0 { focal = phClamp(Double(p.y / g.size.height)) } }
                    .gesture(DragGesture(minimumDistance: 0).onChanged { focal = phClamp(Double($0.location.y / g.size.height)) })
                }
                .frame(height: 170).clipShape(RoundedRectangle(cornerRadius: 12))
                .accessibilityElement().accessibilityLabel("Focus plane").accessibilityValue("\(Int(focal * 100)) percent down")
                .accessibilityAdjustableAction { d in focal = phClamp(focal + (d == .increment ? 0.2 : -0.2)) }
                HStack { Text("Aperture").font(.caption); Slider(value: $aperture, in: 0.3...2) }
            }
        }
    }
}
