import SwiftUI
import Cieo

public struct HolyGrailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "holygrail", category: "Layout", name: "Holy-grail reorder",
        summary: "Going narrow stacks both sidebars below the article with slot springs. Focus follows the visual order.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var narrow = false
    @State private var followFocus = true
    @FocusState private var articleFocused: Bool
    public init() {}

    public var body: some View {
        AtomStage(hint: "Go narrow, then tab through in visual order") {
            VStack(spacing: 8) {
                Text("Holy-grail reorder").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text(narrow ? "Stacked · focus in article" : "Three columns")
                    .font(.caption).foregroundStyle(.secondary)
                    .transition(.motionSwap()).id(narrow)
                Group {
                    if narrow {
                        VStack(spacing: 8) { articlePane; navPane; asidePane }
                    } else {
                        HStack(spacing: 8) { navPane; articlePane; asidePane }
                    }
                }
                .frame(maxWidth: 560)
                .animation(reduce ? nil : .motion(.base), value: narrow)
                HStack(spacing: 8) {
                    Button("Narrow") { setNarrow(true) }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Button("Wide") { setNarrow(false) }.buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                    Toggle("Move focus", isOn: $followFocus).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
        }
    }

    private func setNarrow(_ v: Bool) {
        narrow = v
        if v && followFocus && !reduce {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.32) { articleFocused = true }
        } else if v && followFocus {
            articleFocused = true
        }
    }

    private var navPane: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Index").font(.footnote.weight(.medium))
            Text("Chapters\nNotes").font(.caption).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14).padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
    }

    private var articlePane: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Article").font(.footnote.weight(.medium))
            Text("The layout reorders itself and focus follows, so keyboard order matches what you see.")
                .font(.caption).foregroundStyle(.secondary).lineSpacing(3)
        }
        .padding(.horizontal, 14).padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
        .focused($articleFocused)
        .accessibilityLabel("Article")
    }

    private var asidePane: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Aside").font(.footnote.weight(.medium))
            Text("About\nShare").font(.caption).foregroundStyle(.secondary)
        }
        .padding(.horizontal, 14).padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
    }
}
