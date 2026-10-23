import Cieo
import SwiftUI

/// A small non-modal comment box with an optional thread above it. It can place itself beside a point and
/// flip to stay inside its container. The host owns the thread and what submit does; the typed text stays
/// inside until it is sent.
public struct FeedbackPopover<Thread: View, Actions: View>: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @ScaledMetric private var width: CGFloat = 280 // literal-ok: panel width is component geometry
    @SwiftUI.State private var text = ""
    @FocusState private var focused: Bool
    @Binding private var isPresented: Bool
    private let placeholder: LocalizedStringKey
    private let submitLabel: LocalizedStringKey
    private let title: LocalizedStringKey?
    private let anchor: CGPoint?
    private let container: CGSize?
    private let gap: CGFloat
    private let thread: Thread
    private let secondaryActions: Actions
    private let onSubmit: (String) -> Void
    private let onDismiss: (() -> Void)?

    /// - Parameters:
    ///   - isPresented: Shows and hides the box; it also closes itself on Escape and after a submit.
    ///   - onSubmit: Called with the trimmed text, never for blank text.
    ///   - title: A visible heading that also names the box. Omit it for a box named by its placeholder.
    ///   - anchor: A point to sit beside, in points within `container`. Omit both to place the box in the
    ///     normal flow and let the host position it.
    ///   - thread: The existing thread, drawn above the field.
    ///   - secondaryActions: Extra actions beside the submit button, such as Resolve.
    public init(isPresented: Binding<Bool> = .constant(true), placeholder: LocalizedStringKey = "Add a comment",
                submitLabel: LocalizedStringKey = "Comment", title: LocalizedStringKey? = nil,
                anchor: CGPoint? = nil, container: CGSize? = nil, gap: CGFloat = FeedbackPopover.defaultGap,
                onSubmit: @escaping (String) -> Void, onDismiss: (() -> Void)? = nil,
                @ViewBuilder thread: () -> Thread, @ViewBuilder secondaryActions: () -> Actions) {
        _isPresented = isPresented
        self.placeholder = placeholder
        self.submitLabel = submitLabel
        self.title = title
        self.anchor = anchor
        self.container = container
        self.gap = gap
        self.onSubmit = onSubmit
        self.onDismiss = onDismiss
        self.thread = thread()
        self.secondaryActions = secondaryActions()
    }

    public var body: some View {
        Group {
            if isPresented {
                if let anchor, let container {
                    panel.placed(beside: anchor, in: container, gap: gap).transition(.opacity)
                } else {
                    panel.transition(.opacity)
                }
            }
        }
        .motion(.base, value: isPresented)
        .onChange(of: isPresented) { _, open in if !open { text = "" } }
    }

    private var panel: some View {
        VStack(alignment: .leading, spacing: metrics.compact) {
            if let title {
                Text(title).font(typography.heading).accessibilityAddTraits(.isHeader)
            }
            if Thread.self != EmptyView.self { thread }
            TextField(placeholder, text: $text, axis: .vertical)
                .lineLimit(2...6) // literal-ok: field grows from two lines to six
                .font(typography.field)
                .focused($focused)
                .padding(metrics.compact)
                .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner / 2)
            HStack(spacing: metrics.compact) {
                secondaryActions
                ActionButton(submitLabel, action: submit)
                    .keyboardShortcut(.return, modifiers: .command)
                    .disabled(Self.commentText(text) == nil)
            }
        }
        .padding(metrics.medium)
        .frame(maxWidth: width)
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: metrics.corner))
        .componentBorder(theme.border, width: metrics.hairline, cornerRadius: metrics.corner)
        .onAppear { focused = true }
        .onKeyPress(.escape) { dismiss(); return .handled }
        #if os(macOS)
        .onExitCommand { dismiss() }
        #endif
        .accessibilityElement(children: .contain)
        .accessibilityLabel(Text(title ?? placeholder))
        .accessibilityAction(.escape) { dismiss() }
    }

    private func submit() {
        guard let value = Self.commentText(text) else { return }
        onSubmit(value)
        text = ""
        dismiss()
    }

    private func dismiss() {
        isPresented = false
        onDismiss?()
    }

    // MARK: - Pure helpers

    /// Distance from the anchor when none is given.
    public static var defaultGap: CGFloat { 8 } // literal-ok: default offset in points

    /// Which side of the anchor a popover sits on.
    public enum Side: String, Sendable, CaseIterable { case right, left, below, above }

    /// Where a popover sits: its top-left corner and the side it chose.
    public struct Placement: Equatable, Sendable {
        public var left: CGFloat
        public var top: CGFloat
        public var side: Side
    }

    private static func clamp(_ v: CGFloat, to max: CGFloat) -> CGFloat {
        Swift.max(0, Swift.min(max.isFinite ? max : 0, v.isFinite ? v : 0))
    }

    /// Where a popover of `size` goes beside `anchor` inside `container`. Prefers right, then left, below,
    /// above; when none fits it takes the side with the most room. The result is always clamped inside the
    /// container.
    public static func placePopover(anchor: CGPoint, size: CGSize, container: CGSize, gap: CGFloat = defaultGap) -> Placement {
        let room: [Side: CGFloat] = [
            .right: container.width - anchor.x - gap - size.width,
            .left: anchor.x - gap - size.width,
            .below: container.height - anchor.y - gap - size.height,
            .above: anchor.y - gap - size.height,
        ]
        let order: [Side] = [.right, .left, .below, .above]
        var side = order.first { room[$0]! >= 0 }
        if side == nil {
            side = order.reduce(.right) { best, s in room[s]! > room[best]! ? s : best }
        }
        let chosen = side!
        let left: CGFloat
        let top: CGFloat
        if chosen == .right || chosen == .left {
            left = chosen == .right ? anchor.x + gap : anchor.x - gap - size.width
            top = anchor.y - Swift.min(size.height / 2, 28) // literal-ok: same cap as the web placement
        } else {
            left = anchor.x - size.width / 2
            top = chosen == .below ? anchor.y + gap : anchor.y - gap - size.height
        }
        return Placement(left: clamp(left, to: container.width - size.width),
                         top: clamp(top, to: container.height - size.height), side: chosen)
    }

    /// Text to hand to `onSubmit`, or nil when there is nothing but whitespace.
    public static func commentText(_ raw: String) -> String? {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}

public extension FeedbackPopover where Thread == EmptyView, Actions == EmptyView {
    /// A bare comment box with no thread and no extra actions.
    init(isPresented: Binding<Bool> = .constant(true), placeholder: LocalizedStringKey = "Add a comment",
         submitLabel: LocalizedStringKey = "Comment", title: LocalizedStringKey? = nil,
         anchor: CGPoint? = nil, container: CGSize? = nil, gap: CGFloat = FeedbackPopover.defaultGap,
         onSubmit: @escaping (String) -> Void, onDismiss: (() -> Void)? = nil) {
        self.init(isPresented: isPresented, placeholder: placeholder, submitLabel: submitLabel, title: title,
                  anchor: anchor, container: container, gap: gap, onSubmit: onSubmit, onDismiss: onDismiss,
                  thread: { EmptyView() }, secondaryActions: { EmptyView() })
    }
}

public extension FeedbackPopover where Actions == EmptyView {
    /// A comment box with an existing thread above the field.
    init(isPresented: Binding<Bool> = .constant(true), placeholder: LocalizedStringKey = "Add a comment",
         submitLabel: LocalizedStringKey = "Comment", title: LocalizedStringKey? = nil,
         anchor: CGPoint? = nil, container: CGSize? = nil, gap: CGFloat = FeedbackPopover.defaultGap,
         onSubmit: @escaping (String) -> Void, onDismiss: (() -> Void)? = nil,
         @ViewBuilder thread: () -> Thread) {
        self.init(isPresented: isPresented, placeholder: placeholder, submitLabel: submitLabel, title: title,
                  anchor: anchor, container: container, gap: gap, onSubmit: onSubmit, onDismiss: onDismiss,
                  thread: thread, secondaryActions: { EmptyView() })
    }
}

// MARK: - Placement

private struct PopoverSizeKey: PreferenceKey {
    static let defaultValue: CGSize? = nil
    static func reduce(value: inout CGSize?, nextValue: () -> CGSize?) { value = nextValue() ?? value }
}

/// Places a view beside a point inside a container, measuring it so placement flips to fit, and grows it in
/// from the anchor.
private struct PlacedBeside: ViewModifier {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var measured: CGSize?
    @State private var arrived = false
    let anchor: CGPoint
    let container: CGSize
    let gap: CGFloat

    /// Size to assume until the first measurement.
    private static let fallback = CGSize(width: 280, height: 160) // literal-ok: first-frame guess before measuring
    private static let popFrom: CGFloat = 0.96 // literal-ok: arrival scale

    func body(content: Content) -> some View {
        let size = measured ?? Self.fallback
        let placed = FeedbackPopover<EmptyView, EmptyView>.placePopover(anchor: anchor, size: size, container: container, gap: gap)
        let origin = UnitPoint(x: size.width > 0 ? (anchor.x - placed.left) / size.width : 0.5,
                               y: size.height > 0 ? (anchor.y - placed.top) / size.height : 0.5)
        content
            .fixedSize(horizontal: false, vertical: true)
            .background(GeometryReader { Color.clear.preference(key: PopoverSizeKey.self, value: $0.size) })
            .onPreferenceChange(PopoverSizeKey.self) { measured = $0 }
            .scaleEffect(arrived ? 1 : Self.popFrom, anchor: origin)
            .opacity(arrived ? 1 : Motion.arriveOpacity)
            .offset(x: placed.left, y: placed.top)
            .frame(width: container.width, height: container.height, alignment: .topLeading)
            .onAppear { withMotion(.base, reduceMotion: reduceMotion) { arrived = true } }
    }
}

extension View {
    /// Sits this view beside `anchor` inside a container of the given size.
    func placed(beside anchor: CGPoint, in container: CGSize, gap: CGFloat) -> some View {
        modifier(PlacedBeside(anchor: anchor, container: container, gap: gap))
    }
}

#Preview {
    FeedbackPopover(title: "Comment 2", onSubmit: { _ in }) { Text("Ava: can we shorten this?") }.padding()
}
