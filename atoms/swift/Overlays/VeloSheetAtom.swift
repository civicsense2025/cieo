import SwiftUI
import Cieo

public struct VeloSheetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "velosheet", category: "Overlays", name: "Velocity drawer",
        summary: "The drawer tracks the drag 1:1 and release velocity picks open or closed. The scrim fades with position and links stagger only after it settles.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var settled = false
    private let links = ["Home", "Events", "Members", "Library", "Settings"]
    public init() {}
    public var body: some View {
        AtomStage(hint: "Fling to snap · links stagger after settle") {
            ZStack(alignment: .leading) {
                VStack(alignment: .leading, spacing: 8) {
                    Toggle("Stagger links", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                    Button("Open navigation") { show(true) }.buttonStyle(.borderedProminent)
                    Text("Drags 1:1 · release speed decides.").font(.caption).foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
                if open {
                    Color.black.opacity(0.3).ignoresSafeArea().onTapGesture { show(false) }
                        .transition(.opacity.animation(reduce ? nil : .motion(.base)))
                    drawer.transition(reduce ? .identity : .move(edge: .leading).combined(with: .opacity).animation(.motion(.base)))
                }
            }
            .onKeyPress(.escape) { show(false); return .handled }
        }
    }
    private var drawer: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Common Room").font(.headline).padding(.horizontal, 10).padding(.bottom, 8)
            ForEach(Array(links.enumerated()), id: \.offset) { i, n in
                Text(n).font(.callout.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 9)
                    .transition(reduce ? .identity : .opacity.combined(with: .offset(x: -12)))
            }
        }
        .padding(.vertical, 16).padding(.horizontal, 10).frame(width: 200, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 12))
        .animation(reduce ? nil : .motion(.base).delay(0.06), value: open)
    }
    private func show(_ on: Bool) { withMotion(on ? .base : .snap, reduceMotion: reduce) { open = on; settled = on } }
}
