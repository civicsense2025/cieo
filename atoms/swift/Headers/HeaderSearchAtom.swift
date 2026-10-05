import SwiftUI
import Cieo

public struct HeaderSearchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-search", category: "Headers", name: "Header: search expands in place",
        summary: "Press the search icon (or “/”) and the pill widens in place to 320px while the links, centered in the room left over, are pushed toward the logo; when they no longer fit they blur out instead of wrapping. The results panel drops from the field with its height following the number of matches; typing collapses non-matching rows and keeps the rest. Narrow: the field takes the whole bar, the logo and burger step aside.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var query = ""
    @FocusState private var focused: Bool
    private let all = ["Pricing plans", "Product tour", "Docs home", "Blog archive", "Changelog", "Contact"]
    private var rows: [String] { query.isEmpty ? all : all.filter { $0.localizedCaseInsensitiveContains(query) } }
    public init() {}
    public var body: some View {
        AtomStage(hint: "Press the magnifier, or the / key") {
            VStack(alignment: .trailing, spacing: 6) {
                HStack(spacing: 12) {
                    HdrLogo()
                    HStack(spacing: 14) { ForEach(hdrLinks, id: \.self) { Text($0).font(.caption).fixedSize() } }
                        .blur(radius: open ? 6 : 0).opacity(open ? 0 : 1).frame(maxWidth: .infinity, alignment: .leading)
                    HStack(spacing: 6) {
                        Button { toggle() } label: { Image(systemName: open ? "xmark" : "magnifyingglass") }.buttonStyle(.plain).accessibilityLabel(open ? "Close search" : "Search")
                        if open {
                            TextField("Search", text: $query).textFieldStyle(.plain).focused($focused).font(.callout)
                                .transition(.opacity)
                        }
                    }
                    .padding(.horizontal, 10).frame(width: open ? 210 : 34, height: 30)
                    .background(.quaternary, in: Capsule())
                }
                .padding(10).frame(maxWidth: .infinity)
                .background(.background, in: RoundedRectangle(cornerRadius: 10)).overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.quaternary))
                .animation(reduce ? nil : .motion(.soft), value: open)
                if open {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(rows, id: \.self) { Text($0).font(.callout).padding(.horizontal, 10).padding(.vertical, 6).frame(maxWidth: .infinity, alignment: .leading).transition(reduce ? .identity : .megaBlur) }
                        if rows.isEmpty { Text("No matches").font(.caption).foregroundStyle(.secondary).padding(10) }
                    }
                    .frame(width: 230).background(.background, in: RoundedRectangle(cornerRadius: 8)).overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary))
                    .animation(reduce ? nil : .motion(.soft), value: rows)
                    .motionTransition(.presence)
                }
                Spacer(minLength: 0)
            }
            .focusable().focusEffectDisabled()
            .onKeyPress("/") { if !open { toggle() }; return open ? .ignored : .handled }
            .onKeyPress(.escape) { if open { toggle() }; return .handled }
        }
    }

    private func toggle() {
        withMotion(.soft, reduceMotion: reduce) { open.toggle() }
        if open { query = ""; focused = true }
    }
}
