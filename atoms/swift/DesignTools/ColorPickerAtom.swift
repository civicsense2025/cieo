import SwiftUI
import Cieo

public struct ColorPickerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "colorpicker", category: "Design tools", name: "Color picker",
        summary: "Both handles follow the pointer exactly while dragging. Picking a preset springs both handles to that color, so you can see where it lives in the space. Tapping the value copies it: the value swaps for a check and Copied pill, then relaxes back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let presets: [(hex: String, h: Double, s: Double, v: Double)] = [("#595D17", 62, 0.75, 0.37), ("#B0342F", 3, 0.81, 0.69), ("#B45309", 28, 0.94, 0.71), ("#2F5DB0", 217, 0.73, 0.69), ("#10141A", 215, 0.38, 0.10)]
    @State private var hue = Track(72, preset: .base)
    @State private var sat = Track(0.75, preset: .base)
    @State private var val = Track(0.37, preset: .base)
    @State private var copied = false
    @State private var format = 0
    public init() {}

    private func hex(_ h: Double, _ s: Double, _ v: Double) -> String {
        func f(_ n: Double) -> Int {
            let k = (n + h / 60).truncatingRemainder(dividingBy: 6)
            return Int(((v - v * s * max(0, min(k, 4 - k, 1))) * 255).rounded())
        }
        return String(format: "#%02X%02X%02X", f(5), f(3), f(1))
    }

    private func rgb(_ h: Double, _ s: Double, _ v: Double) -> String {
        let c = hex(h, s, v)
        let r = Int(c.dropFirst(1).prefix(2), radix: 16) ?? 0
        let g = Int(c.dropFirst(3).prefix(2), radix: 16) ?? 0
        let b = Int(c.dropFirst(5).prefix(2), radix: 16) ?? 0
        return "rgb(\(r), \(g), \(b))"
    }

    private func copy(_ value: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = value
        #endif
        withMotion(.base, reduceMotion: reduce) { copied = true }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_600_000_000)
            withMotion(.base, reduceMotion: reduce) { copied = false }
        }
    }

    public var body: some View {
        AtomStage(hint: "Drag either handle, or pick a preset. Tap the value to copy.") {
            VStack(spacing: 10) {
                TimelineView(.motion(hue, sat, val)) { ctx in
                    let t = ctx.date.timeIntervalSinceReferenceDate
                    let h = ((hue.value(at: t).truncatingRemainder(dividingBy: 360)) + 360).truncatingRemainder(dividingBy: 360)
                    let s = max(0, min(1, sat.value(at: t)))
                    let v = max(0, min(1, val.value(at: t)))
                    let color = Color(hue: h / 360, saturation: s, brightness: v)
                    let value = format == 0 ? hex(h, s, v) : rgb(h, s, v)
                    VStack(spacing: 10) {
                        svField(h: h, s: s, v: v, color: color)
                        hueField(h: h)
                        copyButton(color: color, value: value)
                    }
                }
                presetRow
                formatRow
            }
            .padding(12).frame(width: 240).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func svField(h: Double, s: Double, v: Double, color: Color) -> some View {
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
    }

    private func hueField(h: Double) -> some View {
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
    }

    private func copyButton(color: Color, value: String) -> some View {
        Button { copy(value) } label: {
            HStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 7).fill(color).background(RoundedRectangle(cornerRadius: 7).fill(Color.primary.opacity(0.05))).frame(width: 28, height: 28)
                HStack(spacing: 4) {
                    if copied { Image(systemName: "checkmark").imageScale(.small).accessibilityHidden(true) }
                    SwapText(copied ? "Copied" : value)
                }
                .font(.caption.monospaced()).frame(maxWidth: .infinity, alignment: .leading)
                .foregroundStyle(copied ? Color.green : Color.primary)
            }
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(copied ? Color.green.opacity(0.14) : Color.clear, in: RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).fill(copied ? Color.green.opacity(0.5) : Color.gray.opacity(0.25)).opacity(0.10).allowsHitTesting(false))
        }
        .buttonStyle(.plain).accessibilityLabel("Copy color value \(value)")
    }

    private var presetRow: some View {
        HStack(spacing: 6) {
            ForEach(presets, id: \.hex) { p in
                Button {
                    DataMotion.retarget(&hue, to: p.h, reduce: reduce); DataMotion.retarget(&sat, to: p.s, reduce: reduce); DataMotion.retarget(&val, to: p.v, reduce: reduce)
                } label: { RoundedRectangle(cornerRadius: 6).fill(Color(hue: p.h / 360, saturation: p.s, brightness: p.v)).frame(width: 24, height: 24).background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.05))) }
                .buttonStyle(.plain).accessibilityLabel("Preset \(p.hex)")
            }
            Spacer()
        }
    }

    private var formatRow: some View {
        HStack(spacing: 6) {
            Text("Format").font(.caption).foregroundStyle(.secondary)
            Picker("Format", selection: $format) { Text("Hex").tag(0); Text("RGB").tag(1) }.pickerStyle(.segmented).frame(width: 140)
        }
    }

    private func knob(_ fill: Color, _ size: Double) -> some View {
        Circle().fill(fill).overlay(Circle().stroke(.white, lineWidth: 2)).overlay(Circle().stroke(.black.opacity(0.3), lineWidth: 1).padding(-1))
            .frame(width: size, height: size).allowsHitTesting(false)
    }
}
