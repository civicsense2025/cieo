import SwiftUI
import MotionKit

public struct AccordionAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "accordion", category: "Content", name: "Accordion",
        summary: "Height springs to the measured body. The chevron turns on the same spring and the body fades in with height.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open: Int?
    private let items = [
        ("Can I use my own domain?", "Yes. Add it under Settings, then point a CNAME at your site. Certificates renew on their own."),
        ("Is there a free plan?", "The Starter plan is free for one site with up to 1,000 monthly visitors."),
        ("How do refunds work?", "Cancel within 14 days of a charge and we refund it in full, no form needed."),
    ]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 0) {
                ForEach(items.indices, id: \.self) { i in
                    if i > 0 { Divider() }
                    row(i)
                }
            }
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .frame(maxWidth: 380)
        }
    }

    private func row(_ i: Int) -> some View {
        let isOpen = open == i
        return VStack(spacing: 0) {
            Button { withMotion(.base, reduceMotion: reduce) { open = isOpen ? nil : i } } label: {
                HStack(spacing: 10) {
                    Text(items[i].0).fontWeight(.medium).multilineTextAlignment(.leading)
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.down").font(.footnote.weight(.semibold))
                        .rotationEffect(.degrees(isOpen ? 180 : 0))
                }
                .padding(.horizontal, 16).padding(.vertical, 13)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityValue(isOpen ? "Expanded" : "Collapsed")
            BasicsHeightReveal(open: isOpen) {
                Text(items[i].1).font(.footnote).foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 16).padding(.bottom, 14)
                    .opacity(isOpen ? 1 : 0)
                    .offset(y: isOpen ? 0 : -4)
            }
        }
    }
}
