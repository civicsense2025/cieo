import SwiftUI
import Cieo

public struct FollowButtonAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "follow", category: "Social", name: "Follow button",
        summary: "Follow turns into an outlined Following with its width springing to fit. Hovering Following previews Unfollow in the danger color, so the destructive action is never a surprise.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var following = false
    @State private var hovering = false
    public init() {}

    private var label: String { following ? (hovering ? "Unfollow" : "Following") : "Follow" }
    private var width: CGFloat { following ? (hovering ? 100 : 108) : 84 }
    private var tint: Color { following && hovering ? .red : .primary }

    public var body: some View {
        AtomStage(hint: "Follow, then hover the button") {
            HStack(spacing: 12) {
                Circle().fill(Color.accentColor).frame(width: 44, height: 44).accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Field Notes").font(.subheadline.weight(.semibold))
                    Text("@fieldnotes").font(.footnote).foregroundStyle(.secondary)
                }
                Button {
                    withMotion(.snap, reduceMotion: reduce) { following.toggle(); hovering = false }
                } label: {
                    SwapText(label).font(.footnote.weight(.semibold))
                        .foregroundStyle(following ? tint : Color(white: 1, opacity: 0.95))
                        .frame(width: width, height: 34)
                        .background(Capsule().fill(following ? Color.clear : Color.primary))
                        .overlay(Capsule().fill(tint).opacity(0.10).allowsHitTesting(false))
                        .clipShape(Capsule())
                        .motion(.base, value: label)
                }
                .buttonStyle(.plain).padding(.leading, 8)
                .accessibilityLabel(following ? "Unfollow Field Notes" : "Follow Field Notes")
                #if os(macOS)
                .onHover { h in withMotion(.base, reduceMotion: reduce) { hovering = h && following } }
                #endif
            }
        }
    }
}
