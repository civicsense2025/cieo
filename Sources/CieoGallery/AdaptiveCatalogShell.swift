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
    @State private var corners: CornerProfile = .soft
    @State private var density: ComponentDensity = .comfortable
    @State private var elevation: ElevationStyle = .ring
    @State private var isRTL = false
    @State private var reduceMotion = false
    @State private var effectsEnabled = true
    @State private var motionSpeed: Double = 1.0
    @State private var inspectorOpen = true
    @State private var compactInspectorSheet = false
    @State private var commandPaletteOpen = false

    private let commandGroups = CatalogCommandIndex.groups()

    public init() {}

    public var body: some View {
        let activeTheme = Theme.preset(brand: brand, ground: ground, elevation: elevation)
        let activeMetrics = ComponentMetrics.preset(density: density, corners: corners)

        ZStack {
            Group {
                if isCompactLayout {
                    compactShell(theme: activeTheme)
                } else {
                    regularShell(theme: activeTheme)
                }
            }
            if commandPaletteOpen {
                Color.black.opacity(0.28)
                    .ignoresSafeArea()
                    .onTapGesture { commandPaletteOpen = false }
                    .accessibilityHidden(true)
                CommandPaletteView(isPresented: $commandPaletteOpen, groups: commandGroups) { id in
                    applyCommand(id)
                }
                .frame(maxWidth: 540, maxHeight: 420)
                .padding(20)
            }
        }
        .focusedSceneValue(\.catalogShowcaseActions, showcaseActions)
        .environment(\.componentTheme, activeTheme)
        .environment(\.componentMetrics, activeMetrics)
        .environment(\.layoutDirection, isRTL ? .rightToLeft : .leftToRight)
        .componentMotion(ComponentMotionConfiguration(speed: motionSpeed))
        .renderingPreferences(effectsEnabled: effectsEnabled, motionDisabled: reduceMotion)
    }

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
            compactTab(.overview, title: "Overview", symbol: "square.grid.2x2", theme: theme)
            compactTab(.themeStudio, title: "Studio", symbol: "paintpalette", theme: theme)
            NavigationStack {
                sidebarList
                    .navigationTitle("Components")
                    .navigationDestination(for: AdaptiveCatalogSection.self) { sectionDetail($0, theme: theme) }
                    .toolbar { compactToolbar }
            }
            .tabItem { Label("Components", systemImage: "square.stack.3d.up") }
            NavigationStack(path: $recipePath) {
                sectionDetail(.motionRecipes, theme: theme).toolbar { compactToolbar }
            }
            .tabItem { Label("Recipes", systemImage: "sparkles.rectangle.stack") }
            compactTab(.physicsLab, title: "Physics", symbol: "function", theme: theme)
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
            Section("Components") {
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
                VStack(alignment: .leading, spacing: 24) {
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
                .padding(20)
                .frame(maxWidth: 760, alignment: .leading)
                .frame(maxWidth: .infinity)
            }
            .background(theme.quietBackground)
            .navigationTitle(section.rawValue)
        }
    }

    private var overviewSpecimen: some View {
        VStack(alignment: .leading, spacing: 24) {
            Specimen(title: "Cieo Design & Motion System") {
                HStack(alignment: .firstTextBaseline, spacing: 24) {
                    BigNumber("\(MotionAtoms.all.count)", label: "motion recipes", role: .numeralMedium, layout: .stacked)
                    BigNumber("21", label: "brand × ground palettes", role: .numeralSmall, layout: .stacked)
                    BigNumber("24", label: "agent icon roles", role: .numeralSmall, layout: .stacked)
                }
                Notice(
                    "Press ⌘K for global command search",
                    detail: "Jump to any component section, open featured motion recipes, or switch brand and ground palettes instantly.",
                    tone: .info
                )
            }
            Specimen(title: "Explore Studios") {
                FlowStack(spacing: 8) {
                    ActionButton("Command Search (⌘K)", emphasis: .prominent, sizing: .fitted) { commandPaletteOpen = true }
                    ActionButton("Theme Studio", emphasis: .quiet, sizing: .fitted) { selection = .themeStudio }
                    ActionButton("Agents & Auth", emphasis: .quiet, sizing: .fitted) { selection = .agentAndAuth }
                    ActionButton("Physics Lab", emphasis: .quiet, sizing: .fitted) { selection = .physicsLab }
                }
            }
        }
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
