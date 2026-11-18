import Foundation

public extension MotionAtomInfo {
    /// Each word can match a different metadata field, so “forms validation” is useful.
    func matches(_ query: String) -> Bool {
        let words = query.split(whereSeparator: \.isWhitespace)
        let optionalFields = [layer, pack, formula].compactMap { $0 }
        let fields = [name, category, id, summary] + optionalFields + families
        return words.allSatisfy { word in
            fields.contains { $0.localizedStandardContains(String(word)) }
        }
    }
}
