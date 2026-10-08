import Combine
import SwiftUI
import Cieo

public struct LogTailAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "logtail", category: "Dynamic", name: "Streaming log tail",
        summary: "A new row opens its height first, then fades up into place while older rows spring down. The tail auto-sticks unless you scrolled up to read back.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private let events = ["build ok", "tests 42/42", "edge push 200", "cache warm", "canary 5%",
                          "migrate up", "dns cut", "tls ok", "p99 180ms", "sweep done"]
    @State private var rows: [(id: Int, text: String)] = []
    @State private var n = 0
    @State private var paused = false
    @State private var stick = true
    private let timer = Timer.publish(every: 0.9, on: .main, in: .common).autoconnect()
    public init() {}

    public var body: some View {
        AtomStage(hint: "New rows open, then fade up") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Deploy log").font(.headline)
                    Spacer()
                    Text(paused ? "Paused" : "Live tail").font(.caption).monospacedDigit()
                }
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(rows, id: \.id) { row in
                                HStack {
                                    Image(systemName: "checkmark").foregroundStyle(Color.accentColor).font(.caption)
                                    Text(row.text).font(.subheadline).monospacedDigit()
                                    Spacer()
                                }
                                .frame(minHeight: 24).id(row.id)
                                .transition(.asymmetric(
                                    insertion: .move(edge: .bottom).combined(with: .opacity),
                                    removal: .opacity))
                            }
                        }
                        .padding(.horizontal, 10)
                    }
                    .frame(height: 132)
                    .background(RoundedRectangle(cornerRadius: 10).stroke(.quaternary))
                    .onChange(of: rows.count) { _, _ in
                        guard stick, !paused, let last = rows.last else { return }
                        withAnimation(reduce ? nil : .motion(.base)) {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
                Text(paused ? "Paused · settled on row \(n)" : "Stuck to the latest · row \(n)")
                    .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                HStack {
                    Button(paused ? "Resume" : "Pause") { paused.toggle() }
                        .buttonStyle(.bordered).controlSize(.regular)
                    Spacer()
                    Toggle("stick to latest", isOn: $stick).font(.caption).foregroundStyle(.secondary)
                        .nativeToggleStyle()
                }
            }
            .frame(maxWidth: 420)
        }
        .onReceive(timer) { _ in
            guard !paused else { return }
            withAnimation(reduce ? nil : .motion(.base)) {
                n += 1
                rows.append((id: n, text: "\(events[n % events.count]) #\(n)"))
                if rows.count > 12 { rows.removeFirst() }
            }
        }
    }
}
