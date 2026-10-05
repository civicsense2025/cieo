import SwiftUI
import MotionKit

public struct MinimalFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-minimal", category: "Footers", name: "Minimal footer",
        summary: "Hovering or tabbing to a link draws its underline left to right on a snap spring while the text darkens; leaving wipes the line out toward the right. Back to top nudges its arrow up, then the page scrolls home on a soft spring and focus lands on the page heading. Wheel, touch or any key cancels the scroll mid-flight.")
    public init() {}
    public var body: some View { FootPage { MinimalFooter() } }
}

private struct MinimalFooter: View {
    @Environment(\.footBackToTop) private var top
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var nudge = false
    var body: some View {
        HStack {
            Text("© 2026 Studio").font(.caption).foregroundStyle(.secondary)
            Spacer()
            HStack(spacing: 14) { ForEach(["Privacy", "Terms", "Contact"], id: \.self) { FootLink(title: $0) } }
            Button {
                withAnimation(reduce ? nil : .motion(.snap)) { nudge = true }
                Task { try? await Task.sleep(for: .milliseconds(120)); nudge = false; top() }
            } label: { HStack(spacing: 4) { Text("Back to top").font(.callout); Image(systemName: "arrow.up").offset(y: nudge ? -4 : 0) } }
                .buttonStyle(.plain)
        }
        .padding(.vertical, 14).overlay(alignment: .top) { Divider() }
    }
}
