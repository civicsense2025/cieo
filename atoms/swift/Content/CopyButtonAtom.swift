import SwiftUI
import MotionKit
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

public struct CopyButtonAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "copy", category: "Content", name: "Copy button",
        summary: "The icon button widens to fit “Copied”, turns success-colored and swaps its content, then returns after 1.6 seconds.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var copied = false
    @State private var resetTask: Task<Void, Never>?
    private let command = "npm create app@latest"
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap the copy button") {
            HStack(spacing: 10) {
                Text("$ ").foregroundStyle(.secondary) + Text(command)
                Spacer(minLength: 0)
                button
            }
            .font(.system(.footnote, design: .monospaced))
            .padding(.leading, 16).padding(.trailing, 8).padding(.vertical, 8)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
            .frame(maxWidth: 340)
        }
    }

    private var button: some View {
        Button(action: copy) {
            ZStack {
                if copied {
                    Label("Copied", systemImage: "checkmark").labelStyle(.titleAndIcon)
                        .transition(reduce ? .identity : .motionSwap(drift: 3))
                } else {
                    Image(systemName: "doc.on.doc")
                        .transition(reduce ? .identity : .motionSwap(drift: 3))
                }
            }
            .font(.caption.weight(.medium))
            .frame(width: copied ? 84 : 30, height: 30)
            .foregroundStyle(copied ? Color.green : Color.primary)
            .background(RoundedRectangle(cornerRadius: 8).fill(copied ? Color.green.opacity(0.14) : Color.clear))
            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(copied ? Color.green : Color.primary.opacity(0.18)))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .motion(.base, value: copied)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(copied ? "Copied" : "Copy command")
    }

    private func copy() {
        #if canImport(UIKit)
        UIPasteboard.general.string = command
        #elseif canImport(AppKit)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(command, forType: .string)
        #endif
        copied = true
        resetTask?.cancel()
        resetTask = Task {
            try? await Task.sleep(for: .seconds(1.6))
            guard !Task.isCancelled else { return }
            copied = false
        }
    }
}
