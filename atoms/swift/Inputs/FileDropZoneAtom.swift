import SwiftUI
import UniformTypeIdentifiers
import Cieo

public struct FileDropZoneAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "dropzone", category: "Inputs", name: "File drop zone",
        summary: "Dragging a file over the zone inks its border and tints it. Each file opens its row, fills its bar, then ends in a success check or a danger message. Files never leave your browser.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    private struct Upload: Identifiable {
        let id = UUID()
        let name: String
        let size: Int
    }
    @State private var files: [Upload] = []
    @State private var targeted = false
    @State private var importing = false
    @State private var thumbs = true
    public init() {}

    public var body: some View {
        AtomStage {
            VStack(spacing: 8) {
                Button { importing = true } label: {
                    VStack(spacing: 4) {
                        Image(systemName: "arrow.up.to.line").font(.title3)
                        Text("Drop files or browse").font(.footnote.weight(.semibold))
                        Text("PNG, JPG or PDF · 5 MB max").font(.footnote).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity).padding(18)
                    .background(RoundedRectangle(cornerRadius: 12).fill(Color.primary.opacity(targeted ? 0.08 : 0)))
                    .overlay(RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(targeted ? Color.primary : Color.primary.opacity(0.25), style: StrokeStyle(lineWidth: 1.5, dash: [5, 4])))
                    .scaleEffect(targeted ? 1.01 : 1)
                    .motion(.base, value: targeted)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .dropDestination(for: URL.self) { urls, _ in
                    urls.forEach(add)
                    return true
                } isTargeted: { targeted = $0 }
                .fileImporter(isPresented: $importing, allowedContentTypes: [.png, .jpeg, .pdf], allowsMultipleSelection: true) { result in
                    if case .success(let urls) = result { urls.forEach(add) }
                }
                Button("Use sample files") {
                    push("cover-photo.jpg", 1_800_000)
                    Task {
                        try? await Task.sleep(for: .seconds(0.25))
                        push("annual-report.pdf", 8_400_000)
                    }
                }
                .buttonStyle(.bordered).controlSize(.small).frame(maxWidth: .infinity, alignment: .trailing)
                Toggle("Thumbnails", isOn: $thumbs).font(.caption).foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .trailing)
                VStack(spacing: 6) {
                    ForEach(files) { f in Row(upload: f.name, size: f.size, thumbs: thumbs) }
                }
                .animation(reduce ? nil : .motion(.base), value: files.count)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: 340)
        }
    }

    private func add(_ url: URL) {
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        push(url.lastPathComponent, (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? 0)
    }

    private func push(_ name: String, _ size: Int) {
        files.insert(Upload(name: name, size: size), at: 0)
        if files.count > 4 { files.removeLast() }
    }

    private struct Row: View {
        @Environment(\.accessibilityReduceMotion) private var reduce
        let upload: String
        let size: Int
        let thumbs: Bool
        @State private var open = false
        @State private var load = 0.0
        @State private var end = false
        private var bad: Bool { size > 5_000_000 }
        private var sizeText: String { size > 1_000_000 ? String(format: "%.1f MB", Double(size) / 1e6) : "\(max(1, size / 1000)) KB" }
        private var tile: String {
            let lower = upload.lowercased()
            if lower.hasSuffix(".pdf") { return "doc.fill" }
            if lower.hasSuffix(".jpg") || lower.hasSuffix(".jpeg") || lower.hasSuffix(".png") || lower.hasSuffix(".gif") || lower.hasSuffix(".webp") { return "photo.fill" }
            return "doc"
        }

        var body: some View {
            BasicsHeightReveal(open: open) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        if thumbs {
                            Image(systemName: tile).font(.caption)
                                .foregroundStyle(.secondary)
                                .frame(width: 28, height: 28)
                                .background(Color.primary.opacity(0.08), in: RoundedRectangle(cornerRadius: 7))
                        }
                        Text(upload).fontWeight(.medium).lineLimit(1).truncationMode(.middle)
                        Spacer(minLength: 0)
                        Text(sizeText).foregroundStyle(.secondary).monospacedDigit()
                        Image(systemName: bad ? "exclamationmark.circle" : "checkmark.circle")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(bad ? Color.red : Color.green)
                            .opacity(end ? 1 : 0).scaleEffect(end ? 1 : 0.6)
                            .frame(width: 20, height: 20)
                            .background((bad ? Color.red : Color.green).opacity(end ? 0.15 : 0), in: Circle())
                    }
                    .font(.footnote)
                    Capsule().fill(Color.primary.opacity(0.1)).frame(height: 4)
                        .overlay(alignment: .leading) {
                            GeometryReader { g in
                                Capsule().fill(end ? (bad ? Color.red : Color.green) : Color.primary)
                                    .frame(width: g.size.width * load)
                            }
                        }
                    Text("Too large · 5 MB max").font(.footnote).foregroundStyle(.red)
                        .frame(height: end && bad ? 20 : 0, alignment: .top).clipped().opacity(end && bad ? 1 : 0)
                }
                .padding(.horizontal, 10).padding(.vertical, 8)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.primary.opacity(0.06)))
                .opacity(open ? 1 : 0)
            }
            .animation(reduce ? nil : .motion(.base), value: end)
            .onAppear {
                if reduce {
                    open = true
                    load = bad ? 0.4 : 1
                    end = true
                    return
                }
                withAnimation(.motion(.base)) { open = true }
                withAnimation(.motion(.lazy).delay(0.15)) { load = bad ? 0.4 : 1 }
                Task {
                    try? await Task.sleep(for: .seconds(bad ? 0.9 : 1.6))
                    end = true
                }
            }
        }
    }
}
