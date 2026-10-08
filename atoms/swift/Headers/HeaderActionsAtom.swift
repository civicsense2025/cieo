import SwiftUI
import Cieo

public struct HeaderActionsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "header-three", category: "Headers", name: "Header: links, logo centered, actions",
        summary: "Each link fills with a soft plate on its own spring when hovered or focused, so moving across the row leaves a short trail. Signing in swaps Sign in and the button for a notifications bell and the avatar; the bell’s unread dot scales away when clicked. The avatar opens a menu whose rows enter 30ms apart. Narrow: the burger opens a drawer from the left edge over a dimmed page, and the account zone stays in the bar.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var hover: Int?
    @State private var signedIn = false
    @State private var unread = true
    @State private var menu = false
    public init() {}
    public var body: some View {
        AtomStage(hint: "Hover links, sign in, click the bell and avatar") {
            VStack(alignment: .trailing, spacing: 6) {
                HStack {
                    HStack(spacing: 2) {
                        ForEach(0..<3, id: \.self) { i in
                            Text(hdrLinks[i]).font(.caption).padding(.horizontal, 8).padding(.vertical, 6)
                                .background(hover == i ? Color.primary.opacity(0.08) : .clear, in: Capsule())
                                .motion(.snap, value: hover).onHover { hover = $0 ? i : (hover == i ? nil : hover) }
                        }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                    HdrLogo()
                    actions.frame(maxWidth: .infinity, alignment: .trailing)
                }
                .padding(10)
                .background(.background, in: RoundedRectangle(cornerRadius: 10)).background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05)))
                if menu { accountMenu.motionTransition(.presence) }
                Spacer(minLength: 0)
            }
        }
    }

    @ViewBuilder private var actions: some View {
        HStack(spacing: 8) {
            if signedIn {
                Button { withMotion(.snap, reduceMotion: reduce) { unread = false } } label: {
                    Image(systemName: "bell").overlay(alignment: .topTrailing) {
                        Circle().fill(.red).frame(width: 7, height: 7).scaleEffect(unread ? 1 : 0)
                    }
                }.buttonStyle(.plain).accessibilityLabel("Notifications").accessibilityValue(unread ? "unread" : "none")
                Button { withMotion(.base, reduceMotion: reduce) { menu.toggle() } } label: { Circle().fill(Color.accentColor.opacity(0.25)).frame(width: 26, height: 26) }
                    .buttonStyle(.plain).accessibilityLabel("Account menu")
            } else {
                Button { withMotion(.base, reduceMotion: reduce) { signedIn = true; unread = true } } label: { HdrButton(title: "Sign in", filled: false) }.buttonStyle(.plain)
                HdrButton(title: "Start")
            }
        }
        .transition(.opacity)
    }

    private var accountMenu: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(["Profile", "Billing", "Sign out"].enumerated()), id: \.offset) { i, t in
                Button { withMotion(.base, reduceMotion: reduce) { menu = false; if i == 2 { signedIn = false } } } label: { Text(t).font(.caption).padding(.horizontal, 10).padding(.vertical, 6) }
                    .buttonStyle(.plain).megaRise(i, of: 3, lead: 0)
            }
        }
        .frame(width: 110, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: 8)).background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.05)))
    }
}
