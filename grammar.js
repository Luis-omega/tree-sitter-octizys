/**
 * @file A functional laguage
 * @author Luis Alberto Díaz Díaz <73986926+Luis-omega@users.noreply.github.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const identifier_ = /\p{XID_Start}(_|\p{XID_Continue})*/u
const uint_ = /(([1-9][0-9_]*)|(0(0|_)*))/u;
const line_documentation_hypen_  = /-- \|[^\n]*\n/u;
const line_comment_hypen_ = /--[^\n]*\n/u;
const line_documentation_slash_  = /\/\/ \|[^\n]*\n/u;
const line_comment_slash_ = /\/\/[^\n]*\n/u;


module.exports = grammar({
  name: "octizys",
  extras : $ => [
    $._spaces,
    $.line_documentation_hypen,
    $.line_documentation_slash,
    $.line_comment_hypen,
    $.line_comment_slash,
    $.block_comment0,
    $.block_comment1,
    $.block_comment2,
    $.block_comment3,
    $.block_documentation0,
    $.block_documentation1,
    $.block_documentation2,
    $.block_documentation3,
  ],
  word : $ =>  $._identifier,

  rules: {
    //This rule is named top in the rust grammar, 
    //but tree sitter needs this name.
    source_file: $ => seq(
      repeat(seq($.import_declaration,";")),
      repeat(
        choice(
          seq($.data_type,";"),
          seq($.alias_type,";"),
          seq($.new_type,";"),
          $.interface_declaration,
          $.instance_definition,
          $.function_definition,
        )
      )
    ),
//--------------------------Common ----------------------------------

    _spaces : $ => token(/\s+/u),

    line_documentation_hypen: $ => token(prec(5,line_documentation_hypen_)),
    line_documentation_slash: $ => token(prec(5,line_documentation_slash_)),
    line_comment_hypen : $ => token(line_comment_hypen_),
    line_comment_slash : $ => token(line_comment_slash_),

    block_comment0 : $ => token(prec(1,/\{-([^}]|[^-]\})*-\}/u)),
    block_comment1 : $ => token(prec(2,/\{--([^}]|[^-](|-\}))*--\}/u)),
    block_comment2 : $ => token(prec(3,/\{---([^}]|[^-](|-\}|--\}))*---\}/u)),
    block_comment3 : $ => token(prec(4,/\{----([^}]|[^-](|-\}|--\}|---\}))*----\}/u)),

    block_documentation0 : $ => token(prec(10,/\{-\|([^}]|[^-]\})*-\}/u)),
    block_documentation1 : $ => token(prec(11,/\{--\|([^}]|[^-](|-\}))*--\}/u)),
    block_documentation2 : $ => token(prec(12,/\{---\|([^}]|[^-](|-\}|--\}))*---\}/u)),
    block_documentation3 : $ => token(prec(13,/\{----\|([^}]|[^-](|-\}|--\}|---\}))*----\}/u)),


    _identifier : $ => token(identifier_),

    module_separator : $ => "/",

    module_path : $ => choice(seq($.module_path, $._identifier, $.module_separator),seq($._identifier, $.module_separator)),

    //module_path : $ => prec.right(repeat1($.module_path_item)),
    //token(repeat1(seq(identifier_,"::"))),

    uint : $ => token(uint_),

    float_ : $ => token(seq(uint_,".",uint_,optional(seq(/e|E/u,uint_)))),

    //TODO: add scape sequences to strings and chars
    string : $ => token(/"([^"\n]|\\")*"/u),

    character : $ => token(/'.'/u),

    local_variable : $ => $._identifier,

    //TODO: add keywords
    label: $ => $._identifier,

    imported_variable : $ => seq($.module_path,$.local_variable),

    infix_identifier : $ => token(seq("`",identifier_,"`")),

    selector : $ => token(seq(".",identifier_)),

    multiplicity_literal : $ => token("'0|'1|'inf"),

    multiplicity_variable : $ => token(seq("'",identifier_)),

//--------------------------Import ----------------------------------

    import_item : $ => $.local_variable,

    import_list : $ => seq($.import_item, repeat(seq(",",$.import_item)), optional(",")),

    import_declaration:  $ =>  seq(
      "import" ,
      optional("unqualified"),
      field("path",$.module_path),
      field("imports",optional(seq("(",optional($.import_list),")"))),
      field("qualifier",optional(seq("as", choice($.imported_variable,$.local_variable))))
    ),

//--------------------------Type ----------------------------------


    //TODO: maybe we need effects instead of Exception or 
    //only the particular `log` effect 
    kind : $ => choice(
      "Type",
      "Exception",
      "Row",
      "Ownership",
    ),

    type_multiplicity : $ => choice($.multiplicity_variable,$.multiplicity_literal),

    type_variable : $ => choice(
      $.local_variable, 
      $.imported_variable
    ),

    // we need to syntactically separate both as we can have `a b` in a type 
    // if `a` is a type the this is `application(a,b)` but if it is a 
    // multiplicity this is `type(multiplicity=a, b)`, so instead we do 
    // `'a b` to mean type(multiplicity=a,b).
    // Note that row variables doesn't have this problem
    type_parameter : $=> choice(
      $.local_variable,
      seq("(",$.local_variable,":",$.kind,")"),
      $.multiplicity_variable
    ),

    //TODO: sync with grammar, the leading comma is not optional in rust

    type_tuple_item : $ => seq(",", optional($.type_multiplicity), $._type_expression),

    type_tuple : $ => seq("(",$._type_expression,repeat1($.type_tuple_item),optional(","),")"),

    type_record_item : $ => seq($.label,":", optional($.type_multiplicity), $._type_expression),
    
    type_record : $ => seq(
      "{",
      $.type_record_item,
      repeat(seq(",",$.type_record_item)),
      optional(","),
      optional(seq("|","...")),
      "}"
    ),

    type_parens : $ => seq("(",$._type_expression,")"),

    _type_atom : $ => choice(
      $.type_variable,
      $.type_tuple,
      $.type_record,
      $.type_parens,

    ),

    _maybe_type_application  : $ => choice($.type_application,$._type_atom),

    type_arrow : $ => seq($._maybe_type_application,"->",$._maybe_type_application),

    _maybe_type_arrow  : $ => choice($.type_arrow,$._maybe_type_application),

    type_application : $ => seq($._type_atom , repeat1($._type_atom)),

    _type_interface_argument : $ => choice(
      $.type_multiplicity,
      $.imported_variable,
      $._type_atom
    ),

    type_interface_constraint : $ => seq(
      field("interface_name",$.type_variable),
      field("arguments", repeat($._type_interface_argument))
    ),

    type_interface_constraints : $ => repeat1(seq($.type_interface_constraint,"=>")),

    //TODO: can we add a local such that we can have the reference?
    type_scheme_forall : $ => seq(
      "forall",
      field("parameters",repeat1($.type_parameter)),
    ),

    type_scheme : $ => seq($.type_scheme_forall,".",
      field("constraints",optional($.type_interface_constraints)),
      $._type_expression),

    _type_expression : $ => choice(
      $.type_scheme,
      $._maybe_type_arrow
    ),



//--------------------------Pattern ----------------------------------

    pattern_variable : $ => choice($.local_variable, $.imported_variable),

    pattern_literal: $ => choice(seq(optional("-"),$.uint),$.float_,$.string,$.character),

    pattern_hole : $ => "_",

    //TODO: sync with grammar, the leading comma is not optional in rust
    pattern_tuple : $ => seq("(",$._pattern,repeat1(seq(",",$._pattern)),optional(","),")"),

    pattern_record_item : $ => seq($.label, optional(seq("=",$._pattern))),

    pattern_record : $ => seq(
      "{",
      $.pattern_record_item, 
      repeat(seq(",",$.pattern_record_item)),
      optional(seq(",",optional("..."))),
      "}"
    ),
      
    pattern_parens : $ => seq("(",$._pattern,")"),

    _pattern_atom : $ => choice(
      $.pattern_literal,
      $.pattern_variable,
      $.pattern_hole,
      $.pattern_tuple,
      $.pattern_record,
      $.pattern_parens,
    ),

    pattern_bind : $ => seq($.local_variable, "@", $._pattern_atom),

    pattern_application : $ => seq($.pattern_variable,repeat1($._pattern_atom)),

    _pattern : $ => choice(
      $.pattern_application,
      $.pattern_bind,
      $._pattern_atom
    ),

//--------------------------Expression ----------------------------------

    expression_literal : $ => choice($.uint,$.float_,$.string,$.character),

    expression_variable : $ => choice($.local_variable, $.imported_variable),

    expression_named_hole : $ => token(/_([1-9][0-9]*|(0(0|_)*))/u),

    expression_tuple : $ => seq("(",$._expression,repeat1(seq(",",$._expression)),optional(","),")"),

    //TODO: sync with rust grammar, use ":" in rust
    expression_record_item : $ => seq($.label,optional(seq(":",$._expression))),

    //TODO: support update of records with partial fields
    //TODO: add record update syntax?
    expression_record : $ => seq("{", $.expression_record_item, repeat(seq(",",$.expression_record_item)) ,optional(","),"}"),

    case_item : $ => seq($._pattern, "->", $._expression),

    expression_case : $ => seq(
      "case",
      $._expression,
      "of",
      "{",
      seq($.case_item,repeat(seq(",",$.case_item)),optional(",")),
      "}",
    ),

    expression_parens : $ => seq("(",$._expression,optional(seq(":",$._type_expression)),")"),

    _expression_atom : $ =>choice(
      $.expression_literal,
      $.expression_variable,
      $.expression_named_hole ,
      $.expression_tuple,
      $.expression_record,
      $.expression_case,
      $.expression_parens,
    ),

    expression_selector : $ => seq($._expression_atom,$.selector),

    _maybe_expression_selector : $ => choice(
      $.expression_selector,
      $._expression_atom
    ),

    expression_unary_postfix : $ => prec(40,seq($._maybe_expression_selector,"?")),

    _maybe_expression_unary_postfix : $ => choice(
      $.expression_unary_postfix,
      $._maybe_expression_selector
    ),

    expression_type_argument : $ => seq("@",$._type_atom),

    _maybe_expression_application_argument : $ => choice(
      $._maybe_expression_unary_postfix,
      $.expression_type_argument
    ),

    expression_application : $ => seq(
      $._maybe_expression_unary_postfix,
      repeat1($._maybe_expression_application_argument)
    ),

    _maybe_expression_application : $ => choice(
      $.expression_application,
      $._maybe_expression_unary_postfix
    ),

    //This is above application as we want to be able to do : 
    // `~ some boolean call` and get `negate (some boolean call)`
    // instead of `(negate some) boolean call`
    expression_unary: $ => choice(
        prec(35,seq("~",$._maybe_expression_application)),
        prec(35,seq("!",$._maybe_expression_application)),
        //TODO: maybe we want to use this for pragmas?
        prec(35,seq("#",$._maybe_expression_application)),
    ),

    _maybe_expression_unary : $ => choice(
      $.expression_unary,
      $._maybe_expression_application
    ),

    expression_binary : $=> choice(
      prec.left(30 ,seq($._maybe_expression_unary,"|>" ,$._maybe_expression_unary)), 
      prec.left(30 ,seq($._maybe_expression_unary,"<|" ,$._maybe_expression_unary)), 
      prec.left(29 ,seq($._maybe_expression_unary,"*"  ,$._maybe_expression_unary)), 
      //prec.left(29 ,seq($._maybe_expression_unary,"/"  ,$._maybe_expression_unary)), 
      prec.left(29 ,seq($._maybe_expression_unary,"%"  ,$._maybe_expression_unary)), 
      prec.left(28 ,seq($._maybe_expression_unary,"+"  ,$._maybe_expression_unary)), 
      prec.left(28 ,seq($._maybe_expression_unary,"-"  ,$._maybe_expression_unary)), 
      prec.left(27 ,seq($._maybe_expression_unary,"<<" ,$._maybe_expression_unary)), 
      prec.left(27 ,seq($._maybe_expression_unary,">>" ,$._maybe_expression_unary)), 
      prec.left(26 ,seq($._maybe_expression_unary,":"  ,$._maybe_expression_unary)), 
      prec.left(25 ,seq($._maybe_expression_unary,"<$>",$._maybe_expression_unary)), 
      prec.left(25 ,seq($._maybe_expression_unary,"<$" ,$._maybe_expression_unary)), 
      prec.left(25 ,seq($._maybe_expression_unary,"$>" ,$._maybe_expression_unary)), 
      prec.left(24 ,seq($._maybe_expression_unary,"<*>",$._maybe_expression_unary)), 
      prec.left(24 ,seq($._maybe_expression_unary,"*>" ,$._maybe_expression_unary)), 
      prec.left(24 ,seq($._maybe_expression_unary,"<*" ,$._maybe_expression_unary)), 
      prec.left(23 ,seq($._maybe_expression_unary,"==" ,$._maybe_expression_unary)), 
      prec.left(23 ,seq($._maybe_expression_unary,"!=" ,$._maybe_expression_unary)), 
      prec.left(23 ,seq($._maybe_expression_unary,"<=" ,$._maybe_expression_unary)), 
      prec.left(23 ,seq($._maybe_expression_unary,">=" ,$._maybe_expression_unary)), 
      prec.right(22,seq($._maybe_expression_unary,"&&" ,$._maybe_expression_unary)), 
      prec.right(21,seq($._maybe_expression_unary,"||" ,$._maybe_expression_unary)), 
      prec.left(20 ,seq($._maybe_expression_unary,"&"  ,$._maybe_expression_unary)), 
      prec.right(19,seq($._maybe_expression_unary,"$"  ,$._maybe_expression_unary)), 
      prec.right(15,seq($._maybe_expression_unary,$.infix_identifier,$._maybe_expression_unary)), 
    ),

    let_binding : $ => seq($._pattern,optional(seq(":",$._type_expression)),"=",$._expression),

    let_bindings : $ => seq($.let_binding,repeat(seq(",",$.let_binding)),optional(",")),

    expression_let : $ => choice(
      seq("let",$.let_bindings,"in",$._expression),
    ),

    lambda_parameter : $ => choice(
      (seq(optional($.type_multiplicity),$.local_variable)),
      seq("(", optional($.type_multiplicity),$.local_variable,":",$._type_expression ,")")
    ),

    expression_lambda : $ => seq("\\", repeat1($.lambda_parameter)  ,"->",$._expression),

    _expression: $ => choice(
      //$._maybe_expression_application
      $.expression_binary,
      $.expression_let,
      $.expression_lambda,
      $._maybe_expression_unary
    ),

    top_type_declaration_left: $ => 
      seq(
        field("name",$.local_variable),
        repeat($.type_parameter)
      ),

    data_type_constructor_type : $ =>seq(
      field("name",$.local_variable),
      optional(field("type",$._type_expression))
    ),

    data_type_constructor_item : $ => seq(
      field("separator", "|"),
      $.data_type_constructor_type
    ),

    data_type : $ => seq(
      optional("public"),
      "data",
      $.top_type_declaration_left,
      "=",
      choice(
        seq(
          optional("|"),
          $.data_type_constructor_type,
          repeat(
            $.data_type_constructor_item
          ), 
          optional("|")
        ),
        "|"
      )
    ),

    alias_type : $ => seq(
      optional("public"),
      "alias",
      $.top_type_declaration_left,
      "=",
      $._type_expression
    ),

    new_type : $ => seq(
      optional("public"),
      "newtype",
      $.top_type_declaration_left,
      "=",
      $.data_type_constructor_type
    ),

    interface_declaration : $ => seq(
      optional("public"),
      "interface", 
      $.top_type_declaration_left ,
      "{",
        repeat(seq($.function_declaration,";")),
      "}",
    ) ,

    instance_function : $ =>choice(
      $.function_definition,
      seq(
        field("name",$.local_variable),
        "=",
        field("definition",choice($.local_variable,$.imported_variable)),
        ";"
      )
    ),

    instance_definition : $ => seq(
      optional("public"),
      "instance", 
      field("instance_name",$.local_variable),
      field("interface_name",$.local_variable),
      field("types",repeat($._type_atom)),
      "as",
      "{",
        field("definitions",repeat($.instance_function)),
      "}",
    ) ,

    function_parameter: $ => choice(
      seq(optional($.type_multiplicity),$.local_variable, ":", $._maybe_type_application),
      seq("(",optional($.type_multiplicity),$.local_variable, ":", $._type_expression,")"),
    ),

    function_type_scheme : $ => seq($.type_scheme_forall,"."),

    function_body : $ => 
      seq("{",$._expression,"}"),

    function_declaration : $ => seq(
      $.local_variable, 
      ":", 
      optional($.function_type_scheme),
      //TODO: add classes here
      repeat(seq($.function_parameter,"->")), 
      optional($.type_multiplicity), $._maybe_type_application,
    ),

    function_definition : $ => seq(
      $.function_declaration,
      "=",
      $.function_body,
    )
  }
});
