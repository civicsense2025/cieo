import Combine
import SwiftUI
import Cieo

public struct LogoMarqueeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "logomarquee", category: "Landing", name: "Logo marquee",
        summary: "The logo strip loops seamlessly with faded edges. Hovering eases the speed to a full stop on a soft spring; leaving restores it. Offscreen the offset freezes entirely.")

    private let names = ["Field Notes", "North Studio", "The Ledger", "Loop Press", "Common Room", "Paper Trail"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var paused = false
    @State private var hovering = false
    @State private var x: CGFloat = 0
    @State private var half: CGFloat = 900
    private let timer = Timer.publish(every: 1/60, on: .main, in: .common).autoconnect()
    public init() {}

    private var stopped: Bool { paused || hovering || reduce }

    public var body: some View {
        AtomStage(hint: "Hover slows to a stop") {
            VStack(spacing: 10) {
                Text("Loved by teams everywhere").font(.headline)
                HStack(spacing: 0) { ForEach(0..<2, id: \.self) { copy in
                    HStack(spacing: 0) { ForEach(names, id: \.self) { n in
                        Text(n).font(.subheadline.weight(.semibold)).foregroundStyle(.secondary).padding(.horizontal, 22)
                        Text("·").foregroundStyle(.tertiary)
                    } }
                    .background(copy == 0 ? GeometryReader { g in Color.clear.onAppear { half = g.size.width } } : nil)
                } }
                .offset(x: half > 0 ? -(x.truncatingRemainder(dividingBy: half)) : 0)
                .frame(maxWidth: 340).clipped()
                .mask(LinearGradient(stops: [.init(color: .clear, location: 0), .init(color: .black, location: 0.12), .init(color: .black, location: 0.88), .init(color: .clear, location: 1)], startPoint: .leading, endPoint: .trailing))
                .onHover { hovering = $0 }
                Toggle("Pause strip", isOn: $paused).font(.caption).foregroundStyle(.secondary)
            }.frame(maxWidth: 340)
            .onReceive(timer) { _ in if (!stopped) { x += 1 } }
        }
    }
}
