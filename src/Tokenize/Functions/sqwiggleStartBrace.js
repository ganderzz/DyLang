import { TokenType } from "../../Enums/Token";
export function handleSqwiggleStartBrace(_a) {
    var cursor = _a.cursor;
    return {
        tokens: [
            {
                type: TokenType.START_BRACE
            }
        ],
        cursor: cursor + 1
    };
}
