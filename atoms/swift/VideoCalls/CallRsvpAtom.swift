import SwiftUI
import Cieo

public struct CallRsvpAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "rsvp", category: "Forms", name: "Call RSVP",
        summary: "The plate slides behind your pick with its trailing edge 60 ms late, and the headcount rolls its digits. Your answer swaps in a terminal you can change.")

    private let options = ["Going", "Maybe", "Can't"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Namespace private var plate
    @State private var mine = -1
    @State private var counts = [9, 3, 1]
    @State private var showCounts = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a response to join the list") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Team offsite — are you in?").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text("Sat, Jun 14 · Golden Gate Park.").font(.system(size: 12)).foregroundStyle(.secondary)
                HStack(spacing: 6) {
                    ForEach(0..<options.count, id: \.self) { i in
                        Button(options[i]) {
                            withMotion(.base, reduceMotion: reduce) {
                                if mine != i {
                                    if mine >= 0 { counts[mine] -= 1 }
                                    counts[i] += 1; mine = i
                                }
                            }
                        }
                        .font(.system(size: 13.5, weight: mine == i ? .semibold : .regular))
                        .frame(maxWidth: .infinity, minHeight: 36)
                        .background {
                            if mine == i {
                                RoundedRectangle(cornerRadius: 10).fill(Color.accentColor.opacity(0.15))
                                    .matchedGeometryEffect(id: "plate", in: plate)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
                .animation(reduce ? nil : .motion(.base).delay(Motion.lag), value: mine)
                if showCounts {
                    HStack(spacing: 4) {
                        RollingDigits(String(format: "%2d", counts[0])).font(.system(size: 13))
                        Text("going").font(.system(size: 12)).foregroundStyle(.secondary)
                        Spacer()
                        Text("\(counts[0]) · \(counts[1]) · \(counts[2])")
                            .font(.system(size: 12)).foregroundStyle(.secondary)
                    }
                    .motionTransition(.presence)
                }
                SwapText(terminal).font(.system(size: 13, weight: mine >= 0 && mine < 2 ? .semibold : .regular))
                    .foregroundColor(mine == 2 ? Color.secondary : Color.green)
                    .frame(minHeight: 30, alignment: .leading)
                HStack {
                    Toggle("Show counts", isOn: $showCounts)
                        .font(.system(size: 12)).foregroundStyle(.secondary)
                    Spacer()
                    Button("Change") {
                        withMotion(.base, reduceMotion: reduce) { mine = -1 }
                    }
                    .buttonStyle(.bordered).controlSize(.small)
                }
            }
            .padding(14)
        }
    }

    private var terminal: String {
        switch mine {
        case 0: return "✓ You are on the list"
        case 1: return "✓ Maybe — we will hold a spot"
        case 2: return "∅ No worries — next time"
        default: return "Pick one to RSVP"
        }
    }
}
