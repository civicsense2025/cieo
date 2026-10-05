import SwiftUI
import Cieo

public struct OneTimeCodeAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "otp", category: "Inputs", name: "One-time code",
        summary: "Each digit rolls into its box and a focus ring slides to the next box with lagging edges. A full code turns every box success or danger; a wrong code clears itself after a beat.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var code = ""
    @FocusState private var focused: Bool
    private enum Status { case idle, ok, bad }
    private let secret = "246810"
    public init() {}

    private var status: Status { code.count < 6 ? .idle : (code == secret ? .ok : .bad) }
    private var message: String {
        switch status {
        case .idle: ""
        case .ok: "Verified. Signing you in…"
        case .bad: "That code didn’t match. Try again."
        }
    }
    private var tint: Color { status == .ok ? .green : status == .bad ? .red : Color.primary.opacity(0.2) }

    public var body: some View {
        AtomStage(hint: "The code is 246810") {
            VStack(spacing: 10) {
                ZStack(alignment: .topLeading) {
                    EdgesIndicator(frame: CGRect(x: CGFloat(min(code.count, 5)) * 48 - 3, y: -3, width: 46, height: 54),
                                   shape: Ring(), style: Color.primary)
                        .opacity(focused && status == .idle ? 1 : 0)
                        .motion(.base, value: focused && status == .idle)
                    HStack(spacing: 8) {
                        ForEach(0..<6, id: \.self) { i in
                            ZStack {
                                if i < code.count {
                                    Text(String(code[code.index(code.startIndex, offsetBy: i)])).id("\(i)-\(code[code.index(code.startIndex, offsetBy: i)])")
                                        .motionTransition(.swap(drift: 10))
                                }
                            }
                            .font(.system(size: 22, weight: .semibold)).monospacedDigit()
                            .frame(width: 40, height: 48)
                            .background(RoundedRectangle(cornerRadius: 10).strokeBorder(tint, lineWidth: 1.5))
                        }
                    }
                    .animation(reduce ? nil : .motion(.base), value: code)
                    .motion(.base, value: status)
                    field
                }
                .frame(width: 280, height: 48)
                SwapText(message).font(.footnote).foregroundStyle(status == .ok ? Color.green : Color.red)
                    .frame(height: 20)
            }
        }
        .onChange(of: code) { _, new in
            let digits = String(new.filter(\.isNumber).prefix(6))
            if digits != new {
                code = digits
            } else if digits.count == 6, digits != secret {
                Task {
                    try? await Task.sleep(for: .seconds(1.1))
                    if code == digits { code = "" }
                }
            }
        }
    }

    private var field: some View {
        TextField("", text: $code).textFieldStyle(.plain).focused($focused)
            #if os(iOS)
            .keyboardType(.numberPad).textContentType(.oneTimeCode)
            #endif
            .opacity(0.01).frame(width: 280, height: 48)
            .contentShape(Rectangle())
            .accessibilityLabel("Six digit code")
    }

    /// An outline, so the indicator draws a ring around the box instead of a filled plate.
    private struct Ring: Shape {
        func path(in rect: CGRect) -> Path {
            RoundedRectangle(cornerRadius: 12).path(in: rect.insetBy(dx: 1, dy: 1)).strokedPath(StrokeStyle(lineWidth: 2))
        }
    }
}
