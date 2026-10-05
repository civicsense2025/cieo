// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MotionKit",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "MotionKit", targets: ["MotionKit"]),
        .library(name: "MotionKitAtoms", targets: ["MotionKitAtoms"]),
    ],
    targets: [
        .target(name: "MotionKit"),
        .target(name: "MotionKitAtoms", dependencies: ["MotionKit"], path: "atoms/swift"),
        .testTarget(name: "MotionKitTests", dependencies: ["MotionKit"]),
    ]
)
