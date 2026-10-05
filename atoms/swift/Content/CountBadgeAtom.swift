import SwiftUI
import Cieo

public struct CountBadgeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "badge", category: "Content", name: "Count badge",
        summary: "Digits roll up one slot at a time and slot widths spring, so 9 to 10 widens smoothly. The badge scales in from 60%.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var count = 3
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 22) {
                Image(systemName: "bell").font(.system(size: 28))
                    .overlay(alignment: .topTrailing) {
                        RollingDigits(min(count, 999))
                            .font(.caption.weight(.semibold)).foregroundStyle(.white)
                            .padding(.horizontal, 6).frame(minWidth: 20, minHeight: 20)
                            .background(Capsule().fill(.red))
                            .scaleEffect(count > 0 ? 1 : 0.6)
                            .opacity(count > 0 ? 1 : 0)
                            .motion(.base, value: count > 0)
                            .motion(.base, value: count)
                            .offset(x: 14, y: -8)
                    }
                    .accessibilityElement(children: .ignore)
                    .accessibilityLabel("Notifications")
                    .accessibilityValue(count == 0 ? "None" : "\(count)")
                HStack {
                    Button("+1") { count += 1 }
                    Button("+9") { count += 9 }
                    Button("Clear") { count = 0 }
                }
                .buttonStyle(.bordered)
            }
        }
    }
}
