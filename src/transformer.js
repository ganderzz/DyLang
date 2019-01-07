import traverser from "./Utilities/traverser";
export default function transformer(ast) {
    var newAst = {
        type: "Program",
        body: []
    };
    ast._context = newAst.body;
    traverser(ast, {
        NumberLiteral: {
            enter: function (node, parent) {
                parent._context.push(node);
            }
        },
        DecimalLiteral: {
            enter: function (node, parent) {
                parent._context.push(node);
            }
        },
        StringLiteral: {
            enter: function (node, parent) {
                parent._context.push(node);
            }
        },
        Operator: {
            enter: function (node, parent) {
                parent._context.push(node);
            }
        },
        Identifier: {
            enter: function (node, parent) {
                parent._context.push(node);
            }
        },
        Separator: {
            enter: function (node, parent) {
                parent._context.push(node);
            }
        },
        Return: {
            enter: function (node, parent) {
                node._context = [];
                parent._context.push(node);
            }
        },
        Variable: {
            enter: function (node, parent) {
                var expression = {
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
        Function: {
            enter: function (node, parent) {
                node._context = [];
                parent._context.push(node);
            }
        },
        IfStatement: {
            enter: function (node, parent) {
                var expression = {
                    type: "IfStatement",
                    conditional: node.conditional,
                    body: []
                };
                node._context = expression.body;
                parent._context.push(expression);
            }
        },
        ElseStatement: {
            enter: function (node, parent) {
                var expression = {
                    type: "ElseStatement",
                    body: []
                };
                node._context = expression.body;
                parent._context.push(expression);
            }
        },
        CallExpression: {
            enter: function (node, parent) {
                var expression = {
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
