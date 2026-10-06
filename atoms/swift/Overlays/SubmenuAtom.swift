import SwiftUI
import Cieo

public struct SubmenuAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "submenu", category: "Overlays", name: "Context submenu",
        summary: "The child slides 12px from the parent edge on base with a 60ms edge trail. The parent stays put, the arrow turns, and Esc steps back one level.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var child = false
    public init() {}
    public var body: some View {
        AtomStage(hint: "Open Share, Esc steps back one level") {
            VStack(spacing: 8) {
                Toggle("Keep parent open", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary).controlSize(.small)
                Button("Open menu") { withMotion(.base, reduceMotion: reduce) { open.toggle(); if (!open) { child = false } } }
                    .buttonStyle(.borderedProminent)
                HStack(alignment: .top, spacing: 0) {
                    VStack(spacing: 0) {
                        Button { withMotion(.base, reduceMotion: reduce) { child = true } } label: {
                            HStack { Text("Share").font(.callout); Spacer()
                                Image(systemName: "chevron.right").font(.caption2)
                                    .rotationEffect(.degrees(child ? 90 : 0)).animation(reduce ? nil : .motion(.base), value: child) }
                            .padding(.horizontal, 10).padding(.vertical, 9)
                        }.buttonStyle(.plain)
                        ForEach(["Rename", "Duplicate"], id: \.self) { n in
                            Text(n).font(.callout).frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 10).padding(.vertical, 9)
                        }
                        Text("Delete").font(.callout).foregroundStyle(.red).frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 10).padding(.vertical, 9)
                    }
                    .frame(width: 150).padding(6).basicsPanel(radius: 14).opacity(open ? 1 : 0)
                    if child {
                        VStack(spacing: 0) {
                            ForEach(["Copy link", "Email", "Messages"], id: \.self) { n in
                                Text(n).font(.callout).frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 10).padding(.vertical, 9)
                            }
                        }
                        .frame(width: 140).padding(6).basicsPanel(radius: 14)
                        .offset(x: 6)
                        .transition(reduce ? .identity : .opacity.combined(with: .offset(x: 12)).animation(.motion(.base)))
                    }
                }
                .frame(height: 190, alignment: .top)
                .animation(reduce ? nil : .motion(.snap), value: open)
            }
            .onKeyPress(.escape) { if child { withMotion(.snap, reduceMotion: reduce) { child = false } } else { withMotion(.snap, reduceMotion: reduce) { open = false } }; return .handled }
        }
    }
}
