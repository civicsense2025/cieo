import Cieo
import CieoUI
import Foundation
import SwiftUI

/// Live WCAG 2.2 contrast readout, 7-brand × 3-ground switcher, and live component previews.
public struct ThemeStudioView: View {
    @Environment(\.self) private var environment
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentTypography) private var typography

    private let externalBrand: Binding<ThemeBrand>?
    private let externalGround: Binding<ThemeGround>?
    private let externalElevation: Binding<ElevationStyle>?

    @State private var ownedBrand: ThemeBrand = .instrument
    @State private var ownedGround: ThemeGround = .paper
    @State private var ownedElevation: ElevationStyle = .ring
    @State private var previewDark = false

    public init(
        brand: Binding<ThemeBrand>? = nil,
        ground: Binding<ThemeGround>? = nil,
        elevation: Binding<ElevationStyle>? = nil
    ) {
        self.externalBrand = brand
        self.externalGround = ground
        self.externalElevation = elevation
    }

    private var activeBrand: Binding<ThemeBrand> { externalBrand ?? $ownedBrand }
    private var activeGround: Binding<ThemeGround> { externalGround ?? $ownedGround }
    private var activeElevation: Binding<ElevationStyle> { externalElevation ?? $ownedElevation }

    public var body: some View {
        let theme = Theme.preset(
            brand: activeBrand.wrappedValue,
            ground: activeGround.wrappedValue,
            elevation: activeElevation.wrappedValue
        )
        var auditEnv = environment
        auditEnv.colorScheme = previewDark ? .dark : environment.colorScheme

        return VStack(alignment: .leading, spacing: metrics.section) {
            Specimen(title: "7 Brands × 3 Grounds") {
                Text("Brand").font(typography.fieldLabel)
                FlowStack(spacing: metrics.compact) {
                    ForEach(ThemeBrand.allCases, id: \.self) { option in
                        SelectionChip(
                            Text(verbatim: option.label),
                            isSelected: selectionBinding(option, in: activeBrand)
                        )
                        .chipStyle(.soft)
                    }
                }
                Text("Ground").font(typography.fieldLabel)
                FlowStack(spacing: metrics.compact) {
                    ForEach(ThemeGround.allCases, id: \.self) { option in
                        SelectionChip(
                            Text(verbatim: option.rawValue.capitalized),
                            isSelected: selectionBinding(option, in: activeGround)
                        )
                    }
                }
                HStack(spacing: metrics.compact) {
                    ForEach(ElevationStyle.allCases, id: \.self) { option in
                        SelectionChip(
                            Text(verbatim: option.rawValue.capitalized),
                            isSelected: selectionBinding(option, in: activeElevation)
                        )
                        .chipStyle(.rounded)
                    }
                    SelectionChip("Dark audit", isSelected: $previewDark)
                        .chipStyle(.outlined)
                }
            }

            Specimen(title: "Live WCAG 2.2 Contrast Audit") {
                contrastRow("Foreground on Surface", fg: theme.foreground, bg: theme.surface, env: auditEnv)
                contrastRow("Secondary on Surface", fg: theme.secondary, bg: theme.surface, env: auditEnv)
                contrastRow("OnAccent on Accent", fg: theme.onAccent, bg: theme.accent, env: auditEnv)
                contrastRow("Success on SuccessSoft", fg: theme.success, bg: theme.successSoft, env: auditEnv)
                contrastRow("Warning on WarningSoft", fg: theme.warning, bg: theme.warningSoft, env: auditEnv)
                contrastRow("Danger on DangerSoft", fg: theme.danger, bg: theme.dangerSoft, env: auditEnv)
            }

            Specimen(title: "Audited Component Previews") {
                VStack(alignment: .leading, spacing: metrics.medium) {
                    ActionButton("Commit changes", phase: .idle) {}
                    Notice("All checks passed", detail: "Token contrast verified across grounds.", tone: .success)
                    HStack(spacing: metrics.medium) {
                        ProgressRing(value: 0.78, diameter: 64)
                        VStack(alignment: .leading, spacing: metrics.compact) {
                            SelectionChip("Capsule", isSelected: .constant(true)).chipStyle(.capsule)
                            SelectionChip("Outlined", isSelected: .constant(true)).chipStyle(.outlined)
                        }
                    }
                }
                .environment(\.componentTheme, theme)
                .environment(\.colorScheme, auditEnv.colorScheme)
            }
        }
    }

    private func contrastRow(_ title: String, fg: Color, bg: Color, env: EnvironmentValues) -> some View {
        let ratio = Self.contrastRatio(fg, bg, in: env)
        let tier = ratio >= 7.0 ? "AAA" : (ratio >= 4.5 ? "AA" : (ratio >= 3.0 ? "AA Large" : "Low"))
        let chipTone: StatusChip.Tone = ratio >= 4.5 ? .done : (ratio >= 3.0 ? .attention : .danger)

        return HStack(spacing: metrics.compact) {
            RoundedRectangle(cornerRadius: metrics.cornerSmall)
                .fill(bg)
                .frame(width: metrics.controlHeight, height: metrics.controlSmall)
                .overlay {
                    Text(verbatim: "Aa")
                        .font(typography.strongBody)
                        .foregroundStyle(fg)
                }
                .componentBorder(fg.opacity(0.25), width: metrics.hairline, cornerRadius: metrics.cornerSmall)
            Text(verbatim: title)
                .font(typography.detail)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(verbatim: String(format: "%.1f:1", ratio))
                .font(typography.reference)
            StatusChip(tier, tone: chipTone)
        }
    }

    private func selectionBinding<T: Equatable>(_ option: T, in target: Binding<T>) -> Binding<Bool> {
        Binding(
            get: { target.wrappedValue == option },
            set: { if $0 { target.wrappedValue = option } }
        )
    }

    /// Computes WCAG 2.x contrast ratio `(L1 + 0.05) / (L2 + 0.05)` in `1.0...21.0`.
    public static func contrastRatio(_ fg: Color, _ bg: Color, in environment: EnvironmentValues) -> Double {
        let l1 = relativeLuminance(fg.resolve(in: environment))
        let l2 = relativeLuminance(bg.resolve(in: environment))
        return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)
    }

    private static func relativeLuminance(_ resolved: Color.Resolved) -> Double {
        func channel(_ c: Float) -> Double {
            let s = min(1.0, max(0.0, Double(c)))
            return s <= 0.04045 ? s / 12.92 : pow((s + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * channel(resolved.red) + 0.7152 * channel(resolved.green) + 0.0722 * channel(resolved.blue)
    }
}
