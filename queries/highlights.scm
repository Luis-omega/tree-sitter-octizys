
[
  "("
  ")"
] @punctuation.bracket

[
  ","
  ":"
  ";"
  "="
  "."
  "/"
 ] @punctuation.delimiter


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

((logic_path) @module
)


(type_literal
  "Int" @type.builtin
)

(type_literal
  "Bool" @type.builtin
)

( (uint) @number)

(type_variable
  (local_variable) @type.variable
)


(expression_if
  "if" @keyword.conditional
  (_)
  "then" @keyword.conditional
  (_)
  "else" @keyword.conditional
)

(expression_literal
  "True" @constant.builtin
)

(expression_literal
  "False" @constant.builtin
)

(expression_let
  "let" @keyword.function
  (_)
  "in" @keyword.function
)

(inner_parameter_alone
  (local_variable) @variable.parameter
)


(inner_parameter_with_type
  (local_variable) @variable.parameter
  ":"
  (_) @type
)


(scheme_start
  "forall"
  type_arguments: (
                   (local_variable)
                   @type.definition
                   )+
)

(scheme_start
  "forall" @keyword.modifier
)

(definition_type_annotation 
  ":"
  scheme_start: (_)?
  parameters: ((_) "|-" @keyword.function)
)


(definition
  name: (local_variable) @function
)


(expression_function
  "\\" @keyword.function
  (_)
  "|-" @keyword.function
  (_)
)

(expression_application
  function: (expression_variable) @function.call
  arguments: (_)+
)


(import_statement
  "import" @keyword.import
 )

