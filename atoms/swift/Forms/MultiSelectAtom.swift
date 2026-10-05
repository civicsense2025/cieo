import SwiftUI
import Cieo

public struct MultiSelectAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "multiselect", category: "Forms", name: "Multi-select",
        summary: "Ticking an option adds a chip to the trigger, which opens its width before its text appears. Unticking reverses it. The list stays open so you can pick several.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var picked: Set<Int> = []
    private let options = ["Design", "Engineering", "Marketing", "Sales", "Support"]
    public init() {}

    public var body: some View {
        AtomStage {
            ZStack(alignment: .top) {
                if open { Color.clear.contentShape(Rectangle()).onTapGesture { setOpen(false) } }
                trigger
                    .overlay(alignment: .topLeading) {
                        if open { list.alignmentGuide(.top) { $0[.top] - 48 }.transition(reduce ? .identity : .basicsPop()) }
                    }
            }
            .frame(maxHeight: .infinity, alignment: .top)
        }
    }

    private var trigger: some View {
        Button { setOpen(!open) } label: {
            BasicsLeadingFlow {
                ForEach(options.indices, id: \.self) { i in Chip(title: options[i], on: picked.contains(i)) }
                Text("Pick teams").font(.footnote).foregroundStyle(.secondary).padding(.leading, 4)
                    .opacity(picked.isEmpty ? 1 : 0).motion(.base, value: picked.isEmpty)
            }
            .padding(.leading, 8).padding(.trailing, 32).padding(.vertical, 6)
            .frame(width: 280, alignment: .leading).frame(minHeight: 42)
            .background(RoundedRectangle(cornerRadius: 10).strokeBorder(Color.primary.opacity(0.2), lineWidth: 1.5))
            .overlay(alignment: .topTrailing) { Image(systemName: "chevron.down").font(.footnote.weight(.semibold)).foregroundStyle(.secondary).padding(.top, 14).padding(.trailing, 10) }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Teams").accessibilityValue(picked.isEmpty ? "None" : picked.sorted().map { options[$0] }.joined(separator: ", "))
    }

    private var list: some View {
        VStack(spacing: 0) {
            ForEach(options.indices, id: \.self) { i in
                let on = picked.contains(i)
                Button { toggle(i) } label: {
                    HStack(spacing: 10) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 4).fill(on ? Color.primary : Color.clear)
                            RoundedRectangle(cornerRadius: 4).strokeBorder(on ? Color.primary : Color.primary.opacity(0.25), lineWidth: 1.5)
                            Image(systemName: "checkmark").font(.system(size: 9, weight: .heavy)).foregroundStyle(.background).opacity(on ? 1 : 0)
                        }
                        .frame(width: 16, height: 16).motion(.base, value: on)
                        Text(options[i]).font(.callout)
                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, 10).padding(.vertical, 7).contentShape(Rectangle())
                }
                .buttonStyle(.plain).accessibilityAddTraits(on ? .isSelected : [])
            }
        }
        .padding(6).frame(width: 280).basicsPanel()
    }

    private func toggle(_ i: Int) {
        if picked.contains(i) { picked.remove(i) } else { picked.insert(i) }
    }

    private func setOpen(_ on: Bool) { withMotion(on ? .base : .snap, reduceMotion: reduce) { open = on } }

    /// Opens its width first, then the text fades in; closing fades the text and then closes the gap.
    private struct Chip: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let title: String
        let on: Bool
        @State private var natural: CGFloat = 0
        var body: some View {
            Text(title).font(.caption.weight(.medium)).padding(.horizontal, 10).fixedSize()
                .opacity(on ? 1 : 0)
                .animation(reduce ? nil : (on ? .motion(.base).delay(0.06) : .motion(.snap)), value: on)
                .background(GeometryReader { g in Color.clear.onAppear { natural = g.size.width } })
                .frame(width: on ? natural : 0, alignment: .leading).clipped()
                .frame(height: 26)
                .background(Capsule().fill(Color.primary.opacity(0.1)))
                .padding(.trailing, on ? 0 : -6)
                .animation(reduce ? nil : (on ? .motion(.base) : .motion(.base).delay(Motion.exit)), value: on)
                .accessibilityHidden(!on)
        }
    }
}
