import SwiftUI
import Cieo

public struct SigChainAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sigchain", category: "Writing", name: "Signature chain",
        summary: "Advance fills the connector first, then the next seal inks 60 ms later. The status swaps forward, ending in Signed.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let signers = ["Ava Chen · Author", "Ravi Patel · Editor", "June Park · Legal", "Sam Ortiz · Publisher"]
    private let states = ["Waiting for signatures", "Collecting seals…", "Signed — ready to file"]
    @State private var k = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Each seal inks after the line reaches it") {
            VStack(alignment: .leading, spacing: 12) {
                ZStack(alignment: .topLeading) {
                    Rectangle().fill(.quaternary).frame(width: 2).offset(x: 14).padding(.vertical, 12)
                    Rectangle().fill(.primary).frame(width: 2, height: sealH * CGFloat(k)).offset(x: 14, y: 12)
                        .animation(reduce ? nil : .motion(.base), value: k)
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(signers.indices, id: \.self) { i in
                            HStack(spacing: 10) {
                                ZStack {
                                    Circle().fill(i <= k ? Color.primary : Color.clear)
                                        .frame(width: 30, height: 30)
                                        .overlay(Circle().strokeBorder(i <= k ? Color.primary : Color.secondary.opacity(0.35), lineWidth: 2))
                                    if i < k || (k == signers.count - 1 && i == k) {
                                        Image(systemName: "checkmark").font(.caption.weight(.bold)).foregroundStyle(.background)
                                            .motionTransition(.swap())
                                    } else {
                                        Text("\(i + 1)").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                                            .motionTransition(.swap())
                                    }
                                }
                                .animation(reduce ? nil : .motion(.base).delay(Double(i) * Motion.lag), value: k)
                                Text(signers[i]).font(.callout)
                            }
                            .frame(height: sealH, alignment: .leading)
                        }
                    }
                }
                SwapText(k == signers.count - 1 ? states[2] : k > 0 ? states[1] : states[0])
                    .font(.caption).foregroundStyle(k == signers.count - 1 ? Color.green : .secondary)
                HStack(spacing: 8) {
                    Button("Advance seal") { advance() }.buttonStyle(.borderedProminent).disabled(k == signers.count - 1)
                    Button("Reset") { withMotion(.base, reduceMotion: reduce) { k = 0 } }.buttonStyle(.bordered)
                }
            }
            .frame(maxWidth: 300)
        }
    }

    private var sealH: CGFloat { 56 }

    private func advance() { withMotion(.base, reduceMotion: reduce) { k = min(signers.count - 1, k + 1) } }
}
