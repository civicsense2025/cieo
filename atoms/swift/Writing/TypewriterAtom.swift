import SwiftUI
import Cieo

public struct TypewriterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "typewriter", category: "Writing", name: "Typewriter lock",
        summary: "The caret stays pinned mid-screen while the paper glides beneath it, until the lock switch lets the caret walk instead.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var line = 0
    @State private var lock = true
    private let lineH: CGFloat = 26
    private let lines = ["The draft keeps going.", "The paper slides along.", "The caret holds still.",
                         "Each line finds center.", "The story takes shape.", "The end comes closer."]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Caret pinned mid-screen, paper moves") {
            VStack(spacing: 8) {
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 6).fill(Color.gray.opacity(0.2))
                        .frame(height: 24)
                        .offset(y: lock ? 63 : CGFloat(line) * lineH)
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(lines.indices, id: \.self) { i in
                            Text("Line \(i + 1) — \(lines[i])").font(.system(size: 14))
                                .frame(height: lineH, alignment: .leading)
                        }
                    }
                    .offset(y: lock ? 63 - CGFloat(line) * lineH : 0)
                }
                .frame(height: 150, alignment: .top).clipped()
                .animation(reduce ? nil : .motion(.soft), value: line)
                .animation(reduce ? nil : .motion(.soft), value: lock)
                HStack {
                    Button("Prev") { go(line - 1) }.buttonStyle(.bordered).frame(minHeight: 32)
                    Button("Next") { go(line + 1) }.buttonStyle(.bordered).frame(minHeight: 32)
                    Toggle("Lock", isOn: $lock).toggleStyle(.switch)
                        .font(.system(size: 12.5)).foregroundStyle(.secondary)
                }
            }
        }
    }

    private func go(_ i: Int) {
        let v = (i + lines.count) % lines.count
        if reduce { line = v } else { withMotion(.soft, reduceMotion: reduce) { line = v } }
    }
}
