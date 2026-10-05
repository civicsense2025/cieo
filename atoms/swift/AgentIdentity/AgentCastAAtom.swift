import SwiftUI
import MotionKit

public struct AgentCastAAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "agentcasta", category: "Agent identity", name: "Agent cast: checkers and writers",
        summary: "Twelve role agents stand in a lineup, all the same species (one square body, one face, one arc antenna) and each with its own prop, habit and default mood. Each idles in character: the stopwatch ticks, the caret staff blinks, the speech bubble swaps scripts, the glasses creep down, and every few seconds one of them plays its signature action. Tap one and its neighbours lean away and turn to watch, staggered outward from it; the agent on stage hops back to its place first, then the chosen one jumps forward, growing as it flies, lands with a squash, and plays its signature. Its name, job and habit swap in as it takes off. Props trail the body on lagging springs, hanging parts swing a beat late and settle without swinging back, and every eye follows your pointer.")
    public init() {}
    private let roles: [AgRole] = [
        AgRole(id: 0, name: "Timekeeper", job: "Checks every deadline", symbol: "stopwatch", wash: .orange, mood: .thinking),
        AgRole(id: 1, name: "Proofreader", job: "Reads for typos", symbol: "text.cursor", wash: .green, mood: .calm),
        AgRole(id: 2, name: "Fact checker", job: "Verifies each claim", symbol: "magnifyingglass", wash: .blue, mood: .thinking),
        AgRole(id: 3, name: "Link checker", job: "Follows every link", symbol: "link", wash: .teal, mood: .calm),
        AgRole(id: 4, name: "Contrast checker", job: "Tests colour pairs", symbol: "circle.lefthalf.filled", wash: .purple, mood: .worried),
        AgRole(id: 5, name: "Accessibility", job: "Walks with a screen reader", symbol: "accessibility", wash: .indigo, mood: .calm),
        AgRole(id: 6, name: "Copywriter", job: "Drafts the words", symbol: "bubble.left", wash: .pink, mood: .happy),
        AgRole(id: 7, name: "Editor", job: "Cuts what is not needed", symbol: "scissors", wash: .red, mood: .thinking),
        AgRole(id: 8, name: "Translator", job: "Swaps scripts", symbol: "character.bubble", wash: .mint, mood: .happy),
        AgRole(id: 9, name: "Summariser", job: "Makes it short", symbol: "text.alignleft", wash: .yellow, mood: .calm),
        AgRole(id: 10, name: "Glasses", job: "Reads the fine print", symbol: "eyeglasses", wash: .brown, mood: .sleepy),
        AgRole(id: 11, name: "Archivist", job: "Files the finished", symbol: "archivebox", wash: .gray, mood: .calm),
    ]
    public var body: some View { AtomStage(hint: "Tap an agent; the neighbours lean away") { AgentLineup(roles: roles) } }
}
