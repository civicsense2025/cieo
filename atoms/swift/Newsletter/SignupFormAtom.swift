import SwiftUI
import Cieo

public struct SignupFormAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "signupform", category: "Newsletter", name: "Popup, slide-in and bar",
        summary: "Three ways to show one sign-up form. A popup scales up over a scrim, a slide-in rises from the corner, and a bar drops from the top without blocking. Each waits 1.2 seconds, and closing is quicker than opening.")

    private let modes = ["Popup", "Slide-in", "Top bar"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var mode = 0
    @State private var shown = false
    @State private var frames: [AnyHashable: CGRect] = [:]
    @State private var replay = 0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Switch style; the form appears after 1.2 s") {
            VStack(spacing: 10) {
                picker
                site
                Button("Replay") { replay += 1 }.font(.caption).buttonStyle(.borderless)
            }
        }
        .task(id: "\(mode)-\(replay)") {
            shown = false
            try? await Task.sleep(for: .seconds(1.2))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { shown = true }
        }
    }

    private var picker: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 9).fill(.quaternary)
            if let f = frames[mode] {
                EdgesIndicator(frame: f, shape: RoundedRectangle(cornerRadius: 7), style: Color(.sRGB, white: 0.5, opacity: 0.35))
            }
            HStack(spacing: 0) {
                ForEach(modes.indices, id: \.self) { i in
                    Button(modes[i]) { mode = i }
                        .buttonStyle(.plain).font(.footnote.weight(.medium))
                        .padding(.horizontal, 14).padding(.vertical, 6)
                        .reportFrame(i, in: "signup-seg")
                        .accessibilityAddTraits(mode == i ? .isSelected : [])
                }
            }
        }
        .coordinateSpace(name: "signup-seg")
        .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
        .fixedSize()
    }

    private var site: some View {
        ZStack(alignment: alignment) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Field Notes").font(.headline)
                Text("A weekly letter about rivers, routes and slow mornings.").font(.footnote).foregroundStyle(.secondary)
            }.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading).padding(16)
            if mode == 0 && shown { Color.black.opacity(0.35).transition(.opacity).onTapGesture(perform: close) }
            if shown { form.padding(mode == 2 ? 0 : 12).transition(transition) }
        }
        .frame(width: 340, height: 220)
        .background(RoundedRectangle(cornerRadius: 14).fill(.quaternary.opacity(0.5)))
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var alignment: Alignment { mode == 0 ? .center : mode == 1 ? .bottomTrailing : .top }

    private var form: some View {
        HStack(spacing: 8) {
            VStack(alignment: .leading, spacing: 6) {
                if mode != 2 { Text("Get the Sunday letter").font(.subheadline.weight(.semibold)) }
                HStack { Text("you@example.com").font(.footnote).foregroundStyle(.secondary).padding(8)
                    .frame(maxWidth: .infinity, alignment: .leading).background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
                    Button("Join") {}.buttonStyle(.borderedProminent).controlSize(.small) }
            }
            Button(action: close) { Image(systemName: "xmark").font(.caption2) }.buttonStyle(.plain).accessibilityLabel("Close")
        }
        .padding(12)
        .frame(width: mode == 2 ? nil : mode == 0 ? 270 : 240)
        .background(.background, in: RoundedRectangle(cornerRadius: mode == 2 ? 0 : 14))
        .shadow(color: .black.opacity(0.12), radius: 8, y: 2)
    }

    private var transition: AnyTransition {
        let t: AnyTransition = mode == 0 ? .opacity.combined(with: .scale(scale: 0.96))
            : mode == 1 ? .opacity.combined(with: .offset(y: 24)) : .move(edge: .top)
        if reduce { return .identity }
        return .asymmetric(insertion: t.animation(.motion(.base)), removal: t.animation(.motion(.snap)))
    }

    private func close() { withMotion(.snap, reduceMotion: reduce) { shown = false } }
}
