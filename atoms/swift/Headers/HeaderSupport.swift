import SwiftUI
import Cieo

struct HdrOffsetKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}

/// A scrolling stand-in page that reports how far it has scrolled. The header floats over it, so `top` leaves room for the bar.
struct HdrScroll: View {
    @Binding var offset: CGFloat
    var top: CGFloat = 0
    var hero = false
    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                if hero { AtomPhoto(seed: 5, goldenHour: 1).frame(height: 190 + top).padding(.top, -top) }
                ForEach(0..<9, id: \.self) { _ in RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: 60) }
            }
            .padding(.top, hero ? 0 : top)
            .background(GeometryReader { g in Color.clear.preference(key: HdrOffsetKey.self, value: -g.frame(in: .named("hdr")).minY) })
        }
        .coordinateSpace(name: "hdr")
        .onPreferenceChange(HdrOffsetKey.self) { offset = $0 }
        .accessibilityHidden(true)
    }
}

/// Non-scrolling placeholder page under a header.
struct HdrBlocks: View {
    var body: some View {
        VStack(spacing: 10) { ForEach(0..<3, id: \.self) { _ in RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(height: 54) } }
            .accessibilityHidden(true)
    }
}

struct HdrLogo: View {
    var tagline: String?
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "hexagon.fill").foregroundStyle(Color.accentColor)
            VStack(alignment: .leading, spacing: 0) {
                Text("Studio").font(.callout.weight(.bold))
                if let tagline { Text(tagline).font(.caption2).foregroundStyle(.secondary) }
            }
        }
        .accessibilityElement(children: .combine)
    }
}

let hdrLinks = ["Product", "Pricing", "Docs", "Blog"]

struct HdrButton: View {
    let title: String
    var filled = true
    var body: some View {
        Text(title).font(.caption.weight(.semibold)).padding(.horizontal, 12).padding(.vertical, 6)
            .foregroundStyle(filled ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
            .background(filled ? AnyShapeStyle(Color.accentColor) : AnyShapeStyle(.clear), in: Capsule())
            .accessibilityAddTraits(.isButton)
    }
}
