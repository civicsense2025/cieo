import SwiftUI
import MotionKit

public struct AgentInspectAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentinspect", category: "Agent activity", name: "Agent inspect element",
        summary: "The outline snaps to the element’s box with its leading edge first and the trailing edge a beat behind, so the box visibly stretches between elements while the size readout counts to the new values. The label chip follows the top-left corner, then the inspector swaps and its accessibility checks arrive 45ms apart with the failing ones marked by shape (check, bang, cross). Inspected elements keep a result badge. Click any element, or switch Agent drives off, to take over.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [String: CGRect] = [:]
    @State private var current = "heading"
    @State private var drives = true
    @State private var checks = 0
    @State private var done: Set<String> = []
    public init() {}

    private let order = ["heading", "field", "button", "link"]
    private let results: [String: [(String, String)]] = [
        "heading": [("Has a heading role", "checkmark"), ("Contrast 7.2:1", "checkmark")],
        "field": [("Has a label", "exclamationmark"), ("Contrast 3.1:1", "xmark"), ("Focus ring visible", "checkmark")],
        "button": [("Name is Create workspace", "checkmark"), ("Target size 44 pt", "exclamationmark")],
        "link": [("Name is vague", "exclamationmark"), ("Contrast 5.4:1", "checkmark")],
    ]

    public var body: some View {
        AtomStage(hint: "Tap an element to take over from the agent") {
            HStack(alignment: .top, spacing: 10) {
                ZStack(alignment: .topLeading) {
                    AgMockPage().allowsHitTesting(false)
                    if let f = frames[current] { AgFrameRing(frame: f) }
                    ForEach(order, id: \.self) { k in
                        if let f = frames[k] {
                            Color.clear.frame(width: f.width, height: f.height).contentShape(Rectangle()).offset(x: f.minX, y: f.minY)
                                .onTapGesture { drives = false; select(k) }.accessibilityLabel("Inspect \(k)")
                                .overlay(alignment: .topTrailing) { if done.contains(k) && k != current { Image(systemName: "checkmark.seal.fill").font(.caption2).foregroundStyle(.green).offset(x: f.minX + f.width - 8, y: f.minY - 6) } }
                        }
                    }
                }
                .agFrames($frames).frame(width: 190)
                AgCard {
                    VStack(alignment: .leading, spacing: 6) {
                        HStack { AgentMark(size: 14); Text("Inspector").font(.caption.weight(.semibold)); Spacer() }
                        HStack(spacing: 2) { RollingDigits(Int(frames[current]?.width ?? 0)); Text("×"); RollingDigits(Int(frames[current]?.height ?? 0)) }.font(.caption.monospacedDigit())
                        let rs = results[current] ?? []
                        ForEach(rs.indices, id: \.self) { i in
                            if checks > i {
                                Label(rs[i].0, systemImage: rs[i].1 == "checkmark" ? "checkmark.circle" : rs[i].1 == "xmark" ? "xmark.circle" : "exclamationmark.triangle")
                                    .font(.caption).foregroundStyle(rs[i].1 == "checkmark" ? Color.green : rs[i].1 == "xmark" ? .red : .orange)
                                    .transition(.opacity.combined(with: .move(edge: .top)))
                            }
                        }
                        Toggle("Agent drives", isOn: $drives).font(.caption).toggleStyle(.switch).controlSize(.mini)
                    }.frame(width: 150, alignment: .leading)
                }
            }
        }
        .task(id: drives) {
            guard drives else { return }
            var i = 0
            while !Task.isCancelled && drives {
                if !frames.isEmpty { select(order[i % order.count]) }
                i += 1
                try? await Task.sleep(nanoseconds: 2_200_000_000)
            }
        }
        .animation(reduce ? nil : .motion(.base), value: checks)
    }

    private func select(_ k: String) {
        withMotion(.base, reduceMotion: reduce) { current = k; checks = 0 }
        let n = results[k]?.count ?? 0
        Task { @MainActor in
            for i in 1...max(1, n) {
                try? await Task.sleep(nanoseconds: i == 1 ? 250_000_000 : 45_000_000)
                withMotion(.base, reduceMotion: reduce) { checks = i }
            }
            done.insert(k)
        }
    }
}
