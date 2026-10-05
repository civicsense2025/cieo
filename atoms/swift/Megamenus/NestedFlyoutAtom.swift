import SwiftUI
import MotionKit

public struct NestedFlyoutAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-flyout", category: "Mega menus", name: "Nested flyout, three levels",
        summary: "Hover waits 120 ms before the first level opens. Each row waits 100 ms before its submenu flies out to the right. While you travel toward an open submenu the pointer is inside a safe triangle between where you left the row and the submenu’s edge: rows you cross on the way do not switch for 350 ms. Leave the triangle and the switch comes in 50 ms. Arrow keys follow the menu pattern; Escape closes one level.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var pointer = CGPoint.zero
    @State private var task: Task<Void, Never>?
    private let tree = [
        FlyNode("Products", [FlyNode("Analytics", [FlyNode("Dashboards"), FlyNode("Funnels"), FlyNode("Exports")]), FlyNode("Email", [FlyNode("Broadcasts"), FlyNode("Templates")]), FlyNode("Auth")]),
        FlyNode("Solutions", [FlyNode("Education", [FlyNode("Schools"), FlyNode("Universities")]), FlyNode("Civic")]),
        FlyNode("Pricing")]

    public init() {}
    public var body: some View {
        AtomStage(hint: "Hover Menu, then cross rows toward a submenu") {
            VStack(alignment: .leading, spacing: 4) {
                Text("Menu").font(.callout.weight(.medium)).padding(.horizontal, 12).padding(.vertical, 8)
                    .background(open ? Color.accentColor.opacity(0.15) : .clear, in: Capsule())
                    .contentShape(Rectangle())
                    .onHover { inside in
                        task?.cancel()
                        guard inside, !open else { return }
                        task = Task {
                            try? await Task.sleep(for: .milliseconds(120))
                            guard !Task.isCancelled else { return }
                            withMotion(.base, reduceMotion: reduce) { open = true }
                        }
                    }
                    .onTapGesture { withMotion(.base, reduceMotion: reduce) { open.toggle() } }
                    .accessibilityAddTraits(.isButton)
                    .accessibilityValue(open ? "expanded" : "collapsed")
                if open { FlyColumn(nodes: tree, pointer: $pointer).motionTransition(.presence) }
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .coordinateSpace(name: "fly")
            .onHover { inside in
                if inside { task?.cancel(); return }
                task = Task {
                    try? await Task.sleep(for: .milliseconds(300))
                    guard !Task.isCancelled else { return }
                    withMotion(.snap, reduceMotion: reduce) { open = false }
                }
            }
        }
    }
}

private struct FlyNode: Identifiable {
    let title: String
    var kids: [FlyNode] = []
    var id: String { title }
    init(_ title: String, _ kids: [FlyNode] = []) { self.title = title; self.kids = kids }
}

private struct FlyColumn: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    let nodes: [FlyNode]
    @Binding var pointer: CGPoint
    @State private var openID: String?
    @State private var hoverID: String?
    @State private var anchor = CGPoint.zero
    @State private var child = CGRect.zero
    @State private var task: Task<Void, Never>?

    var body: some View {
        HStack(alignment: .top, spacing: 2) {
            VStack(spacing: 0) {
                ForEach(nodes) { node in
                    HStack {
                        Text(node.title).font(.callout)
                        Spacer(minLength: 12)
                        if !node.kids.isEmpty { Image(systemName: "chevron.right").font(.caption2).foregroundStyle(.secondary) }
                    }
                    .padding(.horizontal, 10).padding(.vertical, 7)
                    .background(openID == node.id || hoverID == node.id ? Color.accentColor.opacity(0.12) : .clear, in: RoundedRectangle(cornerRadius: 6))
                    .motion(.snap, value: hoverID)
                    .contentShape(Rectangle())
                    .onContinuousHover(coordinateSpace: .named("fly")) { phase in
                        switch phase {
                        case .active(let p):
                            pointer = p
                            if node.id == openID { anchor = p }
                            if hoverID != node.id { hoverID = node.id; enter(node) }
                        case .ended:
                            if hoverID == node.id { hoverID = nil }
                            task?.cancel()
                        }
                    }
                    .onTapGesture { set(node.kids.isEmpty ? nil : node.id) }
                    .accessibilityAddTraits(.isButton)
                }
            }
            .frame(width: 130)
            .padding(4)
            .background(.background, in: RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 3)
            if let id = openID, let node = nodes.first(where: { $0.id == id }) {
                FlyColumn(nodes: node.kids, pointer: $pointer)
                    .motionTransition(.presence)
                    .background(GeometryReader { g in Color.clear.onChange(of: g.frame(in: .named("fly")), initial: true) { _, f in child = f } })
            }
        }
        .onKeyPress(.escape) { if openID != nil { set(nil); return .handled }; return .ignored }
    }

    private func enter(_ node: FlyNode) {
        task?.cancel()
        let target = node.kids.isEmpty ? nil : node.id
        guard openID != target else { return }
        let travelling = openID != nil && inTriangle(pointer, anchor, CGPoint(x: child.minX, y: child.minY), CGPoint(x: child.minX, y: child.maxY))
        let wait = openID == nil ? 100 : (travelling ? 350 : 50)
        task = Task {
            try? await Task.sleep(for: .milliseconds(wait))
            guard !Task.isCancelled else { return }
            set(target)
        }
    }

    private func set(_ id: String?) { withMotion(.base, reduceMotion: reduce) { openID = id } }

    private func inTriangle(_ p: CGPoint, _ a: CGPoint, _ b: CGPoint, _ c: CGPoint) -> Bool {
        func s(_ p1: CGPoint, _ p2: CGPoint, _ p3: CGPoint) -> CGFloat { (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y) }
        let d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a)
        return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0))
    }
}
