import SwiftUI

/// A person's face in a circle, ringed in a colour that carries meaning (such as party). The photo can be drawn
/// in grayscale by luminosity, which keeps the ring in colour. With no photo it shows a quiet fill, never initials.
/// The host supplies the image view; the portrait is decorative and hidden from VoiceOver, so the name beside it speaks.
public struct Portrait<Photo: View>: View {
    public enum Size: Sendable, CaseIterable { case small, regular, large }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentMetrics) private var metrics
    private let size: Size
    private let ring: Color?
    private let grayscale: Bool
    private let photo: Photo?

    public init(size: Size = .regular, ring: Color? = nil, grayscale: Bool = false, @ViewBuilder photo: () -> Photo) {
        self.size = size; self.ring = ring; self.grayscale = grayscale; self.photo = photo()
    }

    public var body: some View {
        let side = diameter
        ZStack {
            Circle().fill(theme.quietBackground)
            if let photo {
                photo
                    .scaledToFill()
                    .frame(width: side, height: side)
                    .saturation(grayscale ? 0 : 1)
                    .clipShape(Circle())
            }
        }
        .frame(width: side, height: side)
        .overlay {
            if let ring { Circle().strokeBorder(ring, lineWidth: metrics.rail) }
        }
        .accessibilityHidden(true)
    }

    private var diameter: CGFloat {
        switch size {
        case .small: metrics.avatarSmall
        case .regular: metrics.avatar
        case .large: metrics.thumbnail
        }
    }
}

public extension Portrait where Photo == EmptyView {
    /// No photo: the quiet fill, ringed.
    init(size: Size = .regular, ring: Color? = nil) {
        self.size = size; self.ring = ring; self.grayscale = false; self.photo = nil
    }
}
