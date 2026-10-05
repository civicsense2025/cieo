import SwiftUI
import MotionKit

public struct OAuthGrantAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "oauthgrant", category: "MCP and agents", name: "OAuth consent screen",
        summary: "Each scope toggle springs its knob, and the Allow count rolls. Turning on a sensitive scope grows a warning line under it. Allow morphs the button row: Deny shrinks to zero width while Allow grows, fills green and swaps to Connected, then the scopes you left off collapse 40ms apart and the toggles of the kept ones swap to checks. Deny runs the mirror image and fades red. The link between the two tiles fills as the grant lands.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private enum Result { case asking, allowed, denied }
    @State private var scopes = [true, true, false]
    @State private var result = Result.asking
    public init() {}

    private let names = [("Read pages", "View published and draft pages."), ("Edit pages", "Change page content."), ("Delete content", "Permanently remove pages and media.")]

    public var body: some View {
        AtomStage(hint: "Toggle scopes, then Allow or Deny") {
            AgCard {
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 8) {
                        Text("C").frame(width: 30, height: 30).background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
                        Capsule().fill(result == .allowed ? Color.green : result == .denied ? Color.red : Color.secondary.opacity(0.4)).frame(height: 3)
                        Text("N").frame(width: 30, height: 30).background(.quaternary, in: RoundedRectangle(cornerRadius: 8))
                    }
                    .animation(reduce ? nil : .motion(.base), value: result).accessibilityHidden(true)
                    SwapText(result == .allowed ? "Assistant is connected to Northwind" : result == .denied ? "Request denied" : "Assistant wants to connect to Northwind").font(.headline)
                    ForEach(names.indices, id: \.self) { i in
                        AgReveal(open: result == .asking || scopes[i]) {
                            VStack(alignment: .leading, spacing: 2) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 0) { Text(names[i].0).font(.callout.weight(.medium)); Text(names[i].1).font(.caption).foregroundStyle(.secondary) }
                                    Spacer()
                                    if result == .asking { Toggle(names[i].0, isOn: bind(i)).labelsHidden() }
                                    else { Image(systemName: "checkmark").foregroundStyle(.green) }
                                }
                                AgReveal(open: i == 2 && scopes[2] && result == .asking) { Text("This scope can delete data. Turn it on only if you need it.").font(.caption).foregroundStyle(.orange) }
                            }
                        }
                    }
                    HStack(spacing: 6) {
                        if result != .allowed {
                            Button { finish(.denied) } label: { SwapText(result == .denied ? "Denied" : "Deny") }.buttonStyle(AgPress(tone: result == .denied ? .danger : nil))
                        }
                        if result != .denied {
                            Button { finish(.allowed) } label: {
                                HStack(spacing: 4) { if result == .asking { Text("Allow"); RollingDigits(scopes.filter { $0 }.count) } else { Text("Connected") } }
                            }.buttonStyle(AgPress(tone: result == .allowed ? .success : .info))
                        }
                        Spacer()
                        if result != .asking { Button("Reset") { withMotion(.base, reduceMotion: reduce) { result = .asking; scopes = [true, true, false] } }.buttonStyle(AgPress()) }
                    }
                    .animation(reduce ? nil : .motion(.base), value: result)
                    Text("Signed in as maya@northwind.co").font(.caption2).foregroundStyle(.secondary)
                }
            }
            .frame(maxWidth: 400)
        }
    }

    private func bind(_ i: Int) -> Binding<Bool> { Binding(get: { scopes[i] }, set: { v in withMotion(.snap, reduceMotion: reduce) { scopes[i] = v } }) }
    private func finish(_ r: Result) {
        withMotion(.base, reduceMotion: reduce) { result = r }
    }
}
