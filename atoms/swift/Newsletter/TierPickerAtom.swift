import SwiftUI
import Cieo

public struct TierPickerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tierpicker", category: "Newsletter", name: "Tier picker",
        summary: "The plate glides with a trailing edge. Price digits roll, benefits blur-swap and the savings pill pops in softly.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var yearly = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch billing") {
            VStack(spacing: 8) {
                HStack(spacing: 0) {
                    ForEach([false, true], id: \.self) { y in
                        Button(y ? "Yearly" : "Monthly") { withMotion(.base, reduceMotion: reduce) { yearly = y } }
                            .buttonStyle(.plain).font(.footnote.weight(.medium))
                            .padding(.horizontal, 14).padding(.vertical, 8)
                            .background(yearly == y ? Color.primary.opacity(0.1) : Color.clear, in: RoundedRectangle(cornerRadius: 7))
                            .accessibilityAddTraits(yearly == y ? .isSelected : [])
                    }
                }
                .padding(3).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Plus").font(.callout.weight(.semibold))
                        Spacer()
                        Text("Save 20%").font(.caption2.weight(.semibold))
                            .padding(.horizontal, 8).padding(.vertical, 3)
                            .background(.green.opacity(0.15), in: Capsule())
                            .foregroundStyle(.green)
                            .opacity(yearly ? 1 : 0).scaleEffect(yearly ? 1 : 0.8)
                            .animation(reduce ? nil : .motion(.soft), value: yearly)
                    }
                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("$").font(.callout.weight(.semibold))
                        Text(yearly ? "8" : "12").font(.title.weight(.bold)).monospacedDigit()
                            .motionTransition(.swap())
                            .animation(reduce ? nil : .motion(.base), value: yearly)
                        Text("/mo").font(.caption).foregroundStyle(.secondary)
                    }
                    ZStack(alignment: .leading) {
                        if yearly {
                            Text("Everything, billed $96 yearly").font(.footnote).foregroundStyle(.secondary).id(1)
                        } else {
                            Text("Full archive + comments").font(.footnote).foregroundStyle(.secondary).id(0)
                        }
                    }
                    .motionTransition(.swap())
                    .animation(reduce ? nil : .motion(.base), value: yearly)
                    Button("Choose Plus") {}.buttonStyle(.borderedProminent).controlSize(.regular)
                        .frame(maxWidth: .infinity)
                }
                .padding(16)
                .frame(maxWidth: 340)
                .background(.background, in: RoundedRectangle(cornerRadius: 14))
                .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
            }
        }
    }
}
