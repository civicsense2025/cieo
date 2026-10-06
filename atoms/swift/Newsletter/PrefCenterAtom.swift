import SwiftUI
import Cieo

public struct PrefCenterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "prefcenter", category: "Newsletter", name: "Preference center",
        summary: "The parent morphs between check and dash on one spring for the mixed state. Children stagger in and the frequency note swaps.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var picks: [Bool] = [true, true, true]
    @State private var weekly = true
    public init() {}

    private var mode: Int {
        let on = picks.filter { $0 }.count
        return on == 3 ? 0 : on == 0 ? -1 : 1
    }

    public var body: some View {
        AtomStage(hint: "Toggle the parent, then a child") {
            VStack(alignment: .leading, spacing: 0) {
                Text("What lands in your inbox").font(.callout.weight(.semibold)).padding(.bottom, 2)
                Text("The parent follows its children.").font(.caption).foregroundStyle(.secondary).padding(.bottom, 8)
                parentRow
                ForEach(picks.indices, id: \.self) { i in
                    Divider()
                    childRow(i)
                        .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.05), value: picks[i])
                }
                ZStack(alignment: .leading) {
                    if weekly && mode != -1 {
                        Text("Weekly: one digest on Sundays").font(.caption).foregroundStyle(.secondary).id(1)
                    } else {
                        Text("Instant: mail as it happens").font(.caption).foregroundStyle(.secondary).id(0)
                    }
                }
                .motionTransition(.swap())
                .animation(reduce ? nil : .motion(.base), value: weekly)
                .padding(.top, 8)
                Toggle("Weekly digest note", isOn: $weekly).font(.caption).foregroundStyle(.secondary).padding(.top, 8)
            }
            .padding(16).frame(width: 340)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }

    private var parentRow: some View {
        Button { toggleAll() } label: {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 7)
                        .strokeBorder(.secondary.opacity(0.4), lineWidth: 1.5)
                        .background(mode != -1 ? Color.primary : Color.clear, in: RoundedRectangle(cornerRadius: 7))
                    if mode == 0 {
                        Image(systemName: "checkmark").font(.caption2.weight(.bold)).foregroundStyle(.white)
                    } else if mode == 1 {
                        Image(systemName: "minus").font(.caption2.weight(.bold)).foregroundStyle(.white)
                    }
                }
                .frame(width: 22, height: 22)
                .animation(reduce ? nil : .motion(.base), value: mode)
                VStack(alignment: .leading, spacing: 1) {
                    Text("All product mail").font(.footnote.weight(.semibold))
                    Text("One spring for every state").font(.caption2).foregroundStyle(.secondary)
                }
            }
            .contentShape(Rectangle()).padding(.vertical, 6)
        }.buttonStyle(.plain)
    }

    private func childRow(_ i: Int) -> some View {
        Button { withMotion(.base, reduceMotion: reduce) { picks[i].toggle() } } label: {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 7)
                        .strokeBorder(picks[i] ? Color.primary : Color.secondary.opacity(0.4), lineWidth: 1.5)
                        .background(picks[i] ? Color.primary : Color.clear, in: RoundedRectangle(cornerRadius: 7))
                    if picks[i] {
                        Image(systemName: "checkmark").font(.caption2.weight(.bold)).foregroundStyle(.white)
                    }
                }.frame(width: 22, height: 22)
                VStack(alignment: .leading, spacing: 1) {
                    Text(["Sunday letter", "Midweek notes", "Event invites"][i]).font(.footnote.weight(.medium))
                    Text(["Weekly essay", "Short updates", "City meetups"][i]).font(.caption2).foregroundStyle(.secondary)
                }
            }
            .contentShape(Rectangle()).padding(.vertical, 6)
        }.buttonStyle(.plain)
    }

    private func toggleAll() {
        let to = mode == 0 ? false : true
        if reduce {
            picks = [to, to, to]
        } else {
            for i in picks.indices {
                withMotion(.base, reduceMotion: reduce) {
                    picks[i] = to
                }
            }
        }
    }
}
