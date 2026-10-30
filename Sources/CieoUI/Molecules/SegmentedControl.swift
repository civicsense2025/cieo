import Cieo
import SwiftUI

/// One choice in a SegmentedControl: the value it selects, its label and an optional count, such as the
/// number of items a filter would show.
public struct SegmentedControlOption<Value: Hashable>: Identifiable {
    public let value: Value
    public let label: Text
    /// Shown after the label and read with it. Negative counts are ignored.
    public let count: Int?
    public var id: Value { value }

    public init(_ label: Text, value: Value, count: Int? = nil) {
        self.value = value
        self.label = label
        self.count = count.flatMap { $0 >= 0 ? $0 : nil }
    }

    public init(_ label: LocalizedStringKey, value: Value, count: Int? = nil) {
        self.init(Text(label), value: value, count: count)
    }

    public init(verbatim label: String, value: Value, count: Int? = nil) {
        self.init(Text(verbatim: label), value: value, count: count)
    }
}

/// A single-select row of pills, for filters and tabs inside a screen. The host owns the selection.
/// Pills sit in one row while they fit and scroll sideways when they don't, keeping the selected pill in
/// view; text never truncates. VoiceOver reads the control's name once, then each pill as a selected or
/// unselected button. Twin of the web `SegmentedControl`.
public struct SegmentedControl<Value: Hashable, Accessory: View>: View {
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    private let label: Text
    @Binding private var selection: Value
    private let options: [SegmentedControlOption<Value>]
    private let accessory: (SegmentedControlOption<Value>) -> Accessory

    /// `label` names the whole control for VoiceOver ("Filter bills"). `accessory` draws after each
    /// pill's label and count, such as a status dot; it is read with the pill.
    public init(_ label: Text, selection: Binding<Value>, options: [SegmentedControlOption<Value>],
                @ViewBuilder accessory: @escaping (SegmentedControlOption<Value>) -> Accessory) {
        self.label = label
        _selection = selection
        self.options = Self.uniqueOptions(options)
        self.accessory = accessory
    }

    public init(_ label: LocalizedStringKey, selection: Binding<Value>, options: [SegmentedControlOption<Value>],
                @ViewBuilder accessory: @escaping (SegmentedControlOption<Value>) -> Accessory) {
        self.init(Text(label), selection: selection, options: options, accessory: accessory)
    }

    public var body: some View {
        ViewThatFits(in: .horizontal) {
            row
            ScrollViewReader { reader in
                ScrollView(.horizontal, showsIndicators: false) { row }
                    .scrollBounceBehavior(.basedOnSize, axes: .horizontal)
                    .onAppear { reader.scrollTo(selection) }
                    .onChange(of: selection) { _, value in
                        withMotion(.base, reduceMotion: reduceMotion) { reader.scrollTo(value) }
                    }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel(label)
    }

    private var row: some View {
        HStack(spacing: metrics.compact) {
            ForEach(options) { option in
                SegmentPill(option: option, isSelected: option.value == selection) {
                    selection = option.value
                } accessory: {
                    accessory(option)
                }
                .id(option.value)
            }
        }
        .fixedSize(horizontal: true, vertical: false)
    }

    // MARK: - Pure helpers

    /// Options with repeated values dropped, keeping the first, so every pill has a distinct identity.
    public static func uniqueOptions(_ options: [SegmentedControlOption<Value>]) -> [SegmentedControlOption<Value>] {
        var seen = Set<Value>()
        return options.filter { seen.insert($0.value).inserted }
    }

    /// The accessibility traits a pill carries: buttons always, and `.isSelected` on the chosen one.
    public static func traits(isSelected: Bool) -> AccessibilityTraits {
        isSelected ? [.isButton, .isSelected] : .isButton
    }
}

public extension SegmentedControl where Accessory == EmptyView {
    init(_ label: Text, selection: Binding<Value>, options: [SegmentedControlOption<Value>]) {
        self.init(label, selection: selection, options: options) { _ in EmptyView() }
    }

    init(_ label: LocalizedStringKey, selection: Binding<Value>, options: [SegmentedControlOption<Value>]) {
        self.init(Text(label), selection: selection, options: options) { _ in EmptyView() }
    }
}

/// One pill. Selected pills fill with the accent; the rest sit on the surface.
private struct SegmentPill<Value: Hashable, Accessory: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.controlAppearance) private var appearance
    let option: SegmentedControlOption<Value>
    let isSelected: Bool
    let select: () -> Void
    @ViewBuilder let accessory: () -> Accessory

    var body: some View {
        Button(action: select) {
            HStack(alignment: .firstTextBaseline, spacing: metrics.tight) {
                option.label.font(typography.selection)
                if let count = option.count {
                    Text(count, format: .number)
                        .font(typography.caption)
                        .monospacedDigit()
                }
                accessory()
            }
            .lineLimit(1)
            .fixedSize()
            .padding(.horizontal, metrics.standard)
            .padding(.vertical, metrics.snug)
            .frame(minHeight: metrics.touchTarget)
            .foregroundStyle(isSelected ? theme.onAccent : theme.foreground)
            .background(isSelected ? theme.accent : theme.surface, in: .capsule)
            .contentShape(.capsule)
        }
        .buttonStyle(SegmentPillStyle(appearance: appearance))
        .motionAnimation(.snap, value: isSelected)
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(SegmentedControl<Value, Accessory>.traits(isSelected: isSelected))
    }
}

private struct SegmentPillStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    let appearance: ControlAppearance

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(isEnabled ? (configuration.isPressed ? appearance.pressedOpacity : 1) : appearance.disabledOpacity)
    }
}
