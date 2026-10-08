import CieoAtoms
import SwiftUI

/// Metadata-only rows keep every recipe discoverable without starting its animation or task.
struct LibraryCatalog: View {
    @State private var query = ""
    @State private var category = "All categories"
    private let recipes = MotionAtoms.all.sorted { $0.info.name.localizedStandardCompare($1.info.name) == .orderedAscending }

    private var categories: [String] {
        Set(recipes.map(\.info.category)).sorted()
    }

    private var results: [MotionAtom] {
        recipes.filter { recipe in
            (category == "All categories" || recipe.info.category == category) &&
                (query.isEmpty || [recipe.info.name, recipe.info.category, recipe.info.id, recipe.info.summary]
                    .contains { $0.localizedCaseInsensitiveContains(query) })
        }
    }

    var body: some View {
        List {
            Section {
                Text("\(recipes.count) motion recipes").font(.title.bold())
                Picker("Category", selection: $category) {
                    Text("All categories").tag("All categories")
                    ForEach(categories, id: \.self) { Text($0).tag($0) }
                }
                NavigationLink("Foundations & controls") { FoundationCatalog() }
            }
            Section("\(results.count) results") {
                ForEach(results) { recipe in
                    NavigationLink(value: recipe.id) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(recipe.info.name).font(.headline)
                            Text(recipe.info.category).font(.caption).foregroundStyle(.secondary)
                        }.padding(.vertical, 6)
                    }
                    .accessibilityIdentifier("library.\(recipe.id)")
                    .listRowSeparator(.hidden)
                }
                if results.isEmpty {
                    ContentUnavailableView.search(text: query)
                }
            }
        }
        .listStyle(.plain)
        .searchable(text: $query, prompt: "Search all recipes")
        .navigationTitle("Motion library")
        .navigationDestination(for: String.self) { id in
            if let recipe = recipes.first(where: { $0.id == id }) {
                RecipePreview(recipe: recipe)
            }
        }
    }
}

private struct RecipePreview: View {
    let recipe: MotionAtom
    @Environment(\.scenePhase) private var phase
    @State private var wide = false
    @State private var replay = 0

    var body: some View {
        GeometryReader { geometry in
            ScrollView([.horizontal, .vertical]) {
                VStack(alignment: .leading, spacing: 24) {
                    if phase == .active {
                        // Instantiate only the selected recipe; navigation releases its view hierarchy.
                        recipe.make().id(replay)
                            .frame(minHeight: 360)
                            .accessibilityIdentifier("recipe.\(recipe.id)")
                    } else {
                        Text("Preview paused while the app is inactive.")
                    }
                    DisclosureGroup("Recipe notes") {
                        Text(recipe.info.summary).font(.subheadline).foregroundStyle(.secondary)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 24)
                .frame(width: wide ? max(760, geometry.size.width) : max(320, geometry.size.width))
            }
        }
        .navigationTitle(recipe.info.name)
        .toolbar {
            Button("Replay", systemImage: "arrow.clockwise") { replay += 1 }
            Button(wide ? "Compact preview" : "Wide preview", systemImage: "arrow.left.and.right") { wide.toggle() }
        }
    }
}
