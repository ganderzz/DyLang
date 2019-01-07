import { javaScriptGenerator, cppGenerator } from "./generator";
import parser from "./parser";
import transformer from "./transformer";
import { tokenize } from "./Tokenize";
import typeChecker from "./typeChecker";
function getGenerator(type) {
    var fixedType = type ? type.toLowerCase() : "";
    switch (fixedType) {
        case "js":
            return javaScriptGenerator;
        case "cpp":
            return cppGenerator;
    }
    throw new Error("Invalid generator output type given.");
}
export default (function (code, flags) {
    if (flags === void 0) { flags = { output: "js" }; }
    var t = tokenize(code);
    var p = parser(t);
    typeChecker(p);
    var tr = transformer(p);
    var g = getGenerator(flags && flags.output)(tr);
    return g;
});
