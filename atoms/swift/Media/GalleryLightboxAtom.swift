import SwiftUI
import MotionKit

public struct GalleryLightboxAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "lightbox", category: "Media", name: "Gallery lightbox",
        summary: "The thumbnail itself grows to fill the frame: position, size and radius each spring from its measured rect. Closing reverses into the same slot.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Namespace private var ns
    private let captions = ["Harbor, 6am", "Moss study", "Concrete stair", "Fog bank", "Window light", "Linen"]
    @State private var open: Int?
    public init() {}

    private func toggle(_ i: Int?) { withMotion(.base, reduceMotion: reduce) { open = i } }

    public var body: some View {
        AtomStage(hint: "Tap a photo, tap again to close") {
            GeometryReader { g in
                let s = min(g.size.width - 40, g.size.height - 60)
                ZStack {
                    LazyVGrid(columns: Array(repeating: GridItem(.fixed(76), spacing: 8), count: 3), spacing: 8) {
                        ForEach(captions.indices, id: \.self) { i in
                            ZStack {
                                if open != i {
                                    Button { toggle(i) } label: {
                                        AtomPhoto(seed: i + 1, goldenHour: Double(i % 2))
                                            .clipShape(RoundedRectangle(cornerRadius: 10))
                                            .matchedGeometryEffect(id: i, in: ns)
                                    }
                                    .buttonStyle(.plain).accessibilityLabel("Open \(captions[i])")
                                }
                            }
                            .frame(width: 76, height: 76)
                        }
                    }
                    .frame(width: 244)
                    if let i = open {
                        Color(.clear).background(.background.opacity(0.92)).ignoresSafeArea()
                            .onTapGesture { toggle(nil) }.transition(.opacity)
                        AtomPhoto(seed: i + 1, goldenHour: Double(i % 2))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                            .matchedGeometryEffect(id: i, in: ns)
                            .frame(width: s, height: s - 16)
                            .position(x: g.size.width / 2, y: 16 + (s - 16) / 2)
                            .onTapGesture { toggle(nil) }
                            .accessibilityLabel("\(captions[i]), close")
                            .accessibilityAddTraits(.isButton)
                        Text(captions[i]).font(.caption).frame(maxHeight: .infinity, alignment: .bottom).padding(.bottom, 12)
                            .transition(.opacity)
                    }
                }
                .frame(width: g.size.width, height: g.size.height)
            }
        }
    }
}
