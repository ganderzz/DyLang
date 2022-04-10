import { javaScriptGenerator } from "./Generator";
import parser from "./parser";
import transformer from "./transformer";
import { tokenize } from "./Tokenize";
import typeChecker from "./typeChecker";

function getGenerator(type: string) {
  const fixedType = type ? type.toLowerCase() : "";

  switch (fixedType) {
    case "js":
      return javaScriptGenerator;
  }

  throw new Error("Invalid generator output type given.");
}

export const compile = (code: string, flags = { output: "js" }) => {
  const tokens = tokenize(code);
  const parsed = parser(tokens);

  typeChecker(parsed);

  const transforms = transformer(parsed);
  const generatedCode = getGenerator(flags && flags.output)(transforms);

  return generatedCode;
};
