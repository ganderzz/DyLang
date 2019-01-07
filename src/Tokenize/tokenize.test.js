import { tokenize } from ".";
import { TokenType } from "../Enums/Token";
describe("Testing Tokenize functionality", function () {
    it("Should handle comments", function () {
        var code = "\n      // test\n\n      /* multi\n      line\n      comment */\n\n      //nospace\n      /*nospace*/\n      /*no\n      space*/\n    ";
        var output = tokenize(code);
        // Remove comments so there are no tokens
        expect(output.length).toBe(0);
    });
    it("Should handle main function", function () {
        var code = "\n      // test\n      fn main(): int {}\n    ";
        var output = tokenize(code);
        expect(output[0].type).toBe(TokenType.FUNCTION_DECLARATION);
        expect(output[1].type).toBe(TokenType.IDENTIFIER);
        expect(output[1].value).toBe("main");
        expect(output[4].value).toBe("int");
        expect(output[4].type).toBe(TokenType.TYPE_DECLARATION);
    });
    it("Should handle unformatted main function", function () {
        var code = "\n      // test\n      fn main():int{}\n    ";
        var output = tokenize(code);
        expect(output[0].type).toBe(TokenType.FUNCTION_DECLARATION);
        expect(output[1].type).toBe(TokenType.IDENTIFIER);
        expect(output[1].value).toBe("main");
        expect(output[4].value).toBe("int");
        expect(output[4].type).toBe(TokenType.TYPE_DECLARATION);
    });
    it("Should handle string return types", function () {
        var code = "\n      // test\n      fn test():string{}\n    ";
        var output = tokenize(code);
        expect(output[0].type).toBe(TokenType.FUNCTION_DECLARATION);
        expect(output[1].type).toBe(TokenType.IDENTIFIER);
        expect(output[1].value).toBe("test");
        expect(output[4].value).toBe("string");
        expect(output[4].type).toBe(TokenType.TYPE_DECLARATION);
    });
});
