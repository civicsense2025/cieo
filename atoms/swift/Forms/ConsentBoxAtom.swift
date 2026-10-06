import SwiftUI
import Cieo

public struct ConsentBoxAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "consentbox", category: "Forms", name: "Consent checkbox",
        summary: "Checking fills the box then draws the check; Partial morphs it to a dash. Recorded consent holds a success terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Mode { case none, partial, full }
    @State private var mode = Mode.none
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap the box, then try Partial") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    Button { withMotion(.base, reduceMotion: reduce) { mode = mode == .full ? .none : .full } } label: {
                        HStack(alignment: .top, spacing: 10) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(mode == .none ? .clear : Color.primary)
                                    .stroke(mode == .none ? .secondary : Color.primary, lineWidth: 2)
                                    .frame(width: 22, height: 22)
                                if mode == .full { Image(systemName: "checkmark").foregroundStyle(.white).font(.system(size: 12, weight: .bold)).motionTransition(.swap()) }
                                if mode == .partial { Capsule().fill(.white).frame(width: 12, height: 2).motionTransition(.swap()) }
                            }
                            VStack(alignment: .leading) {
                                Text("Share my exhibits with counsel").font(.callout).fontWeight(.medium)
                                Text("Required to finish filing.").font(.caption).foregroundStyle(.secondary)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.vertical, 12)
                    HStack(spacing: 8) {
                        Button("Partial") { withMotion(.base, reduceMotion: reduce) { mode = .partial } }.frame(minHeight: 32)
                        Button("Clear") { withMotion(.base, reduceMotion: reduce) { mode = .none } }.frame(minHeight: 32)
                        ZStack(alignment: .leading) {
                            switch mode {
                            case .none: Text("Not consented").foregroundStyle(.secondary).motionTransition(.swap())
                            case .partial: Text("Partially selected").motionTransition(.swap())
                            case .full: Text("Consent recorded ✓").foregroundStyle(.green).motionTransition(.swap())
                            }
                        }.font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                    }
                }
                .padding(16).frame(maxWidth: 340)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("Record consent timestamp", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
