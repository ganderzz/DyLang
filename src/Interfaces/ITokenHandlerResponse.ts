import { IToken } from "./IToken";

export interface ITokenHandlerResponse {
  tokens?: IToken<any>[];
  cursor?: number;
}
