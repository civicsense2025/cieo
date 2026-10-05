import SwiftUI
import MotionKit

public struct CenteredFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "footer-centered", category: "Footers", name: "Centered footer with social icons",
        summary: "Links draw their underline on hover. The social icons share one plate: entering the row fades it in under the nearest icon, moving along the row stretches it with the leading edge first and the trailing edge 60ms behind, and each glyph inks up as the plate passes under it. Back to top springs the page home.")
    public init() {}
    public var body: some View { FootPage { CenteredFooter() } }
}

private struct CenteredFooter: View {
    @Environment(\.footBackToTop) private var top
    @State private var hover: Int?
    @State private var frames: [AnyHashable: CGRect] = [:]
    private let icons = ["camera", "paperplane", "play.rectangle", "link"]
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "hexagon.fill").foregroundStyle(Color.accentColor)
            HStack(spacing: 14) { ForEach(["About", "Blog", "Careers", "Contact"], id: \.self) { FootLink(title: $0) } }
            HStack(spacing: 4) {
                ForEach(icons.indices, id: \.self) { i in
                    Image(systemName: icons[i]).frame(width: 34, height: 34)
                        .foregroundStyle(hover == i ? Color.primary : .secondary)
                        .motion(.snap, value: hover)
                        .reportFrame(i, in: "social").onHover { hover = $0 ? i : (hover == i ? nil : hover) }
                        .accessibilityLabel(["Photos", "Messages", "Video", "Link"][i])
                }
            }
            .background { MegaPlate(frame: hover.flatMap { frames[AnyHashable($0)] }, radius: 17) }
            .coordinateSpace(name: "social")
            .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
            Button("Back to top") { top() }.buttonStyle(.plain).font(.caption).foregroundStyle(.secondary)
            Text("© 2026 Studio").font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 16).overlay(alignment: .top) { Divider() }
    }
}
