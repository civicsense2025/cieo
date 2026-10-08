import SwiftUI
import Cieo

public struct SlotFillingFormAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "slotfill", category: "Forms", name: "Slot-filling form",
        summary: "Missing slots stack compact while the first open one offers picks. Each answer inks a check and collapses, and the progress edge trails to a booked terminal.")

    private struct Slot {
        let label: String
        let options: [String]
    }
    private let defs = [Slot(label: "Date", options: ["Tue", "Wed"]), Slot(label: "Time", options: ["2 pm", "4 pm"]), Slot(label: "Size", options: ["2", "4 people"])]

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var answers: [String?] = [nil, nil, nil]
    @State private var compact = true
    public init() {}

    private var done: Int { answers.compactMap { $0 }.count }
    private var firstOpen: Int? { answers.firstIndex(where: { $0 == nil }) }

    public var body: some View {
        AtomStage(hint: "Fill each slot to book the room") {
            VStack(alignment: .leading, spacing: 0) {
                Text("Book a room").font(.system(size: 15, weight: .semibold))
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2).fill(Color.secondary.opacity(0.2))
                        RoundedRectangle(cornerRadius: 2).fill(Color.primary)
                            .frame(width: geo.size.width * Double(done) / 3)
                            .motion(.base, value: done)
                    }
                }
                .frame(height: 3)
                .padding(.vertical, 8)
                SwapText("\(done) of 3").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                ForEach(defs.indices, id: \.self) { i in
                    slotRow(i)
                    if i < defs.count - 1 { Divider() }
                }
                if done == 3 {
                    SwapText("Booked · \(answers.compactMap { $0 }.joined(separator: " "))")
                        .font(.system(size: 13, weight: .medium)).foregroundStyle(.green)
                        .padding(.top, 8)
                        .motionTransition(.swap())
                }
                HStack {
                    Toggle("Compact done rows", isOn: $compact).font(.caption).foregroundStyle(.secondary)
                    Spacer()
                    Button("Reset") {
                        withMotion(.base, reduceMotion: reduce) { answers = [nil, nil, nil] }
                    }.buttonStyle(.bordered).controlSize(.small)
                }
                .padding(.top, 8)
            }
            .frame(width: 300)
            .animation(reduce ? nil : .motion(.soft), value: done)
        }
    }

    private func slotRow(_ i: Int) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                if answers[i] != nil {
                    Image(systemName: "checkmark").font(.system(size: 13, weight: .bold)).foregroundStyle(.green)
                        .motionTransition(.swap())
                }
                Text(defs[i].label).font(.system(size: 13, weight: .semibold))
                if let a = answers[i] {
                    Text(a).font(.system(size: 13))
                } else if firstOpen != i {
                    Text("Waiting…").font(.caption).foregroundStyle(.secondary)
                }
            }
            .padding(.top, 10)
            if answers[i] == nil && firstOpen == i {
                HStack(spacing: 6) {
                    ForEach(defs[i].options, id: \.self) { opt in
                        Button(opt) {
                            withMotion(.base, reduceMotion: reduce) { answers[i] = opt }
                        }.buttonStyle(.bordered).controlSize(.small)
                    }
                }
                .motionTransition(.presence)
            } else if answers[i] != nil && !compact {
                HStack(spacing: 6) {
                    ForEach(defs[i].options, id: \.self) { opt in
                        Text(opt).font(.caption).foregroundStyle(.secondary)
                            .padding(.horizontal, 10).frame(height: 28)
                            .background(RoundedRectangle(cornerRadius: 9).fill(.quaternary).opacity(0.10))
                    }
                }
                .motionTransition(.presence)
            }
        }
        .padding(.bottom, 10)
    }
}
