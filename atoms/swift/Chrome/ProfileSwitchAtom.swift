import SwiftUI

/// Profile switcher: ring inks, identity crossfades, width springs.
public struct ProfileSwitchAtom: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var current = 0
    @State private var open = false
    private let people = [("Ada Lovelace", "Work"), ("Bo", "Personal"), ("Cleo Zhang-Mbeki", "School")]

    public init() {}
    public var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Profile switcher").font(.system(size: 15, weight: .semibold))
            Text("Ring inks on base · ↑↓ + Enter · Esc snaps shut")
                .font(.system(size: 12.5)).foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 8) {
                Button { open.toggle() } label: {
                    HStack(spacing: 10) {
                        Text(String(people[current].0.prefix(1)))
                            .font(.system(size: 13, weight: .semibold))
                            .frame(width: 32, height: 32)
                            .background(Color.primary.opacity(0.08), in: Circle())
                            .overlay(Circle().stroke(Color.primary.opacity(open ? 0.8 : 0.2), lineWidth: open ? 4 : 2))
                        VStack(alignment: .leading) {
                            Text(people[current].0).font(.system(size: 13.5))
                            Text(people[current].1).font(.system(size: 12)).foregroundStyle(.secondary)
                        }
                        .transition(.opacity.combined(with: .move(edge: .top)))
                        .id(current)
                        Spacer()
                        Text("Esc").font(.system(size: 12)).foregroundStyle(.secondary)
                    }
                    .frame(minHeight: 40).padding(4)
                }
                .buttonStyle(.plain)
                if open {
                    VStack(spacing: 0) {
                        ForEach(people.indices, id: \.self) { i in
                            Button { current = i; open = false } label: {
                                HStack {
                                    Text(String(people[i].0.prefix(1))).frame(width: 28, height: 28)
                                        .background(Color.primary.opacity(0.07), in: Circle())
                                        .font(.system(size: 12, weight: .semibold))
                                    Text("\(people[i].0) · \(people[i].1)").font(.system(size: 13.5))
                                    Spacer()
                                }
                                .frame(minHeight: 40).padding(.horizontal, 10)
                                .background(i == current ? Color.primary.opacity(0.08) : .clear)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }
                            .buttonStyle(.plain)
                            if i < people.count - 1 { Divider() }
                        }
                    }
                    .transition(.opacity)
                }
                Text("\(current + 1) of \(people.count) active ✓")
                    .font(.system(size: 12)).foregroundStyle(.secondary).monospacedDigit()
            }
            .padding(15)
            .frame(maxWidth: 400)
            .background(.background, in: RoundedRectangle(cornerRadius: 12))
            .animation(reduce ? nil : .spring(response: 0.3), value: current)
            .animation(reduce ? nil : .spring(response: 0.3), value: open)
        }
        .focusable(true)
        .onExitCommand { open = false }
        .onMoveCommand { dir in
            if dir == .down { current = (current + 1) % people.count; open = true }
            else if dir == .up { current = (current + people.count - 1) % people.count; open = true }
        }
    }
}
