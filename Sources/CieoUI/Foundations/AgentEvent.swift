import Foundation

/// Reported execution state for an agent or a run. The last five states are settled.
public enum AgentRunStatus: String, CaseIterable, Codable, Equatable, Sendable {
    case starting
    case running
    case waiting
    case completed
    case stopped
    case failed
    case interrupted
    case disconnected

    public var isSettled: Bool {
        switch self {
        case .starting, .running, .waiting: false
        case .completed, .stopped, .failed, .interrupted, .disconnected: true
        }
    }
}

public enum AgentToolPhase: String, CaseIterable, Codable, Equatable, Sendable {
    case started, finished, failed
    public var isSettled: Bool { self != .started }
}

/// Authoritative approval state. Decisions stay `.pending` until the host emits `approval.resolved`.
public enum ApprovalState: String, CaseIterable, Codable, Equatable, Sendable {
    case pending, approved, denied, expired
    public var isSettled: Bool { self != .pending }
}

public enum AgentDraftStatus: String, CaseIterable, Codable, Equatable, Sendable {
    case open, canceled, complete
    public var isSettled: Bool { self != .open }
}

/// JSON-compatible value carried inside `AgentEvent.data` payloads and extension events.
public enum AgentValue: Codable, Equatable, Sendable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case object([String: AgentValue])
    case array([AgentValue])
    case null

    public var stringValue: String? {
        if case .string(let s) = self { return s }
        return nil
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() { self = .null }
        else if let b = try? container.decode(Bool.self) { self = .bool(b) }
        else if let n = try? container.decode(Double.self) { self = .number(n) }
        else if let s = try? container.decode(String.self) { self = .string(s) }
        else if let a = try? container.decode([AgentValue].self) { self = .array(a) }
        else if let o = try? container.decode([String: AgentValue].self) { self = .object(o) }
        else { throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unsupported AgentValue") }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let s): try container.encode(s)
        case .number(let n): try container.encode(n)
        case .bool(let b): try container.encode(b)
        case .object(let o): try container.encode(o)
        case .array(let a): try container.encode(a)
        case .null: try container.encodeNil()
        }
    }
}

extension AgentValue: ExpressibleByStringLiteral {
    public init(stringLiteral value: String) { self = .string(value) }
}
extension AgentValue: ExpressibleByIntegerLiteral {
    public init(integerLiteral value: Int) { self = .number(Double(value)) }
}
extension AgentValue: ExpressibleByFloatLiteral {
    public init(floatLiteral value: Double) { self = .number(value) }
}
extension AgentValue: ExpressibleByBooleanLiteral {
    public init(booleanLiteral value: Bool) { self = .bool(value) }
}

/// Wire envelope shared by all `cieo/agent` events (`v == 1`).
public struct AgentEvent: Codable, Equatable, Sendable {
    public static let coreTypes: Set<String> = [
        "run.status", "agent.status", "message.delta", "message.complete",
        "tool.call", "approval.requested", "approval.resolved",
        "draft.begin", "draft.update", "draft.cancel", "draft.complete",
        "artifact.saved", "navigation"
    ]

    public let v: Int
    public let seq: Int
    public let at: String
    public let runId: String
    public let agentId: String
    public let parentAgentId: String?
    public let type: String
    public let data: [String: AgentValue]

    public init(
        v: Int = 1,
        seq: Int,
        at: String,
        runId: String,
        agentId: String,
        parentAgentId: String? = nil,
        type: String,
        data: [String: AgentValue] = [:]
    ) {
        self.v = v
        self.seq = seq
        self.at = at
        self.runId = runId
        self.agentId = agentId
        self.parentAgentId = parentAgentId
        self.type = type
        self.data = data
    }

    public var isCoreType: Bool { Self.coreTypes.contains(type) }

    public var isExtensionType: Bool {
        type.hasPrefix("x.") && type.split(separator: ".", omittingEmptySubsequences: false).count >= 3
    }

    public var isValidEnvelope: Bool {
        guard v == 1, seq >= 1, !at.isEmpty, at.count <= 64 else { return false }
        guard Self.isValidID(runId), Self.isValidID(agentId) else { return false }
        if let parentAgentId, !Self.isValidID(parentAgentId) { return false }
        return Self.isValidType(type)
    }

    public static func parse(_ jsonData: Data) -> AgentEvent? {
        guard let decoded = try? JSONDecoder().decode(AgentEvent.self, from: jsonData),
              decoded.isValidEnvelope else { return nil }
        return decoded
    }

    static func isValidID(_ value: String) -> Bool {
        guard !value.isEmpty, value.count <= 256 else { return false }
        return !value.unicodeScalars.contains { scalar in
            scalar.properties.isWhitespace || scalar.value <= 0x1F || scalar.value == 0x7F
        }
    }

    static func isValidType(_ value: String) -> Bool {
        guard !value.isEmpty, value.count <= 96, let first = value.unicodeScalars.first,
              ("a"..."z").contains(first) else { return false }
        let segments = value.split(separator: ".", omittingEmptySubsequences: false)
        guard !segments.contains(where: \.isEmpty) else { return false }
        for (idx, segment) in segments.enumerated() {
            for scalar in segment.unicodeScalars {
                let ok = ("a"..."z").contains(scalar) || ("0"..."9").contains(scalar) || scalar == "-" || (idx > 0 && scalar == "_")
                if !ok { return false }
            }
        }
        return true
    }

    // MARK: - Typed factories

    public static func runStatus(seq: Int, at: String, runId: String, agentId: String, status: AgentRunStatus, reason: String? = nil) -> AgentEvent {
        var payload: [String: AgentValue] = ["status": .string(status.rawValue)]
        if let reason { payload["reason"] = .string(reason) }
        return AgentEvent(seq: seq, at: at, runId: runId, agentId: agentId, type: "run.status", data: payload)
    }

    public static func agentStatus(seq: Int, at: String, runId: String, agentId: String, parentAgentId: String? = nil, status: AgentRunStatus, name: String? = nil, reason: String? = nil, runStatus: AgentRunStatus? = nil) -> AgentEvent {
        var payload: [String: AgentValue] = ["status": .string(status.rawValue)]
        if let name { payload["name"] = .string(name) }
        if let reason { payload["reason"] = .string(reason) }
        if let runStatus { payload["runStatus"] = .string(runStatus.rawValue) }
        return AgentEvent(seq: seq, at: at, runId: runId, agentId: agentId, parentAgentId: parentAgentId, type: "agent.status", data: payload)
    }

    public static func messageDelta(seq: Int, at: String, runId: String, agentId: String, text: String, messageId: String? = nil, replace: Bool = false) -> AgentEvent {
        var payload: [String: AgentValue] = ["text": .string(text)]
        if let messageId { payload["messageId"] = .string(messageId) }
        if replace { payload["mode"] = "replace" }
        return AgentEvent(seq: seq, at: at, runId: runId, agentId: agentId, type: "message.delta", data: payload)
    }

    public static func messageComplete(seq: Int, at: String, runId: String, agentId: String, text: String, messageId: String? = nil) -> AgentEvent {
        var payload: [String: AgentValue] = ["text": .string(text)]
        if let messageId { payload["messageId"] = .string(messageId) }
        return AgentEvent(seq: seq, at: at, runId: runId, agentId: agentId, type: "message.complete", data: payload)
    }

    public static func toolCall(seq: Int, at: String, runId: String, agentId: String, callId: String, name: String, phase: AgentToolPhase, summary: String? = nil, error: String? = nil) -> AgentEvent {
        var payload: [String: AgentValue] = ["callId": .string(callId), "name": .string(name), "phase": .string(phase.rawValue)]
        if let summary { payload["summary"] = .string(summary) }
        if let error { payload["error"] = .string(error) }
        return AgentEvent(seq: seq, at: at, runId: runId, agentId: agentId, type: "tool.call", data: payload)
    }

    public static func approvalRequested(seq: Int, at: String, runId: String, agentId: String, approvalId: String, title: String? = nil, detail: String? = nil) -> AgentEvent {
        var payload: [String: AgentValue] = ["approvalId": .string(approvalId)]
        if let title { payload["title"] = .string(title) }
        if let detail { payload["detail"] = .string(detail) }
        return AgentEvent(seq: seq, at: at, runId: runId, agentId: agentId, type: "approval.requested", data: payload)
    }

    public static func approvalResolved(seq: Int, at: String, runId: String, agentId: String, approvalId: String, decision: ApprovalState) -> AgentEvent {
        AgentEvent(seq: seq, at: at, runId: runId, agentId: agentId, type: "approval.resolved", data: [
            "approvalId": .string(approvalId),
            "decision": .string(decision.rawValue)
        ])
    }
}

/// Deterministic insertion-ordered dictionary supporting oldest-settled-first bounded eviction.
public struct OrderedEntityMap<Value: Equatable & Sendable>: Equatable, Sendable {
    private var order: [String] = []
    private var storage: [String: Value] = [:]

    public init() {}
    public var count: Int { order.count }
    public var isEmpty: Bool { order.isEmpty }
    public subscript(key: String) -> Value? { storage[key] }
    public func contains(_ key: String) -> Bool { storage[key] != nil }
    public var values: [Value] { order.compactMap { storage[$0] } }

    public func putting(_ value: Value, forKey key: String, max maxEntries: Int, isSettled: (Value) -> Bool) -> OrderedEntityMap<Value> {
        var copy = self
        if copy.storage[key] == nil {
            copy.order.append(key)
        }
        copy.storage[key] = value
        if copy.order.count > maxEntries {
            let victim = copy.order.first { candidate in
                guard candidate != key, let existing = copy.storage[candidate] else { return false }
                return isSettled(existing)
            } ?? copy.order.first
            if let victim {
                copy.order.removeAll { $0 == victim }
                copy.storage.removeValue(forKey: victim)
            }
        }
        return copy
    }
}
