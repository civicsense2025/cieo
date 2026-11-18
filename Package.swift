// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Cieo",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "Cieo", targets: ["Cieo"]),
        .library(name: "CieoAtoms", targets: ["CieoAtoms"]),
        .library(name: "CieoUI", targets: ["CieoUI"]),
        .library(name: "CieoGallery", targets: ["CieoGallery"]),
        .executable(name: "CieoShowcase", targets: ["CieoShowcase"]),
    ],
    targets: [
        .target(name: "Cieo"),
        .target(name: "CieoAtoms", dependencies: ["Cieo", "CieoUI"], path: "atoms/swift"),
        .testTarget(name: "CieoAtomsTests", dependencies: ["CieoAtoms"]),
        .testTarget(name: "CieoTests", dependencies: ["Cieo"]),
        .target(name: "CieoUI", dependencies: ["Cieo"], resources: [.process("Resources")]),
        .testTarget(name: "CieoUITests", dependencies: ["CieoUI"]),
        .target(name: "CieoGallery", dependencies: ["CieoUI", "Cieo", "CieoAtoms"]),
        .testTarget(name: "CieoGalleryTests", dependencies: ["CieoGallery", "CieoUI", "CieoAtoms"]),
        .executableTarget(name: "CieoShowcase", dependencies: ["CieoGallery", "CieoUI", "Cieo", "CieoAtoms"]),
    ]
)
