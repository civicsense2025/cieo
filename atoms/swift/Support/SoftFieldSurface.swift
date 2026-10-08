import SwiftUI

extension View {
    /// Filled fields keep their boundary visible without decorative exterior lines.
    func softFieldSurface() -> some View {
        textFieldStyle(.plain)
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
    }
}
