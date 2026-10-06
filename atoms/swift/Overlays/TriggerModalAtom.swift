import SwiftUI
import Cieo

public struct TriggerModalAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "triggermodal", category: "Overlays", name: "Modal from trigger",
        summary: "The modal grows from the trigger rect on base while the scrim fades. Closing snaps back into the trigger faster, and focus returns to it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @FocusState private var closeFocused: Bool
    public init() {}
    public var body: some View {
        AtomStage(hint: "Grows from the button, returns into it") {
            ZStack {
                VStack(spacing: 8) {
                    Toggle("Scrim fade", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                    Button("Read story") { withMotion(.base, reduceMotion: reduce) { open = true }; DispatchQueue.main.asyncAfter(deadline: .now()+0.05) { closeFocused = true } }
                        .buttonStyle(.borderedProminent)
                }
                if open {
                    Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { shut() }
                        .transition(.opacity.animation(reduce ? nil : .motion(.base)))
                    dialog.transition(reduce ? .identity : .asymmetric(
                        insertion: .opacity.combined(with: .scale(scale: 0.82)).animation(.motion(.base)),
                        removal: .opacity.combined(with: .scale(scale: 0.82)).animation(.motion(.snap))))
                }
            }
            .onKeyPress(.escape) { shut(); return .handled }
        }
    }
    private var dialog: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Morning routes").font(.headline)
            Text("A 4-minute read about rivers and slow starts.").font(.footnote).foregroundStyle(.secondary)
            HStack { Spacer(); Button("Close") { shut() }.buttonStyle(.bordered).focused($closeFocused) }
                .padding(.top, 8)
        }
        .padding(18).frame(width: 240).basicsPanel(radius: 15).accessibilityAddTraits(.isModal)
    }
    private func shut() { withMotion(.snap, reduceMotion: reduce) { open = false } }
}
