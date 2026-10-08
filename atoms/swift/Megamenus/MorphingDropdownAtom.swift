import SwiftUI
import Cieo

public struct MorphingDropdownAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mega-morph", category: "Mega menus", name: "Morphing dropdown with caret",
        summary: "There is one panel. Hover waits 120 ms, then it fades in with its caret under the item. Moving to another item never closes it: the caret slides first, the panel follows with lagging edges, width and height morph together, the old content leaves in 100 ms and the new content enters from the direction of travel. Leaving the bar closes it after 220 ms.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open: Int?
    @State private var dir: CGFloat = 1
    @State private var x0: CGFloat = 0
    @State private var x1: CGFloat = 0
    @State private var h: CGFloat = 0
    @State private var caret: CGFloat = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var task: Task<Void, Never>?
    private let names = ["Product", "Solutions", "Company"]
    private let sizes: [CGSize] = [CGSize(width: 250, height: 120), CGSize(width: 330, height: 150), CGSize(width: 200, height: 100)]
    private let lines = [["Analytics", "Email", "Auth", "Storage"], ["Education", "Civic", "Retail", "Media", "Health"], ["About", "Careers", "Press"]]

    public init() {}
    public var body: some View {
        AtomStage(hint: "Hover one item, then slide to the next") {
            GeometryReader { geo in
                ZStack(alignment: .topLeading) {
                    HStack(spacing: 4) {
                        ForEach(names.indices, id: \.self) { i in
                            Text(names[i]).font(.callout.weight(.medium)).padding(.horizontal, 10).padding(.vertical, 8)
                                .reportFrame(i, in: "morph").contentShape(Rectangle())
                                .onHover { inside in task?.cancel(); if inside { schedule(i, geo.size.width) } }
                                .accessibilityAddTraits(.isButton)
                        }
                    }
                    if let open {
                        Image(systemName: "triangle.fill").font(.system(size: 9)).foregroundStyle(.background)
                            .shadow(color: .black.opacity(0.12), radius: 1, y: -1)
                            .offset(x: caret - 5, y: 31).accessibilityHidden(true)
                        RoundedRectangle(cornerRadius: 10, style: .continuous).fill(.background)
                            .background(RoundedRectangle(cornerRadius: 10, style: .continuous).fill(Color.primary.opacity(0.05)))
                            .shadow(color: .black.opacity(0.1), radius: 10, y: 4)
                            .frame(width: max(0, x1 - x0), height: h).offset(x: x0, y: 38)
                            .overlay(alignment: .topLeading) {
                                ZStack(alignment: .topLeading) { content(open) }
                                    .frame(width: max(0, x1 - x0), height: h, alignment: .topLeading).clipped().offset(x: x0, y: 38)
                            }
                            .transition(.opacity.animation(.motion(.base)))
                    }
                }
                .coordinateSpace(name: "morph")
                .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 10))
                .onHover { inside in if inside { task?.cancel() } else { close() } }
            }
        }
    }

    private func content(_ i: Int) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            ForEach(lines[i], id: \.self) { MegaRow(title: $0) }
        }
        .padding(12).frame(width: sizes[i].width, alignment: .leading)
        .id(i)
        .transition(reduce ? .identity : .asymmetric(
            insertion: .opacity.combined(with: .offset(x: 12 * dir)).animation(.motion(.base).delay(Motion.exit)),
            removal: .opacity.animation(.motionExit)))
    }

    private func schedule(_ i: Int, _ width: CGFloat) {
        guard open != i else { return }
        task = Task {
            if open == nil { try? await Task.sleep(for: .milliseconds(120)) }
            guard !Task.isCancelled else { return }
            go(i, width)
        }
    }

    private func go(_ i: Int, _ width: CGFloat) {
        guard let f = frames[AnyHashable(i)] else { return }
        let w = sizes[i].width, nx0 = min(max(8, f.midX - w / 2), width - w - 8)
        if open == nil {
            var t = Transaction(); t.disablesAnimations = true
            withTransaction(t) { x0 = nx0; x1 = nx0 + w; h = sizes[i].height; caret = f.midX }
            withMotion(.base, reduceMotion: reduce) { open = i }
            return
        }
        dir = (open ?? 0) <= i ? 1 : -1
        let right = nx0 >= x0, lag = reduce ? 0 : Motion.lag
        withMotion(.snap, reduceMotion: reduce) { caret = f.midX }
        withAnimation(reduce ? nil : .motion(.base).delay(lag + (right ? Motion.lag : 0))) { x0 = nx0 }
        withAnimation(reduce ? nil : .motion(.base).delay(lag + (right ? 0 : Motion.lag))) { x1 = nx0 + w }
        withAnimation(reduce ? nil : .motion(.soft).delay(lag)) { h = sizes[i].height }
        withMotion(.base, reduceMotion: reduce) { open = i }
    }

    private func close() {
        task = Task {
            try? await Task.sleep(for: .milliseconds(220))
            guard !Task.isCancelled else { return }
            withMotion(.snap, reduceMotion: reduce) { open = nil }
        }
    }
}
