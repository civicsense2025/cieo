import SwiftUI
import Cieo

public struct HeaderSpreadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-spread", category: "Headers", name: "Header: logo, links, call to action",
        summary: "Click a link and the underline slides to it, the leading edge first and the trailing edge 60ms behind. Change the alignment and the link group glides across the free space between logo and actions. Sign in morphs the account zone: the width springs to the avatar while the buttons blur out and the avatar blurs in. Narrow: the burger becomes a cross, a drawer slides in from the right over a dimmed page, the links rise in one after another.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel = 0
    @State private var signedIn = false
    @State private var center = false
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}
    public var body: some View {
        AtomStage(hint: "Click a link, the alignment, or Sign in") {
            VStack(spacing: 10) {
                HStack(spacing: 12) {
                    HdrLogo()
                    HStack(spacing: 14) {
                        ForEach(hdrLinks.indices, id: \.self) { i in
                            Button(hdrLinks[i]) { withMotion(.base, reduceMotion: reduce) { sel = i } }
                                .buttonStyle(.plain).font(.caption).padding(.vertical, 6)
                                .reportFrame(i, in: "spread")
                        }
                    }
                    .overlay { frames[AnyHashable(sel)].map { f in
                        EdgesIndicator(frame: CGRect(x: f.minX, y: f.maxY - 2, width: f.width, height: 2), shape: Rectangle(), style: Color.accentColor) } }
                    .coordinateSpace(name: "spread")
                    .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
                    .frame(maxWidth: .infinity, alignment: center ? .center : .leading)
                    .motion(.soft, value: center)
                    account
                }
                .padding(.horizontal, 12).padding(.vertical, 8)
                .background(.background, in: RoundedRectangle(cornerRadius: 10)).overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.quaternary))
                Picker("Link alignment", selection: $center) { Text("Left").tag(false); Text("Center").tag(true) }
                    .pickerStyle(.segmented).frame(maxWidth: 180)
                HdrBlocks()
            }
        }
    }

    private var account: some View {
        ZStack {
            HStack(spacing: 6) {
                Button { withMotion(.base, reduceMotion: reduce) { signedIn = true } } label: { HdrButton(title: "Sign in", filled: false) }.buttonStyle(.plain)
                HdrButton(title: "Start")
            }
            .fixedSize().blur(radius: signedIn ? 6 : 0).opacity(signedIn ? 0 : 1)
            Button { withMotion(.base, reduceMotion: reduce) { signedIn = false } } label: { Circle().fill(Color.accentColor.opacity(0.25)).overlay(Image(systemName: "person.fill").font(.caption)) }
                .buttonStyle(.plain).accessibilityLabel("Account, sign out").frame(width: 28, height: 28)
                .blur(radius: signedIn ? 0 : 6).opacity(signedIn ? 1 : 0).allowsHitTesting(signedIn)
        }
        .frame(width: signedIn ? 32 : 130, height: 30)
        .clipped()
        .motion(.base, value: signedIn)
    }
}
