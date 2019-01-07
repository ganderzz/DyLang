import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript";

const packageVersion = require("./package.json").version || "";

export default [
  {
    entry: "src/index.ts",
    format: "umd",
    banner: "/* @dylang " + packageVersion + " */",
    plugins: [
      resolve({
        module: true,
        jsnext: true,
        extensions: ["js", "ts"]
      }),
      typescript({ lib: ["es5", "es6"], typescript: require("typescript") }),
      babel({
        exclude: "node_modules/**"
      })
    ],
    moduleName: "dylang",
    dest: "./docs/dylang.js"
  },
  {
    entry: "src/cli.ts",
    format: "cjs",
    banner: "/* @dylang " + packageVersion + " */",
    plugins: [
      resolve({
        module: true,
        jsnext: true,
        extensions: ["js", "ts"]
      }),
      typescript({ lib: ["es5", "es6"], typescript: require("typescript") }),
      babel({
        exclude: "node_modules/**"
      })
    ],
    moduleName: "dylang",
    dest: "./build/dylang-cli.js"
  }
];
