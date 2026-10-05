import SwiftUI
import MotionKit

public struct FullFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz8-full", category: "Footers", name: "Full footer with staggered entrance",
        summary: "The footer enters in one staggered sequence: eyebrow, headline, actions, newsletter, the four link columns, social, status and language, each 55ms after the one before, then the wordmark letters rise 40ms apart and the thirty uptime bars grow in. Scrolling away and back replays it. The newsletter field rings in danger for a bad address and opens its message; a good one shrinks the button into a spinner, then a check.")
    public init() {}
    public var body: some View { FootPage(blocks: 2, hint: "Scroll away and back to replay") { Full() } }
}

private struct Full: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Environment(\.footVisible) private var visible
    @State private var email = ""
    @State private var phase = 0   // 0 idle, 1 invalid, 2 loading, 3 done
    @State private var lang = "English"
    private let cols = [("Product", ["Overview", "Pricing"]), ("Company", ["About", "Careers"]), ("Learn", ["Docs", "Blog"]), ("Legal", ["Privacy", "Terms"])]
    private let word = Array("studio")

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("LET’S TALK").font(.caption2.weight(.semibold)).footRise(0, gap: 0.055)
            Text("Build calmer software").font(.title3.weight(.bold)).footRise(1, gap: 0.055)
            HStack { Button("Book a call") {}.buttonStyle(.borderedProminent); FootLink(title: "See pricing") }.footRise(2, gap: 0.055)
            newsletter.footRise(3, gap: 0.055)
            HStack(alignment: .top, spacing: 14) {
                ForEach(cols.indices, id: \.self) { i in
                    VStack(alignment: .leading, spacing: 5) { Text(cols[i].0).font(.caption.weight(.semibold)); ForEach(cols[i].1, id: \.self) { FootLink(title: $0) } }
                        .frame(maxWidth: .infinity, alignment: .leading).footRise(4 + i, gap: 0.055)
                }
            }
            HStack(spacing: 10) {
                ForEach(["camera", "paperplane", "play.rectangle"], id: \.self) { Image(systemName: $0).foregroundStyle(.secondary) }.accessibilityHidden(true)
                Spacer()
                HStack(spacing: 5) { Circle().fill(.green).frame(width: 7, height: 7); Text("All systems operational").font(.caption) }
                Picker("Language", selection: $lang) { ForEach(["English", "Français"], id: \.self) { Text($0) } }.labelsHidden().fixedSize()
            }.footRise(8, gap: 0.055)
            HStack(alignment: .bottom, spacing: 0) {
                ForEach(word.indices, id: \.self) { i in
                    Text(String(word[i])).font(.system(size: 56, weight: .bold)).fixedSize().frame(height: 52, alignment: .top).clipped()
                        .offset(y: visible ? 0 : 56).animation(reduce ? nil : .motion(.base).delay(visible ? 0.55 + Double(i) * 0.04 : 0), value: visible)
                }
                Spacer(minLength: 8)
                HStack(alignment: .bottom, spacing: 2) {
                    ForEach(0..<30, id: \.self) { i in
                        Capsule().fill(Color.green.opacity(0.7)).frame(width: 3, height: visible ? CGFloat(14 + (i * 7) % 12) : 2)
                            .animation(reduce ? nil : .motion(.soft).delay(visible ? 0.8 + Double(i) * 0.01 : 0), value: visible)
                    }
                }.frame(height: 26).accessibilityLabel("Uptime, last 30 days")
            }
            .clipped().accessibilityElement(children: .combine)
        }
        .padding(.vertical, 16).overlay(alignment: .top) { Divider() }
    }

    private var newsletter: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 6) {
                TextField("you@example.com", text: $email).textFieldStyle(.roundedBorder)
                    .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(phase == 1 ? Color.red : .clear, lineWidth: 1.5)).onSubmit(submit)
                Button(action: submit) {
                    ZStack {
                        if phase == 2 { ProgressView().controlSize(.small) } else if phase == 3 { Image(systemName: "checkmark") } else { Text("Join") }
                    }.frame(width: phase == 0 || phase == 1 ? 50 : 30, height: 22)
                }.buttonStyle(.borderedProminent).tint(phase == 3 ? .green : .accentColor).disabled(phase >= 2)
            }
            if phase == 1 { Text("Enter a valid email address").font(.caption).foregroundStyle(.red).transition(.motionPresence) }
        }
        .frame(maxWidth: 300).animation(reduce ? nil : .motion(.base), value: phase)
    }

    private func submit() {
        guard email.contains("@"), email.contains(".") else { phase = 1; return }
        phase = 2
        Task { try? await Task.sleep(for: .milliseconds(900)); phase = 3 }
    }
}
