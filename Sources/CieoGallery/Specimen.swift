import CieoUI
import SwiftUI

struct Specimen<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: metrics.standard) {
            Text(title)
                .font(typography.heading)
                .foregroundStyle(theme.foreground)
                .accessibilityAddTraits(.isHeader)
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(metrics.loose)
        .background(theme.surface, in: .rect(cornerRadius: metrics.cornerSurface))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.cornerSurface)
    }
}
