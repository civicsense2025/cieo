import SwiftUI
import Cieo

public struct AppTrustFooterAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "fz5-app", category: "Footers", name: "App download and trust footer",
        summary: "Reaching the app block ripples the QR modules in from the top left corner on the lazy spring, one diagonal at a time. The trust badges rise 60ms apart; hovering or focusing a badge rings it in ink and pops a detail card above it from 97% scale, and Escape closes it. The store buttons morph their corner radius and fill on hover, social pills fill with ink and send the arrow up and right, and Copy link blur-swaps its label.")
    public init() {}
    public var body: some View { FootPage(blocks: 1) { AppFooter() } }
}

private struct AppFooter: View {
    @Environment(\.accessibilityReduceMotion) private var reduce
    @Environment(\.footVisible) private var visible
    @State private var badge: Int?
    @State private var store: Int?
    @State private var copied = false
    private let badges = [("lock.shield", "Encrypted", "Data is encrypted at rest and in transit."), ("checkmark.seal", "Audited", "Independent security audit every year."), ("leaf", "Carbon aware", "Runs on regions with cleaner power.")]
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .top, spacing: 14) {
                qr
                VStack(alignment: .leading, spacing: 8) {
                    Text("Take it with you").font(.callout.weight(.semibold))
                    ForEach(["App Store", "Google Play"].indices, id: \.self) { i in
                        let on = store == i
                        Text(["App Store", "Google Play"][i]).font(.caption.weight(.semibold)).padding(.horizontal, 12).padding(.vertical, 7)
                            .foregroundStyle(on ? AnyShapeStyle(.background) : AnyShapeStyle(.primary))
                            .background(on ? AnyShapeStyle(Color.primary) : AnyShapeStyle(.quaternary), in: RoundedRectangle(cornerRadius: on ? 16 : 6, style: .continuous))
                            .onHover { store = $0 ? i : (store == i ? nil : store) }.motion(.snap, value: store).accessibilityAddTraits(.isButton)
                    }
                    Button { copied = true; Task { try? await Task.sleep(for: .seconds(1.5)); copied = false } } label: { SwapText(copied ? "Copied" : "Copy link").font(.caption) }
                        .buttonStyle(.plain).animation(reduce ? nil : .motion(.base), value: copied)
                }
            }
            HStack(spacing: 8) {
                ForEach(badges.indices, id: \.self) { i in
                    Label(badges[i].1, systemImage: badges[i].0).font(.caption).padding(.horizontal, 8).padding(.vertical, 5)
                        .overlay(Capsule().strokeBorder(badge == i ? Color.primary : Color.secondary.opacity(0.3), lineWidth: 1))
                        .overlay(alignment: .top) {
                            if badge == i {
                                Text(badges[i].2).font(.caption2).padding(8).frame(width: 150).background(.background, in: RoundedRectangle(cornerRadius: 8))
                                    .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(.quaternary)).alignmentGuide(.top) { $0[.bottom] + 6 }.motionTransition(.presence)
                            }
                        }
                        .onHover { h in withMotion(.base, reduceMotion: reduce) { badge = h ? i : (badge == i ? nil : badge) } }
                        .footRise(i + 1, gap: 0.06)
                }
            }
        }
        .padding(.vertical, 14).overlay(alignment: .top) { Divider() }
        .onKeyPress(.escape) { withMotion(.snap, reduceMotion: reduce) { badge = nil }; return .handled }
    }

    private var qr: some View {
        VStack(spacing: 2) {
            ForEach(0..<9, id: \.self) { r in
                HStack(spacing: 2) {
                    ForEach(0..<9, id: \.self) { c in
                        RoundedRectangle(cornerRadius: 1.5).fill((r * 7 + c * 13 + r * c) % 3 == 0 ? Color.clear : Color.primary)
                            .frame(width: 8, height: 8).scaleEffect(visible ? 1 : 0.01)
                            .animation(reduce ? nil : .motion(.lazy).delay(visible ? Double(r + c) * 0.04 : 0), value: visible)
                    }
                }
            }
        }
        .accessibilityLabel("QR code to download the app")
    }
}
