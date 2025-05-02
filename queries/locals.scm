(expression_let) @local.scope

(parameter_alone
  (local_variable) @local.definition.parameter
)

(parameter_with_type
  (local_variable) @local.definition.parameter
  ":"
  (_) @local.definition.associated
)

(expression_function) @local.scope


(expression_let) @local.scope

(top_item ((definition) @local.scope))

(top_item
  (definition
    name:(local_variable) @local.definition.function
  )
)

