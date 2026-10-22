import SwiftUI

/// Where a step stands on a path.
public enum PathwayStage: Sendable, Equatable {
    case done, current, upcoming
}

/// The line drawn between two nodes.
public enum PathwayStroke: Sendable {
    /// Round dots, for a learning path.
    case dotted
    /// Short dashes, for a process such as a bill's stages.
    case dashed

    var dash: [CGFloat] { self == .dotted ? [2, 7] : [6, 7] } // literal-ok: path dash geometry has no host role
    var width: CGFloat { self == .dotted ? 2.5 : 3 } // literal-ok: path stroke geometry has no host role
}

/// Steps as round nodes joined by a curved line. Vertically, nodes step side to side and a curve joins
/// each pair; horizontally, nodes sit in a row joined by arches. Lines behind finished steps take the accent.
/// At accessibility text sizes the vertical path straightens so labels keep the full width.
public struct Pathway<Item: Identifiable, Label: View>: View {
    public enum Axis: Sendable { case vertical, horizontal }

    /// Sideways offsets for each node in turn, repeated down the path.
    public static var compactOffsets: [CGFloat] { [0, 36, 64, 36] }
    public static var wideOffsets: [CGFloat] { [0, 72, 152, 104, 24, 128, 48, 176] }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.dynamicTypeSize) private var typeSize
    @Environment(\.horizontalSizeClass) private var sizeClass
    @ScaledMetric(relativeTo: .headline) private var scaledNode: CGFloat = 56

    private let items: [Item]
    private let stage: (Item) -> PathwayStage
    private let axis: Axis
    private let stroke: PathwayStroke
    private let offsets: [CGFloat]?
    private let firstNumber: Int
    private let total: Int?
    private let accessibilityName: (Item) -> Text
    private let action: ((Item) -> Void)?
    private let label: (Item, Int) -> Label

    /// `accessibilityName` is the step's name as VoiceOver should read it, such as the lesson title.
    /// `firstNumber` is the number on the first row and `total` the length of the whole path, for a host that
    /// shows a window of a longer one (lessons 11 to 20 of 40). A `nil` total means the rows are the whole path.
    /// Both are clamped by ``stepNumber(at:firstNumber:)`` and ``stepCount(rows:firstNumber:total:)``.
    /// The `label` closure still receives the row's position in `items`, starting at 0.
    public init(_ items: [Item], axis: Axis = .vertical, stroke: PathwayStroke = .dotted, offsets: [CGFloat]? = nil,
                firstNumber: Int = 1, total: Int? = nil,
                stage: @escaping (Item) -> PathwayStage, accessibilityName: @escaping (Item) -> Text,
                action: ((Item) -> Void)? = nil, @ViewBuilder label: @escaping (Item, Int) -> Label)
    {
        self.items = items
        self.axis = axis
        self.stroke = stroke
        self.offsets = offsets
        self.firstNumber = firstNumber
        self.total = total
        self.stage = stage
        self.accessibilityName = accessibilityName
        self.action = action
        self.label = label
    }

    /// The node's sideways offset at a position, for a pattern of offsets.
    public static func offset(at index: Int, in pattern: [CGFloat]) -> CGFloat {
        let usable = pattern.filter { $0.isFinite }.map { max(0, $0) }
        guard !usable.isEmpty, index >= 0 else { return 0 }
        return usable[index % usable.count]
    }

    /// The number shown on the row at `index`. A first number below 1 counts from 1.
    public static func stepNumber(at index: Int, firstNumber: Int) -> Int {
        let (number, overflow) = max(1, firstNumber).addingReportingOverflow(max(0, index))
        return overflow ? Int.max : number
    }

    /// How many steps the whole path has: `total`, or the row count when it is `nil`, and never fewer than
    /// the last number shown, so VoiceOver never reads "Step 12 of 10".
    public static func stepCount(rows: Int, firstNumber: Int, total: Int?) -> Int {
        let last = rows > 0 ? stepNumber(at: rows - 1, firstNumber: firstNumber) : 0
        return max(total ?? rows, last)
    }

    /// How VoiceOver places a row on the path, such as "Step 3 of 40".
    public static func spokenPosition(at index: Int, rows: Int, firstNumber: Int = 1, total: Int? = nil) -> String {
        "Step \(stepNumber(at: index, firstNumber: firstNumber)) of \(stepCount(rows: rows, firstNumber: firstNumber, total: total))"
    }

    /// A line is walked when the step it leaves is done.
    public static func isWalked(from stage: PathwayStage) -> Bool { stage == .done }

    /// How VoiceOver names a step's state.
    public static func spokenStage(_ stage: PathwayStage) -> String {
        switch stage {
        case .done: "done"
        case .current: "current"
        case .upcoming: "not started"
        }
    }

    private var node: CGFloat { min(88, scaledNode) }

    private var pattern: [CGFloat] {
        if typeSize.isAccessibilitySize { return [0] }
        if let offsets { return offsets }
        #if os(macOS)
        return Self.wideOffsets
        #else
        return sizeClass == .regular ? Self.wideOffsets : Self.compactOffsets
        #endif
    }

    public var body: some View {
        Group {
            switch axis {
            case .vertical: vertical
            case .horizontal: horizontal
            }
        }
        .accessibilityElement(children: .contain)
    }

    private var vertical: some View {
        VStack(alignment: .leading, spacing: 0) { // literal-ok: rows butt together, the path supplies the gap
            ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                if index > 0 {
                    let from = Self.offset(at: index - 1, in: pattern) + node / 2
                    let to = Self.offset(at: index, in: pattern) + node / 2
                    PathwayBend(from: from, to: to)
                        .stroke(lineColor(after: items[index - 1]), style: lineStyle)
                        .frame(height: node)
                        .accessibilityHidden(true)
                }
                row(item, index: index) {
                    HStack(alignment: .center, spacing: metrics.medium) {
                        nodeView(item, index: index)
                        label(item, index).frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(.leading, Self.offset(at: index, in: pattern))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var horizontal: some View {
        HStack(alignment: .top, spacing: 0) { // literal-ok: columns butt together, the arches supply the gap
            ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                row(item, index: index) {
                    VStack(spacing: metrics.compact) {
                        nodeView(item, index: index)
                        label(item, index).multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                }
                .background(alignment: .top) {
                    if index > 0 {
                        // Spans from the previous column's centre to this one's, arching above the line of nodes.
                        GeometryReader { proxy in
                            PathwayArch()
                                .stroke(lineColor(after: items[index - 1]), style: lineStyle)
                                .frame(width: proxy.size.width - node, height: node / 2)
                                .offset(x: -proxy.size.width / 2 + node / 2, y: 0)
                        }
                        .frame(height: node / 2)
                        .accessibilityHidden(true)
                    }
                }
            }
        }
    }

    private var lineStyle: StrokeStyle {
        StrokeStyle(lineWidth: stroke.width, lineCap: .round, dash: stroke.dash)
    }

    private func lineColor(after item: Item) -> Color {
        Self.isWalked(from: stage(item)) ? theme.accent : theme.subtle
    }

    @ViewBuilder
    private func row(_ item: Item, index: Int, @ViewBuilder content: () -> some View) -> some View {
        let position = Self.spokenPosition(at: index, rows: items.count, firstNumber: firstNumber, total: total)
        let spoken = Text("\(position), ") + accessibilityName(item)
            + Text(", \(Self.spokenStage(stage(item)))")
        if let action {
            Button { action(item) } label: { content().contentShape(Rectangle()) }
                .buttonStyle(.plain)
                .accessibilityElement(children: .combine)
                .accessibilityLabel(spoken)
        } else {
            content()
                .accessibilityElement(children: .combine)
                .accessibilityLabel(spoken)
        }
    }

    private func nodeView(_ item: Item, index: Int) -> some View {
        let current = stage(item)
        let fill: Color = current == .done ? theme.accent : current == .current ? theme.foreground : theme.surface
        return ZStack {
            if current == .current {
                // A still halo marks the reader's place; it does not pulse.
                Circle().fill(theme.tint).frame(width: node + 12, height: node + 12)
            }
            Circle().fill(fill).frame(width: node, height: node)
            Group {
                if current == .done {
                    icons(.check).font(typography.marker).foregroundStyle(theme.onAccent)
                } else {
                    // The current node inverts: screen colour on the foreground colour.
                    Text("\(Self.stepNumber(at: index, firstNumber: firstNumber))").font(typography.marker).monospacedDigit()
                        .foregroundStyle(current == .current ? AnyShapeStyle(.background) : AnyShapeStyle(theme.foreground))
                }
            }
            .minimumScaleFactor(0.5)
        }
        .frame(width: node + 12, height: node + 12)
        .padding(-6)
        .accessibilityHidden(true)
    }
}

/// An S-curve from one node's centre above to the next node's centre below.
struct PathwayBend: Shape {
    var from: CGFloat
    var to: CGFloat

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let mid = rect.minY + rect.height / 2
        path.move(to: CGPoint(x: rect.minX + from, y: rect.minY))
        path.addCurve(to: CGPoint(x: rect.minX + to, y: rect.maxY),
                      control1: CGPoint(x: rect.minX + from, y: mid),
                      control2: CGPoint(x: rect.minX + to, y: mid))
        return path
    }
}

/// An arch from the bottom left to the bottom right of its frame.
struct PathwayArch: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        path.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addCurve(to: CGPoint(x: rect.maxX, y: rect.maxY),
                      control1: CGPoint(x: rect.minX + rect.width * 0.2, y: rect.minY),
                      control2: CGPoint(x: rect.maxX - rect.width * 0.2, y: rect.minY))
        return path
    }
}
