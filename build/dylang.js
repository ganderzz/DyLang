var dylang = (function () {
'use strict';

function generator(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(generator).join("");

    case "ExpressionStatement":
      return generator(node.expression) + "\n";

    case "CallExpression":
      return generator(node.callee) + "(" + node.arguments.map(generator) + ")";

    case "Assignment":
      return generator(node.expression);

    case "Variable":
      if (node.value.length > 0) {
        return `var ${generator(node.name)} = ${node.value.map(generator)}\n`;
      }
      return generator(node.name);

    case "Identifier":
      return node.name;

    case "NumberLiteral":
      return node.value;

    case "StringLiteral":
      return '"' + node.value + '"';

  }
}

function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    switch (token.type) {
      case "number":
        current++;
        return {
          type: "NumberLiteral",
          token: token.value
        };

      case "string":
        current++;
        return {
          type: "StringLiteral",
          token: token.value
        };

      case "variable":

        let node = {
          type: "Variable",
          name: token.value,
          value: []
        };
        token = tokens[++current];

        if (token.type === "assignment") {
          token = tokens[++current];
          node.value.push(walk());
        }

        return node;

      case "paren":
        if (token.value === "(") {
          token = tokens[++current];

          let node = {
            type: "CallExpression",
            name: token.value,
            params: []
          };
          token = tokens[++current];

          while (token.type !== "paren" || token.type === "paren" && token.value !== ")") {
            node.params.push(walk());
            token = tokens[current];
          }

          current++;

          return node;
        }
    }

    throw new TypeError("Invalid Type: " + token.type);
  }

  let ast = {
    type: "Program",
    body: []
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    if (!node) {
      return;
    }
    let methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "CallExpression":
        traverseArray(node.params, node);
        break;

      case "Variable":
        traverseArray(node.value, node);
        break;

      case "StringLiteral":
      case "NumberLiteral":
        break;

      default:
        throw new TypeError(node + " is invalid in traverser");
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}

function transformer(ast) {
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
          value: node.token
        });
      }
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "StringLiteral",
          value: node.token
        });
      }
    },

    Variable: {
      enter(node, parent) {
        let expression = {
          type: "Variable",
          name: {
            type: "Identifier",
            name: node.name
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

    CallExpression: {
      enter(node, parent) {

        let expression = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name
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

function tokenize(input) {
  const tokens = [];

  const rows = input.split("\n");
  let isComment = false;

  const rowsLength = rows.length;
  for (let i = 0; i < rowsLength; i++) {
    const colLength = rows[i].length;
    let current = 0;
    let parenCount = 0;

    while (current < colLength) {
      const currentElement = rows[i][current];

      if (isComment && currentElement !== "#") {
        current++;
        continue;
      } else if (isComment && currentElement === "#") {
        isComment = false;
        current++;
        continue;
      }

      if (currentElement === "#") {
        if (rows[i][++current] === "#") {
          current++;
          isComment = true;
          continue;
        }

        break;
      }

      if (/\s/.test(currentElement)) {
        current++;
        continue;
      }

      if (/[0-9]/.test(currentElement)) {
        let value = "";

        while (/[0-9]/.test(rows[i][current])) {
          value += rows[i][current];
          current++;
        }
        current++;

        tokens.push({
          type: "number",
          value: parseInt(value, 10)
        });

        continue;
      }

      if (currentElement === "$") {
        let variableName = "";

        while (/[a-z]/i.test(rows[i][++current])) {
          if (current >= colLength) {
            throw new TypeError("Unexpected end of variable on line " + (i + 1) + ":" + current);
          }

          variableName += rows[i][current];
        }

        if (!variableName) {
          throw new Error("Undeclared variable being used on line " + (i + 1) + ":" + current);
        }

        tokens.push({
          type: "variable",
          value: variableName
        });

        continue;
      }

      if (currentElement === "=") {
        if (tokens[tokens.length - 1].type !== "variable") {
          throw new Error("Cannot assign value on line " + (i + 1) + ":" + current);
        }

        current++;

        tokens.push({
          type: "assignment"
        });

        continue;
      }

      if (currentElement === "'") {
        let value = "";

        while (rows[i][++current] !== "'") {
          if (current >= colLength) {
            throw new SyntaxError("Expecting a closing ' on line " + (i + 1) + ":" + current);
          }

          value += rows[i][current];
        }
        current++;

        tokens.push({
          type: "string",
          value: value
        });
        continue;
      }

      if (currentElement === "(") {
        current++;
        parenCount++;

        tokens.push({
          type: "paren",
          value: currentElement
        });

        continue;
      }

      if (currentElement === ")") {
        current++;
        if (parenCount === 0) {
          throw new Error("Expecting ( on line " + (i + 1) + ":" + current);
        }

        parenCount--;

        tokens.push({
          type: "paren",
          value: currentElement
        });

        continue;
      }

      const characters = /[a-z\.]/i;
      if (characters.test(currentElement)) {
        let value = currentElement;

        while (characters.test(rows[i][++current])) {
          value += rows[i][current];
        }
        current++;

        tokens.push({
          type: "name",
          value: value
        });

        continue;
      }

      throw new TypeError("Invalid symbol " + rows[i][current] + " given on line " + (i + 1) + ":" + current);
    }

    if (parenCount > 0) {
      throw new Error("Expecting ) on line " + (i + 1));
    }
  }

  if (isComment) {
    throw new Error("A multi-line comment was started, but never closed");
  }

  return tokens;
}

var index = (code => {
    const t = tokenize(code);
    const p = parser(t);
    const tr = transformer(p);
    const g = generator(tr);

    return g;
});

return index;

}());
