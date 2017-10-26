import traverser from "./Utilities/traverser";

export default function transformer(ast) {
  let newAst = {
    type: "Program",
    body: []
  };

  ast._context = newAst.body;

  traverser(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "NumberLiteral",
          value: node.value
        });
      }
    },

    DecimalLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "DecimalLiteral",
          value: node.value
        });
      }
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "StringLiteral",
          value: node.value
        });
      }
    },

    Operator: {
      enter(node, parent) {
        parent._context.push({
          type: "Operator",
          value: node.value
        });
      }
    },

    Identifier: {
      enter(node, parent) {
        parent._context.push({
          type: "Identifier",
          value: node.value
        });
      }
    },

    Separator: {
      enter(node, parent) {
        parent._context.push({
          type: "Separator"
        });
      }
    },

    Variable: {
      enter(node, parent) {
        let expression = {
          type: "Variable",
          name: {
            type: "Identifier",
            value: node.name
          },
          value: []
        };

        node._context = expression.value;

        if (node.value !== "CallExpression") {
          expression = {
            type: "Assignment",
            expression: expression
          };
        }

        if (!node.value) {
          expression = {
            type: "Variable",
            name: node.name
          };
        }

        parent._context.push(expression);
      }
    },

    IfStatement: {
      enter(node, parent) {
        let expression = {
          type: "IfStatement",
          conditional: node.conditional,
          body: []
        };

        node._context = expression.body;

        parent._context.push(expression);
      }
    },

    ElseStatement: {
      enter(node, parent) {
        let expression = {
          type: "ElseStatement",
          body: []
        };

        node._context = expression.body;

        parent._context.push(expression);
      }
    },

    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            value: node.name
          },
          arguments: []
        };

        node._context = expression.arguments;

        if (parent.type !== "CallExpression") {
          expression = {
            type: "ExpressionStatement",
            expression: expression
          };
        }

        parent._context.push(expression);
      }
    }
  });

  return newAst;
}
