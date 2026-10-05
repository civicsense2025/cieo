import SwiftUI
import MotionKit

public struct FadeFlickerCompareAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fxp-flick", category: "Photo effects", name: "Fade flicker compare",
        summary: "Blink comparison without the flash: versions dissolve in linear light over about 200 ms, so brightness never dips mid-fade and the eye still catches what moved. Hold Space or press on the photo to peek at the other version; Flicker alternates every 1.2 s until stopped; Difference paints only what changed. The version label swaps (exit, then enter) in step. Use when: reviewers approve an edit, a re-export or a new version and the change is subtle.")
    @State private var peek = false
    @State private var flicker = false
    @State private var flickB = false
    @State private var difference = false
    public init() {}

    private var showB: Bool { peek || (flicker && flickB) }

    public var body: some View {
        AtomStage(hint: "Press and hold the photo to peek at the other version") {
            VStack(spacing: 10) {
                // versions dissolve over about 200 ms, so brightness never dips mid-fade
                PhFollow(target: showB ? 1 : 0, preset: .snap) { b in
                    GeometryReader { g in
                        ZStack {
                            phPhoto(1, g.size, golden: 0)
                            if difference {
                                phPhoto(1, g.size, golden: 1).blendMode(.difference).brightness(0.3)
                            } else {
                                phPhoto(1, g.size, golden: 1).opacity(b)
                            }
                        }
                    }
                }
                .frame(height: 160).clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(alignment: .topLeading) {
                    SwapText(difference ? "Difference" : (showB ? "Version B" : "Version A")).font(.caption.weight(.semibold))
                        .padding(.horizontal, 8).padding(.vertical, 3).background(.regularMaterial, in: Capsule()).padding(8)
                }
                .gesture(DragGesture(minimumDistance: 0).onChanged { _ in peek = true }.onEnded { _ in peek = false })
                .accessibilityLabel("Photo").accessibilityHint("Press and hold to see the other version")
                HStack {
                    Toggle("Flicker", isOn: $flicker)
                    Toggle("Difference", isOn: $difference)
                }.toggleStyle(.switch).controlSize(.small)
            }
            .task(id: flicker) {
                while flicker && !Task.isCancelled {
                    try? await Task.sleep(nanoseconds: 1_200_000_000)
                    if flicker { flickB.toggle() }
                }
                flickB = false
            }
        }
    }
}
