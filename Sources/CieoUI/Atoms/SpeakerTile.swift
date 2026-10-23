import SwiftUI

/// One person in a live audio room: an avatar, their name, a ring that swells with their voice, and
/// badges for muted and raised hand. The host owns the audio and passes the `level`; the avatar is a
/// slot, so the tile works with any avatar view.
public struct SpeakerTile: View {
    /// Role in the room, read aloud with the name.
    public enum Role: String, Sendable, CaseIterable { case host, speaker, listener }
    /// Tile size.
    public enum Size: Sendable, CaseIterable { case small, medium, large }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    @ScaledMetric private var smallFace = 48 // literal-ok: avatar geometry; no step or role matches it
    @ScaledMetric private var mediumFace = 64 // literal-ok: avatar geometry
    @ScaledMetric private var largeFace = 88 // literal-ok: avatar geometry
    @State private var wasSpeaking = false
    private let name: String
    private let role: Role?
    private let level: Double
    private let isMuted: Bool
    private let handRaised: Bool
    private let size: Size
    private let avatar: AnyView

    /// `level` is the live loudness from 0 to 1; a muted tile keeps its ring still. `avatar` fills the
    /// circular face and is hidden from VoiceOver, because the tile's own label names the person.
    public init<Avatar: View>(name: String, role: Role? = nil, level: Double = 0, isMuted: Bool = false,
                              handRaised: Bool = false, size: Size = .medium,
                              @ViewBuilder avatar: () -> Avatar) {
        self.name = name
        self.role = role
        self.level = AudioLevelMeter.clamp01(level)
        self.isMuted = isMuted
        self.handRaised = handRaised
        self.size = size
        self.avatar = AnyView(avatar())
    }

    public var body: some View {
        let heard = isMuted ? 0 : level
        let speaking = Self.speakingStep(wasSpeaking, level: heard)
        let face = faceSize
        VStack(spacing: metrics.compact) {
            ZStack {
                Circle()
                    .stroke(theme.accent, lineWidth: metrics.thinBar)
                    .frame(width: face + metrics.compact * 2, height: face + metrics.compact * 2)
                    .scaleEffect(Self.ringScale(heard))
                    .opacity(Self.ringOpacity(heard))
                avatar
                    .frame(width: face, height: face)
                    .clipShape(.circle)
                    .accessibilityHidden(true)
            }
            .frame(width: face, height: face)
            .overlay(alignment: .bottomTrailing) { badges }
            .padding(metrics.medium)
            .motionAnimation(.base, value: heard)
            Text(name)
                .font(typography.detail)
                .foregroundStyle(theme.foreground)
                .lineLimit(2) // literal-ok: two lines of name before truncation
                .multilineTextAlignment(.center)
        }
        .onChange(of: speaking, initial: true) { _, now in wasSpeaking = now }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Self.speakerLabel(name: name, role: role, muted: isMuted, speaking: speaking, handRaised: handRaised))
    }

    private var faceSize: CGFloat {
        switch size {
        case .small: smallFace
        case .medium: mediumFace
        case .large: largeFace
        }
    }

    @ViewBuilder
    private var badges: some View {
        HStack(spacing: metrics.tight) {
            if isMuted { badge(.microphoneOff, fill: theme.block, ink: theme.onBlock) }
            if handRaised { badge(.handRaised, fill: theme.accent, ink: theme.onAccent).transition(.scale) }
        }
        .motionAnimation(.snap, value: handRaised)
    }

    private func badge(_ icon: ComponentIcon, fill: Color, ink: Color) -> some View {
        InlineGlyph(font: typography.glyph) { icons(icon) }
            .font(typography.glyph)
            .foregroundStyle(ink)
            .padding(metrics.tight)
            .background(fill, in: .circle)
    }

    // MARK: - Pure helpers

    /// Speaking threshold with hysteresis so the ring does not flicker: on above 0.12, off below 0.06,
    /// otherwise unchanged.
    public static func speakingStep(_ wasSpeaking: Bool, level: Double) -> Bool {
        let l = AudioLevelMeter.clamp01(level)
        return wasSpeaking ? l >= 0.06 : l > 0.12 // literal-ok: the web hysteresis thresholds
    }

    /// Screen-reader sentence: "Ava, host, speaking" or "Ben, muted, hand raised". Muted people are
    /// never described as speaking.
    public static func speakerLabel(name: String, role: Role? = nil, muted: Bool = false,
                                    speaking: Bool = false, handRaised: Bool = false) -> String {
        [name, role?.rawValue ?? "", muted ? "muted" : (speaking ? "speaking" : ""), handRaised ? "hand raised" : ""]
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
    }

    /// How far the speaking ring swells for a level: 1 at silence up to 1.22 at full voice.
    public static func ringScale(_ level: Double) -> Double {
        1 + AudioLevelMeter.clamp01(level) * 0.22 // literal-ok: the web ring swell
    }

    /// How visible the speaking ring is for a level: invisible at silence, full from 0.4 up.
    public static func ringOpacity(_ level: Double) -> Double {
        min(1, AudioLevelMeter.clamp01(level) * 2.5) // literal-ok: the web ring fade
    }
}

#Preview("SpeakerTile") {
    HStack(spacing: 24) { // literal-ok: preview layout
        SpeakerTile(name: "Ava", role: .host, level: 0.6) { Color.accentColor }
        SpeakerTile(name: "Ben", isMuted: true, handRaised: true) { Color.accentColor }
        SpeakerTile(name: "Cy", size: .small) { Color.accentColor } // literal-ok: preview
    }
    .padding()
}
