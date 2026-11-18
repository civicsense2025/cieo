import CieoGallery
import CieoUI
import SwiftUI

@main
struct CieoShowcaseApp: App {
    @FocusedValue(\.catalogShowcaseActions) private var showcaseActions

    var body: some Scene {
        WindowGroup("Cieo Showcase") {
            CatalogRoot()
        }
        #if os(macOS)
        .defaultSize(width: 1240, height: 820) // literal-ok: default macOS window size
        #endif
        .commands {
            CommandMenu("Showcase") {
                Button("Command Search…") {
                    showcaseActions?.openCommandPalette()
                }
                .keyboardShortcut("k", modifiers: .command)
                .disabled(showcaseActions == nil)

                Button("Toggle Environment Inspector") {
                    showcaseActions?.toggleInspector()
                }
                .keyboardShortcut("i", modifiers: [.command, .option])
                .disabled(showcaseActions == nil)

                Divider()

                Menu("Theme Brand") {
                    ForEach(ThemeBrand.allCases, id: \.self) { brand in
                        Button(brand.label) {
                            showcaseActions?.selectBrand(brand)
                        }
                    }
                }
                .disabled(showcaseActions == nil)

                Menu("Surface Ground") {
                    ForEach(ThemeGround.allCases, id: \.self) { ground in
                        Button(ground.rawValue.capitalized) {
                            showcaseActions?.selectGround(ground)
                        }
                    }
                }
                .disabled(showcaseActions == nil)

                Divider()

                Button("Toggle Reduce Motion Preview") {
                    showcaseActions?.toggleReduceMotion()
                }
                .disabled(showcaseActions == nil)
            }
        }
    }
}
