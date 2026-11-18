import Cieo
import SwiftUI

/// A row of tabs that switch between views of the same screen: the chosen tab sits on an accent underline over
/// one hairline, with whitespace instead of a boxed control. Scrolls sideways when the titles do not fit, so a
/// title is never cut off at an accessibility text size.
public struct SegmentedTabs<Value: Hashable>: View {
    public struct Tab: Identifiable {
        public let value: Value
        public let title: Text
        /// A spoken value for the tab, such as "3 items", when the title alone does not say it.
        public let accessibilityValue: Text?
        public var id: Value { value }

        public init(_ value: Value, title: Text, accessibilityValue: Text? = nil) {
            self.value = value
            self.title = title
            self.accessibilityValue = accessibilityValue
        }
    }

    private static var coordinateSpace: String { "segmented-tabs" }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.renderPolicy) private var policy
    @State private var frames: [AnyHashable: CGRect] = [:]
    private let tabs: [Tab]
    @Binding private var selection: Value

    public init(_ tabs: [Tab], selection: Binding<Value>) {
        self.tabs = tabs
        _selection = selection
    }

    /// The selection is whichever tab matches, or the first when the bound value is not one of them, so the row
    /// never shows nothing chosen.
    public static func selected(in values: [Value], matching value: Value) -> Value? {
        values.contains(value) ? value : values.first
    }

    public var body: some View {
        let current = Self.selected(in: tabs.map(\.value), matching: selection)
        let underlineHeight = metrics.compact / 2
        let measuredFrame = current.flatMap { frames[AnyHashable($0)] }
        let row = HStack(spacing: metrics.compact) {
            ForEach(tabs) { tab in
                let isSelected = tab.value == current
                Button { selection = tab.value } label: {
                    tab.title
                        .font(typography.selection)
                        .foregroundStyle(isSelected ? theme.accent : theme.secondary)
                        .padding(.horizontal, metrics.standard)
                        .frame(minHeight: metrics.touchTarget)
                        .overlay(alignment: .bottom) {
                            if isSelected && measuredFrame == nil {
                                Rectangle().fill(theme.accent).frame(height: underlineHeight)
                            }
                        }
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .reportFrame(tab.value, in: Self.coordinateSpace)
                .motionAnimation(.snap, value: isSelected)
                .accessibilityValue(tab.accessibilityValue ?? Text(verbatim: ""))
                .accessibilityAddTraits(isSelected ? [.isSelected] : [])
            }
        }
        .overlay(alignment: .topLeading) {
            if let f = measuredFrame {
                EdgesIndicator(
                    frame: CGRect(x: f.minX, y: f.maxY - underlineHeight, width: f.width, height: underlineHeight),
                    shape: Rectangle(),
                    style: theme.accent,
                    motionEnabled: policy.allowsMotion
                )
            }
        }
        .coordinateSpace(name: Self.coordinateSpace)
        .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }

        ViewThatFits(in: .horizontal) {
            row
            ScrollView(.horizontal, showsIndicators: false) { row }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .overlay(alignment: .bottom) {
            Rectangle().fill(theme.border).frame(height: metrics.hairline)
        }
        .accessibilityElement(children: .contain)
    }
}
