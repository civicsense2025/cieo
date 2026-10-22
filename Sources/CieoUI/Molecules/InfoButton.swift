import SwiftUI

/// Questions about a screen, kept behind an info button that opens a sheet instead of a block on the screen.
/// `.icon` suits a toolbar; `.row` suits a list where the toolbar's trailing spot is taken.
public struct InfoButton: View {
    public enum Style: Sendable { case icon, row }

    public struct Question: Identifiable, Sendable {
        public let id: String
        public let question: String
        public let answer: String
        public init(_ question: String, answer: String) {
            self.id = question
            self.question = question
            self.answer = answer
        }
    }

    public struct QuestionGroup: Identifiable, Sendable {
        public let id: String
        public let title: String?
        public let questions: [Question]
        public init(_ title: String? = nil, questions: [Question]) {
            self.id = title ?? questions.first?.id ?? ""
            self.title = title
            self.questions = questions
        }
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @State private var isPresented = false
    private let title: String
    private let groups: [QuestionGroup]
    private let style: Style

    public init(_ title: String, groups: [QuestionGroup], style: Style = .icon) {
        self.title = title
        self.groups = Self.visible(groups)
        self.style = style
    }

    /// Groups that have at least one question; an empty sheet is never offered.
    public static func visible(_ groups: [QuestionGroup]) -> [QuestionGroup] {
        groups.filter { !$0.questions.isEmpty }
    }

    public var body: some View {
        if !groups.isEmpty {
            trigger.sheet(isPresented: $isPresented) { sheet }
        }
    }

    @ViewBuilder private var trigger: some View {
        switch style {
        case .icon:
            IconButton(.info, label: Text(title), prominent: true) { isPresented = true }
        case .row:
            Button { isPresented = true } label: { row }
                .buttonStyle(.plain)
                .accessibilityLabel(Text(title))
        }
    }

    private var row: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.medium) {
            InlineGlyph(font: typography.strongBody) { icons(.info).font(typography.prominentGlyph) }
                .foregroundStyle(theme.accent)
            Text(title).font(typography.strongBody).foregroundStyle(theme.foreground)
            Spacer(minLength: 0)
            InlineGlyph(font: typography.strongBody) { icons(.disclosure).font(typography.glyph) }
                .foregroundStyle(theme.secondary)
        }
        .frame(minHeight: metrics.touchTarget)
        .contentShape(Rectangle())
    }

    private var sheet: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: metrics.section) {
                    ForEach(groups) { group in
                        VStack(alignment: .leading, spacing: metrics.compact) {
                            if let heading = group.title {
                                Text(heading).font(typography.strongHeading).accessibilityAddTraits(.isHeader)
                            }
                            ForEach(group.questions) { item in
                                DisclosureGroup {
                                    Text(item.answer).foregroundStyle(theme.secondary)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .padding(.top, metrics.tight)
                                } label: {
                                    Text(item.question).font(typography.strongBody).foregroundStyle(theme.foreground)
                                        .frame(minHeight: metrics.touchTarget, alignment: .leading)
                                }
                            }
                        }
                    }
                }
                .padding(metrics.standard)
            }
            .navigationTitle(title)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { isPresented = false }
                }
            }
        }
        #if os(iOS)
        .presentationDetents([.medium, .large])
        #endif
    }
}
