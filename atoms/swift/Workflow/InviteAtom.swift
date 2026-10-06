import SwiftUI
import Cieo

public struct InviteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "invite", category: "Workflow", name: "Invite member",
        summary: "Invite opens a form row at the top of the list and its height springs open. Send keeps that same row: the form swaps out for the member, the height morphs to fit and the chip reads Pending. Resend turns the chip success and Sent for 1.6 seconds, widening it on the same spring. Revoke fades the row out first, then its space collapses. Dividers live between rows, never on the collapsing slot.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var formOpen = false
    @State private var email = ""
    @State private var role = "Editor"
    @State private var invited = false
    @State private var sent = false
    @State private var revoked = false
    @State private var showBad = false
    @State private var lines = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Invite, Send, Resend, Revoke") {
            AgCard {
                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Members").font(.headline)
                            Text(invited && !revoked ? "3 active, 1 pending" : "3 active").font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button { toggleForm() } label: { SwapText(formOpen ? "Cancel" : "Invite") }
                            .buttonStyle(AgPress(tone: formOpen ? nil : .info)).disabled(invited && !revoked)
                    }.padding(.bottom, 8)
                    AgReveal(open: formOpen && !invited) {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                TextField("name@company.com", text: $email).textFieldStyle(.roundedBorder)
                                Picker("Role", selection: $role) { ForEach(["Editor", "Viewer", "Admin"], id: \.self) { Text($0) } }.labelsHidden()
                            }
                            Text(showBad ? "Enter a full email address." : "They get an email link that expires in 7 days.")
                                .id(showBad).transition(reduce ? .identity : .motionSwap())
                                .font(.caption).foregroundStyle(showBad ? .red : .secondary)
                            Button("Send invite") { send() }.buttonStyle(AgPress(tone: .info))
                        }.padding(.bottom, 8)
                    }
                    AgReveal(open: invited && !revoked) { pendingRow.padding(.bottom, 8) }
                    member("M", "Maya Okafor", "Owner")
                    divider
                    member("T", "Theo Lindqvist", "Editor")
                    divider
                    member("P", "Priya Raman", "Viewer")
                    HStack(spacing: 6) {
                        Text("Lines").font(.caption).foregroundStyle(.secondary)
                        Button(lines ? "On" : "Off") { withMotion(.base, reduceMotion: reduce) { lines.toggle() } }
                            .font(.caption).buttonStyle(AgPress()).accessibilityLabel("Dividers \(lines ? "on" : "off")")
                    }.padding(.top, 8)
                }
            }
            .frame(maxWidth: 430)
        }
    }

    @ViewBuilder private var divider: some View {
        if lines { Divider() } else { EmptyView() }
    }

    private var pendingRow: some View {
        HStack {
            Image(systemName: "envelope").foregroundStyle(.secondary)
            VStack(alignment: .leading, spacing: 0) { Text(email); Text(role).font(.caption).foregroundStyle(.secondary) }
            Spacer()
            AgChip(text: sent ? "Sent" : "Pending", tone: sent ? .success : .neutral, icon: sent ? "checkmark" : nil)
            Button("Resend") { resend() }.buttonStyle(AgPress())
            Button("Revoke") { revoke() }.buttonStyle(AgPress())
        }.font(.callout)
    }

    private func member(_ initial: String, _ name: String, _ r: String) -> some View {
        HStack {
            Text(initial).font(.caption.weight(.semibold)).frame(width: 24, height: 24).background(.quaternary, in: Circle())
            Text(name); Spacer(); Text(r).foregroundStyle(.secondary)
        }.font(.callout).padding(.vertical, 8).accessibilityElement(children: .combine)
    }

    private func toggleForm() { withMotion(.base, reduceMotion: reduce) { formOpen.toggle(); showBad = false } }
    private func send() {
        guard email.contains("@"), email.contains(".") else { withMotion(.base, reduceMotion: reduce) { showBad = true }; return }
        withMotion(.base, reduceMotion: reduce) { invited = true; revoked = false; formOpen = false; sent = false }
    }
    private func resend() {
        withMotion(.base, reduceMotion: reduce) { sent = true }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_600_000_000)
            withMotion(.base, reduceMotion: reduce) { sent = false }
        }
    }
    private func revoke() {
        withMotion(.base, reduceMotion: reduce) { revoked = true }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 400_000_000)
            invited = false; email = ""
        }
    }
}
