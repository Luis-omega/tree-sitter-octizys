
[
  "("
  ")"
  "{"
  "}"
] @punctuation.bracket

[
  ","
  ":"
  ";"
 ] @punctuation.delimiter

[
  "!"
  "#"
  "~"
  "->"
  "="
  "@"
  "|>"
  "<|"
  "*"
  "/"
  "%"
  "+"
  "-"
  "<<"
  ">>"
  ":"
  "<$>"
  "<$"
  "$>"
  "<*>"
  "*>"
  "<*"
  "=="
  "!="
  "<="
  ">="
  "&&"
  "||"
  "&"
  "$"
  "?"
] @operator

((line_comment_hypen) @comment)
((line_comment_hypen)+ @comment.todo (#any-vim-match?  @comment.todo "^-- *TODO"))
((line_comment_slash) @comment)
((line_comment_slash)+ @comment.todo (#any-vim-match?  @comment.todo "^// *TODO"))
((line_documentation_hypen) @comment.documentation)
((line_documentation_slash) @comment.documentation)
((line_documentation_hypen) @spell)
((line_documentation_slash) @spell)
((block_comment0) @comment)
((block_comment1) @comment)
((block_comment2) @comment)
((block_comment3) @comment)
((block_documentation0) @comment.documentation)
((block_documentation1) @comment.documentation)
((block_documentation2) @comment.documentation)
((block_documentation3) @comment.documentation)
((block_documentation0) @spell)
((block_documentation1) @spell)
((block_documentation2) @spell)
((block_documentation3) @spell)


((module_path) @module)

((uint) @number)

((float_) @number.float)

((string) @string)

((character) @character)

((import_item) @variable)

( (label) @variable.member)

((multiplicity_literal) @keyword.modifier)

(multiplicity_variable) @type.variable

(import_declaration
  ("import" @keyword.import)
  ("unqualified" @keyword.import)?
  [(
    imported_variable (module_path) @module (local_variable) @module
   )
   (
    (local_variable) @module
   )
  ]
  ("(" (import_item)+ ")")?
  (
   ("as" @keyword.import) [
                    (imported_variable) (local_variable)
                   ]
  )?
)

(type_base  _  @type.builtin)

(kind _ @type.builtin)

(type_variable
  (local_variable) @type.variable
)

(type_variable
  (imported_variable (module_path) @module (local_variable) @type.variable)
)

(type_parameter
  (local_variable) @variable.parameter
)

(type_record_item
  (label) @variable.member
  ":" @punctuation.delimiter
  (_)
)

(type_record
  "{"
  (_)
  (_)*
  ","?
  ("|" "..."? @variable.parameter.builtin )?
  "}"
)

(type_scheme_forall
  "forall" @keyword.function
  _
)

(type_scheme
  _
  "." @punctuation.delimiter
  _
)

( (pattern_hole) @variable_parameter.builtin
)

(pattern_variable
    (local_variable) @variable.parameter
)

(pattern_variable
  (imported_variable (module_path) @module (local_variable) @constructor )
)

(pattern_record
  "{"
  _
  _*
  ("," "..."? @keyword.modifier)?
  "}"
)

(pattern_bind
  _ "@" @keyword.modifier _
)

(pattern_application
  (pattern_variable) @constructor (#set! priority 105)
  (_)+
)

((expression_named_hole) @variable.parameter.builtin
)

(expression_case
  "case" @keyword.conditional
  (_)
  "of" @keyword.conditional
  "{"
  (_)
  "}"
)

(expression_selector
  (_)
  (selector) @function.method
)

(expression_type_argument
  "@" @keyword.modifier _
)

((expression_application)
  (expression_variable (_)) @function.call
  (_)
)

(expression_let
  "let" @keyword.function
  (_)
  "in" @keyword.function
)

(expression_lambda
  "\\" @keyword.function
  (_)
  "->" @keyword.function
  (_)
)

(top_type_declaration_left
  name : (local_variable) @constructor
  (type_parameter)*
)

(data_type_constructor_type
  name: (local_variable) @constructor
  type: (_)?
)

(data_type_constructor_item
 separator: "|" @punctuation.delimiter
 _
)

( "public"? @keyword
  "data" @type.definition
  _
  (("=") @operator)
  [ (
      "|" ? @punctuation.delimiter
      _
      _
      "|"? @punctuation.delimiter
    )
   "|"? @punctuation.delimiter
  ]
)

("public"? @keyword
  "alias" @type.definition
  _
  "=" @operator
  _
)

("public"? @keyword
  "newtype" @type.definition
  _
  "=" @operator
  _
)

("public"? @keyword
  "class" @keyword.type
  _
  "{"
  _
  "}"
)

("public"? @keyword
  "instance" @keyword.type
  (local_variable) @variable
  (local_variable) @variable
  _
  "as"
  "{"
  _
  "}"
)

(function_parameter
  (local_variable) @variable.parameter
  ":" @punctuation.delimiter
  (_)
)

(function_parameter
  "(" @punctuation.bracket
  (local_variable) @variable.parameter
  ":" @punctuation.delimiter
  (_)
  ")" @punctuation.bracket
)

