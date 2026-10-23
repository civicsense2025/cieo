import Cieo
import SwiftUI

/// Where one sent message is on its way: a small glyph that changes as it progresses, plus a spoken word.
/// The host owns the status and the time.
public struct DeliveryStatus: View {
    public enum State: Sendable, CaseIterable { case sending, sent, delivered, read, failed }

    @Environment(\.componentTheme) private var theme
    @Environment(\.componentTypography) private var typography
    @Environment(\.componentIcons) private var icons
    @Environment(\.componentMetrics) private var metrics
    private let status: State
    private let time: String?

    /// `time` is optional text beside the glyph (for example "9:41 AM"); it is read after the status.
    public init(_ status: State, time: String? = nil) {
        self.status = status
        self.time = time
    }

    public var body: some View {
        HStack(spacing: metrics.tight) {
            InlineGlyph(font: typography.detail) { icons(Self.icon(status)) }
                .id(status)
                .transition(.opacity)
            if status == .failed {
                Text("Not delivered").font(typography.detail)
            }
            if let time {
                Text(time).font(typography.detail).foregroundStyle(theme.secondary)
            }
        }
        .font(typography.detail)
        .foregroundStyle(color)
        .motion(.base, value: status)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Self.spokenLabel(status, time: time))
        .onChange(of: status) { _, new in
            // Only a failure interrupts; a busy thread should not chatter.
            if new == .failed { AccessibilityNotification.Announcement(Self.deliveryLabel(new)).post() }
        }
    }

    private var color: Color {
        switch status {
        case .read: theme.accent
        case .failed: theme.danger
        default: theme.secondary
        }
    }

    /// The glyph slot a state draws.
    static func icon(_ status: State) -> ComponentIcon {
        switch status {
        case .sending: .sending
        case .sent: .check
        case .delivered: .delivered
        case .read: .read
        case .failed: .error
        }
    }

    // MARK: - Pure helpers

    /// Word for a delivery state, read aloud and shown for failures.
    public static func deliveryLabel(_ status: State) -> String {
        switch status {
        case .sending: "Sending"
        case .sent: "Sent"
        case .delivered: "Delivered"
        case .read: "Read"
        case .failed: "Not delivered"
        }
    }

    /// "Delivered, 9:41 AM" when a time is given, else just the word.
    public static func spokenLabel(_ status: State, time: String?) -> String {
        let label = deliveryLabel(status)
        guard let time, !time.isEmpty else { return label }
        return "\(label), \(time)"
    }
}

#Preview {
    VStack(alignment: .trailing) {
        ForEach(DeliveryStatus.State.allCases, id: \.self) { DeliveryStatus($0, time: "9:41 AM") }
    }.padding()
}
