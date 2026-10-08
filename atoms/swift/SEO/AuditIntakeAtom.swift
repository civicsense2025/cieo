import SwiftUI
import Cieo

public struct AuditIntakeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "auditintake", category: "SEO", name: "Site-audit intake",
        summary: "One question per panel: the old panel slides out with blur before the next slides in, and the progress bar fills on the same spring. A valid URL earns the success check.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var url = "example.site"
    @State private var pages = "100"
    @State private var emailReport = true
    @State private var queued = false
    public init() {}

    private var urlOK: Bool {
        let v = url.trimmingCharacters(in: .whitespaces)
        guard let dot = v.firstIndex(of: ".") else { return false }
        return !v.contains(" ") && dot != v.startIndex && dot != v.index(before: v.endIndex)
    }

    public var body: some View {
        AtomStage(hint: "Answer one question at a time") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Free site audit").font(.headline)
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary)
                        Capsule().fill(Color.accentColor)
                            .frame(width: g.size.width * Double(step + 1) / 3)
                    }
                }
                .frame(height: 6).motion(.base, value: step)
                ZStack {
                    if step == 0 {
                        panel("What site should we audit?") {
                            HStack(spacing: 8) {
                                TextField("example.site", text: $url)
                                    .textFieldStyle(.roundedBorder).font(.subheadline)
                                    .monospacedDigit()
                                if urlOK {
                                    Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                                        .motionTransition(.presence)
                                }
                            }
                            Text(url.isEmpty ? "" : urlOK ? "Looks crawlable." : "Enter a domain like example.site.")
                                .font(.caption).foregroundStyle(urlOK ? Color.green : Color.red)
                                .frame(height: 16)
                            rowNav(showBack: false, next: "Continue") {
                                if urlOK { advance(1) }
                            }
                        }
                        .id(0).motionTransition(.swap())
                    } else if step == 1 {
                        panel("How many pages?") {
                            HStack(spacing: 8) {
                                ForEach(["100", "1k", "10k"], id: \.self) { n in
                                    Button(n) { withMotion(.snap, reduceMotion: reduce) { pages = n } }
                                        .buttonStyle(.bordered).controlSize(.small)
                                        .tint(pages == n ? .accentColor : .secondary)
                                }
                            }
                            Text("Bigger crawls take longer. 100 pages is instant.")
                                .font(.caption).foregroundStyle(.secondary)
                            rowNav(showBack: true, next: "Continue") { advance(2) }
                        }
                        .id(1).motionTransition(.swap())
                    } else {
                        if queued {
                            VStack(spacing: 6) {
                                Image(systemName: "checkmark.circle.fill").foregroundStyle(.green).font(.title2)
                                Text("Audit queued").font(.subheadline.weight(.semibold))
                                Text("Crawling \(pages) pages. Report lands in ~2 min.")
                                    .font(.caption).foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity).padding(.vertical, 20)
                            .id(3).motionTransition(.swap())
                        } else {
                            panel("Where should we send it?") {
                                TextField("you@example.com", text: .constant("you@example.com"))
                                    .textFieldStyle(.roundedBorder).font(.subheadline)
                                rowNav(showBack: true, next: "Queue audit ✓") {
                                    withMotion(.base, reduceMotion: reduce) { queued = true }
                                }
                            }
                            .id(2).motionTransition(.swap())
                        }
                    }
                }
                .animation(reduce ? nil : .motion(.base), value: step)
                .animation(reduce ? nil : .motion(.base), value: queued)
                HStack(spacing: 6) {
                    Text("Step \(min(step + 1, 3)) of 3").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    Text("·").foregroundStyle(.secondary)
                    Toggle("Email my report", isOn: $emailReport).font(.caption).foregroundStyle(.secondary)
                        .nativeToggleStyle()
                }
            }
            .frame(width: 340)
        }
    }

    private func panel<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.subheadline.weight(.semibold))
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 12))
    }

    private func rowNav(showBack: Bool, next: String, onNext: @escaping () -> Void) -> some View {
        HStack {
            if showBack { Button("Back") { withMotion(.base, reduceMotion: reduce) { step -= 1 } } }
            Spacer()
            Button(next, action: onNext).buttonStyle(.borderedProminent).controlSize(.small)
        }
    }

    private func advance(_ n: Int) {
        withMotion(.base, reduceMotion: reduce) { step = n }
    }
}
