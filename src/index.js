import generator from "./generator";
import parser from "./parser";
import transformer from "./transformer";
import tokenize from "./tokenize";
import { optimizer } from "./optimizer";
import typeChecker from "./typeChecker";

export default code => {
  const t = tokenize(code);
  const p = parser(t);
  
  typeChecker(p);

  const tr = transformer(p);
  const o = optimizer(tr);
  const g = generator(o);
  console.warn(g)

  return g;
};
