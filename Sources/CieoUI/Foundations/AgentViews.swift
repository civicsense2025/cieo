import Foundation

public struct AgentLimits: Equatable, Sendable {
    public let maxActivity: Int
    public let maxTextChars: Int
    public let maxEntities: Int
    public let contiguous: Bool

    public init(maxActivity: Int = 500, maxTextChars: Int = 20_000, maxEntities: Int = 500, contiguous: Bool = true) {
        self.maxActivity = max(1, maxActivity)
        self.maxTextChars = max(1, maxTextChars)
        self.maxEntities = max(1, maxEntities)
        self.contiguous = contiguous
    }
}

public struct AgentGap: Equatable, Sendable {
    public let after: Int
    public let received: Int
    public init(after: Int, received: Int) { self.after = after; self.received = received }
}

public struct RunView: Identifiable, Equatable, Sendable {
    public let id: String
    public let status: AgentRunStatus
    public let reason: String?
    public let startedAt: String
    public let updatedAt: String
    public init(id: String, status: AgentRunStatus, reason: String?, startedAt: String, updatedAt: String) {
        self.id = id; self.status = status; self.reason = reason; self.startedAt = startedAt; self.updatedAt = updatedAt
    }
}

public struct AgentView: Identifiable, Equatable, Sendable {
    public let id: String
    public let runId: String
    public let parentAgentId: String?
    public let name: String?
    public let status: AgentRunStatus
    public let reason: String?
    public let location: String?
    public let openMessageId: String?
    public let updatedAt: String

    public init(id: String, runId: String, parentAgentId: String?, name: String?, status: AgentRunStatus,
                reason: String?, location: String?, openMessageId: String?, updatedAt: String) {
        self.id = id; self.runId = runId; self.parentAgentId = parentAgentId; self.name = name
        self.status = status; self.reason = reason; self.location = location
        self.openMessageId = openMessageId; self.updatedAt = updatedAt
    }
}

public struct MessageView: Identifiable, Equatable, Sendable {
    public let id: String
    public let runId: String
    public let agentId: String
    public let text: String
    public let complete: Bool
    public let truncated: Bool
    public let startedAt: String
    public let updatedAt: String
}

public struct ToolCallView: Identifiable, Equatable, Sendable {
    public let id: String
    public let runId: String
    public let agentId: String
    public let name: String
    public let phase: AgentToolPhase
    public let summary: String?
    public let error: String?
    public let startedAt: String
    public let updatedAt: String
}

public struct ApprovalView: Identifiable, Equatable, Sendable {
    public let id: String
    public let runId: String
    public let agentId: String
    public let title: String?
    public let detail: String?
    public let status: ApprovalState
    public let requestedAt: String
    public let resolvedAt: String?
}

public struct DraftView: Identifiable, Equatable, Sendable {
    public let id: String
    public let runId: String
    public let agentId: String
    public let text: String
    public let anchor: AgentValue?
    public let status: AgentDraftStatus
    public let artifactId: String?
    public let updatedAt: String
}

public struct ArtifactView: Identifiable, Equatable, Sendable {
    public let id: String
    public let runId: String
    public let agentId: String
    public let kind: String
    public let title: String?
    public let savedAt: String
}

public struct ActivityEntry: Identifiable, Equatable, Sendable {
    public var id: Int { seq }
    public let seq: Int
    public let at: String
    public let runId: String
    public let agentId: String
    public let type: String
    public let ref: String?
    public let data: [String: AgentValue]?
}
