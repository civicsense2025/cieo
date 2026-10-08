"""Catalogue completeness and decorative chrome checks without starting 545 views."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class GalleryTests(unittest.TestCase):
    def test_index_contains_every_recipe_once(self):
        declared = []
        for path in (ROOT / "atoms/swift").rglob("*.swift"):
            if path.name.endswith(".generated.swift"):
                continue
            declared.extend(re.findall(r"public struct (\w+): MotionAtomView", path.read_text()))
        indexed = re.findall(r"MotionAtom\((\w+)\.self\)", (ROOT / "atoms/swift/AtomIndex.generated.swift").read_text())
        self.assertEqual(len(declared), 550)
        self.assertEqual(sorted(declared), sorted(indexed))
        self.assertEqual(len(indexed), len(set(indexed)))

    def test_preview_and_production_atoms_have_no_exterior_outline(self):
        for name in ["Sources/CieoGallery/Specimen.swift", "Sources/CieoUI/Atoms/ActionButtonStyle.swift",
                     "Sources/CieoUI/Atoms/SelectionChip.swift", "atoms/swift/Support/AtomStage.swift"]:
            self.assertNotIn("strokeBorder", (ROOT / name).read_text(), name)
        decorative = re.compile(r"\.overlay\((?:RoundedRectangle|Capsule)\([^\n]*?\.stroke(?:Border)?\(\.quaternary")
        for path in (ROOT / "atoms/swift").rglob("*.swift"):
            self.assertIsNone(decorative.search(path.read_text()), str(path))


if __name__ == "__main__":
    unittest.main()
