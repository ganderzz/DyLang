import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import typescript from "rollup-plugin-typescript";

const packageVersion = require("./package.json").version || "";

export default [
  {
    input: "src/index.ts",
    output: {
      name: "dylang",
      format: "umd",
      output: "./docs/dylang.js"
    },
    banner: "/* @dylang " + packageVersion + " */",
    plugins: [
      resolve({
        module: true,
        jsnext: true,
        extensions: ["js", "ts"]
      }),
      typescript({ tslib: require("tslib") }),
      babel({
        exclude: "node_modules/**"
      })
    ]
  },
  {
    input: "src/cli.ts",
    output: {
      name: "dylang",
      format: "umd",
      file: "./build/dylang-cli.js"
    },
    banner: "/* @dylang " + packageVersion + " */",
    plugins: [
      resolve({
        module: true,
        jsnext: true,
        extensions: ["js", "ts"]
      }),
      typescript({ tslib: require("tslib") }),
      babel({
        exclude: "node_modules/**"
      })
    ]
  }
];
