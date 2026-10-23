import SwiftUI

/// The shell of a live audio room: a title with the listener count, a stage of speakers that glide into
/// place when people join or leave, and the person's own controls. The host owns the real-time connection;
/// the room draws what it is told and reports button presses through closures.
public struct AudioRoom: View {
    /// One person on stage.
    public struct Speaker: Identifiable, Equatable, Sendable {
        /// Stable id; the stage animates by it when people join, leave or move.
        public let id: String
        public var name: String
        public var role: SpeakerTile.Role?
        /// Live loudness, 0 to 1.
        public var level: Double
        public var isMuted: Bool
        public var handRaised: Bool

        public init(id: String, name: String, role: SpeakerTile.Role? = nil, level: Double = 0,
                    isMuted: Bool = false, handRaised: Bool = false) {
            self.id = id; self.name = name; self.role = role; self.level = level
            self.isMuted = isMuted; self.handRaised = handRaised
        }
    }

    /// The person's own state in the room.
    public struct Me: Equatable, Sendable {
        /// Whether the person's own microphone is muted.
        public var isMuted: Bool
        /// Whether the person's hand is up.
        public var handRaised: Bool
        /// Only people who may speak get a mute button.
        public var canSpeak: Bool

        public init(isMuted: Bool = false, handRaised: Bool = false, canSpeak: Bool = false) {
            self.isMuted = isMuted; self.handRaised = handRaised; self.canSpeak = canSpeak
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @ScaledMetric private var seat = 104 // literal-ok: narrowest a stage seat may be; no step or role matches it
    private let title: Text
    private let speakers: [Speaker]
    private let listenerCount: Int
    private let me: Me
    private let avatar: (Speaker) -> AnyView
    private let listeners: AnyView?
    private let reactions: AnyView?
    private let onToggleMute: () -> Void
    private let onToggleHand: () -> Void
    private let onLeave: () -> Void

    /// `avatar` draws each speaker's face. `listeners` (for example a row of small faces) sits beside the
    /// count and `reactions` (a picker or buttons) sits in the control bar; both are optional slots.
    public init<Avatar: View, Listeners: View, Reactions: View>(
        title: Text, speakers: [Speaker], listenerCount: Int, me: Me,
        onToggleMute: @escaping () -> Void, onToggleHand: @escaping () -> Void, onLeave: @escaping () -> Void,
        @ViewBuilder avatar: @escaping (Speaker) -> Avatar,
        @ViewBuilder listeners: () -> Listeners, @ViewBuilder reactions: () -> Reactions
    ) {
        self.title = title
        self.speakers = speakers
        self.listenerCount = max(0, listenerCount)
        self.me = me
        self.avatar = { AnyView(avatar($0)) }
        self.listeners = AnyView(listeners())
        self.reactions = AnyView(reactions())
        self.onToggleMute = onToggleMute
        self.onToggleHand = onToggleHand
        self.onLeave = onLeave
    }

    /// A room without the listeners or reactions slots.
    public init<Avatar: View>(
        title: Text, speakers: [Speaker], listenerCount: Int, me: Me,
        onToggleMute: @escaping () -> Void, onToggleHand: @escaping () -> Void, onLeave: @escaping () -> Void,
        @ViewBuilder avatar: @escaping (Speaker) -> Avatar
    ) {
        self.title = title
        self.speakers = speakers
        self.listenerCount = max(0, listenerCount)
        self.me = me
        self.avatar = { AnyView(avatar($0)) }
        self.listeners = nil
        self.reactions = nil
        self.onToggleMute = onToggleMute
        self.onToggleHand = onToggleHand
        self.onLeave = onLeave
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.standard) {
            header
            stage
            controls
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(title)
    }

    // MARK: - Pieces

    private var header: some View {
        ViewThatFits(in: .horizontal) {
            HStack(alignment: .firstTextBaseline, spacing: metrics.standard) {
                titleText
                Spacer(minLength: 0)
                listenerSummary
            }
            VStack(alignment: .leading, spacing: metrics.compact) {
                titleText
                listenerSummary
            }
        }
    }

    private var titleText: some View {
        title.font(typography.subtitle).foregroundStyle(theme.foreground)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityAddTraits(.isHeader)
    }

    private var listenerSummary: some View {
        HStack(spacing: metrics.compact) {
            listeners
            Text("\(Self.compactCount(listenerCount)) listening")
                .font(typography.detail).foregroundStyle(theme.secondary)
                .contentTransition(.numericText(value: Double(listenerCount)))
                .accessibilityLabel(Text("\(Self.exactCount(listenerCount)) listening"))
        }
        .motionAnimation(.base, value: listenerCount)
    }

    private var stage: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: seat), spacing: metrics.standard, alignment: .top)],
                  alignment: .center, spacing: metrics.standard) {
            ForEach(speakers) { speaker in
                SpeakerTile(name: speaker.name, role: speaker.role, level: speaker.level, isMuted: speaker.isMuted,
                            handRaised: speaker.handRaised, size: .large) { avatar(speaker) }
            }
        }
        .motionAnimation(.base, value: Self.stageKey(speakers))
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text("Speakers"))
    }

    private var controls: some View {
        FlowStack {
            if me.canSpeak {
                control(me.isMuted ? .microphoneOff : .microphone, "Mute", isOn: me.isMuted, action: onToggleMute)
            }
            control(.handRaised, "Raise hand", isOn: me.handRaised, action: onToggleHand)
            reactions
            control(.leave, "Leave", isOn: nil, danger: true, action: onLeave)
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text("Your controls"))
    }

    private func control(_ icon: ComponentIcon, _ title: LocalizedStringKey, isOn: Bool?, danger: Bool = false,
                         action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
                InlineGlyph { icons(icon) }.accessibilityHidden(true)
                Text(title)
            }
            .font(typography.action)
            .foregroundStyle(danger ? theme.danger : theme.foreground)
            .padding(.horizontal, metrics.standard)
            .frame(minHeight: metrics.touchTarget)
            .background(isOn == true ? theme.tint : theme.surface, in: .capsule)
        }
        .buttonStyle(.plain)
        .motionAnimation(.snap, value: isOn)
        .modifier(ToggleState(isOn: isOn))
    }

    /// Reads a control with a state as a toggle ("Mute, on") and one without as a plain button.
    private struct ToggleState: ViewModifier {
        let isOn: Bool?
        func body(content: Content) -> some View {
            if let isOn {
                content.accessibilityAddTraits(.isToggle).accessibilityValue(isOn ? Text("On") : Text("Off"))
            } else {
                content
            }
        }
    }

    // MARK: - Pure helpers

    /// Order key of the stage: changes when someone joins, leaves or moves, so the stage knows to animate.
    public static func stageKey(_ speakers: [Speaker]) -> String {
        speakers.map(\.id).joined(separator: "\u{0}")
    }

    /// Short listener count such as "1.2K", in the shared CompactCount format.
    static func compactCount(_ value: Int, locale: Locale = .current) -> String {
        CompactCount.formatCompactCount(value, locale: locale)
    }

    /// Exact count read to VoiceOver such as "1,240".
    static func exactCount(_ value: Int, locale: Locale = .current) -> String {
        CompactCount.formatExactCount(value, locale: locale)
    }
}

#Preview("AudioRoom") {
    AudioRoom(
        title: Text("Friday jam"),
        speakers: [.init(id: "a", name: "Ava", role: .host, level: 0.5), .init(id: "b", name: "Ben", isMuted: true, handRaised: true)],
        listenerCount: 1240, // literal-ok: preview
        me: .init(canSpeak: true), onToggleMute: {}, onToggleHand: {}, onLeave: {}
    ) { _ in Color.accentColor }
    .padding()
}
