import SwiftUI
import MotionKit

public struct AnnotateAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "annotate", category: "Workflow", name: "Annotation review canvas",
        summary: "Click the design: a dot marks the spot, the pin falls onto it, and only then does a comment card grow out of the pin. Pins follow the pointer 1:1 when dragged and settle from release velocity, and the card travels with the pin it belongs to. Resolving collapses the card into its pin as the pin turns to a success check. The side list shares selection: its highlight plate moves between rows with the leading edge first.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Pin: Identifiable { let id: Int; var point: CGPoint; var resolved = false; var dropped = false }
    @State private var pins: [Pin] = []
    @State private var selected: Int?
    @State private var next = 1
    @State private var drag: (id: Int, offset: CGSize)?
    public init() {}

    public var body: some View {
        AtomStage(hint: "Click the design to drop a pin. Drag pins; Resolve folds the card.") {
            HStack(alignment: .top, spacing: 12) {
                GeometryReader { geo in
                    ZStack(alignment: .topLeading) {
                        RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.05))
                            .overlay(VStack(spacing: 8) {
                                RoundedRectangle(cornerRadius: 6).fill(.quaternary).frame(height: 40)
                                HStack { RoundedRectangle(cornerRadius: 6).fill(.quaternary); RoundedRectangle(cornerRadius: 6).fill(.quaternary) }
                            }.padding(14).accessibilityHidden(true))
                            .contentShape(Rectangle())
                            .onTapGesture { location in add(at: location) }
                            .accessibilityLabel("Design canvas. Activate to add a pin.")
                            .accessibilityAddTraits(.isButton)
                        ForEach(pins) { p in pinView(p, size: geo.size) }
                    }
                }
                .frame(minWidth: 180, minHeight: 170)
                VStack(alignment: .leading, spacing: 4) {
                    Text("Comments").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                    if pins.isEmpty { Text("No comments yet. Click the design to drop a pin.").font(.caption).foregroundStyle(.secondary) }
                    ForEach(pins) { p in
                        Button { withMotion(.base, reduceMotion: reduce) { selected = p.id } } label: {
                            HStack { Text("Pin \(p.id)"); Spacer(); if p.resolved { Image(systemName: "checkmark").foregroundStyle(.green) } }.font(.caption)
                        }
                        .buttonStyle(AgPress(tone: selected == p.id ? .info : nil))
                    }
                }.frame(width: 120)
            }
        }
    }

    private func pos(_ p: Pin) -> CGPoint {
        guard let d = drag, d.id == p.id else { return p.point }
        return CGPoint(x: p.point.x + d.offset.width, y: p.point.y + d.offset.height)
    }

    private func pinView(_ p: Pin, size: CGSize) -> some View {
        let open = selected == p.id && !p.resolved
        return ZStack(alignment: .topLeading) {
            Image(systemName: p.resolved ? "checkmark.circle.fill" : "mappin.circle.fill")
                .font(.title2).foregroundStyle(p.resolved ? Color.green : Color.accentColor)
                .offset(y: p.dropped ? 0 : -24).opacity(p.dropped ? 1 : 0)
                .gesture(DragGesture().onChanged { drag = (p.id, $0.translation) }
                    .onEnded { v in
                        drag = nil
                        if let i = pins.firstIndex(where: { $0.id == p.id }) {
                            withMotion(.snap, reduceMotion: reduce) { pins[i].point = CGPoint(x: p.point.x + v.translation.width, y: p.point.y + v.translation.height) }
                        }
                    })
                .onTapGesture { withMotion(.base, reduceMotion: reduce) { selected = p.id } }
                .accessibilityLabel("Pin \(p.id)\(p.resolved ? ", resolved" : "")")
            if open {
                AgCard {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Pin \(p.id)").font(.caption.weight(.semibold))
                        Text("Heading spacing is tight here.").font(.caption)
                        Button("Resolve") { resolve(p.id) }.buttonStyle(AgPress(tone: .success))
                    }.frame(width: 130)
                }
                .offset(x: 14, y: 22).transition(reduce ? .identity : .scale(scale: 0.3, anchor: .topLeading).combined(with: .opacity))
            }
        }
        .position(x: pos(p).x + (open ? 65 : 0), y: pos(p).y + (open ? 40 : 0)).frame(width: 0, height: 0)
        .offset(x: open ? -65 : 0, y: open ? -40 : 0)
    }

    private func add(at point: CGPoint) {
        let p = Pin(id: next, point: point)
        next += 1
        pins.append(p)
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 50_000_000)
            withMotion(.snap, reduceMotion: reduce) { if let i = pins.firstIndex(where: { $0.id == p.id }) { pins[i].dropped = true } }
            try? await Task.sleep(nanoseconds: 150_000_000)
            withMotion(.base, reduceMotion: reduce) { selected = p.id }
        }
    }
    private func resolve(_ id: Int) {
        withMotion(.base, reduceMotion: reduce) { if let i = pins.firstIndex(where: { $0.id == id }) { pins[i].resolved = true }; selected = nil }
    }
}
