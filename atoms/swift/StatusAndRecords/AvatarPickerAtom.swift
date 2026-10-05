import SwiftUI
import Cieo

public struct AvatarPickerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "avatarpicker", category: "Status and records", name: "Avatar picker",
        summary: "Choosing a preset cross-fades the picture: the new image fades in over the old one, which stays opaque underneath until the new one is whole, so the circle is never blank. The selection ring moves between presets with lagging edges. Upload draws a progress ring around the avatar while the picture dims, then the ring fades, the photo cross-fades in, and the status line swaps its message.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var base = -1      // layer that stays opaque underneath
    @State private var top = -1       // layer fading in
    @State private var topOpacity = 0.0
    @State private var progress: Double?
    @State private var status = "Pick a preset or upload"
    @State private var frames: [Int: CGRect] = [:]
    @State private var selected = 0
    public init() {}

    private let names = ["Olive", "Slate", "Amber", "Brick", "Sage"]
    private let tints: [Color] = [.green, .gray, .orange, .red, .mint]

    public var body: some View {
        AtomStage(hint: "Presets cross-fade; Upload draws a progress ring") {
            VStack(spacing: 12) {
                ZStack {
                    art(base).clipShape(Circle())
                    art(top).clipShape(Circle()).opacity(topOpacity)
                    if let p = progress {
                        Circle().trim(from: 0, to: p).stroke(Color.accentColor, style: StrokeStyle(lineWidth: 4, lineCap: .round)).rotationEffect(.degrees(-90)).padding(-4)
                    }
                }
                .frame(width: 88, height: 88).opacity(progress == nil ? 1 : 0.6)
                .accessibilityLabel("Avatar").accessibilityValue(base < 0 ? "Initials" : names[base])
                SwapText(status).font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button("Upload photo") { upload() }.buttonStyle(AgPress(tone: .info)).disabled(progress != nil)
                    Button("Clear") { choose(-1) }.buttonStyle(AgPress())
                }
                ZStack(alignment: .topLeading) {
                    if let f = frames[selected] {
                        EdgesIndicator(frame: f, shape: Circle(), style: Color.accentColor.opacity(0.25)).padding(-4).scaleEffect(1.0)
                    }
                    HStack(spacing: 10) {
                        ForEach(names.indices, id: \.self) { i in
                            Button { choose(i) } label: { art(i).clipShape(Circle()).frame(width: 36, height: 36) }
                                .buttonStyle(.plain).accessibilityLabel(names[i]).accessibilityAddTraits(selected == i ? .isSelected : [])
                                .reportFrame(i, in: "avp")
                        }
                    }
                }
                .coordinateSpace(name: "avp")
                .onPreferenceChange(FramePreferenceKey.self) { v in
                    frames = v.reduce(into: [:]) { if let k = $1.key as? Int { $0[k] = $1.value } }
                }
            }
        }
    }

    @ViewBuilder private func art(_ k: Int) -> some View {
        if k < 0 { ZStack { Color.accentColor.opacity(0.15); Text("MO").font(.title2.weight(.semibold)).foregroundStyle(Color.accentColor) } }
        else {
            ZStack(alignment: .bottom) {
                tints[k].opacity(0.2)
                Circle().fill(tints[k]).frame(width: 30, height: 30).offset(y: -34)
                Capsule().fill(tints[k]).frame(width: 64, height: 40).offset(y: 14)
            }
        }
    }

    private func choose(_ k: Int) {
        guard k != top || topOpacity < 1 else { return }
        top = k; topOpacity = 0
        withMotion(.base, reduceMotion: reduce) { topOpacity = 1; selected = max(k, 0); status = k < 0 ? "Using initials" : "Preset: \(names[k])" }
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 350_000_000)
            base = k
        }
    }
    private func upload() {
        withMotion(.soft, reduceMotion: reduce) { progress = 0.02; status = "Uploading…" }
        Task { @MainActor in
            for p in [0.3, 0.6, 1.0] {
                try? await Task.sleep(nanoseconds: 350_000_000)
                withMotion(.soft, reduceMotion: reduce) { progress = p }
            }
            try? await Task.sleep(nanoseconds: 250_000_000)
            withMotion(.base, reduceMotion: reduce) { progress = nil }
            choose(2)
            withMotion(.base, reduceMotion: reduce) { status = "Photo uploaded" }
        }
    }
}
