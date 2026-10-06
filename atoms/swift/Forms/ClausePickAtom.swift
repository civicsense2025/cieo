import SwiftUI
import Cieo

public struct ClausePickAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "clausepick", category: "Forms", name: "Clause pick-one",
        summary: "The dot grows in the new clause while the old one shrinks on the same spring. The locked pick holds a filed terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pick = 0
    private let options = [("Arbitration", "Disputes settle in Reno."), ("Mediation", "A neutral talks first."), ("Litigation", "Courts decide in public.")]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a clause — arrows work too") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Governing clause").font(.headline).padding(.bottom, 4)
                    ForEach(0..<options.count, id: \.self) { i in
                        Button { withMotion(.base, reduceMotion: reduce) { pick = i } } label: {
                            HStack(spacing: 10) {
                                ZStack {
                                    Circle().strokeBorder(i == pick ? Color.primary : .secondary, lineWidth: 2).frame(width: 20, height: 20)
                                    Circle().fill(Color.primary).frame(width: 8, height: 8).scaleEffect(i == pick ? 1 : 0)
                                        .animation(reduce ? nil : .motion(.base), value: pick)
                                }
                                Text(options[i].0).font(.callout).fontWeight(.medium)
                                + Text(" — \(options[i].1)").font(.caption).foregroundStyle(.secondary)
                                + Text(i == pick ? " ✓" : "").font(.caption).foregroundStyle(.green)
                            }.padding(.vertical, 8)
                        }
                        .buttonStyle(.plain)
                        if i < 2 { Divider() }
                    }
                    ZStack(alignment: .leading) {
                        Text("Filed under \(options[pick].0) ✓").foregroundStyle(.green).id(pick).motionTransition(.swap())
                    }
                    .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading).padding(.top, 8)
                }
                .padding(16).frame(maxWidth: 340)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("Lock pick with success mark", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
