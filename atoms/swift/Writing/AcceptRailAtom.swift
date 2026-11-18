import SwiftUI
import Cieo

public struct AcceptRailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "acceptrail", category: "Writing", name: "Tracked-changes rail",
        summary: "Accepting fades a row over 100ms then collapses its height while the count rolls.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var live = [true, true, true]
    @State private var armed: Int?
    @State private var tweak = true
    private let texts = ["early \u{2192} first-day", "shop \u{2192} store", "soon \u{2192} Thursday"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Accept clears each row") {
            VStack(spacing: 8) {
                HStack {
                    Text("Accepted **\(live.filter { !$0 }.count)**").font(.subheadline)
                    Spacer()
                    if live.allSatisfy({ !$0 }) {
                        Button("Reset") { withMotion(.base, reduceMotion: reduce) { live = [true, true, true]; armed = nil } }.buttonStyle(.bordered).frame(minHeight: 32)
                    } else {
                        Button("Accept all") { acceptAll() }.buttonStyle(.bordered).frame(minHeight: 32)
                    }
                }
                VStack(spacing: 8) {
                    ForEach(texts.indices, id: \.self) { i in
                        if live[i] {
                            HStack {
                                Text(texts[i]).font(.system(size: 14))
                                Spacer()
                                Button(tweak && armed == i ? "Confirm?" : "Accept") { tapAccept(i) }
                                    .buttonStyle(.bordered).tint(tweak && armed == i ? .accentColor : nil).frame(minHeight: 32)
                            }
                                .padding(14).background(.quaternary).clipShape(RoundedRectangle(cornerRadius: 10))
                                .transition(.opacity.combined(with: .move(edge: .top)))
                        }
                    }
                }.animation(reduce ? nil : .motion(.base), value: live)
                Toggle("Confirm on accept", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
                    .onChange(of: tweak) { _, on in if !on { armed = nil } }
            }.frame(maxWidth: 320)
        }
    }

    private func tapAccept(_ i: Int) {
        if tweak && armed != i {
            withMotion(.snap, reduceMotion: reduce) { armed = i }
        } else {
            armed = nil
            accept(i)
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
