import SwiftUI
import Cieo

public struct BarePageAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "barepage", category: "Writing", name: "Bare-page fade",
        summary: "Enter fades the chrome out fast, then the page widens on a spring. Moving to the top brings the tools back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var writing = false
    @State private var calm = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Enter to write · tap the top for tools") {
            VStack(spacing: 8) {
                HStack {
                    Text("Draft").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    Text("Share").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    Spacer()
                    Button(writing ? "Show tools" : "Enter") { set(!writing) }
                        .font(.system(size: 12.5).weight(.semibold))
                }
                .opacity(writing ? 0 : 1)
                .animation(reduce ? nil : .motion(.snap), value: writing)
                .frame(height: 24)
                .contentShape(Rectangle())
                .onTapGesture { if writing { set(false) } }
                VStack(alignment: .leading, spacing: 8) {
                    Text("The lake was flat. Mara set the lamp down and started over on the first line.").font(.system(size: 14))
                    if calm {
                        Text("812 words · calm air, no comments").font(.system(size: 12.5)).foregroundStyle(.secondary)
                            .motionTransition(.swap())
                    }
                }
                .padding(14)
                .frame(width: writing ? 330 : 250)
                .background(.quaternary.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                .animation(reduce ? nil : .motion(.base), value: writing)
                Toggle("Calm", isOn: $calm)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .animation(reduce ? nil : .motion(.base), value: calm)
            .frame(maxWidth: 340)
        }
    }

    private func set(_ v: Bool) {
        if v {
            withMotion(.snap, reduceMotion: reduce) { writing = true }
        } else {
            withMotion(.base, reduceMotion: reduce) { writing = false }
        }
    }
}
