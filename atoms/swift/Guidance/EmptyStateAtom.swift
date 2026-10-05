import SwiftUI
import Cieo

public struct EmptyStateAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "emptystate", category: "Guidance", name: "Empty state",
        summary: "Archiving clears rows top to bottom, 40ms apart. Only after the last one leaves does the empty state rise in, so the two never share the screen. Loading samples reverses it.")

    private let items = ["Maya · Draft is ready", "Theo · Pricing table", "Billing · INV-0042 paid", "Ada · New subscriber", "Jonas · Thursday works"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var shown = [Bool](repeating: true, count: 5)
    @State private var empty = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Archive all, then load samples") {
            VStack(spacing: 10) {
                ZStack {
                    VStack(spacing: 0) {
                        ForEach(items.indices, id: \.self) { i in
                            Text(items[i]).font(.footnote).frame(maxWidth: .infinity, alignment: .leading)
                                .padding(.horizontal, 14).padding(.vertical, 12).overlay(alignment: .bottom) { Divider() }
                                .opacity(shown[i] ? 1 : 0).offset(y: shown[i] ? 0 : -6)
                        }
                        Spacer(minLength: 0)
                    }
                    VStack(spacing: 6) {
                        Image(systemName: "tray").font(.largeTitle).foregroundStyle(.secondary)
                        Text("All caught up").font(.headline)
                        Text("Nothing left to review.").font(.footnote).foregroundStyle(.secondary)
                    }
                    .opacity(empty ? 1 : 0).offset(y: empty ? 0 : 10).accessibilityHidden(!empty)
                }
                .frame(width: 300, height: 270)
                .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 14))
                .clipShape(RoundedRectangle(cornerRadius: 14))
                HStack {
                    Button("Archive all", action: clear)
                    Button("Load samples", action: restore)
                }.buttonStyle(.bordered).controlSize(.small)
            }
        }
    }

    private func clear() {
        for i in items.indices { withAnimation(reduce ? nil : .motion(.snap).delay(Double(i) * 0.04)) { shown[i] = false } }
        withAnimation(reduce ? nil : .motion(.base).delay(Double(items.count) * 0.04 + 0.1)) { empty = true }
    }

    private func restore() {
        withMotion(.snap, reduceMotion: reduce) { empty = false }
        for i in items.indices { withAnimation(reduce ? nil : .motion(.base).delay(0.12 + Double(i) * 0.04)) { shown[i] = true } }
    }
}
