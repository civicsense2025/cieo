import SwiftUI

/// A corner of a rectangle, named by reading direction so shapes mirror in right-to-left layouts.
public enum CutCorner: Sendable, Hashable, CaseIterable {
    case topLeading, topTrailing, bottomLeading, bottomTrailing
}

/// Geometric cuts for photos and colour blocks: arches, circles, quarter circles and pills.
/// Curves meet the frame's edges, so the cut always fills its frame without clipping or stretching.
public struct CutShape: Shape {
    public enum Kind: Sendable, Hashable {
        /// Round top, square bottom.
        case arch
        /// Square top, round bottom.
        case invertedArch
        /// An ellipse filling the frame; a circle in a square frame.
        case circle
        /// A quarter ellipse whose round side faces the named corner.
        case quarter(CutCorner)
        /// Round leading end, square trailing end.
        case leadingPill
        case square

        public static let allCases: [Kind] = [.arch, .invertedArch, .circle, .leadingPill, .square]
            + CutCorner.allCases.map(Kind.quarter)
    }

    public var kind: Kind

    public init(_ kind: Kind) {
        self.kind = kind
    }

    public var layoutDirectionBehavior: LayoutDirectionBehavior { .mirrors }

    public func path(in rect: CGRect) -> Path {
        let w = rect.width, h = rect.height
        guard w > 0, h > 0, w.isFinite, h.isFinite else { return Path() }
        switch kind {
        case .arch:
            let r = min(w / 2, h)
            return UnevenRoundedRectangle(topLeadingRadius: r, topTrailingRadius: r, style: .circular).path(in: rect)
        case .invertedArch:
            let r = min(w / 2, h)
            return UnevenRoundedRectangle(bottomLeadingRadius: r, bottomTrailingRadius: r, style: .circular).path(in: rect)
        case .circle:
            return Path(ellipseIn: rect)
        case .leadingPill:
            let r = min(h / 2, w)
            return UnevenRoundedRectangle(topLeadingRadius: r, bottomLeadingRadius: r, style: .circular).path(in: rect)
        case .square:
            return Path(rect)
        case let .quarter(corner):
            // The ellipse is centred on the opposite corner, so its arc runs through the named one.
            let left = corner == .topLeading || corner == .bottomLeading
            let top = corner == .topLeading || corner == .topTrailing
            let oval = CGRect(x: rect.minX - (left ? 0 : w), y: rect.minY - (top ? 0 : h), width: 2 * w, height: 2 * h)
            return Path(ellipseIn: oval).intersection(Path(rect))
        }
    }
}
