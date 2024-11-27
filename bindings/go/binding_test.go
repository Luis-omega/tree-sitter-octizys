package tree_sitter_octizys_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_octizys "github.com/luis-omega/tree-sitter-octizys.git/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_octizys.Language())
	if language == nil {
		t.Errorf("Error loading Octizys grammar")
	}
}
