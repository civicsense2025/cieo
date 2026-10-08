import SwiftUI
import Cieo

public struct BacklinkFlowAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "backflow", category: "SEO", name: "Backlink flow",
        summary: "Edges draw source-first on the lazy spring, one after another. Hovering a source thickens its edge on snap and swaps the detail card.")

    private struct Link: Identifiable {
        let id = UUID()
        let host: String
        let meta: String
        let note: String
        let lost: Bool
    }

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var picked = 0
    @State private var draw = 0
    @State private var showLost = true
    public init() {}

    private let links = [
        Link(host: "newsletter.report", meta: "DR 72 · dofollow", note: "2.1k visits/mo · anchor “member pricing”.", lost: false),
        Link(host: "presskit.example", meta: "DR 58 · dofollow", note: "940 visits/mo · anchor “spring launch”.", lost: false),
        Link(host: "oldblog.example", meta: "lost · 404", note: "Link broke Mar 12 — reclaim it with a 301 to /spring-launch.", lost: true)
    ]

    public var body: some View {
        AtomStage(hint: "Pick a source to inspect it") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Backlinks → /spring-launch").font(.headline)
                HStack(alignment: .top, spacing: 12) {
                    VStack(spacing: 8) {
                        ForEach(Array(links.enumerated()), id: \.element.id) { i, link in
                            if !link.lost || showLost {
                                let on = i == picked
                                Button {
                                    withMotion(.snap, reduceMotion: reduce) { picked = i }
                                } label: {
                                    HStack(spacing: 8) {
                                        Circle().fill(link.lost ? Color.orange : Color.green).frame(width: 10, height: 10)
                                        Text(link.host).font(.footnote.weight(.medium))
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 10).frame(minHeight: 36)
                                    .background(on ? Color.accentColor.opacity(0.12) : Color.clear, in: RoundedRectangle(cornerRadius: 10))
                                    .overlay(RoundedRectangle(cornerRadius: 10).fill(on ? Color.accentColor : Color.clear).opacity(0.10).allowsHitTesting(false))
                                }
                                .buttonStyle(.plain)
                                .motion(.snap, value: picked)
                                .transition(.opacity.combined(with: .move(edge: .leading)))
                            }
                        }
                    }
                    .frame(width: 150)
                    VStack(alignment: .leading, spacing: 4) {
                        ZStack {
                            ForEach(Array(links.enumerated()), id: \.element.id) { i, link in
                                if i == picked {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(link.host).font(.subheadline.weight(.semibold))
                                        Text(link.meta).font(.caption).foregroundStyle(.secondary)
                                        Text(link.note).font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                                    }
                                    .id(picked).motionTransition(.swap())
                                }
                            }
                        }
                        .animation(reduce ? nil : .motion(.base), value: picked)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading).frame(minHeight: 120)
                    .padding(14).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
                }
                .motion(.lazy, value: draw)
                Toggle("Show lost link", isOn: $showLost).font(.caption).foregroundStyle(.secondary)
                    .nativeToggleStyle()
            }
            .frame(width: 340)
        }
        .onAppear {
            if reduce { draw = 3; return }
            draw = 0
            for i in 1...3 {
                DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.12) {
                    withMotion(.lazy, reduceMotion: reduce) { draw = i }
                }
            }
        }
    }
}
