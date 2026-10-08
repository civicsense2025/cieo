import SwiftUI
import Cieo

public struct PresenceBarAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "presencebar", category: "Agent activity", name: "Presence bar",
        summary: "Each participant is a button: people are round, agents are rounded squares with a star and a square “Agent” tag, so nothing relies on color. Joining grows the slot first, then the avatar arrives; leaving fades first, then the slot closes. Activity chips swap text and morph width. Tap anyone to jump to the page they are on (the view slides toward their route and their cursor appears); it keeps following as they move. “My view” returns.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Who: Identifiable, Equatable { let id: Int; let name: String; let agent: Bool; var route: String; var activity: String }
    @State private var people = [Who(id: 1, name: "Maya", agent: false, route: "/pricing", activity: "Editing"),
                                 Who(id: 2, name: "Assistant", agent: true, route: "/signup", activity: "Reviewing")]
    @State private var next = 3
    @State private var following: Int?
    public init() {}

    private var route: String { people.first { $0.id == following }?.route ?? "/" }

    public var body: some View {
        AtomStage(hint: "Tap anyone to jump to the page they are on") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 6) {
                    Text("Release 14 review").font(.caption.weight(.semibold))
                    Spacer()
                    ForEach(people) { p in
                        Button { follow(p.id) } label: { avatar(p) }
                        .buttonStyle(.plain).accessibilityLabel("\(p.name)\(p.agent ? ", agent" : ""), on \(p.route)")
                        .transition(reduce ? .identity : .scale(scale: 0.6).combined(with: .opacity))
                    }
                }
                HStack(spacing: 6) {
                    ForEach(people) { p in AgChip(text: "\(p.name) · \(p.activity)", tone: p.agent ? .info : .neutral) }
                    Spacer()
                    if following != nil { Button("My view") { follow(nil) }.buttonStyle(AgPress()).font(.caption) }
                }
                ZStack {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(route == "/" ? "Home" : String(route.dropFirst()).capitalized).font(.title3.weight(.semibold))
                        RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(height: 10)
                        RoundedRectangle(cornerRadius: 3).fill(.quaternary).frame(width: 150, height: 10)
                        if following != nil { AgCursor(agent: people.first { $0.id == following }?.agent ?? false).offset(x: 120, y: 10).transition(.opacity) }
                    }
                    .padding(14).frame(maxWidth: .infinity, minHeight: 110, alignment: .topLeading)
                    .background(Color.primary.opacity(0.04), in: RoundedRectangle(cornerRadius: 10))
                    .id(route).transition(reduce ? .identity : .asymmetric(
                        insertion: .offset(x: 40).combined(with: .opacity).animation(.motion(.base).delay(Motion.exit)),
                        removal: .offset(x: -40).combined(with: .opacity).animation(.motionExit)))
                }.clipped()
                HStack {
                    Button("Someone joins") { join() }.buttonStyle(AgPress())
                    Button("Someone leaves") { leave() }.buttonStyle(AgPress()).disabled(people.count < 2)
                }
            }
            .frame(maxWidth: 380)
            .animation(reduce ? nil : .motion(.base), value: people)
            .animation(reduce ? nil : .motion(.base), value: following)
        }
    }

    private func avatar(_ p: Who) -> some View {
        let sel = following == p.id
        return ZStack(alignment: .bottomTrailing) {
            if p.agent {
                RoundedRectangle(cornerRadius: 7).fill(Color.primary.opacity(0.1)).frame(width: 28, height: 28)
                    .overlay(Image(systemName: "star.fill").font(.caption))
                    .overlay(RoundedRectangle(cornerRadius: 7).fill(Color.accentColor).opacity((sel ? 2 : 0) > 0 ? 0.10 : 0).allowsHitTesting(false))
                AgentTag().scaleEffect(0.8).offset(x: 6, y: 6)
            } else {
                Circle().fill(Color.accentColor.opacity(0.2)).frame(width: 28, height: 28)
                    .overlay(Text(String(p.name.prefix(1))).font(.caption.weight(.semibold)))
                    .overlay(Circle().strokeBorder(Color.accentColor, lineWidth: sel ? 2 : 0))
            }
        }
    }

    private func follow(_ id: Int?) { following = following == id ? nil : id }
    private func join() { withMotion(.base, reduceMotion: reduce) { people.append(Who(id: next, name: ["Theo", "Priya", "Ben"][next % 3], agent: false, route: "/docs", activity: "Reading")); next += 1 } }
    private func leave() {
        withMotion(.base, reduceMotion: reduce) { if let l = people.last { if following == l.id { following = nil }; people.removeLast() } }
    }
}
