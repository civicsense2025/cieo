import SwiftUI
import MotionKit

public struct CallGridAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "callgrid", category: "Video calls", name: "Call grid",
        summary: "When someone joins or leaves, every tile springs to its new grid slot and the newcomer scales in. A ring follows whoever is speaking, fading between people. Muting draws a slash through your mic and tints it danger.")

    private let names = ["You", "Maya", "Theo", "Ada", "Jonas", "Priya", "Sam"]
    private let tints: [Color] = [.green, .orange, .blue, .pink, .indigo, .yellow, .teal]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var count = 3
    @State private var speaker = 1
    @State private var muted = false
    public init() {}

    private func frame(_ i: Int, _ n: Int, _ size: CGSize) -> CGRect {
        let cols = Int(ceil(Double(n).squareRoot())), rows = Int(ceil(Double(n) / Double(cols))), g: CGFloat = 6
        let w = (size.width - g * CGFloat(cols + 1)) / CGFloat(cols), h = (size.height - g * CGFloat(rows + 1)) / CGFloat(rows)
        let r = i / cols, inRow = r == rows - 1 ? n - r * cols : cols
        let off = (size.width - CGFloat(inRow) * w - CGFloat(inRow + 1) * g) / 2
        return CGRect(x: off + g + CGFloat(i % cols) * (w + g), y: g + CGFloat(r) * (h + g), width: w, height: h)
    }

    public var body: some View {
        AtomStage(hint: "Add and remove people, mute yourself") {
            VStack(spacing: 10) {
                let size = CGSize(width: 360, height: 210)
                ZStack(alignment: .topLeading) {
                    ForEach(0..<count, id: \.self) { i in
                        let f = frame(i, count, size)
                        ZStack(alignment: .bottomLeading) {
                            tints[i].opacity(0.5)
                            Text(String(names[i].prefix(1))).font(.callout.weight(.semibold)).frame(width: 44, height: 44)
                                .background(Circle().fill(.white.opacity(0.2))).frame(maxWidth: .infinity, maxHeight: .infinity)
                            Text(names[i]).font(.caption.weight(.medium)).padding(.leading, 8).padding(.bottom, 6)
                            RoundedRectangle(cornerRadius: 10).strokeBorder(Color.green, lineWidth: 2.5).opacity(speaker == i ? 1 : 0)
                        }
                        .foregroundStyle(.white).frame(width: f.width, height: f.height)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                        .offset(x: f.minX, y: f.minY)
                        .transition(reduce ? .identity : .asymmetric(
                            insertion: .scale(scale: 0.9).combined(with: .opacity).animation(.motion(.base)),
                            removal: .scale(scale: 0.9).combined(with: .opacity).animation(.motion(.snap))))
                        .accessibilityLabel(names[i] + (speaker == i ? ", speaking" : ""))
                    }
                }
                .frame(width: size.width, height: size.height, alignment: .topLeading)
                .animation(reduce ? nil : .motion(.base), value: count)
                .animation(reduce ? nil : .motion(.base), value: speaker)
                HStack(spacing: 8) {
                    Button { withMotion(.base, reduceMotion: reduce) { count = min(names.count, count + 1) } } label: { Label("Join", systemImage: "person.badge.plus") }
                    Button { withMotion(.snap, reduceMotion: reduce) { count = max(2, count - 1) } } label: { Label("Leave", systemImage: "person.badge.minus") }
                    Button { withMotion(.snap, reduceMotion: reduce) { muted.toggle() } } label: {
                        ZStack {
                            Image(systemName: "mic")
                            Slash().trim(from: 0, to: muted ? 1 : 0).stroke(style: StrokeStyle(lineWidth: 2, lineCap: .round)).frame(width: 14, height: 14)
                        }.foregroundStyle(muted ? Color.red : .primary)
                    }
                    .accessibilityLabel(muted ? "Unmute" : "Mute")
                }.buttonStyle(.bordered).controlSize(.small)
            }
        }
        .task {
            var k = 0
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(2.2)); k += 1
                withMotion(.base, reduceMotion: reduce) { speaker = count > 1 ? 1 + k % (count - 1) : -1 }
            }
        }
    }
}

private struct Slash: Shape {
    func path(in r: CGRect) -> Path { var p = Path(); p.move(to: CGPoint(x: r.minX, y: r.minY)); p.addLine(to: CGPoint(x: r.maxX, y: r.maxY)); return p }
}
