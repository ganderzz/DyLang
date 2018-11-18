export default function javaScriptGenerator(node) {
  if (!node) {
    return;
  }

  switch (node.type) {
    case "Program":
      return `(function(){${node.body.map(javaScriptGenerator).join("")}})();`;

    case "Assignment":
    case "ExpressionStatement":
      return javaScriptGenerator(node.expression);

    case "CallExpression":
      return (
        javaScriptGenerator(node.callee) +
        "(" +
        node.arguments.map(javaScriptGenerator) +
        ")"
      );

    case "Variable":
      if (node.value.length > 0) {
        return `var ${javaScriptGenerator(node.name)}=${node.value
          .map(javaScriptGenerator)
          .join(" ")};`;
      }
      return javaScriptGenerator(node.name);

    case "IfStatement":
      return `if(${node.conditional
        .map(javaScriptGenerator)
        .join(" ")}){${node.body.map(javaScriptGenerator).join(" ")}}`;

    case "ElseStatement":
      return `else{${node.body.map(javaScriptGenerator).join(" ")}}`;

    case "Identifier":
    case "DecimalLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
      return node.value;

    case "Operator":
      return node.value;

    case "StringLiteral":
      return '"' + node.value + '"';
  }
}
