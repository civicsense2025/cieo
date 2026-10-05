import SwiftUI
import Cieo

public struct HeaderRailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-rail", category: "Headers", name: "Header: side rail",
        summary: "Hover or focus the rail and it widens from 64px to 232px first; the labels fade in 60ms later, each 20ms after the last, so text never spills out of a half-open rail. Leaving reverses it: labels go first, then the width closes. The active plate slides between rows with lagging edges. Pinned keeps it open and the page slides over to make room. Narrow: the rail becomes a drawer opened from a top bar, with labels always visible.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var wide = false
    @State private var labels = false
    @State private var pinned = false
    @State private var current = 0
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var task: Task<Void, Never>?
    private let items = [("house", "Home"), ("chart.bar", "Reports"), ("folder", "Files"), ("gearshape", "Settings")]
    public init() {}
    public var body: some View {
        let open = wide || pinned
        AtomStage(hint: "Hover the rail; pin it to push the page") {
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 4) {
                    Image(systemName: "hexagon.fill").foregroundStyle(Color.accentColor).frame(width: 40, height: 36)
                    VStack(spacing: 2) {
                        ForEach(items.indices, id: \.self) { i in
                            Button { current = i } label: {
                                HStack(spacing: 10) {
                                    Image(systemName: items[i].0).frame(width: 40)
                                    Text(items[i].1).font(.callout).lineLimit(1).fixedSize()
                                        .opacity(labels || pinned ? 1 : 0)
                                        .animation(reduce ? nil : .motion(.base).delay(labels ? 0.06 + Double(i) * 0.02 : 0), value: labels)
                                    Spacer(minLength: 0)
                                }.frame(height: 36).contentShape(Rectangle())
                            }.buttonStyle(.plain).reportFrame(i, in: "rail").accessibilityLabel(items[i].1)
                        }
                    }
                    .background { MegaPlate(frame: frames[AnyHashable(current)]) }
                    .coordinateSpace(name: "rail")
                    .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    Spacer()
                    Toggle("Pin", isOn: $pinned.animation(.motion(.base))).font(.caption).toggleStyle(.button).labelsHidden().accessibilityLabel("Pin rail open")
                }
                .padding(.vertical, 8).padding(.horizontal, 4)
                .frame(width: open ? 180 : 56)
                .clipped()
                .background(.background).overlay(alignment: .trailing) { Rectangle().fill(.quaternary).frame(width: 1) }
                .onHover { inside in hover(inside) }
                .animation(reduce ? nil : .motion(.base), value: open)
                VStack(spacing: 10) { ForEach(0..<4, id: \.self) { _ in RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: 50) } }
                    .padding(10).frame(maxWidth: .infinity).accessibilityHidden(true)
            }
            .clipShape(RoundedRectangle(cornerRadius: 8)).overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary))
        }
    }

    private func hover(_ inside: Bool) {
        task?.cancel()
        if inside {
            withMotion(.base, reduceMotion: reduce) { wide = true }
            labels = true
        } else {
            labels = false
            task = Task {
                try? await Task.sleep(for: .milliseconds(100))
                guard !Task.isCancelled else { return }
                withMotion(.base, reduceMotion: reduce) { wide = false }
            }
        }
    }
}
