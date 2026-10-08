import SwiftUI
import Cieo

public struct AgentActionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentactions", category: "Agent identity", name: "Agent action and state icons",
        summary: "Twenty-four things an agent does or is, in the agent system: the square tile is the agent and a filled square is its hand. Hover or focus an icon to play its own motion: the caret steps, the page slides, the arc is drawn again. Every loop starts and ends at the resting drawing, so leaving an icon just finishes the turn. In the feed, each new row slides in at the top and pushes the rest down, and its icon plays until the next row arrives. Done, Failed and Blocked take the success, danger and warning colour through the icon and a chip, never a stripe.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Kind { case slide, turn, press, rise, pulse }
    private struct Icon: Identifiable { let id: Int; let name: String; let symbol: String; let kind: Kind; let tone: AgTone }
    @State private var phase: [Int: Double] = [:]
    @State private var brand = false
    @State private var feed: [Int] = []
    @State private var run = 0
    public init() {}

    private let icons: [Icon] = {
        let rows: [(String, String, Kind, AgTone)] = [
            ("Click", "cursorarrow.click", .press, .neutral), ("Type", "keyboard", .slide, .neutral), ("Scroll", "arrow.up.and.down", .rise, .neutral),
            ("Navigate", "arrow.right.circle", .slide, .neutral), ("Read", "doc.text", .slide, .neutral), ("Inspect", "viewfinder", .pulse, .neutral),
            ("Capture", "camera.viewfinder", .pulse, .neutral), ("Pin", "mappin", .rise, .neutral), ("Comment", "bubble.left", .pulse, .neutral),
            ("Suggest", "pencil", .slide, .neutral), ("Wait", "hourglass", .turn, .warning), ("Ask", "questionmark.circle", .pulse, .warning),
            ("Approve", "hand.thumbsup", .rise, .success), ("Search", "magnifyingglass", .turn, .neutral), ("Open", "arrow.up.right.square", .slide, .neutral),
            ("Close", "xmark.square", .press, .neutral), ("Upload", "arrow.up.doc", .rise, .neutral), ("Download", "arrow.down.doc", .rise, .neutral),
            ("Pause", "pause", .press, .neutral), ("Resume", "play", .slide, .neutral), ("Done", "checkmark.circle", .pulse, .success),
            ("Failed", "xmark.octagon", .press, .danger), ("Blocked", "hand.raised", .press, .warning), ("Retry", "arrow.clockwise", .turn, .neutral)]
        return rows.enumerated().map { Icon(id: $0, name: $1.0, symbol: $1.1, kind: $1.2, tone: $1.3) }
    }()

    public var body: some View {
        AtomStage(hint: "Hover or focus an icon to play its motion") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Picker("Form", selection: $brand) { Text("Product").tag(false); Text("Brand").tag(true) }.pickerStyle(.segmented).frame(maxWidth: 170)
                    Button("Play all") { playAll() }.buttonStyle(AgPress())
                    Button("Replay feed") { run += 1 }.buttonStyle(AgPress())
                }
                LazyVGrid(columns: Array(repeating: GridItem(.fixed(44), spacing: 6), count: 8), spacing: 6) {
                    ForEach(icons) { i in tile(i, size: 38) }
                }
                Text("Feed preview").font(.caption.weight(.semibold))
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(feed.reversed().prefix(3), id: \.self) { id in
                        HStack { tile(icons[id], size: 24); Text(icons[id].name).font(.caption); Spacer(); if icons[id].tone != .neutral { AgChip(text: icons[id].name, tone: icons[id].tone) } }
                            .transition(reduce ? .identity : .opacity.combined(with: .move(edge: .top)))
                    }
                }.animation(reduce ? nil : .motion(.base), value: feed.count)
            }
        }
        .task(id: run) {
            feed = []
            for id in [0, 1, 7, 20] { try? await Task.sleep(nanoseconds: 1_000_000_000); withMotion(.base, reduceMotion: reduce) { feed.append(id) }; play(id) }
        }
    }

    private func tile(_ i: Icon, size: CGFloat) -> some View {
        let p = phase[i.id] ?? 0
        return Image(systemName: i.symbol).font(.system(size: size * 0.42))
            .foregroundStyle(i.tone == .neutral ? Color.primary : i.tone.color)
            .offset(x: i.kind == .slide ? p * 4 : 0, y: i.kind == .rise ? -p * 3 : 0)
            .rotationEffect(.degrees(i.kind == .turn ? p * 40 : 0))
            .scaleEffect(i.kind == .press ? 1 - p * 0.14 : i.kind == .pulse ? 1 + p * 0.14 : 1)
            .frame(width: size, height: size)
            .background(brand ? Color.green.opacity(0.18) : .clear, in: RoundedRectangle(cornerRadius: size * 0.22))
            .overlay(RoundedRectangle(cornerRadius: size * 0.22).fill(Color.primary).opacity(0.10).allowsHitTesting(false))
            .onHover { if $0 { play(i.id) } }
            .onTapGesture { play(i.id) }
            .accessibilityLabel(i.name).accessibilityAddTraits(.isButton)
    }

    private func play(_ id: Int) {
        guard phase[id] == nil || phase[id] == 0 else { return }
        Task { @MainActor in
            withMotion(.base, reduceMotion: reduce) { phase[id] = 1 }
            try? await Task.sleep(nanoseconds: 350_000_000)
            withMotion(.base, reduceMotion: reduce) { phase[id] = 0 }
        }
    }
    private func playAll() { for i in icons { Task { @MainActor in try? await Task.sleep(nanoseconds: UInt64(Double(i.id % 8 + i.id / 8) * 40_000_000)); play(i.id) } } }
}
