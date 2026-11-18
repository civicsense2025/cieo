import CieoAtoms
import CieoUI
import SwiftUI

public typealias CatalogRoot = ComponentCatalog

/// Structured navigation destinations for CieoGallery's adaptive catalog shell.
public enum AdaptiveCatalogSection: String, CaseIterable, Identifiable, Hashable, Sendable {
    case overview = "Overview"
    case themeStudio = "Theme & Contrast Studio"
    case atoms = "Atoms"
    case molecules = "Molecules"
    case editorial = "Editorial & Display"
    case patterns = "Patterns & Organisms"
    case agentAndAuth = "Agents, Overlays & Auth"
    case social = "Social & Audio"
    case motionRecipes = "Motion Recipes"
    case motionPlayground = "Spring & Metal Playground"
    case physicsLab = "Physics & State Lab"

    public var id: String { rawValue }

    public var symbol: String {
        switch self {
        case .overview: "square.grid.2x2"
        case .themeStudio: "paintpalette"
        case .atoms: "circle.grid.cross"
        case .molecules: "rectangle.3.group"
        case .editorial: "textformat.size"
        case .patterns: "rectangle.stack"
        case .agentAndAuth: "cpu"
        case .social: "waveform.and.mic"
        case .motionRecipes: "sparkles.rectangle.stack"
        case .motionPlayground: "waveform.path.ecg"
        case .physicsLab: "function"
        }
    }
}

public struct ComponentCatalog: View {
    public init() {}
    public var body: some View {
        AdaptiveCatalogShell()
    }
}

/// Focused-scene command hooks allowing `CieoShowcase` menu commands to drive the active window's catalog shell.
public struct CatalogShowcaseActions {
    public var openCommandPalette: () -> Void
    public var toggleInspector: () -> Void
    public var selectBrand: (ThemeBrand) -> Void
    public var selectGround: (ThemeGround) -> Void
    public var toggleReduceMotion: () -> Void

    public init(
        openCommandPalette: @escaping () -> Void,
        toggleInspector: @escaping () -> Void,
        selectBrand: @escaping (ThemeBrand) -> Void,
        selectGround: @escaping (ThemeGround) -> Void,
        toggleReduceMotion: @escaping () -> Void
    ) {
        self.openCommandPalette = openCommandPalette
        self.toggleInspector = toggleInspector
        self.selectBrand = selectBrand
        self.selectGround = selectGround
        self.toggleReduceMotion = toggleReduceMotion
    }
}

private struct CatalogShowcaseActionsKey: FocusedValueKey {
    typealias Value = CatalogShowcaseActions
}

public extension FocusedValues {
    var catalogShowcaseActions: CatalogShowcaseActions? {
        get { self[CatalogShowcaseActionsKey.self] }
        set { self[CatalogShowcaseActionsKey.self] = newValue }
    }
}

/// Resolved navigation or theme action emitted by `CatalogCommandIndex` (`⌘K` Command Search).
public enum CatalogCommandAction: Equatable, Sendable {
    case section(AdaptiveCatalogSection)
    case brand(ThemeBrand)
    case ground(ThemeGround)
    case recipe(String)
}

/// Builds the global `⌘K` command search groups across `CieoUI` sections, theme presets, and featured `MotionAtoms`.
public enum CatalogCommandIndex {
    public static func groups(featuredCount: Int = 18) -> [CieoUI.CommandGroup] {
        let sectionItems = AdaptiveCatalogSection.allCases.map { section in
            CommandItem(
                id: "section:\(section.rawValue)",
                title: section.rawValue,
                icon: .command,
                keywords: keywords(for: section)
            )
        }

        let brandItems = ThemeBrand.allCases.map { brand in
            CommandItem(
                id: "brand:\(brand.rawValue)",
                title: "Brand: \(brand.label)",
                icon: .selected,
                keywords: ["theme", "brand", "palette", brand.rawValue, brand.label]
            )
        }
        let groundItems = ThemeGround.allCases.map { ground in
            CommandItem(
                id: "ground:\(ground.rawValue)",
                title: "Ground: \(ground.rawValue.capitalized)",
                icon: .unselected,
                keywords: ["theme", "ground", "surface", ground.rawValue]
            )
        }

        let sortedAtoms = MotionAtoms.all.sorted {
            $0.info.id.localizedStandardCompare($1.info.id) == .orderedAscending
        }
        let strideStep = max(1, sortedAtoms.count / max(1, featuredCount))
        var featured: [MotionAtom] = []
        var idx = 0
        while featured.count < max(0, featuredCount) && idx < sortedAtoms.count {
            featured.append(sortedAtoms[idx])
            idx += strideStep
        }
        let recipeItems = featured.map { atom in
            CommandItem(
                id: "recipe:\(atom.id)",
                title: "\(atom.info.name) (\(atom.info.category))",
                icon: .play,
                keywords: [atom.id, atom.info.category, atom.info.summary] + atom.info.families
            )
        }

        return [
            CieoUI.CommandGroup(id: "sections", title: "Sections & Studios", items: sectionItems),
            CieoUI.CommandGroup(id: "themes", title: "Theme Brand & Ground", items: brandItems + groundItems),
            CieoUI.CommandGroup(id: "recipes", title: "Featured Motion Recipes", items: recipeItems),
        ]
    }

    public static func resolve(_ commandID: String) -> CatalogCommandAction? {
        if commandID.hasPrefix("section:") {
            let raw = String(commandID.dropFirst("section:".count))
            return AdaptiveCatalogSection(rawValue: raw).map(CatalogCommandAction.section)
        }
        if commandID.hasPrefix("brand:") {
            let raw = String(commandID.dropFirst("brand:".count))
            return ThemeBrand(rawValue: raw).map(CatalogCommandAction.brand)
        }
        if commandID.hasPrefix("ground:") {
            let raw = String(commandID.dropFirst("ground:".count))
            return ThemeGround(rawValue: raw).map(CatalogCommandAction.ground)
        }
        if commandID.hasPrefix("recipe:") {
            let raw = String(commandID.dropFirst("recipe:".count))
            return raw.isEmpty ? nil : .recipe(raw)
        }
        return nil
    }

    private static func keywords(for section: AdaptiveCatalogSection) -> [String] {
        switch section {
        case .overview: ["home", "summary", "catalog"]
        case .themeStudio: ["wcag", "contrast", "brand", "ground", "palette", "studio"]
        case .atoms: ["button", "chip", "ring", "status", "atom"]
        case .molecules: ["field", "notice", "tabs", "search", "molecule"]
        case .editorial: ["numeral", "cut", "pathway", "rail", "rollcall"]
        case .patterns: ["state", "task", "empty", "recovery"]
        case .agentAndAuth: ["agent", "approval", "tool", "toast", "sheet", "otp", "password", "command"]
        case .social: ["audio", "voice", "comment", "poll", "reaction", "chat"]
        case .motionRecipes: ["atoms", "550", "recipes", "library"]
        case .motionPlayground: ["metal", "shader", "highlight", "spring"]
        case .physicsLab: ["charts", "superposition", "velocity", "rubberband", "haptics", "physics"]
        }
    }
}
