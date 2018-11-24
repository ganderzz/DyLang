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

function getReturnType(node): string {
  if (node && node.body) {
    const returnNode = node.body.filter(p => p.type === "Return")[0];

    if (returnNode) {
      return getNodeType(returnNode.value[0]);
    }
  }

  return "void";
}

const stl = `void print(std::string args) { std::cout << args << std::endl; }`;

export default function cppGenerator(node, includeSemiColon = true) {
  if (!node) {
    return;
  }

  switch (node.type) {
    case "Program":
      return (
        "#include <iostream> \n" + stl + node.body.map(cppGenerator).join(" ")
      );

    case "Assignment":
    case "ExpressionStatement":
      return cppGenerator(node.expression);

    case "CallExpression":
      let name = cppGenerator(node.callee) + "(";
      if (node.arguments) {
        name += node.arguments.map(p => cppGenerator(p, false)).join(",");
      }
      name += ")";

      if (includeSemiColon) {
        name += ";";
      }

      return name;

    case "Function":
      const returnType = getReturnType(node);
      return `${returnType} ${node.name.value}() {${node.body
        .map(cppGenerator)
        .join(" ")}}`;

    case "Return":
      return `return ${node.value.map(cppGenerator).join(" ")};`;

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
        .map(p => cppGenerator(p, false))
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
