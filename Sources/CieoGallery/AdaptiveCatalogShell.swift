import Cieo
import CieoAtoms
import CieoUI
import SwiftUI

/// Adaptive gallery shell with 3-pane `NavigationSplitView`, trailing `.inspector`, and global `⌘K` `CommandPaletteView`.
public struct AdaptiveCatalogShell: View {
    @Environment(\.horizontalSizeClass) private var sizeClass

    @State private var selection: AdaptiveCatalogSection? = .overview
    @State private var recipePath: [String] = []
    @State private var brand: ThemeBrand = .instrument
    @State private var ground: ThemeGround = .paper
    @State private var corners: CornerProfile = .pill
    @State private var density: ComponentDensity = .comfortable
    @State private var elevation: ElevationStyle = .ring
    @State private var isRTL = false
    @State private var reduceMotion = false
    @State private var effectsEnabled = true
    @State private var motionSpeed: Double = 1.0
    @State private var inspectorOpen = true
    @State private var compactInspectorSheet = false
    @State private var commandPaletteOpen = false

    /// Compact (iPhone) tab titles, shared with the site's navigation where the two map one to one.
    public static let compactTabTitles = ["Foundations", "Studio", "Library", "Recipes", "Physics"]
    private static let contentMaxWidth: CGFloat = 760
    private static let paletteMaxSize = CGSize(width: 540, height: 420)

    private let commandGroups = CatalogCommandIndex.groups()

    public init() {}

    public var body: some View {
        let activeTheme = Theme.preset(brand: brand, ground: ground, elevation: elevation)
        let activeMetrics = metrics

        ZStack {
            Group {
                if isCompactLayout {
                    compactShell(theme: activeTheme)
                } else {
                    regularShell(theme: activeTheme)
                }
            }
            if commandPaletteOpen {
                activeTheme.scrim
                    .ignoresSafeArea()
                    .onTapGesture { commandPaletteOpen = false }
                    .accessibilityHidden(true)
                CommandPaletteView(isPresented: $commandPaletteOpen, groups: commandGroups) { id in
                    applyCommand(id)
                }
                .frame(maxWidth: Self.paletteMaxSize.width, maxHeight: Self.paletteMaxSize.height)
                .padding(activeMetrics.loose)
                .accessibilityAddTraits(.isModal)
            }
        }
        .focusedSceneValue(\.catalogShowcaseActions, showcaseActions)
        .environment(\.componentTheme, activeTheme)
        .environment(\.componentMetrics, activeMetrics)
        .environment(\.layoutDirection, isRTL ? .rightToLeft : .leftToRight)
        .componentMotion(ComponentMotionConfiguration(speed: motionSpeed))
        .renderingPreferences(effectsEnabled: effectsEnabled, motionDisabled: reduceMotion)
    }

    private var metrics: ComponentMetrics { ComponentMetrics.preset(density: density, corners: corners) }

    private var showcaseActions: CatalogShowcaseActions {
        CatalogShowcaseActions(
            openCommandPalette: { commandPaletteOpen = true },
            toggleInspector: {
                if isCompactLayout { compactInspectorSheet.toggle() } else { inspectorOpen.toggle() }
            },
            selectBrand: { brand = $0 },
            selectGround: { ground = $0 },
            toggleReduceMotion: { reduceMotion.toggle() }
        )
    }

    private var isCompactLayout: Bool {
        #if os(macOS)
        return false
        #else
        return sizeClass == .compact
        #endif
    }

    private func regularShell(theme: Theme) -> some View {
        NavigationSplitView {
            sidebarList.navigationTitle("Cieo")
        } detail: {
            NavigationStack(path: $recipePath) {
                sectionDetail(selection ?? .overview, theme: theme)
                    .toolbar {
                        ToolbarItemGroup(placement: .primaryAction) {
                            commandSearchButton
                            Button { inspectorOpen.toggle() } label: {
                                Label("Inspector", systemImage: "slider.horizontal.3")
                            }
                        }
                    }
            }
        }
        .inspector(isPresented: $inspectorOpen) {
            inspectorControls.inspectorColumnWidth(min: 260, ideal: 300, max: 360)
        }
    }

    private func compactShell(theme: Theme) -> some View {
        TabView {
            compactTab(.overview, title: Self.compactTabTitles[0], symbol: "square.grid.2x2", theme: theme)
            compactTab(.themeStudio, title: Self.compactTabTitles[1], symbol: "paintpalette", theme: theme)
            NavigationStack {
                sidebarList
                    .navigationTitle(Self.compactTabTitles[2])
                    .navigationDestination(for: AdaptiveCatalogSection.self) { sectionDetail($0, theme: theme) }
                    .toolbar { compactToolbar }
            }
            .tabItem { Label(Self.compactTabTitles[2], systemImage: "square.stack.3d.up") }
            NavigationStack(path: $recipePath) {
                sectionDetail(.motionRecipes, theme: theme).toolbar { compactToolbar }
            }
            .tabItem { Label(Self.compactTabTitles[3], systemImage: "sparkles.rectangle.stack") }
            compactTab(.physicsLab, title: Self.compactTabTitles[4], symbol: "function", theme: theme)
        }
        .sheet(isPresented: $compactInspectorSheet) {
            NavigationStack {
                inspectorControls
                    .navigationTitle("Live Environment")
                    .toolbar { Button("Done") { compactInspectorSheet = false } }
            }
            .presentationDetents([.medium, .large])
        }
    }

    private func compactTab(_ section: AdaptiveCatalogSection, title: String, symbol: String, theme: Theme) -> some View {
        NavigationStack {
            sectionDetail(section, theme: theme).toolbar { compactToolbar }
        }
        .tabItem { Label(title, systemImage: symbol) }
    }

    @ToolbarContentBuilder
    private var compactToolbar: some ToolbarContent {
        ToolbarItemGroup(placement: .primaryAction) {
            commandSearchButton
            Button { compactInspectorSheet = true } label: {
                Label("Inspector", systemImage: "slider.horizontal.3")
            }
        }
    }

    private var commandSearchButton: some View {
        Button { commandPaletteOpen.toggle() } label: {
            Label("Command Search", systemImage: "command")
        }
        .keyboardShortcut("k", modifiers: .command)
    }

    private var sidebarList: some View {
        List(selection: $selection) {
            Section("Foundations") {
                sidebarRow(.overview)
                sidebarRow(.themeStudio)
            }
            Section("Library") {
                sidebarRow(.atoms)
                sidebarRow(.molecules)
                sidebarRow(.editorial)
                sidebarRow(.patterns)
                sidebarRow(.agentAndAuth)
                sidebarRow(.social)
            }
            Section("Motion & State") {
                sidebarRow(.motionRecipes)
                sidebarRow(.motionPlayground)
                sidebarRow(.physicsLab)
            }
        }
    }

    private func sidebarRow(_ item: AdaptiveCatalogSection) -> some View {
        NavigationLink(value: item) { Label(item.rawValue, systemImage: item.symbol) }
    }

    @ViewBuilder
    private func sectionDetail(_ section: AdaptiveCatalogSection, theme: Theme) -> some View {
        if section == .motionRecipes {
            LibraryCatalog()
        } else {
            ScrollView {
                VStack(alignment: .leading, spacing: metrics.section) {
                    switch section {
                    case .overview: overviewSpecimen
                    case .themeStudio: ThemeStudioView(brand: $brand, ground: $ground, elevation: $elevation)
                    case .atoms: AtomExamples()
                    case .molecules: MoleculeExamples()
                    case .editorial: EditorialExamples()
                    case .patterns: PatternExamples()
                    case .agentAndAuth: AgentAndAuthExamples()
                    case .social:
                        CommentsExamples(); EngagementExamples(); AudioPlaybackExamples()
                        AudioCaptureExamples(); MessagingFeedbackExamples()
                    case .motionPlayground: MotionExamples()
                    case .physicsLab: PhysicsLabView()
                    case .motionRecipes: EmptyView()
                    }
                }
                .padding(metrics.loose)
                .frame(maxWidth: Self.contentMaxWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
            }
            .background(theme.quietBackground)
            .navigationTitle(section.rawValue)
        }
    }

    private var overviewSpecimen: some View {
        VStack(alignment: .leading, spacing: metrics.section) {
            Specimen(title: "Cieo Design & Motion System") {
                HStack(alignment: .firstTextBaseline, spacing: metrics.section) {
                    BigNumber("\(MotionAtoms.all.count)", label: "motion recipes", role: .numeralMedium, layout: .stacked)
                    BigNumber("21", label: "brand × ground palettes", role: .numeralSmall, layout: .stacked)
                    BigNumber("24", label: "agent icon roles", role: .numeralSmall, layout: .stacked)
                }
                Notice(
                    LocalizedStringKey(Self.searchNoticeTitle(isCompact: isCompactLayout)),
                    detail: "Jump to any component section, open featured motion recipes, or switch brand and ground palettes instantly.",
                    tone: .info
                )
            }
            Specimen(title: "Explore Studios") {
                FlowStack(spacing: metrics.compact) {
                    ActionButton(isCompactLayout ? "Command Search" : "Command Search (⌘K)", emphasis: .prominent, sizing: .fitted) { commandPaletteOpen = true }
                    ActionButton("Theme Studio", emphasis: .quiet, sizing: .fitted) { selection = .themeStudio }
                    ActionButton("Agents & Auth", emphasis: .quiet, sizing: .fitted) { selection = .agentAndAuth }
                    ActionButton("Physics Lab", emphasis: .quiet, sizing: .fitted) { selection = .physicsLab }
                }
            }
        }
    }

    /// The ⌘K hint only makes sense where a hardware keyboard shortcut exists, so compact (iPhone) layouts drop it.
    public static func searchNoticeTitle(isCompact: Bool) -> String {
        isCompact ? "Use Command Search to jump anywhere" : "Press ⌘K for global command search"
    }

    private var inspectorControls: some View {
        Form {
            Section("Brand & Ground") {
                Picker("Brand", selection: $brand) {
                    ForEach(ThemeBrand.allCases, id: \.self) { Text($0.label).tag($0) }
                }
                Picker("Ground", selection: $ground) {
                    ForEach(ThemeGround.allCases, id: \.self) { Text($0.rawValue.capitalized).tag($0) }
                }
                Picker("Elevation", selection: $elevation) {
                    ForEach(ElevationStyle.allCases, id: \.self) { Text($0.rawValue.capitalized).tag($0) }
                }
            }
            Section("Geometry & Density") {
                Picker("Corners", selection: $corners) {
                    ForEach(CornerProfile.allCases, id: \.self) { Text($0.rawValue.capitalized).tag($0) }
                }
                Picker("Density", selection: $density) {
                    ForEach(ComponentDensity.allCases, id: \.self) { Text($0.rawValue.capitalized).tag($0) }
                }
            }
            Section("Direction & Motion") {
                Toggle("Right-to-left (RTL)", isOn: $isRTL)
                Toggle("Preview Reduce Motion", isOn: $reduceMotion)
                Toggle("Metal highlight shader", isOn: $effectsEnabled)
                Picker("Motion speed", selection: $motionSpeed) {
                    Text("1.0× Normal").tag(1.0)
                    Text("0.25× Slow").tag(0.25)
                    Text("0.1× Lab").tag(0.1)
                }
            }
        }
    }

    private func applyCommand(_ commandID: String) {
        guard let resolved = CatalogCommandIndex.resolve(commandID) else { return }
        switch resolved {
        case .section(let target):
            recipePath = []
            selection = target
        case .brand(let nextBrand):
            brand = nextBrand
        case .ground(let nextGround):
            ground = nextGround
        case .recipe(let atomID):
            selection = .motionRecipes
            recipePath = [atomID]
        }
    }
}
