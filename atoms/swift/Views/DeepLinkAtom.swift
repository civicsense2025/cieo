import SwiftUI
import Cieo

public struct DeepLinkAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "deeplink", category: "Views", name: "Deep-link landing",
        summary: "Tapping a link builds the full stack instantly with no travel, then the final pane enters heading-first and body 50ms later. The back chain lands on the correct parent every step, ending home.")

    private struct Level { let back: String, head: String, crumbs: String, body: String, landed: String }
    private let chain = [
        Level(back: "‹ Home", head: "Home", crumbs: "", body: "Your front page. Two shared links sit below.", landed: ""),
        Level(back: "‹ Home", head: "City budget", crumbs: "Home / Budget", body: "Start with the transfers page. It shows money moved after the vote.", landed: ""),
        Level(back: "‹ City budget", head: "Reading it in ten minutes", crumbs: "Home / Budget / Story", body: "Compare the adopted figure with last year’s actual spending. A gap over five percent deserves a question.", landed: "Landed · 2 deep ✓")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var depth = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "A shared link builds the whole stack, then lands") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 4) {
                    Button { land(max(0, depth - 1)) } label: {
                        SwapText(chain[depth].back, drift: 0).font(.footnote)
                    }.buttonStyle(.plain).foregroundStyle(Color.accentColor)
                    SwapText(chain[depth].head, drift: 4).font(.headline)
                    if !chain[depth].crumbs.isEmpty {
                        Text(chain[depth].crumbs).font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    }
                    SwapText(chain[depth].body, drift: 4).font(.footnote)
                        .animation(reduce ? nil : .motion(.base).delay(Motion.exit + 0.05), value: depth)
                    if !chain[depth].landed.isEmpty {
                        Text(chain[depth].landed).font(.caption).foregroundStyle(.secondary)
                    }
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .padding(14)
                .frame(width: 340, height: 210)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12)).clipShape(RoundedRectangle(cornerRadius: 12))
                .animation(reduce ? nil : .motion(.base), value: depth)
                HStack(spacing: 8) {
                    Button("Open: budget story") { land(2) }.buttonStyle(.bordered).controlSize(.small)
                    Button("Open: meeting note") { land(1) }.buttonStyle(.bordered).controlSize(.small)
                }
            }
        }
    }

    private func land(_ d: Int) {
        if reduce { depth = d } else { withAnimation(nil) { depth = d } }
    }
}
