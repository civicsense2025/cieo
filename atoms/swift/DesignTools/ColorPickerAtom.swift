import SwiftUI
import MotionKit

public struct ColorPickerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "colorpicker", category: "Design tools", name: "Color picker",
        summary: "Both handles follow the pointer exactly while dragging. Picking a preset springs both handles to that color, so you can see where it lives in the space.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let presets: [(hex: String, h: Double, s: Double, v: Double)] = [("#595D17", 62, 0.75, 0.37), ("#B0342F", 3, 0.81, 0.69), ("#B45309", 28, 0.94, 0.71), ("#2F5DB0", 217, 0.73, 0.69), ("#10141A", 215, 0.38, 0.10)]
    @State private var hue = Track(72, preset: .base)
    @State private var sat = Track(0.75, preset: .base)
    @State private var val = Track(0.37, preset: .base)
    public init() {}

    private func hex(_ h: Double, _ s: Double, _ v: Double) -> String {
        func f(_ n: Double) -> Int {
            let k = (n + h / 60).truncatingRemainder(dividingBy: 6)
            return Int(((v - v * s * max(0, min(k, 4 - k, 1))) * 255).rounded())
        }
        return String(format: "#%02X%02X%02X", f(5), f(3), f(1))
    }

    public var body: some View {
        AtomStage(hint: "Drag either handle, or pick a preset") {
            TimelineView(.animation) { ctx in
                let t = ctx.date.timeIntervalSinceReferenceDate
                let h = ((hue.value(at: t).truncatingRemainder(dividingBy: 360)) + 360).truncatingRemainder(dividingBy: 360)
                let s = max(0, min(1, sat.value(at: t))), v = max(0, min(1, val.value(at: t)))
                let color = Color(hue: h / 360, saturation: s, brightness: v)
                VStack(spacing: 10) {
                    GeometryReader { g in
                        ZStack(alignment: .topLeading) {
                            Color(hue: h / 360, saturation: 1, brightness: 1)
                            LinearGradient(colors: [.white, .white.opacity(0)], startPoint: .leading, endPoint: .trailing)
                            LinearGradient(colors: [.black, .black.opacity(0)], startPoint: .bottom, endPoint: .top)
                            knob(color, 14).offset(x: s * g.size.width - 7, y: (1 - v) * g.size.height - 7)
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 8)).contentShape(Rectangle())
                        .gesture(DragGesture(minimumDistance: 0).onChanged { d in
                            sat.jump(max(0, min(1, d.location.x / g.size.width))); val.jump(max(0, min(1, 1 - d.location.y / g.size.height)))
                        })
                        .accessibilityElement().accessibilityLabel("Saturation and brightness")
                        .accessibilityValue("\(Int(s * 100)) percent saturation, \(Int(v * 100)) percent brightness")
                    }
                    .frame(height: 130)
                    GeometryReader { g in
                        ZStack(alignment: .leading) {
                            LinearGradient(colors: [.red, .yellow, .green, .cyan, .blue, .purple, .red], startPoint: .leading, endPoint: .trailing)
                                .clipShape(Capsule()).frame(height: 12)
                            knob(Color(hue: h / 360, saturation: 1, brightness: 1), 16).offset(x: h / 360 * g.size.width - 8)
                        }
                        .frame(maxHeight: .infinity).contentShape(Rectangle())
                        .gesture(DragGesture(minimumDistance: 0).onChanged { d in hue.jump(max(0, min(1, d.location.x / g.size.width)) * 360) })
                        .accessibilityElement().accessibilityLabel("Hue").accessibilityValue("\(Int(h)) degrees")
                        .accessibilityAdjustableAction { dir in hue.jump((h + (dir == .increment ? 10 : -10)).truncatingRemainder(dividingBy: 360)) }
                    }
                    .frame(height: 16)
                    HStack(spacing: 8) {
                        RoundedRectangle(cornerRadius: 7).fill(color).overlay(RoundedRectangle(cornerRadius: 7).stroke(.quaternary)).frame(width: 28, height: 28)
                        Text(hex(h, s, v)).font(.caption.monospaced()).frame(maxWidth: .infinity, alignment: .leading)
                    }
                    HStack(spacing: 6) {
                        ForEach(presets, id: \.hex) { p in
                            Button {
                                DataMotion.retarget(&hue, to: p.h, reduce: reduce); DataMotion.retarget(&sat, to: p.s, reduce: reduce); DataMotion.retarget(&val, to: p.v, reduce: reduce)
                            } label: { RoundedRectangle(cornerRadius: 6).fill(Color(hue: p.h / 360, saturation: p.s, brightness: p.v)).frame(width: 24, height: 24).overlay(RoundedRectangle(cornerRadius: 6).stroke(.quaternary)) }
                            .buttonStyle(.plain).accessibilityLabel("Preset \(p.hex)")
                        }
                        Spacer()
                    }
                }
                .padding(12).frame(width: 240).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    private func knob(_ fill: Color, _ size: Double) -> some View {
        Circle().fill(fill).overlay(Circle().stroke(.white, lineWidth: 2)).overlay(Circle().stroke(.black.opacity(0.3), lineWidth: 1).padding(-1))
            .frame(width: size, height: size).allowsHitTesting(false)
    }
}
