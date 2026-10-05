import SwiftUI
import Cieo

public struct MobileMenuAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mobilemenu", category: "Chrome", name: "Mobile menu",
        summary: "The three lines morph into a cross on one spring. The panel height opens and each link enters 40ms after the last.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let links = ["Work", "Services", "Journal", "About", "Contact"]
    @State private var open = false
    public init() {}

    private func line(_ y: CGFloat, _ angle: Double, hidden: Bool = false) -> some View {
        Capsule().fill(.primary).frame(width: 18, height: 2).rotationEffect(.degrees(angle)).offset(y: y).opacity(hidden ? (open ? 0 : 1) : 1)
    }

    public var body: some View {
        AtomStage(hint: "Tap the menu button") {
            VStack(spacing: 0) {
                HStack {
                    Text("North Studio").fontWeight(.bold)
                    Spacer()
                    Button { withMotion(.base, reduceMotion: reduce) { open.toggle() } } label: {
                        ZStack {
                            line(open ? 0 : -6, open ? 45 : 0)
                            line(0, 0, hidden: true)
                            line(open ? 0 : 6, open ? -45 : 0)
                        }
                        .frame(width: 36, height: 36).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityLabel(open ? "Close menu" : "Open menu")
                }
                .padding(.horizontal, 14).frame(height: 52)
                Divider()
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(links.indices, id: \.self) { i in
                        Text(links[i]).font(.title2.weight(.semibold)).padding(.vertical, 4)
                            .opacity(open ? 1 : 0).offset(y: open ? 0 : 8)
                            .animation(reduce ? nil : (open ? .motion(.base).delay(0.08 + Double(i) * 0.04) : .motion(.snap)), value: open)
                    }
                }
                .padding(.init(top: 10, leading: 16, bottom: 16, trailing: 16))
                .frame(maxWidth: .infinity, alignment: .leading)
                .frame(height: open ? 238 : 0, alignment: .top).clipped()
                .animation(reduce ? nil : .motion(.base), value: open)
                .accessibilityHidden(!open)
                Spacer(minLength: 0)
            }
            .frame(width: 270, height: 290)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .overlay(RoundedRectangle(cornerRadius: 14).stroke(.quaternary))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
    }
}
