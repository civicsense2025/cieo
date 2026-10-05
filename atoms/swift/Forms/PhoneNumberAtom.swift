import SwiftUI
import MotionKit

public struct PhoneNumberAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "phone", category: "Forms", name: "Phone number",
        summary: "Digits format as you type for the chosen country. Switching country swaps the code with a blur and reformats the number. A complete number earns a success check.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var country = 0
    @State private var text = ""
    @FocusState private var focused: Bool
    private let countries: [(code: String, prefix: String, lengths: [Int])] = [("US", "+1", [3, 3, 4]), ("GB", "+44", [4, 6]), ("DE", "+49", [3, 8])]
    public init() {}

    private var length: Int { countries[country].lengths.reduce(0, +) }
    private var digits: String { String(text.filter(\.isNumber).prefix(length)) }
    private var complete: Bool { digits.count == length }

    private func format(_ d: String) -> String {
        switch country {
        case 0:
            var s = "(" + d.prefix(3)
            if d.count > 3 { s += ") " + d.dropFirst(3).prefix(3) }
            if d.count > 6 { s += "-" + d.dropFirst(6).prefix(4) }
            return s
        case 1: return String(d.prefix(4)) + (d.count > 4 ? " " + d.dropFirst(4).prefix(6) : "")
        default: return String(d.prefix(3)) + (d.count > 3 ? " " + d.dropFirst(3).prefix(8) : "")
        }
    }

    public var body: some View {
        AtomStage(hint: "Tap the country code to switch") {
            VStack(alignment: .leading, spacing: 6) {
                Text("Mobile number").font(.footnote.weight(.medium))
                HStack(spacing: 0) {
                    Button { withMotion(.base, reduceMotion: reduce) { country = (country + 1) % countries.count } } label: {
                        ZStack {
                            HStack(spacing: 4) {
                                Text(countries[country].code).fontWeight(.semibold)
                                Text(countries[country].prefix).foregroundStyle(.secondary)
                            }
                            .id(country).transition(reduce ? .identity : .basicsSwap())
                        }
                        .font(.footnote).frame(width: 70).frame(maxHeight: .infinity).contentShape(Rectangle())
                    }
                    .buttonStyle(.plain).accessibilityLabel("Change country").accessibilityValue(countries[country].code)
                    Divider()
                    TextField(format(String(repeating: "0", count: length)), text: $text)
                        .textFieldStyle(.plain).monospacedDigit().focused($focused).padding(.horizontal, 10)
                        #if os(iOS)
                        .keyboardType(.phonePad).textContentType(.telephoneNumber)
                        #endif
                        .accessibilityLabel("Mobile number")
                    Image(systemName: "checkmark").font(.footnote.weight(.bold)).foregroundStyle(.green)
                        .opacity(complete ? 1 : 0).scaleEffect(complete ? 1 : 0.6).padding(.trailing, 10)
                        .motion(.base, value: complete)
                }
                .frame(height: 42)
                .background(RoundedRectangle(cornerRadius: 10).strokeBorder(focused ? Color.primary : Color.primary.opacity(0.2), lineWidth: 1.5))
            }
            .frame(maxWidth: 300)
        }
        .onChange(of: text) { _, _ in reformat() }
        .onChange(of: country) { _, _ in reformat() }
    }

    private func reformat() {
        let f = digits.isEmpty ? "" : format(digits)
        if f != text { text = f }
    }
}
