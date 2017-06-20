import generator from "./generator";
import parser from "./parser";
import transformer from "./transformer";
import tokenize from "./tokenize";

export default code => {
  const t = tokenize(code);
  const p = parser(t);

  const tr = transformer(p);
  const g = generator(tr);

  return g;
};
