import SwiftUI
import MotionKit

public struct OneQuestionAtATimeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "conversational", category: "Forms", name: "One question at a time",
        summary: "Each answer moves the question up and out while the next rises from below. Choices take letter keys and confirm with a short pulse before advancing. Enter submits text, and the progress bar fills per answer.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var name = ""
    @State private var empty = false
    @State private var chosen: Int?
    @State private var drawn = false
    @FocusState private var focused: Bool
    private let choices: [[String]] = [[], ["Starter", "Studio", "Business"], ["Yes", "No"]]
    private let titles = ["First, what’s your name?", "Which plan fits your team?", "Need help migrating content?"]
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 0) {
                ZStack(alignment: .leading) {
                    pane.id(step).motionTransition(.swap(drift: 24))
                }
                .frame(maxWidth: 560).frame(height: 230)
                Capsule().fill(Color.primary.opacity(0.08)).frame(height: 3)
                    .overlay(alignment: .leading) {
                        GeometryReader { g in Capsule().fill(.primary).frame(width: g.size.width * CGFloat(step) / 3) }
                    }
                    .motion(.base, value: step)
                    .frame(maxWidth: 560)
            }
            .onKeyPress(characters: CharacterSet(charactersIn: "abcABC")) { press in
                guard step == 1 || step == 2, focused == false, let j = "abc".firstIndex(of: Character(press.characters.lowercased())).map({ "abc".distance(from: "abc".startIndex, to: $0) }), j < choices[step].count else { return .ignored }
                choose(j)
                return .handled
            }
        }
    }

    @ViewBuilder private var pane: some View {
        VStack(alignment: .leading, spacing: 14) {
            if step < 3 { Text("\(step + 1) →").font(.footnote).foregroundStyle(.secondary) }
            if step == 0 {
                Text(titles[0]).font(.title2.weight(.semibold))
                TextField("Type your answer here…", text: $name).textFieldStyle(.plain).font(.title3).focused($focused)
                    .padding(.vertical, 6).onSubmit(submit)
                    .overlay(alignment: .bottom) { Rectangle().fill(empty ? Color.red : Color.primary.opacity(0.2)).frame(height: 2) }
                    .motion(.base, value: empty)
                    .onChange(of: name) { _, v in if !v.trimmingCharacters(in: .whitespaces).isEmpty { empty = false } }
                    .onAppear { focused = true }
                HStack(spacing: 10) {
                    Button("OK", action: submit).buttonStyle(.borderedProminent)
                    Text("press Enter ↵").font(.footnote).foregroundStyle(.secondary)
                    Text("Please fill this in").font(.footnote).foregroundStyle(.red).opacity(empty ? 1 : 0).motion(.base, value: empty)
                }
            } else if step < 3 {
                Text(titles[step]).font(.title2.weight(.semibold))
                VStack(spacing: 6) {
                    ForEach(choices[step].indices, id: \.self) { j in
                        Button { choose(j) } label: {
                            HStack(spacing: 10) {
                                Text("ABC".map(String.init)[j]).font(.caption2.weight(.semibold)).padding(.horizontal, 5)
                                    .overlay(RoundedRectangle(cornerRadius: 4).strokeBorder(Color.primary.opacity(0.25)))
                                Text(choices[step][j]).font(.callout)
                                Spacer(minLength: 0)
                            }
                            .padding(.horizontal, 10).padding(.vertical, 7).frame(maxWidth: 260)
                            .background(RoundedRectangle(cornerRadius: 9).fill(Color.primary.opacity(chosen == j ? 0.12 : 0)))
                            .overlay(RoundedRectangle(cornerRadius: 9).strokeBorder(chosen == j ? Color.primary : Color.primary.opacity(0.2), lineWidth: 1.5))
                            .motion(.snap, value: chosen)
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                    }
                }
            } else {
                HStack(spacing: 12) {
                    ZStack {
                        Circle().strokeBorder(Color.green, lineWidth: 2.25)
                        Check().trim(from: 0, to: drawn ? 1 : 0).stroke(Color.green, style: StrokeStyle(lineWidth: 2.25, lineCap: .round, lineJoin: .round))
                    }
                    .frame(width: 34, height: 34).animation(reduce ? nil : .motion(.soft).delay(0.2), value: drawn)
                    Text("Thanks, \(name.split(separator: " ").first.map(String.init) ?? "")."
                        ).font(.title2.weight(.semibold))
                }
                Text("We’ll email your migration checklist shortly.").font(.footnote).foregroundStyle(.secondary)
                Button("Start again") { name = ""; chosen = nil; drawn = false; go(0) }.buttonStyle(.bordered)
            }
        }
        .padding(.horizontal, 8).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    }

    private struct Check: Shape {
        func path(in r: CGRect) -> Path {
            var p = Path()
            p.move(to: CGPoint(x: r.width * 0.31, y: r.height * 0.52))
            p.addLine(to: CGPoint(x: r.width * 0.44, y: r.height * 0.65))
            p.addLine(to: CGPoint(x: r.width * 0.69, y: r.height * 0.375))
            return p
        }
    }

    private func go(_ i: Int) {
        chosen = nil
        withMotion(.base, reduceMotion: reduce) { step = i }
        if i == 3 { DispatchQueue.main.async { drawn = true } }
        if i == 0 { focused = true }
    }

    private func submit() {
        guard !name.trimmingCharacters(in: .whitespaces).isEmpty else { empty = true; return }
        name = name.trimmingCharacters(in: .whitespaces)
        go(1)
    }

    private func choose(_ j: Int) {
        guard chosen == nil else { return }
        chosen = j
        let next = step + 1
        Task {
            try? await Task.sleep(for: .seconds(0.45))
            go(next)
        }
    }
}
