import SwiftUI
import Cieo

public struct ViewChromeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "viewchrome", category: "Documents", name: "Viewer chrome",
        summary: "The toolbar and counter fade out when idle and spring back on touch. The page counter rolls digits; the last page holds a caught-up terminal.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var page = 1
    @State private var chrome = 1.0
    @State private var idle: Task<Void, Never>?
    private let total = 4
    private let pages = ["§1 Parties agree to the spring delivery schedule.", "§2 The market bell marks the opening of trade.", "§3 Attention is paid in full on receipt.", "§4 Care survives termination of this agreement."]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap › a few times, then stop moving") {
            VStack(spacing: 8) {
                HStack(spacing: 8) {
                    Button("‹", action: { go(-1) }).frame(minHeight: 32)
                    Text("\(page)").fontWeight(.semibold).monospacedDigit()
                    Text("/ \(total) · Contract.pdf").font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Button("›", action: { go(1) }).frame(minHeight: 32)
                }
                .font(.callout).opacity(chrome).offset(y: (1 - chrome) * -8)
                ZStack(alignment: .leading) {
                    ForEach(0..<pages.count, id: \.self) { i in
                        if i == page - 1 { Text(pages[i]).motionTransition(.swap()) }
                    }
                }
                .font(.callout).lineSpacing(6).frame(maxWidth: .infinity, minHeight: 72, alignment: .leading).opacity(0.35 + 0.65 * chrome)
                ZStack(alignment: .leading) {
                    if page == total { Text("Caught up — nothing left to read ✓").foregroundStyle(.green).motionTransition(.swap()) }
                }
                .font(.caption).frame(maxWidth: .infinity, minHeight: 22, alignment: .leading)
                Toggle("Hide chrome after 2s idle", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
            .padding(16).frame(maxWidth: 360)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
        .onDisappear { idle?.cancel() }
    }

    private func go(_ d: Int) {
        withMotion(.base, reduceMotion: reduce) {
            page = min(total, max(1, page + d)); chrome = 1.0
        }
        arm()
    }

    private func arm() {
        idle?.cancel()
        idle = Task {
            try? await Task.sleep(for: .seconds(2))
            if Task.isCancelled { return }
            withMotion(.base, reduceMotion: reduce) { chrome = 0 }
        }
    }
}
