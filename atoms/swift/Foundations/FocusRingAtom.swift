import SwiftUI
import Cieo

public struct FocusRingAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "focusring", category: "Foundations", name: "Focus ring",
        summary: "One snap ring for every input. Theme and width stay consistent everywhere by construction.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Field?
    @State private var ring = Track(0, preset: .snap)
    @State private var theme = "accent"
    @State private var width = 2.0
    private enum Field: Hashable { case title, save, share }
    private let themes = ["accent", "ink", "success", "danger"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "One snap ring serves every input — tab through them") {
            VStack(spacing: 16) {
                ZStack {
                    TimelineView(.animation(paused: reduce)) { ctx in
                        let t = ctx.date.timeIntervalSinceReferenceDate
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(ringColor, lineWidth: width)
                            .opacity(ring.value(at: t))
                            .scaleEffect(0.97 + 0.03 * ring.value(at: t))
                    }
                    VStack(spacing: 16) {
                        TextField("Title", text: .constant("Spring essay"))
                            .focused($focused, equals: .title)
                            .textFieldStyle(.roundedBorder).frame(minHeight: 40)
                        HStack(spacing: 8) {
                            Button("Save draft") {}.focused($focused, equals: .save)
                                .buttonStyle(.bordered).frame(maxWidth: .infinity, minHeight: 40)
                            Button("Share") {}.focused($focused, equals: .share)
                                .buttonStyle(.bordered).frame(maxWidth: .infinity, minHeight: 40)
                        }
                    }
                    .padding(5)
                }
                Text("\(theme) · \(Int(width))px · snap")
                    .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    Picker("Theme", selection: $theme) {
                        ForEach(themes, id: \.self) { Text($0).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    Slider(value: $width, in: 1...4, step: 1).frame(minHeight: 32)
                }
            }
            .frame(maxWidth: 340)
            .onChange(of: focused) { _ in show() }
        }
    }

    private var ringColor: Color {
        switch theme {
        case "ink": .primary
        case "success": .green
        case "danger": .red
        default: .accentColor
        }
    }

    private func show() {
        if reduce { ring.jump(focused == nil ? 0 : 1) }
        else { ring.set(focused == nil ? 0 : 1, at: Date().timeIntervalSinceReferenceDate) }
    }
}
