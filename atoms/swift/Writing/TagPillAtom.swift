import SwiftUI
import Cieo

public struct TagPillAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "tagpill", category: "Writing", name: "Tag pill autocomplete",
        summary: "Typing # filters the list inline: matches spring into their slots while misses blur out. The plate trails the top match, and Enter morphs the word into a pill.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @FocusState private var focused: Bool
    private let tags = ["design", "deadline", "draft", "launch", "research", "press"]
    private let rowH = 32.0
    @State private var text = ""
    @State private var tweak = true
    @State private var pills = ["design"]
    @State private var highlight = 0
    @State private var hiTop = 0.0
    @State private var hiBottom = 32.0
    public init() {}

    private var query: String? {
        guard let r = text.range(of: #"#\w*$"#, options: .regularExpression) else { return nil }
        return String(text[r].dropFirst()).lowercased()
    }
    private var visible: [Int] { tags.indices.filter { tags[$0].lowercased().hasPrefix(query ?? "") } }
    private var panelHeight: Double { Double(max(1, visible.count)) * rowH }

    public var body: some View {
        AtomStage(hint: "Type # to filter tags, Enter makes a pill") {
            ZStack(alignment: .topLeading) {
                VStack(alignment: .leading, spacing: 8) {
                    WritingFlow(spacing: 8, lineSpacing: 6) {
                        ForEach(pills, id: \.self) { p in
                            Text("#" + p).font(.system(size: 14).weight(.semibold))
                                .padding(.horizontal, 10).padding(.vertical, 5)
                                .foregroundStyle(Color.accentColor)
                                .background(Color.accentColor.opacity(0.12), in: Capsule())
                                .transition(.opacity.combined(with: .scale(scale: 0.9, anchor: .leading)))
                        }
                        TextField("Write something, try #de…", text: $text)
                            .textFieldStyle(.plain).focused($focused).font(.system(size: 14))
                            .frame(minWidth: 120)
                            .onKeyPress(.downArrow) { step(1); return .handled }
                            .onKeyPress(.upArrow) { step(-1); return .handled }
                            .onKeyPress(.escape) { focused = false; return .handled }
                            .onSubmit { if query != nil, let i = visible[safe: highlight] { pick(i) } }
                            .accessibilityLabel("Editor line")
                    }
                    .padding(14)
                    .background(.background, in: RoundedRectangle(cornerRadius: 10))
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(.quaternary))
                    .animation(reduce ? nil : .motion(.base), value: pills.count)
                Toggle("Filter on #", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
                }.frame(width: 320)
                if query != nil {
                    menu.offset(y: 120).motionTransition(.presence)
                }
            }
            .frame(width: 320, height: 240, alignment: .topLeading)
        }
        .onChange(of: text) { _, _ in highlight = 0; moveHighlight(0) }
    }

    private var menu: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 7).fill(.quaternary)
                .frame(height: hiBottom - hiTop).padding(.horizontal, 6).offset(y: hiTop)
            ForEach(tags.indices, id: \.self) { i in
                let k = visible.firstIndex(of: i)
                HStack(spacing: 2) {
                    Text("#").foregroundStyle(Color.accentColor)
                    Text(tags[i])
                }
                .font(.subheadline).padding(.horizontal, 10)
                .frame(width: 188, height: rowH, alignment: .leading)
                .contentShape(Rectangle()).offset(y: Double(k ?? i) * rowH)
                .opacity(k == nil ? 0 : 1).blur(radius: k == nil ? 4 : 0)
                .allowsHitTesting(k != nil)
                .onTapGesture { pick(i) }
                .animation(reduce ? nil : .motion(.base), value: k)
                .accessibilityAddTraits(.isButton)
            }
        }
        .frame(width: 200, height: panelHeight, alignment: .top)
        .background(.background, in: RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(.quaternary))
        .clipShape(RoundedRectangle(cornerRadius: 12)).shadow(color: .black.opacity(0.12), radius: 8, y: 3)
        .animation(reduce ? nil : .motion(.base), value: panelHeight)
    }

    private func step(_ d: Int) {
        guard query != nil, !visible.isEmpty else { return }
        highlight = (highlight + (d > 0 ? 1 : visible.count - 1)) % visible.count
        moveHighlight(highlight)
    }

    private func pick(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) { pills.append(tags[i]) }
        text = text.replacingOccurrences(of: #"#\w*$"#, with: "", options: .regularExpression)
        focused = true
    }

    /// The plate's leading edge moves first and its trailing edge follows 60 ms later.
    private func moveHighlight(_ k: Int) {
        let top = Double(k) * rowH, bottom = top + rowH
        guard !reduce else { hiTop = top; hiBottom = bottom; return }
        let down = top >= hiTop
        withAnimation(.motion(.base).delay(down ? Motion.lag : 0)) { hiTop = top }
        withAnimation(.motion(.base).delay(down ? 0 : Motion.lag)) { hiBottom = bottom }
    }
}

private extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}
