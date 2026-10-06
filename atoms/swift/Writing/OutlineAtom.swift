import SwiftUI
import Cieo

public struct OutlineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "outline", category: "Writing", name: "Outline zoom",
        summary: "Zooming swaps the breadcrumb trail. The opened branch grows from almost full size. Its children land one after another while the old siblings wash out. Back walks the same path in reverse.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var path: [String] = []
    private let kids = ["Opening image", "Cold open", "Thesis"]
    private let grand = ["Market at dawn", "The bell"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a child to zoom in") {
            VStack(alignment: .leading, spacing: 10) {
                Text(path.isEmpty ? "Spring essay" : "Spring essay / \(path[0])")
                    .font(.caption).foregroundStyle(.secondary)
                    .id(path.count).motionTransition(.swap())
                    .animation(reduce ? nil : .motion(.base), value: path)
                VStack(alignment: .leading, spacing: 6) {
                    Text(path.first ?? "Spring essay").font(.headline)
                    ForEach(Array(current.enumerated()), id: \.element) { i, k in
                        Button(k) { zoom(k) }.buttonStyle(.bordered)
                            .opacity(1)
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.03), value: path)
                    }
                }
                .padding(14)
                .background(.quaternary.opacity(0.2), in: RoundedRectangle(cornerRadius: 10))
                .scaleEffect(path.isEmpty ? 1 : 1, anchor: .topLeading)
                .animation(reduce ? nil : .motion(.base), value: path)
                Text("Winter notes · Reading list · Drafts").font(.caption).foregroundStyle(.secondary)
                    .opacity(path.isEmpty ? 1 : 0)
                    .animation(reduce ? nil : .motion(.base), value: path)
                HStack {
                    Button("Back") { withMotion(.base, reduceMotion: reduce) { path = [] } }.buttonStyle(.bordered)
                    Spacer()
                    Button("1") { withMotion(.base, reduceMotion: reduce) { path = [] } }.buttonStyle(.bordered)
                    Button("2") { withMotion(.base, reduceMotion: reduce) { path = ["Opening image"] } }.buttonStyle(.bordered)
                }
            }
            .frame(maxWidth: 320)
        }
    }

    private var current: [String] { path.isEmpty ? kids : grand }

    private func zoom(_ k: String) {
        if path.isEmpty { withMotion(.base, reduceMotion: reduce) { path = [k] } }
    }
}
