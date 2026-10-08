import SwiftUI
import Cieo

public struct SplitDividerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "splitdiv", category: "Views", name: "Split-view divider",
        summary: "The divider tracks the finger 1:1 and rubber-bands at the minimum widths. On release both panes spring soft together to the nearest stop. Dragged under 100pt the master collapses into an overlay with a dim.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var pos: CGFloat = 160
    @State private var overlay: Bool = false
    @State private var collapse = true
    private let stops: [CGFloat] = [140, 200, 260]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the divider") {
            VStack(spacing: 8) {
                GeometryReader { g in
                    let w = g.size.width
                    ZStack(alignment: .leading) {
                        HStack(spacing: 0) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Inbox").font(.headline)
                                Text("4 threads").font(.caption).foregroundStyle(.secondary)
                                Divider().padding(.top, 6)
                                Text("Agenda for Thursday").font(.footnote).padding(.vertical, 6)
                                Divider()
                                Text("Budget testimony").font(.footnote).padding(.vertical, 6)
                            }
                            .padding(.leading, 14).padding(.trailing, 10).padding(.top, 12)
                            .frame(width: overlay ? 220 : pos, alignment: .topLeading)
                            .frame(maxHeight: .infinity)
                            .background(.quaternary.opacity(0.5))
                            .zIndex(overlay ? 2 : 0)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Agenda for Thursday").font(.headline)
                                Text("Maya Okafor").font(.caption).foregroundStyle(.secondary)
                                Text("Item 4 moved ahead of the budget amendments. Public comment now opens the meeting.").font(.footnote).padding(.top, 4)
                                Spacer(minLength: 0)
                            }
                            .padding(14)
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                        }
                        if overlay { Color.black.opacity(0.4).zIndex(1).allowsHitTesting(false) }
                        RoundedRectangle(cornerRadius: 2).fill(.quaternary)
                            .frame(width: 4, height: 36)
                            .offset(x: (overlay ? 220 : pos) - 2)
                            .zIndex(3)
                            .gesture(DragGesture(minimumDistance: 2).onChanged { v in
                                if !dragging { dragging = true; start = pos }
                                let raw = start + v.translation.width
                                pos = clamped(raw, in: w)
                                overlay = collapse && raw < 100
                            }.onEnded { _ in
                                dragging = false
                                let near = stops.min(by: { abs($0 - pos) < abs($1 - pos) }) ?? pos
                                start = near
                                withMotion(.soft, reduceMotion: reduce) { pos = near }
                                withMotion(.base, reduceMotion: reduce) { overlay = collapse && near < 100 }
                            })
                    }
                }
                .frame(width: 380, height: 220)
                .background(.background, in: RoundedRectangle(cornerRadius: 12))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
                Toggle("Collapse to overlay under 100pt", isOn: $collapse)
                    .font(.caption).foregroundStyle(.secondary).frame(maxWidth: 380)
                    .onChange(of: collapse) { _, on in
                        withMotion(.base, reduceMotion: reduce) { overlay = on && pos < 100 }
                    }
            }
        }
    }

    @State private var start: CGFloat = 160
    @State private var dragging = false

    private func clamped(_ v: CGFloat, in w: CGFloat) -> CGFloat {
        if v < 80 { return 80 + rubber(v - 80) }
        if v > w - 120 { return (w - 120) + rubber(v - (w - 120)) }
        return v
    }

    private func rubber(_ x: CGFloat) -> CGFloat {
        let d: CGFloat = 90
        return d * (1 - 1 / (abs(x) * 0.55 / d + 1)) * (x >= 0 ? 1 : -1)
    }
}
