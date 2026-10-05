import SwiftUI
import Cieo

private struct ScrollMetrics: Equatable { var offset: CGFloat = 0; var content: CGFloat = 0 }
private struct ScrollMetricsKey: PreferenceKey {
    static let defaultValue = ScrollMetrics()
    static func reduce(value: inout ScrollMetrics, nextValue: () -> ScrollMetrics) { value = nextValue() }
}

public struct HeaderProgressAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "longpage", category: "Chrome", name: "Header, progress, jump to top",
        summary: "The progress bar tracks scroll 1:1. The header compacts once you leave the top. The back-to-top button enters after one screen and scrolls home on a spring that any wheel input cancels.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let paragraphs = ["The river path was quiet before sunrise, and the only sound was gravel under our boots.",
        "We counted eleven herons between the second bridge and the old mill. Most stood still enough to pass for posts.",
        "By seven the fog lifted off the water in one sheet, and the far bank came back into view like a print developing.",
        "Notes for next time: bring the long lens, leave before five, and take the east fork where the path forks at the mill.",
        "The walk back took half as long. It always does once you know where the path goes.",
        "We stopped at the bakery by the station and ate standing up at the window counter."]
    @State private var metrics = ScrollMetrics()
    private let viewport: CGFloat = 290
    public init() {}

    private var compact: Bool { metrics.offset > 16 }
    private var showTop: Bool { metrics.offset > 180 }
    private var progress: CGFloat { let m = metrics.content - viewport; return m > 0 ? max(0, min(1, metrics.offset / m)) : 0 }

    public var body: some View {
        AtomStage(hint: "Scroll inside the page") {
            ScrollViewReader { proxy in
                ZStack(alignment: .top) {
                    ScrollView {
                        VStack(alignment: .leading, spacing: 12) {
                            Color.clear.frame(height: 0).id("top")
                            ForEach(paragraphs.indices, id: \.self) { Text(paragraphs[$0]).font(.footnote).lineSpacing(4) }
                        }
                        .padding(.init(top: 70, leading: 16, bottom: 60, trailing: 16))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(GeometryReader { g in
                            Color.clear.preference(key: ScrollMetricsKey.self, value: ScrollMetrics(offset: -g.frame(in: .named("page")).minY, content: g.size.height))
                        })
                    }
                    .coordinateSpace(name: "page")
                    .onPreferenceChange(ScrollMetricsKey.self) { metrics = $0 }
                    header
                    Button {
                        withMotion(.soft, reduceMotion: reduce) { proxy.scrollTo("top", anchor: .top) }
                    } label: {
                        Image(systemName: "arrow.up").font(.callout.weight(.bold)).foregroundStyle(.background)
                            .frame(width: 36, height: 36).background(.primary, in: Circle())
                    }
                    .buttonStyle(.plain).accessibilityLabel("Back to top")
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing).padding(12)
                    .opacity(showTop ? 1 : 0).scaleEffect(showTop ? 1 : 0.9).offset(y: showTop ? 0 : 10)
                    .allowsHitTesting(showTop)
                    .animation(reduce ? nil : .motion(showTop ? .base : .snap), value: showTop)
                }
                .frame(width: 380, height: viewport)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    private var header: some View {
        HStack {
            Text("Field Notes").fontWeight(.bold).scaleEffect(compact ? 1 : 1.15, anchor: .leading)
            Spacer()
            Text("Subscribe").font(.caption).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 16).frame(height: compact ? 42 : 56)
        .background(.background)
        .overlay(alignment: .bottomLeading) {
            GeometryReader { g in Rectangle().fill(.primary).frame(width: g.size.width * progress, height: 2) }.frame(height: 2)
        }
        .shadow(color: .black.opacity(compact ? 0.1 : 0), radius: 4, y: 1)
        .animation(reduce ? nil : .motion(.base), value: compact)
        .accessibilityElement(children: .combine)
        .accessibilityValue("\(Int(progress * 100)) percent read")
    }
}
