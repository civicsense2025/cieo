import Cieo
import SwiftUI

/// Bottom sheet with velocity-projected detent snapping via `MotionPhysics.projectToDetent` and rubber-banded overshoot.
public struct BottomSheetPanel<Content: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.componentStrings) private var strings
    @Environment(\.componentMotion) private var motionConfig

    @Binding private var isPresented: Bool
    private let externalDetent: Binding<Double>?
    @State private var detentState: SheetDetentState
    @State private var tracker = VelocityTracker()
    private let content: Content

    public init(
        isPresented: Binding<Bool>,
        detents: [Double],
        selectedDetent: Double? = nil,
        @ViewBuilder content: () -> Content
    ) {
        _isPresented = isPresented
        self.externalDetent = nil
        _detentState = State(initialValue: SheetDetentState(detents: detents, selectedDetent: selectedDetent))
        self.content = content()
    }

    public init(
        isPresented: Binding<Bool>,
        detents: [Double],
        selectedDetent: Binding<Double>,
        @ViewBuilder content: () -> Content
    ) {
        _isPresented = isPresented
        self.externalDetent = selectedDetent
        _detentState = State(initialValue: SheetDetentState(detents: detents, selectedDetent: selectedDetent.wrappedValue))
        self.content = content()
    }

    public var body: some View {
        if isPresented {
            VStack(spacing: 0) { // literal-ok: flush stack, grabber sits directly above sheet content
                handle
                content
                    .padding(.horizontal, metrics.standard)
                    .padding(.bottom, metrics.standard)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
            .frame(
                height: max(0, detentState.effectivePosition(dimension: maxDimension)),
                alignment: .top
            )
            .frame(maxWidth: .infinity)
            .background(theme.raised, in: sheetShape)
            .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.cornerSurface)
            .floatingShadow()
            .gesture(dragGesture)
            .onChange(of: externalDetent?.wrappedValue) { _, newValue in
                if let newValue, newValue != detentState.selectedDetent {
                    detentState.select(newValue)
                }
            }
            .motionAnimation(motionConfig.layout, value: detentState.selectedDetent)
            .motionHaptic(.selection, trigger: detentState.selectedDetent)
            .accessibilityElement(children: .contain)
        }
    }

    private var handle: some View {
        Button(action: cycleDetent) {
            Capsule()
                .fill(theme.subtle)
                .frame(width: metrics.controlSmall, height: metrics.tight)
                .frame(maxWidth: .infinity, minHeight: metrics.touchTarget)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text(verbatim: strings.sheetExpandCollapse))
    }

    private var sheetShape: UnevenRoundedRectangle {
        UnevenRoundedRectangle(
            topLeadingRadius: metrics.cornerSurface,
            bottomLeadingRadius: 0,
            bottomTrailingRadius: 0,
            topTrailingRadius: metrics.cornerSurface
        )
    }

    private var maxDimension: Double {
        detentState.detents.max() ?? 320 // literal-ok: fallback dimension for rubber-band calculation
    }

    private var dragGesture: some Gesture {
        DragGesture(minimumDistance: metrics.compact)
            .onChanged { value in
                detentState.updateDrag(-value.translation.height)
                tracker.addSample(
                    CGPoint(x: value.translation.width, y: -value.translation.height),
                    at: ProcessInfo.processInfo.systemUptime
                )
            }
            .onEnded { value in
                let trackedVy = Double(tracker.velocity().dy)
                let fallbackVy = -Double(value.velocity.height)
                let vy = abs(trackedVy) > abs(fallbackVy) ? trackedVy : fallbackVy
                tracker.reset()
                let settled = detentState.endDrag(velocity: vy)
                externalDetent?.wrappedValue = settled.next
            }
    }

    private func cycleDetent() {
        let detents = detentState.detents
        guard detents.count > 1 else { return }
        let current = detentState.selectedDetent
        let next: Double
        if let idx = detents.firstIndex(of: current), idx + 1 < detents.count {
            next = detents[idx + 1]
        } else {
            next = detents[0]
        }
        detentState.select(next)
        externalDetent?.wrappedValue = detentState.selectedDetent
    }
}
