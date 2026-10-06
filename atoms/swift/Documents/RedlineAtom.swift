import SwiftUI
import Cieo

public struct RedlineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "redline", category: "Documents", name: "Redline compare",
        summary: "Deleted lines fade before their width closes; inserted lines open before fading in. Accepting lands a clean-copy terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Mode { case original, compare, revised }
    @State private var mode = Mode.compare
    @State private var accepted = false
    public init() {}

    private func oldSpan() -> Text {
        Text(" Payment is due in 30 days. ").font(.callout)
            .foregroundColor(mode == .compare ? .red : (mode == .revised || accepted ? .clear : .primary))
    }

    private func newSpan() -> Text {
        Text(" Payment is due in 14 days with a 2% discount. ").font(.callout)
            .foregroundColor(mode == .original ? .clear : .primary)
    }

    public var body: some View {
        AtomStage(hint: "Open Compare, then Accept all") {
            VStack(alignment: .leading, spacing: 10) {
                Text("Services agreement · v2 vs v3").font(.headline)
                HStack(spacing: 8) {
                    Button("Original") { set(.original) }.frame(minHeight: 32)
                    Button("Compare") { set(.compare) }.frame(minHeight: 32)
                    Button("Revised") { set(.revised) }.frame(minHeight: 32)
                }.buttonStyle(.bordered)
                Text("Care survives termination.").font(.callout)
                    + oldSpan() + newSpan()
                HStack(spacing: 8) {
                    Button("Accept all") { withMotion(.base, reduceMotion: reduce) { accepted = true } }.frame(minHeight: 32)
                    ZStack(alignment: .leading) {
                        if accepted { Text("All changes accepted — clean copy ✓").foregroundStyle(.green).motionTransition(.swap()) }
                    }.font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                }
                Toggle("Show markup colors", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
            .padding(16).frame(maxWidth: 400)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func set(_ m: Mode) {
        withMotion(.soft, reduceMotion: reduce) { mode = m; if m != .revised { accepted = false } }
    }
}
