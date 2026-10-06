import SwiftUI
import Cieo

public struct AttachStripAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "attachstrip", category: "Email", name: "Attachment strip",
        summary: "Rail thumbs fan in with a 30ms stagger on base. Tapping one grows the preview radius on a spring, and the overflow count rolls as the set drains.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var selected = 0
    @State private var left = 2
    @State private var compress = true
    @State private var appeared = false
    public init() {}
    private let files = [("Deck", "PDF"), ("Shot 1", "JPG"), ("Shot 2", "JPG"), ("Board", "PDF")]

    public var body: some View {
        AtomStage(hint: "Tap a thumb to preview") {
            VStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Launch assets").font(.callout.weight(.semibold))
                    Text("4 files · tap to preview").font(.caption).foregroundStyle(.secondary)
                    HStack(spacing: 10) {
                        Text(files[selected].1)
                            .font(.caption2.weight(.semibold))
                            .frame(width: 36, height: 36)
                            .background(RoundedRectangle(cornerRadius: 6).fill(Color.primary.opacity(0.08)))
                        SwapText("\(files[selected].0) · \(files[selected].1)").font(.caption)
                    }
                    .padding(8)
                    .background(RoundedRectangle(cornerRadius: 10 + CGFloat(selected * 4)).fill(Color.primary.opacity(0.06)))
                    .cornerRadius(10 + CGFloat(selected * 4))
                    .animation(reduce ? nil : .motion(.base), value: selected)
                    HStack(spacing: 8) {
                        ForEach(files.indices, id: \.self) { i in
                            Button(files[i].1) {
                                withMotion(.base, reduceMotion: reduce) { selected = i }
                            }
                            .buttonStyle(.plain)
                            .font(.caption2.weight(.semibold))
                            .frame(width: 44, height: 44)
                            .background(RoundedRectangle(cornerRadius: 10).fill(Color.accentColor.opacity(selected == i ? 0.3 : 0.12)))
                            .overlay(RoundedRectangle(cornerRadius: 10).stroke(selected == i ? Color.primary : Color.secondary.opacity(0.4), lineWidth: selected == i ? 2 : 1))
                            .opacity(appeared ? 1 : 0.45)
                            .offset(y: appeared ? 0 : 10)
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.03), value: appeared)
                            .accessibilityLabel("Preview \(files[i].0)")
                        }
                        Button {
                            withMotion(.base, reduceMotion: reduce) { if left > 0 { left -= 1 } }
                        } label: {
                            HStack(spacing: 2) { Text("+"); RollingDigits(left) }
                                .font(.caption).frame(minWidth: 44, minHeight: 44)
                        }
                        .buttonStyle(.plain)
                        .overlay(RoundedRectangle(cornerRadius: 10).stroke(style: StrokeStyle(lineWidth: 1, dash: [4])))
                        .foregroundStyle(Color.secondary)
                        .opacity(left > 0 ? 1 : 0)
                        .disabled(left == 0)
                    }
                }
                .padding(14).frame(width: 300)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                Toggle("Compress images", isOn: $compress)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
        .onAppear { appeared = true }
    }
}
