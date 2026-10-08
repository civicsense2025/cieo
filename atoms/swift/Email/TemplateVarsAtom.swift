import SwiftUI
import Cieo

public struct TemplateVarsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "templatevars", category: "Email", name: "Template variables",
        summary: "The snippet pill inks on base while values swap into fixed-width slots, so nothing jumps. The missing date pulses a warning until it is filled.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var inserted = false
    @State private var first = ""
    @State private var plan = ""
    @State private var date = ""
    @State private var warn = false
    @State private var keepPlaceholders = true
    public init() {}

    private func slot(_ value: String, placeholder: String) -> String {
        if !value.isEmpty { return value }
        if keepPlaceholders { return placeholder }
        return "—"
    }

    public var body: some View {
        AtomStage(hint: "Insert, then fill the blanks") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Text("Follow-up v2")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10).padding(.vertical, 5)
                            .background(Capsule().fill(Color.primary.opacity(inserted ? 0.22 : 0.1)))
                            .overlay(Capsule().fill(Color.primary).opacity(0.10).allowsHitTesting(false))
                            .animation(reduce ? nil : .motion(.base), value: inserted)
                        Button("Insert snippet") { insert() }
                            .buttonStyle(.borderedProminent).controlSize(.small)
                            .disabled(inserted)
                    }
                    HStack(spacing: 0) {
                        Text("Hi ").font(.caption)
                        SwapText(slot(first, placeholder: "{{first}}")).font(.caption.weight(.semibold))
                            .frame(minWidth: 64)
                        Text(", your ").font(.caption)
                        SwapText(slot(plan, placeholder: "{{plan}}")).font(.caption.weight(.semibold))
                            .frame(minWidth: 64)
                        Text(" trial ends ").font(.caption)
                        SwapText(slot(date, placeholder: "{{date}}")).font(.caption.weight(.semibold))
                            .frame(minWidth: 64)
                            .background(RoundedRectangle(cornerRadius: 6).fill(Color.red.opacity(warn ? 0.25 : 0)))
                            .foregroundStyle(inserted && date.isEmpty ? Color.red : Color.primary)
                        Text(".").font(.caption)
                    }
                    HStack(spacing: 6) {
                        TextField("first", text: $first).softFieldSurface().font(.caption)
                        TextField("plan", text: $plan).softFieldSurface().font(.caption)
                    }
                    TextField("End date, e.g. Friday", text: $date).softFieldSurface().font(.caption)
                    SwapText(inserted && date.isEmpty ? "Add the end date above" : "").font(.caption)
                        .foregroundStyle(Color.red)
                        .frame(height: 18, alignment: .leading)
                }
                .padding(14).frame(maxWidth: 320)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                Toggle("Keep placeholders", isOn: $keepPlaceholders)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
    }

    private func insert() {
        withMotion(.base, reduceMotion: reduce) {
            inserted = true
            if first.isEmpty { first = "Maya" }
            if plan.isEmpty { plan = "Pro" }
            warn = date.isEmpty
        }
        Task {
            try? await Task.sleep(for: .milliseconds(reduce ? 0 : 350))
            withMotion(.base, reduceMotion: reduce) { warn = false }
        }
    }
}
