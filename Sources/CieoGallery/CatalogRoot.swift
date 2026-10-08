import CieoUI
import SwiftUI

public struct ComponentCatalog: View {
    public init() {}
    public var body: some View {
        NavigationStack { LibraryCatalog() }
            .renderingPreferences()
    }
}
