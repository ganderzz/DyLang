import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";

export default {
  entry: "src/index.js",
  format: "iife",
  plugins: [
    resolve(),
    babel({
      exclude: "node_modules/**"
    })
  ],
  moduleName: "dylang",
  dest: "./build/dylang.js"
};