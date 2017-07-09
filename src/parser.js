import Token from "./Enums/Token";

export default function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    switch (token.type) {
      case Token.NUMBER:
        current++;
        return {
          type: "NumberLiteral",
          token: token.value
        };

      case Token.DECIMAL:
        current++;
        return {
          type: "DecimalLiteral",
          token: token.value
        };

      case Token.STRING:
        current++;
        return {
          type: "StringLiteral",
          token: token.value
        };

      case Token.OPERATOR:
        current++;
        return {
          type: "Operator",
          token: token.value
        };

      case Token.VARIABLE:
        let node = {
          type: "Variable",
          name: token.value,
          value: []
        };
        token = tokens[++current];

        if (token.type === Token.ASSIGNMENT) {
          token = tokens[++current];

          while (token.type !== Token.END) {
            node.value.push(walk());
            token = tokens[current];
          }
          current++;
        }

        return node;

      case Token.IDENTIFIER:
        current++;
        return {
          type: "Identifier",
          value: token.value
        };

      case Token.PAREN:
        if (token.value === "(") {
          token = tokens[++current];

          let node = {
            type: "CallExpression",
            name: token.value,
            params: []
          };
          token = tokens[++current];

          while (
            token.type !== Token.PAREN ||
            (token.type === Token.PAREN && token.value !== ")") ||
            token.type === Token.END
          ) {
            node.params.push(walk());
            token = tokens[current];
          }

          current++;

          return node;
        }

      case Token.END:
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
