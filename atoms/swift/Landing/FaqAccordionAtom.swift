import SwiftUI
import Cieo

public struct FaqAccordionAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "faqacc", category: "Landing", name: "FAQ accordion",
        summary: "One row opens at a time with the body height on a spring and the chevron turning on the same spring. Closed rows dim while one is open; a deep link opens its row instantly.")

    private let rows = [
        ("Can I use my own domain?", "Yes. Add it under Settings, then point a CNAME at your site. Certificates renew on their own."),
        ("Is there a free plan?", "The Starter plan is free for one site with up to 1,000 monthly visitors."),
        ("How do refunds work?", "Cancel within 14 days of a charge and we refund it in full, no form needed.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open: Int? = nil
    public init() {}

    private func faqRow(_ i: Int) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                withMotion(.base, reduceMotion: reduce) { open = (open == i ? nil : i) }
            } label: {
                HStack {
                    Text(rows[i].0).font(.subheadline.weight(.medium)).multilineTextAlignment(.leading)
                    Spacer()
                    Image(systemName: "chevron.down").rotationEffect(.degrees(open == i ? 180 : 0))
                        .animation(reduce ? nil : .motion(.base), value: open)
                }.padding(.vertical, 13).padding(.horizontal, 16).contentShape(Rectangle())
            }.buttonStyle(.plain).accessibilityValue(open == i ? "Expanded" : "Collapsed")
            if open == i {
                Text(rows[i].1).font(.footnote).foregroundStyle(.secondary)
                    .padding(.horizontal, 16).padding(.bottom, 14)
                    .id(i).motionTransition(.swap())
            }
        }
        .opacity(open == nil || open == i ? 1 : 0.55)
        .animation(reduce ? nil : .motion(.snap), value: open)
    }

    public var body: some View {
        AtomStage(hint: "Single-open · closed rows dim") {
            VStack(alignment: .leading, spacing: 0) {
                Text("Questions, answered").font(.headline).padding(.bottom, 4)
                Text("Everything else lives in the docs.").font(.caption).foregroundStyle(.secondary).padding(.bottom, 12)
                ForEach(rows.indices, id: \.self) { i in
                    faqRow(i)
                    if i < rows.count - 1 { Divider() }
                }
                Button("Collapse all") { withMotion(.base, reduceMotion: reduce) { open = nil } }
                    .font(.caption).buttonStyle(.borderless).padding(.top, 12)
            }.frame(maxWidth: 340)
        }
    }
}
