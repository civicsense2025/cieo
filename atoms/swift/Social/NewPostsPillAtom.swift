import SwiftUI
import MotionKit

public struct NewPostsPillAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "newposts", category: "Social", name: "New posts pill",
        summary: "New posts gather quietly every few seconds and a pill drops in from the top with a rolling count. Clicking it inserts them at the top, each opening on a height spring, and the pill leaves.")

    private struct Post: Identifiable { let id = UUID(); let title: String }
    private let incoming = ["Fog notes from the mill", "The yearly toggle, explained", "Three CSS habits we kept", "A smaller homepage", "Why we sunset comments", "Harbor at 6am"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var posts = ["A smaller homepage", "On member pricing", "Notes from the river path", "Three CSS habits"].map { Post(title: $0) }
    @State private var pending: [Post] = []
    @State private var next = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "New posts arrive every few seconds") {
            ZStack(alignment: .top) {
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(posts) { p in
                            VStack(alignment: .leading, spacing: 2) {
                                Text(p.title).font(.subheadline.weight(.semibold))
                                Text("just now").font(.footnote).foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 12)
                            .overlay(alignment: .bottom) { Divider() }
                            .transition(reduce ? .identity : .modifier(active: Arrive(o: Motion.arriveOpacity, y: -12), identity: Arrive(o: 1, y: 0)))
                        }
                    }
                }
                if !pending.isEmpty {
                    Button(action: flush) {
                        HStack(spacing: 6) {
                            Image(systemName: "arrow.up").font(.caption.weight(.bold))
                            RollingDigits(min(99, pending.count))
                            Text("new posts")
                        }
                        .font(.footnote.weight(.medium)).foregroundStyle(.background)
                        .padding(.horizontal, 12).padding(.vertical, 7).background(Capsule().fill(.primary))
                    }
                    .buttonStyle(.plain).padding(.top, 10)
                    .transition(reduce ? .identity : .motionPresence)
                    .accessibilityLabel("\(pending.count) new posts")
                }
            }
            .frame(width: 300, height: 270)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(3.5))
                if Task.isCancelled { return }
                let title = incoming[next % incoming.count]; next += 1
                withMotion(.base, reduceMotion: reduce) { pending.append(Post(title: title)) }
            }
        }
    }

    private func flush() {
        let fresh = pending
        withMotion(.base, reduceMotion: reduce) { posts.insert(contentsOf: fresh.reversed(), at: 0); pending = [] }
        if posts.count > 8 { posts.removeLast(posts.count - 8) }
    }
}

private struct Arrive: ViewModifier {
    let o: Double, y: CGFloat
    func body(content: Content) -> some View { content.opacity(o).offset(y: y) }
}
