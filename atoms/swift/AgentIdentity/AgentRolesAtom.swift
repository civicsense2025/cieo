import SwiftUI
import MotionKit

public struct AgentRolesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentroles", category: "Agent identity", name: "Agent role icons",
        summary: "Twenty-four agent roles drawn as one family: the square tile that means agent, a single glyph inside it and the tilted equator from the agent mark underneath. Brand form is the 64 grid with a paper tile, one pale wash and a 1.7 ink line. Product form is a square outline in currentColor with the stroke weight tuned for 16, 20, 24 and 32px; at 16px the glyph is redrawn with fewer strokes and the equator is dropped. Hover or focus a role and one part of its drawing moves for under a second: a trace, a slide, a short turn. Play all runs them in a wave across the grid.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var brand = true
    @State private var size: CGFloat = 40
    @State private var phase: [Int: Double] = [:]
    public init() {}

    private let roles = ["Reviewer:magnifyingglass", "Fixer:wrench.and.screwdriver", "Writer:pencil", "Editor:scissors", "Designer:paintbrush", "Developer:chevron.left.forwardslash.chevron.right",
                         "Tester:checklist", "Analyst:chart.bar", "Researcher:book", "Translator:character.bubble", "Planner:calendar", "Scheduler:clock",
                         "Support:headphones", "Archivist:archivebox", "Navigator:location", "Inspector:viewfinder", "Scribe:note.text", "Courier:paperplane",
                         "Auditor:checkmark.seal", "Guard:lock", "Builder:hammer", "Mapper:map", "Mediator:scalemass", "Host:door.left.hand.open"]

    public var body: some View {
        AtomStage(hint: "Hover a role; one part of its drawing moves") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Picker("Form", selection: $brand) { Text("Brand").tag(true); Text("Product").tag(false) }.pickerStyle(.segmented).frame(maxWidth: 170)
                    Picker("Size", selection: $size) { ForEach([16, 24, 32, 40], id: \.self) { Text("\($0)").tag(CGFloat($0)) } }.pickerStyle(.segmented).frame(maxWidth: 190)
                    Button("Play all") { playAll() }.buttonStyle(AgPress())
                }
                LazyVGrid(columns: Array(repeating: GridItem(.fixed(48), spacing: 6), count: 8), spacing: 6) {
                    ForEach(roles.indices, id: \.self) { i in role(i) }
                }
            }
            .animation(reduce ? nil : .motion(.base), value: size)
        }
    }

    private func role(_ i: Int) -> some View {
        let parts = roles[i].split(separator: ":"), name = String(parts[0]), sym = String(parts[1])
        let p = phase[i] ?? 0
        return VStack(spacing: 1) {
            RoundedRectangle(cornerRadius: size * 0.22).fill(brand ? Color(white: 1).opacity(0.9) : Color.clear)
                .overlay(brand ? RoundedRectangle(cornerRadius: size * 0.22).fill(Color.green.opacity(0.2)) : nil)
                .overlay(RoundedRectangle(cornerRadius: size * 0.22).strokeBorder(Color.primary, lineWidth: brand ? 1.7 : max(1, size / 16)))
                .overlay(Image(systemName: sym).font(.system(size: size * 0.44)).rotationEffect(.degrees(p * 18)).offset(x: p * 2))
                .frame(width: size, height: size)
            if size > 16 { Ellipse().stroke(Color.primary, lineWidth: 1).frame(width: size * 0.7, height: size * 0.18).rotationEffect(.degrees(-18 + p * 40)) }
        }
        .frame(width: 48, height: 52)
        .onHover { if $0 { play(i) } }
        .onTapGesture { play(i) }
        .accessibilityLabel("\(name) agent").accessibilityAddTraits(.isButton)
    }

    private func play(_ i: Int) {
        guard (phase[i] ?? 0) == 0 else { return }
        Task { @MainActor in
            withMotion(.base, reduceMotion: reduce) { phase[i] = 1 }
            try? await Task.sleep(nanoseconds: 450_000_000)
            withMotion(.base, reduceMotion: reduce) { phase[i] = 0 }
        }
    }
    private func playAll() { for i in roles.indices { Task { @MainActor in try? await Task.sleep(nanoseconds: UInt64(Double(i % 8 + i / 8) * 45_000_000)); play(i) } } }
}
