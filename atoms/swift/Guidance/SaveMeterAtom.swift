import SwiftUI
import Cieo

public struct SaveMeterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "savemeter", category: "Guidance", name: "Save meter",
        summary: "Every tick trails the meter behind it while the percent rolls. A full form swaps the label to a Saved success pill that holds.")

    private let items = ["Display name", "Avatar image", "Short bio", "Custom domain"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var on = [true, true, false, false]
    public init() {}

    public var body: some View {
        let n = on.filter { $0 }.count
        let pct = n * 100 / items.count
        return AtomStage(hint: "Tick fields · the bar trails behind") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("Profile").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                        Spacer()
                        ZStack(alignment: .trailing) {
                            if n == items.count {
                                Text("Saved ✓").font(.caption.weight(.semibold)).foregroundStyle(.green)
                                    .padding(.horizontal, 10).padding(.vertical, 2)
                                    .background(.green.opacity(0.15), in: Capsule()).id("saved").motionTransition(.swap())
                            } else {
                                Text("\(pct)% · \(n) of \(items.count)").font(.caption).foregroundStyle(.secondary)
                                    .monospacedDigit().id("p\(pct)").motionTransition(.swap())
                            }
                        }
                    }
                    GeometryReader { geo in
                        RoundedRectangle(cornerRadius: 3).fill(n == items.count ? .green : Color.accentColor)
                            .frame(width: geo.size.width * CGFloat(n) / CGFloat(items.count), height: 6)
                            .animation(reduce ? nil : .motion(.base).delay(0.06), value: n)
                    }.frame(height: 6).padding(.top, 10)
                    VStack(spacing: 0) {
                        ForEach(items.indices, id: \.self) { i in
                            Button { withMotion(.base, reduceMotion: reduce) { on[i].toggle() } } label: {
                                HStack(spacing: 10) {
                                    Image(systemName: on[i] ? "checkmark.square.fill" : "square")
                                        .foregroundStyle(on[i] ? Color.primary : .secondary)
                                    Text(items[i]).font(.system(size: 14)).lineSpacing(3)
                                    Spacer()
                                }.padding(.vertical, 9).frame(minHeight: 32)
                            }.buttonStyle(.plain)
                            .overlay(alignment: .bottom) { if i != items.count - 1 { Divider() } }
                        }
                    }.padding(.top, 6)
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(width: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                HStack(spacing: 6) {
                    Text("Fill:").font(.caption).foregroundStyle(.secondary)
                    Button("None") { withMotion(.base, reduceMotion: reduce) { on = [Bool](repeating: false, count: items.count) } }
                        .buttonStyle(.bordered).controlSize(.mini)
                    Button("All") { withMotion(.base, reduceMotion: reduce) { on = [Bool](repeating: true, count: items.count) } }
                        .buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
