export default function generator(node) {
  if(!node) {
    return;
  }

  switch (node.type) {
    case "Program":
      return `(function(){${node.body.map(generator).join("")}})();`;

    case "Assignment":
    case "ExpressionStatement":
      return generator(node.expression);

    case "CallExpression":
      return (
        generator(node.callee) + "(" + node.arguments.map(generator) + ")"
      );

    case "Variable":
      if (node.value.length > 0) {
        return `var ${generator(node.name)}=${node.value
          .map(generator)
          .join(" ")};`;
      }
      return generator(node.name);

    case "IfStatement":
      return `if(${node.conditional.map(generator)
          .join(" ")}){${node.body.map(generator)
          .join(" ")}}`;

    case "ElseStatement":
      return `else{${node.body.map(generator)
          .join(" ")}}`;

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
