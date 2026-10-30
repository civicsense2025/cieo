import SwiftUI

/// How an avatar turns a photo URL into a view. The default uses `AsyncImage`; a host with its own image
/// pipeline (a cache, a verified-image check) installs one loader at the root with `avatarImageLoader`
/// and every Avatar, GroupAvatar and SeenBy uses it. The loader shows `fallback` (the initials) until a
/// photo is ready and whenever one fails, and should fill the frame it is given.
public struct AvatarImageLoader {
    private let make: @MainActor (URL, AnyView) -> AnyView

    public init<Photo: View>(@ViewBuilder _ make: @escaping @MainActor (_ url: URL, _ fallback: AnyView) -> Photo) {
        self.make = { AnyView(make($0, $1)) }
    }

    @MainActor
    public func callAsFunction(_ url: URL, fallback: AnyView) -> AnyView {
        make(url, fallback)
    }

    /// Loads with `AsyncImage`, filling and cropping the circle; the initials stay while loading or on failure.
    public static let system = AvatarImageLoader { url, fallback in
        AsyncImage(url: url) { phase in
            if let image = phase.image { image.resizable().scaledToFill() } else { fallback }
        }
    }
}

public extension EnvironmentValues {
    @Entry var avatarImageLoader = AvatarImageLoader.system
}

/// One person's round face: a photo when the host gives an approved URL, otherwise initials in the
/// accent on a tint. VoiceOver reads the person's name once, as an image. Twin of the web `Avatar`.
public struct Avatar: View {
    /// `sm` and `md` read `avatarSmall` and `avatar` from `componentMetrics` and grow with Dynamic Type,
    /// up to twice their size. `points` is an exact diameter that does not scale, for a host that sizes
    /// the face itself.
    public enum Size: Sendable, Equatable {
        case sm, md
        case points(CGFloat)
    }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.avatarImageLoader) private var loader
    @ScaledMetric private var textScale: CGFloat = 1
    private let name: String
    private let initials: String
    private let imageURL: URL?
    private let size: Size

    /// `initials` defaults to the first letters of the first and last words of `name`. Pass `imageURL`
    /// only for an approved photo; never guess one.
    public init(name: String, initials: String? = nil, imageURL: URL? = nil, size: Size = .md) {
        self.name = name
        let given = initials?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        self.initials = given.isEmpty ? Self.initials(from: name) : given
        self.imageURL = imageURL
        self.size = size
    }

    public init(_ person: GroupAvatarPerson, size: Size = .md) {
        self.init(name: person.name, initials: person.initials, imageURL: person.imageURL, size: size)
    }

    public var body: some View {
        let side = Self.diameter(size, metrics: metrics, textScale: textScale)
        ZStack {
            Circle().fill(theme.tint)
            if let imageURL {
                loader(imageURL, fallback: AnyView(initialsView))
            } else {
                initialsView
            }
        }
        .frame(width: side, height: side)
        .clipShape(Circle())
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text(verbatim: name))
        .accessibilityAddTraits(.isImage)
        .accessibilityHidden(Self.isDecorative(name: name))
    }

    private var initialsView: some View {
        Text(verbatim: initials)
            .font(typography.glyph)
            .foregroundStyle(theme.accent)
            .lineLimit(1)
            .minimumScaleFactor(Self.shrinkLimit)
            .padding(.horizontal, 1) // literal-ok: keeps ink off the circle's edge at the smallest size
    }

    // MARK: - Pure helpers

    /// Smallest share initials may shrink to before they clip.
    static let shrinkLimit: CGFloat = 0.4 // literal-ok: text-fit limit, not a style

    /// Largest Dynamic Type growth for the metric sizes, so a face never crowds out its row.
    public static let maximumTextScale: CGFloat = 2

    /// The face's diameter. Metric sizes grow with text up to `maximumTextScale` and never shrink;
    /// an explicit size is used as given, with nonfinite or negative values drawing nothing.
    public static func diameter(_ size: Size, metrics: ComponentMetrics, textScale: CGFloat = 1) -> CGFloat {
        let scale = textScale.isFinite ? min(maximumTextScale, max(1, textScale)) : 1
        switch size {
        case .sm: return metrics.avatarSmall * scale
        case .md: return metrics.avatar * scale
        case .points(let side): return side.isFinite ? max(0, side) : 0
        }
    }

    /// Up to two uppercase letters: the first of the first word and the first of the last word.
    /// "Earl Warren" is "EW", "Cher" is "C", and a blank name gives "".
    public static func initials(from name: String) -> String {
        let words = name.split(whereSeparator: { $0.isWhitespace || $0.isNewline })
        guard let first = words.first?.first else { return "" }
        guard words.count > 1, let last = words.last?.first else { return String(first).uppercased() }
        return (String(first) + String(last)).uppercased()
    }

    /// A face with no name has nothing to say, so VoiceOver skips it.
    public static func isDecorative(name: String) -> Bool {
        name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
}
