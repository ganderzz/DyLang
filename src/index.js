import generator from "./generator";
import parse from "./parser";
import transformer from "./transformer";
import tokenize from "./tokenize";

import traverser from "./Utilities/traverser";

import * as STL from "./StandardLibrary";

function compile(code) {
  const t = tokenize(code);
  const p = parser(t);
  const tr = transformer(p);
  const g = generator(tr);
  
  return g;
}