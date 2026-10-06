import SwiftUI
import Cieo

public struct AcceptRailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "acceptrail", category: "Writing", name: "Tracked-changes rail",
        summary: "Accepting fades a row over 100ms then collapses its height while the count rolls.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var live = [true, true, true]
    private let texts = ["early \u{2192} first-day", "shop \u{2192} store", "soon \u{2192} Thursday"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Accept clears each row") {
            VStack(spacing: 10) {
                HStack { Text("Accepted **\(live.filter { !$0 }.count)**").font(.subheadline); Spacer(); Button("Accept all") { acceptAll() }.buttonStyle(.bordered) }
                VStack(spacing: 6) {
                    ForEach(texts.indices, id: \.self) { i in
                        if live[i] {
                            HStack { Text(texts[i]).font(.callout); Spacer(); Button("Accept") { accept(i) }.buttonStyle(.bordered) }
                                .padding(8).background(.quaternary).clipShape(RoundedRectangle(cornerRadius: 8))
                                .transition(.opacity.combined(with: .move(edge: .top)))
                        }
                    }
                }.animation(reduce ? nil : .motion(.base), value: live)
            }.frame(maxWidth: 320)
        }
    }

    private func accept(_ i: Int) {
        guard live[i] else { return }
        if reduce { live[i] = false; return }
        withAnimation(.motion(.snap)) { live[i] = false }
    }
    private func acceptAll() {
        for i in live.indices { DispatchQueue.main.asyncAfter(deadline: .now() + (reduce ? 0 : 0.06 * Double(i))) { accept(i) } }
    }
}
