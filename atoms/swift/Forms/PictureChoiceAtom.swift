import SwiftUI
import Cieo

public struct PictureChoiceAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "picturechoice", category: "Forms", name: "Picture choice",
        summary: "Choosing a card presses it in slightly, inks its border and pops a check badge in the corner. Letter keys pick an option, as in conversational forms.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var sel: Int?
    @State private var pressed: Int?
    private let options: [(name: String, color: Color)] = [("Journal", .primary), ("Portfolio", .accentColor), ("Shop", .secondary), ("Newsletter", .gray)]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Tap, or press A to D") {
            LazyVGrid(columns: [GridItem(.fixed(130), spacing: 10), GridItem(.fixed(130), spacing: 10)], spacing: 10) {
                ForEach(options.indices, id: \.self) { i in
                    let on = sel == i
                    Button { pick(i) } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            RoundedRectangle(cornerRadius: 8).fill(options[i].color).frame(height: 64)
                                .overlay(alignment: .topLeading) {
                                    VStack(alignment: .leading, spacing: 6) {
                                        Capsule().fill(.background).opacity(0.7).frame(width: 40, height: 6)
                                        Capsule().fill(.background).opacity(0.35).frame(width: 80, height: 4)
                                        Capsule().fill(.background).opacity(0.35).frame(width: 64, height: 4)
                                    }
                                    .padding(10)
                                }
                            HStack(spacing: 6) {
                                Text("ABCD".map(String.init)[i]).font(.caption2.weight(.semibold)).padding(.horizontal, 4)
                                    .overlay(RoundedRectangle(cornerRadius: 4).strokeBorder(Color.primary.opacity(0.25)))
                                Text(options[i].name).font(.footnote)
                            }
                            .padding(.horizontal, 2).padding(.bottom, 2)
                        }
                        .padding(6).frame(width: 130)
                        .background(RoundedRectangle(cornerRadius: 12).strokeBorder(on ? Color.primary : Color.primary.opacity(0.2), lineWidth: 2))
                        .overlay(alignment: .topTrailing) {
                            Image(systemName: "checkmark").font(.system(size: 11, weight: .heavy)).foregroundStyle(.background)
                                .frame(width: 22, height: 22).background(Circle().fill(.primary))
                                .scaleEffect(on ? 1 : 0.5).opacity(on ? 1 : 0).offset(x: 8, y: -8)
                                .animation(reduce ? nil : (on ? .motion(.base).delay(0.05) : .motion(.snap)), value: on)
                        }
                        .scaleEffect(pressed == i ? 0.97 : 1)
                        .animation(reduce ? nil : .motion(.snap), value: pressed)
                        .motion(.base, value: on)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(options[i].name).accessibilityAddTraits(on ? .isSelected : [])
                }
            }
            .focusable()
            .onKeyPress(characters: CharacterSet(charactersIn: "abcdABCD")) { press in
                guard let i = "abcd".firstIndex(of: Character(press.characters.lowercased())).map({ "abcd".distance(from: "abcd".startIndex, to: $0) }) else { return .ignored }
                pick(i)
                return .handled
            }
            .accessibilityElement(children: .contain).accessibilityLabel("Pick a starter")
        }
    }

    private func pick(_ i: Int) {
        sel = i
        var t = Transaction()
        t.disablesAnimations = true
        withTransaction(t) { pressed = i }
        DispatchQueue.main.async { pressed = nil }
    }
}
