import SwiftUI

public extension AnyTransition {
    /// Enter/exit for menus, popovers, sheets and toasts: rise a few points and scale from 0.97.
    /// Insertion springs on base; removal is quicker on snap.
    static var motionPresence: AnyTransition {
        .asymmetric(
            insertion: .opacity.combined(with: .scale(scale: 0.97)).combined(with: .offset(y: 4))
                .animation(.motion(.base)),
            removal: .opacity.combined(with: .scale(scale: 0.97)).combined(with: .offset(y: 4))
                .animation(.motion(.snap))
        )
    }

    /// Text swap: the old value drifts up and leaves in 100 ms, then the new one rises in on base. They never overlap.
    static func motionSwap(drift: CGFloat = 4) -> AnyTransition {
        .asymmetric(
            insertion: .opacity.combined(with: .offset(y: drift)).animation(.motion(.base).delay(Motion.exit)),
            removal: .opacity.combined(with: .offset(y: -drift)).animation(.motionExit)
        )
    }
}

/// Swaps its text with the motion swap whenever `text` changes. Reduce Motion swaps instantly.
public struct SwapText: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let text: String
    let drift: CGFloat

    public init(_ text: String, drift: CGFloat = 4) {
        self.text = text
        self.drift = drift
    }

    public var body: some View {
        ZStack {
            Text(text)
                .id(text)
                .transition(reduce ? .identity : .motionSwap(drift: drift))
        }
        .animation(reduce ? nil : .motion(.base), value: text)
    }
}

/// A number whose changed digits roll in the direction of change; unchanged digits stay still. The first render is instant.
public struct RollingDigits: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let value: String
    @State private var direction: CGFloat = 1
    @State private var previous: String

    public init(_ value: Int) { self.init(String(value)) }
    public init(_ value: String) {
        self.value = value
        _previous = State(initialValue: value)
    }

    public var body: some View {
        let chars = Array(value)
        HStack(spacing: 0) {
            ForEach(Array(chars.enumerated()), id: \.offset) { item in
                ZStack {
                    Text(String(item.element))
                        .id("\(chars.count - item.offset)-\(item.element)")
                        .transition(reduce ? .identity : .motionSwap(drift: 8 * direction))
                }
            }
        }
        .monospacedDigit()
        .animation(reduce ? nil : .motion(.base), value: value)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(value)
        .onChange(of: value) { old, new in
            direction = (Double(new) ?? 0) < (Double(old) ?? 0) ? -1 : 1
            previous = new
        }
    }
}
