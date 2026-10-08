import SwiftUI
import Cieo

public struct PresenceAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "presencelive", category: "Dynamic", name: "Presence avatars",
        summary: "A joiner pops in at 60% scale and fans the stack out with stagger. A leaver shrinks in place, then the gap springs closed. The owner keeps a ring.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let palette: [Color] = [.purple, .blue, .green, .orange, .red, .pink]
    private let initials = ["A", "B", "C", "D", "E", "F"]
    @State private var order = [0, 1, 2]
    @State private var nextId = 3
    @State private var ownerRing = true
    public init() {}

    private func avatar(_ id: Int) -> some View {
        Text(initials[id % initials.count]).font(.caption.weight(.semibold)).foregroundStyle(.white)
            .frame(width: 28, height: 28)
            .background(Circle().fill(palette[id % palette.count]))
            .overlay(Circle().stroke(.background, lineWidth: 2))
            .overlay(ownerRing && id == 0 ? Circle().stroke(Color.accentColor, lineWidth: 2).padding(-2) : nil)
    }

    public var body: some View {
        AtomStage(hint: "Joiners fan out · leavers shrink away") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Who is here").font(.headline)
                HStack(spacing: -4) {
                    ForEach(order, id: \.self) { id in
                        avatar(id)
                            .zIndex(Double(10 - (order.firstIndex(of: id) ?? 0)))
                            .transition(.scale(scale: 0.6).combined(with: .opacity))
                            .animation(reduce ? nil : .motion(.base).delay(Double(order.firstIndex(of: id) ?? 0) * 0.05), value: order)
                    }
                    Spacer()
                }
                .frame(height: 34)
                Text("\(order.count) online · settled").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                HStack {
                    Button("Join") {
                        guard order.count < 6 else { return }
                        withAnimation(reduce ? nil : .motion(.base)) { order.append(nextId); nextId += 1 }
                    }
                    .buttonStyle(.bordered).controlSize(.regular).disabled(order.count >= 6)
                    Button("Leave") {
                        guard order.count > 1 else { return }
                        withAnimation(reduce ? nil : .motion(.snap)) {
                            if let i = order.firstIndex(where: { $0 != 0 }) { order.remove(at: i) }
                            else { order.removeLast() }
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.regular).disabled(order.count <= 1)
                    Spacer()
                    Toggle("owner ring", isOn: $ownerRing).font(.caption).foregroundStyle(.secondary)
                        .nativeToggleStyle()
                }
            }
            .frame(maxWidth: 400)
        }
    }
}
