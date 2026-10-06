import SwiftUI
import Cieo

public struct PageScrubAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "pagescrub", category: "Documents", name: "Page scrubber",
        summary: "The knob tracks one-to-one and snaps to the page. The thumb plate leads while a ghost trails behind; the last page tints success.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var page = 0
    @State private var knob = 0.0
    @State private var plate = 0.0
    @State private var ghost = 0.0
    private let titles = ["Cover", "Parties", "Schedule", "Signatures", "Exhibits"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the knob — release with a flick") {
            VStack(spacing: 12) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text("\(page + 1)").fontWeight(.semibold).monospacedDigit()
                    Text("/ 5 · drag the knob or tap a thumb").font(.caption).foregroundStyle(.secondary)
                }.frame(maxWidth: .infinity, alignment: .leading)
                GeometryReader { geo in
                    let w = geo.size.width
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 8).fill(.quaternary)
                        RoundedRectangle(cornerRadius: 6).fill(Color.accentColor.opacity(0.25)).frame(width: w / 5).offset(x: ghost * w)
                        RoundedRectangle(cornerRadius: 6).stroke(Color.accentColor, lineWidth: 2).frame(width: w / 5).offset(x: plate * w)
                        RoundedRectangle(cornerRadius: 8).fill(Color.primary).frame(width: 16, height: 40).offset(x: knob * w - 8)
                    }
                    .gesture(DragGesture(minimumDistance: 2).onChanged { v in
                        knob = min(1, max(0, v.location.x / w))
                    }.onEnded { v in
                        let to = min(4, max(0, Int((knob * 4).rounded())))
                        withMotion(.base, reduceMotion: reduce) { land(to, width: w) }
                    })
                }
                .frame(height: 32)
                HStack(spacing: 8) {
                    ForEach(0..<5, id: \.self) { i in
                        Button("\(i + 1)") { withMotion(.base, reduceMotion: reduce) { land(i, width: nil) } }
                            .frame(minWidth: 32, minHeight: 32).background(i == page ? Color.accentColor.opacity(0.15) : .clear, in: RoundedRectangle(cornerRadius: 8))
                            .foregroundStyle(i == page ? Color.accentColor : .primary)
                    }
                }
                ZStack {
                    ForEach(0..<5, id: \.self) { i in
                        if i == page { Text(i == 4 ? "Exhibits — end ✓" : titles[i]).motionTransition(.swap()).foregroundStyle(i == 4 ? .green : .primary) }
                    }
                }
                .font(.caption).frame(maxWidth: .infinity, minHeight: 22)
                Toggle("Snap to page", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
            .padding(16).frame(maxWidth: 360)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func land(_ i: Int, width: CGFloat?) {
        page = i; knob = Double(i) / 4; plate = Double(i) / 4
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.06) {
            withMotion(.base, reduceMotion: reduce) { ghost = Double(i) / 4 }
        }
    }
}
