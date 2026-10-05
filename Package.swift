// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Cieo",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "Cieo", targets: ["Cieo"]),
        .library(name: "CieoAtoms", targets: ["CieoAtoms"]),
    ],
    targets: [
        .target(name: "Cieo"),
        .target(name: "CieoAtoms", dependencies: ["Cieo"], path: "atoms/swift"),
        .testTarget(name: "CieoTests", dependencies: ["Cieo"]),
    ]
)
