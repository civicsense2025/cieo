import SwiftUI
import MotionKit

public struct ApprovalAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "approval", category: "Workflow", name: "Approval card",
        summary: "Deciding does two things in order. The status strip springs taller and its tint and outline morph from warning to success or danger while the label swaps. Then the Approve and Deny row fades out and its space collapses 100ms later, so the card ends as a stamp, not a form. Reset reverses it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Decision { case pending, approved, denied }
    @State private var decision = Decision.pending
    @State private var rowGone = false
    public init() {}

    private var tone: AgTone { decision == .approved ? .success : decision == .denied ? .danger : .warning }
    private var title: String { decision == .approved ? "Approved" : decision == .denied ? "Denied" : "Pending" }
    private var detail: String {
        decision == .approved ? "Claude Desktop can publish it now." : decision == .denied ? "Nothing was published." : "Expires in 14:52"
    }

    public var body: some View {
        AtomStage(hint: "Approve or deny; Reset reverses it") {
            AgCard {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Claude Desktop wants to publish a page").font(.headline)
                        Spacer()
                        Button("Reset") { reset() }.buttonStyle(AgPress()).font(.caption)
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        row("Client", "Claude Desktop"); row("Authorized by", "Maya Okafor")
                        row("Capability", "pages.publish"); row("Target", "Spring launch · /spring")
                    }
                    HStack(spacing: 8) {
                        Image(systemName: decision == .approved ? "checkmark.circle" : decision == .denied ? "xmark.circle" : "clock")
                        VStack(alignment: .leading, spacing: 0) {
                            SwapText(title).font(.callout.weight(.semibold))
                            SwapText(detail).font(.caption)
                        }
                        Spacer()
                    }
                    .foregroundStyle(tone.color)
                    .padding(10)
                    .frame(minHeight: decision == .pending ? 38 : 56, alignment: .center)
                    .background(tone.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
                    .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(tone.color.opacity(0.4)))
                    .animation(reduce ? nil : .motion(.base), value: decision)
                    AgReveal(open: !rowGone) {
                        HStack {
                            Button("Approve") { decide(.approved) }.buttonStyle(AgPress(tone: .success))
                            Button("Deny") { decide(.denied) }.buttonStyle(AgPress())
                        }
                        .opacity(decision == .pending ? 1 : 0)
                        .animation(reduce ? nil : .motion(.snap), value: decision)
                    }
                }
            }
            .frame(maxWidth: 380)
        }
    }

    private func row(_ k: String, _ v: String) -> some View {
        HStack { Text(k).foregroundStyle(.secondary); Spacer(); Text(v) }.font(.caption)
    }
    private func decide(_ d: Decision) {
        guard decision == .pending else { return }
        withMotion(.base, reduceMotion: reduce) { decision = d }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 100_000_000)
            withMotion(.base, reduceMotion: reduce) { rowGone = true }
        }
    }
    private func reset() { withMotion(.base, reduceMotion: reduce) { decision = .pending; rowGone = false } }
}
