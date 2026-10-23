import Cieo
import SwiftUI

/// Tiny overlapping faces of the people who have read a message, with a "+n" for the rest. The host owns
/// who has read; a new reader slides in.
public struct SeenBy: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @ScaledMetric private var face: CGFloat = 26 // literal-ok: face diameter is component geometry
    private let people: [GroupAvatarPerson]
    private let maxFaces: Int

    /// `people` are the readers, oldest first. Faces beyond `max` (default 3) collapse into "+n".
    public init(people: [GroupAvatarPerson], max: Int = 3) {
        self.people = people
        maxFaces = max
    }

    public var body: some View {
        if !people.isEmpty {
            let split = Self.layout(count: people.count, max: maxFaces)
            HStack(spacing: -face / 6) { // literal-ok: overlap is a share of the face
                ForEach(people.prefix(split.shown)) { person in
                    PersonFace(person: person)
                        .frame(width: face, height: face)
                        .overlay(Circle().strokeBorder(theme.track, lineWidth: metrics.hairline))
                        .transition(.scale.combined(with: .opacity))
                }
                if split.rest > 0 {
                    Text("+\(split.rest)")
                        .font(typography.glyph)
                        .foregroundStyle(theme.foreground)
                        .lineLimit(1)
                        .minimumScaleFactor(PersonFace.shrinkLimit)
                        .frame(width: face, height: face)
                        .background(theme.track, in: Circle())
                }
            }
            .motion(.base, value: people.map(\.id) + ["\(split.rest)"])
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(Self.seenByLabel(people.map(\.name)))
        }
    }

    // MARK: - Pure helpers

    /// Spoken line for readers: "Seen by Ava", "Seen by Ava and Ben", "Seen by Ava, Ben and 2 others".
    /// Empty for nobody.
    public static func seenByLabel(_ names: [String]) -> String {
        let who = GroupAvatar.listNames(names)
        return who.isEmpty ? "" : "Seen by \(who)"
    }

    /// How many faces show and how many hide behind "+n". The limit is at least 1.
    public static func layout(count: Int, max: Int = 3) -> (shown: Int, rest: Int) {
        let limit = Swift.max(1, max)
        let shown = Swift.min(Swift.max(0, count), limit)
        return (shown, Swift.max(0, count) - shown)
    }
}

#Preview {
    SeenBy(people: ["Ava", "Ben", "Cy", "Di", "Ed"].map { GroupAvatarPerson(name: $0, initials: String($0.prefix(1))) }).padding()
}
