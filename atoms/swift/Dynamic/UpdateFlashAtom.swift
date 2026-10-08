import SwiftUI
import Cieo

public struct UpdateFlashAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "updateflash", category: "Dynamic", name: "Update flash",
        summary: "A fresh cell gets a soft tint wash that fades on the lazy spring while its value swaps underneath. Rows keep fixed height, so nothing ever moves.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let data = [("MRR", ["$48.2k", "$48.9k", "$49.4k"]),
                        ("Active", ["1,204", "1,318", "1,402"]),
                        ("Churn", ["2.1%", "1.9%", "1.7%"])]
    @State private var step = 0
    @State private var flash = -1
    @State private var wash = true
    public init() {}

    public var body: some View {
        AtomStage(hint: "Fresh cells wash, then settle") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Metrics").font(.headline)
                VStack(spacing: 0) {
                    ForEach(data.indices, id: \.self) { i in
                        HStack {
                            Text(data[i].0).font(.subheadline)
                            Spacer()
                            Text(data[i].1[min(step == i ? 1 : (step > i ? 2 : 0), 2)])
                                .font(.subheadline.weight(.semibold)).monospacedDigit()
                                .opacity(flash == i ? 0.2 : 1)
                                .background(RoundedRectangle(cornerRadius: 8)
                                    .fill(Color.accentColor.opacity(flash == i && wash ? 0.22 : 0)))
                        }
                        .frame(minHeight: 40)
                        .animation(reduce ? nil : .motion(.lazy), value: flash)
                        if i < data.count - 1 { Divider() }
                    }
                }
                Text(step >= data.count ? "All caught up ✓ · settled" : "Press push · the row never moves")
                    .font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button(step >= data.count ? "Replay" : "Push update") {
                        if step >= data.count { step = 0; flash = -1 }
                        else {
                            flash = step; step += 1
                            if !reduce {
                                let done = step
                                Task { @MainActor in
                                    try? await Task.sleep(for: .seconds(0.35))
                                    if flash == done - 1 { flash = -1 }
                                }
                            } else { flash = -1 }
                        }
                    }
                    .buttonStyle(.bordered).controlSize(.regular)
                    Spacer()
                    Toggle("tint wash", isOn: $wash).font(.caption).foregroundStyle(.secondary)
                        .nativeToggleStyle()
                }
            }
            .frame(maxWidth: 400)
        }
    }
}
