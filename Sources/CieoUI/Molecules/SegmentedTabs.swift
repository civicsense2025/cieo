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

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
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
                            Rectangle().fill(theme.accent)
                                .frame(height: metrics.compact / 2)
                                .opacity(isSelected ? 1 : 0)
                        }
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .motionAnimation(.snap, value: isSelected)
                .accessibilityValue(tab.accessibilityValue ?? Text(verbatim: ""))
                .accessibilityAddTraits(isSelected ? [.isSelected] : [])
            }
        }
        // The row sits still when it fits and scrolls sideways only when it does not.
        ViewThatFits(in: .horizontal) {
            row
            ScrollView(.horizontal, showsIndicators: false) { row }
        }
        .overlay(alignment: .bottom) {
            Rectangle().fill(theme.border).frame(height: metrics.hairline)
        }
        .accessibilityElement(children: .contain)
    }
}
