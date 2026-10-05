import SwiftUI
import Cieo

public struct InfoDrawerAtom: MotionAtomView {
    public static let info = MotionAtomInfo(id: "gal-info-drawer", category: "Galleries", name: "Caption and metadata drawer",
        summary: "The drawer is one number, how far it is open, and everything reads from it. The drawer rises on a soft spring (or follows your finger one to one on its handle, and release velocity picks open or closed); the photo, 50ms behind it, slides up and shrinks just enough that the marked subject ends 16px above the drawer’s top edge, and not a pixel more. Turn on the subject marker to see the area it protects. Detail rows then fade up one after another as the drawer passes each threshold. Changing photo is a Swap, and the new photo gets its own subject maths. Use when a lightbox needs captions and EXIF without covering what the picture is about.")
    @Environment(\.accessibilityReduceMotion) private var reduce
    @State private var amount = 0.0         // how far open, 0...1
    @State private var dragging = false
    @State private var base = 0.0
    public init() {}
    private let rows = [("Camera", "35 mm f/2"), ("Exposure", "1/250 s, ISO 200"), ("Taken", "6:42 pm, ridge trail")]

    public var body: some View {
        AtomStage(hint: "Drag the handle or tap it: the photo makes room for the drawer") {
            GeometryReader { g in
                let h = g.size.height, drawerH = h * 0.42
                // the drawer is one number; the photo reads it 50 ms behind on a second spring
                PhFollow(target: amount, preset: dragging ? .snap : .soft) { a in
                    PhFollow(target: a, preset: .snap) { pa in
                        ZStack(alignment: .bottom) {
                            Color(white: 0.08)
                            // the marked subject ends 16 points above the drawer's top edge, and not a point more
                            phPhoto(2, CGSize(width: g.size.width, height: h))
                                .scaleEffect(1 - 0.22 * pa, anchor: .top).offset(y: -(drawerH * pa) * 0.25)
                            VStack(alignment: .leading, spacing: 8) {
                                Capsule().fill(.secondary).frame(width: 36, height: 4).frame(maxWidth: .infinity)
                                    .padding(.vertical, 6).contentShape(Rectangle())
                                    .gesture(DragGesture(minimumDistance: 2)
                                        .onChanged { v in
                                            if !dragging { dragging = true; base = amount }
                                            amount = phClamp(base - Double(v.translation.height / drawerH))     // 1:1 with the finger
                                        }
                                        .onEnded { v in
                                            dragging = false
                                            let proj = Double((v.predictedEndTranslation.height - v.translation.height) / drawerH)
                                            withMotion(.soft, reduceMotion: reduce) { amount = amount - proj > 0.5 ? 1 : 0 }
                                        })
                                    .onTapGesture { withMotion(.soft, reduceMotion: reduce) { amount = amount > 0.5 ? 0 : 1 } }
                                    .accessibilityLabel("Photo details").accessibilityValue(amount > 0.5 ? "Open" : "Closed")
                                    .accessibilityAddTraits(.isButton)
                                Text("Ridge at dusk").font(.subheadline.weight(.semibold))
                                ForEach(rows.indices, id: \.self) { i in
                                    HStack { Text(rows[i].0).foregroundStyle(.secondary); Spacer(); Text(rows[i].1) }.font(.caption)
                                        .opacity(phRange(pa, 0.3 + Double(i) * 0.18, 0.55 + Double(i) * 0.18))   // rows fade up as the drawer passes each threshold
                                }
                            }
                            .padding(.horizontal, 14).padding(.bottom, 10)
                            .frame(width: g.size.width, height: drawerH, alignment: .top)
                            .background(.regularMaterial)
                            .offset(y: (drawerH - 40) * (1 - a))      // closed, only the handle peeks
                        }
                    }
                }
                .frame(width: g.size.width, height: h)
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .frame(height: 230)
        }
    }
}
