import SwiftUI
import MotionKit

public struct DrillDownMenuAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-drill", category: "Mega menus", name: "Drill-down menu with back",
        summary: "The menu button opens one panel (on hover after 120 ms, or on click). A row with a chevron pushes the next level in from the right while the current one slides back 30% and fades. The header title swaps in the direction of travel and the Back button fades in with the parent’s name. Back, Escape and a drag from the left edge all pop a level: the drag follows the finger 1:1 and settles from its release velocity.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = true
    @State private var path: [Int] = []
    @State private var track = Track(0, preset: .base)
    @State private var moving = false
    private let root = DrillNode("Menu", [
        DrillNode("Products", [DrillNode("Analytics", [DrillNode("Dashboards"), DrillNode("Reports")]), DrillNode("Email"), DrillNode("Auth")]),
        DrillNode("Company", [DrillNode("About"), DrillNode("Careers")]), DrillNode("Pricing")])

    public init() {}
    public var body: some View {
        AtomStage(hint: "Tap a row with a chevron; drag from the left edge to go back") {
            VStack(spacing: 8) {
                Button { withMotion(.base, reduceMotion: reduce) { open.toggle() } } label: { Label("Menu", systemImage: "line.3.horizontal") }
                if open { panel.transition(.motionPresence) }
                Spacer(minLength: 0)
            }
        }
    }

    private func node(_ depth: Int) -> DrillNode { path.prefix(depth).reduce(root) { $0.kids[$1] } }

    private var panel: some View {
        TimelineView(.animation(paused: !moving)) { ctx in
            let p = track.value(at: ctx.date.timeIntervalSinceReferenceDate)
            let cur = node(path.count), parent = path.isEmpty ? nil : node(path.count - 1)
            VStack(spacing: 0) {
                HStack {
                    Button { pop(velocity: 0) } label: { Label(parent?.title ?? "", systemImage: "chevron.left").font(.callout) }
                        .buttonStyle(.plain).opacity(path.isEmpty ? 0 : 1).motion(.base, value: path.isEmpty)
                        .disabled(path.isEmpty).keyboardShortcut(.escape, modifiers: [])
                    Spacer()
                    SwapText(cur.title).font(.callout.weight(.semibold))
                    Spacer()
                    Color.clear.frame(width: 60, height: 1)
                }
                .padding(10)
                GeometryReader { geo in
                    let w = geo.size.width
                    ZStack(alignment: .topLeading) {
                        if let parent {
                            list(parent, push: false).offset(x: -0.3 * w * (1 - p)).opacity(0.4 + 0.6 * p).allowsHitTesting(false)
                        }
                        list(cur, push: true).offset(x: p * w)
                    }
                    .frame(width: w, alignment: .topLeading)
                    .clipped()
                    .overlay(alignment: .leading) {
                        Color.clear.frame(width: 24).contentShape(Rectangle())
                            .gesture(DragGesture()
                                .onChanged { v in track.jump(min(1, max(0, v.translation.width / w))); moving = false }
                                .onEnded { v in pop(velocity: (v.predictedEndTranslation.width - v.translation.width) / w * 2, from: v.translation.width / w) })
                    }
                }
                .frame(height: 150)
            }
        }
        .background(.background, in: RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.quaternary))
        .frame(maxWidth: 320)
    }

    private func list(_ n: DrillNode, push: Bool) -> some View {
        VStack(spacing: 0) {
            ForEach(n.kids.indices, id: \.self) { i in
                Button { if push && !n.kids[i].kids.isEmpty { self.push(i) } } label: {
                    HStack { Text(n.kids[i].title).font(.callout); Spacer(); if !n.kids[i].kids.isEmpty { Image(systemName: "chevron.right").font(.caption).foregroundStyle(.secondary) } }
                        .padding(.horizontal, 12).padding(.vertical, 9).contentShape(Rectangle())
                }.buttonStyle(.plain)
            }
        }
        .frame(maxWidth: .infinity, alignment: .top)
    }

    private func now() -> Double { Date().timeIntervalSinceReferenceDate }

    private func push(_ i: Int) {
        path.append(i)
        track.jump(1)
        track.set(0, preset: .base, at: now())
        settle(0.5, then: {})
    }

    private func pop(velocity: Double, from: Double = 0) {
        guard !path.isEmpty else { return }
        let commit = from == 0 || from + velocity * 0.15 > 0.4
        if commit { track.release(from: from, velocity: velocity, to: 1, preset: .snap, at: now()) }
        else { track.release(from: from, velocity: velocity, to: 0, preset: .snap, at: now()) }
        settle(0.45) { if commit { path.removeLast(); track.jump(0) } }
    }

    private func settle(_ seconds: Double, then: @escaping () -> Void) {
        if reduce { then(); track.jump(0); return }
        moving = true
        Task {
            try? await Task.sleep(for: .seconds(seconds))
            then()
            moving = false
        }
    }
}

private struct DrillNode {
    let title: String
    var kids: [DrillNode] = []
    init(_ title: String, _ kids: [DrillNode] = []) { self.title = title; self.kids = kids }
}
