const { buildSync, build } = require("esbuild");

const common = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  sourcemap: false,
};

if (process.argv.includes("test")) {
  buildSync({
    ...common,
    format: "cjs",
    platform: "node",
    target: "es6",
    outfile: "test/dylang.js",
  });
} else if (process.argv.includes("watch")) {
  build({
    ...common,
    format: "cjs",
    platform: "node",
    target: "es6",
    outfile: "test/dylang.js",
    watch: true,
  });
} else {
  buildSync({
    ...common,
    format: "iife",
    globalName: "dylang",
    target: ["chrome58"],
    outdir: "build",
  });
}
