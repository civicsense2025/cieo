import SwiftUI
import Cieo

public struct SplitTabsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "splittabs", category: "Email", name: "Split tabs",
        summary: "Tab edges trail 60ms behind the pick while counts roll down as mail is triaged. The empty split fades in and its width springs shut to fit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var cur = 0
    @State private var counts = [12, 3, 0]
    @State private var showCounts = true
    @Namespace private var tab
    public init() {}
    private let names = ["Team", "VIP", "Tools"]
    private let rows = [
        [("MQ", "Pricing draft", "Tue"), ("JK", "Scope v2", "Tue")],
        [("AC", "Board pre-read", "Mon")],
        [],
    ]
    private var empty: Bool { rows[cur].isEmpty }

    public var body: some View {
        AtomStage(hint: "Tabs trail edges; Tools is empty") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 4) {
                        ForEach(names.indices, id: \.self) { i in
                            Button {
                                withMotion(.base, reduceMotion: reduce) {
                                    cur = i
                                    if counts[i] > 0 && !rows[i].isEmpty { counts[i] -= 1 }
                                }
                            } label: {
                                HStack(spacing: 6) {
                                    Text(names[i]).font(.caption.weight(.medium))
                                    if showCounts {
                                        RollingDigits(counts[i]).font(.caption).foregroundStyle(.secondary)
                                    }
                                }
                                .padding(.horizontal, 12).padding(.vertical, 7)
                                .background {
                                    if cur == i {
                                        Capsule().fill(Color.primary.opacity(0.1))
                                            .matchedGeometryEffect(id: "split", in: tab)
                                    }
                                }
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("\(names[i]), \(counts[i]) mails")
                        }
                    }
                    .padding(3)
                    .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.06)))
                    VStack(spacing: 0) {
                        if empty {
                            SwapText("Tools is quiet").font(.caption).foregroundStyle(.secondary)
                                .frame(height: 64, alignment: .center)
                        } else {
                            ForEach(rows[cur].indices, id: \.self) { i in
                                HStack(spacing: 10) {
                                    Circle().fill(Color.accentColor.opacity(0.15))
                                        .frame(width: 34, height: 34)
                                        .overlay(Text(rows[cur][i].0).font(.caption2.weight(.semibold)))
                                    VStack(alignment: .leading, spacing: 1) {
                                        Text(rows[cur][i].1).font(.caption.weight(.semibold))
                                        Text(rows[cur][i].2).font(.caption).foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                }
                                .padding(.vertical, 9)
                                if i < rows[cur].count - 1 { Divider() }
                            }
                        }
                    }
                    .frame(height: empty ? 64 : 156, alignment: .top)
                    .clipped()
                    .animation(reduce ? nil : .motion(.base), value: cur)
                }
                .padding(14).frame(width: 320)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                Toggle("Show counts", isOn: $showCounts)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
    }
}
