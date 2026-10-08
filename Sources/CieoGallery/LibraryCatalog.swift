import CieoAtoms
import SwiftUI

/// Browse metadata only. A live recipe is created after opening its preview.
struct LibraryCatalog: View {
    private enum Scope: String, CaseIterable { case all = "All", saved = "Saved", recent = "Recent" }
    private static let recipes = MotionAtoms.all.sorted { $0.info.name.localizedStandardCompare($1.info.name) == .orderedAscending }
    @AppStorage("catalog.saved") private var savedIDs = ""
    @AppStorage("catalog.recent") private var recentIDs = ""
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var query = ""
    @State private var category: String?
    @State private var scope = Scope.all
    @State private var categoriesPresented = false

    private var saved: Set<String> {
        Set(savedIDs.split(separator: "|").map(String.init))
    }

    private var recent: [String] {
        recentIDs.split(separator: "|").map(String.init)
    }

    private var results: [MotionAtom] {
        let available = scope == .recent ? recent.compactMap { id in Self.recipes.first { $0.id == id } } : Self.recipes
        return available.filter {
            (category == nil || $0.info.category == category) &&
                (scope != .saved || saved.contains($0.id)) && $0.info.matches(query)
        }
    }

    var body: some View {
        List {
            Section {
                NavigationLink {
                    FoundationCatalog()
                } label: {
                    Label("Foundations & controls", systemImage: "square.stack.3d.up")
                        .padding(.vertical, 8)
                }
                Picker("Library scope", selection: $scope) {
                    ForEach(Scope.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                }
                .modifier(LibraryPickerStyle(accessible: typeSize.isAccessibilitySize))
                .listRowSeparator(.hidden)
                Button { categoriesPresented = true } label: {
                    HStack {
                        Label(category ?? "All categories", systemImage: "line.3.horizontal.decrease")
                        Spacer()
                        Text("\(results.count)").monospacedDigit().foregroundStyle(.secondary)
                        Image(systemName: "chevron.down").font(.caption)
                    }.padding(.vertical, 8)
                }
                .foregroundStyle(.primary)
                .accessibilityIdentifier("library.categories")
            } header: {
                Text("\(Self.recipes.count) motion recipes")
            }
            Section {
                ForEach(results) { recipe in
                    NavigationLink(value: recipe.id) {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(recipe.info.name).font(.headline)
                                if saved.contains(recipe.id) {
                                    Image(systemName: "bookmark.fill").font(.caption).accessibilityLabel("Saved")
                                }
                            }
                            Text(recipe.info.category).font(.caption).foregroundStyle(.secondary)
                            Text(recipe.info.summary).font(.subheadline).foregroundStyle(.secondary).lineLimit(2)
                        }.padding(.vertical, 8)
                    }
                    .accessibilityIdentifier("library.\(recipe.id)")
                    .listRowSeparator(.hidden)
                    .swipeActions {
                        Button(saved.contains(recipe.id) ? "Unsave" : "Save", systemImage: "bookmark") { toggleSaved(recipe.id) }
                            .tint(.secondary)
                    }
                }
                if results.isEmpty {
                    ContentUnavailableView {
                        Label(scope == .saved && query.isEmpty ? "No saved recipes" : "No matching recipes", systemImage: "magnifyingglass")
                    } description: {
                        Text(scope == .saved && query.isEmpty ? "Save a recipe from its preview to find it here." : "Try a different search or clear your filters.")
                    } actions: {
                        Button("Show all recipes") { query = ""; category = nil; scope = .all }
                    }
                }
            }
        }
        .listStyle(.plain)
        .scrollDismissesKeyboard(.interactively)
        .searchable(text: $query, prompt: "Search all recipes")
        .navigationTitle("Library")
        .sheet(isPresented: $categoriesPresented) {
            CategoryBrowser(recipes: Self.recipes, selection: $category)
        }
        .navigationDestination(for: String.self) { id in
            if let recipe = Self.recipes.first(where: { $0.id == id }) {
                RecipePreview(recipe: recipe, isSaved: saved.contains(id)) { toggleSaved(id) }
                    .onAppear { recentIDs = ([id] + recent.filter { $0 != id }).prefix(20).joined(separator: "|") }
            }
        }
    }

    private func toggleSaved(_ id: String) {
        var next = saved
        if next.contains(id) { next.remove(id) } else { next.insert(id) }
        // Persist only identities from this catalogue; recipe content and running state stay transient.
        savedIDs = Self.recipes.map(\.id).filter { next.contains($0) }.joined(separator: "|")
    }
}

private struct LibraryPickerStyle: ViewModifier {
    let accessible: Bool
    func body(content: Content) -> some View {
        if accessible { content.pickerStyle(.menu) } else { content.pickerStyle(.segmented) }
    }
}
