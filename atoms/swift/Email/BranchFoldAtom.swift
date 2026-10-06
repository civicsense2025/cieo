import SwiftUI
import Cieo

public struct BranchFoldAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "branchfold", category: "Email", name: "Branch fold",
        summary: "Quoted ancestry collapses into an indented tree. Connectors draw on lazy while the chevron turns on base, and the count swaps between show and hide.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = true
    @State private var foldSigs = false
    public init() {}
    private let quotes = [("M", "Maya · Tue"), ("J", "Jon · Mon"), ("P", "Pri · Fri")]
    private var rowCount: Int { 3 + (foldSigs ? 1 : 0) }

    public var body: some View {
        AtomStage(hint: "Fold the quoted ancestry") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 10) {
                        Circle().fill(Color.accentColor.opacity(0.15))
                            .frame(width: 34, height: 34)
                            .overlay(Text("JK").font(.caption2.weight(.semibold)))
                        Text("Re: Budget v2").font(.callout.weight(.semibold))
                    }
                    Text("Agreed — shipping the v2 scope.").font(.caption)
                    Button {
                        withMotion(.base, reduceMotion: reduce) { open.toggle() }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "chevron.down")
                                .rotationEffect(.degrees(open ? 0 : -90))
                                .animation(reduce ? nil : .motion(.base), value: open)
                            SwapText(open ? "Hide 3 quoted" : "Show 3 quoted").font(.caption)
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(quotes.indices, id: \.self) { i in
                            quoteRow(initial: quotes[i].0, text: quotes[i].1, indent: i, delay: Double(i) * 0.03)
                        }
                        if foldSigs {
                            quoteRow(initial: "S", text: "Sig · Sent from iPhone", indent: 3, delay: 0.09)
                        }
                    }
                    .frame(height: open ? CGFloat(rowCount * 52) : 0, alignment: .top)
                    .clipped()
                    .opacity(open ? 1 : 0)
                    .animation(reduce ? nil : .motion(.base), value: open)
                }
                .padding(14).frame(width: 300)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                Toggle("Fold signatures too", isOn: $foldSigs)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
    }

    private func quoteRow(initial: String, text: String, indent: Int, delay: Double) -> some View {
        HStack(spacing: 8) {
            RoundedRectangle(cornerRadius: 1).fill(Color.secondary.opacity(0.4))
                .frame(width: 2, height: 32)
                .scaleEffect(y: open ? 1 : 0, anchor: .top)
                .animation(reduce ? nil : .motion(.lazy).delay(delay), value: open)
            Circle().fill(Color.accentColor.opacity(0.15))
                .frame(width: 32, height: 32)
                .overlay(Text(initial).font(.caption2.weight(.semibold)))
            Text(text).font(.caption)
        }
        .padding(.leading, CGFloat(12 * indent))
        .frame(height: 52, alignment: .leading)
    }
}
