import SwiftUI

/// What every Swift atom declares about itself. `id` matches the web atom id in atoms/web.
public struct MotionAtomInfo: Sendable {
    public let id: String
    public let category: String
    public let name: String
    /// One line on what the motion does, same as the web atom's description.
    public let summary: String

    public init(id: String, category: String, name: String, summary: String) {
        self.id = id
        self.category = category
        self.name = name
        self.summary = summary
    }
}

/// Each atom is a SwiftUI view with a static `info`. scripts/gen-swift-index.mjs lists them in AtomIndex.generated.swift.
public protocol MotionAtomView: View {
    static var info: MotionAtomInfo { get }
    init()
}

public struct MotionAtom: Identifiable {
    public let info: MotionAtomInfo
    public let make: () -> AnyView
    public var id: String { info.id }

    public init<V: MotionAtomView>(_ type: V.Type) {
        info = V.info
        make = { AnyView(V()) }
    }
}
