import SwiftUI
import Cieo

public struct CalendarEventAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "calendar", category: "Scheduling", name: "Calendar event",
        summary: "The event follows your drag, and its edges are pulled to the 15-minute grid on a stiff spring, so it feels magnetic without fighting you. The time label shows the snapped result.")

    private let hour: CGFloat = 34, hours = 8, firstHour = 9
    private var quarter: CGFloat { hour / 4 }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var top = Track(68, preset: .snap)
    @State private var bottom = Track(119, preset: .snap)
    @State private var start: (top: Double, bottom: Double)?
    public init() {}

    private func now() -> Double { Date.timeIntervalSinceReferenceDate }
    private func snap(_ v: Double) -> Double { (v / Double(quarter)).rounded() * Double(quarter) }
    private func clock(_ y: Double) -> String {
        let m = Int((y / Double(quarter)).rounded()) * 15 + firstHour * 60
        return "\(((m / 60 - 1) % 12) + 1):" + String(format: "%02d", m % 60)
    }
    private func go(_ t: inout Track, _ v: Double) { if reduce { t.jump(v) } else { t.set(v, at: now()) } }

    public var body: some View {
        AtomStage(hint: "Drag the event · drag its bottom edge") {
            TimelineView(.motion(top, bottom)) { tl in
                let t = tl.date.timeIntervalSinceReferenceDate, a = top.value(at: t) + 8, b = bottom.value(at: t) + 8
                ZStack(alignment: .topLeading) {
                    ForEach(0...hours, id: \.self) { h in
                        HStack(spacing: 6) {
                            Text("\(((firstHour + h - 1) % 12) + 1)\(firstHour + h < 12 ? "am" : "pm")").font(.system(size: 10)).foregroundStyle(.secondary).frame(width: 32, alignment: .trailing)
                            Divider()
                        }.offset(y: 8 + CGFloat(h) * hour - 6).frame(height: 12)
                    }
                    event(top: a, height: b - a)
                }
                .frame(width: 300, height: 300, alignment: .topLeading)
                .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    private func event(top a: Double, height h: Double) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Design review").font(.footnote.weight(.semibold))
            Text("\(clock(top.target)) – \(clock(bottom.target))").font(.caption).foregroundStyle(.secondary).monospacedDigit()
            Spacer(minLength: 0)
            Capsule().fill(.secondary.opacity(0.5)).frame(width: 24, height: 3).frame(maxWidth: .infinity).padding(.bottom, 3)
                .frame(height: 14).contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0, coordinateSpace: .global)
                    .onChanged { g in
                        let s = start ?? (top.target, bottom.target); start = s
                        go(&bottom, min(Double(hours) * Double(hour), max(top.target + 2 * Double(quarter), snap(s.bottom + Double(g.translation.height)))))
                    }.onEnded { _ in start = nil })
        }
        .padding(.horizontal, 8).padding(.top, 4)
        .frame(width: 224, height: max(20, h), alignment: .topLeading)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color.accentColor.opacity(0.18)))
        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.accentColor))
        .offset(x: 52, y: a)
        .gesture(DragGesture(minimumDistance: 0, coordinateSpace: .global)
            .onChanged { g in
                let s = start ?? (top.target, bottom.target); start = s
                let len = s.bottom - s.top, nt = min(Double(hours) * Double(hour) - len, max(0, snap(s.top + Double(g.translation.height))))
                go(&top, nt); go(&bottom, nt + len)
            }.onEnded { _ in start = nil })
        .accessibilityLabel("Design review, \(clock(top.target)) to \(clock(bottom.target))")
        .accessibilityAdjustableAction { d in
            let step = Double(quarter) * (d == .increment ? 1 : -1)
            go(&top, top.target + step); go(&bottom, bottom.target + step)
        }
    }
}
