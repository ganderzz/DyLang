import { IToken } from "./IToken";

export interface ITokenHandlerProps {
  tokens?: IToken<any>[];
  cursor?: number;
}
