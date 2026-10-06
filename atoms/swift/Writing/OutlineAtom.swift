import SwiftUI
import Cieo

public struct OutlineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "outline", category: "Writing", name: "Outline zoom",
        summary: "Zooming swaps the breadcrumb trail. The opened branch grows from almost full size. Its children land one after another while the old siblings wash out. Back walks the same path in reverse.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var path: [String] = []
    @State private var tweak = true
    private let kids = ["Opening image", "Cold open", "Thesis"]
    private let grand = ["Market at dawn", "The bell"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a child to zoom in") {
            VStack(alignment: .leading, spacing: 8) {
                Text(path.isEmpty ? "Spring essay" : "Spring essay / \(path[0])")
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .id(path.count).motionTransition(.swap())
                    .animation(reduce ? nil : .motion(.base), value: path)
                VStack(alignment: .leading, spacing: 8) {
                    Text(path.first ?? "Spring essay").font(.system(size: 15, weight: .semibold))
                    ForEach(Array(current.enumerated()), id: \.element) { i, k in
                        Button(k) { zoom(k) }.buttonStyle(.bordered).frame(minHeight: 32)
                            .opacity(1)
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.03), value: path)
                    }
                }
                .padding(14)
                .background(.quaternary.opacity(0.2), in: RoundedRectangle(cornerRadius: 10))
                .scaleEffect(path.isEmpty ? 1 : 1, anchor: .topLeading)
                .animation(reduce ? nil : .motion(.base), value: path)
                Text("Winter notes · Reading list · Drafts").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .opacity(path.isEmpty ? 1 : 0)
                    .animation(reduce ? nil : .motion(.base), value: path)
                HStack {
                    Button("Back") { withMotion(.base, reduceMotion: reduce) { path = [] } }.buttonStyle(.bordered).frame(minHeight: 32)
                    Spacer()
                    Button("1") { withMotion(.base, reduceMotion: reduce) { path = [] } }.buttonStyle(.bordered).frame(minHeight: 32)
                    Button("2") { withMotion(.base, reduceMotion: reduce) { path = ["Opening image"] } }.buttonStyle(.bordered).frame(minHeight: 32)
                }
                Toggle("Zoom to child", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .frame(maxWidth: 320)
        }
    }

    private var current: [String] { path.isEmpty ? kids : grand }

    private func zoom(_ k: String) {
        if path.isEmpty { withMotion(.base, reduceMotion: reduce) { path = [k] } }
    }
}
