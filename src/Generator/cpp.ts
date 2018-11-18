export default function cppGenerator(node) {
  if (!node) {
    return;
  }

  switch (node.type) {
    case "Program":
      return `#include <iostream>
       int main() { ${node.body.map(cppGenerator).join("")} }`;

    case "Assignment":
    case "ExpressionStatement":
      return cppGenerator(node.expression);

    case "CallExpression":
      return (
        cppGenerator(node.callee) + "(" + node.arguments.map(cppGenerator) + ")"
      );

    case "Variable":
      if (node.value.length > 0) {
        return `auto ${cppGenerator(node.name)}=${node.value
          .map(cppGenerator)
          .join(" ")};`;
      }
      return cppGenerator(node.name);

    case "IfStatement":
      return `if(${node.conditional
        .map(cppGenerator)
        .join(" ")}){${node.body.map(cppGenerator).join(" ")}}`;

    case "ElseStatement":
      return `else{${node.body.map(cppGenerator).join(" ")}}`;

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
