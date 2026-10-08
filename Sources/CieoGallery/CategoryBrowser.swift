import CieoAtoms
import SwiftUI

struct CategoryBrowser: View {
    let recipes: [MotionAtom]
    @Binding var selection: String?
    @Environment(\.dismiss) private var dismiss
    @State private var query = ""

    private var categories: [String] {
        Set(recipes.map(\.info.category)).sorted().filter { query.isEmpty || $0.localizedStandardContains(query) }
    }

    var body: some View {
        NavigationStack {
            List {
                categoryRow("All categories", value: nil, count: recipes.count)
                ForEach(categories, id: \.self) { category in
                    categoryRow(category, value: category, count: recipes.filter { $0.info.category == category }.count)
                }
                if categories.isEmpty { ContentUnavailableView.search(text: query) }
            }
            .searchable(text: $query, prompt: "Find a category")
            .navigationTitle("Categories")
            .toolbar { Button("Done") { dismiss() } }
        }
    }

    private func categoryRow(_ name: String, value: String?, count: Int) -> some View {
        Button { selection = value; dismiss() } label: {
            HStack {
                Text(name)
                Spacer()
                Text("\(count)").foregroundStyle(.secondary).monospacedDigit()
                if selection == value { Image(systemName: "checkmark").accessibilityLabel("Selected") }
            }.padding(.vertical, 8)
        }.foregroundStyle(.primary)
    }
}
