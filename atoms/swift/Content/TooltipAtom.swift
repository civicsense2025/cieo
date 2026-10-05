import SwiftUI
import MotionKit

public struct TooltipAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tooltip", category: "Content", name: "Tooltip",
        summary: "Enters on the base spring from 97% scale and 4px below. Exits faster on the snap spring so it never lingers. Lamina’s current Tooltip has no enter or exit motion; this is the proposed behavior.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var show = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover, focus or tap the dotted words") {
            HStack(spacing: 4) {
                Text("Prices update on the")
                Button { set(!show) } label: {
                    Text("billing anchor").underline(pattern: .dot)
                }
                .buttonStyle(.plain)
                .onHover { set($0) }
                .overlay(alignment: .top) {
                    if show {
                        Text("The day of the month your first payment went through.")
                            .font(.footnote).foregroundStyle(.background)
                            .padding(.horizontal, 10).padding(.vertical, 7)
                            .frame(width: 190)
                            .background(RoundedRectangle(cornerRadius: 8).fill(.primary))
                            .fixedSize()
                            .alignmentGuide(.top) { $0[.bottom] + 8 }
                            .allowsHitTesting(false)
                            .transition(reduce ? .identity : .motionPresence)
                            .accessibilityAddTraits(.isStaticText)
                    }
                }
                Text("of each plan.")
            }
            .font(.callout)
            .accessibilityElement(children: .contain)
        }
    }

    private func set(_ on: Bool) {
        guard on != show else { return }
        withMotion(on ? .base : .snap, reduceMotion: reduce) { show = on }
    }
}
