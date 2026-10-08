import SwiftUI
import Cieo

public struct LongAnswerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "longanswer", category: "Forms", name: "Long answer",
        summary: "The box grows a line at a time on a spring instead of jumping. The counter turns warning at 90% of the limit and danger past it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var text = ""
    @State private var height: CGFloat?
    @FocusState private var focused: Bool
    private let limit = 140
    public init() {}

    private var counter: Color { text.count > limit ? .red : text.count >= limit * 9 / 10 ? .orange : Color.secondary.opacity(0.7) }

    public var body: some View {
        AtomStage {
            VStack(alignment: .leading, spacing: 6) {
                Text("What should we improve?").font(.footnote.weight(.medium))
                TextField("Start typing…", text: $text, axis: .vertical)
                    .textFieldStyle(.plain).font(.callout).focused($focused)
                    .padding(.horizontal, 11).padding(.vertical, 9)
                    .frame(height: height, alignment: .top)
                    .background(RoundedRectangle(cornerRadius: 10).fill(focused ? Color.primary : Color.primary.opacity(0.2)).opacity(0.10))
                    .background {
                        Text(text + "\u{200B}").font(.callout).padding(.horizontal, 11).padding(.vertical, 9)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .fixedSize(horizontal: false, vertical: true)
                            .basicsReportHeight(0).hidden().accessibilityHidden(true)
                    }
                    .onPreferenceChange(BasicsHeightKey.self) { h in
                        withAnimation(reduce || height == nil ? nil : .motion(.base)) { height = h[0] }
                    }
                    .accessibilityLabel("What should we improve?")
                HStack {
                    Spacer()
                    Text("\(text.count) / \(limit)").font(.footnote.monospacedDigit()).foregroundStyle(counter)
                        .motion(.base, value: text.count > limit)
                }
            }
            .frame(maxWidth: 320)
        }
    }
}
