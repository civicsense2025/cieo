import SwiftUI
import Cieo

public struct ChecklistBeaconAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "checklistbeacon", category: "Guidance", name: "Checklist beacon",
        summary: "The pill folds into a spring-loaded list under a segmented bar whose fill trails behind it. The count rolls and all four done swaps the header to a success pill that holds.")

    private let items = ["Connect a domain", "Write the about page", "Turn on members", "Publish"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var on = [true, true, false, false]
    @State private var open = true
    @State private var celebrate = true
    public init() {}

    public var body: some View {
        let n = on.filter { $0 }.count
        let all = n == items.count && celebrate
        return AtomStage(hint: "Tap the pill to fold the list") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    Button { withMotion(.base, reduceMotion: reduce) { open.toggle() } } label: {
                        HStack(spacing: 10) {
                            Image(systemName: "checklist").font(.body).foregroundStyle(Color.accentColor)
                                .frame(width: 30, height: 30).background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Launch list").font(.system(size: 15, weight: .semibold)).lineSpacing(3)
                                ZStack(alignment: .leading) {
                                    if all {
                                        Text("All done ✓").font(.caption.weight(.semibold)).foregroundStyle(.green)
                                            .padding(.horizontal, 10).padding(.vertical, 2)
                                            .background(.green.opacity(0.15), in: Capsule()).id("yes").motionTransition(.swap())
                                    } else {
                                        Text("\(n) of \(items.count) done").font(.caption).foregroundStyle(.secondary)
                                            .monospacedDigit().id("n\(n)").motionTransition(.swap())
                                    }
                                }
                            }
                            Spacer()
                            Image(systemName: open ? "chevron.down" : "chevron.right").font(.caption).foregroundStyle(.secondary)
                        }
                    }.buttonStyle(.plain)
                    HStack(spacing: 4) {
                        ForEach(items.indices, id: \.self) { i in
                            RoundedRectangle(cornerRadius: 3).fill(i < n ? Color.accentColor : Color.primary.opacity(0.1))
                                .frame(height: 6)
                        }
                    }.padding(.top, 10)
                    .animation(reduce ? nil : .motion(.base).delay(0.06), value: n)
                    if open {
                        VStack(spacing: 0) {
                            ForEach(items.indices, id: \.self) { i in
                                Button { withMotion(.base, reduceMotion: reduce) { on[i].toggle() } } label: {
                                    HStack(spacing: 10) {
                                        Image(systemName: on[i] ? "checkmark.square.fill" : "square")
                                            .foregroundStyle(on[i] ? Color.primary : .secondary)
                                        Text(items[i]).font(.system(size: 14)).lineSpacing(3)
                                            .foregroundStyle(on[i] ? .secondary : .primary)
                                        Spacer()
                                    }.padding(.vertical, 9)
                                }.buttonStyle(.plain)
                                .overlay(alignment: .bottom) { if i != items.count - 1 { Divider() } }
                            }
                        }
                        .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
                .padding(.horizontal, 14).padding(.vertical, 14)
                .frame(width: 320).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                .animation(reduce ? nil : .motion(.base), value: open)
                HStack(spacing: 6) {
                    Text("Congrats:").font(.caption).foregroundStyle(.secondary)
                    Button("On") { celebrate = true }.buttonStyle(.bordered).controlSize(.mini)
                        .tint(celebrate ? Color.accentColor : nil)
                    Button("Off") { celebrate = false }.buttonStyle(.bordered).controlSize(.mini)
                }.font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
