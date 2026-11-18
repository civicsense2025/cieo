import Cieo
import SwiftUI

// MARK: - ChipStyle

public struct ChipStyleConfiguration {
    public struct Label: View {
        private let base: AnyView
        init<V: View>(_ view: V) { self.base = AnyView(view) }
        public var body: some View { base }
    }
    public let label: Label
    public let isSelected: Bool
    public init<V: View>(isSelected: Bool, @ViewBuilder label: () -> V) {
        self.isSelected = isSelected
        self.label = Label(label())
    }
}

public protocol ChipStyle {
    associatedtype Body: View
    typealias Configuration = ChipStyleConfiguration
    @MainActor @ViewBuilder func makeBody(configuration: Configuration) -> Body
}

private struct BuiltinChipBody: View {
    enum Variant { case capsule, rounded, soft, outlined }
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    let variant: Variant
    let configuration: ChipStyleConfiguration

    var body: some View {
        let selected = configuration.isSelected
        let base = configuration.label
            .font(typography.selection)
            .foregroundStyle(foreground(selected))
            .padding(.horizontal, metrics.standard)
            .frame(minHeight: metrics.touchTarget)
        switch variant {
        case .capsule:
            base.background(selected ? theme.tint : theme.surface, in: .capsule)
        case .rounded:
            base.background(selected ? theme.tint : theme.surface, in: .rect(cornerRadius: metrics.corner))
                .componentBorder(selected ? theme.accent : theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        case .soft:
            base.background(selected ? theme.accentSoft : theme.surfaceLow, in: .capsule)
        case .outlined:
            base.background(Color.clear, in: .capsule)
                .componentBorder(selected ? theme.accent : theme.borderStrong, width: metrics.hairline, cornerRadius: metrics.cornerPill)
        }
    }

    private func foreground(_ selected: Bool) -> Color {
        switch variant {
        case .capsule, .rounded: theme.foreground
        case .soft: selected ? theme.onAccentSoft : theme.foreground
        case .outlined: selected ? theme.accent : theme.foreground
        }
    }
}

public struct CapsuleChipStyle: ChipStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinChipBody(variant: .capsule, configuration: configuration) }
}
public struct RoundedChipStyle: ChipStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinChipBody(variant: .rounded, configuration: configuration) }
}
public struct SoftChipStyle: ChipStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinChipBody(variant: .soft, configuration: configuration) }
}
public struct OutlinedChipStyle: ChipStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinChipBody(variant: .outlined, configuration: configuration) }
}

public extension ChipStyle where Self == CapsuleChipStyle { static var capsule: CapsuleChipStyle { .init() } }
public extension ChipStyle where Self == RoundedChipStyle { static var rounded: RoundedChipStyle { .init() } }
public extension ChipStyle where Self == SoftChipStyle { static var soft: SoftChipStyle { .init() } }
public extension ChipStyle where Self == OutlinedChipStyle { static var outlined: OutlinedChipStyle { .init() } }

public struct AnyChipStyle: ChipStyle {
    private let make: @MainActor (Configuration) -> AnyView
    public init<S: ChipStyle>(_ style: S) { self.make = { AnyView(style.makeBody(configuration: $0)) } }
    public func makeBody(configuration: Configuration) -> some View { make(configuration) }
}

// MARK: - NoticeStyle & NoticeTone

public enum NoticeTone: String, CaseIterable, Equatable, Sendable {
    case neutral, info, success, warning, danger

    public func foreground(_ theme: Theme) -> Color {
        switch self {
        case .neutral: theme.foreground
        case .info: theme.info
        case .success: theme.success
        case .warning: theme.warning
        case .danger: theme.danger
        }
    }

    public func background(_ theme: Theme) -> Color {
        switch self {
        case .neutral: theme.surface
        case .info: theme.infoSoft
        case .success: theme.successSoft
        case .warning: theme.warningSoft
        case .danger: theme.dangerSoft
        }
    }

    public var defaultIcon: ComponentIcon {
        switch self {
        case .neutral, .info: .info
        case .success: .check
        case .warning: .warning
        case .danger: .error
        }
    }
}

public struct NoticeStyleConfiguration {
    public struct Icon: View {
        private let base: AnyView
        init<V: View>(_ view: V) { self.base = AnyView(view) }
        public var body: some View { base }
    }
    public struct Content: View {
        private let base: AnyView
        init<V: View>(_ view: V) { self.base = AnyView(view) }
        public var body: some View { base }
    }
    public let tone: NoticeTone
    public let icon: Icon
    public let content: Content
    public let onDismiss: (() -> Void)?

    public init<I: View, C: View>(tone: NoticeTone, onDismiss: (() -> Void)? = nil,
                                  @ViewBuilder icon: () -> I, @ViewBuilder content: () -> C) {
        self.tone = tone; self.onDismiss = onDismiss; self.icon = Icon(icon()); self.content = Content(content())
    }
}

public protocol NoticeStyle {
    associatedtype Body: View
    typealias Configuration = NoticeStyleConfiguration
    @MainActor @ViewBuilder func makeBody(configuration: Configuration) -> Body
}

private struct BuiltinNoticeBody: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentStrings) private var strings
    let card: Bool
    let configuration: NoticeStyleConfiguration

    var body: some View {
        let row = HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            configuration.icon
                .font(typography.heading)
                .foregroundStyle(configuration.tone.foreground(theme))
                .accessibilityHidden(true)
            configuration.content
            if let onDismiss = configuration.onDismiss {
                Button(action: onDismiss) {
                    InlineGlyph { icons(.dismiss) }
                        .font(typography.glyph)
                        .foregroundStyle(theme.secondary)
                        .frame(minWidth: metrics.touchTarget, minHeight: metrics.touchTarget)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(verbatim: strings.dismissLabel))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)

        if !card && configuration.tone == .neutral && configuration.onDismiss == nil {
            row
        } else {
            row.padding(metrics.medium)
                .background(configuration.tone.background(theme), in: .rect(cornerRadius: metrics.corner))
                .componentBorder(card ? theme.border : nil, width: metrics.hairline, cornerRadius: metrics.corner)
        }
    }
}

public struct AutomaticNoticeStyle: NoticeStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinNoticeBody(card: false, configuration: configuration) }
}
public struct CardNoticeStyle: NoticeStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinNoticeBody(card: true, configuration: configuration) }
}

public extension NoticeStyle where Self == AutomaticNoticeStyle { static var automatic: AutomaticNoticeStyle { .init() } }
public extension NoticeStyle where Self == CardNoticeStyle { static var card: CardNoticeStyle { .init() } }

public struct AnyNoticeStyle: NoticeStyle {
    private let make: @MainActor (Configuration) -> AnyView
    public init<S: NoticeStyle>(_ style: S) { self.make = { AnyView(style.makeBody(configuration: $0)) } }
    public func makeBody(configuration: Configuration) -> some View { make(configuration) }
}

// MARK: - ProgressRingStyle

public struct ProgressRingStyleConfiguration {
    public struct CenterLabel: View {
        private let base: AnyView
        init<V: View>(_ view: V) { self.base = AnyView(view) }
        public var body: some View { base }
    }
    public let value: Double
    public let diameter: CGFloat
    public let centerLabel: CenterLabel

    public init<L: View>(value: Double, diameter: CGFloat, @ViewBuilder centerLabel: () -> L) {
        self.value = RenderPolicy.progress(value)
        self.diameter = diameter
        self.centerLabel = CenterLabel(centerLabel())
    }
}

public protocol ProgressRingStyle {
    associatedtype Body: View
    typealias Configuration = ProgressRingStyleConfiguration
    @MainActor @ViewBuilder func makeBody(configuration: Configuration) -> Body
}

private struct BuiltinProgressRingBody: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentMotion) private var motionConfig
    let subtle: Bool
    let configuration: ProgressRingStyleConfiguration

    var body: some View {
        let strokeWidth = subtle ? metrics.thinBar : metrics.bar
        ZStack {
            Circle().stroke(subtle ? theme.track : theme.border, lineWidth: strokeWidth)
            Circle().trim(from: 0, to: configuration.value)
                .stroke(theme.accent, style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
            configuration.centerLabel.font(typography.value)
        }
        .frame(width: configuration.diameter, height: configuration.diameter)
        .padding(metrics.tight)
        .motionAnimation(motionConfig.progress, value: configuration.value)
    }
}

public struct AutomaticProgressRingStyle: ProgressRingStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinProgressRingBody(subtle: false, configuration: configuration) }
}
public struct SubtleProgressRingStyle: ProgressRingStyle {
    public init() {}
    public func makeBody(configuration: Configuration) -> some View { BuiltinProgressRingBody(subtle: true, configuration: configuration) }
}

public extension ProgressRingStyle where Self == AutomaticProgressRingStyle { static var automatic: AutomaticProgressRingStyle { .init() } }
public extension ProgressRingStyle where Self == SubtleProgressRingStyle { static var subtle: SubtleProgressRingStyle { .init() } }

public struct AnyProgressRingStyle: ProgressRingStyle {
    private let make: @MainActor (Configuration) -> AnyView
    public init<S: ProgressRingStyle>(_ style: S) { self.make = { AnyView(style.makeBody(configuration: $0)) } }
    public func makeBody(configuration: Configuration) -> some View { make(configuration) }
}

public extension EnvironmentValues {
    @Entry var chipStyle = AnyChipStyle(.capsule)
    @Entry var noticeStyle = AnyNoticeStyle(.automatic)
    @Entry var progressRingStyle = AnyProgressRingStyle(.automatic)
}

public extension View {
    func chipStyle<S: ChipStyle>(_ style: S) -> some View { environment(\.chipStyle, AnyChipStyle(style)) }
    func noticeStyle<S: NoticeStyle>(_ style: S) -> some View { environment(\.noticeStyle, AnyNoticeStyle(style)) }
    func progressRingStyle<S: ProgressRingStyle>(_ style: S) -> some View { environment(\.progressRingStyle, AnyProgressRingStyle(style)) }
}
