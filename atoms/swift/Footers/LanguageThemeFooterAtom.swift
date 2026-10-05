import SwiftUI
import MotionKit

public struct LanguageThemeFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-region-theme", category: "Footers", name: "Footer with language picker and theme toggle",
        summary: "The language button opens a list above itself (below if there is no room) that grows from the button; one highlight plate follows hover and arrow keys with lagging edges. Choosing a language moves the check, closes the list, and every footer string swaps: out in 100ms, back in, staggered 12ms apart down the page. The theme toggle slides one plate between System, Light and Dark while every colour in the page blends on one spring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Environment(\.colorScheme) private var system
    @State private var lang = 0
    @State private var open = false
    @State private var theme = 0
    @State private var hover: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var themeFrames: [AnyHashable: CGRect] = [:]
    private let langs = ["English", "Français", "Español"]
    private let strings = [["Product", "Pricing", "Support", "Language", "Theme"], ["Produit", "Tarifs", "Assistance", "Langue", "Thème"], ["Producto", "Precios", "Soporte", "Idioma", "Tema"]]
    private let themes = ["System", "Light", "Dark"]
    public init() {}
    public var body: some View {
        let dark = theme == 2 || (theme == 0 && system == .dark)
        let d = dark ? 1.0 : 0.0
        AtomStage(hint: "Pick a language, then a theme") {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 16) { ForEach(0..<3, id: \.self) { s($0, .callout) } }
                HStack {
                    s(3, .caption).foregroundStyle(.secondary)
                    languageButton
                    Spacer()
                    s(4, .caption).foregroundStyle(.secondary)
                    HStack(spacing: 0) {
                        ForEach(themes.indices, id: \.self) { i in
                            Button(themes[i]) { withMotion(.soft, reduceMotion: reduce) { theme = i } }.buttonStyle(.plain).font(.caption)
                                .padding(.horizontal, 8).padding(.vertical, 5).reportFrame(i, in: "theme")
                        }
                    }
                    .background { MegaPlate(frame: themeFrames[AnyHashable(theme)], radius: 6) }
                    .coordinateSpace(name: "theme").onPreferenceChange(FramePreferenceKey.self) { themeFrames = $0 }
                }
            }
            .foregroundStyle(Color(white: 0.1 + 0.85 * d))
            .padding(16).frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(white: 0.97 - 0.85 * d), in: RoundedRectangle(cornerRadius: 10))
            .animation(reduce ? nil : .motion(.soft), value: d)
        }
    }

    private func s(_ i: Int, _ font: Font) -> some View {
        ZStack(alignment: .leading) {
            Text(strings[lang][i]).font(font).id(strings[lang][i])
                .transition(reduce ? .identity : .asymmetric(
                    insertion: .opacity.combined(with: .offset(y: 4)).animation(.motion(.base).delay(Motion.exit + Double(i) * 0.012)),
                    removal: .opacity.animation(.motionExit)))
        }
        .animation(reduce ? nil : .motion(.base), value: lang)
    }

    private var languageButton: some View {
        Button { withMotion(.base, reduceMotion: reduce) { open.toggle() } } label: {
            HStack(spacing: 4) { Image(systemName: "globe"); Text(langs[lang]); Image(systemName: "chevron.up").font(.caption2).rotationEffect(.degrees(open ? 180 : 0)) }
                .font(.caption).padding(.horizontal, 8).padding(.vertical, 5).overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(.quaternary))
        }
        .buttonStyle(.plain).accessibilityLabel("Language").accessibilityValue(langs[lang])
        .overlay(alignment: .topLeading) {
            if open {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(langs.indices, id: \.self) { i in
                        HStack { Image(systemName: "checkmark").opacity(i == lang ? 1 : 0).frame(width: 14); Text(langs[i]).font(.caption); Spacer(minLength: 0) }
                            .padding(6).frame(width: 120).contentShape(Rectangle()).reportFrame(i, in: "lang")
                            .onHover { hover = $0 ? i : (hover == i ? nil : hover) }
                            .onTapGesture { withMotion(.base, reduceMotion: reduce) { lang = i; open = false } }
                            .accessibilityAddTraits(.isButton)
                    }
                }
                .background { MegaPlate(frame: hover.flatMap { frames[AnyHashable($0)] }, radius: 5) }
                .coordinateSpace(name: "lang").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .background(.background, in: RoundedRectangle(cornerRadius: 8)).overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary))
                .foregroundStyle(.primary)
                .alignmentGuide(.top) { $0[.bottom] + 6 }
                .motionTransition(.presence)
            }
        }
    }
}
