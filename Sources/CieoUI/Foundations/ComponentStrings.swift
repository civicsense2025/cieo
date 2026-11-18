import SwiftUI

/// Root-installable interface copy defaults so hosts can localize or rephrase built-in CieoUI strings from one place.
public struct ComponentStrings: Equatable, Sendable {
    // MARK: - Core controls
    public var actionReady: String = "Ready"
    public var actionInProgress: String = "In progress"
    public var actionCompleted: String = "Completed"
    public var actionUncertain: String = "Sending could not be confirmed"
    public var chipSelected: String = "Selected"
    public var chipUnselected: String = "Not selected"
    public var progressLabel: String = "Progress"
    public var searchPlaceholder: String = "Search"
    public var searchClear: String = "Clear search"
    public var dismissLabel: String = "Dismiss"
    public var sheetExpandCollapse: String = "Change sheet height"
    public var sortAscending: String = "Sorted ascending"
    public var sortDescending: String = "Sorted descending"
    public var sortUnsorted: String = "Unsorted"

    // MARK: - Agent status and controls
    public var agentStarting: String = "Starting"
    public var agentWorking: String = "Working"
    public var agentWaiting: String = "Needs you"
    public var agentCompleted: String = "Done"
    public var agentStopped: String = "Stopped"
    public var agentFailed: String = "Failed"
    public var agentInterrupted: String = "Interrupted"
    public var agentDisconnected: String = "Disconnected"

    public var runControlsLabel: String = "Run controls"
    public var runStop: String = "Stop"
    public var runPause: String = "Pause"
    public var runResume: String = "Resume"

    public var toolRunning: String = "Running"
    public var toolFinished: String = "Done"
    public var toolFailed: String = "Failed"
    public var toolDefaultError: String = "The tool call failed."

    public var approvalFallbackTitle: String = "Approval needed"
    public var approvalPending: String = "Waiting for your decision"
    public var approvalApproved: String = "Approved"
    public var approvalDenied: String = "Denied"
    public var approvalExpired: String = "Expired"
    public var approvalApprove: String = "Approve"
    public var approvalDeny: String = "Deny"

    public var agentLanesLabel: String = "Agents"
    public var agentActivityLabel: String = "Agent activity"
    public var agentActivityEmpty: String = "No agent events recorded yet."

    // MARK: - Command palette and auth
    public var commandSearchPlaceholder: String = "Type a command or search"
    public var commandEmpty: String = "No matching commands"
    public var otpTitle: String = "Verification code"
    public var passwordTitle: String = "Password"
    public var passwordShow: String = "Show"
    public var passwordHide: String = "Hide"
    public var passwordShowLabel: String = "Show password"
    public var passwordHideLabel: String = "Hide password"
    public var passwordStrengthLabel: String = "Password strength"
    public var passwordStrengthTooWeak: String = "Too weak"
    public var passwordStrengthWeak: String = "Weak"
    public var passwordStrengthOkay: String = "Okay"
    public var passwordStrengthStrong: String = "Strong"
    public var passwordStrengthVeryStrong: String = "Very strong"

    public init() {}

    public func statusWords(for status: AgentRunStatus) -> String {
        switch status {
        case .starting: agentStarting
        case .running: agentWorking
        case .waiting: agentWaiting
        case .completed: agentCompleted
        case .stopped: agentStopped
        case .failed: agentFailed
        case .interrupted: agentInterrupted
        case .disconnected: agentDisconnected
        }
    }

    public func approvalWords(for state: ApprovalState) -> String {
        switch state {
        case .pending: approvalPending
        case .approved: approvalApproved
        case .denied: approvalDenied
        case .expired: approvalExpired
        }
    }

    public func toolWords(for phase: AgentToolPhase) -> String {
        switch phase {
        case .started: toolRunning
        case .finished: toolFinished
        case .failed: toolFailed
        }
    }
}

public extension EnvironmentValues {
    @Entry var componentStrings = ComponentStrings()
}

public extension View {
    /// Installs customized or localized default interface strings for CieoUI controls.
    func componentStrings(_ strings: ComponentStrings) -> some View {
        environment(\.componentStrings, strings)
    }
}
