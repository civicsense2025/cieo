import SwiftUI

/// A reference read as data: a section number ("Endangered Species Act §1302") or a page count ("4/18").
/// Set in the `reference` role (monospaced by default) and the secondary colour. Never a label or heading.
public struct ReferenceText: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    private let text: Text
    private let spoken: Text?

    /// `spoken` replaces the visible text for VoiceOver, such as "Page 4 of 18" for "4/18".
    public init(_ text: Text, spoken: Text? = nil) { self.text = text; self.spoken = spoken }
    @_disfavoredOverload
    public init<S: StringProtocol>(_ text: S, spoken: Text? = nil) { self.init(Text(text), spoken: spoken) }

    /// A page count, read as "Page 4 of 18".
    public static func page(_ number: Int, of total: Int) -> ReferenceText {
        let (n, t) = pageBounds(number, total)
        return ReferenceText(Text(verbatim: "\(n)/\(t)"), spoken: Text("Page \(n) of \(t)"))
    }

    /// Keeps a page count truthful: at least page 1, never past the total.
    public static func pageBounds(_ number: Int, _ total: Int) -> (Int, Int) {
        let t = max(1, total)
        return (min(max(1, number), t), t)
    }

    public var body: some View {
        text
            .font(typography.reference)
            .monospacedDigit()
            .foregroundStyle(theme.secondary)
            .accessibilityLabel(spoken ?? text)
    }
}
