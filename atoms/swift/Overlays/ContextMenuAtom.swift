import SwiftUI
import Cieo

public struct ContextMenuAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "contextmenu", category: "Overlays", name: "Context menu",
        summary: "Right-click, or long-press on touch, opens the menu at the pointer. It grows from that exact corner and flips when it would overflow. Items fade in 25ms apart; the destructive item is danger-colored.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var origin: CGRect?
    @State private var anchor = UnitPoint.topLeading
    @State private var last = CGPoint.zero
    @State private var message = "Long-press anywhere here"
    private let size = CGSize(width: 180, height: 214)
    private let items = ["Open", "Rename", "Duplicate", "Move to…", "—", "Delete"]
    public init() {}

    public var body: some View {
        AtomStage {
            GeometryReader { g in
                ZStack(alignment: .topLeading) {
                    VStack(spacing: 14) {
                        HStack(spacing: 10) {
                            Image(systemName: "doc").font(.title3)
                            VStack(alignment: .leading, spacing: 0) {
                                Text("Q3-report.pdf").font(.footnote.weight(.semibold))
                                Text("2.4 MB · edited today").font(.footnote).foregroundStyle(.secondary)
                            }
                        }
                        .padding(.horizontal, 16).padding(.vertical, 12)
                        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                        SwapText(message).font(.caption).foregroundStyle(.secondary)
                    }
                    .frame(width: g.size.width, height: g.size.height)
                    if let o = origin {
                        menu.offset(x: o.minX, y: o.minY)
                            .transition(reduce ? .identity : .basicsPop(anchor: anchor, rise: 0))
                    }
                }
                .contentShape(Rectangle())
                .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged { v in
                    last = v.location
                    if let o = origin, !o.contains(v.location) { close() }
                })
                .simultaneousGesture(LongPressGesture(minimumDuration: 0.45).onEnded { _ in open(in: g.size) })
                .onKeyPress(.escape) { close(); return .handled }
            }
        }
    }

    private var menu: some View {
        VStack(spacing: 0) {
            ForEach(Array(items.enumerated()), id: \.offset) { i, name in
                if name == "—" {
                    Divider().padding(.vertical, 4)
                } else {
                    Item(name: name, index: i) { pick(name) }
                }
            }
        }
        .padding(6).frame(width: size.width)
        .basicsPanel()
        .accessibilityElement(children: .contain)
    }

    private struct Item: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let name: String
        let index: Int
        let action: () -> Void
        @State private var hover = false
        @State private var visible = false
        var body: some View {
            Button(action: action) {
                Text(name).font(.callout).frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 10).padding(.vertical, 7)
                    .foregroundStyle(name == "Delete" ? Color.red : Color.primary)
                    .background(RoundedRectangle(cornerRadius: 7)
                        .fill((name == "Delete" ? Color.red : Color.primary).opacity(hover ? 0.1 : 0)))
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .onHover { hover = $0 }
            .opacity(visible ? 1 : 0)
            .animation(reduce ? nil : .motion(.base).delay(0.03 + Double(index) * 0.025), value: visible)
            .onAppear { visible = true }
        }
    }

    private func open(in area: CGSize) {
        let flipX = last.x + size.width > area.width - 8, flipY = last.y + size.height > area.height - 8
        anchor = UnitPoint(x: flipX ? 1 : 0, y: flipY ? 1 : 0)
        let x = flipX ? last.x - size.width : last.x
        let y = flipY ? max(8, last.y - size.height) : last.y
        withMotion(.base, reduceMotion: reduce) { origin = CGRect(x: x, y: y, width: size.width, height: size.height) }
    }

    private func close() { withMotion(.snap, reduceMotion: reduce) { origin = nil } }

    private func pick(_ name: String) {
        close()
        message = name == "Delete" ? "Moved Q3-report.pdf to trash" : "\(name.replacingOccurrences(of: "…", with: "")): Q3-report.pdf"
    }
}
