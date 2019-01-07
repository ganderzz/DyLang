import { TokenType } from "../../Enums/Token";
export function handleFunctionDeclaration(_a) {
    var cursor = _a.cursor;
    return {
        tokens: [
            {
                type: TokenType.FUNCTION_DECLARATION
            }
        ],
        cursor: cursor + 2
    };
}
