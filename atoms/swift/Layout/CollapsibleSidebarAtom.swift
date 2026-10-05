import SwiftUI
import Cieo

public struct CollapsibleSidebarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sidebar", category: "Layout", name: "Collapsible sidebar",
        summary: "Collapsing fades every label first, then narrows the rail to its icons. Expanding widens the rail first, then brings labels back 30ms apart, so text never squeezes.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = true
    private let items = [("Home", "house"), ("Search", "magnifyingglass"), ("Library", "books.vertical"), ("Account", "person")]
    public init() {}

    public var body: some View {
        AtomStage {
            HStack(spacing: 0) {
                rail
                Divider()
                Text("Collapse to icons and expand again. Labels leave before the width shrinks and return after it grows.")
                    .font(.footnote).foregroundStyle(.secondary)
                    .padding(14).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
            .frame(maxWidth: 560).frame(height: 210)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    private var rail: some View {
        VStack(alignment: .leading, spacing: 2) {
            Button { open.toggle() } label: {
                Image(systemName: "sidebar.left").font(.system(size: 16)).frame(width: 18)
                    .padding(.horizontal, 10).padding(.vertical, 8).foregroundStyle(.secondary)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain).accessibilityLabel(open ? "Collapse sidebar" : "Expand sidebar")
            ForEach(items.indices, id: \.self) { i in
                HStack(spacing: 12) {
                    Image(systemName: items[i].1).font(.system(size: 16)).frame(width: 18)
                    Text(items[i].0).font(.footnote.weight(.medium)).fixedSize()
                        .opacity(open ? 1 : 0)
                        .animation(reduce ? nil : (open ? .motion(.base).delay(0.12 + Double(i) * 0.03) : .motion(.snap)), value: open)
                }
                .padding(.horizontal, 10).padding(.vertical, 8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(i == 0 ? 0.08 : 0)))
                .accessibilityElement(children: .ignore).accessibilityLabel(items[i].0)
            }
            Spacer(minLength: 0)
        }
        .padding(8)
        .frame(width: open ? 200 : 56, alignment: .leading).clipped()
        .animation(reduce ? nil : (open ? .motion(.base) : .motion(.base).delay(Motion.exit)), value: open)
        .frame(maxHeight: .infinity, alignment: .top)
    }
}
