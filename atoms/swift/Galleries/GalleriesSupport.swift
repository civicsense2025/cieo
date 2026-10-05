import SwiftUI
import MotionKit

/// Tiles that move between two layouts in three beats: leavers shrink (100 ms, 20 ms apart), stayers travel on a
/// soft spring (30 ms apart, reading order), newcomers grow in last. Every value is a pure function of time since `start`.
struct PhMorphGrid: View {
    var old: [Int: CGRect]
    var new: [Int: CGRect]
    var start: Date
    var corner: CGFloat = 6
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var idle = false

    private func order(_ r: [Int: CGRect], _ ids: [Int]) -> [Int: Int] {
        let sorted = ids.sorted { (r[$0]?.minY ?? 0, r[$0]?.minX ?? 0) < (r[$1]?.minY ?? 0, r[$1]?.minX ?? 0) }
        return Dictionary(uniqueKeysWithValues: sorted.enumerated().map { ($1, $0) })
    }

    var body: some View {
        let leave = order(old, old.keys.filter { new[$0] == nil })
        let stay = order(new, new.keys.filter { old[$0] != nil })
        let enter = order(new, new.keys.filter { old[$0] == nil })
        let ids = Set(old.keys).union(new.keys).sorted()
        TimelineView(.animation(paused: idle || reduce)) { ctx in
            let t = reduce ? 9 : ctx.date.timeIntervalSince(start)
            ZStack(alignment: .topLeading) {
                ForEach(ids, id: \.self) { id in
                    let o = old[id], n = new[id]
                    if let o, let n {
                        let k = Double(stay[id] ?? 0)
                        let rem = Motion.resp(max(0, t - 0.1 - k * 0.03), x0: 1, v0: 0, .soft)    // fraction of the trip left
                        tile(id, lerp(n, o, rem))
                    } else if let o {
                        let k = Double(leave[id] ?? 0)
                        tile(id, o, scale: 1 - phSmooth(phRange(t, k * 0.02, k * 0.02 + 0.1)))
                    } else if let n {
                        let k = Double(enter[id] ?? 0)
                        tile(id, n, scale: 1 - Motion.resp(max(0, t - 0.2 - k * 0.03), x0: 1, v0: 0, .base))
                    }
                }
            }
        }
        .task(id: start) {
            idle = false
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            idle = true
        }
    }

    private func lerp(_ a: CGRect, _ b: CGRect, _ t: Double) -> CGRect {
        let k = CGFloat(t)
        return CGRect(x: a.minX + (b.minX - a.minX) * k, y: a.minY + (b.minY - a.minY) * k,
                      width: a.width + (b.width - a.width) * k, height: a.height + (b.height - a.height) * k)
    }

    private func tile(_ id: Int, _ r: CGRect, scale: Double = 1) -> some View {
        // the photo re-crops as its frame changes shape: the same scene, a different window
        phPhoto(id, CGSize(width: max(1, r.width), height: max(1, r.height)))
            .clipShape(RoundedRectangle(cornerRadius: corner))
            .scaleEffect(max(0.001, scale)).opacity(scale)
            .offset(x: r.minX, y: r.minY)
    }
}
