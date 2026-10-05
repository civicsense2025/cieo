import SwiftUI
import MotionKit

public struct FourColumnFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-columns", category: "Footers", name: "Four-column footer",
        summary: "Brand block and four link groups. As the footer scrolls into view each block fades up 10px, left to right, 45ms apart; scrolling back out resets them so the entrance replays. Links draw underlines, and Changelog, Status and Careers carry a pill or an arrow that nudges on hover. Layout is container-driven: five columns, then brand over four columns, then two by two.")
    public init() {}
    public var body: some View { FootPage { ColumnsFooter() } }
}

private struct ColumnsFooter: View {
    private let cols: [(String, [String])] = [("Product", ["Overview", "Pricing", "Changelog"]), ("Company", ["About", "Careers", "Press"]),
        ("Resources", ["Docs", "Guides", "Status"]), ("Legal", ["Privacy", "Terms", "Cookies"])]
    var body: some View {
        ViewThatFits {
            HStack(alignment: .top, spacing: 16) { brand.footRise(0); columns(0..<4, offset: 1) }
            VStack(alignment: .leading, spacing: 14) { brand.footRise(0); columns(0..<4, offset: 1) }
            VStack(alignment: .leading, spacing: 14) {
                brand.footRise(0)
                HStack(alignment: .top) { column(0).footRise(1); column(1).footRise(2) }
                HStack(alignment: .top) { column(2).footRise(3); column(3).footRise(4) }
            }
        }
        .padding(.vertical, 16).overlay(alignment: .top) { Divider() }
    }
    private var brand: some View {
        VStack(alignment: .leading, spacing: 4) { Image(systemName: "hexagon.fill").foregroundStyle(Color.accentColor); Text("Calm tools for teams").font(.caption).foregroundStyle(.secondary) }
            .frame(width: 100, alignment: .leading)
    }
    private func columns(_ r: Range<Int>, offset: Int) -> some View {
        HStack(alignment: .top, spacing: 16) { ForEach(r, id: \.self) { column($0).footRise($0 + offset) } }
    }
    private func column(_ i: Int) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(cols[i].0).font(.caption.weight(.semibold))
            ForEach(cols[i].1, id: \.self) { t in Nudge(title: t) }
        }.frame(minWidth: 70, alignment: .leading)
    }
}

private struct Nudge: View {
    let title: String
    @State private var hover = false
    var body: some View {
        HStack(spacing: 4) {
            FootLink(title: title)
            if title == "Changelog" { Text("New").font(.caption2.weight(.semibold)).padding(.horizontal, 5).background(Color.accentColor.opacity(0.2), in: Capsule()) }
            if title == "Status" || title == "Careers" { Image(systemName: "arrow.right").font(.caption2).offset(x: hover ? 3 : 0).opacity(hover ? 1 : 0.5) }
        }
        .onHover { hover = $0 }.motion(.snap, value: hover)
    }
}
