import { tokenize } from ".";
import { TokenType } from "../Enums/Token";

describe("Testing Tokenize functionality", () => {
  it("Should handle comments", () => {
    const code = `
      // test

      /* multi
      line
      comment */

      //nospace
      /*nospace*/
      /*no
      space*/
    `;

    const output = tokenize(code);

    // Remove comments so there are no tokens
    expect(output.length).toBe(0);
  });

  it("Should handle main function", () => {
    const code = `
      // test
      fn main(): int {}
    `;

    const output = tokenize(code);

    expect(output[0].type).toBe(TokenType.FUNCTION_DECLARATION);
    expect(output[1].type).toBe(TokenType.IDENTIFIER);
    expect(output[1].value).toBe("main");
    expect(output[4].value).toBe("int");
    expect(output[4].type).toBe(TokenType.TYPE_DECLARATION);
  });

  it("Should handle unformatted main function", () => {
    const code = `
      // test
      fn main():int{}
    `;

    const output = tokenize(code);

    expect(output[0].type).toBe(TokenType.FUNCTION_DECLARATION);
    expect(output[1].type).toBe(TokenType.IDENTIFIER);
    expect(output[1].value).toBe("main");
    expect(output[4].value).toBe("int");
    expect(output[4].type).toBe(TokenType.TYPE_DECLARATION);
  });

  it("Should handle string return types", () => {
    const code = `
      // test
      fn test():string{}
    `;

    const output = tokenize(code);

    expect(output[0].type).toBe(TokenType.FUNCTION_DECLARATION);
    expect(output[1].type).toBe(TokenType.IDENTIFIER);
    expect(output[1].value).toBe("test");
    expect(output[4].value).toBe("string");
    expect(output[4].type).toBe(TokenType.TYPE_DECLARATION);
  });
});
