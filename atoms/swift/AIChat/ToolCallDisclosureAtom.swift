import SwiftUI
import Cieo

public struct ToolCallDisclosureAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tooldisclose", category: "AI chat", name: "Tool-call disclosure",
        summary: "The row expands on a soft spring while each step trails in. Its spinner swaps to a check on done, and the caption settles on a success terminal.")

    private enum StepState { case idle, working, done }
    private let titles = ["Scan 48 files", "Open pricing.tsx", "Quote the yearly total"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var states: [StepState] = [.idle, .idle, .idle]
    @State private var running = false
    @State private var verbose = true
    @State private var runID = 0
    public init() {}

    private var progress: Double {
        Double(states.filter { $0 == .done }.count) / Double(titles.count)
    }

    public var body: some View {
        AtomStage(hint: "Run, then watch each step check off") {
            VStack(alignment: .leading, spacing: 0) {
                Text("Find the pricing page").font(.system(size: 15, weight: .semibold))
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass").font(.system(size: 14))
                        .frame(width: 32, height: 32)
                        .background(RoundedRectangle(cornerRadius: 9).fill(Color.secondary.opacity(0.18)))
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Search files").font(.system(size: 13))
                        SwapText(running ? "Working…" : (progress >= 1 ? "Done in 1.2 s" : "Idle"))
                            .font(.caption).foregroundStyle(progress >= 1 ? .green : .secondary)
                    }
                    Spacer()
                    Button("Run") { run() }.buttonStyle(.borderedProminent).controlSize(.small).disabled(running)
                }
                .padding(.vertical, 10)
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2).fill(Color.secondary.opacity(0.2))
                        RoundedRectangle(cornerRadius: 2).fill(Color.primary)
                            .frame(width: geo.size.width * progress)
                            .motion(.base, value: progress)
                    }
                }
                .frame(height: 3)
                if verbose {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(titles.indices, id: \.self) { i in
                            HStack(spacing: 8) {
                                status(i).frame(width: 20, height: 20)
                                Text(titles[i]).font(.system(size: 13))
                            }
                            .padding(.vertical, 8)
                            if i < titles.count - 1 { Divider() }
                        }
                    }
                    .motionTransition(.presence)
                }
                Toggle("Verbose steps", isOn: $verbose).font(.caption).foregroundStyle(.secondary)
                    .padding(.top, 10)
            }
            .frame(width: 300)
            .animation(reduce ? nil : .motion(.soft), value: verbose)
        }
    }

    @ViewBuilder
    private func status(_ i: Int) -> some View {
        switch states[i] {
        case .idle: Circle().strokeBorder(.quaternary).motionTransition(.swap())
        case .working:
            Group {
                if reduce { Circle().fill(.secondary).motionTransition(.swap()) }
                else { ProgressView().controlSize(.mini).motionTransition(.swap()) }
            }
        case .done:
            Image(systemName: "checkmark").font(.system(size: 13, weight: .bold)).foregroundStyle(.green)
                .motionTransition(.swap())
        }
    }

    private func run() {
        guard !running else { return }
        running = true
        states = [.idle, .idle, .idle]
        runID += 1
        let id = runID
        Task {
            for i in titles.indices {
                guard id == runID else { return }
                if reduce { states[i] = .done }
                else {
                    withMotion(.base, reduceMotion: reduce) { states[i] = .working }
                    try? await Task.sleep(for: .seconds(0.45))
                    guard id == runID else { return }
                    withMotion(.base, reduceMotion: reduce) { states[i] = .done }
                }
            }
            if id == runID { running = false }
        }
    }
}
