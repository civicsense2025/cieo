import SwiftUI
import MotionKit

public struct MinimizeToBarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "composemin", category: "Email", name: "Minimize to bar",
        summary: "Minimizing flies the window down into a bar at the bottom edge. Its position, size and radius each spring from the window’s rect, and the body fades first. Clicking the bar restores it along the same path.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var mini = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Minimize the window, click the bar to restore") {
            GeometryReader { g in
                let w = g.size.width, h = g.size.height
                let rect = mini ? CGRect(x: w - 200, y: h - 36, width: 188, height: 36) : CGRect(x: 24, y: 44, width: w - 48, height: 200)
                ZStack(alignment: .topLeading) {
                    Text("Inbox · 12 unread").font(.caption).foregroundStyle(.secondary).padding(14)
                    VStack(spacing: 0) {
                        HStack {
                            Text("New message").font(.caption.weight(.semibold))
                            Spacer()
                            Button { withMotion(.base, reduceMotion: reduce) { mini.toggle() } } label: { Image(systemName: "minus").frame(width: 28, height: 28) }
                                .buttonStyle(.plain).accessibilityLabel(mini ? "Restore" : "Minimize")
                        }
                        .padding(.leading, 12).padding(.trailing, 6).frame(height: 36).background(.primary).foregroundStyle(.background)
                        .contentShape(Rectangle()).onTapGesture { if mini { withMotion(.base, reduceMotion: reduce) { mini = false } } }
                        VStack(alignment: .leading, spacing: 6) {
                            Text("To: theo@studio.co").foregroundStyle(.secondary); Text("Subject: Pricing").foregroundStyle(.secondary)
                            Text("Can we review the yearly toggle today?")
                        }
                        .font(.caption).padding(.horizontal, 12).padding(.vertical, 10).frame(maxWidth: .infinity, alignment: .leading)
                        .opacity(mini ? 0 : 1).animation(reduce ? nil : (mini ? .motion(.snap) : .motion(.base).delay(0.15)), value: mini)
                        Spacer(minLength: 0)
                    }
                    .frame(width: rect.width, height: rect.height, alignment: .top)
                    .background(.background, in: UnevenRoundedRectangle(topLeadingRadius: mini ? 10 : 12, bottomLeadingRadius: mini ? 0 : 12, bottomTrailingRadius: mini ? 0 : 12, topTrailingRadius: mini ? 10 : 12))
                    .clipShape(UnevenRoundedRectangle(topLeadingRadius: mini ? 10 : 12, bottomLeadingRadius: mini ? 0 : 12, bottomTrailingRadius: mini ? 0 : 12, topTrailingRadius: mini ? 10 : 12))
                    .shadow(color: .black.opacity(0.15), radius: 6, y: 2)
                    .offset(x: rect.minX, y: rect.minY)
                    .animation(reduce ? nil : .motion(.base).delay(mini ? Motion.exit : 0), value: mini)
                }
                .frame(width: w, height: h, alignment: .topLeading)
                .background(.quaternary.opacity(0.4)).clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .frame(maxWidth: 380).frame(height: 290)
        }
    }
}
