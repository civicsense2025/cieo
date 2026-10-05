import SwiftUI
import Cieo

public struct AgentIllustrationsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentillustrations", category: "Agent identity", name: "Agent spot illustrations",
        summary: "Sixteen spot drawings for agent states, drawn like the role icons at a larger size: a paper plate, one soft leaf wash in the scene’s group colour, a few round-capped strokes, simple glyphs (page, lens, pin, pencil, key, envelope, clock) and the small tilted equator under the subject. Agents are the square role-icon tile and people are round heads. Each card traces its strokes when it first scrolls into view, then pins, seals and tiles settle on a critically damped spring; the wash breathes, the arc turns in quarter steps and one small part moves (a lens scanning, a plug trying again, a clock ticking) only while you hover, focus or (on a phone) land on that card, and everything holds still off-screen or under reduced motion. Tapping a card grows its plate into a large view, the title and caption follow 80ms later, Previous and Next swap drawings (old one out, new one traces in) and Replay draws it again.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Spot { let title: String; let caption: String; let symbol: String; let wash: Color }
    @State private var open: Int?
    @State private var trace: [Int: CGFloat] = [:]
    @State private var hover: Int?
    @Namespace private var ns
    public init() {}

    private let spots = [Spot(title: "No runs yet", caption: "Start one to see it here.", symbol: "doc", wash: .green), Spot(title: "Reviewing", caption: "Looking at the page.", symbol: "magnifyingglass", wash: .blue),
                         Spot(title: "Pinned", caption: "A finding is on the page.", symbol: "mappin", wash: .orange), Spot(title: "Suggesting", caption: "A change is ready.", symbol: "pencil", wash: .pink),
                         Spot(title: "Needs access", caption: "Grant a key to continue.", symbol: "key", wash: .purple), Spot(title: "Message sent", caption: "Waiting for a reply.", symbol: "envelope", wash: .teal),
                         Spot(title: "Waiting", caption: "Paused until you answer.", symbol: "clock", wash: .yellow), Spot(title: "Done", caption: "Nothing left to do.", symbol: "checkmark", wash: .green),
                         Spot(title: "Retrying", caption: "Trying the connection again.", symbol: "powerplug", wash: .red), Spot(title: "Blocked", caption: "This page needs sign-in.", symbol: "lock", wash: .gray),
                         Spot(title: "Offline", caption: "No connection.", symbol: "wifi.slash", wash: .brown), Spot(title: "Searching", caption: "Looking through pages.", symbol: "doc.text.magnifyingglass", wash: .mint),
                         Spot(title: "Uploading", caption: "Sending files.", symbol: "arrow.up.doc", wash: .indigo), Spot(title: "Reading", caption: "Taking notes.", symbol: "book", wash: .cyan),
                         Spot(title: "Handing off", caption: "Another agent takes over.", symbol: "arrow.left.arrow.right", wash: .orange), Spot(title: "Resolved", caption: "Closed with a note.", symbol: "tray.full", wash: .green)]

    public var body: some View {
        AtomStage(hint: "Tap a card for the large view") {
            ZStack {
                ScrollView {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 4), spacing: 8) {
                        ForEach(spots.indices, id: \.self) { i in
                            Button { withMotion(.base, reduceMotion: reduce) { open = i } } label: { plate(i, big: false).matchedGeometryEffect(id: i, in: ns, isSource: open != i) }
                                .buttonStyle(.plain).onHover { hover = $0 ? i : (hover == i ? nil : hover) }
                                .accessibilityLabel(spots[i].title)
                        }
                    }
                }
                if let o = open {
                    ZStack {
                        Color.black.opacity(0.25).onTapGesture { withMotion(.base, reduceMotion: reduce) { open = nil } }
                        VStack(spacing: 8) {
                            plate(o, big: true).frame(width: 190, height: 150).matchedGeometryEffect(id: o, in: ns, isSource: true)
                            SwapText(spots[o].title).font(.headline); SwapText(spots[o].caption).font(.caption).foregroundStyle(.secondary)
                            HStack {
                                Button("Previous") { step(-1) }; Button("Next") { step(1) }; Button("Replay") { draw(o) }; Button("Close") { withMotion(.base, reduceMotion: reduce) { open = nil } }
                            }.buttonStyle(AgPress())
                        }.padding(14).background(.background, in: RoundedRectangle(cornerRadius: 14)).shadow(radius: 10)
                    }
                }
            }
            .frame(minHeight: 250)
        }
        .onAppear { for i in spots.indices { draw(i) } }
    }

    private func plate(_ i: Int, big: Bool) -> some View {
        let s = spots[i], t = trace[i] ?? 0, h = hover == i || big
        return ZStack {
            RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04))
            Circle().fill(s.wash.opacity(0.22)).scaleEffect(h ? 1.05 : 1).padding(10)
            Circle().trim(from: 0, to: t).stroke(Color.primary, style: StrokeStyle(lineWidth: 1.4, lineCap: .round)).rotationEffect(.degrees(-90)).padding(10)
            Image(systemName: s.symbol).font(.system(size: big ? 40 : 22)).opacity(t > 0.4 ? 1 : 0).scaleEffect(t > 0.4 ? 1 : 0.7).rotationEffect(.degrees(h ? 6 : 0))
            Ellipse().stroke(Color.primary, lineWidth: 1).frame(width: big ? 80 : 36, height: big ? 20 : 9).rotationEffect(.degrees(-18 + (h ? 90 : 0))).offset(y: big ? 52 : 28)
        }
        .aspectRatio(1.1, contentMode: .fit).animation(reduce ? nil : .motion(.base), value: h)
    }

    private func step(_ d: Int) { withMotion(.base, reduceMotion: reduce) { open = ((open ?? 0) + d + spots.count) % spots.count }; draw(open ?? 0) }
    private func draw(_ i: Int) {
        trace[i] = 0
        withMotion(.soft, reduceMotion: reduce) { trace[i] = 1 }
    }
}
