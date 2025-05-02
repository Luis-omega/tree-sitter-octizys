build: 
  tree-sitter generate

update: build
  nvim --headless +":TSUpdateSync octizys" +":q"

test:
  tree-sitter test

pudate-test:
  tree-sitter test -ru


