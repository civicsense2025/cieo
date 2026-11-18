import SwiftUI
import Cieo

public struct BinderAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "binder", category: "Writing", name: "Manuscript binder",
        summary: "A chapter list with a highlight plate that glides chapter to chapter with a trailing edge, while counts roll and the article springs to its heading.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var chapter = 0
    @State private var counts = [1240, 860, 320]
    @State private var tweak = true
    private let titles = ["Draft", "Revision", "Polish"]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Pick a chapter") {
            VStack(spacing: 8) {
                HStack(alignment: .top, spacing: 16) {
                    VStack(spacing: 8) {
                        ForEach(titles.indices, id: \.self) { i in
                            Button { pick(i) } label: {
                                HStack {
                                    Text(titles[i]).font(.system(size: 14))
                                    Spacer()
                                    if tweak {
                                        Text("\(counts[i])").font(.system(size: 14)).monospacedDigit()
                                    }
                                }
                                .padding(8)
                                .background(chapter == i ? Color.accentColor.opacity(0.18) : .clear)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            }.buttonStyle(.plain).frame(minHeight: 32)
                        }
                    }.frame(width: 160)
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(titles.indices, id: \.self) { i in
                            VStack(alignment: .leading, spacing: 2) {
                                Text("\(i + 1). \(titles[i])").font(.system(size: 15, weight: .semibold))
                                Text("Words gather here while the draft finds its shape.").font(.system(size: 12.5))
                            }
                            .opacity(chapter == i ? 1 : 0.45)
                        }
                    }
                }
                Toggle("Show counts", isOn: $tweak)
                    .font(.system(size: 12.5)).foregroundStyle(.secondary)
                    .frame(maxWidth: 200)
            }
            .animation(reduce ? nil : .motion(.base), value: chapter)
            .animation(reduce ? nil : .motion(.base), value: counts)
            .animation(reduce ? nil : .motion(.base), value: tweak)
        }
    }

    private func pick(_ i: Int) {
        if reduce { counts[i] += 40; chapter = i }
        else { counts[i] += 40; withMotion(.base, reduceMotion: reduce) { chapter = i } }
    }
}
