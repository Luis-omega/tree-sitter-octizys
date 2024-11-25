/**
 * @file A functional laguage
 * @author Luis Alberto Díaz Díaz <73986926+Luis-omega@users.noreply.github.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const identifier_inner = "\\p{XID_Start}(_|\\p{XID_Continue})*"
const identifier_ = RegExp(identifier_inner);
const module_path_ = RegExp("((" + identifier_inner+")::)+");
const infix_identifier = RegExp("`"+identifier_inner+"`");
const selector_ = RegExp("\\."+identifier_inner);
const uint_inner = "(([1-9][0-9_]*)|(0(0|_)*))";
const uint_ = RegExp(uint_inner);
const float_ = RegExp(uint_inner+"\\."+uint_inner+"(e|E)"+uint_inner);
const block_comment_ = /\{-.*-\}.*\n/u;
const line_comment_dash_ = /--[^\n]*\n/u;
const line_comment_slash_ = /\/\/[^\n]*\n/u;


module.exports = grammar({
  name: "octizys",
  extras : $ => [$.spaces,$.comment],
  word : $ =>  $.identifier,

  rules: {
    //This rule is named top in the rust grammar, 
    //but tree sitter needs this name.
    source_file: $ => seq(
      repeat(seq($.import_declaration,optional(";"))),
      repeat(
        choice(
          seq($.data_type,";"),
          seq($.alias_type,";"),
          seq($.new_type,";"),
          seq($.function_declaration,";"),
        )
      )
    ),
//--------------------------Common ----------------------------------

    spaces : $ => token(/\s+/u),

    comment : $ => choice(token(line_comment_slash_),token(line_comment_dash_),token(block_comment_)),

    identifier : $ => token(identifier_),
    module_path : $ => token(module_path_),

    uint : $ => token(uint_),

    float_ : $ => token(float_),

    //TODO: add scape sequences to strings and chars
    string : $ => token(/"([^"\n]|\\")*"/u),

    character : $ => token(/'.'/u),

    local_variable : $ => $.identifier,

    imported_variable : $ => seq($.module_path,$.local_variable),

    infix_identifier : $ => token(infix_identifier),

    selector : $ => token(selector_),

//--------------------------Import ----------------------------------

    import_item : $ => $.local_variable,

    import_list : $ => seq($.import_item, repeat(seq(",",$.import_item)), optional(",")),

    import_declaration:  $ =>  seq(
      "import" ,
      optional("unqualified"),
      choice($.imported_variable,$.local_variable),
      optional(seq("(",optional($.import_list),")")),
      optional(seq("as", choice($.imported_variable,$.local_variable)))
    ),

//--------------------------Type ----------------------------------

    type_base : $ => choice(
      "U8",
      "U16",
      "U32",
      "U64",
      "I8",
      "I16",
      "I32",
      "I64",
      "F32",
      "F64",
      "Char",
      "String",
    ),

    type_variable : $ => choice($.local_variable, $.imported_variable),

    //TODO: sync with grammar, the leading comma is not optional in rust
    type_tuple : $ => seq("(",$.type_expression,repeat1(seq(",",$.type_expression)),optional(","),")"),

    type_record_item : $ => seq($.identifier,":",$.type_expression),

    type_record : $ => seq("{", $.type_record_item, repeat(seq(",",$.type_record_item)) ,optional(","),"}"),

    type_atom : $ => choice(
      $.type_base,
      $.type_variable,
      $.type_tuple,
      $.type_record,
      seq("(",$.type_expression,")")
    ),

    type_application : $ => choice(seq($.type_atom , repeat1($.type_atom)),$.type_atom),

    type_arrow : $ => choice(seq($.type_application,repeat1(seq("->",$.type_application))),$.type_application),
    type_scheme : $ => choice(seq("forall",repeat1($.local_variable),".",$.type_arrow),$.type_arrow),

    type_expression : $=> $.type_scheme,


//--------------------------Pattern ----------------------------------

    pattern_variable : $ => choice($.local_variable, $.imported_variable),

    //TODO: handle negative integers.
    pattern_literal: $ => choice($.uint,$.float_,$.string,$.character),

    pattern_hole : $ => "_",

    //TODO: sync with grammar, the leading comma is not optional in rust
    pattern_tuple : $ => seq("(",$.pattern,repeat1(seq(",",$.pattern)),optional(","),")"),

    pattern_record_item : $ => seq($.identifier,"=",$.pattern),

    pattern_record : $ => seq("{", $.pattern_record_item, repeat(seq(",",$.pattern_record_item)) ,optional(choice(",","...")),"}"),

    pattern_atom : $ => choice(
      $.pattern_literal,
      $.pattern_variable,
      $.pattern_hole,
      $.pattern_tuple,
      $.pattern_record,
      seq("(",$.pattern,")"),
    ),

    pattern_bind : $ => choice(seq($.local_variable, "@", $.pattern_atom),$.pattern_atom),

    pattern_application : $ => seq($.pattern_variable, repeat($.pattern_bind)),

    pattern : $ => $.pattern_application,

//--------------------------Expression ----------------------------------

    expression_literal : $ => choice($.uint,$.float_,$.string,$.character),

    expression_variable : $ => choice($.local_variable, $.imported_variable),

    expression_named_hole : $ => token(/_([1-9][0-9]*|(0(0|_)*))/u),

    expression_tuple : $ => seq("(",$.expression,repeat1(seq(",",$.expression)),optional(","),")"),

    //TODO: sync with rust grammar, use ":" in rust
    expression_record_item : $ => seq($.identifier,optional(seq(":",$.pattern))),

    expression_record : $ => seq("{", $.expression_record_item, repeat(seq(",",$.expression_record_item)) ,optional(","),"}"),

    case_item : $ => seq($.pattern, "->", $.expression),

    expression_case : $ => seq(
      "case",
      $.expression,
      "of",
      "{",
      seq($.case_item,repeat(seq(",",$.case_item)),optional(",")),
      "}",
    ),

    expression_atom: $ => choice(
      $.expression_literal,
      $.expression_variable,
      $.expression_named_hole ,
      $.expression_tuple,
      $.expression_record,
      $.expression_case,
      seq("(",$.expression,")")
    ),

    //TODO: fix the ? operator (see rust grammar)j
    expression_selector : $ =>seq($.expression_atom, repeat1(seq($.selector,optional("?")))),

    expression_argument : $ => choice(
      seq("@",$.type_atom),
      $.expression_selector,
      seq($.expression_atom,optional("?")),
    ),

    expression_application : $ => choice(
      seq($.expression_selector, repeat($.expression_argument)),
      seq($.expression_atom, repeat($.expression_argument))
    ),

    expression_infix_application : $ => seq($.expression_application, optional(seq($.infix_identifier, $.expression_application))),

    expression_unary_operator : $ => seq(
      choice("-","!","#"),
      $.expression_infix_application
    ),

    expression_binary_operator : $ => choice(
      prec.left(30,seq($.expression,"|>",$.expression)), 
      prec.left(30,seq($.expression,"<|",$.expression)), 
      prec.left(29,seq($.expression,"*",$.expression)), 
      prec.left(29,seq($.expression,"/",$.expression)), 
      prec.left(29,seq($.expression,"%",$.expression)), 
      prec.left(28,seq($.expression,"+",$.expression)), 
      prec.left(28,seq($.expression,"-",$.expression)), 
      prec.left(27,seq($.expression,"<<",$.expression)), 
      prec.left(27,seq($.expression,">>",$.expression)), 
      prec.left(26,seq($.expression,":",$.expression)), 
      prec.left(25,seq($.expression,"<$>",$.expression)), 
      prec.left(25,seq($.expression,"<$",$.expression)), 
      prec.left(25,seq($.expression,"$>",$.expression)), 
      //TODO: sync with rust grammar
      prec.left(24,seq($.expression,"<*>",$.expression)), 
      prec.left(24,seq($.expression,"*>",$.expression)), 
      prec.left(24,seq($.expression,"<*",$.expression)), 
      prec.left(23,seq($.expression,"==",$.expression)), 
      prec.left(23,seq($.expression,"!=",$.expression)), 
      prec.left(23,seq($.expression,"<=",$.expression)), 
      prec.left(23,seq($.expression,">=",$.expression)), 
      prec.right(22,seq($.expression,"&&",$.expression)), 
      prec.right(21,seq($.expression,"||",$.expression)), 
      prec.left(20,seq($.expression,"&",$.expression)), 
      prec.right(19,seq($.expression,"$",$.expression)), 
    ),

    let_binding : $ => seq($.pattern,optional(seq(":",$.type_expression)),"=",$.expression),

    let_bindings : $ => seq($.let_binding,repeat(seq(",",$.let_binding)),optional(",")),

    expression_let : $ => choice(
      $.expression_unary_operator,
      $.expression_binary_operator,
      seq("let",$.let_bindings,"in",$.expression),
    ),

    expression : $ => $.expression_let,

    data_type : $ => seq(
      optional("public"),
      "data",
      $.local_variable,
      repeat($.local_variable),
      "=",
      choice(
        seq(
          optional("|"),$.local_variable, optional($.type_expression),
          repeat(
            seq("|",$.local_variable, optional($.type_expression))
          ), 
          optional("|")
        ),
        "|"
      )
    ),

    alias_type : $ => seq(
      optional("public"),
      "alias",
      repeat1($.local_variable),
      "=",
      $.type_expression
    ),

    new_type : $ => seq(
      optional("public"),
      "newtype",
      repeat1($.local_variable),
      "=",
      $.local_variable,
      $.type_expression
    ),

    function_type: $ => choice(
      seq($.local_variable, ":", $.type_application),
      seq("(",$.local_variable, ":", $.type_expression,")"),
    ),

    function_declaration : $ => seq(
      $.local_variable, ":", 
      repeat(seq($.function_type,"->")), $.type_application,
      "=",
      "{",
      $.expression,
      ")",
    ),
  }
});
