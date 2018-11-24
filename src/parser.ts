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

      case TokenType.RETURN:
        const rnode = {
          type: "Return",
          value: []
        };
        token = tokens[++current];

        while (token.type !== TokenType.END) {
          if (!token || !token.type) {
            throw new Error("Found infinite loop... bailing");
          }

          rnode.value.push(walk());
          token = tokens[current];
        }
        current++;

        return rnode;

      case TokenType.FUNCTION_DECLARATION:
        current++;

        if (tokens[current].type !== TokenType.IDENTIFIER) {
          throw new Error("Missing identifier after function declaration");
        }

        let fnode = {
          type: "Function",
          name: tokens[current],
          body: []
        };

        let braceCount = 1;

        while (tokens[current].type !== TokenType.START_BRACE) {
          if (!tokens[current]) {
            throw new Error("Could not find the start of the function");
          }

          current++;
        }
        current++;

        while (tokens[current] && braceCount > 0) {
          if (tokens[current].type === TokenType.END_BRACE) {
            braceCount--;
            current++;
          } else if (tokens[current].type === TokenType.START_BRACE) {
            braceCount++;
            current++;
          } else {
            const val = walk();
            if (val) {
              fnode.body.push(val);
            }
          }
        }

        return fnode;

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
        const idnode = {
          type: "Identifier",
          value: tokens[current - 1].value
        };

        if (tokens[current].type === TokenType.PAREN_START) {
          current++;
          const idcenode = {
            type: "CallExpression",
            callee: {
              type: "Identifier",
              value: tokens[current - 2].value
            },
            arguments: [],
            expression: null
          };

          idcenode.arguments.push(walk());

          return idcenode;
        }

        return idnode;

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

      case TokenType.END:
      case TokenType.START_BRACE:
      case TokenType.END_BRACE:
      case TokenType.PAREN_START:
      case TokenType.PAREN_END:
        current++;
        return;
    }

    throw new TypeError("Invalid Type: " + token ? token.type : token);
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
