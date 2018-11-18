import { TokenType } from "./Enums/Token";

export default function parser(tokens) {
  let current = 0;

  function walk() {
    let token = tokens[current];

    switch (token.type) {
      case TokenType.NUMBER:
        current++;
        return {
          type: "NumberLiteral",
          value: token.value
        };

      case TokenType.DECIMAL:
        current++;
        return {
          type: "DecimalLiteral",
          value: token.value
        };

      case TokenType.STRING:
        current++;
        return {
          type: "StringLiteral",
          value: token.value
        };

      case TokenType.OPERATOR:
        current++;
        return {
          type: "Operator",
          value: token.value
        };

      case TokenType.VARIABLE:
        let node = {
          type: "Variable",
          name: token.value,
          valueType: token.valueType,
          value: []
        };
        token = tokens[++current];

        if (token.type === TokenType.ASSIGNMENT) {
          token = tokens[++current];

          while (token.type !== TokenType.END) {
            node.value.push(walk());
            token = tokens[current];
          }
          current++;
        }

        return node;

      case TokenType.IDENTIFIER:
        current++;
        return {
          type: "Identifier",
          value: token.value
        };

      case TokenType.SEPARATOR:
        current++;
        return {
          type: "Separator"
        };

      case TokenType.IF:
        let inode = {
          type: "IfStatement",
          conditional: [],
          body: []
        };
        token = tokens[++current];

        while (token.type !== TokenType.START_BRACE) {
          inode.conditional.push(walk());
          token = tokens[current];
        }
        token = tokens[++current];

        while (token.type !== TokenType.END_BRACE) {
          inode.body.push(walk());
          token = tokens[current];
        }
        token = tokens[++current];

        return inode;

      case TokenType.ELSE:
        let enode = {
          type: "ElseStatement",
          body: []
        };
        token = tokens[++current];

        while (token.type !== TokenType.START_BRACE) {
          token = tokens[++current];
        }
        current++;

        while (token.type !== TokenType.END_BRACE) {
          enode.body.push(walk());
          token = tokens[current];
        }
        token = tokens[++current];

        return enode;

      case TokenType.PAREN:
        if (token.value === "(") {
          token = tokens[++current];

          let node = {
            type: "CallExpression",
            name: token.value,
            params: []
          };
          token = tokens[++current];

          while (
            token.type !== TokenType.PAREN ||
            (token.type === TokenType.PAREN && token.value !== ")") ||
            token.type === TokenType.END
          ) {
            node.params.push(walk());
            token = tokens[current];
          }

          current++;

          return node;
        }

      case TokenType.END:
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
