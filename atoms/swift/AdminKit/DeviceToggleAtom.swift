import SwiftUI
import Cieo

public struct DeviceToggleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "devicetoggle", category: "Admin kit", name: "Device toggle",
        summary: "The three icon buttons share one indicator whose edges lag: leading edge first, trailing 60ms later. The preview frame is a single element whose width, corner radius, bezel and chrome height spring together from one device value, so going Desktop to Phone passes through tablet like a real resize. The page inside is container-queried: columns collapse, the nav folds to a menu and cards stack as the width crosses each breakpoint.")

    private let devices = [("Desktop", "desktopcomputer"), ("Tablet", "ipad"), ("Phone", "iphone")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var device = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch devices") {
            VStack(spacing: 12) {
                ZStack(alignment: .topLeading) {
                    if let f = frames[device] { EdgesIndicator(frame: f, shape: RoundedRectangle(cornerRadius: 7), style: Color(.sRGB, white: 0.5, opacity: 0.3)) }
                    HStack(spacing: 0) { ForEach(devices.indices, id: \.self) { i in
                        Button { device = i } label: { Image(systemName: devices[i].1).frame(width: 36, height: 28) }.buttonStyle(.plain).reportFrame(i, in: "dev").accessibilityLabel(devices[i].0)
                            .accessibilityAddTraits(device == i ? .isSelected : [])
                    } }
                }.coordinateSpace(name: "dev").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }.background(RoundedRectangle(cornerRadius: 9).fill(.quaternary.opacity(0.6))).fixedSize()
                Preview(u: Double(device)).frame(height: 200)
            }
            .animation(reduce ? nil : .motion(.base), value: device)
        }
    }
}

/// One frame driven by a single continuous device value `u` (0 desktop, 1 tablet, 2 phone).
private struct Preview: View, Animatable {
    var u: Double
    var animatableData: Double { get { u } set { u = newValue } }
    private func piece(_ v: [CGFloat]) -> CGFloat { u <= 1 ? v[0] + (v[1] - v[0]) * u : v[1] + (v[2] - v[1]) * (u - 1) }

    var body: some View {
        let w = piece([340, 240, 130]), narrow = w < 200, mid = w < 300
        VStack(spacing: 0) {
            HStack(spacing: 6) {
                Text("Harbor").font(.caption.weight(.semibold))
                Spacer()
                if narrow { Image(systemName: "line.3.horizontal").font(.caption) } else { ForEach(["Stories", "About"], id: \.self) { Text($0).font(.caption2).foregroundStyle(.secondary) } }
            }.padding(.horizontal, 10).frame(height: 28)
            Divider()
            Group {
                if narrow { VStack(spacing: 6) { block; block } } else { HStack(spacing: 6) { block; block; if !mid { block } } }
            }.padding(10)
            Spacer(minLength: 0)
        }
        .frame(width: w, height: 190).background(.background).clipShape(RoundedRectangle(cornerRadius: piece([10, 18, 26])))
        .overlay(RoundedRectangle(cornerRadius: piece([10, 18, 26])).fill(Color.secondary.opacity(0.5)).opacity(0.10).allowsHitTesting(false))
        .accessibilityHidden(true)
    }

    private var block: some View { RoundedRectangle(cornerRadius: 6).fill(.quaternary).frame(maxWidth: .infinity, minHeight: 40, maxHeight: 60) }
}
