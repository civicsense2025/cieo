import SwiftUI
import Cieo

public struct GridToLightboxAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-grid-lightbox", category: "Galleries", name: "Grid to lightbox, shared element",
        summary: "Press a tile and that same photo grows out of it: position, size, crop and corner radius all spring from the tile to the viewer, while the grid behind it dims. The caption and controls arrive only after the photo is most of the way there. Stepping to the next photo is a Swap, so the old one leaves in the direction of travel before the new one arrives. Closing runs the controls out first, then flies the photo back into whichever tile it ended on. Use when a grid of thumbnails needs a viewer that keeps the user oriented.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Namespace private var ns
    @State private var sel: Int?
    @State private var chrome = false
    @State private var thumbs = true
    @State private var capBelow = true
    public init() {}
    private let count = 6
    private let titles = ["Ridge at dawn", "Still water", "Window light", "Roofline", "Three pears", "Coast bend"]

    private func caption(_ s: Int) -> String { "\(titles[s]) · \(s + 1) of \(count)" }

    public var body: some View {
        AtomStage(hint: "Tap a photo: it grows out of its tile") {
            VStack(spacing: 8) {
                HStack {
                    Toggle("Thumbs", isOn: $thumbs)
                    Spacer()
                    Picker("Captions", selection: $capBelow) { Text("Below").tag(true); Text("Overlay").tag(false) }
                        .pickerStyle(.segmented).frame(width: 150)
                }
                .font(.caption).foregroundStyle(.secondary)
                ZStack {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 8), count: 3), spacing: 8) {
                        ForEach(0..<count, id: \.self) { i in
                            ZStack {
                                if sel != i {
                                    AtomPhoto(seed: i).clipShape(RoundedRectangle(cornerRadius: 8))
                                        .matchedGeometryEffect(id: i, in: ns)
                                }
                            }
                            .aspectRatio(1.2, contentMode: .fit)
                            .onTapGesture { open(i) }
                            .accessibilityLabel("Photo \(i + 1)").accessibilityAddTraits(.isButton)
                        }
                    }
                    .opacity(sel == nil ? 1 : 0.35).motion(.base, value: sel == nil)
                    if let s = sel {
                        ZStack {
                            Color.black.opacity(0.35).onTapGesture { close() }
                            VStack(spacing: 6) {
                                ZStack(alignment: .bottom) {
                                    AtomPhoto(seed: s).clipShape(RoundedRectangle(cornerRadius: 14))
                                        .matchedGeometryEffect(id: s, in: ns).id(s)
                                        .padding(10).frame(maxHeight: capBelow ? 180 : 220)
                                        .motionTransition(.swap(drift: 0))
                                    if !capBelow {
                                        Text(caption(s)).font(.caption).foregroundStyle(.white)
                                            .padding(.horizontal, 12).padding(.vertical, 6)
                                            .background(.black.opacity(0.55), in: Capsule())
                                            .padding(.bottom, 16)
                                            .opacity(chrome ? 1 : 0).motion(.snap, value: chrome)
                                    }
                                }
                                if capBelow {
                                    Text(caption(s)).font(.caption).foregroundStyle(.white)
                                        .opacity(chrome ? 1 : 0).motion(.snap, value: chrome)
                                }
                                if thumbs {
                                    HStack(spacing: 6) {
                                        ForEach(0..<count, id: \.self) { i in
                                            AtomPhoto(seed: i)
                                                .frame(width: 44, height: 30).clipShape(RoundedRectangle(cornerRadius: 5))
                                                .overlay(RoundedRectangle(cornerRadius: 5).fill(.white).opacity((i == s ? 2 : 0) > 0 ? 0.10 : 0).allowsHitTesting(false))
                                                .opacity(i == s ? 1 : 0.7)
                                                .onTapGesture { stepTo(i) }
                                                .accessibilityLabel("Show photo \(i + 1)").accessibilityAddTraits(.isButton)
                                        }
                                    }
                                    .opacity(chrome ? 1 : 0).motion(.snap, value: chrome)
                                }
                            }
                            // caption and controls arrive only once the photo is most of the way there
                            HStack {
                                Button { step(-1) } label: { Image(systemName: "chevron.left") }.accessibilityLabel("Previous")
                                Spacer()
                                Button { close() } label: { Image(systemName: "xmark") }.accessibilityLabel("Close")
                                Spacer()
                                Button { step(1) } label: { Image(systemName: "chevron.right") }.accessibilityLabel("Next")
                            }
                            .buttonStyle(.borderedProminent).controlSize(.small).padding(.horizontal, 16)
                            .opacity(chrome ? 1 : 0).motion(.snap, value: chrome)
                        }
                        .task(id: s) { chrome = false; try? await Task.sleep(nanoseconds: 220_000_000); chrome = true }
                    }
                }
                .frame(height: 260)
            }
        }
    }

    private func open(_ i: Int) { withMotion(.base, reduceMotion: reduce) { sel = i } }
    private func step(_ d: Int) { withMotion(.base, reduceMotion: reduce) { sel = ((sel ?? 0) + d + count) % count } }
    private func stepTo(_ i: Int) { withMotion(.base, reduceMotion: reduce) { sel = ((i % count) + count) % count } }
    private func close() {
        chrome = false     // the controls run out first, then the photo flies back to its tile
        withMotion(.base, reduceMotion: reduce) { sel = nil }
    }
}
