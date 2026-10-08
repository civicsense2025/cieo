import SwiftUI
import Cieo

public struct AddressAutocompleteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "autocomplete", category: "Commerce", name: "Address autocomplete",
        summary: "Rows filter in place: matches spring into slots while misses blur out. Picking swaps in the full address and collapses the list.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var q = ""
    @State private var picked: String?
    @State private var usOnly = true
    private let addrs = [("14 Maple St, Portland ME", "04101"), ("9 Marsh Ave, Oakland CA", "94610"), ("102 Main St, Austin TX", "78701"), ("77 Market St, Toronto ON", "M5B 1M1")]
    public init() {}

    private var matches: [(String, String)] {
        addrs.filter { a in
            (q.isEmpty || a.0.localizedCaseInsensitiveContains(q)) && (!usOnly || !a.0.contains("Toronto"))
        }
    }

    public var body: some View {
        AtomStage(hint: "Type “ma”, pick a row") {
            VStack(spacing: 8) {
                Text("Delivery address").font(.system(size: 15, weight: .semibold)).frame(maxWidth: .infinity, alignment: .leading)
                TextField("Start typing…", text: $q).frame(height: 38).padding(.horizontal, 10)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                    .onChange(of: q) { picked = nil }
                VStack(spacing: 4) {
                    ForEach(Array(matches.enumerated()), id: \.offset) { _, a in
                        Button {
                            withMotion(.base, reduceMotion: reduce) { picked = "\(a.0) \(a.1)"; q = a.0 }
                        } label: {
                            HStack(spacing: 8) {
                                Text(a.0).font(.system(size: 13)).lineSpacing(6.5)
                                Spacer()
                                Text(a.1).font(.system(size: 12.5)).foregroundStyle(.secondary)
                            }
                            .padding(8).frame(minHeight: 38)
                            .background(.background, in: RoundedRectangle(cornerRadius: 9))
                            .background(RoundedRectangle(cornerRadius: 9).fill(Color.primary.opacity(0.05)))
                        }
                        .buttonStyle(.plain)
                        .transition(.scale(scale: 0.96).combined(with: .opacity))
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: q)
                .animation(reduce ? nil : .motion(.base), value: usOnly)
                SwapText(picked != nil ? "Picked — edit to search again" : "")
                    .font(.system(size: 13)).lineSpacing(6.5).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                Toggle("US only", isOn: $usOnly).font(.system(size: 12.5)).foregroundStyle(.secondary).toggleStyle(.checkbox)
            }
            .padding(14).frame(width: 300)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }
}
