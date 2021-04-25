import { javaScriptGenerator, cppGenerator } from "./Generator";
import parser from "./parser";
import transformer from "./transformer";
import { tokenize } from "./Tokenize";
import typeChecker from "./typeChecker";
import { tokenizer } from "./Utilities/reader";

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

export const compile = (code, flags = { output: "js" }) => {
  const tokens = tokenizer(code);
  const parsed = parser(tokens);

  typeChecker(parsed);

  const transforms = transformer(parsed);
  const generatedCode = getGenerator(flags && flags.output)(transforms);

  return generatedCode;
};
