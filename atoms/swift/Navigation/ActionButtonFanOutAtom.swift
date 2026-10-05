import SwiftUI
import MotionKit

public struct ActionButtonFanOutAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "speeddial", category: "Navigation", name: "Action button fan-out",
        summary: "Opening turns the plus into a cross and fans the actions out from the button, 40ms apart, upward, to the side, or along an arc. Labels follow their buttons in the straight layouts; the arc stays icon-only so labels never collide. Closing gathers them back in reverse order.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var mode = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    private let actions = [("Page", "doc"), ("Post", "pencil"), ("Photo", "photo"), ("Product", "bag")]
    private let modes = ["Up", "Left", "Arc"]
    public init() {}

    private func spot(_ i: Int) -> CGSize {
        let k = CGFloat(i + 1)
        switch mode {
        case 0: return CGSize(width: 0, height: -k * 48)
        case 1: return CGSize(width: -k * 48, height: 0)
        default:
            let a = Double(90 + i * 30) * .pi / 180
            return CGSize(width: 112 * cos(a), height: -112 * sin(a))
        }
    }

    public var body: some View {
        AtomStage {
            VStack(spacing: 10) {
                ZStack(alignment: .topLeading) {
                    if let f = frames[mode] {
                        EdgesIndicator(frame: f.insetBy(dx: 0, dy: 3), shape: Capsule(), style: Color.primary.opacity(0.14))
                    }
                    HStack(spacing: 0) {
                        ForEach(modes.indices, id: \.self) { i in
                            Button { withMotion(.base, reduceMotion: reduce) { mode = i } } label: {
                                Text(modes[i]).font(.callout.weight(.medium)).padding(.horizontal, 14).padding(.vertical, 7)
                                    .contentShape(Rectangle()).reportFrame(i, in: "modes")
                            }
                            .buttonStyle(.plain).accessibilityAddTraits(mode == i ? .isSelected : [])
                        }
                    }
                }
                .coordinateSpace(name: "modes")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .background(Capsule().fill(Color.primary.opacity(0.06)))
                frame
            }
        }
    }

    private var frame: some View {
        ZStack(alignment: .bottomTrailing) {
            Color.black.opacity(open ? 0.25 : 0).allowsHitTesting(open).onTapGesture { toggle(false) }
                .animation(reduce ? nil : .motion(open ? .base : .snap), value: open)
            ForEach(actions.indices, id: \.self) { i in
                let p = open ? spot(i) : .zero
                let delay = Double(open ? i : actions.count - 1 - i) * 0.04
                Button { toggle(false) } label: {
                    Image(systemName: actions[i].1).font(.system(size: 16, weight: .medium)).frame(width: 40, height: 40)
                        .background(RoundedRectangle(cornerRadius: 12).fill(.background).shadow(color: .black.opacity(0.15), radius: 4, y: 2))
                }
                .buttonStyle(.plain).accessibilityLabel("New \(actions[i].0.lowercased())")
                .overlay { label(actions[i].0) }
                .padding(.trailing, 22).padding(.bottom, 22)
                .scaleEffect(open ? 1 : 0.6).opacity(open ? 1 : 0)
                .offset(p)
                .animation(reduce ? nil : .motion(.base).delay(delay), value: open)
                .animation(reduce ? nil : .motion(.base).delay(delay), value: mode)
                .allowsHitTesting(open)
            }
            Button { toggle(!open) } label: {
                Image(systemName: "plus").font(.system(size: 20, weight: .semibold)).foregroundStyle(.background)
                    .rotationEffect(.degrees(open ? 45 : 0))
                    .frame(width: 52, height: 52)
                    .background(RoundedRectangle(cornerRadius: 16).fill(.primary).shadow(color: .black.opacity(0.2), radius: 6, y: 3))
            }
            .buttonStyle(.plain).accessibilityLabel("Create").accessibilityValue(open ? "Expanded" : "Collapsed")
            .padding(16)
        }
        .frame(width: 300, height: 262)
        .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.04)))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .onKeyPress(.escape) { toggle(false); return .handled }
    }

    @ViewBuilder
    private func label(_ text: String) -> some View {
        if mode != 2 {
            Text(text).font(.caption.weight(.medium)).fixedSize()
                .padding(.horizontal, 8).padding(.vertical, 3)
                .background(RoundedRectangle(cornerRadius: 6).fill(.background).shadow(color: .black.opacity(0.12), radius: 3, y: 1))
                .offset(x: mode == 0 ? -(44 + 14) : 0, y: mode == 1 ? -38 : 0)
                .opacity(open ? 1 : 0).allowsHitTesting(false)
        }
    }

    private func toggle(_ on: Bool) { withMotion(.base, reduceMotion: reduce) { open = on } }
}
