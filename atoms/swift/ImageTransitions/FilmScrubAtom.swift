import SwiftUI
import Cieo

public struct FilmScrubAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "filmscrub", category: "Image transitions", name: "Interruptible film scrub",
        summary: "A four-chapter film on one Web Animations clock (push, iris, ink flood) with a chapter rail you can drag. Pressing the rail pauses every animation and hands the playhead to a critically damped follower, so dragging feels smooth even when the pointer jitters, and a fast flick coasts a little further. Releasing resumes playback only if the film was playing. Only animations whose scene overlaps the playhead get currentTime written each frame, which keeps a long film cheap to scrub. Chapter clicks can glide or cut; arrow keys step a second, Home and End jump to the ends.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var startHead = 0.0
    @State private var startDate = Date()
    @State private var playing = true
    @State private var scrub: Double?
    public init() {}
    private let duration = 9.0

    private func head(_ date: Date) -> Double {
        if let scrub { return scrub }
        guard playing, !reduce else { return startHead }
        return min(1, startHead + date.timeIntervalSince(startDate) / duration)
    }

    public var body: some View {
        AtomStage(hint: "Drag the rail: the film pauses, then resumes if it was playing") {
            VStack(spacing: 12) {
                TimelineView(.animation(paused: !playing && scrub == nil)) { ctx in
                    // while scrubbing, the shown playhead follows the finger on a spring
                    PhFollow(target: head(ctx.date), preset: .snap) { h in
                        film(scrub == nil ? head(ctx.date) : h)
                    }
                }
                .aspectRatio(1.5, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .accessibilityHidden(true)
                rail
                Button(playing ? "Pause" : "Play") { toggle() }.buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    private func toggle() {
        startHead = head(Date()); startDate = Date(); playing.toggle()
    }

    private var rail: some View {
        GeometryReader { g in
            ZStack(alignment: .leading) {
                Capsule().fill(.quaternary)
                TimelineView(.animation(paused: !playing && scrub == nil)) { ctx in
                    Capsule().fill(Color.accentColor).frame(width: max(6, g.size.width * head(ctx.date)))
                }
            }
            .contentShape(Rectangle())
            .gesture(DragGesture(minimumDistance: 0)
                .onChanged { v in scrub = phClamp(Double(v.location.x / g.size.width)) }
                .onEnded { _ in
                    startHead = scrub ?? startHead; startDate = Date(); scrub = nil
                })
        }
        .frame(height: 10)
        .accessibilityElement()
        .accessibilityLabel("Film position")
        .accessibilityValue("\(Int(startHead * 100)) percent")
        .accessibilityAdjustableAction { d in startHead = phClamp(startHead + (d == .increment ? 0.1 : -0.1)); startDate = Date() }
    }

    /// Three chapters on one clock: push, iris, ink flood.
    private func film(_ h: Double) -> some View {
        GeometryReader { g in
            let k = h * 3
            let i = min(Int(k), 2)
            let f = phSmooth(k - Double(i))
            let s = g.size
            ZStack {
                switch i {
                case 0:
                    phPhoto(0, s).offset(x: -s.width * f)
                    phPhoto(1, s).offset(x: s.width * (1 - f))
                case 1:
                    phPhoto(1, s)
                    phPhoto(2, s).mask(phCircle(CGPoint(x: s.width / 2, y: s.height / 2), Double(hypot(s.width, s.height)) / 2 * f, s))
                default:
                    phPhoto(2, s)
                    phPhoto(3, s).mask(phSoftEdge(f, soft: 0.4, start: .leading, end: .trailing))
                }
            }
        }
    }
}
