import SwiftUI
import Cieo

public struct AgentCastBAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentcastb", category: "Agent identity", name: "Agent cast: operate and people roles",
        summary: "Twelve role characters on one rig stand in a row, each idling in character: the scheduler checks its ticking watch, support nods while it listens, the designer draws a square in the air that lingers then fades, the developer types on keys that dip, the archivist lifts its box lid and lets it settle. Tap one and the others step back in a ripple from the one you chose while it hops forward and lands with a squash; then its name and job swap in, it switches to its action mood and plays its signature move. Props trail the body on lagging springs, so every hop, lean and landing carries through them. On a phone the row scrolls sideways with snap above the focused stage.")
    public init() {}
    private let roles: [AgRole] = [
        AgRole(id: 0, name: "Scheduler", job: "Checks the ticking watch", symbol: "clock", wash: .orange, mood: .thinking),
        AgRole(id: 1, name: "Support", job: "Listens and nods", symbol: "headphones", wash: .green, mood: .happy),
        AgRole(id: 2, name: "Designer", job: "Draws a square in the air", symbol: "square.dashed", wash: .pink, mood: .calm),
        AgRole(id: 3, name: "Developer", job: "Types on keys that dip", symbol: "keyboard", wash: .blue, mood: .thinking),
        AgRole(id: 4, name: "Archivist", job: "Lifts the box lid", symbol: "shippingbox", wash: .brown, mood: .calm),
        AgRole(id: 5, name: "Analyst", job: "Reads the chart", symbol: "chart.bar", wash: .teal, mood: .thinking),
        AgRole(id: 6, name: "Operator", job: "Flips the switch", symbol: "switch.2", wash: .gray, mood: .calm),
        AgRole(id: 7, name: "Recruiter", job: "Waves people in", symbol: "person.badge.plus", wash: .purple, mood: .happy),
        AgRole(id: 8, name: "Mediator", job: "Holds the scales", symbol: "scalemass", wash: .mint, mood: .calm),
        AgRole(id: 9, name: "Trainer", job: "Keeps the whistle", symbol: "figure.walk", wash: .red, mood: .happy),
        AgRole(id: 10, name: "Host", job: "Greets at the door", symbol: "door.left.hand.open", wash: .yellow, mood: .happy),
        AgRole(id: 11, name: "Courier", job: "Carries the parcel", symbol: "paperplane", wash: .indigo, mood: .surprised),
    ]
    public var body: some View { AtomStage(hint: "Tap an agent; it hops forward and plays its signature") { AgentLineup(roles: roles) } }
}
