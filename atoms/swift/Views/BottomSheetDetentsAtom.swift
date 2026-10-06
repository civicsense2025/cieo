import SwiftUI
import Cieo

public struct BottomSheetDetentsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sheetdetents-views", category: "Views", name: "Bottom-sheet detents",
        summary: "The sheet tracks the finger 1:1 and rubber-bands past its stops. Release velocity picks the detent: a fast fling up lands full, down lands half. The dim only fades in at full and the stops hold as terminals.")

    private enum Detent: CGFloat { case full = 30, half = 150, closed = 236 }
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var y: CGFloat = Detent.half.rawValue
    @State private var dim: CGFloat = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the sheet, or jump to a detent") {
            VStack(spacing: 8) {
                ZStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Inbox").font(.headline)
                        Text("Four threads sit under the sheet.").font(.caption).foregroundStyle(.secondary)
                        Spacer(minLength: 0)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.horizontal, 14).padding(.top, 12)
                    Color.black.opacity(dim)
                    VStack(alignment: .leading, spacing: 0) {
                        RoundedRectangle(cornerRadius: 2).fill(.quaternary).frame(width: 36, height: 4)
                            .frame(maxWidth: .infinity, alignment: .center).padding(.vertical, 8)
                        Text("Route 12 hearing").font(.headline).padding(.horizontal, 14)
                        Text("Tuesday · 6 pm · Library room B").font(.caption).foregroundStyle(.secondary).padding(.horizontal, 14).padding(.bottom, 6)
                        Divider().padding(.leading, 14)
                        Text("The board takes public comment first.").font(.footnote).padding(10).padding(.horizontal, 4)
                        Divider().padding(.leading, 14)
                        Text("Bring the Friday packet, page 14.").font(.footnote).padding(10).padding(.horizontal, 4)
                        Spacer(minLength: 0)
                    }
                    .frame(height: 250)
                    .frame(maxWidth: .infinity, alignment: .topLeading)
                    .background(.background, in: RoundedRectangle(cornerRadius: 14))
                    .offset(y: y)
                    .gesture(DragGesture(minimumDistance: 4).onChanged { g in
                        y = clamped(y0 + g.translation.height)
                    }.onEnded { g in
                        settle(pick(from: y, predicted: y0 + g.predictedEndTranslation.height))
                    })
                }
                .frame(width: 340, height: 280)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12)).clipShape(RoundedRectangle(cornerRadius: 12))
                HStack(spacing: 8) {
                    Button("Half") { settle(.half) }.buttonStyle(.bordered).controlSize(.small)
                    Button("Full") { settle(.full) }.buttonStyle(.bordered).controlSize(.small)
                    Text("drag the handle · dim only at full").font(.caption).foregroundStyle(.secondary)
                }
            }
        }
        .onAppear { y0 = y }
    }

    @State private var y0: CGFloat = Detent.half.rawValue

    private func clamped(_ v: CGFloat) -> CGFloat {
        if v < Detent.full.rawValue { return Detent.full.rawValue + rubber(v - Detent.full.rawValue) }
        if v > Detent.closed.rawValue { return Detent.closed.rawValue + rubber(v - Detent.closed.rawValue) }
        return v
    }

    private func rubber(_ x: CGFloat) -> CGFloat {
        let d: CGFloat = 120
        return d * (1 - 1 / (abs(x) * 0.55 / d + 1)) * (x >= 0 ? 1 : -1)
    }

    private func pick(from cur: CGFloat, predicted: CGFloat) -> Detent {
        if predicted < cur - 60 { return .full }
        if predicted > cur + 60 { return cur > (Detent.half.rawValue + Detent.closed.rawValue) / 2 ? .closed : .half }
        let all: [Detent] = [.full, .half, .closed]
        return all.min(by: { abs($0.rawValue - cur) < abs($1.rawValue - cur) }) ?? .half
    }

    private func settle(_ d: Detent) {
        y0 = d.rawValue
        withMotion(d == .full ? .base : .soft, reduceMotion: reduce) { y = d.rawValue }
        withMotion(.base, reduceMotion: reduce) { dim = d == .full ? 0.45 : 0 }
    }
}
