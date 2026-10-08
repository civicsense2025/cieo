import SwiftUI
import Cieo

public struct SitemapSearchFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz3-sitemap", category: "Footers", name: "Mega footer with sitemap search",
        summary: "Typing filters the whole map at once. Every link that does not match steps back to 16% opacity with a slight blur, 5ms apart in reading order, while matches stay full and underline from the left. A column with no match dims its heading, the count rolls its digits, and no results opens a one-line hint below the field. Enter or the down arrow moves focus to the first match, Escape clears, and the slash key focuses the field.")
    public init() {}
    public var body: some View { FootPage(blocks: 1, hint: "Type to filter the sitemap; / focuses, Escape clears") { Sitemap() } }
}

private struct Sitemap: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var query = ""
    @FocusState private var focused: Bool
    private let cols: [(String, [String])] = [
        ("Product", ["Overview", "Pricing", "Changelog", "Roadmap"]), ("Company", ["About", "Careers", "Press", "Contact"]),
        ("Learn", ["Docs", "Guides", "Blog", "Events"]), ("Legal", ["Privacy", "Terms", "Cookies", "Security"])]
    private func hit(_ t: String) -> Bool { query.isEmpty || t.localizedCaseInsensitiveContains(query) }
    private var count: Int { cols.flatMap(\.1).filter(hit).count }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                TextField("Search the sitemap", text: $query).softFieldSurface().focused($focused).frame(maxWidth: 220)
                Spacer()
                HStack(spacing: 4) { RollingDigits(count); Text("links").foregroundStyle(.secondary) }.font(.caption)
                    .accessibilityElement(children: .ignore).accessibilityLabel("\(count) links")
            }
            HStack(alignment: .top, spacing: 14) {
                ForEach(cols.indices, id: \.self) { c in
                    let any = cols[c].1.contains(where: hit)
                    VStack(alignment: .leading, spacing: 6) {
                        Text(cols[c].0).font(.caption.weight(.semibold)).opacity(any ? 1 : 0.3)
                        ForEach(cols[c].1.indices, id: \.self) { r in
                            let t = cols[c].1[r], on = hit(t), order = Double(c * 4 + r)
                            Text(t).font(.callout).foregroundStyle(.secondary)
                                .overlay(alignment: .bottomLeading) {
                                    Rectangle().frame(height: 1).scaleEffect(x: on && !query.isEmpty ? 1 : 0, anchor: .leading).offset(y: 2)
                                }
                                .opacity(on ? 1 : 0.16).blur(radius: on ? 0 : 1.5)
                                .animation(reduce ? nil : .motion(.snap).delay(order * 0.005), value: on)
                        }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            if count == 0 { Text("Nothing matches “\(query)”. Try a shorter word.").font(.caption).foregroundStyle(.secondary).motionTransition(.presence) }
        }
        .padding(.vertical, 14).overlay(alignment: .top) { Divider() }
        .animation(reduce ? nil : .motion(.base), value: count == 0)
        .onKeyPress(.escape) { query = ""; return .handled }
        .onKeyPress("/") { focused ? .ignored : { focused = true; return .handled }() }
    }
}
