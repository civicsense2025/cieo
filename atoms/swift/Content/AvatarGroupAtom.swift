import SwiftUI
import MotionKit

public struct AvatarGroupAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "avatars", category: "Content", name: "Avatar group",
        summary: "Hovering the stack fans the avatars apart with a 30ms stagger. Hovering one face shows its name above it with the popover rule.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var spread = false
    @State private var focus: Int?
    private let people: [(initials: String, name: String, fill: Color)] = [
        ("MC", "Maya Chen", .accentColor), ("TP", "Theo Park", .primary), ("AK", "Ada Kim", .secondary), ("JW", "Jonas Weber", .gray), ("+3", "3 more", Color.primary.opacity(0.1)),
    ]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover the group (or tap), then a face") {
            ZStack(alignment: .leading) {
                ForEach(people.indices, id: \.self) { i in
                    Text(people[i].initials).font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(i == 4 ? Color.primary : Color(white: 1))
                        .frame(width: 40, height: 40)
                        .background(Circle().fill(people[i].fill))
                        .overlay(Circle().strokeBorder(.background, lineWidth: 2))
                        .overlay(alignment: .top) {
                            if focus == i {
                                Text(people[i].name).font(.caption.weight(.medium)).foregroundStyle(.background).fixedSize()
                                    .padding(.horizontal, 8).padding(.vertical, 4)
                                    .background(RoundedRectangle(cornerRadius: 6).fill(.primary))
                                    .alignmentGuide(.top) { $0[.bottom] + 8 }
                                    .motionTransition(.presence)
                            }
                        }
                        .zIndex(focus == i ? 20 : Double(10 - i))
                        .offset(x: CGFloat(i) * (spread ? 44 : 24))
                        .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.03), value: spread)
                        .onHover { hovering in withMotion(hovering ? .base : .snap, reduceMotion: reduce) { focus = hovering ? i : (focus == i ? nil : focus) } }
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel(people[i].name)
                }
            }
            .frame(width: 220, height: 40, alignment: .leading)
            .contentShape(Rectangle())
            .onHover { spread = $0 }
            .onTapGesture { spread.toggle() }
        }
    }
}
