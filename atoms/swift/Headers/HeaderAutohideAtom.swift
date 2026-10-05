import SwiftUI
import Cieo

public struct HeaderAutohideAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-autohide", category: "Headers", name: "Header: hides on scroll down",
        summary: "Scroll down past 80px and the header slides up out of the frame on a fast spring, leading with its bottom edge. The first upward scroll of 4px brings it back on a softer spring, so it leaves quickly and arrives gently. It also returns whenever focus moves into it, when a menu is open, and at the very top. The label below reads the current state.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var offset: CGFloat = 0
    @State private var hidden = false
    @State private var extreme: CGFloat = 0
    public init() {}
    public var body: some View {
        AtomStage(hint: "Scroll down, then up a little") {
            VStack(spacing: 6) {
                SwapText(hidden ? "Header hidden" : "Header visible").font(.caption.weight(.medium))
                ZStack(alignment: .top) {
                    HdrScroll(offset: $offset, top: 56)
                    HStack { HdrLogo(); Spacer(); HStack(spacing: 14) { ForEach(hdrLinks.prefix(3), id: \.self) { Text($0).font(.caption) } } }
                        .padding(.horizontal, 14).frame(height: 56).background(.background)
                        .overlay(alignment: .bottom) { Rectangle().fill(.quaternary).frame(height: 1) }
                        .offset(y: hidden ? -60 : 0)
                        .animation(reduce ? nil : .motion(hidden ? .snap : .soft), value: hidden)
                }
                .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            .onChange(of: offset) { old, new in
                if new <= 0 { extreme = 0; set(false); return }
                if new > old {
                    extreme = new
                    if new > 80 { set(true) }
                } else if extreme - new >= 4 {
                    set(false)
                }
            }
        }
    }

    private func set(_ h: Bool) { if hidden != h { hidden = h } }
}
