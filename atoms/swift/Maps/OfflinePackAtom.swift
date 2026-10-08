import SwiftUI
import Cieo

public struct OfflinePackAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "offlinepack", category: "Maps", name: "Offline pack",
        summary: "The ring fills while the percent rolls with it. At 100 the label swaps to a check and tiles fade in top-down.")

    @State private var progress = 0.0
    @State private var done = false
    @State private var wifi = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap Download, watch it finish") {
            VStack(spacing: 8) {
                ZStack {
                    Circle().stroke(.secondary.opacity(0.2), lineWidth: 10).frame(width: 104, height: 104)
                    Circle().trim(from: 0, to: progress / 100).stroke(.primary, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .frame(width: 104, height: 104).rotationEffect(.degrees(-90))
                        .animation(reduce ? nil : .motion(.base), value: progress)
                    if done {
                        Text("✓").font(.title3).foregroundStyle(.green).motionTransition(.swap())
                    } else {
                        RollingDigits("\(Int(progress))%").font(.callout.weight(.semibold))
                    }
                }
                .offset(y: done ? 0 : 7)
                .animation(reduce ? nil : .motion(.soft), value: done)
                Text("City pack · 184 MB").font(.callout.weight(.semibold)).lineSpacing(4)
                SwapText(done ? "Saved for offline" : "Getting streets…", drift: 4)
                    .font(.subheadline).foregroundStyle(.secondary)
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 4), spacing: 6) {
                    ForEach(0..<8, id: \.self) { i in
                        RoundedRectangle(cornerRadius: 7).fill(.secondary.opacity(0.2)).frame(height: 34)
                            .opacity(done || progress > Double(i) * 12.5 ? 1 : 0.25)
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.08), value: progress)
                    }
                }
                HStack(spacing: 8) {
                    Button(done ? "Saved" : "Download") {
                        if reduce { progress = 100; done = true }
                        else { progress = 0; done = false; start() }
                    }
                    .buttonStyle(.borderedProminent).controlSize(.small).frame(maxWidth: .infinity)
                    .disabled(progress > 0 && !done)
                    Toggle("Wi-Fi only", isOn: $wifi).labelsHidden().controlSize(.mini)
                        .accessibilityLabel("Wi-Fi only")
                }
            }
            .padding(14).frame(maxWidth: 340)
            .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 4, y: 1))
        }
    }

    private func start() {
        Timer.scheduledTimer(withTimeInterval: 0.12, repeats: true) { t in
            progress = min(100, progress + 5)
            if progress >= 100 { t.invalidate(); withAnimation(.motion(.soft)) { done = true } }
        }
    }
}
