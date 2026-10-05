import SwiftUI
import MotionKit

public struct DisclosureGroupAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "disclosure", category: "Admin kit", name: "Disclosure group",
        summary: "Each group is its own spring, never tied to a sibling: the body height follows the measured content, the chevron turns a quarter on the same spring and the content fades in with the height. Spacing holds two nested groups that open and close independently, and the parent’s height follows whatever they are doing. Like the editor’s preference store, only your toggles are remembered; Reset returns every group to its default.")

    private let defaults: [String: Bool] = ["Appearance": true, "Spacing": true, "Inner": false, "Outer": true, "Typography": false]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open: [String: Bool] = ["Appearance": true, "Spacing": true, "Inner": false, "Outer": true, "Typography": false]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open groups independently") {
            VStack(alignment: .leading, spacing: 0) {
                group("Appearance") { Text("Theme, accent colour and density.").font(.footnote).foregroundStyle(.secondary).padding(.vertical, 8) }
                group("Spacing") {
                    VStack(alignment: .leading, spacing: 0) {
                        group("Outer") { Text("Page margins: 24 px.").font(.footnote).foregroundStyle(.secondary).padding(.vertical, 8) }
                        group("Inner") { Text("Gap between blocks: 12 px.\nGap inside cards: 8 px.").font(.footnote).foregroundStyle(.secondary).padding(.vertical, 8) }
                    }.padding(.leading, 14)
                }
                group("Typography") { Text("Heading and body fonts.").font(.footnote).foregroundStyle(.secondary).padding(.vertical, 8) }
                Button("Reset") { withMotion(.base, reduceMotion: reduce) { open = defaults } }.buttonStyle(.bordered).controlSize(.small).padding(.top, 10)
            }.frame(width: 300, alignment: .topLeading).animation(nil, value: open)
        }
    }

    private func group<C: View>(_ key: String, @ViewBuilder _ content: () -> C) -> some View {
        let isOpen = open[key] ?? false
        return VStack(alignment: .leading, spacing: 0) {
            Button { withMotion(.base, reduceMotion: reduce) { open[key] = !isOpen } } label: {
                HStack { Image(systemName: "chevron.right").font(.caption.weight(.bold)).rotationEffect(.degrees(isOpen ? 90 : 0)); Text(key).font(.footnote.weight(.semibold)); Spacer() }.frame(height: 32).contentShape(Rectangle())
            }.buttonStyle(.plain).accessibilityValue(isOpen ? "Expanded" : "Collapsed")
            EditorHeightReveal(progress: isOpen ? 1 : 0) { content().padding(.leading, 18).frame(maxWidth: .infinity, alignment: .leading) }.clipped().opacity(isOpen ? 1 : 0)
            Divider()
        }
    }
}
