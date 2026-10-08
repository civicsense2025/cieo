import SwiftUI
import Cieo

public struct SelectAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "select", category: "Inputs", name: "Select",
        summary: "The list grows from the trigger. A highlight plate follows hover and arrow keys with lagging edges. Choosing moves the check, closes the list and swaps the trigger label.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var sel = 3
    @State private var hi = 3
    @State private var frames: [AnyHashable: CGRect] = [:]
    private let options: [(name: String, color: Color)] = [
        ("Draft", .gray), ("In review", .orange), ("Scheduled", .accentColor), ("Published", .green), ("Archived", .secondary),
    ]
    public init() {}

    public var body: some View {
        AtomStage {
            ZStack(alignment: .top) {
                if open { Color.clear.contentShape(Rectangle()).onTapGesture { set(false) } }
                trigger
                    .overlay(alignment: .topLeading) {
                        if open {
                            list.offset(y: 44).transition(reduce ? .identity : .basicsPop())
                        }
                    }
            }
            .frame(maxHeight: .infinity, alignment: .top)
        }
    }

    private var trigger: some View {
        Button { set(!open) } label: {
            HStack(spacing: 8) {
                ZStack(alignment: .leading) {
                    dotLabel(sel).id(sel).transition(reduce ? .identity : .basicsSwap())
                }
                .frame(maxWidth: .infinity, alignment: .leading).frame(height: 20)
                Image(systemName: "chevron.down").font(.footnote.weight(.semibold)).foregroundStyle(.secondary)
                    .rotationEffect(.degrees(open ? 180 : 0))
            }
            .padding(.horizontal, 12).frame(width: 220, height: 38)
            .background(RoundedRectangle(cornerRadius: 9).fill(Color.primary.opacity(0.2)).opacity(0.10))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Status")
        .accessibilityValue(options[sel].name)
        .accessibilityHint(open ? "Collapse" : "Expand")
    }

    private func dotLabel(_ i: Int) -> some View {
        HStack(spacing: 8) {
            Circle().fill(options[i].color).frame(width: 8, height: 8)
            Text(options[i].name).font(.callout)
        }
    }

    private var list: some View {
        ZStack(alignment: .topLeading) {
            if let f = frames[hi] {
                BasicsVerticalEdges(frame: f, shape: RoundedRectangle(cornerRadius: 7), style: Color.primary.opacity(0.08))
            }
            VStack(spacing: 0) {
                ForEach(options.indices, id: \.self) { i in
                    Button { choose(i) } label: {
                        HStack(spacing: 8) {
                            dotLabel(i)
                            Spacer(minLength: 0)
                            Image(systemName: "checkmark").font(.footnote.weight(.bold))
                                .opacity(sel == i ? 1 : 0).scaleEffect(sel == i ? 1 : 0.6)
                                .motion(.base, value: sel)
                        }
                        .padding(.horizontal, 10).frame(height: 34)
                        .contentShape(Rectangle())
                        .reportFrame(i, in: "list")
                    }
                    .buttonStyle(.plain)
                    .onHover { if $0 { hi = i } }
                    .accessibilityAddTraits(sel == i ? .isSelected : [])
                }
            }
        }
        .coordinateSpace(name: "list")
        .onPreferenceChange(FramePreferenceKey.self) { frames = $0 }
        .padding(6).frame(width: 220)
        .basicsPanel()
    }

    private func set(_ on: Bool) {
        if on { hi = sel }
        withMotion(on ? .base : .snap, reduceMotion: reduce) { open = on }
    }

    private func choose(_ i: Int) {
        withMotion(.base, reduceMotion: reduce) {
            sel = i
            open = false
        }
    }
}
