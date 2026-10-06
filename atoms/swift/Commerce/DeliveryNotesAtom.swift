import SwiftUI
import Cieo

public struct DeliveryNotesAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "delivnotes", category: "Commerce", name: "Delivery instructions",
        summary: "The link opens the textarea on the base height spring while the counter warns past 90%. Save swaps to a compact chip; empty saves leave zero trace.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var open = false
    @State private var note = ""
    @State private var saved = ""
    @State private var door = false
    private let max = 120
    public init() {}

    public var body: some View {
        AtomStage(hint: "Add a note, watch the count") {
            VStack(spacing: 8) {
                Text("Delivery").font(.system(size: 15, weight: .semibold)).frame(maxWidth: .infinity, alignment: .leading)
                if !open && saved.isEmpty {
                    Button("Add instructions") { withMotion(.base, reduceMotion: reduce) { open = true } }
                        .font(.system(size: 13)).frame(maxWidth: .infinity, alignment: .leading).buttonStyle(.plain).foregroundStyle(Color.accentColor)
                }
                if open {
                    TextEditor(text: $note).font(.system(size: 13)).lineSpacing(6.5)
                        .frame(height: 72).padding(6)
                        .background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .onChange(of: note) { note = String(note.prefix(max)) }
                    HStack {
                        Text("\(note.count)/\(max)").font(.system(size: 12.5)).monospacedDigit()
                            .foregroundStyle(note.count > Int(Double(max) * 0.9) ? .red : .secondary)
                        Spacer()
                        Button("Save") {
                            withMotion(.base, reduceMotion: reduce) {
                                saved = note.trimmingCharacters(in: .whitespacesAndNewlines)
                                open = false
                            }
                        }
                        .frame(height: 38).padding(.horizontal, 14)
                        .background(.primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.background)
                    }
                }
                if !saved.isEmpty && !open {
                    HStack(spacing: 8) {
                        Text(saved).font(.system(size: 13)).lineSpacing(6.5).lineLimit(1)
                            .padding(.horizontal, 12).frame(height: 30)
                            .background(.quaternary, in: Capsule())
                        Button("Edit") { withMotion(.base, reduceMotion: reduce) { open = true } }
                            .font(.system(size: 13)).buttonStyle(.plain).foregroundStyle(Color.accentColor)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .transition(.scale(scale: 0.9).combined(with: .opacity))
                }
                Toggle("“Leave at door” shortcut", isOn: $door).font(.system(size: 12.5)).foregroundStyle(.secondary).toggleStyle(.checkbox)
                    .onChange(of: door) { if door && note.isEmpty { note = "Leave at door. " } }
            }
            .padding(14).frame(width: 280)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
            .animation(reduce ? nil : .motion(.base), value: open)
        }
    }
}
