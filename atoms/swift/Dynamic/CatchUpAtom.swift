import SwiftUI
import Cieo

public struct CatchUpAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "catchup", category: "Dynamic", name: "Catch-up burst",
        summary: "Reconnect ticks the backlog on in one fast stagger wave: digits roll together, rows flash once, and the pill settles back to live.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let names = ["Orders", "Revenue", "Refunds"]
    @State private var values = [1204, 48310, 37]
    @State private var live = true
    @State private var wave = false
    @State private var applying = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Reconnect applies the backlog in one fast wave") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Sync").font(.headline)
                    Spacer()
                    Text(live ? "Live · caught up" : applying ? "Syncing…" : "Offline · 5 waiting")
                        .font(.caption.weight(.semibold))
                }
                VStack(spacing: 0) {
                    ForEach(names.indices, id: \.self) { i in
                        HStack {
                            Text(names[i]).font(.subheadline)
                            Spacer()
                            RollingDigits(values[i]).font(.subheadline.weight(.semibold)).monospacedDigit()
                        }
                        .frame(minHeight: 38)
                        .transition(.opacity)
                        if i < names.count - 1 { Divider() }
                    }
                }
                Text(live ? "Connected · everything applied" : applying ? "Applying the backlog…" : "Dropped · holding until reconnect")
                    .font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button("Simulate drop") { live = false }
                        .buttonStyle(.bordered).controlSize(.regular).disabled(!live)
                    Button("Reconnect") { reconnect() }
                        .buttonStyle(.borderedProminent).controlSize(.regular).disabled(live)
                    Spacer()
                    Toggle("stagger wave", isOn: $wave).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.checkbox)
                }
            }
            .frame(maxWidth: 420)
        }
        .onAppear { wave = true }
    }

    private func reconnect() {
        guard !live else { return }
        applying = true
        let steps = [7, 13, 5, 19, 11]
        for (j, s) in steps.enumerated() {
            let delay = (wave && !reduce) ? Double(j) * 0.06 : 0
            Task { @MainActor in
                try? await Task.sleep(for: .seconds(delay))
                for i in values.indices { values[i] += s + i * 3 }
                if j == steps.count - 1 { live = true; applying = false }
            }
        }
    }
}
