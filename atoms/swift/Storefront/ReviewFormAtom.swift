import SwiftUI
import Cieo

public struct ReviewFormAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "reviewform", category: "Storefront", name: "Review form",
        summary: "Photo tiles open their height first and sharpen after. Faces glide with the mood and the label swaps; posting morphs a held thanks.")
    private let moods = ["Rough", "Okay", "Fine", "Good", "Loved it"]
    private let faces = ["face.smiling.inverse", "face.smiling", "face.smiling", "face.smiling", "heart.circle"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var photos: Set<Int> = [0, 1]
    @State private var mood = 3
    @State private var posted = false
    public init() {}
    public var body: some View {
        AtomStage(hint: "Add photos, slide mood, then post") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Write a review").font(.callout.weight(.semibold))
                HStack(spacing: 6) { ForEach(0..<3, id: \.self) { i in
                    Button { withMotion(.base, reduceMotion: reduce) { if photos.contains(i) { photos.remove(i) } else { photos.insert(i) } } } label: {
                        ZStack { if photos.contains(i) { RoundedRectangle(cornerRadius: 12).fill(.quaternary).overlay(Text("◍").font(.title3)) } else { RoundedRectangle(cornerRadius: 12).fill(Color.secondary).opacity(0.10).allowsHitTesting(false).overlay(Image(systemName: "plus").foregroundStyle(.secondary)) } }
                        .frame(height: 64).frame(maxWidth: .infinity)
                    }.buttonStyle(.plain).accessibilityLabel("Photo \(i + 1)")
                } }
                HStack(spacing: 4) { ForEach(moods.indices, id: \.self) { i in
                    Button { withMotion(.soft, reduceMotion: reduce) { mood = i } } label: {
                        Text(["😞", "🙁", "😐", "🙂", "😍"][i]).font(.title3)
                            .opacity(mood == i ? 1 : 0.55).scaleEffect(mood == i ? 1.1 : 1)
                            .frame(width: 36, height: 36)
                    }.buttonStyle(.plain).accessibilityLabel(moods[i])
                } }.motion(.soft, value: mood)
                SwapText(moods[mood]).font(.caption).foregroundStyle(.secondary)
                HStack {
                    Button(posted ? "Thanks — posted" : "Post review") { withMotion(.base, reduceMotion: reduce) { posted = true } }
                        .buttonStyle(.borderedProminent).controlSize(.small).disabled(posted).tint(posted ? .green : .accentColor)
                    Toggle("Photos", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
                }
            }.frame(maxWidth: 320)
        }
    }
}
