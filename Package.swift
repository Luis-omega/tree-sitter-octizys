// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterOctizys",
    products: [
        .library(name: "TreeSitterOctizys", targets: ["TreeSitterOctizys"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterOctizys",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterOctizysTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterOctizys",
            ],
            path: "bindings/swift/TreeSitterOctizysTests"
        )
    ],
    cLanguageStandard: .c11
)
