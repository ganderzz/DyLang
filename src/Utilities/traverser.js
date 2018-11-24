export default function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(child => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    if (!node || !node.type) {
      return;
    }
    let methods = visitor[node.type];

    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case "CallExpression":
        traverseArray(node.params, node);
        break;

      case "Variable":
      case "Return":
        traverseArray(node.value, node);
        break;

      case "Program":
      case "Function":
      case "ElseStatement":
      case "IfStatement":
        traverseArray(node.body, node);
        break;

      case "Separator":
      case "DecimalLiteral":
      case "StringLiteral":
      case "NumberLiteral":
      case "Operator":
      case "Identifier":
      case "None":
        break;

      default:
        throw new TypeError(node.type + " is invalid in traverser");
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  traverseNode(ast, null);
}
