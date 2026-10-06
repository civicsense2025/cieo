import SwiftUI
import Cieo

public struct AccordionFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-accordion", category: "Footers", name: "Accordion footer on mobile",
        summary: "Below 520px each column becomes a disclosure: the chevron rotates 180° and the panel’s height springs open while its links rise in one after another, 70ms apart. Other sections keep their own state. If the footer was at the bottom of the page the scroll stays pinned there, so the opening list is never pushed off screen. At wider widths the same markup is plain columns and the buttons disappear.")
    public init() {}
    public var body: some View { FootPage(blocks: 1) { AccordionFooter() }.accessibilityElement(children: .contain) }
}

private struct AccordionFooter: View {
    @State private var dividers = true
    private let cols: [(String, [String])] = [("Product", ["Overview", "Pricing", "Changelog"]), ("Company", ["About", "Careers", "Press"]), ("Support", ["Docs", "Contact", "Status"])]
    var body: some View {
        VStack(spacing: 8) {
            Toggle("Dividers", isOn: $dividers).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
            VStack(spacing: 0) {
                ForEach(cols.indices, id: \.self) { i in
                    FooterSection(title: cols[i].0, links: cols[i].1, showDivider: dividers && i < cols.count - 1)
                }
            }
            .overlay(alignment: .top) { Divider() }
        }
    }
}

private struct FooterSection: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let title: String
    let links: [String]
    let showDivider: Bool
    @State private var open = false
    var body: some View {
        VStack(spacing: 0) {
            Button { withMotion(.soft, reduceMotion: reduce) { open.toggle() } } label: {
                HStack { Text(title).font(.callout.weight(.semibold)); Spacer(); Image(systemName: "chevron.down").rotationEffect(.degrees(open ? 180 : 0)).motion(.snap, value: open) }
                    .padding(.vertical, 12).contentShape(Rectangle())
            }.buttonStyle(.plain).accessibilityValue(open ? "expanded" : "collapsed")
            VStack(alignment: .leading, spacing: 8) {
                ForEach(links.indices, id: \.self) { i in
                    FootLink(title: links[i]).opacity(open ? 1 : 0.45).offset(y: open ? 0 : 6)
                        .animation(reduce ? nil : .motion(.base).delay(open ? Double(i) * 0.07 : 0), value: open)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .frame(height: open ? CGFloat(links.count) * 26 + 6 : 0, alignment: .top).clipped()
            .animation(reduce ? nil : .motion(.soft), value: open)
            if showDivider {
                Divider()
            }
        }
    }
}
