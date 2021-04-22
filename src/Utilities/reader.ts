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
  function skipWhitespace(input, index) {
    if (/\s/.test(input[index])) {
      return { consumed: 1, token: null };
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
  tokenizePattern(TokenType.OPERATOR, /[+-/*]/i),
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

  return tokens;
}
