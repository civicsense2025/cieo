import SwiftUI
import Cieo

public struct ChatCSATAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "chatcsat", category: "Forms", name: "CSAT in chat",
        summary: "Faces rise in on soft with a stagger. One mood value drives the big face, so hovering reads as a single expression changing. The caption swaps per score.")

    private let names = ["Very unhappy", "Unhappy", "Neutral", "Happy", "Very happy"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var mood = 0.5
    @State private var sel: Int?
    @State private var hover: Int?
    @State private var shown = false
    @State private var thanked = false
    @State private var fancy = true
    public init() {}

    private var caption: String {
        if let h = hover { return names[h] }
        if let s = sel { return "\(names[s]) — logged" }
        return ""
    }

    public var body: some View {
        AtomStage(hint: "Hover the faces, then pick one") {
            VStack(spacing: 8) {
                Text("How did I do?").font(.system(size: 15, weight: .semibold))
                MoodFace(mood: mood).frame(width: 56, height: 56)
                HStack(spacing: 6) {
                    ForEach(names.indices, id: \.self) { i in
                        MoodFace(mood: Double(i) / 4).frame(width: 20, height: 20)
                            .frame(width: 36, height: 36)
                            .foregroundStyle(sel == i ? .white : .primary)
                            .background(RoundedRectangle(cornerRadius: 10).fill(sel == i ? Color.primary : Color.secondary.opacity(0.12)))
                            .opacity(shown ? 1 : 0).offset(y: shown ? 0 : 10)
                            .animation(reduce ? nil : .motion(.soft).delay(Motion.stagger(i, of: names.count, gap: 0.05)), value: shown)
                            .contentShape(Rectangle())
                            .onHover { hovering in
                                hover = hovering ? i : nil
                                withMotion(.soft, reduceMotion: reduce) { mood = Double(hover ?? sel ?? 2) / 4 }
                            }
                            .onTapGesture { pick(i) }
                            .accessibilityLabel(names[i])
                    }
                }
                SwapText(caption).font(.caption).foregroundStyle(.secondary).frame(height: 18)
                SwapText(thanked && sel != nil ? "Thanks — logged as \(names[sel!])." : "")
                    .font(.caption).foregroundStyle(.green).frame(height: 18)
                Toggle("Thank-you note on pick", isOn: $fancy).font(.caption).foregroundStyle(.secondary)
                    .onChange(of: fancy) { _, next in if !next { thanked = false } }
            }
            .onAppear { shown = true }
        }
    }

    private func pick(_ i: Int) {
        sel = i
        hover = nil
        withMotion(.soft, reduceMotion: reduce) { mood = Double(i) / 4 }
        if fancy {
            Task {
                try? await Task.sleep(for: .seconds(reduce ? 0 : 0.38))
                thanked = true
            }
        }
    }

    private struct MoodFace: View {
        let mood: Double
        var body: some View {
            Canvas { c, size in
                let k = size.width / 64
                let curve = -8 + 18 * mood
                c.stroke(Path(ellipseIn: CGRect(x: 3 * k, y: 3 * k, width: 58 * k, height: 58 * k)), with: .color(.primary), lineWidth: 2.5 * k)
                let ey = 26 - 2 * mood
                for x in [23.0, 41.0] {
                    c.fill(Path(ellipseIn: CGRect(x: (x - 3) * k, y: (ey - 3) * k, width: 6 * k, height: 6 * k)), with: .color(.primary))
                }
                var mouth = Path()
                mouth.move(to: CGPoint(x: 20 * k, y: (42 - curve * 0.3) * k))
                mouth.addQuadCurve(to: CGPoint(x: 44 * k, y: (42 - curve * 0.3) * k), control: CGPoint(x: 32 * k, y: (42 + curve) * k))
                c.stroke(mouth, with: .color(.primary), style: StrokeStyle(lineWidth: 2.75 * k, lineCap: .round))
            }
        }
    }
}
