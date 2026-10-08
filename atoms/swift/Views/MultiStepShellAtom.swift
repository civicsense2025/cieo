import SwiftUI
import Cieo

public struct MultiStepShellAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stepshell", category: "Forms", name: "Multi-step form shell",
        summary: "The chrome and progress bar never move while panels swap in the direction you travel. The shell height springs to each panel. Going back restores what you typed, and the final step morphs into a success terminal.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var dir: CGFloat = 1
    @State private var name = ""
    @State private var email = ""
    @State private var prefill = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Chrome stays fixed; values survive going back") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(alignment: .firstTextBaseline) {
                        Text("Join the briefing").font(.headline)
                        Spacer()
                        Text(step == 2 ? "Done" : "Step \(step + 1) of 2").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    }
                    GeometryReader { g in
                        RoundedRectangle(cornerRadius: 2).fill(.quaternary)
                            .overlay(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 2).fill(Color.accentColor)
                                    .frame(width: g.size.width * CGFloat(step + 1) / 3)
                            }
                    }
                    .frame(height: 4).padding(.top, 8)
                    .animation(reduce ? nil : .motion(.base), value: step)
                    ZStack(alignment: .topLeading) {
                        panel(0) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Name").font(.caption).foregroundStyle(.secondary)
                                TextField("Jordan Ellis", text: $name).textFieldStyle(.roundedBorder).font(.footnote)
                            }
                        }
                        panel(1) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Email").font(.caption).foregroundStyle(.secondary)
                                TextField("you@example.org", text: $email).textFieldStyle(.roundedBorder).font(.footnote)
                            }
                        }
                        panel(2) {
                            VStack(spacing: 2) {
                                Text("✓").font(.title)
                                Text("You are on the list").font(.headline)
                                Text("First briefing lands Friday.").font(.caption).foregroundStyle(.secondary)
                            }.frame(maxWidth: .infinity)
                        }
                    }
                    .padding(.top, 8)
                    .animation(reduce ? nil : .motion(.base), value: step)
                    HStack(spacing: 8) {
                        if step > 0 { Button("Back") { go(step - 1) }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32) }
                        Spacer()
                        if step < 2 { Button(step == 1 ? "Join" : "Continue") { go(step + 1) }.buttonStyle(.borderedProminent).controlSize(.small).frame(minHeight: 32) }
                    }.padding(.top, 10)
                }
                .padding(14)
                .frame(width: 340)
                .background(.quaternary.opacity(0.3), in: RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).fill(step == 2 ? Color.green : .clear).opacity(0.10).allowsHitTesting(false))
                Toggle("Prefill answers", isOn: $prefill).font(.caption).foregroundStyle(.secondary).frame(width: 340)
                    .onChange(of: prefill) { _, on in if on { name = "Jordan Ellis"; email = "you@example.org" } }
            }
        }
    }

    private func panel<I: View>(_ k: Int, @ViewBuilder _ content: () -> I) -> some View {
        ZStack { if k == step { content().id(step) } }
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .transition(reduce ? .identity : .asymmetric(
                insertion: .modifier(active: Part(o: 0, x: 28 * dir), identity: Part(o: 1, x: 0)).animation(.motion(.base).delay(Motion.exit)),
                removal: .modifier(active: Part(o: 0, x: -28 * dir), identity: Part(o: 1, x: 0)).animation(.motionExit)))
    }

    private func go(_ k: Int) {
        dir = k > step ? 1 : -1
        withMotion(.base, reduceMotion: reduce) { step = min(2, max(0, k)) }
    }
}

private struct Part: ViewModifier {
    let o: Double, x: CGFloat
    func body(content: Content) -> some View { content.opacity(o).offset(x: x) }
}
