import Cieo
import SwiftUI

/// A point on a layer as 0...1 fractions of its width and height, so pins follow the layout.
public struct LayerPoint: Equatable, Sendable {
    public var x: Double
    public var y: Double
    public init(x: Double, y: Double) {
        self.x = x
        self.y = y
    }
}

/// What a popover is open for: the unsent draft pin, or an existing pin by id.
public enum AnnotationTarget: Equatable, Sendable {
    case draft(LayerPoint)
    case pin(id: String)
}

/// One existing pin. Pins are numbered 1...n in array order.
public struct AnnotationLayerPin: Identifiable, Equatable, Sendable {
    public enum State: Sendable, CaseIterable { case open, resolved }
    public let id: String
    public let x: Double
    public let y: Double
    public let state: State
    public let initials: String?
    public let author: String?

    public init(id: String, x: Double, y: Double, state: State = .open, initials: String? = nil, author: String? = nil) {
        self.id = id
        self.x = x
        self.y = y
        self.state = state
        self.initials = initials
        self.author = author
    }
}

/// Wraps content for pin-and-comment review. Comment mode captures taps (or a keyboard reticle) and puts a
/// draft pin where the reviewer pointed; the host owns pins, drafts and threads and shows them in the
/// popover. The layer's own box is the reference for every point, so keep it out of a scroll view that
/// moves its content on its own.
public struct AnnotationLayer<Content: View, Popover: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    @ScaledMetric private var pinDiameter: CGFloat = AnnotationPin.defaultDiameter
    @FocusState private var overlayFocused: Bool
    @State private var reticle: LayerPoint?
    private let label: LocalizedStringKey
    private let labelText: String
    private let pins: [AnnotationLayerPin]
    @Binding private var isCommenting: Bool
    @Binding private var draft: LayerPoint?
    @Binding private var selection: String?
    private let content: Content
    private let popover: (AnnotationTarget, _ dismiss: @escaping () -> Void) -> Popover

    /// - Parameters:
    ///   - label: Names the reviewed area for VoiceOver, such as "Landing page".
    ///   - isCommenting: Comment mode. While on, taps place a draft and the content takes none.
    ///   - draft: The unsent pin. The layer sets it when a point is placed; the host clears it on cancel or
    ///     after saving, and the layer clears it on Escape.
    ///   - selection: The id of the pin whose thread is open.
    ///   - popover: The box beside the draft or selected pin, usually a `FeedbackPopover` with no anchor. The
    ///     `dismiss` closure cancels the draft or closes the thread.
    public init(_ label: String, pins: [AnnotationLayerPin], isCommenting: Binding<Bool>, draft: Binding<LayerPoint?>,
                selection: Binding<String?>, @ViewBuilder content: () -> Content,
                @ViewBuilder popover: @escaping (AnnotationTarget, _ dismiss: @escaping () -> Void) -> Popover) {
        self.label = LocalizedStringKey(label)
        labelText = label
        self.pins = pins
        _isCommenting = isCommenting
        _draft = draft
        _selection = selection
        self.content = content()
        self.popover = popover
    }

    private var selectedPin: AnnotationLayerPin? { selection.flatMap { id in pins.first { $0.id == id } } }
    private var target: AnnotationTarget? {
        if let draft { return .draft(draft) }
        return selectedPin.map { .pin(id: $0.id) }
    }
    private var targetPoint: LayerPoint? { draft ?? selectedPin.map { LayerPoint(x: $0.x, y: $0.y) } }

    public var body: some View {
        content
            .allowsHitTesting(!isCommenting)
            .accessibilityHidden(isCommenting)
            .overlay { if isCommenting { commentOverlay } }
            .overlay { GeometryReader { proxy in pinLayer(proxy.size) } }
            .accessibilityElement(children: .contain)
            .accessibilityLabel(Text(label))
            .accessibilityAction(named: Text("Add comment here")) { place(LayerPoint(x: 0.5, y: 0.5)) }
            .motion(.base, value: target)
            .onChange(of: isCommenting) { _, on in
                if !on { reticle = nil }
                AccessibilityNotification.Announcement(on ? Self.commentModeOn : Self.commentModeOff).post()
            }
    }

    // MARK: - Comment mode

    private var commentOverlay: some View {
        GeometryReader { proxy in
            ZStack(alignment: .topLeading) {
                Rectangle().fill(theme.tint)
                    .overlay(Rectangle().strokeBorder(theme.accent, lineWidth: metrics.hairline))
                    .contentShape(.rect)
                    .gesture(SpatialTapGesture().onEnded { tap in
                        place(Self.normalizePoint(x: tap.location.x, y: tap.location.y,
                                                  in: CGRect(origin: .zero, size: proxy.size)))
                    })
                if overlayFocused, let reticle {
                    Circle().strokeBorder(theme.accent, lineWidth: metrics.bar / 2) // literal-ok: reticle ring is half a bar
                        .frame(width: pinDiameter, height: pinDiameter)
                        .position(x: reticle.x * proxy.size.width, y: reticle.y * proxy.size.height)
                        .allowsHitTesting(false)
                        .accessibilityHidden(true)
                }
            }
        }
        .focusable()
        .focused($overlayFocused)
        #if os(macOS)
        .focusEffectDisabled()
        #endif
        .onKeyPress(phases: [.down, .repeat]) { press in handle(press) }
        .onChange(of: overlayFocused) { _, focused in reticle = focused ? (reticle ?? LayerPoint(x: 0.5, y: 0.5)) : nil }
        .onAppear { overlayFocused = true }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text("Place a comment on \(labelText)"))
        .accessibilityAddTraits(.isButton)
        .accessibilityAction { place(LayerPoint(x: 0.5, y: 0.5)) }
        .transition(.opacity)
    }

    private func handle(_ press: KeyPress) -> KeyPress.Result {
        if press.key == .escape { escape(); return .handled }
        if press.key == .return || press.characters == " " {
            place(reticle ?? LayerPoint(x: 0.5, y: 0.5))
            return .handled
        }
        guard let name = Self.arrowName(press.key),
              let next = Self.moveReticle(reticle ?? LayerPoint(x: 0.5, y: 0.5), key: name, shift: press.modifiers.contains(.shift))
        else { return .ignored }
        reticle = next
        return .handled
    }

    private func place(_ point: LayerPoint) {
        selection = nil
        draft = point
    }

    private func dismiss() {
        draft = nil
        selection = nil
    }

    private func escape() {
        if Self.escapeAction(hasOpenTarget: target != nil) == .closeTarget { dismiss() } else { isCommenting = false }
    }

    // MARK: - Pins and popover

    private func pinLayer(_ box: CGSize) -> some View {
        ZStack(alignment: .topLeading) {
            ForEach(Array(pins.enumerated()), id: \.element.id) { offset, pin in
                AnnotationPin(index: offset + 1, x: pin.x, y: pin.y,
                              state: pin.state == .resolved ? .resolved : .open,
                              selected: pin.id == selection, author: pin.author, initials: pin.initials) {
                    if selection == pin.id { selection = nil } else {
                        draft = nil
                        selection = pin.id
                    }
                }
            }
            if let draft {
                AnnotationPin(index: pins.count + 1, x: draft.x, y: draft.y, state: .draft, selected: true)
            }
            if let target, let at = targetPoint, box.width > 0, box.height > 0 {
                let anchor = CGPoint(x: at.x * box.width,
                                     y: at.y * box.height - AnnotationPin.centreRise(diameter: pinDiameter))
                popover(target, dismiss)
                    .placed(beside: anchor, in: box, gap: pinDiameter / 2 + metrics.compact)
                    .transition(.opacity)
            }
        }
        .frame(width: box.width, height: box.height, alignment: .topLeading)
    }

    // MARK: - Pure helpers

    /// Spoken when comment mode turns on.
    public static var commentModeOn: String { "Comment mode on. Tap or press Return to place a comment." }
    /// Spoken when comment mode turns off.
    public static var commentModeOff: String { "Comment mode off." }

    /// A tap position as a 0...1 point of `rect`, clamped. A zero-size rect gives 0, 0; NaN gives 0.
    public static func normalizePoint(x: Double, y: Double, in rect: CGRect) -> LayerPoint {
        let fx = rect.width > 0 ? (x - rect.minX) / rect.width : 0
        let fy = rect.height > 0 ? (y - rect.minY) / rect.height : 0
        return LayerPoint(x: AnnotationPin.clampUnit(fx), y: AnnotationPin.clampUnit(fy))
    }

    /// An arrow key moves the reticle by `step` (`big` with Shift), clamped to 0...1. Keys are named as on the
    /// web: "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown". Returns nil for any other key.
    public static func moveReticle(_ point: LayerPoint, key: String, shift: Bool = false,
                                   step: Double = 0.02, big: Double = 0.1) -> LayerPoint? { // literal-ok: web step sizes
        let d = shift ? big : step
        func round(_ v: Double) -> Double { (AnnotationPin.clampUnit(v) * 10000).rounded() / 10000 } // literal-ok: four-decimal rounding
        switch key {
        case "ArrowLeft": return LayerPoint(x: round(point.x - d), y: point.y)
        case "ArrowRight": return LayerPoint(x: round(point.x + d), y: point.y)
        case "ArrowUp": return LayerPoint(x: point.x, y: round(point.y - d))
        case "ArrowDown": return LayerPoint(x: point.x, y: round(point.y + d))
        default: return nil
        }
    }

    /// What Escape does in comment mode.
    public enum EscapeAction: Sendable { case closeTarget, leaveMode }

    /// Escape cancels an open draft or thread first, otherwise leaves comment mode.
    public static func escapeAction(hasOpenTarget: Bool) -> EscapeAction { hasOpenTarget ? .closeTarget : .leaveMode }

    static func arrowName(_ key: KeyEquivalent) -> String? {
        switch key {
        case .leftArrow: "ArrowLeft"
        case .rightArrow: "ArrowRight"
        case .upArrow: "ArrowUp"
        case .downArrow: "ArrowDown"
        default: nil
        }
    }
}

#Preview {
    @Previewable @State var commenting = true
    @Previewable @State var draft: LayerPoint?
    @Previewable @State var selection: String?
    AnnotationLayer("Landing page", pins: [AnnotationLayerPin(id: "a", x: 0.3, y: 0.4, initials: "AV")],
                    isCommenting: $commenting, draft: $draft, selection: $selection) {
        RoundedRectangle(cornerRadius: 12).fill(.quaternary).frame(width: 320, height: 220) // literal-ok: preview scaffolding
    } popover: { _, dismiss in
        FeedbackPopover(onSubmit: { _ in }, onDismiss: dismiss)
    }
}
