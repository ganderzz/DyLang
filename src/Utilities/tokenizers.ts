import { TokenType } from "../Enums/Token";
import { IToken } from "../Interfaces/IToken";

type TokenFunction = (input: string, index: number) => { consumed: number; token: IToken<unknown> | null };

/**
 * Assigns a token to the given value if it exists. Otherwise, the input gets ignored.
 *
 * @param {TokenType} type
 * @param {string} value
 * @return {*}  {TokenFunction}
 */
export function tokenizeCharacter(type: TokenType, value: string): TokenFunction {
  return (input, index) => {
    if (input[index] !== value) {
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

/**
 * Assigns a token to the given regex pattern matches. Otherwise, the input gets ignored.
 *
 * @param {TokenType} type
 * @param {RegExp} pattern
 * @return {*}  {TokenFunction}
 */
export function tokenizePattern(type: TokenType, pattern: RegExp): TokenFunction {
  return (input, index) => {
    let char = input[index];
    let consumedChars = 0;

    if (pattern.test(char)) {
      let value = "";

      while (char && pattern.test(char)) {
        value += char;
        consumedChars++;
        char = input[index + consumedChars];
      }

      return { consumed: consumedChars, token: { type, value } };
    }

    return { consumed: 0, token: null };
  };
}
