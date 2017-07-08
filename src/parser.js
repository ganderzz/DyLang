export default function parser(tokens) {
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

      case "operator":
        current++;
        return {
          type: "Operator",
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

          while(token.type !== "end") {
            node.value.push(walk());
            token = tokens[current];
             
          }
          current++;
        }

        return node;

      case "identifier":
        current++;
        return {
          type: "Identifier",
          value: token.value
        };

      case "paren":
        if (token.value === "(") {
          token = tokens[++current];

          let node = {
            type: "CallExpression",
            name: token.value,
            params: []
          };
          token = tokens[++current];

          while (
            token.type !== "paren" ||
            (token.type === "paren" && token.value !== ")") ||
            token.type === "end"
          ) {
            node.params.push(walk());
            token = tokens[current];
          }

          current++;

          return node;
        }

        case "end":
          current++;
          return;
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
