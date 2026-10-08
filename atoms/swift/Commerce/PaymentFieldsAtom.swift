import SwiftUI
import Cieo

public struct PaymentFieldsAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "payfields", category: "Commerce", name: "Payment fields",
        summary: "Spaces land every four digits while the brand swaps live. Valid fields earn a success check; invalid ones show a danger fill with a fix, as you type.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var card = ""
    @State private var expiry = ""
    @State private var cvc = ""
    @State private var paid = false
    @State private var save = false
    public init() {}

    private var brand: String {
        guard let f = card.first else { return "Card" }
        switch f { case "4": return "Visa"; case "5": return "Mastercard"; case "3": return "Amex"; default: return "Card" }
    }
    private var digits: String { card.filter(\.isNumber) }
    private var cardOK: Bool {
        let s = digits; guard s.count >= 15 else { return false }
        var sum = 0; var alt = false
        for ch in s.reversed() { var n = ch.wholeNumberValue ?? 0; if alt { n *= 2; if n > 9 { n -= 9 } }; sum += n; alt.toggle() }
        return sum % 10 == 0
    }
    private var expOK: Bool {
        guard expiry.count == 5 else { return false }
        let m = Int(expiry.prefix(2)) ?? 0
        return expiry[expiry.index(expiry.startIndex, offsetBy: 2)] == "/" && (1...12).contains(m)
    }
    private var cvcOK: Bool { (3...4).contains(cvc.count) && cvc.allSatisfy(\.isNumber) }

    public var body: some View {
        AtomStage(hint: "Type 4242… then a short number") {
            VStack(spacing: 8) {
                HStack {
                    Text("Payment").font(.system(size: 15, weight: .semibold))
                    Spacer()
                    SwapText(brand).font(.system(size: 12.5)).foregroundStyle(.secondary)
                }
                    TextField("Card number", text: $card).monospacedDigit()
                    .frame(height: 38).padding(.horizontal, 10)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                    .background(Color.red.opacity(!card.isEmpty && !cardOK ? 0.10 : 0))
                    .onChange(of: card) { format() }
                fieldMsg(
                    card.isEmpty ? nil :
                    cardOK ? (true, "Looks good.") : (false, "Card looks short — check the 16 digits."))
                HStack(spacing: 8) {
                    TextField("MM/YY", text: $expiry).frame(height: 38).padding(.horizontal, 10)
                        .background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                        .onChange(of: expiry) { slash() }
                    TextField("CVC", text: $cvc).frame(width: 88, height: 38)
                        .padding(.horizontal, 10).background(.quaternary, in: RoundedRectangle(cornerRadius: 9))
                }
                fieldMsg(
                    expiry.isEmpty && cvc.isEmpty ? nil :
                    !expiry.isEmpty && !expOK ? (false, "Use MM/YY — e.g. 08/28.") :
                    !cvc.isEmpty && !cvcOK ? (false, "CVC is the 3 digits on the back.") : nil)
                Button(paid ? "Paid · Done" : "Pay $82.00") {
                    withMotion(.base, reduceMotion: reduce) { paid = cardOK && expOK && cvcOK }
                }
                .frame(height: 38).frame(maxWidth: .infinity)
                .background(paid ? .green : .primary, in: RoundedRectangle(cornerRadius: 9)).foregroundStyle(.white)
                Toggle("Save card", isOn: $save).font(.system(size: 12.5)).foregroundStyle(.secondary).nativeToggleStyle()
            }
            .padding(14).frame(maxWidth: 300)
            .background(.quaternary.opacity(0.5), in: RoundedRectangle(cornerRadius: 14))
        }
    }

    private func fieldMsg(_ s: (Bool, String)?) -> some View {
        Group {
            if let s {
                Label(s.1, systemImage: s.0 ? "checkmark.circle" : "exclamationmark.circle")
                    .font(.system(size: 12.5)).lineSpacing(6.5).foregroundStyle(s.0 ? .green : .red)
                    .frame(maxWidth: .infinity, alignment: .leading)
            } else {
                Text("").font(.system(size: 12.5)).frame(maxWidth: .infinity, minHeight: 19, alignment: .leading)
            }
        }
    }

    private func format() {
        let d = String(card.filter(\.isNumber).prefix(16))
        card = stride(from: 0, to: d.count, by: 4).map { i in
            String(d[d.index(d.startIndex, offsetBy: i)..<d.index(d.startIndex, offsetBy: min(i + 4, d.count))])
        }.joined(separator: " ")
    }

    private func slash() {
        var d = String(expiry.filter(\.isNumber).prefix(4))
        if d.count >= 3 { d.insert("/", at: d.index(d.startIndex, offsetBy: 2)) }
        expiry = d
    }
}
