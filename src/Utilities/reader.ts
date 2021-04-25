import { TokenType } from "../Enums/Token";
import { IToken } from "../Interfaces/IToken";
import { tokenizeCharacter, tokenizePattern } from "./tokenizers";

function tokenizeAhead(type: TokenType, fn: (item: string) => boolean) {
  return function (input: string, index: number) {
    let consumed = 0;
    let value = "";

    while (!/\s/.test(input[consumed + index]) && index + consumed < input.length) {
      value = `${value}${input[index + consumed]}`;
      consumed++;
    }

    if (fn(value)) {
      return {
        consumed,
        token: { type, value },
      };
    }

    return {
      consumed: 0,
      token: null,
    };
  };
}

const tokenFunctions = [
  function skipWhitespace(input, index) {
    if (/\s/.test(input[index])) {
      return { consumed: 1, token: null };
    }

    return {
      token: null,
      consumed: 0,
    };
  },
  function skipComments(input: string, index: number) {
    if (input[index] !== "/") {
      return {
        token: null,
        consumed: 0,
      };
    }

    let consumed = 1;
    const isMultiLine = input[index + consumed] === "*";

    while (index + consumed < input.length) {
      consumed++;

      if (!isMultiLine && input[index + consumed] === "\n") {
        consumed++;
        break;
      }

      if (isMultiLine && input[index + consumed] === "*" && input[index + consumed + 1] === "/") {
        consumed += 2;
        break;
      }
    }

    return {
      token: null,
      consumed,
    };
  },
  function tokenizeString(input: string, index: number) {
    if (input[index] === '"') {
      let consumed = 1;
      let value = "";

      while (index + consumed < input.length) {
        if (input[index + consumed] === '"') {
          break;
        }

        value += input[index + consumed];
        consumed++;
      }

      return {
        token: {
          type: TokenType.STRING,
          value,
        },
        consumed: consumed + 1,
      };
    }

    return {
      token: null,
      consumed: 0,
    };
  },
  tokenizeAhead(TokenType.VARIABLE, (item) => item === "let"),
  tokenizeAhead(TokenType.VARIABLE, (item) => item === "string"),
  tokenizeAhead(TokenType.VARIABLE, (item) => item === "int"),
  tokenizeAhead(TokenType.VARIABLE, (item) => item === "decimal"),
  tokenizeAhead(TokenType.FUNCTION_DECLARATION, (item) => item === "fn"),
  tokenizeCharacter(TokenType.PAREN_START, "("),
  tokenizeCharacter(TokenType.PAREN_END, ")"),
  tokenizeCharacter(TokenType.BRACE_START, "{"),
  tokenizeCharacter(TokenType.BRACE_END, "}"),
  tokenizeCharacter(TokenType.ASSIGNMENT, "="),
  tokenizePattern(TokenType.IDENTIFIER, /[a-z]/i),
  tokenizePattern(TokenType.OPERATOR, /[+-/*><]/i),
  tokenizePattern(TokenType.NUMBER, /[0-9.]/i),
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

      const { consumed, token } = tokenFunctions[i](input, index);

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
  console.warn(tokens);

  return tokens;
}
