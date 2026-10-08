import Cieo
import CieoUI
import SwiftUI

struct MotionExamples: View {
    @State private var end = false
    @State private var highlight = 0.0

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text("Feel the difference").font(.largeTitle.bold())
            Text("One tap. Three spring speeds.").foregroundStyle(.secondary)
            Specimen(title: "Spring playground") {
                track("Snap", preset: .snap)
                track("Base", preset: .base)
                track("Soft", preset: .soft)
                ActionButton("Replay springs") { end.toggle() }
            }
            Specimen(title: "Metal highlight") {
                ZStack {
                    HighlightSurface(progress: highlight)
                    Label("Light follows your touch", systemImage: "sparkles")
                        .font(.title3.bold()).padding(24)
                }
                .frame(height: 130)
                .clipShape(.rect(cornerRadius: 16))
                Slider(value: $highlight).accessibilityLabel("Highlight position")
                Button("Sweep highlight") { highlight = highlight < 0.5 ? 1 : 0 }
                    .buttonStyle(ActionButtonStyle(.quiet))
            }
        }
    }

    private func track(_ title: String, preset: SpringPreset) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.subheadline.weight(.medium))
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule().fill(.quaternary)
                    Circle().fill(.tint).frame(width: 36, height: 36)
                        .overlay { Image(systemName: "arrow.right").foregroundStyle(.white).accessibilityHidden(true) }
                        .offset(x: end ? max(0, geometry.size.width - 36) : 0)
                        .motionAnimation(preset, value: end)
                }
            }
            .frame(height: 36)
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(Text("\(title) spring"))
        .accessibilityValue(end ? "End" : "Start")
        .accessibilityIdentifier("motion.\(title.lowercased())")
    }
}
