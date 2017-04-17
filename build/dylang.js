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
  let current = 0;
  const tokens = [];

  while (current < input.length) {
    const currentElement = input[current];

    if (currentElement === "#") {
      current++;
      if (input[current] === "#") {
        current++;
        while (input[current++] !== "#") {}
      } else {
        while (input[current++] !== "\n") {}
      }

      continue;
    }

    if (/\s/.test(currentElement)) {
      current++;
      continue;
    }

    if (/[0-9]/.test(currentElement)) {
      let value = "";

      while (/[0-9]/.test(input[current])) {
        value += input[current];
        current++;
      }

      tokens.push({
        type: "number",
        value: parseInt(value, 10)
      });

      continue;
    }

    if (currentElement === "$") {
      current++;

      let variableName = "";

      while (/[a-z]/i.test(input[current])) {
        variableName += input[current];
        current++;
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
      current++;

      while (input[current] !== "'") {
        value += input[current];
        current++;
      }
      current++;

      tokens.push({
        type: "string",
        value: value
      });
      continue;
    }

    if (currentElement === "(") {
      tokens.push({
        type: "paren",
        value: currentElement
      });

      current++;
      continue;
    }

    if (currentElement === ")") {
      tokens.push({
        type: "paren",
        value: currentElement
      });

      current++;
      continue;
    }

    const characters = /[a-z\.]/i;
    if (characters.test(currentElement)) {
      let value = currentElement;

      while (characters.test(input[++current])) {
        value += input[current];
      }

      tokens.push({
        type: "name",
        value: value
      });

      continue;
    }
  }

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
