import SwiftUI
import Cieo

public struct NoticeBannerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "noticebanner", category: "Status and records", name: "Notice banner",
        summary: "The notice slides down inside a slot whose height springs open, so the dashboard rows are pushed down rather than covered. Next notice cross-morphs the banner fill between info, warning and danger while the old copy exits and the new copy enters, never overlapping. Dismiss fades the copy out first, then collapses the slot height after 100ms, and the rows rise to fill it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var index = 0
    @State private var shown = true
    public init() {}

    private let notices: [(AgTone, String, String)] = [
        (.info, "Scheduled maintenance on Saturday", "The admin panel will be read-only from 02:00 to 02:30 UTC."),
        (.warning, "Your license renews in 6 days", "Update the payment method on file to avoid an interruption."),
        (.danger, "Last night's backup did not finish", "Storage was full at 03:12 UTC. Free up space, then run a backup now."),
    ]

    public var body: some View {
        let n = notices[index]
        AtomStage(hint: "Next notice morphs severity; Dismiss collapses the slot") {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("Dashboard").font(.headline)
                    Spacer()
                    Button("Next notice") { next() }.buttonStyle(AgPress())
                }
                AgReveal(open: shown) {
                    HStack(alignment: .top, spacing: 8) {
                        Image(systemName: n.0 == .danger ? "exclamationmark.octagon" : n.0 == .warning ? "exclamationmark.triangle" : "info.circle")
                        VStack(alignment: .leading, spacing: 2) {
                            SwapText(n.1).font(.callout.weight(.semibold))
                            SwapText(n.2).font(.caption).foregroundStyle(.primary)
                        }
                        Spacer(minLength: 0)
                        Button { dismiss() } label: { Image(systemName: "xmark") }.buttonStyle(.plain).accessibilityLabel("Dismiss")
                    }
                    .foregroundStyle(n.0.color)
                    .padding(10)
                    .background(n.0.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                    .overlay(RoundedRectangle(cornerRadius: 10).fill(n.0.color.opacity(0.4)).opacity(0.10).allowsHitTesting(false))
                    .animation(reduce ? nil : .motion(.base), value: index)
                }
                ForEach([("Pages published", "24"), ("Form submissions this week", "118"), ("Storage used", "9.2 of 10 GB")], id: \.0) { r in
                    HStack { Text(r.0); Spacer(); Text(r.1).monospacedDigit() }.font(.callout)
                        .padding(8).background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 8))
                }
            }
            .frame(maxWidth: 420)
        }
    }

    private func next() {
        if !shown { withMotion(.base, reduceMotion: reduce) { shown = true }; return }
        withMotion(.base, reduceMotion: reduce) { index = (index + 1) % notices.count }
    }
    private func dismiss() { withMotion(.base, reduceMotion: reduce) { shown = false } }
}
