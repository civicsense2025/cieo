import SwiftUI
import Cieo

public struct BudgetAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "budget", category: "Writing", name: "Assignment budget board",
        summary: "Rows spring into their rank slots while the leader plate follows with its far edge trailing 60 ms. Killing swaps a row out, then its space collapses; the counts roll to match.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let items = [("Cover story", 12), ("Photo essay", 9), ("Interview", 9), ("Briefs", 6)]
    private let slot = 60.0, rowH = 52.0
    @State private var dead = [false, false, false, false]
    @State private var tweak = true
    public init() {}

    private var alive: [Int] { items.indices.filter { !dead[$0] } }
    private var hours: Int { alive.reduce(0) { $0 + items[$1].1 } }
    private var leader: Int? { alive.max(by: { items[$0].1 < items[$1].1 }) }
    private func slotOf(_ i: Int) -> Double { Double(alive.firstIndex(of: i) ?? 0) * slot }

    public var body: some View {
        AtomStage(hint: "Kill a row to free its hours") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Text("Funded").font(.system(size: 12.5).weight(.semibold))
                    RollingDigits(alive.count)
                    Text("of \(items.count) ·").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    RollingDigits(hours)
                    Text("hrs").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    Spacer()
                    Button("Restore all") { restoreAll() }.buttonStyle(.bordered).frame(minHeight: 32).controlSize(.small).disabled(alive.count == items.count)
                }
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 2).fill(Color.accentColor)
                        .frame(width: 4, height: leader == nil ? 0 : rowH)
                        .offset(y: leader.map(slotOf) ?? 0)
                        .animation(reduce ? nil : .motion(.base), value: leader.map(slotOf) ?? -1)
                        .opacity(leader == nil ? 0 : 1)
                    ForEach(items.indices, id: \.self) { i in
                        HStack(spacing: 8) {
                            Text(dead[i] ? "–" : "\(alive.firstIndex(of: i).map { $0 + 1 } ?? 0)").font(.system(size: 12.5)).foregroundStyle(.secondary).frame(width: 18)
                            VStack(alignment: .leading, spacing: 0) {
                                SwapText(dead[i] ? "Removed — \(items[i].1)h freed" : items[i].0)
                                    .font(.system(size: 14).weight(.medium))
                                    .foregroundStyle(dead[i] ? Color.red : Color.primary)
                                if !dead[i] { Text("\(items[i].1)h").font(.system(size: 12.5)).foregroundStyle(.secondary) }
                            }
                            Spacer()
                            Button(dead[i] ? "Restore" : "Kill") { toggle(i) }.buttonStyle(.bordered).frame(minHeight: 32).controlSize(.small)
                        }
                        .padding(.horizontal, 12)
                        .frame(height: rowH)
                        .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 12))
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
                        .offset(y: slotOf(i))
                        .animation(reduce ? nil : .motion(.base), value: slotOf(i))
                        .opacity(dead[i] ? 0 : 1)
                        .animation(reduce ? nil : (dead[i] ? .motion(.snap).delay(Motion.exit) : .motion(.base)), value: dead[i])
                        .frame(height: dead[i] ? 0 : rowH, alignment: .top).clipped()
                        .animation(reduce ? nil : (dead[i] ? .motion(.base).delay(Motion.exit) : .motion(.base)), value: dead[i])
                        .allowsHitTesting(!dead[i])
                        .padding(.leading, 12)
                    }
                }
                .frame(height: Double(items.count) * slot - 8, alignment: .top)
                Toggle("Count freed hours", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .frame(maxWidth: 430)
        }
    }

    private func toggle(_ i: Int) { withMotion(.base, reduceMotion: reduce) { dead[i].toggle() } }
    private func restoreAll() { withMotion(.base, reduceMotion: reduce) { dead = [false, false, false, false] } }
}
