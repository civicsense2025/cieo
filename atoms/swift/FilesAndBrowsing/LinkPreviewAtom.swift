import SwiftUI
import Cieo

public struct LinkPreviewAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "linkpreview", category: "Files and browsing", name: "Link preview",
        summary: "Resting on a link opens a preview after 300ms. Moving to another link keeps the card open and glides it to the new link while the content swaps, so scanning several links stays calm.")

    private let links = [("Stratechery", "stratechery.com", "Aggregation theory and the end of long posts", Color.accentColor),
                         ("Craig Mod", "craigmod.com", "Membership, slowly: notes from a small press", Color.gray),
                         ("Patio11’s essay", "kalzumeus.com", "Charge more: pricing for small software", Color.primary)]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var current: Int?
    @State private var pending: Task<Void, Never>?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Rest on a link, then slide to the next") {
            ZStack(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("We moved the offer to the end of long posts, borrowing from these three writers.").font(.callout)
                    HStack(spacing: 14) {
                        ForEach(links.indices, id: \.self) { i in
                            Text(links[i].0).fontWeight(.semibold).underline(color: .secondary)
                                .reportFrame(i, in: "lp")
                                .onHover { inside in inside ? enter(i) : leave() }
                                .onTapGesture { show(i) }
                                .accessibilityAddTraits(.isLink)
                        }
                    }.font(.callout)
                }
                .frame(maxWidth: 320, alignment: .leading)
                if let i = current, let f = frames[i] {
                    card(i)
                        .position(x: min(max(f.midX, 125 + 8), 320 - 125 - 8), y: f.maxY + 8 + 68)
                        .motionTransition(.presence)
                }
            }
            .coordinateSpace(name: "lp")
            .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
            .frame(width: 320, height: 240, alignment: .topLeading)
            .motion(.base, value: current)
        }
        .onDisappear { pending?.cancel() }
    }

    private func card(_ i: Int) -> some View {
        VStack(spacing: 0) {
            links[i].3.opacity(0.7).frame(height: 70)
            VStack(alignment: .leading, spacing: 2) {
                Text(links[i].1).font(.caption).foregroundStyle(.secondary)
                Text(links[i].2).font(.footnote.weight(.semibold))
            }
            .id(i).motionTransition(.swap())
            .padding(10).frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(width: 250, height: 136, alignment: .top)
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.15), radius: 10, y: 3)
        .onHover { inside in if inside { pending?.cancel() } else { leave() } }
    }

    private func show(_ i: Int) { withMotion(.base, reduceMotion: reduce) { current = i } }

    private func enter(_ i: Int) {
        pending?.cancel()
        if current != nil { show(i); return }
        pending = Task { try? await Task.sleep(for: .seconds(0.3)); if !Task.isCancelled { show(i) } }
    }

    private func leave() {
        pending?.cancel()
        pending = Task { try? await Task.sleep(for: .seconds(0.2)); if !Task.isCancelled { withMotion(.snap, reduceMotion: reduce) { current = nil } } }
    }
}
