export default function generator(node) {
  switch (node.type) {
    case "Program":
      return `(function() { ${node.body.map(generator).join("")} })();`;

    case "Assignment":
    case "ExpressionStatement":
      return generator(node.expression);

    case "CallExpression":
      return (
        generator(node.callee) + "(" + node.arguments.map(generator) + ");"
      );

    case "Variable":
      if (node.value.length > 0) {
        return `var ${generator(node.name)} = ${node.value
          .map(generator)
          .join(" ")};`;
      }
      return generator(node.name);

    case "Identifier":
    case "Operator":
    case "DecimalLiteral":
    case "NumberLiteral":
      return node.value;

    case "StringLiteral":
      return '"' + node.value + '"';
  }
}
