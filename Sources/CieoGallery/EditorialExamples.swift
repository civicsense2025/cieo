import CieoUI
import SwiftUI

/// Gallery specimens for Cieo's editorial display type, geometric cuts, pathways, rails and ranked indexes.
struct EditorialExamples: View {
    private struct Lesson: Identifiable {
        let id: String
        let title: String
        let stage: PathwayStage
    }

    private struct Story: Identifiable {
        let id: String
        let kicker: String
        let title: String
        let cut: CutShape.Kind
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @State private var tab = "overview"
    @State private var step = 3

    private let lessons: [Lesson] = [
        .init(id: "filing", title: "Bill introduced", stage: .done),
        .init(id: "committee", title: "Committee markup", stage: .current),
        .init(id: "floor", title: "Floor debate", stage: .upcoming),
        .init(id: "vote", title: "Final passage", stage: .upcoming),
    ]

    private let stories: [Story] = [
        .init(id: "s1", kicker: "Permitting", title: "Grid transmission corridors", cut: .arch),
        .init(id: "s2", kicker: "Appropriations", title: "Quarterly budget baseline", cut: .quarter(.topTrailing)),
        .init(id: "s3", kicker: "Judiciary", title: "Circuit docket calendar", cut: .leadingPill),
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Specimen(title: "Segmented tabs & frame bar") {
                FrameBar {
                    TopicChip("Legislative tracker")
                } trailing: {
                    ReferenceText.page(2, of: 6)
                }
                SegmentedTabs([
                    .init("overview", title: Text("Overview")),
                    .init("votes", title: Text("Roll call"), accessibilityValue: Text("6 members")),
                    .init("steps", title: Text("Pathway")),
                ], selection: $tab)
            }
            Specimen(title: "Display numerals, share bar & segmented progress") {
                HStack(alignment: .firstTextBaseline, spacing: metrics.loose) {
                    BigNumber("64%", label: "turnout", role: .numeralMedium, layout: .stacked)
                    BigNumber("218", label: "needed", role: .numeralSmall, layout: .stacked)
                }
                ShareBar([
                    .init(218, color: theme.accent),
                    .init(212, color: theme.secondary),
                ], label: Text("218 in favor, 212 opposed"))
                SegmentedProgress(total: 6, completed: step, label: Text("Markup progress"))
                ActionButton("Advance step", emphasis: .quiet, sizing: .fitted) {
                    step = step >= 6 ? 1 : step + 1
                }
            }
            Specimen(title: "Block panel & geometric cuts") {
                BlockPanel(tone: .block, bleed: .init(corner: .bottomTrailing, diameter: 160)) {
                    Text("Live floor session").displayText(.title)
                    Text("Amendments close at 5:00 PM Eastern.")
                }
                HStack(spacing: metrics.medium) {
                    CutSurface(.arch, fill: theme.accentSoft).frame(height: 72)
                    CutSurface(.circle, fill: theme.accent).frame(width: 72, height: 72)
                    CutSurface(.quarter(.topLeading), fill: theme.sunken).frame(height: 72)
                }
            }
            Specimen(title: "Ranked index, numbered steps & info sheet") {
                IndexRow(rank: IndexRow.rank(0), title: Text("Clean energy siting"), note: Text("Reported favorably"), fraction: 0.78)
                IndexRow(rank: IndexRow.rank(1), title: Text("Water infrastructure"), note: Text("Subcommittee hearing"), fraction: 0.45)
                NumberedSteps([
                    (title: "Read the summary", detail: "Plain-language digest of each section."),
                    (title: "Compare amendments", detail: "Track changes before the floor vote."),
                ])
                InfoButton("About this tracker", groups: [
                    .init("Sources", questions: [
                        .init("Where do roll-call counts come from?", answer: "Clerk tallies published after each vote.")
                    ])
                ], style: .row)
            }
            Specimen(title: "Pathway, content rail & roll call") {
                Pathway(lessons, axis: .vertical, stroke: .dashed, stage: \.stage, accessibilityName: { Text($0.title) }) { item, _ in
                    Text(item.title)
                }
                ContentRail(stories, itemWidth: 210, label: Text("Featured briefings")) { story in
                    VStack(alignment: .leading, spacing: metrics.compact) {
                        CutSurface(story.cut, fill: theme.accentSoft).frame(height: 80)
                        TopicChip(story.kicker)
                        Text(story.title).displayText(.headline)
                    }
                    .padding(metrics.medium)
                    .background(theme.surfaceLow, in: .rect(cornerRadius: metrics.corner))
                }
                RollCall([
                    .init(id: "yea", title: "Yea", color: theme.success, members: [
                        .init(id: "m1", name: "A. Morales", detail: "Sponsor"),
                        .init(id: "m2", name: "B. Chen", detail: "Co-sponsor"),
                    ]),
                    .init(id: "nay", title: "Nay", color: theme.danger, members: [
                        .init(id: "m3", name: "C. Patel", detail: "Ranking"),
                    ]),
                ])
            }
            Specimen(title: "Content frame, quoted passage, people & step list") {
                ContentFrame(ground: .block) {
                    FrameBar {
                        TopicChip("Statutory text")
                    } trailing: {
                        ReferenceText("§1302(b)")
                    }
                } content: {
                    QuotedText(
                        Text("Regional transmission planners shall publish interconnection queue milestones quarterly."),
                        reference: Text("Energy Modernization Act §1302")
                    )
                } bottom: {
                    HStack(spacing: metrics.medium) {
                        LegendItem("In committee", color: theme.accent)
                        LegendItem("Enacted", color: theme.success)
                    }
                }
                .clipShape(.rect(cornerRadius: metrics.cornerSurface))

                HStack(spacing: metrics.medium) {
                    Portrait(size: .regular, ring: theme.accent)
                    PersonRow(Text("Sen. Elena Morales"), detail: Text("Sponsor · Energy Committee"), ring: theme.success)
                }

                StepList([
                    .init("Subcommittee hearing", detail: "Completed with bipartisan amendments.", id: 1),
                    .init("Full committee markup", detail: "Scheduled for Thursday morning.", id: 2),
                    .init("Floor calendar", id: 3),
                ], current: 1)
            }
        }
    }
}
