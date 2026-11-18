import Cieo
import CieoUI
import SwiftUI
#if canImport(AppKit)
import AppKit
#elseif canImport(UIKit)
import UIKit
#endif

/// Pure state backing `ConfigurableSpecimen`'s width constraint, Dynamic Type override, layout direction, and code disclosure.
public struct ConfigurableSpecimenState: Equatable, Sendable {
    public enum TypeSizePreset: String, CaseIterable, Sendable {
        case xSmall = "XS"
        case medium = "M"
        case large = "L"
        case xxLarge = "XXL"
        case accessibility2 = "AX2"

        public var dynamicTypeSize: DynamicTypeSize {
            switch self {
            case .xSmall: .xSmall
            case .medium: .medium
            case .large: .large
            case .xxLarge: .xxLarge
            case .accessibility2: .accessibility2
            }
        }
    }

    public static let minWidth: Double = 240
    public static let maxWidth: Double = 720

    public var constrainWidth: Bool
    public private(set) var constrainedWidth: Double
    public var typeSizePreset: TypeSizePreset
    public var layoutDirection: LayoutDirection
    public var isCodeExpanded: Bool

    public init(
        constrainWidth: Bool = false,
        constrainedWidth: Double = 390,
        typeSizePreset: TypeSizePreset = .large,
        layoutDirection: LayoutDirection = .leftToRight,
        isCodeExpanded: Bool = false
    ) {
        self.constrainWidth = constrainWidth
        self.constrainedWidth = Self.clampWidth(constrainedWidth)
        self.typeSizePreset = typeSizePreset
        self.layoutDirection = layoutDirection
        self.isCodeExpanded = isCodeExpanded
    }

    public mutating func setWidth(_ width: Double) {
        constrainedWidth = Self.clampWidth(width)
    }

    public static func clampWidth(_ value: Double) -> Double {
        guard value.isFinite else { return 390 }
        return min(maxWidth, max(minWidth, value))
    }
}

/// Interactive specimen card with live container width constraint, Dynamic Type size override, LTR/RTL toggle,
/// and a collapsible copyable SwiftUI code snippet block.
public struct ConfigurableSpecimen<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentMotion) private var motionConfig

    private let title: String
    private let code: String?
    private let content: Content
    @State private var state: ConfigurableSpecimenState
    @State private var showControls = false
    @State private var copiedCount = 0

    public init(
        title: String,
        code: String? = nil,
        initialState: ConfigurableSpecimenState = ConfigurableSpecimenState(),
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.code = code
        self.content = content()
        _state = State(initialValue: initialState)
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: metrics.standard) {
            headerRow
            if showControls {
                controlsBar
            }
            content
                .frame(maxWidth: state.constrainWidth ? CGFloat(state.constrainedWidth) : .infinity, alignment: .leading)
                .dynamicTypeSize(state.typeSizePreset.dynamicTypeSize)
                .environment(\.layoutDirection, state.layoutDirection)
            if let code, !code.isEmpty {
                codeSection(code)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(metrics.loose)
        .background(theme.surface, in: .rect(cornerRadius: metrics.cornerSurface))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.cornerSurface)
        .motionAnimation(motionConfig.layout, value: showControls)
        .motionAnimation(motionConfig.layout, value: state.isCodeExpanded)
        .motionHaptic(.selection, trigger: copiedCount)
    }

    private var headerRow: some View {
        HStack(alignment: .firstTextBaseline, spacing: metrics.compact) {
            Text(verbatim: title)
                .font(typography.heading)
                .foregroundStyle(theme.foreground)
                .accessibilityAddTraits(.isHeader)
            Spacer(minLength: metrics.compact)
            Button {
                showControls.toggle()
            } label: {
                Text(showControls ? "Hide stage" : "Stage")
                    .font(typography.strongDetail)
                    .foregroundStyle(theme.accent)
            }
            .buttonStyle(.plain)
            if let code, !code.isEmpty {
                Button {
                    state.isCodeExpanded.toggle()
                } label: {
                    Text(state.isCodeExpanded ? "Hide code" : "Code")
                        .font(typography.strongDetail)
                        .foregroundStyle(theme.secondary)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var controlsBar: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            FlowStack(spacing: metrics.compact) {
                SelectionChip("Constrain width", isSelected: $state.constrainWidth)
                    .chipStyle(.soft)
                SelectionChip(
                    "RTL",
                    isSelected: Binding(
                        get: { state.layoutDirection == .rightToLeft },
                        set: { state.layoutDirection = $0 ? .rightToLeft : .leftToRight }
                    )
                )
                .chipStyle(.soft)
                Picker("Text size", selection: $state.typeSizePreset) {
                    ForEach(ConfigurableSpecimenState.TypeSizePreset.allCases, id: \.self) { preset in
                        Text(verbatim: preset.rawValue).tag(preset)
                    }
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 220)
            }
            if state.constrainWidth {
                HStack(spacing: metrics.compact) {
                    Text(verbatim: "\(Int(state.constrainedWidth)) pt")
                        .font(typography.reference)
                        .foregroundStyle(theme.secondary)
                    Slider(
                        value: Binding(
                            get: { state.constrainedWidth },
                            set: { state.setWidth($0) }
                        ),
                        in: ConfigurableSpecimenState.minWidth...ConfigurableSpecimenState.maxWidth
                    )
                }
            }
        }
        .padding(metrics.medium)
        .background(theme.surfaceLow, in: .rect(cornerRadius: metrics.corner))
    }

    @ViewBuilder
    private func codeSection(_ snippet: String) -> some View {
        if state.isCodeExpanded {
            VStack(alignment: .leading, spacing: metrics.compact) {
                HStack {
                    Text("SwiftUI")
                        .font(typography.strongDetail)
                        .foregroundStyle(theme.secondary)
                    Spacer()
                    Button {
                        copyToPasteboard(snippet)
                        copiedCount += 1
                    } label: {
                        Text(copiedCount > 0 ? "Copied" : "Copy")
                            .font(typography.strongDetail)
                            .foregroundStyle(theme.accent)
                    }
                    .buttonStyle(.plain)
                }
                Text(verbatim: snippet)
                    .font(typography.reference)
                    .foregroundStyle(theme.foreground)
                    .textSelection(.enabled)
                    .padding(metrics.medium)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(theme.sunken, in: .rect(cornerRadius: metrics.cornerSmall))
            }
        }
    }

    private func copyToPasteboard(_ text: String) {
        #if canImport(AppKit)
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        #elseif canImport(UIKit)
        UIPasteboard.general.string = text
        #endif
    }
}
