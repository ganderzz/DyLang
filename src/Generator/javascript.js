export default function javaScriptGenerator(node) {
    if (!node) {
        return "";
    }
    switch (node.type) {
        case "Program":
            return "(function(){" + node.body.map(javaScriptGenerator).join("") + "})();";
        case "Assignment":
        case "ExpressionStatement":
            return javaScriptGenerator(node.expression);
        case "CallExpression":
            console.warn(node);
            var name_1 = (node.callee ? node.callee.value : node.name) + "(";
            if (node.params) {
                name_1 += node.params.map(javaScriptGenerator).join(",");
            }
            if (node.arguments) {
                name_1 += node.arguments.map(javaScriptGenerator).join(",");
            }
            name_1 += ")";
            return name_1;
        case "Return":
            return "return " + node.value.map(javaScriptGenerator).join(" ") + ";";
        case "Function":
            return "function " + node.name.value + "() {" + node.body
                .map(javaScriptGenerator)
                .join(" ") + "}";
        case "Variable":
            if (node.value.length > 0) {
                return "var " + javaScriptGenerator(node.name) + "=" + node.value
                    .map(javaScriptGenerator)
                    .join(" ") + ";";
            }
            return javaScriptGenerator(node.name);
        case "IfStatement":
            return "if(" + node.conditional
                .map(javaScriptGenerator)
                .join(" ") + "){" + node.body.map(javaScriptGenerator).join(" ") + "}";
        case "ElseStatement":
            return "else{" + node.body.map(javaScriptGenerator).join(" ") + "}";
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
