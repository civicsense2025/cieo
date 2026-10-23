import SwiftUI

/// One person in a group avatar or a reader list. The host owns the people; a photo appears only when a
/// URL is given, otherwise the initials draw.
public struct GroupAvatarPerson: Identifiable, Equatable, Sendable {
    /// Stable identity. Defaults to the name; give namesakes distinct ids so moves animate correctly.
    public let id: String
    /// Full name, used for the spoken label.
    public let name: String
    /// One to three characters shown when there is no photo.
    public let initials: String
    /// Approved photo URL only. Leave nil when none exists; never guess a photo.
    public let imageURL: URL?

    public init(name: String, initials: String, imageURL: URL? = nil, id: String? = nil) {
        self.id = id ?? name
        self.name = name
        self.initials = initials
        self.imageURL = imageURL
    }
}

/// One round face: a photo when there is one, otherwise initials in the accent on a tint. Shared by
/// GroupAvatar and SeenBy; it fills the frame it is given.
struct PersonFace: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    let person: GroupAvatarPerson

    var body: some View {
        ZStack {
            Circle().fill(theme.tint)
            if let url = person.imageURL {
                AsyncImage(url: url) { phase in
                    if let image = phase.image { image.resizable().scaledToFill() } else { initials }
                }
            } else {
                initials
            }
        }
        .clipShape(Circle())
    }

    private var initials: some View {
        Text(person.initials)
            .font(typography.glyph)
            .foregroundStyle(theme.accent)
            .lineLimit(1)
            .minimumScaleFactor(Self.shrinkLimit)
            .padding(.horizontal, 1) // literal-ok: keeps ink off the circle's edge at the smallest size
    }

    /// Smallest share initials may shrink to before they clip.
    static let shrinkLimit: CGFloat = 0.4 // literal-ok: text-fit limit, not a style
}

/// One circle that stands for a whole conversation: one to four faces packed inside it, or three faces
/// plus a "+n" tile. An empty list draws nothing.
public struct GroupAvatar: View {
    public enum Size: Sendable, CaseIterable { case sm, md, lg }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @ScaledMetric private var small: CGFloat = 32 // literal-ok: avatar footprints are component geometry
    @ScaledMetric private var medium: CGFloat = 44 // literal-ok: avatar footprints are component geometry
    @ScaledMetric private var large: CGFloat = 64 // literal-ok: avatar footprints are component geometry
    private let people: [GroupAvatarPerson]
    private let size: Size

    /// `people` is most relevant first. `size` scales the whole circle with Dynamic Type.
    public init(people: [GroupAvatarPerson], size: Size = .md) {
        self.people = people
        self.size = size
    }

    public var body: some View {
        if !people.isEmpty {
            let layout = Self.groupAvatarLayout(people)
            let slots = Self.slotFrames(count: layout.faces.count + (layout.more > 0 ? 1 : 0))
            ZStack(alignment: .topLeading) {
                Circle().fill(theme.surface)
                ForEach(Array(layout.faces.enumerated()), id: \.offset) { index, person in
                    PersonFace(person: person)
                        .frame(width: slots[index].width * diameter, height: slots[index].height * diameter)
                        .offset(x: slots[index].minX * diameter, y: slots[index].minY * diameter)
                }
                if layout.more > 0, let tile = slots.last {
                    Text("+\(layout.more)")
                        .font(typography.glyph)
                        .foregroundStyle(theme.foreground)
                        .lineLimit(1)
                        .minimumScaleFactor(PersonFace.shrinkLimit)
                        .frame(width: tile.width * diameter, height: tile.height * diameter)
                        .background(theme.track, in: Circle())
                        .offset(x: tile.minX * diameter, y: tile.minY * diameter)
                }
            }
            .frame(width: diameter, height: diameter)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Self.groupAvatarLabel(people.map(\.name)))
            .accessibilityAddTraits(.isImage)
        }
    }

    private var diameter: CGFloat {
        switch size {
        case .sm: small
        case .md: medium
        case .lg: large
        }
    }

    // MARK: - Pure helpers

    /// Names as a short phrase: "Ava", "Ava and Ben", "Ava, Ben and Cy", "Ava, Ben and 3 others". Blank names are ignored.
    public static func listNames(_ names: [String]) -> String {
        let list = names.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
        switch list.count {
        case 0: return ""
        case 1: return list[0]
        case 2: return "\(list[0]) and \(list[1])"
        case 3: return "\(list[0]), \(list[1]) and \(list[2])"
        default: return "\(list[0]), \(list[1]) and \(list.count - 2) others"
        }
    }

    /// Spoken label for the whole group, e.g. "Ava, Ben and 3 others".
    public static func groupAvatarLabel(_ names: [String]) -> String { listNames(names) }

    /// Which faces to draw and how many people hide behind a "+n" tile. Up to four people show as faces;
    /// five or more show three faces plus the tile.
    public static func groupAvatarLayout<T>(_ people: [T]) -> (faces: [T], more: Int) {
        people.count <= 4 ? (people, 0) : (Array(people.prefix(3)), people.count - 3)
    }

    /// Where each face sits, as fractions of the circle's diameter: one fills it, two sit offset on a
    /// diagonal, three form a triangle, four a two-by-two grid. Every face lies inside the circle.
    public static func slotFrames(count: Int) -> [CGRect] {
        func face(_ x: Double, _ y: Double, _ side: Double) -> CGRect { CGRect(x: x, y: y, width: side, height: side) }
        switch count {
        case ...0: return []
        case 1: return [face(0, 0, 1)]
        case 2: return [face(0.065, 0.065, 0.56), face(0.375, 0.375, 0.56)]
        case 3: return [face(0.27, 0.002, 0.46), face(0.038, 0.404, 0.46), face(0.502, 0.404, 0.46)]
        default: return [face(0.105, 0.105, 0.39), face(0.505, 0.105, 0.39), face(0.105, 0.505, 0.39), face(0.505, 0.505, 0.39)]
        }
    }
}

#Preview {
    VStack(spacing: 16) { // literal-ok: preview scaffolding
        ForEach([1, 2, 3, 4, 6], id: \.self) { count in
            GroupAvatar(people: (0..<count).map { GroupAvatarPerson(name: "Person \($0)", initials: "P\($0)") }, size: .lg)
        }
    }
    .padding()
}
