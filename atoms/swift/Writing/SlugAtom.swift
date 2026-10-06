import SwiftUI
import Cieo

public struct SlugAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "slug", category: "Writing", name: "Slug renamer",
        summary: "The field stretches or shrinks to fit as you type. The old slug blurs into the new one. A taken slug rings red and says so.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var title = "The fee hike nobody voted on"
    @State private var tweak = true
    private let taken: Set<String> = ["water-rates", "fee-hike"]
    public init() {}
    private var slug: String {
        let s = title.lowercased().components(separatedBy: CharacterSet.alphanumerics.inverted).filter { !$0.isEmpty }.joined(separator: "-")
        return s.isEmpty ? "untitled" : s
    }
    private var isTaken: Bool { taken.contains(slug) }

    public var body: some View {
        AtomStage(hint: "Try “Water rates” — that slug is taken") {
            VStack(alignment: .leading, spacing: 8) {
                TextField("Post title", text: $title).textFieldStyle(.roundedBorder).frame(maxWidth: 340)
                    .accessibilityLabel("Post title")
                HStack(spacing: 8) {
                    Text("/posts/").foregroundStyle(.secondary)
                    Text(slug).font(.system(size: 14).monospaced()).padding(8).padding(.horizontal, 4)
                        .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 8))
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(isTaken ? .red : .clear, lineWidth: 2))
                        .shadow(color: isTaken ? .red.opacity(0.45) : .clear, radius: isTaken ? 6 : 0)
                        .id(slug).motionTransition(.swap())
                    Text(isTaken ? "taken — try another" : "").font(.system(size: 12.5)).foregroundStyle(.red)
                }
                .frame(maxWidth: 340, alignment: .leading)
                .animation(reduce ? nil : .motion(.base), value: slug)
                .animation(reduce ? nil : .motion(.snap), value: isTaken)
                Toggle("Check availability", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
                Button("Rename") { withMotion(.base, reduceMotion: reduce) { title = title == "Water rates" ? "The fee hike nobody voted on" : "Water rates" } }
                    .buttonStyle(.borderedProminent).frame(minHeight: 32)
            }
        }
    }
}
