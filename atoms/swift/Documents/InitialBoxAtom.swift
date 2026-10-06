import SwiftUI
import Cieo

public struct InitialBoxAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "initialbox", category: "Documents", name: "Initial box",
        summary: "Adopt-and-stamp swaps in your initials and snaps from ninety-seven percent. The initialed terminal holds until cleared.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var initials = "MK"
    @State private var stamped = false
    @State private var scale = 1.0
    public init() {}

    public var body: some View {
        AtomStage(hint: "Adopt — the stamp snaps in at 97%") {
            VStack(spacing: 8) {
                VStack(spacing: 10) {
                    Text("Initial here").font(.headline)
                    ZStack {
                        RoundedRectangle(cornerRadius: 10).strokeBorder(style: StrokeStyle(lineWidth: 1.5, dash: [6])).foregroundStyle(.secondary)
                        ZStack {
                            if stamped { Text(initials.uppercased()).font(.system(size: 26).italic()).foregroundStyle(Color.accentColor).id(initials).motionTransition(.swap()).rotationEffect(.degrees(-4)).scaleEffect(scale) }
                            else { Text("MK").font(.caption).foregroundStyle(.secondary) }
                        }
                    }
                    .frame(width: 120, height: 76)
                    HStack(spacing: 8) {
                        TextField("Initials", text: $initials).multilineTextAlignment(.center).textFieldStyle(.roundedBorder).frame(width: 76, height: 32)
                        Button(stamped ? "Clear" : "Adopt & stamp") {
                            if stamped { withMotion(.base, reduceMotion: reduce) { stamped = false } }
                            else {
                                withMotion(.base, reduceMotion: reduce) { stamped = true }
                                scale = 0.97
                                withMotion(.snap, reduceMotion: reduce) { scale = 1.0 }
                            }
                        }.frame(minHeight: 32)
                    }.buttonStyle(.bordered)
                    ZStack {
                        if stamped { Text("Initialed — page 4 of 4 ✓").foregroundStyle(.green).motionTransition(.swap()) }
                    }
                    .font(.caption).frame(maxWidth: .infinity, minHeight: 22)
                }
                .padding(16).frame(maxWidth: 320)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("Blue ink stamp", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
