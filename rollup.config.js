import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript";

const packageVersion = require("./package.json").version || "";

export default {
  entry: "src/index.ts",
  format: "umd",
  banner: "/* @dylang " + packageVersion + " */",
  plugins: [
    resolve({
      module: true,
      jsnext: true,
      extensions: ["js", "ts"]
    }),
    typescript({ typescript: require("typescript") }),
    babel({
      exclude: "node_modules/**"
    })
  ],
  moduleName: "dylang",
  dest: "./docs/dylang.js"
};
