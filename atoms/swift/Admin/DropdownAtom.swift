import SwiftUI
import Cieo

public struct DropdownAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "dropdown", category: "Admin", name: "Dropdown",
        summary: "The menu grows from the trigger at 97% scale while items fade in 30ms apart. Picking one swaps the button label.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let options = ["Newest first", "Oldest first", "Most viewed", "Alphabetical"]
    @State private var open = false
    @State private var picked = 0
    @State private var hovered: Int?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Open the menu and pick a sort") {
            ZStack(alignment: .topLeading) {
                Button { withMotion(open ? .snap : .base, reduceMotion: reduce) { open.toggle() } } label: {
                    HStack(spacing: 8) {
                        SwapText("Sort: \(options[picked])").frame(maxWidth: .infinity, alignment: .leading)
                        Image(systemName: "chevron.down").font(.caption.weight(.semibold))
                            .rotationEffect(.degrees(open ? 180 : 0)).animation(reduce ? nil : .motion(.snap), value: open)
                    }
                    .padding(.horizontal, 12).padding(.vertical, 8).frame(width: 190)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain).accessibilityLabel("Sort").accessibilityValue(options[picked])
                .accessibilityHint(open ? "Menu open" : "Opens a menu")
                menu.offset(y: 44)
            }
            .frame(width: 200, alignment: .topLeading).frame(maxHeight: .infinity, alignment: .top).padding(.top, 24)
        }
    }

    private var menu: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(options.indices, id: \.self) { i in
                Button {
                    withMotion(.base, reduceMotion: reduce) { picked = i; open = false }
                } label: {
                    Text(options[i]).font(.subheadline).padding(.horizontal, 10).padding(.vertical, 8).frame(maxWidth: .infinity, alignment: .leading)
                        .background(hovered == i ? AnyShapeStyle(.quaternary) : AnyShapeStyle(.clear), in: RoundedRectangle(cornerRadius: 8))
                }
                .buttonStyle(.plain).onHover { hovered = $0 ? i : (hovered == i ? nil : hovered) }
                .opacity(open ? 1 : 0)
                .animation(reduce ? nil : (open ? .motion(.base).delay(0.04 + Double(i) * 0.03) : .motion(.snap)), value: open)
            }
        }
        .padding(6).frame(width: 200)
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.05)))
        .shadow(color: .black.opacity(0.12), radius: 8, y: 3)
        .scaleEffect(open ? 1 : 0.97, anchor: .topLeading).offset(y: open ? 0 : -4)
        .blur(radius: open ? 0 : 4).opacity(open ? 1 : 0)
        .animation(reduce ? nil : .motion(open ? .base : .snap), value: open)
        .allowsHitTesting(open).accessibilityHidden(!open)
    }
}
