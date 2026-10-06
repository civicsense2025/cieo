import SwiftUI
import Cieo

public struct DocMinimapAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "docminimap", category: "Documents", name: "TOC minimap",
        summary: "The viewport box tracks the drag one-to-one; tapping the rail springs to that page. The last section lands an end terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var section = 0
    @State private var boxY = 6.0
    private let titles = ["Cover", "Parties", "Schedule", "Signatures", "End"]
    private let railH = 148.0, boxH = 30.0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap the rail or drag the box") {
            VStack(spacing: 8) {
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        ForEach(0..<5, id: \.self) { i in
                            Button("\(i + 1) · \(titles[i])") { land(i) }
                                .frame(minHeight: 32).font(.callout)
                                .foregroundStyle(i == 4 ? .green : (i == section ? Color.accentColor : .primary))
                                .fontWeight(i == section ? .semibold : .regular)
                        }
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .top) {
                            RoundedRectangle(cornerRadius: 8).fill(.quaternary)
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(Color.accentColor, lineWidth: 2)
                                .fill(Color.accentColor.opacity(0.14))
                                .frame(height: boxH).offset(y: boxY)
                        }
                        .gesture(DragGesture(minimumDistance: 2).onChanged { v in
                            let span = railH - 12 - boxH
                            let y = min(span, max(0, v.location.y - boxH / 2))
                            boxY = y
                            section = min(4, max(0, Int((y / span * 4).rounded())))
                        })
                        .onTapGesture { _ in }
                    }
                    .frame(width: 44, height: railH)
                    .gesture(TapGesture().onEnded { })
                }
                ZStack {
                    ForEach(0..<5, id: \.self) { i in
                        if i == section { Text(i == 4 ? "End — end of document ✓" : titles[i]).motionTransition(.swap()).foregroundStyle(i == 4 ? .green : .primary) }
                    }
                }
                .font(.caption).frame(maxWidth: .infinity, minHeight: 22)
            }
            .padding(16).frame(maxWidth: 380)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func land(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) {
            section = i; boxY = 6 + Double(i) * ((railH - 12 - boxH) / 4)
        }
    }
}
