(import_declaration
  "import"
  _?
  path: _
  imports: _ @indent.align (#set! indent.open_delimiter "(") (#set! indent.close_delimiter ")") (#set! indent.immediate 1)
  qualifier: _
)

(type_tuple)  @indent.align (#set! indent.open_delimiter "(") (#set! indent.close_delimiter ")")(#set! indent.immediate 1)
(type_parens) @indent.align (#set! indent.open_delimiter "(") (#set! indent.close_delimiter ")")(#set! indent.immediate 1)
(type_record)  @indent.align (#set! indent.open_delimiter "{") (#set! indent.close_delimiter "}")(#set! indent.immediate 1)
(type_scheme)  @indent.align (#set! indent.open_delimiter "forall") (#set! indent.close_delimiter ".")(#set! indent.immediate 1)

(pattern_tuple)  @indent.align (#set! indent.open_delimiter "(") (#set! indent.close_delimiter ")")(#set! indent.immediate 1)
(pattern_parens) @indent.align (#set! indent.open_delimiter "(") (#set! indent.close_delimiter ")")(#set! indent.immediate 1)
(pattern_record)  @indent.align (#set! indent.open_delimiter "{") (#set! indent.close_delimiter "}")(#set! indent.immediate 1)
(expression_parens) @indent.align (#set! indent.open_delimiter "(") (#set! indent.close_delimiter ")")(#set! indent.immediate 1)


(expression_tuple)  @indent.align (#set! indent.open_delimiter "(") (#set! indent.close_delimiter ")")(#set! indent.immediate 1)
(expression_case
 "case" @indent.begin (#set! indent.immediate 1)
  _ @indent.align
  "of" @indent.end
  (_) @indent.align (#set! indent.open_delimiter "{") (#set! indent.close_delimiter "}")
)
(expression_let)  @indent.align (#set! indent.open_delimiter "let") (#set! indent.close_delimiter "in")(#set! indent.immediate 1)
(expression_lambda)  @indent.align (#set! indent.open_delimiter "\\") (#set! indent.close_delimiter "->")(#set! indent.immediate 1)

(alias_type)  @indent.align (#set! indent.open_delimiter "alias") (#set! indent.close_delimiter "=")(#set! indent.immediate 1)
(data_type)  @indent.align (#set! indent.open_delimiter "data") (#set! indent.close_delimiter "=")(#set! indent.immediate 1)
(new_type)  @indent.align (#set! indent.open_delimiter "newtype") (#set! indent.close_delimiter "=")(#set! indent.immediate 1)
(function_body)  @indent.align (#set! indent.open_delimiter "{") (#set! indent.close_delimiter "}")(#set! indent.immediate 1)


