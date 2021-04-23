import { TokenType } from "../Enums/Token";

export interface IToken<T = unknown> {
  type: TokenType;
  value?: T;
  valueType?: any;
}
