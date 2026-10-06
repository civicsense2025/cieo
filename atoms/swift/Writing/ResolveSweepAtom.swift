import SwiftUI
import Cieo

public struct ResolveSweepAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "resolvesweep", category: "Writing", name: "Resolve sweep",
        summary: "Resolving fades a card and its height springs shut. The open count rolls down after, and the avatar stack fans shut with it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let threads = [
        ("Maya", "M", Color(red: 0.48, green: 0.36, blue: 1), "Can we soften the lede? It reads harsh."),
        ("Theo", "T", Color(red: 0.91, green: 0.45, blue: 0.29), "The price needs a source before we ship."),
        ("Pri", "P", Color(red: 0.18, green: 0.62, blue: 0.43), "Closing date moved — please confirm July."),
    ]
    @State private var fading = [false, false, false]
    @State private var gone = [false, false, false]
    public init() {}

    private var open: Int { gone.filter { !$0 }.count }

    public var body: some View {
        AtomStage(hint: "Resolve a thread, or all at once") {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    Text("Open threads").font(.caption.weight(.semibold))
                    RollingDigits(open)
                    HStack(spacing: -6) {
                        ForEach(threads.indices, id: \.self) { i in
                            Text(threads[i].1).font(.system(size: 11, weight: .semibold)).foregroundStyle(.white)
                                .frame(width: 24, height: 24).background(threads[i].2, in: Circle())
                                .overlay(Circle().stroke(.background, lineWidth: 2))
                                .zIndex(Double(threads.count - i))
                                .opacity(gone[i] ? 0.35 : 1)
                        }
                    }
                    .offset(x: open == threads.count ? 0 : -4 * Double(threads.count - open))
                    .animation(reduce ? nil : .motion(.base), value: open)
                    Spacer()
                    Button("Resolve all") { resolveAll() }.buttonStyle(.borderedProminent).controlSize(.small).disabled(open == 0)
                }
                VStack(spacing: 8) {
                    ForEach(threads.indices, id: \.self) { i in
                        if !gone[i] {
                            HStack(alignment: .top, spacing: 8) {
                                Text(threads[i].1).font(.caption.weight(.semibold)).foregroundStyle(.white)
                                    .frame(width: 22, height: 22).background(threads[i].2, in: Circle())
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(threads[i].0).font(.callout.weight(.semibold))
                                    Text(threads[i].3).font(.callout).foregroundStyle(.secondary)
                                }
                                Spacer()
                                Button("Resolve") { resolve(i) }.buttonStyle(.bordered).controlSize(.small)
                            }
                            .padding(10)
                            .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 12))
                            .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(.quaternary))
                            .opacity(fading[i] ? 0 : 1)
                            .animation(reduce ? nil : .motion(.snap), value: fading[i])
                            .frame(height: fading[i] ? 0 : nil, alignment: .top).clipped()
                            .animation(reduce ? nil : .motion(.base).delay(reduce ? 0 : Motion.exit), value: fading[i])
                        }
                    }
                }
                Button("Reset") { reset() }.buttonStyle(.bordered).controlSize(.small)
            }
            .frame(maxWidth: 340)
        }
    }

    /// The card fades first, then its space collapses; the count only rolls once the space is gone.
    private func resolve(_ i: Int) {
        guard !fading[i] else { return }
        withMotion(.base, reduceMotion: reduce) { fading[i] = true }
        Task { @MainActor in
            try? await Task.sleep(for: .milliseconds(reduce ? 0 : 400))
            withMotion(.base, reduceMotion: reduce) { gone[i] = true }
        }
    }

    private func resolveAll() {
        Task { @MainActor in
            for i in threads.indices where !fading[i] {
                resolve(i)
                try? await Task.sleep(for: .milliseconds(reduce ? 0 : 60))
            }
        }
    }

    private func reset() {
        withMotion(.base, reduceMotion: reduce) { fading = [false, false, false]; gone = [false, false, false] }
    }
}
