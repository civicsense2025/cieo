import SwiftUI
import Cieo

public struct CurveExportAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "curveexport", category: "Foundations", name: "Curve exporter",
        summary: "Pick a spring and a platform: the same curve as CSS, SwiftUI or Reanimated values, copied in one click.")
    @State private var preset = "base"
    @State private var format = "web"
    @State private var status = "ready"
    private let presets = ["snap", "base", "soft", "lazy"]
    private let w = ["snap": 34.0, "base": 22.0, "soft": 15.0, "lazy": 9.0]
    private let d = ["snap": 200, "base": 300, "soft": 440, "lazy": 740]
    public init() {}

    public var body: some View {
        AtomStage(hint: "One click copies the spring for any platform") {
            VStack(spacing: 16) {
                HStack(spacing: 8) {
                    ForEach(presets, id: \.self) { p in
                        Button(p) { preset = p; status = "ready" }
                            .buttonStyle(.bordered).frame(maxWidth: .infinity, minHeight: 32)
                            .tint(preset == p ? .accentColor : nil)
                    }
                }
                Text(code).font(.system(size: 12, design: .monospaced))
                    .frame(maxWidth: .infinity, minHeight: 64, alignment: .leading)
                    .padding(12).background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
                Button("Copy values") { copy() }
                    .buttonStyle(.borderedProminent).frame(maxWidth: .infinity, minHeight: 36)
                HStack(spacing: 8) {
                    Text("Format").font(.caption).foregroundStyle(.secondary)
                    ForEach(["web", "ios", "reanimated"], id: \.self) { f in
                        Button(f) { format = f; status = "ready" }
                            .buttonStyle(.bordered).controlSize(.small).frame(minHeight: 32)
                            .tint(format == f ? .accentColor : nil)
                    }
                }
                Text("\(preset) · \(format) · \(status)")
                    .font(.system(size: 13, design: .monospaced)).foregroundStyle(.secondary)
            }
            .frame(maxWidth: 340)
        }
    }

    private var code: String {
        let wv = w[preset] ?? 22, wi = Int(wv)
        switch format {
        case "web": return "transition: all \(d[preset] ?? 300)ms cubic-bezier(.2, .15, .2, 1); /* \(preset) */"
        case "ios": return ".motion(.\(preset)) /* stiffness: \(wi * wi), damping: \(2 * wi) */"
        default: return "withSpring(to, { stiffness: \(wi * wi), damping: \(2 * wi) }); // \(preset)"
        }
    }

    private func copy() {
        let s = code
        #if os(iOS)
        UIPasteboard.general.string = s; status = "copied ✓"
        #elseif os(macOS)
        NSPasteboard.general.clearContents(); NSPasteboard.general.setString(s, forType: .string); status = "copied ✓"
        #else
        status = "ready"
        #endif
    }
}
