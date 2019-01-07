var program = require("commander");
var fs = require("fs");
var exec = require("child_process").exec;
import dylang from "./";
function cli(args) {
    if (!args.input) {
        console.log("Missing input path (-i or --input=)");
        process.exit(400);
    }
    if (!args.output) {
        console.log("Missing output path (-out or --output=)");
        process.exit(400);
    }
    var outputPath = args.output;
    var inputPath = args.input;
    fs.readFile(inputPath, { encoding: "utf-8" }, function (err, data) {
        if (!err) {
            var output = dylang(data, { output: args.generate || "js" });
            fs.writeFile(outputPath, output, function (err) {
                if (err) {
                    return console.log(err);
                }
                exec("clang++ -std=c++14 " + outputPath, function (err, stdout, stderr) {
                    console.log(stdout);
                    console.log(stderr);
                    exec("rm " + outputPath);
                });
            });
        }
        else {
            console.log(err);
            process.exit(500);
        }
    });
}
program
    .version(require("../package.json").version)
    .option("-i, --input <input>", "input file")
    .option("-o, --output <input>", "output file")
    .option("-g, --generate <input>", "what file format to generate [cpp, js]")
    .parse(process.argv);
cli(program);
