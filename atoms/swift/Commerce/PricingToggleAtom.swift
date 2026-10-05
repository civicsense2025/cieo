import SwiftUI
import MotionKit

public struct PricingToggleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pricing", category: "Commerce", name: "Pricing toggle",
        summary: "The segment indicator uses lagging edges. Only the digits that change roll. The billing note swaps and the savings pill enters.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var yearly = false
    @State private var frames: [AnyHashable: CGRect] = [:]
    private let labels = ["Monthly", "Yearly"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch billing") {
            VStack(spacing: 18) {
                ZStack(alignment: .topLeading) {
                    if frames.count == 2 {
                        EdgesIndicator(frame: (frames[yearly ? 1 : 0] ?? .zero).insetBy(dx: 0, dy: 0), shape: Capsule(), style: .background)
                    }
                    HStack(spacing: 0) {
                        ForEach(0..<2, id: \.self) { i in
                            Button { yearly = i == 1 } label: {
                                Text(labels[i]).font(.subheadline.weight(.medium)).padding(.horizontal, 16).padding(.vertical, 7)
                            }
                            .buttonStyle(.plain).reportFrame(i, in: "seg")
                            .accessibilityAddTraits((i == 1) == yearly ? .isSelected : [])
                        }
                    }
                }
                .padding(3).coordinateSpace(name: "seg")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .background(.quaternary, in: Capsule())

                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Studio").font(.caption).foregroundStyle(.secondary)
                        Spacer()
                        Text("Save 20%").font(.caption.weight(.semibold)).foregroundStyle(Color.accentColor)
                            .padding(.horizontal, 8).padding(.vertical, 2).background(Color.accentColor.opacity(0.15), in: Capsule())
                            .opacity(yearly ? 1 : 0).scaleEffect(yearly ? 1 : 0.85)
                            .animation(reduce ? nil : .motion(.base), value: yearly)
                    }
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("$").font(.system(size: 40, weight: .bold))
                        RollingDigits(yearly ? "19" : "24").font(.system(size: 40, weight: .bold))
                        Text("/mo").font(.caption).foregroundStyle(.secondary)
                    }
                    SwapText(yearly ? "Billed $228 yearly" : "Billed monthly").font(.caption).foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, minHeight: 20, alignment: .leading)
                }
                .padding(18).frame(width: 220)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            }
        }
    }
}
