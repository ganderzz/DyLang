import generator from "./generator";
import parser from "./parser";
import transformer from "./transformer";
import tokenize from "./tokenize";

import * as STL from "./StandardLibrary";

export default (() => {
  function compiler(code) {
    const t = this.tokenize(code);
    const p = this.parser(t);
    const tr = this.transformer(p);
    const g = this.generator(tr);

    return {
      result: g
    }
  }

  compiler.prototype.tokenize = function(input) {
    return tokenize(input);
  }

  compiler.prototype.parser = function(input) {
    return parser(input);
  }

  compiler.prototype.transformer = function(input) {
    return transformer(input);
  }

  compiler.prototype.generator = function(input) {
    return generator(input);
  }

  return compiler;
})();