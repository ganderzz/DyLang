import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";
import { minify } from "uglify-js";

const packageVersion = require("./package.json").version || "";

export default {
  entry: "src/index.js",
  format: "umd",
  banner: "/* @dylang " + packageVersion + " */",
  plugins: [
    resolve(),
    babel({
      exclude: "node_modules/**"
    }),
    uglify({
      output: {
        comments: function(node, comment) {
            if (comment.type === "comment2") {
                return comment.value.indexOf("@dylang") > -1;
            }
        }
      }
    }, minify)
  ],
  moduleName: "dylang",
  dest: "./build/dylang.js"
};