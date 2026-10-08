"""Boundary checks for the exporter without accessing any consumer files."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("exporter", Path(__file__).resolve().parents[1] / "scripts/export-apple.py")
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


class ExportTests(unittest.TestCase):
    def test_runtime_exports_every_native_recipe(self):
        files = exporter.inventory()
        self.assertIn("Sources/CieoUI/Resources/Highlight.metal", files)
        self.assertIn("Sources/Cieo/Spring.swift", files)
        sources = {p.relative_to(exporter.ROOT).as_posix() for p in (exporter.ROOT / "atoms/swift").rglob("*.swift")}
        self.assertTrue(sources)
        self.assertEqual({name for name in files if name.startswith("atoms/")}, sources)
        self.assertIn("Tests/CieoAtomsTests/CatalogTests.swift", files)

    def test_additions_require_explicit_review_and_removals_are_rejected(self):
        with self.assertRaises(ValueError):
            exporter.validate_file_set({"old"}, {"old", "new"}, False)
        exporter.validate_file_set({"old"}, {"old", "new"}, True)
        with self.assertRaises(ValueError):
            exporter.validate_file_set({"old", "removed"}, {"old"}, True)

    def test_member_cannot_escape_the_mirror(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory).resolve()
            with self.assertRaises(ValueError):
                exporter.member(root, "../unowned")
            (root / "link").symlink_to(root.parent)
            with self.assertRaises(ValueError):
                exporter.member(root, "link/unowned")
            self.assertEqual(exporter.member(root, "Sources/Component.swift"), root / "Sources/Component.swift")


if __name__ == "__main__":
    unittest.main()
