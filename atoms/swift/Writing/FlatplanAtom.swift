import SwiftUI
import Cieo

public struct FlatplanAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "flatplan", category: "Writing", name: "Flatplan paginator",
        summary: "A held page follows the pointer exactly and bends with rubber-band past the ends. On release it springs into the nearest folio slot, the folio number rolls, and the plate marker trails behind.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let rowH = 48.0
    @State private var order = ["Cover", "Feature", "Essay", "Ads", "Back"]
    @State private var tweak = true
    @State private var held: String?
    @State private var startY = 0.0
    @State private var dragY = 0.0
    @State private var folio = 1
    @State private var hiTop = 0.0
    @State private var hiBottom = 48.0
    public init() {}

    private func slot(_ name: String) -> Int { order.firstIndex(of: name) ?? 0 }

    public var body: some View {
        AtomStage(hint: "Drag a page into its folio slot") {
            VStack(spacing: 8) {
                HStack {
                    Text("Issue 12 · folio").font(.system(size: 12.5)).foregroundStyle(.secondary)
                    Spacer()
                    HStack(spacing: 2) { Text("p."); RollingDigits(folio); Text("/ 5") }
                        .font(.system(size: 12.5)).foregroundStyle(.secondary)
                }
                .frame(width: 300)
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 7).fill(.quaternary)
                        .frame(height: max(0, hiBottom - hiTop)).offset(y: hiTop)
                        .frame(width: 300)
                    ForEach(order, id: \.self) { name in
                        page(name)
                            .offset(y: held == name ? dragY : Double(slot(name)) * rowH)
                            .zIndex(held == name ? 1 : 0)
                            .gesture(drag(name))
                    }
                }
                .frame(width: 300, height: Double(order.count) * rowH)
                Button("Shuffle") { shuffle() }.buttonStyle(.bordered).frame(minHeight: 32).controlSize(.small)

                Toggle("Snap to folio", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
        }
    }

    private func page(_ name: String) -> some View {
        HStack {
            Text("\(slot(name) + 1)").font(.system(size: 15, weight: .semibold)).frame(width: 24)
            Text(name).font(.subheadline)
            Spacer()
            Text(name == "Ads" ? "ad plate" : "edit plate").font(.system(size: 12)).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12).frame(width: 300, height: 44, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: 10))
        .overlay(RoundedRectangle(cornerRadius: 10).stroke(.quaternary))
        .shadow(color: .black.opacity(held == name ? 0.2 : 0), radius: held == name ? 10 : 0, y: 4)
    }

    private func drag(_ name: String) -> some Gesture {
        DragGesture()
            .onChanged { v in
                if held == nil { held = name; startY = Double(slot(name)) * rowH; dragY = startY }
                var y = startY + v.translation.height
                let maxY = Double(order.count - 1) * rowH
                if y < 0 { y = rubberband(y, 28) }
                if y > maxY { y = maxY + rubberband(y - maxY, 28) }
                dragY = y
                let k = min(max(0, Int((y / rowH).rounded())), order.count - 1)
                if k != slot(name) {
                    withMotion(.base, reduceMotion: reduce) {
                        order.remove(at: slot(name)); order.insert(name, at: k)
                    }
                }
            }
            .onEnded { _ in
                let k = min(max(0, Int((dragY / rowH).rounded())), order.count - 1)
                withMotion(.base, reduceMotion: reduce) { held = nil; folio = k + 1 }
                moveMarker(k)
            }
    }

    private func shuffle() {
        withMotion(.base, reduceMotion: reduce) { order.shuffle(); folio = 1 }
        moveMarker(0)
    }

    /// The plate's leading edge moves first and its trailing edge follows 60 ms later.
    private func moveMarker(_ k: Int) {
        let top = Double(k) * rowH, bottom = top + rowH
        guard !reduce else { hiTop = top; hiBottom = bottom; return }
        let down = top >= hiTop
        withAnimation(.motion(.base).delay(down ? Motion.lag : 0)) { hiTop = top }
        withAnimation(.motion(.base).delay(down ? 0 : Motion.lag)) { hiBottom = bottom }
    }

    private func rubberband(_ x: Double, _ d: Double) -> Double {
        d * (1 - 1 / (abs(x) * 0.55 / d + 1)) * (x < 0 ? -1 : 1)
    }
}
