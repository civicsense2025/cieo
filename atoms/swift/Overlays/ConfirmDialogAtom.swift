import SwiftUI
import MotionKit

public struct ConfirmDialogAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "dialog", category: "Overlays", name: "Confirm dialog",
        summary: "The scrim fades while the dialog rises 8px from 96% scale. Confirming closes the dialog first, then the deleted row collapses, so the change happens where you are looking.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var asking = false
    @State private var rowShown = true
    @State private var rowOpen = true
    private let rows = ["Home", "About", "Journal"]
    public init() {}

    public var body: some View {
        AtomStage {
            ZStack {
                VStack(spacing: 14) {
                    VStack(spacing: 0) {
                        ForEach(rows, id: \.self) { name in
                            if name == "About" {
                                BasicsHeightReveal(open: rowOpen) { line(name).opacity(rowShown ? 1 : 0).blur(radius: rowShown ? 0 : 4) }
                            } else {
                                line(name)
                            }
                        }
                    }
                    .padding(8).frame(width: 300)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                    Button("Reset", action: reset).buttonStyle(.bordered)
                }
                if asking {
                    Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { ask(false) }
                        .transition(.opacity.animation(reduce ? nil : .motion(.base)))
                    dialog.transition(reduce ? .identity : dialogTransition)
                }
            }
            .onKeyPress(.escape) { ask(false); return .handled }
        }
    }

    private func line(_ name: String) -> some View {
        HStack {
            Text(name).font(.footnote.weight(.medium))
            Spacer()
            if name == "About" {
                Button("Delete") { ask(true) }.font(.footnote).foregroundStyle(.red).buttonStyle(.plain)
            } else {
                Text("Published").font(.footnote).foregroundStyle(.secondary)
            }
        }
        .padding(.horizontal, 10).padding(.vertical, 8)
    }

    private var dialog: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Delete “About”?").font(.headline)
            Text("The page and its 3 drafts will be removed. Links to it will show a not-found page.")
                .font(.footnote).foregroundStyle(.secondary)
            HStack {
                Spacer()
                Button("Cancel") { ask(false) }.buttonStyle(.bordered)
                Button("Delete page", role: .destructive, action: confirm).buttonStyle(.borderedProminent).tint(.red)
            }
            .padding(.top, 10)
        }
        .padding(18).frame(width: 270)
        .basicsPanel(radius: 14)
        .accessibilityAddTraits(.isModal)
    }

    private var dialogTransition: AnyTransition {
        .asymmetric(
            insertion: .opacity.combined(with: .scale(scale: 0.96)).combined(with: .offset(y: 8)).animation(.motion(.base)),
            removal: .opacity.combined(with: .scale(scale: 0.96)).combined(with: .offset(y: 8)).animation(.motion(.snap)))
    }

    private func ask(_ on: Bool) { withMotion(on ? .base : .snap, reduceMotion: reduce) { asking = on } }

    private func confirm() {
        ask(false)
        withAnimation(reduce ? nil : .motion(.snap).delay(0.12)) { rowShown = false }
        withAnimation(reduce ? nil : .motion(.base).delay(0.12 + Motion.exit)) { rowOpen = false }
    }

    private func reset() {
        withAnimation(reduce ? nil : .motion(.base)) { rowOpen = true }
        withAnimation(reduce ? nil : .motion(.base).delay(0.12)) { rowShown = true }
    }
}
