import SwiftUI
import Cieo

public struct IssueArchiveAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "issuearchive", category: "Newsletter", name: "Issue archive",
        summary: "The open row springs to its height while its chevron turns. Headlines swap with a short stagger. One open row holds.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = 0
    private let issues = [
        ("#42 — The rivers issue", "Routes, ferries and five slow mornings. 6 min read."),
        ("#41 — Maps we kept", "Three annotated walks plus reader corrections. 4 min read."),
        ("#40 — Winter kitchens", "Broth, bread and one perfect soup pot. 5 min read."),
    ]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open an issue") {
            VStack(alignment: .leading, spacing: 0) {
                Text("Past issues").font(.callout.weight(.semibold)).padding(.bottom, 2)
                Text("Open one; the rest wait their turn.").font(.caption).foregroundStyle(.secondary).padding(.bottom, 8)
                ForEach(issues.indices, id: \.self) { i in
                    VStack(alignment: .leading, spacing: 0) {
                        if i > 0 { Divider() }
                        Button {
                            withMotion(.base, reduceMotion: reduce) { open = (open == i ? -1 : i) }
                        } label: {
                            HStack {
                                Text(issues[i].0).font(.footnote.weight(.semibold))
                                Spacer()
                                Image(systemName: "chevron.down")
                                    .rotationEffect(.degrees(open == i ? 180 : 0))
                                    .animation(reduce ? nil : .motion(.base), value: open)
                                    .foregroundStyle(.secondary)
                            }
                            .contentShape(Rectangle())
                            .padding(.vertical, 12)
                        }
                        .buttonStyle(.plain)
                        .accessibilityValue(open == i ? "Expanded" : "Collapsed")
                        if open == i {
                            Text(issues[i].1).font(.caption).foregroundStyle(.secondary)
                                .padding(.bottom, 12)
                                .motionTransition(.swap())
                        }
                    }
                    .animation(reduce ? nil : .motion(.base).delay(Double(abs(i - max(open, 0))) * 0.04), value: open)
                }
            }
            .padding(16).frame(width: 340)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }
}
