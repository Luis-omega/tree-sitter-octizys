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
    source_file: $ => repeat($.top_item),
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
    _module_separator: $=> token("/"),

    //module_path : $ => prec.right(repeat1($.module_path_item)),
    //token(repeat1(seq(identifier_,"::"))),

    uint : $ => token(uint_),

    //TODO: add float support
    //float_ : $ => token(seq(uint_,".",uint_,optional(seq(/e|E/u,uint_)))),

    //TODO: add strings
    //TODO: add scape sequences to strings and chars
    //string : $ => token(/"([^"\n]|\\")*"/u),

    //TODO: add character support
    //character : $ => token(/'.'/u),

    local_variable : $ => $._identifier,

    logic_path :$ => choice(seq($._identifier,$._module_separator), seq($._identifier,$._module_separator,$.logic_path)),
    
    //TODO: add records
    //selector : $ => token(seq(".",identifier_)),


//--------------------------Type ----------------------------------

    type_literal : $ => choice(
      "Int", 
      "Bool"
    ),

    type_variable : $ => choice(
      $.local_variable, 
    ),

    type_parens : $ => seq("(",$._type_expression,")"),

    _type_atom_no_var : $ => choice(
      $.type_literal,
      $.type_parens,
    ),


    _type_atom : $ => choice(
      $._type_atom_no_var,
      $.type_variable,
    ),

    type_arrow : $ => seq($._type_atom, repeat(seq("->",$._type_atom)) ),

    _type_expression : $ => $.type_arrow,

//--------------------------Expression ----------------------------------

    expression_literal : $ => choice($.uint,"True","False"),

    expression_variable : $ => $.local_variable,

    expression_parens : $ => seq("(",$._expression,optional(seq(":",$._type_expression)),")"),

    _expression_atom : $ =>choice(
      $.expression_literal,
      $.expression_parens,
      $.expression_variable,
    ),

    expression_application : $ => seq(
      field("function",$._expression_atom)
      ,field("arguments",repeat($._expression_atom))
    ),

    inner_parameter_alone : $ =>$.local_variable,

    inner_parameter_with_type : $ =>seq($.local_variable,":",$._type_expression),

    inner_parameter : $=>choice($.inner_parameter_alone,$.inner_parameter_with_type),

    parameter : $ => seq(",",$.inner_parameter),

    parameters : $ => 
      seq($.inner_parameter ,repeat($.parameter)),


    scheme_start : $ => seq("forall", 
      field("type_arguments",repeat1($.local_variable)), 
      "." ),

    definition_type_annotation : $ => seq(
        ":", 
      optional(field("scheme_start", $.scheme_start)),
      optional(seq(field("parameters",$.parameters),"|-")),
      field("output_type",$._type_expression))  ,

    definition : $ => seq(
      field("name",$.local_variable),
      optional(
        field("definition_type_annotation",$.definition_type_annotation)
      ),
      "=",
      $._expression
    ),

    expression_function : $ => seq("\\", optional($.parameters) , $.inner_parameter ,"|-",$._expression),

    expression_if : $ => 
      seq("if",$._expression,"then",$._expression,"else",$._expression),

    expression_let : $ => choice(
      seq("let",repeat1(seq($.definition,";")),"in",$._expression),
    ),

    _expression: $ => choice(
      $.expression_if,
      $.expression_let,
      $.expression_function,
      $.expression_application,
    ),
    
//--------------------------Module level ----------------------------------
    import_logic_path : $ => seq(optional($.logic_path),$._identifier),

    import_statement : $  =>  seq(
      "import",
      field("origin",$.import_logic_path),
      optional(seq(
        "as",
        field("alias",$.import_logic_path)
      ))
    ),

    top_item : $ => seq(choice($.import_statement,$.definition),";")
  }
});
