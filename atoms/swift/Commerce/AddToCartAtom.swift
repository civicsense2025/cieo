import SwiftUI
import MotionKit

public struct AddToCartAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "cart", category: "Commerce", name: "Add to cart",
        summary: "The button confirms in place with a blur swap and fills with the success color, then returns. The cart count rolls when the item arrives, 300ms later.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var added = false
    @State private var count = 0
    @State private var revert: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Add the tote") {
            ZStack(alignment: .topTrailing) {
                VStack(spacing: 10) {
                    Image(systemName: "bag").font(.system(size: 36, weight: .light)).foregroundStyle(.tertiary)
                        .frame(maxWidth: .infinity).frame(height: 92).background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                    HStack { Text("Canvas tote").font(.subheadline.weight(.semibold)); Spacer(); Text("$32").font(.subheadline).foregroundStyle(.secondary) }
                    Button(action: add) {
                        ZStack {
                            if added { Label("Added", systemImage: "checkmark").motionTransition(.swap()) }
                            else { Text("Add to cart").motionTransition(.swap()) }
                        }
                        .fontWeight(.medium).foregroundStyle(added ? AnyShapeStyle(Color.white) : AnyShapeStyle(.background))
                        .frame(maxWidth: .infinity).frame(height: 38)
                        .background(added ? Color.green : Color.primary, in: RoundedRectangle(cornerRadius: 10))
                        .animation(reduce ? nil : .motion(.base), value: added)
                    }
                    .buttonStyle(.plain)
                }
                .padding(14).frame(width: 230)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                .padding(.top, 36)
                cartIcon
            }
            .frame(width: 262)
        }
    }

    private var cartIcon: some View {
        Image(systemName: "cart").font(.title3).padding(8).accessibilityLabel("Cart, \(count) items")
            .overlay(alignment: .topTrailing) {
                RollingDigits(count).font(.system(size: 11, weight: .semibold)).foregroundStyle(.background)
                    .frame(minWidth: 18, minHeight: 18).padding(.horizontal, 2).background(.primary, in: Capsule())
                    .opacity(count > 0 ? 1 : 0).scaleEffect(count > 0 ? 1 : 0.6)
                    .animation(reduce ? nil : .motion(.base), value: count > 0)
            }
    }

    private func add() {
        withMotion(.base, reduceMotion: reduce) { added = true }
        revert?.cancel()
        Task { try? await Task.sleep(for: .milliseconds(300)); count = min(99, count + 1) }
        revert = Task {
            try? await Task.sleep(for: .milliseconds(1600))
            guard !Task.isCancelled else { return }
            withMotion(.base, reduceMotion: reduce) { added = false }
        }
    }
}
