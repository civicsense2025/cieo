import SwiftUI
import Cieo

public struct JurisdictionAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "jurisdiction", category: "Forms", name: "Jurisdiction pick",
        summary: "The list grows down from the trigger while the arrow-key highlight trails behind. The pick holds a filed terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var pick = 0
    @FocusState private var focused: Bool
    private let options = ["Nevada", "California", "New York", "Texas", "Delaware"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open it — type or tap a state") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Governing jurisdiction").font(.headline).padding(.bottom, 8)
                    Button { withMotion(.base, reduceMotion: reduce) { open.toggle(); focused = true } } label: {
                        HStack {
                            Text(options[pick]).font(.callout)
                            Spacer()
                            Image(systemName: "chevron.down").font(.caption).rotationEffect(.degrees(open ? 180 : 0))
                        }
                        .padding(.horizontal, 10).frame(minHeight: 36)
                        .background(RoundedRectangle(cornerRadius: 8).fill(.secondary.opacity(0.4)).opacity(0.10))
                    }
                    .buttonStyle(.plain).focused($focused)
                    .onKeyPress(.downArrow) { withMotion(.base, reduceMotion: reduce) { pick = min(4, pick + 1) }; return .handled }
                    .onKeyPress(.upArrow) { withMotion(.base, reduceMotion: reduce) { pick = max(0, pick - 1) }; return .handled }
                    if open {
                        VStack(alignment: .leading, spacing: 0) {
                            ForEach(0..<options.count, id: \.self) { i in
                                Button(options[i]) {
                                    withMotion(.base, reduceMotion: reduce) { pick = i; open = false }
                                }
                                .frame(maxWidth: .infinity, minHeight: 32, alignment: .leading).font(.callout)
                                .padding(.horizontal, 10)
                                .background(i == pick ? Color.accentColor.opacity(0.12) : .clear, in: RoundedRectangle(cornerRadius: 8))
                                .buttonStyle(.plain)
                            }
                        }
                        .motionTransition(.swap())
                    }
                    ZStack(alignment: .leading) {
                        Text("Filed under \(options[pick]) ✓").foregroundStyle(.green).id(pick).motionTransition(.swap())
                    }
                    .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading).padding(.top, 4)
                }
                .padding(16).frame(maxWidth: 320)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("US states only", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
