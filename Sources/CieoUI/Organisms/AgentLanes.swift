import SwiftUI

/// Renders top-level and nested child agent lanes with cycle protection and semantic status headers.
public struct AgentLanes<LaneContent: View>: View {
    private let maxDepth = 16 // cannot be static in generic type

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings

    private let agents: [AgentView]
    private let laneContent: (AgentView) -> LaneContent

    public init(agents: [AgentView], @ViewBuilder laneContent: @escaping (AgentView) -> LaneContent) {
        self.agents = agents
        self.laneContent = laneContent
    }

    public var body: some View {
        let hierarchy = Self.buildHierarchy(agents)
        VStack(alignment: .leading, spacing: metrics.medium) {
            ForEach(hierarchy.roots) { root in
                laneNode(agent: root, childrenMap: hierarchy.children, seen: [root.id], depth: 0)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(verbatim: strings.agentLanesLabel))
    }

    private func laneNode(
        agent: AgentView,
        childrenMap: [String: [AgentView]],
        seen: Set<String>,
        depth: Int
    ) -> AnyView {
        let kids = depth < maxDepth
            ? (childrenMap[agent.id] ?? []).filter { !seen.contains($0.id) }
            : []
        return AnyView(
            VStack(alignment: .leading, spacing: metrics.compact) {
                HStack(alignment: .center, spacing: metrics.compact) {
                    AgentIcon(iconRole(for: agent.status), size: metrics.avatarSmall)
                    Text(verbatim: agent.name ?? agent.id)
                        .font(typography.strongBody)
                        .foregroundStyle(theme.foreground)
                    Spacer(minLength: metrics.compact)
                    AgentStatus(status: agent.status)
                }
                if let location = agent.location {
                    Text(verbatim: location)
                        .font(typography.reference)
                        .foregroundStyle(theme.secondary)
                }
                laneContent(agent)
                if !kids.isEmpty {
                    VStack(alignment: .leading, spacing: metrics.compact) {
                        ForEach(kids) { child in
                            laneNode(
                                agent: child,
                                childrenMap: childrenMap,
                                seen: seen.union([child.id]),
                                depth: depth + 1
                            )
                        }
                    }
                    .padding(.leading, metrics.standard)
                    .overlay(alignment: .leading) {
                        Rectangle()
                            .fill(theme.track)
                            .frame(width: metrics.rail)
                            .accessibilityHidden(true)
                    }
                }
            }
            .padding(metrics.medium)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(depth == 0 ? theme.surface : theme.surfaceLow, in: .rect(cornerRadius: metrics.corner))
            .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        )
    }

    private func iconRole(for status: AgentRunStatus) -> AgentIconRole {
        switch status {
        case .starting, .running: .thinking
        case .waiting: .waiting
        case .completed: .done
        case .stopped: .paused
        case .failed, .interrupted: .failed
        case .disconnected: .offline
        }
    }

    static func buildHierarchy(_ agents: [AgentView]) -> (roots: [AgentView], children: [String: [AgentView]]) {
        let knownIDs = Set(agents.map(\.id))
        var parentLookup: [String: String] = [:]
        for agent in agents {
            if let parent = agent.parentAgentId, parent != agent.id, knownIDs.contains(parent) {
                parentLookup[agent.id] = parent
            }
        }
        // Break cycles: if walking ancestors revisits an ID, promote that node to a root.
        func createsCycle(_ start: String) -> Bool {
            var visited: Set<String> = [start]
            var cursor = parentLookup[start]
            while let current = cursor {
                if visited.contains(current) { return true }
                visited.insert(current)
                cursor = parentLookup[current]
            }
            return false
        }

        var roots: [AgentView] = []
        var children: [String: [AgentView]] = [:]
        for agent in agents {
            if let parent = parentLookup[agent.id], !createsCycle(agent.id) {
                children[parent, default: []].append(agent)
            } else {
                roots.append(agent)
            }
        }
        return (roots, children)
    }
}
