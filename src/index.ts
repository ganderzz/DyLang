import { javaScriptGenerator, cppGenerator } from "./generator";
import parser from "./parser";
import transformer from "./transformer";
import { tokenize } from "./Tokenize";
import { optimizer } from "./optimizer";
import typeChecker from "./typeChecker";

function getGenerator(type) {
  const fixedType = type ? type.toLowerCase() : "";

  switch (fixedType) {
    case "js":
      return javaScriptGenerator;

    case "cpp":
      return cppGenerator;
  }

  throw new Error("Invalid generator output type given.");
}

export default (code, flags = { output: "js" }) => {
  const t = tokenize(code);
  const p = parser(t);

  typeChecker(p);

  const tr = transformer(p);
  const o = optimizer(tr);
  const g = getGenerator(flags && flags.output)(o);

  return g;
};
