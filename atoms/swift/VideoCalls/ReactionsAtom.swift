import SwiftUI
import Cieo

public struct ReactionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reactions", category: "Video calls", name: "Reactions burst",
        summary: "Each tap floats an emoji up on soft while it fades, and the pile below staggers in. Reduced motion skips the float. Five reactions pop a burst terminal; clearing empties the sky.")

    private let choices = ["❤", "👏", "🎉"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var floats: [Floater] = []
    @State private var pile: [String] = []
    @State private var total = 0
    @State private var big = false
    public init() {}

    private struct Floater: Identifiable {
        let id = UUID()
        let emoji: String
        var risen = false
    }

    private var done: Bool { total >= 5 }

    public var body: some View {
        AtomStage(hint: "Five reactions complete the burst") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Reactions burst").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Tap to send some love.").font(.system(size: 12)).foregroundStyle(.secondary)
                ZStack(alignment: .bottomLeading) {
                    RoundedRectangle(cornerRadius: 12).fill(Color(white: 0.06)).frame(height: 110)
                    ForEach(floats) { f in
                        Text(f.emoji).font(.system(size: 20))
                            .offset(y: f.risen ? (big ? -80 : -46) : 0)
                            .opacity(f.risen ? 0 : 1)
                    }
                    .padding(.leading, 60).padding(.bottom, 40)
                    HStack(spacing: 6) {
                        ForEach(Array(pile.enumerated()), id: \.offset) { index, e in
                            Text(e).font(.system(size: 15))
                                .frame(width: 30, height: 30)
                                .background(Circle().fill(.quaternary))
                                .animation(reduce ? nil : .motion(.base).delay(Double(min(index, 5)) * 0.05), value: pile.count)
                                .motionTransition(.presence)
                        }
                    }
                    .padding(.leading, 12).padding(.bottom, 8)
                }
                .frame(height: 110)
                HStack(spacing: 8) {
                    ForEach(choices, id: \.self) { e in
                        Button(e) { send(e) }
                            .font(.system(size: 17))
                            .frame(minWidth: 40, minHeight: 36)
                            .buttonStyle(.bordered).controlSize(.small)
                    }
                    Spacer()
                    if total > 0 {
                        Text(total == 1 ? "1 reaction" : "\(total) reactions")
                            .font(.system(size: 12)).foregroundStyle(.secondary)
                    }
                    Button("Clear") {
                        withMotion(.snap, reduceMotion: reduce) { pile = []; total = 0 }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                }
                if done {
                    Text("🎉 Burst complete").font(.system(size: 12.5, weight: .semibold))
                        .foregroundStyle(.green).padding(.horizontal, 10).padding(.vertical, 5)
                        .background(Capsule().fill(.green.opacity(0.12)))
                        .motionTransition(.swap(drift: 0))
                }
                Toggle("Big float", isOn: $big)
                    .font(.system(size: 12)).foregroundStyle(.secondary)
            }
            .padding(14)
        }
    }

    private func send(_ emoji: String) {
        total += 1
        pile.append(emoji)
        if pile.count > 6 { pile.removeFirst() }
        if reduce { return }
        let f = Floater(emoji: emoji)
        floats.append(f)
        let id = f.id
        withMotion(.soft, reduceMotion: reduce) {
            if let i = floats.firstIndex(where: { $0.id == id }) { floats[i].risen = true }
        }
        Task {
            try? await Task.sleep(for: .seconds(0.95))
            floats.removeAll { $0.id == id }
        }
    }
}
