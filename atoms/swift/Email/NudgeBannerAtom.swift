import SwiftUI
import Cieo

public struct NudgeBannerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "nudgebanner", category: "Email", name: "Follow-up nudge",
        summary: "The no-reply warning drops in and pushes the thread down on base. Setting a reminder swaps a spinner into a success check terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var phase = 0
    @State private var nudgeAfter = true
    public init() {}
    private let thread = [
        ("MQ", "Maya · pricing draft", "Tue 9:12 AM"),
        ("JK", "Jon · +1, send it", "Tue 9:40 AM"),
    ]
    private var buttonLabel: String {
        if phase == 0 { return "Check for replies" }
        if phase == 1 { return "Set reminder" }
        return "Reminder set"
    }
    private var status: String {
        if phase == 2 { return "Setting reminder…" }
        if phase == 3 { return "Reminder set" }
        return ""
    }

    public var body: some View {
        AtomStage(hint: "Check, then set a reminder") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    if phase >= 1 {
                        HStack(spacing: 8) {
                            Text("!")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(Color.red)
                                .frame(width: 22, height: 22)
                                .overlay(Circle().stroke(Color.red, lineWidth: 1.5))
                            Text("No reply in 3 days — the thread is stalling.")
                                .font(.caption)
                        }
                        .padding(10)
                        .background(RoundedRectangle(cornerRadius: 10).fill(Color.red.opacity(0.1)))
                        .motionTransition(.presence)
                    }
                    VStack(spacing: 0) {
                        ForEach(thread.indices, id: \.self) { i in
                            HStack(spacing: 10) {
                                Circle().fill(Color.accentColor.opacity(0.15))
                                    .frame(width: 34, height: 34)
                                    .overlay(Text(thread[i].0).font(.caption2.weight(.semibold)))
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(thread[i].1).font(.caption.weight(.semibold))
                                    Text(thread[i].2).font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                            }
                            .padding(.vertical, 9)
                            if i < thread.count - 1 { Divider() }
                        }
                    }
                    .offset(y: phase >= 1 ? 8 : 0)
                    .animation(reduce ? nil : .motion(.base), value: phase)
                    HStack(spacing: 8) {
                        Button { advance() } label: { SwapText(buttonLabel) }
                            .buttonStyle(.borderedProminent).controlSize(.small)
                            .disabled(phase >= 2)
                        if phase == 2 { ProgressView().controlSize(.small) }
                        SwapText(status).font(.caption)
                            .foregroundStyle(phase == 3 ? Color.green : Color.primary)
                    }
                }
                .padding(14).frame(maxWidth: 300)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                .animation(reduce ? nil : .motion(.base), value: phase)
                Toggle("Nudge after 3 days", isOn: $nudgeAfter)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
    }

    private func advance() {
        if phase == 0 {
            withMotion(.base, reduceMotion: reduce) { phase = 1 }
        } else if phase == 1 {
            withMotion(.base, reduceMotion: reduce) { phase = 2 }
            Task {
                try? await Task.sleep(for: .milliseconds(reduce ? 0 : 650))
                withMotion(.base, reduceMotion: reduce) { phase = 3 }
            }
        }
    }
}
