import SwiftUI
import Cieo

public struct SheetDetentsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "sheetlevels", category: "Overlays", name: "Sheet detents",
        summary: "Sheet rests at peek, half or full detents on base. A fast flick skips the middle detent. The grabber stays visible and the page behind stays inert.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var detent: PresentationDetent = .height(60)
    @State private var open = false
    public init() {}
    public var body: some View {
        AtomStage(hint: "Drag or flick: peek → half → full") {
            VStack(spacing: 8) {
                Toggle("Background inert", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                Button("Share options") { open = true }.buttonStyle(.borderedProminent)
                Text("Pages · Home · About · Journal").font(.caption).foregroundStyle(.secondary)
            }
            .sheet(isPresented: $open) {
                sheetBody.presentationDetents([.height(60), .medium, .large], selection: $detent)
                    .presentationDragIndicator(.visible)
                    .presentationBackgroundInteraction(.disabled)
                    .interactiveDismissDisabled(false)
            }
        }
    }
    private var sheetBody: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Share").font(.headline)
            Text("Copy link · Email · Messages").font(.footnote).foregroundStyle(.secondary)
            HStack { Spacer(); Button("Done") { open = false }.buttonStyle(.bordered).controlSize(.regular) }
                .padding(.top, 6)
        }
        .padding(18)
    }
}
