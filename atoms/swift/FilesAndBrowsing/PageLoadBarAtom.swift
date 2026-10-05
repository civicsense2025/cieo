import SwiftUI
import Cieo

public struct PageLoadBarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "loadbar", category: "Files and browsing", name: "Page load bar",
        summary: "While a page loads, the bar creeps toward 90% on an easing curve and never stalls at a fixed point. When the page arrives it springs to the end and fades, and the content swaps.")

    private let pages = [("Home", "A weekly letter about rivers, routes and slow mornings."), ("Archive", "142 issues since 2023, newest first."), ("About", "Written by Maya Chen from a small studio by the river.")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var page = 0
    @State private var loading: Date?
    @State private var finalWidth = 0.0
    @State private var barOpacity = 0.0
    @State private var load: Task<Void, Never>?
    public init() {}

    private func creep(_ since: Date, _ now: Date) -> Double { 0.9 * (1 - exp(-now.timeIntervalSince(since) / 0.9)) }

    public var body: some View {
        AtomStage(hint: "Open another page") {
            VStack(spacing: 0) {
                ZStack(alignment: .topLeading) {
                    TimelineView(.animation(paused: loading == nil)) { tl in
                        GeometryReader { g in
                            Rectangle().fill(Color.accentColor).frame(width: g.size.width * (loading.map { creep($0, tl.date) } ?? finalWidth))
                                .opacity(barOpacity)
                        }
                    }.frame(height: 3).accessibilityHidden(true)
                    VStack(alignment: .leading, spacing: 0) {
                        HStack(spacing: 14) {
                            ForEach(pages.indices, id: \.self) { i in
                                Button(pages[i].0) { open(i) }.buttonStyle(.plain).font(.footnote.weight(.medium))
                            }
                        }.padding(16)
                        Divider()
                        ZStack(alignment: .topLeading) {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(pages[page].0).font(.title3.bold())
                                Text(pages[page].1).font(.footnote).foregroundStyle(.secondary)
                            }.padding(16).id(page).motionTransition(.swap())
                        }
                        .animation(reduce ? nil : .motion(.base), value: page)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    }
                }
                .frame(width: 320, height: 220)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    private func open(_ i: Int) {
        guard i != page else { return }
        load?.cancel()
        var t = Transaction(); t.disablesAnimations = true
        withTransaction(t) { finalWidth = 0; barOpacity = 1; loading = Date() }
        load = Task {
            try? await Task.sleep(for: .seconds(0.9 + Double.random(in: 0...1.4)))
            if Task.isCancelled { return }
            var t = Transaction(); t.disablesAnimations = true
            withTransaction(t) { finalWidth = loading.map { creep($0, Date()) } ?? 0; loading = nil }
            withMotion(.snap, reduceMotion: reduce) { finalWidth = 1 }
            withAnimation(reduce ? nil : .motion(.base).delay(0.2)) { barOpacity = 0 }
            withMotion(.base, reduceMotion: reduce) { page = i }
        }
    }
}
