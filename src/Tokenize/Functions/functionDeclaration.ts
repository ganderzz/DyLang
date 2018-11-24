import { TokenType } from "../../Enums/Token";
import { ITokenHandlerResponse } from "../../Interfaces/ITokenHandlerResponse";
import { ITokenHandlerProps } from "../../Interfaces/ITokenHandlerProps";

export function handleFunctionDeclaration({
  cursor
}: ITokenHandlerProps): ITokenHandlerResponse {
  return {
    tokens: [
      {
        type: TokenType.FUNCTION_DECLARATION
      }
    ],
    cursor: cursor + 2
  };
}
