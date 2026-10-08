import SwiftUI

/// Keep keyboard actions shared between macOS and iPad hardware keyboards.
enum NavigationDirection { case up, down, left, right }

extension View {
    func escapeKey(_ action: @escaping () -> Void) -> some View {
        onKeyPress(.escape) { action(); return .handled }
    }

    func directionKeys(_ action: @escaping (NavigationDirection) -> Void) -> some View {
        onKeyPress(keys: [.upArrow, .downArrow, .leftArrow, .rightArrow]) { press in
            switch press.key {
            case .upArrow: action(.up)
            case .downArrow: action(.down)
            case .leftArrow: action(.left)
            case .rightArrow: action(.right)
            default: return .ignored
            }
            return .handled
        }
    }
}
