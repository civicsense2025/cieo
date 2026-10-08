import CieoAtoms
import SwiftUI

struct RecipePreview: View {
    let recipe: MotionAtom
    let isSaved: Bool
    let toggleSaved: () -> Void
    @Environment(\.scenePhase) private var phase
    @Environment(\.accessibilityReduceTransparency) private var opaque
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var paused = false
    @State private var replay = 0
    @State private var notesPresented = false

    var body: some View {
        ScrollView(.vertical) {
            VStack(alignment: .leading, spacing: 16) {
                Text(recipe.info.category.uppercased())
                    .font(.caption.weight(.medium)).foregroundStyle(.secondary)
                if phase == .active, !paused {
                    recipe.make().id(replay)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .accessibilityIdentifier("recipe.\(recipe.id)")
                } else {
                    ContentUnavailableView("Preview paused", systemImage: "pause.circle", description: Text("Resume to start a fresh example."))
                        .frame(minHeight: 280)
                }
            }
            .padding(16)
            .frame(maxWidth: 680)
            .frame(maxWidth: .infinity, alignment: .top)
        }
        // The canvas never animates or pans. Motion belongs to the selected specimen.
        .background(.background)
        .scrollDismissesKeyboard(.interactively)
        .navigationTitle(recipe.info.name)
        .toolbar {
            Button(isSaved ? "Unsave recipe" : "Save recipe", systemImage: isSaved ? "bookmark.fill" : "bookmark", action: toggleSaved)
            Button("Recipe notes", systemImage: "info.circle") { notesPresented = true }
        }
        .safeAreaInset(edge: .bottom) {
            previewActions.padding(.horizontal, 16).padding(.vertical, 8)
        }
        .sheet(isPresented: $notesPresented) {
            NavigationStack {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text(recipe.info.category).font(.subheadline).foregroundStyle(.secondary)
                        Text(recipe.info.summary)
                        Text("This is an interactive local example. Actions don't change an account or send data.")
                            .font(.subheadline).foregroundStyle(.secondary)
                    }.padding(24).frame(maxWidth: 560, alignment: .leading)
                }
                .navigationTitle("Recipe notes")
                .toolbar { Button("Done") { notesPresented = false } }
            }
        }
    }

    @ViewBuilder private var previewActions: some View {
        if #available(iOS 26, macOS 26, *), !opaque {
            GlassEffectContainer(spacing: 16) {
                actions.buttonStyle(.glass)
            }
        } else {
            actions.buttonStyle(.bordered)
                .padding(8).background(.background, in: .rect(cornerRadius: 20))
        }
    }

    private var actions: some View {
        let layout = typeSize.isAccessibilitySize ? AnyLayout(VStackLayout(spacing: 8)) : AnyLayout(HStackLayout(spacing: 16))
        return layout {
            Button(paused ? "Resume" : "Pause", systemImage: paused ? "play.fill" : "pause.fill") { paused.toggle() }
                .frame(maxWidth: .infinity, minHeight: 44)
            Button("Replay", systemImage: "arrow.clockwise") { paused = false; replay += 1 }
                .frame(maxWidth: .infinity, minHeight: 44)
        }
        .labelStyle(.titleAndIcon)
        .font(.body)
    }
}
