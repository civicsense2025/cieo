import SwiftUI
import Cieo

public struct VoiceNoteAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "voicenote", category: "Writing", name: "Audio-note insert",
        summary: "The tile lifts under your pointer and follows it. Dropping it over the draft draws the waveform bar by bar on soft and opens the slot on a height spring. Play and Insert do the same without dragging.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var inserted = false
    @State private var playing = false
    @State private var drew = false
    @State private var drag = CGSize.zero
    @State private var lifted = false
    @State private var pulse = false
    private let bars: [CGFloat] = [8, 14, 20, 12, 22, 16, 10, 18, 24, 14, 10, 16, 20, 12]
    private let slotLift: CGFloat = -110
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag the note, or use Insert") {
            VStack(alignment: .leading, spacing: 0) {
                Text("Spring launch").font(.headline)
                Text("Doors at 6 pm, talk at 7. Press play on the note, or drop it into the draft.")
                    .font(.callout).foregroundStyle(.secondary)
                RoundedRectangle(cornerRadius: 12)
                    .stroke(style: StrokeStyle(lineWidth: 1.5, dash: [6, 4]))
                    .foregroundStyle(.quaternary)
                    .frame(height: inserted ? 64 : 0)
                    .opacity(inserted ? 1 : 0)
                    .animation(reduce ? nil : .motion(.base), value: inserted)
                    .padding(.top, inserted ? 10 : 0)
                    .animation(reduce ? nil : .motion(.base), value: inserted)
                Spacer(minLength: 8)
                tile
                    .offset(x: drag.width, y: (inserted ? slotLift : 0) + drag.height - (lifted ? 8 : 0))
                    .animation(reduce ? nil : .motion(.soft), value: inserted)
                    .animation(reduce ? nil : .motion(.snap), value: lifted)
                    .shadow(radius: lifted ? 10 : 0)
                    .gesture(DragGesture().onChanged { drag = $0.translation; lifted = true }
                        .onEnded { v in
                            lifted = false
                            if v.translation.height < -50 { insert() }
                            withMotion(.soft, reduceMotion: reduce) { drag = .zero }
                        })
                HStack {
                    Button(playing ? "Pause" : "Play") {
                        draw()
                        withMotion(.base, reduceMotion: reduce) { playing.toggle() }
                    }
                    .buttonStyle(.bordered)
                    Button(inserted ? "Remove" : "Insert") {
                        inserted ? remove() : insert()
                    }
                    .buttonStyle(.bordered)
                }
                .padding(.top, 10)
            }
            .frame(maxWidth: 340, minHeight: 300, alignment: .topLeading)
        }
        .onReceive(Timer.publish(every: 0.35, on: .main, in: .common).autoconnect()) { _ in
            guard playing, !reduce else { return }
            withAnimation(.motion(.snap)) { pulse.toggle() }
        }
    }

    private var tile: some View {
        HStack(spacing: 9) {
            HStack(spacing: 2.5) {
                ForEach(bars.indices, id: \.self) { i in
                    Capsule().fill(.primary)
                        .frame(width: 3, height: max(0, (drew ? bars[i] : 0) * (playing ? (pulse ? 1.15 : 0.85) : 1)))
                        .animation(reduce ? nil : .motion(.soft).delay(Double(i) * 0.03), value: drew)
                        .animation(reduce ? nil : .motion(.snap), value: pulse)
                }
            }
            .frame(height: 26)
            Text("0:12").font(.caption).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 12).frame(width: 190, height: 56, alignment: .leading)
        .background(.thickMaterial).clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(.quaternary))
        .accessibilityElement(children: .combine).accessibilityLabel("Voice note, 12 seconds")
    }

    private func draw() {
        guard !drew else { return }
        withMotion(.soft, reduceMotion: reduce) { drew = true }
    }

    private func insert() {
        draw()
        withMotion(.soft, reduceMotion: reduce) { inserted = true }
    }

    private func remove() {
        withMotion(.soft, reduceMotion: reduce) { inserted = false }
    }
}
