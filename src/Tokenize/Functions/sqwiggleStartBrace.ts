import { TokenType } from "../../Enums/Token";
import { ITokenHandlerResponse } from "../../Interfaces/ITokenHandlerResponse";
import { ITokenHandlerProps } from "../../Interfaces/ITokenHandlerProps";

export function handleSqwiggleStartBrace({
  cursor
}: ITokenHandlerProps): ITokenHandlerResponse {
  return {
    tokens: [
      {
        type: TokenType.START_BRACE
      }
    ],
    cursor: cursor! + 1
  };
}
