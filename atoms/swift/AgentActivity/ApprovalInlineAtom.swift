import SwiftUI
import Cieo

public struct ApprovalInlineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "approvalinline", category: "Agent activity", name: "Approval on the page",
        summary: "Assistant’s cursor walks to the button and stops, the page dims, a ring closes on the button (leading edge first) and the popover grows out of it, above or below depending on room. The popover lists exactly what will be sent. Risky actions add a typed confirmation: the Allow once button stays off until the name matches and a check swaps into the field. A choice swaps the ask for its result and the popover height eases to fit; Always allow also slides a rule into the list.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var frames: [String: CGRect] = [:]
    @State private var risky = false
    @State private var cursor = CGPoint(x: 8, y: 8)
    @State private var asking = false
    @State private var typed = ""
    @State private var result: String?
    @State private var rules: [String] = []
    @State private var run = 0
    public init() {}

    private var matches: Bool { typed == "Northwind" }

    public var body: some View {
        let f = frames[risky ? "delete" : "send"] ?? .zero
        AtomStage(hint: "Pick an action for the assistant to ask about") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Button("Submit a form") { start(false) }.buttonStyle(AgPress(tone: risky ? nil : .info))
                    Button("Delete a workspace") { start(true) }.buttonStyle(AgPress(tone: risky ? .danger : nil))
                }.font(.caption)
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.04))
                    HStack(spacing: 10) {
                        Label("Send", systemImage: "paperplane").padding(8).background(Color.accentColor, in: RoundedRectangle(cornerRadius: 6)).foregroundStyle(.white).reportFrame("send", in: "pg")
                        Label("Delete", systemImage: "trash").padding(8).background(Color.red, in: RoundedRectangle(cornerRadius: 6)).foregroundStyle(.white).reportFrame("delete", in: "pg")
                    }.font(.caption).padding(.top, 70).padding(.leading, 16)
                    Color.black.opacity(asking ? 0.12 : 0).clipShape(RoundedRectangle(cornerRadius: 10)).allowsHitTesting(false)
                    if asking { AgFrameRing(frame: f) }
                    if asking || result != nil { popover(f).motionTransition(.presence) }
                    AgCursor().position(x: cursor.x + 7, y: cursor.y + 9)
                }
                .agFrames($frames).frame(height: 190)
                if !rules.isEmpty { Text("Always allowed: " + rules.joined(separator: ", ")).font(.caption).foregroundStyle(.secondary).transition(.opacity) }
            }
            .frame(maxWidth: 380)
            .animation(reduce ? nil : .motion(.base), value: rules.count)
        }
        .task(id: run) { await ask() }
    }

    private func popover(_ f: CGRect) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            if let r = result { Label(r, systemImage: r.hasPrefix("Denied") ? "xmark.circle" : "checkmark.circle").font(.caption).motionTransition(.swap()) }
            else {
                Text(risky ? "Delete workspace Northwind" : "Submit the signup form").font(.caption.weight(.semibold))
                Text(risky ? "This sends: workspace_id=ws_91, permanent=true" : "This sends: email, plan=Team").font(.caption2).foregroundStyle(.secondary)
                if risky { TextField("Type Northwind to confirm", text: $typed).textFieldStyle(.roundedBorder).font(.caption) }
                HStack {
                    Button("Allow once") { decide("Allowed once", always: false) }.buttonStyle(AgPress(tone: .info)).disabled(risky && !matches)
                    if !risky { Button("Always allow") { decide("Always allowed", always: true) }.buttonStyle(AgPress()) }
                    Button("Deny") { decide("Denied", always: false) }.buttonStyle(AgPress())
                }.font(.caption)
            }
        }
        .padding(10).frame(width: 220, alignment: .leading)
        .background(.background, in: RoundedRectangle(cornerRadius: 10)).overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(.quaternary)).shadow(radius: 6, y: 2)
        .position(x: min(max(f.midX, 120), 250), y: f.maxY + 60)
    }

    private func start(_ r: Bool) { risky = r; result = nil; typed = ""; asking = false; run += 1 }
    private func ask() async {
        try? await Task.sleep(nanoseconds: 200_000_000)
        guard let f = frames[risky ? "delete" : "send"] else { return }
        withMotion(.soft, reduceMotion: reduce) { cursor = CGPoint(x: f.midX, y: f.midY) }
        try? await Task.sleep(nanoseconds: 600_000_000)
        withMotion(.base, reduceMotion: reduce) { asking = true }
    }
    private func decide(_ r: String, always: Bool) {
        withMotion(.base, reduceMotion: reduce) { result = r; asking = false; if always { rules.append("Submit a form") } }
    }
}
