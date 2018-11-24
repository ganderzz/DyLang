function getNodeType(type: { type: string; value: any }) {
  if (!type) {
    throw new Error(`Could not find the type of ${type.type} (${type.value})`);
  }

  switch (type.type) {
    case "StringLiteral":
      return "std::string";

    case "DecimalLiteral":
      return "float";

    case "NumberLiteral":
      return "int";

    default:
      return "auto";
  }
}

const stl = `void print(std::string args) { std::cout << args << std::endl; }`;

export default function cppGenerator(node) {
  if (!node) {
    return;
  }

  switch (node.type) {
    case "Program":
      return (
        "#include <iostream> \n" + stl + node.body.map(cppGenerator).join("")
      );

    case "Assignment":
    case "ExpressionStatement":
      return cppGenerator(node.expression);

    case "CallExpression":
      let name = node.name + "(";
      if (node.params) {
        name += node.params.map(cppGenerator);
      }
      name += ");";

      return name;

    case "Function":
      console.log(node.body);
      return `int ${node.name.value}() {${node.body.map(cppGenerator)}}`;

    case "Variable":
      // Variable declaration
      if (node.value.length > 0) {
        return `${getNodeType(node.value[0])} ${node.name}=${node.value
          .map(cppGenerator)
          .join(" ")};`;
      }

      // Variable Identifier
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
    case "Operator":
      return node.value;

    case "StringLiteral":
      return '"' + node.value + '"';
  }
}
