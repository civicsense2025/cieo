import SwiftUI
import Cieo

public struct PreviewTextAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "previewtext", category: "Newsletter", name: "Preview-text editor",
        summary: "Typing past the client cut truncates the preview where phones and desktops stop. The length bar snaps between success, warning and danger.")

    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var text = "Rivers, routes and five slow mornings inside"
    @State private var desktop = false
    public init() {}

    private var limit: Int { desktop ? 140 : 78 }
    private var over: Bool { text.count > limit }
    private var warn: Bool { !over && text.count > Int(Double(limit) * 0.8) }
    private var barColor: Color { over ? .red : warn ? .orange : .green }

    public var body: some View {
        AtomStage(hint: "Type past the cut") {
            VStack(alignment: .leading, spacing: 8) {
                Text("Preview text").font(.callout.weight(.semibold))
                Text("Kept inside what clients show.").font(.caption).foregroundStyle(.secondary)
                HStack(spacing: 0) {
                    ForEach([false, true], id: \.self) { d in
                        Button(d ? "Desktop" : "Phone") { withMotion(.base, reduceMotion: reduce) { desktop = d } }
                            .buttonStyle(.plain).font(.footnote.weight(.medium))
                            .padding(.horizontal, 12).padding(.vertical, 8)
                            .background(desktop == d ? Color.primary.opacity(0.1) : Color.clear, in: RoundedRectangle(cornerRadius: 7))
                    }
                }
                .padding(3).background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 10))
                TextField("Preview text", text: $text)
                    .textFieldStyle(.plain).padding(.horizontal, 12).frame(height: 44)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 10))
                GeometryReader { geo in
                    Capsule().fill(barColor)
                        .frame(width: geo.size.width * min(1, CGFloat(text.count) / CGFloat(limit)))
                        .animation(reduce ? nil : .motion(.snap), value: text.count)
                }.frame(height: 6).background(.quaternary, in: Capsule())
                ZStack(alignment: .leading) {
                    Group {
                        if desktop {
                            preview(limit: 140).id(1)
                        } else {
                            preview(limit: 78).id(0)
                        }
                    }
                    .motionTransition(.swap())
                    .animation(reduce ? nil : .motion(.base), value: desktop)
                }
                .padding(12).frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                .overlay(RoundedRectangle(cornerRadius: 10).fill(over ? Color.red : Color.primary.opacity(0.2)).opacity(0.10).allowsHitTesting(false))
                HStack {
                    Text("\(text.count) / \(limit)").font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    Spacer()
                    Text("cut at \(limit)").font(.caption).foregroundStyle(.secondary)
                }
            }
            .padding(16).frame(width: 340)
            .background(.background, in: RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
        }
    }

    private func preview(limit: Int) -> some View {
        (Text(String(text.prefix(limit))).font(.footnote)
        + Text(text.count > limit ? " ▍" + String(text.suffix(text.count - limit)) : "").font(.footnote).foregroundStyle(.secondary.opacity(0.5)))
    }
}
