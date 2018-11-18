import { TokenType } from "../Enums/Token";

export interface IToken<T> {
  type: TokenType;
  value?: T;
  valueType?: any;
}
