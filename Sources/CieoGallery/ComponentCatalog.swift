import CieoUI
import SwiftUI

/// Local interactive fixtures are isolated from production components and auth.
struct FoundationCatalog: View {
    enum Category: String, CaseIterable {
        case motion = "Motion"
        case atoms = "Atoms"
        case molecules = "Molecules"
        case editorial = "Editorial"
        case patterns = "Patterns"
        case agents = "Agents & Auth"
        case social = "Social"
    }

    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var category = Category.motion
    @State private var settings = false
    @State private var effects = true
    @State private var reduceMotion = false
    @State private var usePreset = true
    @State private var brand = ThemeBrand.instrument
    @State private var ground = ThemeGround.paper

    init() {}

    static func resolvedTheme(usePreset: Bool, brand: ThemeBrand, ground: ThemeGround) -> Theme {
        usePreset ? Theme.preset(brand: brand, ground: ground, elevation: .ring) : Theme()
    }

    var body: some View {
        let activeTheme = Self.resolvedTheme(usePreset: usePreset, brand: brand, ground: ground)
        VStack(spacing: 0) {
            Picker("Category", selection: $category) {
                ForEach(Category.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }
            .modifier(CategoryPickerStyle(accessible: typeSize.isAccessibilitySize || Category.allCases.count > 5))
            .padding(.horizontal, 16).padding(.vertical, 12)
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    switch category {
                    case .motion: MotionExamples()
                    case .atoms: AtomExamples()
                    case .molecules: MoleculeExamples()
                    case .editorial: EditorialExamples()
                    case .patterns: PatternExamples()
                    case .agents: AgentAndAuthExamples()
                    case .social: SocialExamples()
                    }
                }
                .padding(16)
                .frame(maxWidth: 680)
                .frame(maxWidth: .infinity)
            }
            // Each section starts at the top; controls never disappear into the previous scroll offset.
            .id(category)
        }
        .background(activeTheme.quietBackground)
        .environment(\.componentTheme, activeTheme)
        .scrollDismissesKeyboard(.interactively)
        .navigationTitle("Components")
        .toolbar {
            Button("Rendering", systemImage: "slider.horizontal.3") { settings = true }
        }
        .sheet(isPresented: $settings) {
            NavigationStack {
                Form {
                    Section("Theme") {
                        Toggle("Use Cieo brand preset", isOn: $usePreset)
                        if usePreset {
                            Picker("Brand", selection: $brand) {
                                ForEach(ThemeBrand.allCases, id: \.self) { option in
                                    Text(option.label).tag(option)
                                }
                            }
                            Picker("Ground", selection: $ground) {
                                ForEach(ThemeGround.allCases, id: \.self) { option in
                                    Text(option.rawValue.capitalized).tag(option)
                                }
                            }
                        }
                    }
                    Section("Rendering") {
                        Toggle("Metal highlight", isOn: $effects)
                        Toggle("Preview reduced motion", isOn: $reduceMotion)
                        Text("System accessibility and Low Power Mode always take priority. Effects run only when you interact.")
                    }
                }
                .navigationTitle("Theme & Rendering")
                .toolbar { Button("Done") { settings = false } }
            }
        }
        .renderingPreferences(effectsEnabled: effects, motionDisabled: reduceMotion)
    }
}

/// The social, audio and engagement pieces, grouped so the catalog body stays small to type-check.
private struct SocialExamples: View {
    var body: some View {
        CommentsExamples()
        EngagementExamples()
        AudioPlaybackExamples()
        AudioCaptureExamples()
        MessagingFeedbackExamples()
    }
}

private struct CategoryPickerStyle: ViewModifier {
    let accessible: Bool
    func body(content: Content) -> some View {
        if accessible { content.pickerStyle(.menu) } else { content.pickerStyle(.segmented) }
    }
}
