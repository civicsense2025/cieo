import SwiftUI

extension View {
    /// Use the platform's native boolean control, including its accessibility behavior.
    @ViewBuilder
    func nativeToggleStyle() -> some View {
        #if os(macOS)
            toggleStyle(.checkbox)
        #else
            toggleStyle(.switch)
        #endif
    }
}
