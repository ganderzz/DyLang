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
          value: token.value
        };

      case Token.DECIMAL:
        current++;
        return {
          type: "DecimalLiteral",
          value: token.value
        };

      case Token.STRING:
        current++;
        return {
          type: "StringLiteral",
          value: token.value
        };

      case Token.OPERATOR:
        current++;
        return {
          type: "Operator",
          value: token.value
        };

      case Token.VARIABLE:
        let node = {
          type: "Variable",
          name: token.value,
          valueType: token.valueType,
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

      case Token.SEPARATOR:
        current++;
        return {
          type: "Separator"
        };

      case Token.IF:
        let inode = {
          type: "IfStatement",
          conditional: [],
          body: [],
        }
        token = tokens[++current];

        while(token.type !== Token.START_BRACE) {
          inode.conditional.push(walk());
          token = tokens[current];
        }
        token = tokens[++current];

        while(token.type !== Token.END_BRACE) {
          inode.body.push(walk());
          token = tokens[current]
        }
        token = tokens[++current];

        return inode;

      case Token.ELSE:
        let enode = {
          type: "ElseStatement",
          body: [],
        }
        token = tokens[++current];

        while(token.type !== Token.START_BRACE) {
          token = tokens[++current];
        }
        current++;

        while(token.type !== Token.END_BRACE) {
          enode.body.push(walk());
          token = tokens[current]
        }
        token = tokens[++current];

        return enode;

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
