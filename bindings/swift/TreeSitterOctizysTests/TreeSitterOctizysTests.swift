import XCTest
import SwiftTreeSitter
import TreeSitterOctizys

final class TreeSitterOctizysTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_octizys())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Octizys grammar")
    }
}
