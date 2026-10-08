import SwiftUI
import Cieo

public struct BundleSweepAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "bundlesweep", category: "Email", name: "Bundle sweep",
        summary: "Done archives the promo cluster. Rows blur out in place, then the gap closes on base while the count rolls to zero and a success terminal holds.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var archived = false
    @State private var includeSocial = true
    public init() {}

    private let promos = [
        ("ST", "Sale ends Sunday", "Store · 3 mails"),
        ("AT", "New drops Friday", "Atelier · 2 mails"),
        ("FL", "Flights from $99", "Airline · 4 mails"),
    ]
    private let social = ("SO", "Weekend roundup", "Social · 2 mails")
    private var rows: [(String, String, String)] { includeSocial ? promos + [social] : promos }

    public var body: some View {
        AtomStage(hint: "Archive the promo cluster") {
            VStack(spacing: 14) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("Promotions").font(.callout.weight(.semibold))
                        Spacer()
                        HStack(spacing: 2) { RollingDigits(archived ? 0 : rows.count) }
                            .font(.caption).foregroundStyle(.secondary)
                    }
                    VStack(spacing: 0) {
                        ForEach(rows.indices, id: \.self) { i in
                            HStack(spacing: 10) {
                                Circle().fill(Color.accentColor.opacity(0.15))
                                    .frame(width: 34, height: 34)
                                    .overlay(Text(rows[i].0).font(.caption2.weight(.semibold)))
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(rows[i].1).font(.caption.weight(.semibold))
                                    Text(rows[i].2).font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                            }
                            .padding(.vertical, 9)
                            .opacity(archived ? 0 : 1)
                            .blur(radius: archived ? 4 : 0)
                            .frame(height: archived ? 0 : 52, alignment: .top)
                            .clipped()
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.05), value: archived)
                            if i < rows.count - 1 {
                                Divider().opacity(archived ? 0 : 1)
                            }
                        }
                    }
                    SwapText(archived ? "Archived \(rows.count) promos" : "")
                        .font(.caption.weight(.semibold)).foregroundStyle(Color.green)
                        .frame(height: 20, alignment: .leading)
                }
                .padding(14).frame(maxWidth: 300)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                HStack(spacing: 10) {
                    Button(archived ? "Undo" : "Archive bundle") {
                        withMotion(.base, reduceMotion: reduce) { archived.toggle() }
                    }.buttonStyle(.borderedProminent).controlSize(.small)
                    Toggle("Include social", isOn: $includeSocial)
                        .font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
        }
    }
}
