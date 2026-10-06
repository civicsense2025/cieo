import SwiftUI
import Cieo

public struct StickyStackAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "stickystack", category: "Layout", name: "Sticky stacking",
        summary: "Headers pin to the top one to one, then the next section pushes them off. The marker trails a beat behind.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var active = 0
    @State private var done = false
    @State private var trail = true
    private let sections = [("Morning", ["Standup", "Review"]), ("Afternoon", ["Ship", "Retro"]), ("Evening", ["Plan", "Rest"])]
    public init() {}

    public var body: some View {
        AtomStage(hint: "Scroll the stack through all three sections") {
            VStack(spacing: 8) {
                Text("Sticky stacking").font(.system(size: 15, weight: .semibold)).lineSpacing(4)
                Text(done ? "Done" : sections[active].0)
                    .font(.caption).foregroundStyle(.secondary)
                    .transition(.motionSwap())
                    .id(done ? "done" : sections[active].0)
                ZStack(alignment: .top) {
                    ScrollView {
                        LazyVStack(spacing: 0, pinnedViews: [.sectionHeaders]) {
                            ForEach(sections.indices, id: \.self) { s in
                                Section {
                                    ForEach(sections[s].1.indices, id: \.self) { r in
                                        Text(sections[s].1[r]).font(.footnote).lineSpacing(4)
                                            .padding(.horizontal, 16).padding(.vertical, 10)
                                            .frame(maxWidth: .infinity, alignment: .leading)
                                            .background(Color.primary.opacity(0.02))
                                            .onAppear { active = s }
                                    }
                                } header: {
                                    Text(sections[s].0).font(.footnote.weight(.semibold)).lineSpacing(4)
                                        .padding(.horizontal, 16).padding(.vertical, 8)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                        .background(.regularMaterial)
                                }
                            }
                            Text("End of sections · stack holds")
                                .font(.caption).foregroundStyle(.secondary)
                                .padding(12)
                                .onAppear { done = true }
                                .onDisappear { done = false }
                        }
                    }
                    .frame(maxWidth: 340).frame(height: 200)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(0.06)))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    Capsule().fill(Color.primary)
                        .frame(width: 60, height: 3)
                        .offset(x: -70 + CGFloat(min(active, 2)) * 70)
                        .animation(reduce || !trail ? nil : .motion(.base).delay(Motion.lag), value: active)
                        .padding(.top, 2)
                }
                HStack(spacing: 8) {
                    Toggle("Trailing edge", isOn: $trail).font(.caption).foregroundStyle(.secondary)
                        .toggleStyle(.switch).controlSize(.small)
                }
            }
            .frame(maxWidth: 560)
            .animation(reduce ? nil : .motion(.base), value: active)
        }
    }
}
