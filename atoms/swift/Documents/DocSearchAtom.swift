import SwiftUI
import Cieo

public struct DocSearchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "docsearch", category: "Documents", name: "In-doc search",
        summary: "Jumping slides the highlight while its outline trails behind. A query with no hits settles on a quiet empty terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var query = "spring"
    @State private var active = 0
    private let paras = ["The spring essay opens with a market bell.", "Attention is the spring tax every reader pays.", "Care survives where the spring runs dry."]
    public init() {}

    private var hits: Int { query.lowercased() == "spring" ? 3 : 0 }

    public var body: some View {
        AtomStage(hint: "Search “spring”, jump with ›, try “xyz”") {
            VStack(spacing: 10) {
                HStack(spacing: 8) {
                    TextField("Search document", text: $query).textFieldStyle(.roundedBorder).frame(minHeight: 32)
                    Button("‹") { step(-1) }.frame(minHeight: 32)
                    Button("›") { step(1) }.frame(minHeight: 32)
                    Text(String(format: "%02d", hits)).font(.callout).monospacedDigit()
                }
                VStack(spacing: 0) {
                    ForEach(0..<paras.count, id: \.self) { i in
                        Text(paras[i]).font(.callout).lineSpacing(6).padding(.vertical, 6)
                            .background(i == active && hits > 0 ? Color.accentColor.opacity(0.18) : .clear, in: RoundedRectangle(cornerRadius: 6))
                            .animation(reduce ? nil : .motion(.base), value: active)
                        if i < 2 { Divider() }
                    }
                }
                ZStack(alignment: .leading) {
                    if hits == 0 { Text("No matches — try “spring”").foregroundStyle(.secondary).motionTransition(.swap()) }
                }
                .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                Toggle("Match case-insensitive", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
            .padding(16).frame(maxWidth: 380)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func step(_ d: Int) {
        guard hits > 0 else { return }
        withMotion(.base, reduceMotion: reduce) { active = (active + d + hits) % hits }
    }
}
