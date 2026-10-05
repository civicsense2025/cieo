import SwiftUI
import Cieo

public struct ThemeToggleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "themetoggle", category: "Admin kit", name: "Theme toggle",
        summary: "One button, and the glyph shows the destination, as in Gesso: the sun’s circle and the moon’s crescent are the same 48 path points interpolated, while the eight rays shrink into the body and fade. At the same moment a local preview card cross-fades every colour between its light and dark palettes. Like Gesso, the choice is stored as a pin only while it disagrees with the system, and the status line swaps to say which.")

    @Environment(\.colorScheme) private var system
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pinned: ColorScheme?
    public init() {}

    private var dark: Bool { (pinned ?? system) == .dark }

    public var body: some View {
        AtomStage(hint: "The glyph shows where you are going") {
            VStack(spacing: 14) {
                Button(action: toggle) { Glyph(moon: !dark).frame(width: 24, height: 24).frame(width: 40, height: 40).background(Circle().fill(.quaternary)) }
                    .buttonStyle(.plain).accessibilityLabel(dark ? "Switch to light theme" : "Switch to dark theme")
                VStack(alignment: .leading, spacing: 6) {
                    Text("Preview").font(.footnote.weight(.semibold)); Text("A card that follows the choice.").font(.caption).opacity(0.7)
                    Capsule().fill(Color.accentColor).frame(width: 60, height: 8)
                }
                .foregroundStyle(dark ? Color(white: 0.95) : Color(white: 0.1)).padding(14).frame(width: 220, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 12).fill(dark ? Color(white: 0.12) : Color(white: 0.97))).overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(.quaternary))
                SwapText(pinned == nil ? "Following the system theme" : "Pinned to \(pinned == .dark ? "dark" : "light")").font(.caption).foregroundStyle(.secondary).frame(height: 16)
            }.animation(reduce ? nil : .motion(.base), value: dark)
        }
    }

    private func toggle() {
        let next: ColorScheme = dark ? .light : .dark
        withMotion(.base, reduceMotion: reduce) { pinned = next == system ? nil : next }
    }
}

/// A sun that becomes a moon: the body grows a bite while the rays shrink into it and fade.
private struct Glyph: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let moon: Bool
    var body: some View {
        let p: CGFloat = moon ? 1 : 0
        ZStack {
            Circle().frame(width: 12 + 4 * p, height: 12 + 4 * p)
                .mask(Rectangle().overlay(Circle().frame(width: 12 * p, height: 12 * p).offset(x: 6 * p, y: -5 * p).blendMode(.destinationOut)).compositingGroup())
                .rotationEffect(.degrees(-20 * Double(p)))
            ForEach(0..<8, id: \.self) { i in
                Capsule().frame(width: 2, height: 4 * (1 - p) + 0.01).offset(y: -(10 - 5 * p)).rotationEffect(.degrees(Double(i) * 45)).opacity(1 - Double(p))
            }
        }
        .animation(reduce ? nil : .motion(.base), value: moon).accessibilityHidden(true)
    }
}
