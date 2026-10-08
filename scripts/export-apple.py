#!/usr/bin/env python3
"""Export/check a portable runtime subset. Never overwrite edited mirror files."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = "mirror.json"
PACKAGE = '''// swift-tools-version: 5.9
// Generated runtime subset. Source ownership and hashes are in mirror.json.
import PackageDescription
let package = Package(
    name: "Cieo",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "Cieo", targets: ["Cieo"]),
               .library(name: "CieoUI", targets: ["CieoUI"]),
               .library(name: "CieoGallery", targets: ["CieoGallery"]),
               .library(name: "CieoAtoms", targets: ["CieoAtoms"])],
    targets: [.target(name: "Cieo"),
              .target(name: "CieoAtoms", dependencies: ["Cieo"], path: "atoms/swift"),
              .target(name: "CieoUI", dependencies: ["Cieo"], resources: [.process("Resources")]),
              .target(name: "CieoGallery", dependencies: ["CieoUI", "Cieo", "CieoAtoms"]),
              .testTarget(name: "CieoAtomsTests", dependencies: ["CieoAtoms"]),
              .testTarget(name: "CieoTests", dependencies: ["Cieo"]),
              .testTarget(name: "CieoUITests", dependencies: ["CieoUI"])])
'''


def digest(data):
    return hashlib.sha256(data).hexdigest()


def member(root, name):
    root = root.resolve()
    path = root / name
    if not path.resolve().is_relative_to(root) or path.is_symlink():
        raise ValueError("Mirror members must stay inside the destination")
    return path


def inventory():
    data = {"Package.swift": PACKAGE.encode()}
    for directory in ["Sources/Cieo", "Sources/CieoUI", "Sources/CieoGallery", "Tests/CieoTests", "Tests/CieoUITests", "Tests/CieoAtomsTests", "atoms/swift"]:
        for path in sorted((ROOT / directory).rglob("*")):
            if path.is_symlink():
                raise ValueError("Source symlinks are not portable")
            if path.is_file():
                data[path.relative_to(ROOT).as_posix()] = path.read_bytes()
    return data


def validate_file_set(previous, current, allow_new_files):
    if not previous.issubset(current):
        raise ValueError("Removing mirror members requires a separate migration")
    if previous != current and not allow_new_files:
        raise ValueError("File set changed; review additions with --allow-new-files")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--allow-new-files", action="store_true")
    args = parser.parse_args()
    destination = args.destination.resolve()
    if destination == ROOT or ROOT.is_relative_to(destination) or destination.is_relative_to(ROOT):
        raise ValueError("Export to a separate consumer checkout")
    files = inventory()
    # A revision identifies source only when these inputs are committed and unchanged.
    dirty = subprocess.check_output(["git", "status", "--porcelain", "--", "Sources", "Tests", "Package.swift", "scripts/export-apple.py", "atoms/swift"], cwd=ROOT, text=True)
    if dirty:
        raise ValueError("Commit the runtime source before exporting")
    revision = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    manifest = {"schema": 1, "owner": "Cieo runtime", "sourceRevision": revision,
                "sourcePackageSHA256": digest((ROOT / "Package.swift").read_bytes()),
                "scope": "Motion core, production UI and complete native recipe catalogue",
                "files": {name: digest(data) for name, data in sorted(files.items())}}
    files[MANIFEST] = (json.dumps(manifest, indent=2) + "\n").encode()
    if args.check:
        for name, data in files.items():
            path = member(destination, name)
            if not path.is_file() or path.read_bytes() != data:
                raise ValueError(f"Mirror drift: {name}")
        observed = {p.relative_to(destination).as_posix() for p in destination.rglob("*") if p.is_file() and not any(part.startswith(".") for part in p.relative_to(destination).parts)}
        if observed != set(files):
            raise ValueError("Unexpected mirror files")
        print(f"Exact runtime mirror verified at {revision}")
        return
    if destination.exists() and any(destination.iterdir()):
        previous = json.loads((destination / MANIFEST).read_text())
        if previous.get("owner") != "Cieo runtime":
            raise ValueError("Destination is not an owned runtime mirror")
        validate_file_set(set(previous["files"]), set(manifest["files"]), args.allow_new_files)
        for name in set(manifest["files"]) - set(previous["files"]):
            if member(destination, name).exists():
                raise ValueError(f"Preserve unowned destination file: {name}")
        for name, checksum in previous["files"].items():
            if digest(member(destination, name).read_bytes()) != checksum:
                raise ValueError(f"Preserve edited mirror file: {name}")
    destination.mkdir(parents=True, exist_ok=True)
    for name, data in files.items():
        path = member(destination, name)
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists() or path.read_bytes() != data:
            path.write_bytes(data)
    print(f"Exported {len(manifest['files'])} runtime files at {revision}")


if __name__ == "__main__":
    main()
