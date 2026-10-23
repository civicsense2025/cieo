import Cieo
import SwiftUI

/// A rule with a centered accent label that marks where the unread messages begin. The host decides where
/// it sits and how many are unread.
public struct UnreadDivider: View {
    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentMetrics) private var metrics
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var arrived = false
    private let text: String

    /// `label` replaces the wording entirely (other languages, other things than messages); `count` becomes
    /// part of the default wording.
    public init(count: Int? = nil, label: String? = nil) {
        text = Self.unreadDividerLabel(count: count, label: label)
    }

    public var body: some View {
        HStack(spacing: metrics.compact) {
            rule
            Text(text)
                .font(typography.strongDetail)
                .foregroundStyle(theme.accent)
                .lineLimit(1)
                .opacity(arrived ? 1 : Motion.arriveOpacity)
            rule
        }
        .padding(.vertical, metrics.compact)
        .onAppear { withMotion(.base, reduceMotion: reduceMotion) { arrived = true } }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(text)
    }

    private var rule: some View {
        Rectangle().fill(theme.accent).frame(height: metrics.hairline).frame(maxWidth: .infinity)
            .accessibilityHidden(true)
    }

    /// Text for the divider: the host's label when given, else "3 new messages" / "1 new message" for a
    /// count, else "New messages".
    public static func unreadDividerLabel(count: Int? = nil, label: String? = nil) -> String {
        if let custom = label?.trimmingCharacters(in: .whitespacesAndNewlines), !custom.isEmpty { return custom }
        let n = count ?? 0
        if n <= 0 { return "New messages" }
        return "\(n) new \(n == 1 ? "message" : "messages")"
    }
}

#Preview {
    VStack { Text("Earlier"); UnreadDivider(count: 3); Text("Newer") }.padding()
}
