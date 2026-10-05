import SwiftUI
import Cieo

public struct SelectionToolbarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "seltoolbar", category: "Writing", name: "Selection toolbar",
        summary: "The toolbar appears above the selection and glides to the next selection instead of jumping. It leaves quickly when the selection collapses.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let words = "Select a few words in this paragraph. A small toolbar appears above your selection and glides to follow it when you select somewhere else.".split(separator: " ").map(String.init)
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var anchor: Int?
    @State private var head: Int?
    @State private var shown = false
    @State private var pos = CGPoint.zero
    @State private var pressed: Set<Int> = []
    public init() {}

    private var selection: ClosedRange<Int>? {
        guard let a = anchor, let h = head, a != h else { return nil }
        return min(a, h)...max(a, h)
    }

    private func word(at p: CGPoint) -> Int? {
        frames.first { ($0.value.insetBy(dx: -2, dy: -3)).contains(p) }.flatMap { $0.key as? Int }
    }

    private func target(_ r: ClosedRange<Int>) -> CGPoint {
        let fs = r.compactMap { frames[$0] }
        let rect = fs.reduce(fs[0]) { $0.union($1) }
        let top = fs.map(\.minY).min() ?? rect.minY
        return CGPoint(x: min(max(rect.midX, 90), 230), y: top - 26)
    }

    public var body: some View {
        AtomStage(hint: "Drag across some words") {
            ZStack(alignment: .topLeading) {
                WritingWords(words: words, space: "p", font: .callout, highlighted: selection)
                    .frame(width: 320).coordinateSpace(name: "p")
                    .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    .contentShape(Rectangle())
                    .gesture(DragGesture(minimumDistance: 0, coordinateSpace: .named("p"))
                        .onChanged { d in
                            if anchor == nil || d.translation == .zero { anchor = word(at: d.startLocation); head = anchor }
                            else if let w = word(at: d.location) { head = w }
                            update()
                        }
                        .onEnded { d in if d.translation == .zero { anchor = nil; head = nil; update() } })
                    .accessibilityLabel(words.joined(separator: " "))
                toolbar.position(x: pos.x, y: pos.y)
                    .opacity(shown ? 1 : 0).scaleEffect(shown ? 1 : 0.96).allowsHitTesting(shown)
                    .animation(reduce ? nil : .motion(shown ? .base : .snap), value: shown)
            }
            .frame(width: 320, height: 150, alignment: .topLeading).padding(.top, 36)
        }
    }

    private var toolbar: some View {
        HStack(spacing: 2) {
            ForEach(Array(["bold", "italic", "underline", "link"].enumerated()), id: \.offset) { i, name in
                Button { if pressed.contains(i) { pressed.remove(i) } else { pressed.insert(i) } } label: {
                    Image(systemName: name).frame(width: 30, height: 30)
                        .background(pressed.contains(i) ? AnyShapeStyle(.quaternary) : AnyShapeStyle(.clear), in: RoundedRectangle(cornerRadius: 7))
                }
                .buttonStyle(.plain).accessibilityLabel(name.capitalized).accessibilityAddTraits(pressed.contains(i) ? .isSelected : [])
            }
        }
        .padding(4).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(.quaternary)).shadow(color: .black.opacity(0.12), radius: 6, y: 2)
    }

    private func update() {
        guard let r = selection, frames[r.lowerBound] != nil else { if shown { withMotion(.snap, reduceMotion: reduce) { shown = false } }; return }
        let t = target(r)
        if !shown {
            var tx = Transaction(); tx.disablesAnimations = true
            withTransaction(tx) { pos = CGPoint(x: t.x, y: t.y + 6) }
            DispatchQueue.main.async { withMotion(.base, reduceMotion: reduce) { pos = t; shown = true } }
        } else {
            withMotion(.base, reduceMotion: reduce) { pos = t }
        }
    }
}
