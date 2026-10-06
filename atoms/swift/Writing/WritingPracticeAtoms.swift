import SwiftUI
import Cieo

// Mirrors web blocks 172–176: same id/category/name/summary, S presets, reduce = instant.

public struct BinderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "binder", category: "Writing", name: "Manuscript binder",
        summary: "A chapter list with a highlight plate that glides chapter to chapter with a trailing edge, while counts roll and the article springs to its heading.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var chapter = 0
    @State private var counts = [1240, 860, 320]
    private let titles = ["Draft", "Revision", "Polish"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a chapter") {
            HStack(alignment: .top, spacing: 12) {
                VStack(spacing: 2) {
                    ForEach(titles.indices, id: \.self) { i in
                        Button { pick(i) } label: {
                            HStack {
                                Text(titles[i]).font(.callout)
                                Spacer()
                                Text("\(counts[i])").font(.callout).monospacedDigit()
                            }
                            .padding(6)
                            .background(chapter == i ? Color.accentColor.opacity(0.18) : .clear)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        }.buttonStyle(.plain)
                    }
                }.frame(width: 160)
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(titles.indices, id: \.self) { i in
                        Text("\(i + 1). \(titles[i])").font(.headline)
                        Text("Words gather here while the draft finds its shape.").font(.caption)
                    }
                }
            }
            .animation(reduce ? nil : .motion(.base), value: chapter)
            .animation(reduce ? nil : .motion(.base), value: counts)
        }
    }

    private func pick(_ i: Int) {
        if reduce { counts[i] += 40; chapter = i }
        else { counts[i] += 40; withMotion(.base, reduceMotion: reduce) { chapter = i } }
    }
}

public struct CorkboardAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "corkboard", category: "Writing", name: "Corkboard cards",
        summary: "Scene cards follow the pointer one to one while held, spring home with a stagger on release, and the synopsis swaps to the held card.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var selected = 0
    @State private var dragging = -1
    @State private var drag = CGSize.zero
    private let cards = ["Cold open", "Turn", "Button"]
    private let synopses = ["A door sings in an empty house.", "Dust rises; something answers upstairs.", "Mara decides to stay the night."]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Drag a card, release to snap back") {
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    ForEach(cards.indices, id: \.self) { i in
                        Text(cards[i]).font(.callout).padding(10)
                            .background(RoundedRectangle(cornerRadius: 10)
                                .fill(i == selected ? Color.accentColor.opacity(0.25) : Color.gray.opacity(0.15)))
                            .offset(i == dragging ? drag : .zero)
                            .zIndex(i == dragging ? 1 : 0)
                            .animation(dragging == i ? nil : (reduce ? nil : .motion(.base).delay(0.04 * Double(i))), value: drag)
                            .gesture(DragGesture()
                                .onChanged { d in dragging = i; selected = i; drag = d.translation }
                                .onEnded { _ in dragging = -1; drag = .zero })
                    }
                }
                Text(synopses[selected]).font(.caption)
                    .opacity(1)
                    .animation(reduce ? nil : .motion(.base), value: selected)
            }
        }
    }
}

public struct FocusLineAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "focusline", category: "Writing", name: "Focus sentence",
        summary: "One sentence carries full ink while the rest sink dim on the same soft spring, and the caret retargets mid-flight.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var caret = 1
    private let lines = ["The house had been empty for years.", "Mara pushed the door and it sang.",
                         "Dust stood up in the light.", "Somewhere upstairs, a floorboard answered."]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Move the caret") {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(lines.indices, id: \.self) { i in
                    Text(lines[i]).font(.body)
                        .opacity(i == caret ? 1 : 0.35)
                        .onTapGesture { go(i) }
                }
                .animation(reduce ? nil : .motion(.soft), value: caret)
                HStack {
                    Button("Prev") { go(caret - 1) }.buttonStyle(.bordered)
                    Button("Next") { go(caret + 1) }.buttonStyle(.bordered)
                }
            }.frame(maxWidth: 300, alignment: .leading)
        }
    }

    private func go(_ i: Int) {
        let v = (i + lines.count) % lines.count
        if reduce { caret = v } else { withMotion(.soft, reduceMotion: reduce) { caret = v } }
    }
}

public struct TypewriterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "typewriter", category: "Writing", name: "Typewriter lock",
        summary: "The caret stays pinned mid-screen while the paper glides beneath it, until the lock switch lets the caret walk instead.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var line = 0
    @State private var lock = true
    private let lineH: CGFloat = 26
    private let lines = ["The draft keeps going.", "The paper slides along.", "The caret holds still.",
                         "Each line finds center.", "The story takes shape.", "The end comes closer."]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Caret pinned mid-screen, paper moves") {
            VStack(spacing: 8) {
                ZStack(alignment: .topLeading) {
                    RoundedRectangle(cornerRadius: 6).fill(Color.gray.opacity(0.2))
                        .frame(height: 24)
                        .offset(y: lock ? 63 : CGFloat(line) * lineH)
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(lines.indices, id: \.self) { i in
                            Text("Line \(i + 1) — \(lines[i])").font(.callout)
                                .frame(height: lineH, alignment: .leading)
                        }
                    }
                    .offset(y: lock ? 63 - CGFloat(line) * lineH : 0)
                }
                .frame(height: 150, alignment: .top).clipped()
                .animation(reduce ? nil : .motion(.soft), value: line)
                .animation(reduce ? nil : .motion(.soft), value: lock)
                HStack {
                    Button("Prev") { go(line - 1) }.buttonStyle(.bordered)
                    Button("Next") { go(line + 1) }.buttonStyle(.bordered)
                    Toggle("Lock", isOn: $lock).toggleStyle(.switch)
                }
            }
        }
    }

    private func go(_ i: Int) {
        let v = (i + lines.count) % lines.count
        if reduce { line = v } else { withMotion(.soft, reduceMotion: reduce) { line = v } }
    }
}

public struct GoalRingAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "goalring", category: "Writing", name: "Goal ring",
        summary: "A ring and its count climb to the daily target on a lazy spring, then snap-pulse and swap to Done, with Reset to start over.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var words = 0
    private let goal = 500
    public init() {}
    private var done: Bool { words >= goal }

    public var body: some View {
        AtomStage(hint: "500 words a day") {
            VStack(spacing: 8) {
                HStack(spacing: 12) {
                    ZStack {
                        Circle().stroke(Color.gray.opacity(0.25), lineWidth: 8)
                        Circle().trim(from: 0, to: CGFloat(words) / CGFloat(goal))
                            .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                    }
                    .frame(width: 76, height: 76)
                    .scaleEffect(done ? 1.1 : 1)
                    .animation(reduce ? nil : .motion(.lazy), value: words)
                    .animation(reduce ? nil : .motion(.snap), value: done)
                    ZStack {
                        Text("\(words)").font(.title3).monospacedDigit().opacity(done ? 0 : 1)
                        Text("Done ✓").font(.headline).opacity(done ? 1 : 0)
                    }
                    .frame(width: 96)
                    .animation(reduce ? nil : .motion(.base), value: done)
                }
                HStack {
                    Button("Write +125") {
                        if reduce { words = min(goal, words + 125) }
                        else { withMotion(.lazy, reduceMotion: reduce) { words = min(goal, words + 125) } }
                    }.buttonStyle(.borderedProminent).disabled(done)
                    Button("Reset") {
                        if reduce { words = 0 }
                        else { withMotion(.base, reduceMotion: reduce) { words = 0 } }
                    }.buttonStyle(.bordered)
                }
            }
        }
    }
}
