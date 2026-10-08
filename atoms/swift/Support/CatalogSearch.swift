import Foundation

public extension MotionAtomInfo {
    /// Each word can match a different metadata field, so “forms validation” is useful.
    func matches(_ query: String) -> Bool {
        let words = query.split(whereSeparator: \.isWhitespace)
        let fields = [name, category, id, summary]
        return words.allSatisfy { word in
            fields.contains { $0.localizedStandardContains(String(word)) }
        }
    }
}
