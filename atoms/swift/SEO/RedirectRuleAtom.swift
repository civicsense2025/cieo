import SwiftUI
import Cieo

public struct RedirectRuleAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "redirect", category: "SEO", name: "Redirect-rule builder",
        summary: "Rows spring to their slots when reordered. The regex toggle swaps its help line with blur, and an invalid source rings the field in danger with its message.")

    private struct Rule: Identifiable {
        let id = UUID()
        var from: String
        var to: String
    }

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var rules = [
        Rule(from: "/old-pricing", to: "/pricing"),
        Rule(from: "/blog/(.*)", to: "/journal/$1"),
        Rule(from: "ht tp://bad url", to: "/journal")
    ]
    @State private var regex = true
    public init() {}

    private func valid(_ r: Rule) -> Bool { !r.from.contains(" ") && r.from.hasPrefix("/") }
    private var validCount: Int { rules.filter(valid).count }
    private var allValid: Bool { rules.allSatisfy(valid) }

    public var body: some View {
        AtomStage(hint: "Fix the invalid path, then reorder") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 4) {
                    Text("Redirects ·").font(.headline)
                    RollingDigits(validCount).font(.headline)
                    Text("/3 valid").font(.headline)
                }
                ForEach($rules) { $rule in
                    VStack(alignment: .leading, spacing: 6) {
                        TextField("From path", text: $rule.from).softFieldSurface()
                            .font(.footnote).monospacedDigit()
                            .overlay(RoundedRectangle(cornerRadius: 8)
                                .strokeBorder(valid(rule) ? Color.clear : Color.red, lineWidth: valid(rule) ? 0 : 1.5))
                            .motion(.snap, value: valid(rule))
                        if !valid(rule) {
                            Text(rule.from.contains(" ") ? "Spaces are not valid in a path. Try /old-press." : "Paths start with /.")
                                .font(.caption).foregroundStyle(.red).motionTransition(.presence)
                        }
                        HStack(spacing: 6) {
                            Text("→").foregroundStyle(.secondary)
                            TextField("To path", text: $rule.to).softFieldSurface().font(.footnote)
                        }
                        HStack(spacing: 4) {
                            Button("↑") { move(rule.id, by: -1) }.buttonStyle(.bordered).controlSize(.mini)
                            Button("↓") { move(rule.id, by: 1) }.buttonStyle(.bordered).controlSize(.mini)
                        }
                    }
                    .padding(12).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                    .motion(.base, value: rules.map(\.id))
                }
                ZStack {
                    if allValid {
                        Text("All rules valid ✓").font(.subheadline.weight(.semibold)).foregroundStyle(.green)
                            .id(true).motionTransition(.swap())
                    } else {
                        Text("Keep fixing — one rule needs attention.").font(.footnote).foregroundStyle(.secondary)
                            .id(false).motionTransition(.swap())
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: allValid)
                .frame(height: 24, alignment: .leading)
                ZStack {
                    if regex {
                        Text("Regex on: (.*) captures anything — pair it with a $1 back-reference.")
                            .id(true).motionTransition(.swap())
                    } else {
                        Text("Plain match: /old goes to /new, exact path only.")
                            .id(false).motionTransition(.swap())
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: regex)
                .font(.caption).foregroundStyle(.secondary).frame(height: 36, alignment: .leading)
                .padding(.horizontal, 14).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                HStack(spacing: 6) {
                    Toggle("Regex paths", isOn: $regex).font(.caption).foregroundStyle(.secondary)
                        .nativeToggleStyle()
                    Text("· reorder with ↑ ↓").font(.caption).foregroundStyle(.secondary)
                }
            }
            .frame(width: 340)
        }
    }

    private func move(_ id: UUID, by d: Int) {
        guard let i = rules.firstIndex(where: { $0.id == id }) else { return }
        let j = i + d
        guard rules.indices.contains(j) else { return }
        withMotion(.base, reduceMotion: reduce) { rules.swapAt(i, j) }
    }
}
