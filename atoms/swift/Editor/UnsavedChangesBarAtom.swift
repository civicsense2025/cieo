import SwiftUI
import Cieo

public struct UnsavedChangesBarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "savebar", category: "Editor", name: "Unsaved changes bar",
        summary: "The first edit raises the bar from below and a small “Edited” marker fades in beside that field. Editing a field back to its saved value drops the marker and lowers the bar. Discard springs the language indicator and switch knob back and blur-swaps the name text at the same moment, then the bar leaves. Save morphs the button into a spinner, then a success check, the markers clear, the bar swaps to “Saved”, and it leaves.")

    private struct Settings: Equatable { var name = "Harbor & Pine"; var lang = 0; var show = true }
    private enum Phase { case idle, saving, saved }
    private enum Button_ { case save, spin, check }
    private let langs = ["English", "Español", "Français"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var saved = Settings()
    @State private var cur = Settings()
    @State private var phase = Phase.idle
    @State private var button = Button_.save
    @State private var frames: [AnyHashable: CGRect] = [:]
    public init() {}

    private var dirty: Bool { cur != saved }
    private var showBar: Bool { dirty || phase != .idle }

    public var body: some View {
        AtomStage(hint: "Edit any field") {
            ZStack(alignment: .bottom) {
                VStack(spacing: 0) {
                    row("Site name", edited: cur.name != saved.name) { TextField("Name", text: $cur.name).textFieldStyle(.roundedBorder).frame(width: 150) }
                    Divider()
                    row("Language", edited: cur.lang != saved.lang) { langPicker }
                    Divider()
                    row("Show in navigation", edited: cur.show != saved.show) { Toggle("Show in navigation", isOn: $cur.show).labelsHidden() }
                }
                .padding(.horizontal, 14).frame(width: 400).background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 12))
                .frame(maxHeight: .infinity, alignment: .top).padding(.top, 8)
                if showBar { bar.transition(reduce ? .identity : .move(edge: .bottom).combined(with: .opacity)).padding(8) }
            }
            .frame(width: 420, height: 250).clipped()
            .animation(reduce ? nil : .motion(.base), value: showBar)
            .animation(reduce ? nil : .motion(.base), value: cur)
            .onKeyPress(characters: ["s"], phases: .down) { p in if p.modifiers.contains(.command) { save(); return .handled }; return .ignored }
        }
    }

    private func row<C: View>(_ title: String, edited: Bool, @ViewBuilder _ control: () -> C) -> some View {
        HStack(spacing: 8) {
            Text(title).font(.footnote.weight(.medium))
            Text("Edited").font(.caption2.weight(.medium)).foregroundStyle(.orange).opacity(edited ? 1 : 0)
            Spacer(); control()
        }.padding(.vertical, 10)
    }

    private var langPicker: some View {
        ZStack(alignment: .topLeading) {
            if let f = frames[cur.lang] { EdgesIndicator(frame: f, shape: Capsule(), style: Color.secondary.opacity(0.3)) }
            HStack(spacing: 0) { ForEach(langs.indices, id: \.self) { i in
                Button(langs[i]) { cur.lang = i }.buttonStyle(.plain).font(.caption.weight(.medium)).padding(.horizontal, 9).padding(.vertical, 5).reportFrame(i, in: "lang")
            } }
        }
        .coordinateSpace(name: "lang").onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
        .background(Capsule().fill(.quaternary.opacity(0.6))).fixedSize()
    }

    private var bar: some View {
        HStack(spacing: 10) {
            ZStack { Text(phase == .saved ? "Saved" : "You have unsaved changes").id(phase == .saved).motionTransition(.swap()) }
                .font(.footnote.weight(.medium)).foregroundStyle(phase == .saved ? Color.green : .primary).animation(reduce ? nil : .motion(.base), value: phase)
            Spacer()
            if phase == .idle { Button("Discard", action: discard).buttonStyle(.bordered).controlSize(.small).transition(.opacity) }
            Button(action: save) {
                ZStack {
                    switch button {
                    case .save: Text("Save").id(0)
                    case .spin: ProgressView().controlSize(.small).id(1)
                    case .check: Image(systemName: "checkmark").id(2)
                    }
                }.frame(minWidth: button == .save ? 40 : 18).motionTransition(.swap()).animation(reduce ? nil : .motion(.base), value: button)
            }
            .buttonStyle(.borderedProminent).controlSize(.small).tint(button == .check ? .green : .accentColor).disabled(cur.name.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(.horizontal, 14).padding(.vertical, 10).background(.background, in: RoundedRectangle(cornerRadius: 12)).shadow(color: .black.opacity(0.15), radius: 10, y: 3)
    }

    private func discard() { withMotion(.base, reduceMotion: reduce) { cur = saved } }

    private func save() {
        guard phase == .idle, dirty, !cur.name.isEmpty else { return }
        let snap = cur
        withMotion(.base, reduceMotion: reduce) { phase = .saving; button = .spin }
        Task {
            try? await Task.sleep(for: .seconds(0.9)); withMotion(.base, reduceMotion: reduce) { button = .check; saved = snap }
            try? await Task.sleep(for: .seconds(0.4)); withMotion(.base, reduceMotion: reduce) { phase = .saved }
            try? await Task.sleep(for: .seconds(1.1)); withMotion(.base, reduceMotion: reduce) { phase = .idle }
            try? await Task.sleep(for: .seconds(0.35)); button = .save
        }
    }
}
