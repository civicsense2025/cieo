import SwiftUI
import Cieo

public struct ConfidenceMeterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "confmeter", category: "AI chat", name: "Confidence meter",
        summary: "The thin meter inks on a lazy spring while digits roll the percent. The band caption swaps between danger, warning and success terminals.")

    private let sequence = [68, 92, 32]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var value = 0
    @State private var step = 0
    @State private var slow = true
    public init() {}

    private var band: Int { value < 55 ? 0 : value < 80 ? 1 : 2 }
    private var bandText: String {
        value == 0 ? "Tap Verify to check this answer" :
            ["Low — double-check sources", "Mixed — partly sourced", "High — well sourced"][band]
    }
    private var bandColor: Color {
        value == 0 ? .secondary : [.red, .orange, .green][band]
    }

    public var body: some View {
        AtomStage(hint: "Verify, then try Low / Mid / High") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Is this answer solid?").font(.system(size: 15, weight: .semibold))
                Text("Yearly saves about 17% versus monthly.").font(.system(size: 13.5)).lineSpacing(2)
                    .padding(.horizontal, 12).padding(.vertical, 8)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.secondary.opacity(0.18)))
                    .frame(maxWidth: 240, alignment: .leading)
                HStack(spacing: 8) {
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 2).fill(Color.secondary.opacity(0.2))
                            RoundedRectangle(cornerRadius: 2).fill(bandColor)
                                .frame(width: geo.size.width * Double(value) / 100)
                        }
                    }
                    .frame(height: 4)
                    HStack(spacing: 1) {
                        RollingDigits(String(format: "%2d", value)).font(.system(size: 13))
                        Text("%").font(.system(size: 13)).foregroundStyle(.secondary)
                    }
                }
                .motion(slow ? .lazy : .base, value: value)
                SwapText(bandText).font(.caption).foregroundStyle(bandColor)
                    .frame(height: 18, alignment: .leading)
                HStack(spacing: 6) {
                    Button("Low") { set(32) }.buttonStyle(.bordered).controlSize(.small)
                    Button("Mid") { set(68) }.buttonStyle(.bordered).controlSize(.small)
                    Button("High") { set(92) }.buttonStyle(.bordered).controlSize(.small)
                    Spacer()
                    Button("Verify") { set(sequence[step % sequence.count]); step += 1 }
                        .buttonStyle(.borderedProminent).controlSize(.small)
                }
                Toggle("Slow ink", isOn: $slow).font(.caption).foregroundStyle(.secondary)
            }
            .frame(width: 300)
        }
    }

    private func set(_ n: Int) {
        if reduce { value = n }
        else { withMotion(slow ? .lazy : .base, reduceMotion: reduce) { value = n } }
    }
}
