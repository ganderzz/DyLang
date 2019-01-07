import { javaScriptGenerator, cppGenerator } from "./Generator";
import parser from "./parser";
import transformer from "./transformer";
import { tokenize } from "./Tokenize";
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
  const g = getGenerator(flags && flags.output)(tr);

  return g;
};
