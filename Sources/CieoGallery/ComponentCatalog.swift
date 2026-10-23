import CieoUI
import SwiftUI

/// Local interactive fixtures are isolated from production components and auth.
struct FoundationCatalog: View {
    private enum Category: String, CaseIterable { case motion = "Motion", atoms = "Atoms", molecules = "Molecules", patterns = "Patterns", social = "Social" }
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var category = Category.motion
    @State private var settings = false
    @State private var effects = true
    @State private var reduceMotion = false

    init() {}

    var body: some View {
        VStack(spacing: 0) {
            Picker("Category", selection: $category) {
                ForEach(Category.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }
            .modifier(CategoryPickerStyle(accessible: typeSize.isAccessibilitySize))
            .padding(.horizontal, 16).padding(.vertical, 12)
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    switch category {
                    case .motion: MotionExamples()
                    case .atoms: AtomExamples()
                    case .molecules: MoleculeExamples()
                    case .patterns: PatternExamples()
                    case .social:
                        CommentsExamples()
                        EngagementExamples()
                        AudioPlaybackExamples()
                        AudioCaptureExamples()
                        MessagingFeedbackExamples()
                    }
                }
                .padding(16)
                .frame(maxWidth: 680)
                .frame(maxWidth: .infinity)
            }
            // Each section starts at the top; controls never disappear into the previous scroll offset.
            .id(category)
        }
        .background(.background)
        .scrollDismissesKeyboard(.interactively)
        .navigationTitle("Components")
        .toolbar {
            Button("Rendering", systemImage: "slider.horizontal.3") { settings = true }
        }
        .sheet(isPresented: $settings) {
            NavigationStack {
                Form {
                    Toggle("Metal highlight", isOn: $effects)
                    Toggle("Preview reduced motion", isOn: $reduceMotion)
                    Text("System accessibility and Low Power Mode always take priority. Effects run only when you interact.")
                }
                .navigationTitle("Rendering")
                .toolbar { Button("Done") { settings = false } }
            }
        }
        .renderingPreferences(effectsEnabled: effects, motionDisabled: reduceMotion)
    }
}

private struct CategoryPickerStyle: ViewModifier {
    let accessible: Bool
    func body(content: Content) -> some View {
        if accessible { content.pickerStyle(.menu) } else { content.pickerStyle(.segmented) }
    }
}
