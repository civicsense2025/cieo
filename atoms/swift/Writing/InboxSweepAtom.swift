import SwiftUI
import Cieo

public struct InboxSweepAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "inboxsweep", category: "Writing", name: "Inbox sweep",
        summary: "A row follows the finger and arms past 80 points. On release it flies out quickly while its gap closes calmly, and the count left rolls down. Undo brings the last swept row back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Draft: Identifiable { let id = UUID(); let title: String; let sub: String }
    private let drafts = [
        Draft(title: "Spring launch", sub: "Open with the cover story"),
        Draft(title: "Pricing rewrite", sub: "Shorter, plainer, kinder"),
        Draft(title: "Member letter", sub: "Thank the founding fifty"),
        Draft(title: "Send checklist", sub: "Proof, art, time, ship")
    ]
    @State private var offsets: [UUID: CGFloat] = [:]
    @State private var collapsed: Set<UUID> = []
    @State private var swept: [(id: UUID, side: CGFloat)] = []
    public init() {}

    private var left: Int { drafts.count - collapsed.count }

    public var body: some View {
        AtomStage(hint: "Swipe a row past the line to sweep it away") {
            VStack(spacing: 8) {
                HStack {
                    Text("Drafts to sweep").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    HStack(spacing: 2) { RollingDigits(left); Text("left") }
                        .font(.caption).foregroundStyle(.secondary)
                }
                ForEach(drafts) { d in row(d) }
                Button("Undo") { undo() }.buttonStyle(.bordered).controlSize(.small)
                    .disabled(swept.isEmpty).opacity(swept.isEmpty ? 0.45 : 1)
            }
            .frame(width: 320)
        }
    }

    private func row(_ d: Draft) -> some View {
        let off = offsets[d.id, default: 0]
        let armed = abs(off) > 80
        return ZStack {
            HStack {
                Text("‹ Sweep").font(.caption)
                Spacer()
                Text("Sweep ›").font(.caption)
            }
            .padding(.horizontal, 18).foregroundStyle(.primary)
            VStack(alignment: .leading, spacing: 2) {
                Text(d.title).font(.subheadline.weight(.semibold))
                Text(d.sub).font(.caption).foregroundStyle(.secondary)
            }
            .padding(.horizontal, 14).padding(.vertical, 10)
            .frame(width: 320, alignment: .leading)
            .background(.background, in: RoundedRectangle(cornerRadius: 0))
            .offset(x: off)
            .gesture(DragGesture()
                .onChanged { v in offsets[d.id] = v.translation.width }
                .onEnded { v in
                    let fling = abs(v.predictedEndTranslation.width) > 200
                    if abs(off) > 80 || fling {
                        let side: CGFloat = (off == 0 ? v.predictedEndTranslation.width : off) >= 0 ? 1 : -1
                        withMotion(.snap, reduceMotion: reduce) { offsets[d.id] = side * 360 }
                        swept.append((d.id, side))
                        DispatchQueue.main.asyncAfter(deadline: .now() + (reduce ? 0 : 0.15)) {
                            withMotion(.base, reduceMotion: reduce) { collapsed.insert(d.id) }
                        }
                    } else {
                        withMotion(.base, reduceMotion: reduce) { offsets[d.id] = 0 }
                    }
                })
        }
        .background(armed ? Color.primary : Color.secondary.opacity(0.15))
        .frame(height: collapsed.contains(d.id) ? 0 : 62).clipped()
        .opacity(collapsed.contains(d.id) ? 0 : 1)
        .animation(reduce ? nil : .motion(.base), value: collapsed.contains(d.id))
        .accessibilityLabel(d.title)
    }

    private func undo() {
        guard let last = swept.popLast() else { return }
        withMotion(.base, reduceMotion: reduce) {
            collapsed.remove(last.id)
            offsets[last.id] = reduce ? 0 : last.side * 360
        }
        if !reduce {
            DispatchQueue.main.async {
                withMotion(.base, reduceMotion: reduce) { offsets[last.id] = 0 }
            }
        }
    }
}
