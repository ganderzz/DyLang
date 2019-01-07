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
        parent._context.push(node);
      }
    },

    DecimalLiteral: {
      enter(node, parent) {
        parent._context.push(node);
      }
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push(node);
      }
    },

    Operator: {
      enter(node, parent) {
        parent._context.push(node);
      }
    },

    Identifier: {
      enter(node, parent) {
        parent._context.push(node);
      }
    },

    Separator: {
      enter(node, parent) {
        parent._context.push(node);
      }
    },

    Return: {
      enter(node, parent) {
        node._context = [];
        parent._context.push(node);
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
            expression
          } as any;
        }

        if (!node.value) {
          expression = {
            type: "Variable",
            name: node.name
          } as any;
        }

        parent._context.push(expression);
      }
    },

    Function: {
      enter(node, parent) {
        node._context = [];

        parent._context.push(node);
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
          arguments: [],
          expression: null
        };

        node._context = expression.arguments;

        parent._context.push(expression);
      }
    }
  });

  return newAst;
}
