import SwiftUI
import Cieo

public struct PasswordWithStrengthAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "password", category: "Forms", name: "Password with strength",
        summary: "Meter segments fill in order as strength rises, shifting from danger to warning to success. Each requirement draws its own check when met. The eye icon’s slash draws on and off.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var text = ""
    @State private var revealed = false
    @FocusState private var focused: Bool
    private let rules: [(String, (String) -> Bool)] = [
        ("8 or more characters", { $0.count >= 8 }), ("A number", { $0.contains { $0.isNumber } }),
        ("An uppercase letter", { $0.contains { $0.isUppercase } }), ("A symbol", { $0.contains { !$0.isLetter && !$0.isNumber } }),
    ]
    private let levels = ["", "Weak", "Fair", "Good", "Strong"]
    public init() {}

    private var score: Int { text.isEmpty ? 0 : rules.filter { $0.1(text) }.count }
    private var tint: Color { score <= 1 ? .red : score <= 3 ? .orange : .green }

    public var body: some View {
        AtomStage {
            VStack(alignment: .leading, spacing: 8) {
                Text("New password").font(.footnote.weight(.medium))
                HStack(spacing: 4) {
                    Group {
                        if revealed { TextField("", text: $text) } else { SecureField("", text: $text) }
                    }
                    .textFieldStyle(.plain).focused($focused).accessibilityLabel("New password")
                    Button { revealed.toggle(); focused = true } label: {
                        Image(systemName: "eye").font(.system(size: 16)).foregroundStyle(.secondary)
                            .overlay { Slash().trim(from: 0, to: revealed ? 0 : 1).stroke(.secondary, style: StrokeStyle(lineWidth: 2, lineCap: .round)).padding(1) }
                            .frame(width: 34, height: 34).contentShape(Rectangle())
                            .animation(reduce ? nil : .motion(.base), value: revealed)
                    }
                    .buttonStyle(.plain).accessibilityLabel(revealed ? "Hide password" : "Show password")
                }
                .padding(.leading, 11).padding(.trailing, 4).frame(height: 42)
                .background(RoundedRectangle(cornerRadius: 10).strokeBorder(focused ? Color.primary : Color.primary.opacity(0.2), lineWidth: 1.5))
                HStack(spacing: 4) {
                    ForEach(0..<4, id: \.self) { i in
                        Capsule().fill(Color.primary.opacity(0.08)).frame(height: 5)
                            .overlay(alignment: .leading) {
                                GeometryReader { g in
                                    Capsule().fill(tint).frame(width: i < score ? g.size.width : 0)
                                }
                            }
                            .animation(reduce ? nil : .motion(.base).delay(Double(i) * 0.04), value: score)
                    }
                }
                .motion(.base, value: score)
                HStack {
                    Text("Strength").foregroundStyle(.secondary)
                    Spacer()
                    SwapText(levels[score]).foregroundStyle(tint).fontWeight(.medium)
                }
                .font(.footnote)
                VStack(alignment: .leading, spacing: 4) {
                    ForEach(rules.indices, id: \.self) { i in
                        let met = rules[i].1(text)
                        HStack(spacing: 8) {
                            ZStack {
                                Circle().strokeBorder(Color.primary.opacity(0.2), lineWidth: 2)
                                Tick().trim(from: 0, to: met ? 1 : 0).stroke(Color.green, style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))
                            }
                            .frame(width: 14, height: 14)
                            Text(rules[i].0).foregroundStyle(met ? Color.primary : Color.secondary)
                        }
                        .font(.footnote).motion(.base, value: met)
                        .accessibilityElement(children: .combine).accessibilityValue(met ? "Met" : "Not met")
                    }
                }
            }
            .frame(maxWidth: 300)
        }
    }

    private struct Slash: Shape {
        func path(in r: CGRect) -> Path {
            var p = Path()
            p.move(to: CGPoint(x: r.minX + r.width * 0.15, y: r.minY + r.height * 0.15))
            p.addLine(to: CGPoint(x: r.maxX - r.width * 0.15, y: r.maxY - r.height * 0.15))
            return p
        }
    }

    private struct Tick: Shape {
        func path(in r: CGRect) -> Path {
            var p = Path()
            p.move(to: CGPoint(x: r.width * 0.33, y: r.height * 0.52))
            p.addLine(to: CGPoint(x: r.width * 0.46, y: r.height * 0.65))
            p.addLine(to: CGPoint(x: r.width * 0.69, y: r.height * 0.4))
            return p
        }
    }
}
