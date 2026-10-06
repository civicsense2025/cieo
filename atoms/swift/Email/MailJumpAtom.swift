import SwiftUI
import Cieo

public struct MailJumpAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "mailjump", category: "Email", name: "Command-K jump",
        summary: "An email-scoped palette where rows spring into slots as you type, the highlight trails on lagging edges, and the preview swaps behind the pick.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var query = ""
    @State private var cur = 0
    @State private var sentToo = false
    @FocusState private var focused: Bool
    public init() {}
    private let inbox = [
        ("Board pre-read", "AC", "Q3 numbers inside"),
        ("Pricing draft", "MQ", "New tiers attached"),
        ("Scope v2", "JK", "Ship it Thursday"),
    ]
    private let sent = ("Re: Welcome pack", "ME", "Sent last week")
    private var pool: [(String, String, String)] { sentToo ? inbox + [sent] : inbox }
    private var visible: [Int] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        if q.isEmpty { return Array(pool.indices) }
        return pool.indices.filter { pool[$0].0.lowercased().contains(q) || pool[$0].1.lowercased().contains(q) }
    }

    public var body: some View {
        AtomStage(hint: "Type to filter; tap to move") {
            VStack(spacing: 10) {
                Button("⌘K Jump to email") {
                    withMotion(.base, reduceMotion: reduce) { focused = true }
                }.buttonStyle(.bordered).controlSize(.small)
                VStack(alignment: .leading, spacing: 8) {
                    TextField("Search mail…", text: $query)
                        .textFieldStyle(.roundedBorder).font(.caption)
                        .focused($focused)
                    HStack(alignment: .top, spacing: 10) {
                        VStack(spacing: 2) {
                            ForEach(visible, id: \.self) { i in
                                Button {
                                    withMotion(.base, reduceMotion: reduce) { cur = i }
                                } label: {
                                    HStack(spacing: 8) {
                                        Circle().fill(Color.accentColor.opacity(0.15))
                                            .frame(width: 32, height: 32)
                                            .overlay(Text(pool[i].1).font(.caption2.weight(.semibold)))
                                        Text(pool[i].0).font(.caption.weight(.medium))
                                        Spacer()
                                    }
                                    .padding(6)
                                    .background {
                                        if cur == i {
                                            RoundedRectangle(cornerRadius: 8).fill(Color.accentColor.opacity(0.15))
                                        }
                                    }
                                }
                                .buttonStyle(.plain)
                                .animation(reduce ? nil : .motion(.base), value: cur)
                            }
                            if visible.isEmpty {
                                Text("No matches").font(.caption).foregroundStyle(.secondary)
                                    .frame(height: 52, alignment: .center)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .top)
                        Divider()
                        VStack(alignment: .leading, spacing: 2) {
                            SwapText(pool[cur].0).font(.caption.weight(.semibold))
                            SwapText("\(pool[cur].1) · \(pool[cur].2)").font(.caption).foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, minHeight: 100, alignment: .topLeading)
                    }
                }
                .padding(14).frame(width: 340)
                .background(RoundedRectangle(cornerRadius: 14).fill(Color.primary.opacity(0.06)))
                Toggle("Search sent too", isOn: $sentToo)
                    .font(.caption).foregroundStyle(.secondary)
                    .toggleStyle(.switch).controlSize(.small)
            }
        }
        .onChange(of: sentToo) { _, _ in
            if cur >= pool.count {
                withMotion(.base, reduceMotion: reduce) { cur = 0 }
            }
        }
        .onChange(of: query) { _, _ in
            if let first = visible.first, !visible.contains(cur) {
                withMotion(.base, reduceMotion: reduce) { cur = first }
            }
        }
    }
}
