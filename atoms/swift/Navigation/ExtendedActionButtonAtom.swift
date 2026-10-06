import SwiftUI
import Cieo

public struct ExtendedActionButtonAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fab", category: "Navigation", name: "Extended action button",
        summary: "Scrolling down hides the label first, then the button shrinks to its icon. Scrolling up reverses the order: the button widens, then the label fades in.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var wide = true
    @State private var labelOn = true
    @State private var last: CGFloat = 0
    @State private var dividers = true
    private let rows = [("Maya Chen", "Draft is ready for review"), ("Theo Park", "Comment on pricing table"), ("Field Notes", "Weekly digest"),
                        ("Billing", "Invoice INV-0042 paid"), ("Jonas Weber", "Can we move Thursday?"), ("Ada Kim", "New subscriber"),
                        ("North Studio", "Proof attached"), ("Sam Ruiz", "Photos from Saturday"), ("Priya Shah", "Notes on the about page"), ("Loop Press", "Reprint request")]
    public init() {}

    private struct OffsetKey: PreferenceKey {
        static let defaultValue: CGFloat = 0
        static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
    }

    public var body: some View {
        AtomStage(hint: "Scroll down, then back up") {
            VStack(spacing: 8) {
                Toggle("Dividers", isOn: $dividers).font(.caption).foregroundStyle(.secondary).toggleStyle(.switch).controlSize(.small)
                ZStack(alignment: .bottomTrailing) {
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(rows.indices, id: \.self) { i in
                            VStack(alignment: .leading, spacing: 0) {
                                Text(rows[i].0).font(.footnote.weight(.semibold))
                                Text(rows[i].1).font(.footnote).foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 12)
                            if dividers && i < rows.count - 1 {
                                Divider()
                            }
                        }
                    }
                    .background(GeometryReader { g in Color.clear.preference(key: OffsetKey.self, value: -g.frame(in: .named("inbox")).minY) })
                }
                .coordinateSpace(name: "inbox")
                .onPreferenceChange(OffsetKey.self) { y in
                    let d = y - last
                    last = y
                    if d > 2, wide { collapse() } else if d < -2 || y < 8, !wide { expand() }
                }
                Button {} label: {
                    HStack(spacing: 10) {
                        Image(systemName: "square.and.pencil").font(.system(size: 18, weight: .medium))
                        Text("Compose").fontWeight(.semibold).fixedSize().opacity(labelOn ? 1 : 0)
                    }
                    .foregroundStyle(.background).padding(.leading, 16)
                    .frame(width: wide ? 138 : 52, height: 52, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 16).fill(.primary))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(color: .black.opacity(0.2), radius: 8, y: 3)
                }
                .buttonStyle(.plain).accessibilityLabel("Compose").padding(14)
                }
                .frame(width: 270, height: 290)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
    }

    private func collapse() {
        withAnimation(reduce ? nil : .motion(.snap)) { labelOn = false }
        withAnimation(reduce ? nil : .motion(.base).delay(Motion.exit)) { wide = false }
    }

    private func expand() {
        withAnimation(reduce ? nil : .motion(.base)) { wide = true }
        withAnimation(reduce ? nil : .motion(.base).delay(0.12)) { labelOn = true }
    }
}
