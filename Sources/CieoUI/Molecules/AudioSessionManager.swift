import AVFoundation
import Foundation

enum AudioSessionUse: Sendable, Equatable { case playback, recording }

enum AudioSessionCategory: Sendable, Equatable { case playback, playAndRecord }

public enum AudioSessionReconciliationStatus: Sendable, Equatable {
    case ready
    case retrying(attempt: Int, maximumAttempts: Int, message: String)
    case failed(attempts: Int, message: String)
}

protocol AudioSessionBackend: Sendable {
    func setCategory(_ category: AudioSessionCategory) throws
    func setActive(_ active: Bool) throws
}

protocol AudioSessionRetryTicket: AnyObject, Sendable {
    func cancel()
}

protocol AudioSessionRetryScheduler: AnyObject, Sendable {
    func schedule(after delay: TimeInterval, operation: @escaping @Sendable () -> Void) -> any AudioSessionRetryTicket
}

private final class DispatchAudioSessionRetryTicket: AudioSessionRetryTicket, @unchecked Sendable {
    private let lock = NSLock()
    private var operation: (@Sendable () -> Void)?
    private var workItem: DispatchWorkItem?
    private var canceled = false
    private var delivered = false

    init(after delay: TimeInterval, operation: @escaping @Sendable () -> Void) {
        self.operation = operation
        let workItem = DispatchWorkItem { [self] in deliver() }
        self.workItem = workItem
        DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + delay, execute: workItem)
    }

    func cancel() {
        lock.lock()
        canceled = true
        operation = nil
        let workItem = self.workItem
        self.workItem = nil
        lock.unlock()
        workItem?.cancel()
    }

    private func deliver() {
        lock.lock()
        guard !canceled, !delivered else {
            workItem = nil
            lock.unlock()
            return
        }
        delivered = true
        let operation = self.operation
        self.operation = nil
        workItem = nil
        lock.unlock()
        operation?()
    }
}

private final class SystemAudioSessionRetryScheduler: AudioSessionRetryScheduler, @unchecked Sendable {
    static let shared = SystemAudioSessionRetryScheduler()

    func schedule(after delay: TimeInterval, operation: @escaping @Sendable () -> Void) -> any AudioSessionRetryTicket {
        DispatchAudioSessionRetryTicket(after: delay, operation: operation)
    }
}

private struct SystemAudioSessionBackend: AudioSessionBackend {
    func setCategory(_ category: AudioSessionCategory) throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        switch category {
        case .playback:
            try session.setCategory(.playback)
        case .playAndRecord:
            try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker, .allowBluetoothHFP])
        }
        #endif
    }

    func setActive(_ active: Bool) throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        if active {
            try session.setActive(true)
        } else {
            try session.setActive(false, options: .notifyOthersOnDeactivation)
        }
        #endif
    }
}

protocol AudioSessionManaging: Sendable {
    var reconciliationStatus: AudioSessionReconciliationStatus { get }
    func activate(_ use: AudioSessionUse, owner: UUID) throws
    /// Removes the logical owner immediately; failed system changes retain bounded repair state.
    func deactivate(owner: UUID) throws
}

final class SystemAudioSessionManager: AudioSessionManaging, @unchecked Sendable {
    static let shared = SystemAudioSessionManager()

    private struct RetryRequest {
        let scheduler: AudioSessionRetryScheduler
        let generation: UInt64
        let attempt: Int
        let delay: TimeInterval
    }

    private static let retryDelays: [TimeInterval] = [0.05, 0.1, 0.2]

    private let lock = NSLock()
    private let backend: AudioSessionBackend
    private let retryScheduler: AudioSessionRetryScheduler
    private var retryTicket: (any AudioSessionRetryTicket)?
    private var leases: [UUID: AudioSessionUse] = [:]
    private var activeCategory: AudioSessionCategory?
    private var isActive = false
    private var status: AudioSessionReconciliationStatus = .ready
    private var retryGeneration: UInt64 = 0
    private var retriesScheduled = 0

    init() {
        backend = SystemAudioSessionBackend()
        retryScheduler = SystemAudioSessionRetryScheduler.shared
    }

    init(backend: AudioSessionBackend) {
        self.backend = backend
        retryScheduler = SystemAudioSessionRetryScheduler.shared
    }

    init(backend: AudioSessionBackend, retryScheduler: AudioSessionRetryScheduler) {
        self.backend = backend
        self.retryScheduler = retryScheduler
    }

    var reconciliationStatus: AudioSessionReconciliationStatus {
        lock.lock(); defer { lock.unlock() }
        return status
    }

    func activate(_ use: AudioSessionUse, owner: UUID) throws {
        lock.lock()
        var nextLeases = leases
        nextLeases[owner] = use
        do {
            try reconcileLocked(to: Self.category(for: nextLeases))
            leases = nextLeases
            cancelRetriesLocked()
            lock.unlock()
        } catch {
            let activationError = error
            var retryRequest: RetryRequest?
            if case .retrying = status {
                // The current repair still matches the unchanged logical owners.
            } else {
                cancelRetriesLocked()
                do {
                    try reconcileLocked(to: Self.category(for: leases))
                } catch {
                    retryRequest = scheduleRetryLocked(after: error)
                }
            }
            lock.unlock()
            enqueue(retryRequest)
            throw activationError
        }
    }

    func deactivate(owner: UUID) throws {
        lock.lock()
        guard leases.removeValue(forKey: owner) != nil else {
            lock.unlock()
            return
        }
        cancelRetriesLocked()
        do {
            try reconcileLocked(to: Self.category(for: leases))
            lock.unlock()
        } catch {
            let retryRequest = scheduleRetryLocked(after: error)
            lock.unlock()
            enqueue(retryRequest)
            throw error
        }
    }

    private func reconcileLocked(to desiredCategory: AudioSessionCategory?) throws {
        if let desiredCategory {
            if activeCategory != desiredCategory {
                try backend.setCategory(desiredCategory)
                activeCategory = desiredCategory
            }
            if !isActive {
                try backend.setActive(true)
                isActive = true
            }
        } else if isActive {
            try backend.setActive(false)
            isActive = false
        }
    }

    private func scheduleRetryLocked(after error: Error) -> RetryRequest? {
        let message = String(describing: error)
        let attempt = retriesScheduled + 1
        guard attempt <= Self.retryDelays.count else {
            status = .failed(attempts: attempt, message: message)
            return nil
        }
        retriesScheduled = attempt
        status = .retrying(attempt: attempt, maximumAttempts: Self.retryDelays.count, message: message)
        return RetryRequest(scheduler: retryScheduler, generation: retryGeneration, attempt: attempt,
                            delay: Self.retryDelays[attempt - 1])
    }

    private func enqueue(_ request: RetryRequest?) {
        guard let request else { return }
        let ticket = request.scheduler.schedule(after: request.delay) { [self] in
            retryReconciliation(generation: request.generation, attempt: request.attempt)
        }
        lock.lock()
        let matches: Bool
        if case .retrying(let currentAttempt, _, _) = status {
            matches = retryGeneration == request.generation && currentAttempt == request.attempt
        } else {
            matches = false
        }
        if matches {
            retryTicket?.cancel()
            retryTicket = ticket
        } else {
            ticket.cancel()
        }
        lock.unlock()
    }

    private func retryReconciliation(generation: UInt64, attempt: Int) {
        lock.lock()
        guard retryGeneration == generation,
              case .retrying(let currentAttempt, _, _) = status,
              currentAttempt == attempt else {
            lock.unlock()
            return
        }
        retryTicket = nil
        var retryRequest: RetryRequest?
        do {
            try reconcileLocked(to: Self.category(for: leases))
            status = .ready
            retriesScheduled = 0
        } catch {
            retryRequest = scheduleRetryLocked(after: error)
        }
        lock.unlock()
        enqueue(retryRequest)
    }

    private func cancelRetriesLocked() {
        retryGeneration &+= 1
        retriesScheduled = 0
        retryTicket?.cancel()
        retryTicket = nil
        status = .ready
    }

    private static func category(for leases: [UUID: AudioSessionUse]) -> AudioSessionCategory? {
        guard !leases.isEmpty else { return nil }
        if leases.values.contains(where: { $0 == .recording }) { return .playAndRecord }
        return .playback
    }
}

/// Reads process-wide audio-session repair state even after an audio model is gone.
public enum AudioSessionStatusCenter {
    public static var current: AudioSessionReconciliationStatus {
        SystemAudioSessionManager.shared.reconciliationStatus
    }
}
