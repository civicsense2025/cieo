import SwiftUI
import Cieo

public struct FeatureBeaconAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fbeacon", category: "Guidance", name: "Feature beacon",
        summary: "The dot breathes on a soft loop. Opening the hint freezes the pulse; Esc snaps it shut. Got it checks the dot, a success terminal that holds.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var seen = false
    @State private var pulse = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Click the dot · Esc closes") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Projects").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                    Text("Three active, one new trick.").font(.footnote).foregroundStyle(.secondary).lineSpacing(3)
                    HStack(spacing: 10) {
                        Button { withMotion(.base, reduceMotion: reduce) { open.toggle() } } label: {
                            TimelineView(.animation(paused: reduce || !pulse || open)) { tl in
                                let live = (reduce || !pulse || open) ? 0 : 0.5 + 0.5 * sin(tl.date.timeIntervalSinceReferenceDate * 3.2)
                                ZStack {
                                    Circle().stroke(Color.accentColor, lineWidth: 2).opacity(live * 0.7).scaleEffect(1 + live * 0.4)
                                    Circle().fill(seen ? .green : Color.accentColor).frame(width: 26, height: 26)
                                        .overlay(seen ? Image(systemName: "checkmark").font(.caption2.weight(.bold)).foregroundStyle(.white) : nil)
                                }.frame(width: 34, height: 34)
                            }
                        }.buttonStyle(.plain).accessibilityLabel("Show the new feature")
                        VStack(alignment: .leading, spacing: 0) {
                            Text("Bulk actions  New").font(.system(size: 14)).lineSpacing(3)
                            Text("Select rows, act once.").font(.caption).foregroundStyle(.secondary).lineSpacing(3)
                        }
                    }
                    .padding(.vertical, 10)
                    .overlay(alignment: .top) { Divider() }
                    if open {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Bulk actions are here").font(.footnote.weight(.semibold))
                            Text("Tick any two rows, then archive both at once.").font(.caption).foregroundStyle(.secondary).lineSpacing(3)
                            HStack(spacing: 6) {
                                Button("Got it") {
                                    withMotion(.snap, reduceMotion: reduce) { open = false }
                                    withMotion(.base, reduceMotion: reduce) { seen = true }
                                }.buttonStyle(.borderedProminent).controlSize(.small)
                                Button("Close") { withMotion(.snap, reduceMotion: reduce) { open = false } }
                                    .buttonStyle(.bordered).controlSize(.small)
                            }.padding(.top, 2)
                        }
                        .padding(12).background(.background, in: RoundedRectangle(cornerRadius: 10))
                        .shadow(color: .black.opacity(0.2), radius: 8, y: 2)
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(maxWidth: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                .animation(reduce ? nil : .motion(.base), value: open)
                HStack(spacing: 6) {
                    Text("Pulse:").font(.caption).foregroundStyle(.secondary)
                    Button("On") { pulse = true }.buttonStyle(.bordered).controlSize(.mini)
                    Button("Off") { pulse = false }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
        .escapeKey { if open { withMotion(.snap, reduceMotion: reduce) { open = false } } }
    }
}
