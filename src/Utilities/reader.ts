import { Syntax } from "../Enums/Syntax";
import { TokenType } from "../Enums/Token";
import { IToken } from "../Interfaces/IToken";

function tokenizeCharacter(type, value) {
  return (input, current) => {
    if (input[current] !== value) {
      return {
        consumed: 0,
        token: null,
      };
    }

    return {
      consumed: 1,
      token: {
        type,
        value,
      },
    };
  };
}

function tokenizePattern(type, pattern) {
  return (input, current) => {
    let char = input[current];
    let consumedChars = 0;

    if (pattern.test(char)) {
      let value = "";

      while (char && pattern.test(char)) {
        value += char;
        consumedChars++;
        char = input[current + consumedChars];
      }

      return { consumed: consumedChars, token: { type, value } };
    }

    return { consumed: 0, token: null };
  };
}

const tokenFunctions = [
  function skipDeadSpace() {
    return (input, index) => {
      if (/\s/.test(input[index])) {
        return { consumed: 1, token: null };
      }

      if (input[index] === "/") {
        let consumed = 1;
        let isMultiline = input[index + consumed] === "*";

        if (!isMultiline && input[index + consumed] !== "/") {
          throw new TypeError("Invalid start of a comment.");
        }

        consumed++;
        while (index + consumed < input.length) {
          consumed++;

          if (!isMultiline && input[index + consumed] === "\n") {
            break;
          }

          if (isMultiline && input[index + consumed] === "*" && input[index + consumed + 1] === "/") {
            consumed += 2;
            break;
          }
        }

        return {
          consumed,
          token: null,
        };
      }

      return {
        token: null,
        consumed: 0,
      };
    };
  },
  function parseLeftParen() {
    return tokenizeCharacter(TokenType.PAREN_START, "(");
  },
  function parseRightParen() {
    return tokenizeCharacter(TokenType.PAREN_END, ")");
  },
  function parseLeftBrace() {
    return tokenizeCharacter(TokenType.BRACE_START, "{");
  },
  function parseRightBrace() {
    return tokenizeCharacter(TokenType.BRACE_END, "}");
  },
  function parseEquals() {
    return tokenizeCharacter(TokenType.ASSIGNMENT, "=");
  },
  function parseIf() {
    return tokenizePattern(TokenType.IF, /(if)/i);
  },
  function parseIdentifier() {
    return tokenizePattern(TokenType.IDENTIFIER, /[a-z]/i);
  },
  function parseOperator() {
    return tokenizePattern(TokenType.OPERATOR, /[+-/*]/i);
  },
  function parseNumber() {
    return tokenizePattern(TokenType.NUMBER, /[0-9.]/i);
  },
];

export function tokenizer(input: string): IToken<any>[] {
  let index = 0;
  let tokens: IToken<any>[] = [];

  while (index < input.length) {
    let tokenized = false;

    for (let i = 0; i < tokenFunctions.length; i++) {
      if (tokenized) {
        break;
      }

      const fn = tokenFunctions[i]();

      const { consumed, token } = fn(input, index);

      if (consumed !== 0) {
        tokenized = true;
        index += consumed;
      }

      if (token) {
        tokens.push(token);
      }
    }

    if (!tokenized) {
      throw new TypeError("I dont know what this character is: " + input[index]);
    }
  }

  return tokens;
}
