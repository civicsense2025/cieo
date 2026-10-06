import SwiftUI
import Cieo

public struct ConfirmHoldAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "confirmhold", category: "Overlays", name: "Hold to confirm",
        summary: "The danger confirm slides in on base after the dialog. Hold-to-confirm runs a digits countdown, then the row collapses only after exit.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var asking = false
    @State private var gone = false
    @State private var progress: Double = 0
    @State private var task: Task<Void, Never>?
    public init() {}
    public var body: some View {
        AtomStage(hint: "Danger slides in · hold 3s · row collapses") {
            ZStack {
                VStack(spacing: 10) {
                    Toggle("3s countdown", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                    if !gone {
                        HStack { Text("About page").font(.footnote.weight(.medium)); Spacer()
                            Button("Delete") { withMotion(.base, reduceMotion: reduce) { asking = true } }
                                .font(.footnote).foregroundStyle(.red).buttonStyle(.plain) }
                            .padding(.horizontal, 10).padding(.vertical, 8)
                            .frame(width: 270).background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.06)))
                            .transition(reduce ? .identity : .opacity.combined(with: .scale(scale: 0.96)).animation(.motion(.base)))
                    }
                }
                if asking {
                    Color.black.opacity(0.35).ignoresSafeArea().onTapGesture { cancel() }
                        .transition(.opacity.animation(reduce ? nil : .motion(.base)))
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Delete “About”?").font(.headline)
                        Text("Hold the button 3s to confirm.").font(.footnote).foregroundStyle(.secondary)
                        ZStack(alignment: .leading) {
                            Button {} label: {
                                Text("Hold to delete · \(max(0, 3 - Int(progress * 3)))")
                                    .font(.callout.weight(.semibold)).foregroundStyle(.white)
                                    .frame(maxWidth: .infinity, minHeight: 40)
                                    .background(RoundedRectangle(cornerRadius: 10).fill(.red))
                            }
                            .buttonStyle(.plain)
                            .simultaneousGesture(DragGesture(minimumDistance: 0).onChanged { _ in hold() }.onEnded { _ in drop() })
                            GeometryReader { g in Color.white.opacity(0.25).frame(width: g.size.width * progress, height: 40).clipShape(RoundedRectangle(cornerRadius: 10)).allowsHitTesting(false) }
                        }
                        HStack { Spacer(); Button("Cancel", action: cancel).buttonStyle(.bordered) }.padding(.top, 4)
                    }
                    .padding(18).frame(width: 250).basicsPanel(radius: 15)
                    .offset(x: 0)
                    .transition(reduce ? .identity : .asymmetric(
                        insertion: .opacity.combined(with: .offset(x: 24)).animation(.motion(.base)),
                        removal: .opacity.combined(with: .offset(x: 24)).animation(.motion(.snap))))
                    .accessibilityAddTraits(.isModal)
                }
            }
            .onKeyPress(.escape) { cancel(); return .handled }
        }
    }
    private func hold() {
        task?.cancel(); task = Task {
            for i in 1...15 { try? await Task.sleep(for: .seconds(0.2)); guard !Task.isCancelled else { return }
                await MainActor.run { progress = Double(i) / 15 } }
            await MainActor.run { finish() }
        }
    }
    private func drop() { task?.cancel(); progress = 0 }
    private func cancel() { task?.cancel(); progress = 0; withMotion(.snap, reduceMotion: reduce) { asking = false } }
    private func finish() {
        task?.cancel(); progress = 0
        withMotion(.snap, reduceMotion: reduce) { asking = false }
        withMotion(.base, reduceMotion: reduce) { gone = true }
    }
}
