import { TokenType } from "../Enums/Token";
import { IToken } from "../Interfaces/IToken";

type Token = {
  consumed: number;
  token: {
    type: TokenType;
    value: string;
  } | null;
};

type TokenizeFunction = (input: string, index: number) => Token;

const IGNORE_TOKEN: Token = Object.freeze({
  consumed: 0,
  token: null,
});

function tokenizeCharacter(type: TokenType, value: string): TokenizeFunction {
  return (input: string, current: number): Token => {
    if (input[current] !== value) {
      return IGNORE_TOKEN;
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

function tokenizeUntil(
  type: TokenType,
  fn: (currentChar: string, currentCollection: string) => boolean
): TokenizeFunction {
  return (input: string, current: number) => {
    let consumed = 0;
    let value = "";

    while (
      current + consumed < input.length &&
      fn(input[current + consumed], value)
    ) {
      consumed++;
      value += input[current + consumed];
    }

    if (consumed === 0) {
      return {
        consumed,
        token: null,
      };
    }

    return {
      consumed,
      token: {
        type,
        value,
      },
    };
  };
}

function tokenizePattern(type: TokenType, pattern: RegExp): TokenizeFunction {
  return (input: string, current: number): Token => {
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

const tokenFunctions: TokenizeFunction[] = [
  function skipWhitespace(input: string, index: number): Token {
    if (/\s/.test(input[index])) {
      return { consumed: 1, token: null };
    }

    return {
      token: null,
      consumed: 0,
    };
  },
  function skipComments(input: string, index: number): Token {
    if (input[index] !== "/") {
      return IGNORE_TOKEN;
    }

    let consumed = 1;
    const isMultiLine = input[index + consumed] === "*";

    while (index + consumed < input.length) {
      if (
        isMultiLine &&
        input[index + consumed] === "*" &&
        input[index + consumed + 1] === "/"
      ) {
        consumed++;
        break;
      }

      if (!isMultiLine && input[index + consumed] === "\n") {
        break;
      }

      consumed++;
    }

    return {
      token: null,
      consumed: consumed + 1,
    };
  },

  function tokenizeString(input: string, index: number): Token {
    if (input[index] !== '"') {
      return IGNORE_TOKEN;
    }

    let consumed = 1;
    let value = "";

    while (index + consumed < input.length) {
      if (input[index + consumed] === '"') {
        consumed++;
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
      consumed,
    };
  },
  function tokenizeFunction(input: string, index: number): Token {
    if (input[index] === "f" && input[index + 1] === "n") {
      return {
        token: {
          type: TokenType.FUNCTION_DECLARATION,
          value: "fn",
        },
        consumed: 3,
      };
    }

    return {
      token: null,
      consumed: 0,
    };
  },
  tokenizeCharacter(TokenType.PAREN_START, "("),
  tokenizeCharacter(TokenType.PAREN_END, ")"),
  tokenizeCharacter(TokenType.BRACE_START, "{"),
  tokenizeCharacter(TokenType.BRACE_END, "}"),
  tokenizeCharacter(TokenType.ASSIGNMENT, "="),
  tokenizePattern(TokenType.IF, /(if)/i),
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
      throw new TypeError(
        "I dont know what this character is: " + input[index]
      );
    }
  }
  console.warn(tokens);
  return tokens;
}
