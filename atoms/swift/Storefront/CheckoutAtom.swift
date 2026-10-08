import SwiftUI
import Cieo

public struct CheckoutAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "checkoutflow", category: "Storefront", name: "Checkout",
        summary: "One bar fills as you move Cart, Details, Payment, Receipt, and panels slide sideways in the direction of travel with the blur swap. Changing a quantity rolls its digit first, then every money value springs to the new total together; shipping goes free at $100. Empty required fields ring in danger. Pay shows a spinner, then fills success and slides to the receipt, where the check draws and the total counts up. With Simulate decline the button and bar flash danger, a message swaps in, and you stay on Payment.")

    private enum Pay { case idle, busy, ok, bad }
    private let steps = ["Cart", "Details", "Payment", "Receipt"]
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var step = 0
    @State private var dir: CGFloat = 1
    @State private var qty = 2
    @State private var shownQty = 2
    @State private var name = ""
    @State private var email = ""
    @State private var tried = false
    @State private var pay = Pay.idle
    @State private var decline = false
    @State private var checked = false
    @State private var thumbs = true
    public init() {}

    private var subtotal: Double { Double(shownQty) * 42 }
    private var shipping: Double { subtotal >= 100 ? 0 : 8 }
    private var total: Double { subtotal + shipping }

    public var body: some View {
        AtomStage(hint: "Walk through, try an empty field, then decline") {
            VStack(spacing: 10) {
                GeometryReader { g in
                    ZStack(alignment: .leading) {
                        Capsule().fill(.quaternary)
                        Capsule().fill(pay == .bad ? Color.red : Color.accentColor).frame(width: g.size.width * CGFloat(step + 1) / 4)
                    }
                }.frame(height: 4).motion(.soft, value: step).motion(.snap, value: pay == .bad)
                HStack { ForEach(steps.indices, id: \.self) { Text(steps[$0]).font(.caption2).foregroundStyle(step == $0 ? Color.primary : .secondary).frame(maxWidth: .infinity) } }
                ZStack(alignment: .topLeading) { panel.id(step).transition(reduce ? .identity : .asymmetric(
                    insertion: .modifier(active: Slide(x: 30 * dir, blur: 4, o: 0), identity: Slide(x: 0, blur: 0, o: 1)).animation(.motion(.base).delay(Motion.exit)),
                    removal: .modifier(active: Slide(x: -30 * dir, blur: 4, o: 0), identity: Slide(x: 0, blur: 0, o: 1)).animation(.motionExit))) }
                    .frame(width: 340, height: 160, alignment: .topLeading).clipped()
            }.frame(width: 340)
        }
    }

    @ViewBuilder private var panel: some View {
        VStack(alignment: .leading, spacing: 8) {
            switch step {
            case 0:
                Toggle("Thumbs", isOn: $thumbs).font(.caption).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    if thumbs { RoundedRectangle(cornerRadius: 8).fill(.quaternary).frame(width: 36, height: 44).overlay(Image(systemName: "bag").font(.caption).foregroundStyle(.secondary)).motionTransition(.swap()) }
                    Text("Field tee").font(.footnote.weight(.medium)); Spacer(); Stepper(value: $qty, in: 1...5) { RollingDigits(qty).font(.footnote) }.fixedSize().onChange(of: qty) { _, v in
                    Task { try? await Task.sleep(for: .seconds(0.12)); withMotion(.base, reduceMotion: reduce) { shownQty = v } } } }
                Divider()
                totals
                Spacer(); Button("Continue") { go(1) }.buttonStyle(.borderedProminent).controlSize(.small)
            case 1:
                field("Name", $name); field("Email", $email); Spacer(); Button("Continue") { tried = true; if !name.isEmpty && !email.isEmpty { go(2) } }.buttonStyle(.borderedProminent).controlSize(.small)
            case 2:
                Text("Card ending 4242").font(.footnote); totals
                Toggle("Simulate decline", isOn: $decline).font(.caption).toggleStyle(.switch).controlSize(.small)
                HStack { Button(action: submit) { ZStack { if pay == .busy { ProgressView().controlSize(.small) } else if pay == .ok { Image(systemName: "checkmark") } else { Text("Pay") } }.frame(minWidth: 50) }
                    .buttonStyle(.borderedProminent).controlSize(.small).tint(pay == .ok ? .green : pay == .bad ? .red : .accentColor).disabled(pay == .busy)
                    SwapText(pay == .bad ? "Card declined. Try another card." : "").font(.caption).foregroundStyle(.red) }
            default:
                HStack(spacing: 8) { Image(systemName: "checkmark.circle").font(.title).foregroundStyle(.green).mask(Rectangle().opacity(checked ? 1 : 0.0)).scaleEffect(checked ? 1 : 0.6).opacity(checked ? 1 : 0)
                    Text("Order placed").font(.headline) }
                HStack { Text("Total paid").font(.footnote); Spacer(); Money(value: checked ? total : 0).font(.footnote.weight(.semibold)) }
                Spacer(); Button("Start over") { go(0); pay = .idle; checked = false; tried = false }.buttonStyle(.bordered).controlSize(.small)
            }
        }
        .onAppear { if step == 3 { withMotion(.soft, reduceMotion: reduce) { checked = true } } }
    }

    private var totals: some View {
        VStack(spacing: 2) {
            HStack { Text("Subtotal"); Spacer(); Money(value: subtotal) }
            HStack { Text("Shipping"); Spacer(); if shipping == 0 { Text("Free").foregroundStyle(.green) } else { Money(value: shipping) } }
            HStack { Text("Total").fontWeight(.semibold); Spacer(); Money(value: total).fontWeight(.semibold) }
        }.font(.footnote)
    }

    private func field(_ title: String, _ text: Binding<String>) -> some View {
        TextField(title, text: text).softFieldSurface().font(.footnote)
            .overlay(RoundedRectangle(cornerRadius: 6).fill(Color.red).opacity((tried && text.wrappedValue.isEmpty ? 1.5 : 0) > 0 ? 0.10 : 0).allowsHitTesting(false)).motion(.base, value: tried)
    }

    private func go(_ s: Int) { dir = s > step ? 1 : -1; withMotion(.base, reduceMotion: reduce) { step = s } }

    private func submit() {
        guard pay != .busy else { return }
        withMotion(.base, reduceMotion: reduce) { pay = .busy }
        Task {
            try? await Task.sleep(for: .seconds(1.0))
            if decline { withMotion(.snap, reduceMotion: reduce) { pay = .bad }; try? await Task.sleep(for: .seconds(0.6)); withMotion(.base, reduceMotion: reduce) { pay = .idle }; return }
            withMotion(.base, reduceMotion: reduce) { pay = .ok }
            try? await Task.sleep(for: .seconds(0.5)); go(3)
            try? await Task.sleep(for: .seconds(0.3)); withMotion(.soft, reduceMotion: reduce) { checked = true }
        }
    }
}

private struct Slide: ViewModifier {
    let x: CGFloat, blur: CGFloat, o: Double
    func body(content: Content) -> some View { content.offset(x: x).blur(radius: blur).opacity(o) }
}

/// A dollar amount that springs between values instead of jumping.
private struct Money: View, Animatable {
    var value: Double
    var animatableData: Double { get { value } set { value = newValue } }
    var body: some View { Text(value, format: .currency(code: "USD").precision(.fractionLength(0))).monospacedDigit() }
}
