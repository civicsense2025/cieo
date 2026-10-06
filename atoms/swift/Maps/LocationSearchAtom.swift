import SwiftUI
import Cieo

public struct LocationSearchAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "locsearch", category: "Maps", name: "Location search",
        summary: "Matches stagger in and pins drop in reading order. A miss swaps to the no-match line and the count rolls to zero.")

    @State private var query = ""
    @State private var recent = true
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let all = ["Ferry Building", "Ferry Plaza", "Lands End", "Dolores Park"]
    public init() {}
    private var hits: [String] {
        let q = query.trimmingCharacters(in: .whitespaces).lowercased()
        let h = q.isEmpty ? all : all.filter { $0.lowercased().contains(q) }
        return recent ? h.reversed() : h
    }

    public var body: some View {
        AtomStage(hint: "Type, then Search") {
            VStack(alignment: .leading, spacing: 2) {
                Text("Find a place").font(.callout.weight(.semibold)).lineSpacing(4)
                HStack(spacing: 8) {
                    TextField("Try “ferry” or “zzz”", text: $query)
                        .textFieldStyle(.roundedBorder).font(.subheadline)
                        .accessibilityLabel("Search places")
                    Button("Search") {}.buttonStyle(.borderedProminent).controlSize(.small)
                }.padding(.top, 8)
                if query.trimmingCharacters(in: .whitespaces).lowercased() == "zzz" || (hits.isEmpty && !query.isEmpty) {
                    HStack {
                        SwapText("0 places match “zzz”", drift: 4).font(.subheadline)
                        RollingDigits("0").font(.subheadline)
                        Text("nearby").font(.caption).foregroundStyle(.secondary)
                    }.padding(.top, 8).motionTransition(.swap())
                } else {
                    ForEach(Array(hits.enumerated()), id: \.element) { i, n in
                        HStack(spacing: 10) {
                            Circle().fill(.primary).frame(width: 26, height: 26)
                                .overlay(Image(systemName: "mappin").font(.caption2).foregroundStyle(.background))
                                .offset(y: -26).opacity(0)
                                .offset(y: 26).opacity(1)
                                .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.05), value: query)
                            Text(n).font(.subheadline).lineSpacing(4)
                        }
                        .padding(.vertical, 9)
                        .opacity(1).motionTransition(.presence)
                        if i < hits.count - 1 { Divider() }
                    }
                    HStack {
                        SwapText("Places near you", drift: 4).font(.subheadline)
                        RollingDigits("\(hits.count)").font(.subheadline)
                        Text("nearby").font(.caption).foregroundStyle(.secondary)
                    }.padding(.top, 6)
                }
                HStack { Text("Pins drop in reading order").font(.caption).foregroundStyle(.secondary); Spacer(); Toggle("Recent first", isOn: $recent).labelsHidden().controlSize(.mini) }
                    .padding(.top, 8)
            }
            .padding(14).frame(width: 380)
            .background(RoundedRectangle(cornerRadius: 14).fill(.background).shadow(radius: 4, y: 1))
        }
    }
}
