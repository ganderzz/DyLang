const { compile } = require("./dylang");
const fs = require("fs");

fs.readFile("./test.dyl", "utf8", function (err, data) {
  if (err) {
    return console.log(err);
  }

  let code = compile(data);

  console.log(code);
  console.log("--------------");
  eval(code);
});
