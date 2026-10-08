import SwiftUI
import Cieo

public struct ViewCrossfadeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "vcrossfade", category: "Views", name: "View crossfade",
        summary: "The header stays pinned while the old and new views overlap and fade through each other with a soft blur. Body text swaps on the way through. Nothing travels, so the frame never shifts.")

    private let views = [
        (head: "Stories from the county line", body: "Eleven reporters cover one county. This week: the water board vote."),
        (head: "How we check a claim", body: "Every number links to its source and every quote is recorded."),
        (head: "Eleven people, one county", body: "Paid for by 4,200 members and no ads. Above the hardware store.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    @State private var prev = 0
    @State private var fade = 1.0
    @State private var softBlur = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "The header never moves; views fade through each other") {
            VStack(spacing: 8) {
                VStack(spacing: 0) {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("The County Line").font(.headline)
                        Text("Independent · member-funded").font(.caption).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading).padding(12).padding(.horizontal, 2)
                    Divider()
                    ZStack {
                        pane(views[prev], id: "old").opacity(1 - fade).blur(radius: softBlur && !reduce ? (1 - abs(fade - 0.5) * 2) * 4 : 0)
                        pane(views[cur], id: "new").opacity(fade).blur(radius: softBlur && !reduce ? (1 - abs(fade - 0.5) * 2) * 4 : 0)
                    }
                    .frame(height: 120)
                    .animation(reduce ? nil : .motion(.base), value: fade)
                    HStack(spacing: 8) {
                        Button("Stories") { go(0) }.buttonStyle(.bordered).controlSize(.small)
                        Button("Method") { go(1) }.buttonStyle(.bordered).controlSize(.small)
                        Button("About") { go(2) }.buttonStyle(.bordered).controlSize(.small)
                    }.padding(10)
                }
                .frame(maxWidth: 340)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12)).clipShape(RoundedRectangle(cornerRadius: 12))
                Toggle("Soft blur", isOn: $softBlur).font(.caption).foregroundStyle(.secondary).frame(maxWidth: 340)
            }
        }
    }

    private func pane(_ v: (head: String, body: String), id: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            SwapText(v.head, drift: 0).font(.headline)
            SwapText(v.body, drift: 0).font(.footnote)
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .padding(14)
    }

    private func go(_ i: Int) {
        guard i != cur else { return }
        prev = cur
        cur = i
        fade = 0
        withMotion(.base, reduceMotion: reduce) { fade = 1 }
    }
}
