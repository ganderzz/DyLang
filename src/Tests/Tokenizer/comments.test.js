import tokenize from "../../tokenize";
import Token from "../../Enums/Token";

describe("Testing Comments in Tokenizer", () => {
    it("Should not tokenize comments", t => {
        const code = `# testing`;
        const tokens = tokenize(code);

        expect(tokens.length).toBe(0);
    });

    it("Should not tokenize multiline comments", t => {
        const code = `## 
            testing
            asdffasdf
            
            sdfsdf
        #`;
        const tokens = tokenize(code);

        expect(tokens.length).toBe(0);
    });
});


