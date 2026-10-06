import SwiftUI
import Cieo

public struct CitationPopoverAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "citepop", category: "AI chat", name: "Citation popover",
        summary: "The number pops on snap while the panel grows on base. Sources stagger 30ms apart, and tapping outside closes everything faster.")

    private let sources = [("Pricing benchmarks 2026", "studio.co/benchmarks"), ("Renewal data, Q1", "studio.co/renewals"), ("Support cost review", "studio.co/support")]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var popped: Int?
    @State private var stagger = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap a number, tap outside to close") {
            ZStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Yearly pricing wins").font(.system(size: 15, weight: .semibold))
                    HStack(spacing: 3) {
                        Text("Teams renew 23% more often").font(.system(size: 13.5))
                        citeButton(0)
                    }
                    HStack(spacing: 3) {
                        Text("and support costs fall").font(.system(size: 13.5))
                        citeButton(1)
                        Text(".").font(.system(size: 13.5))
                    }
                    Toggle("Stagger sources", isOn: $stagger).font(.caption).foregroundStyle(.secondary)
                }
                .frame(width: 300)
                if open {
                    Color.clear.contentShape(Rectangle())
                        .onTapGesture { close() }
                        .accessibilityLabel("Close sources")
                }
                if open {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(sources.indices, id: \.self) { i in
                            VStack(alignment: .leading, spacing: 0) {
                                Text("\(i + 1). \(sources[i].0)").font(.system(size: 13))
                                Text(sources[i].1).font(.caption).foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 8)
                            .opacity(open ? 1 : 0).offset(y: open ? 0 : 8)
                            .animation(reduce || !stagger ? nil : .motion(.base).delay(Motion.stagger(i, of: sources.count, gap: 0.03)), value: open)
                            if i < sources.count - 1 { Divider() }
                        }
                    }
                    .padding(.horizontal, 12)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .frame(width: 300)
                    .motionTransition(.presence)
                }
            }
        }
    }

    private func citeButton(_ i: Int) -> some View {
        Button("\(i + 1)") { toggle(i) }
            .font(.caption.weight(.semibold))
            .frame(width: 24, height: 24)
            .background(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary))
            .scaleEffect(popped == i ? 1.3 : 1)
            .motion(.snap, value: popped == i)
            .accessibilityLabel("Source \(i + 1)")
    }

    private func toggle(_ i: Int) {
        if open {
            close()
        } else {
            withMotion(.base, reduceMotion: reduce) { open = true }
            if !reduce {
                withMotion(.snap, reduceMotion: reduce) { popped = i }
                Task {
                    try? await Task.sleep(for: .seconds(0.18))
                    withMotion(.snap, reduceMotion: reduce) { popped = nil }
                }
            }
        }
    }

    private func close() {
        withMotion(.snap, reduceMotion: reduce) {
            open = false
            popped = nil
        }
    }
}
