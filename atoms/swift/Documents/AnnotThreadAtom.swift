import SwiftUI
import Cieo

public struct AnnotThreadAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "annotthread", category: "Documents", name: "Annotation thread",
        summary: "Resolving inks the check then collapses the thread height; the resolved terminal holds until Reopen reverses it.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var resolved = false
    @State private var checked = false
    public init() {}

    public var body: some View {
        AtomStage(hint: "Resolve collapses it — Reopen reverses") {
            VStack(spacing: 8) {
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 10) {
                        Text("💬").frame(width: 36, height: 36).background(.quaternary, in: Circle())
                        VStack(alignment: .leading) {
                            Text("Mara on §2").font(.headline)
                            Text("“The bell image carries the whole opening.”").font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    Divider().padding(.top, 12)
                    if !resolved {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Theo: Agreed — keep it.").font(.callout)
                            Text("June: Trim the second clause.").font(.callout)
                        }
                        .padding(.top, 8).motionTransition(.swap())
                    }
                    HStack(spacing: 8) {
                        Button("Resolve") {
                            withMotion(.base, reduceMotion: reduce) { checked = true }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.16) {
                                withMotion(.base, reduceMotion: reduce) { resolved = true }
                            }
                        }.frame(minHeight: 32)
                        Button("Reopen") { withMotion(.base, reduceMotion: reduce) { resolved = false; checked = false } }.frame(minHeight: 32)
                        if checked { Image(systemName: "checkmark").foregroundStyle(.green).motionTransition(.swap()) }
                        ZStack(alignment: .leading) {
                            if resolved { Text("resolved ✓").foregroundStyle(.green).motionTransition(.swap()) }
                            else { Text("open").foregroundStyle(.secondary).motionTransition(.swap()) }
                        }.font(.caption)
                    }
                    .padding(.top, 12)
                }
                .padding(16).frame(maxWidth: 360)
                .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
                Toggle("Notify author on resolve", isOn: .constant(true)).font(.caption).foregroundStyle(.secondary)
            }
        }
    }
}
