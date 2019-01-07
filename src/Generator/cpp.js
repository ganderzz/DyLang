function getNodeType(type) {
    if (!type) {
        throw new Error("Could not find the type of " + type.type + " (" + type.value + ")");
    }
    switch (type.type) {
        case "StringLiteral":
        case "string":
            return "std::string";
        case "DecimalLiteral":
        case "decimal":
            return "float";
        case "NumberLiteral":
        case "int":
            return "int";
        default:
            return "auto";
    }
}
function getReturnType(node) {
    if (node && node.body) {
        var returnNode = node.body.filter(function (p) { return p.type === "Return"; })[0];
        if (returnNode) {
            return getNodeType(returnNode.value[0]);
        }
    }
    return "void";
}
var stl = "void print(std::string args) { std::cout << args << std::endl; }";
export default function cppGenerator(node, includeSemiColon) {
    if (includeSemiColon === void 0) { includeSemiColon = true; }
    if (!node) {
        return;
    }
    switch (node.type) {
        case "Program":
            return ("#include <iostream> \n" + stl + node.body.map(cppGenerator).join(" "));
        case "Assignment":
        case "ExpressionStatement":
            return cppGenerator(node.expression);
        case "CallExpression":
            var name_1 = cppGenerator(node.callee) + "(";
            if (node.arguments) {
                name_1 += node.arguments.map(function (p) { return cppGenerator(p, false); }).join(",");
            }
            name_1 += ")";
            if (includeSemiColon) {
                name_1 += ";";
            }
            return name_1;
        case "Function":
            var returnType = getNodeType({ type: node.returnType, value: "" });
            return returnType + " " + node.name.value + "() {" + node.body
                .map(cppGenerator)
                .join(" ") + "}";
        case "Return":
            return "return " + node.value.map(cppGenerator).join(" ") + ";";
        case "Variable":
            // Variable declaration
            if (node.value.length > 0) {
                return getNodeType(node.value[0]) + " " + node.name + "=" + node.value
                    .map(cppGenerator)
                    .join(" ") + ";";
            }
            // Variable Identifier
            return cppGenerator(node.name);
        case "IfStatement":
            return "if(" + node.conditional
                .map(function (p) { return cppGenerator(p, false); })
                .join(" ") + "){" + node.body.map(cppGenerator).join(" ") + "}";
        case "ElseStatement":
            return "else{" + node.body.map(cppGenerator).join(" ") + "}";
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
