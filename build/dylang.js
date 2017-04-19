var dylang = (function () {
'use strict';

function generator(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(generator).join("");

    case "ExpressionStatement":
      return generator(node.expression) + ";";

    case "CallExpression":
      return generator(node.callee) + "(" + node.arguments.map(generator) + ")";

    case "Assignment":
      return generator(node.expression);

    case "Variable":
      if (node.value.length > 0) {
        return `var ${generator(node.name)} = ${node.value.map(generator)};`;
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
            throw new TypeError("Unexpected end of input in row " + (i + 1));
          }

          variableName += rows[i][current];
        }

        tokens.push({
          type: "variable",
          value: variableName
        });

        continue;
      }

      if (currentElement === "=") {
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
            throw new SyntaxError("Expecting a closing ' in row " + (i + 1));
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

        tokens.push({
          type: "paren",
          value: currentElement
        });

        continue;
      }

      if (currentElement === ")") {
        current++;

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

      throw new TypeError("Invalid symbol " + rows[i][current] + " given in row: " + (i + 1));
    }
  }
  console.error(tokens);
  return tokens;
}

function add(a, b) {
  return a + b;
}
function subtract(a, b) {
  return a - b;
}
function multiply(a, b) {
  return a * b;
}
function divide(a, b) {
  return a / b;
}
function print(...input) {
  console.log(input.join(" "));
}
function writeTo(elem, input) {
  elem.innerHTML = input;
}

window.add = add;
window.subtract = subtract;
window.multiple = multiply;
window.divide = divide;
window.print = print;
window.writeTo = writeTo;

var index = (() => {
  function compiler(code) {
    const t = this.tokenize(code);
    const p = this.parser(t);
    const tr = this.transformer(p);
    const g = this.generator(tr);

    return {
      result: g
    };
  }

  compiler.prototype.tokenize = function (input) {
    return tokenize(input);
  };

  compiler.prototype.parser = function (input) {
    return parser(input);
  };

  compiler.prototype.transformer = function (input) {
    return transformer(input);
  };

  compiler.prototype.generator = function (input) {
    return generator(input);
  };

  return compiler;
})();

return index;

}());
