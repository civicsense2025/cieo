import SwiftUI
import Cieo

public struct AvatarGroupAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "avatars", category: "Content", name: "Avatar group",
        summary: "Hovering the stack fans the avatars apart with a 30ms stagger. Hovering one face shows its name above it with the popover rule. Thumbnails swap initials for photo thumbs; dense tightens the pitch.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var spread = false
    @State private var focus: Int?
    @State private var thumbs = false
    @State private var dense = false
    private let people: [(initials: String, name: String, fill: Color, photo: [Color])] = [
        ("MC", "Maya Chen", .accentColor, [.blue, .indigo]), ("TP", "Theo Park", .primary, [.green, .teal]), ("AK", "Ada Kim", .secondary, [.pink, .purple]), ("JW", "Jonas Weber", .gray, [.yellow, .orange]), ("+3", "3 more", Color.primary.opacity(0.1), [.cyan, .blue]),
    ]
    private var size: CGFloat { dense ? 32 : 40 }
    private func pitch(open: Bool) -> CGFloat { dense ? (open ? 32 : 16) : (open ? 44 : 24) }
    public init() {}

    public var body: some View {
        AtomStage(hint: "Hover the group (or tap), then a face") {
            VStack(alignment: .leading, spacing: 4) {
                ZStack(alignment: .leading) {
                    ForEach(people.indices, id: \.self) { i in
                        ZStack {
                            Circle().fill(people[i].fill)
                            if !thumbs {
                                Text(people[i].initials).font(.system(size: size * 0.3, weight: .semibold))
                                    .foregroundStyle(i == 4 ? Color.primary : Color(white: 1))
                                    .motionTransition(.swap(drift: 0))
                            } else {
                                Circle().fill(LinearGradient(colors: people[i].photo, startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .motionTransition(.swap(drift: 0))
                            }
                        }
                        .frame(width: size, height: size)
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
                        .offset(x: CGFloat(i) * pitch(open: spread))
                        .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.03), value: spread)
                        .animation(reduce ? nil : .motion(.base), value: dense)
                        .onHover { hovering in withMotion(hovering ? .base : .snap, reduceMotion: reduce) { focus = hovering ? i : (focus == i ? nil : focus) } }
                        .accessibilityElement(children: .ignore)
                        .accessibilityLabel(people[i].name)
                    }
                }
                .frame(width: 220, height: 40, alignment: .leading)
                .contentShape(Rectangle())
                .onHover { spread = $0 }
                .onTapGesture { spread.toggle() }
                HStack(spacing: 6) {
                    Text("Thumbnails").font(.caption).foregroundStyle(.secondary)
                    Picker("Thumbnails", selection: $thumbs) { Text("With").tag(true); Text("Without").tag(false) }.pickerStyle(.segmented).frame(maxWidth: 150).labelsHidden()
                    Text("·").font(.caption).foregroundStyle(.secondary)
                    Text("Density").font(.caption).foregroundStyle(.secondary)
                    Picker("Density", selection: $dense) { Text("Comfortable").tag(false); Text("Dense").tag(true) }.pickerStyle(.segmented).frame(maxWidth: 180).labelsHidden()
                }
            }
        }
    }
}
