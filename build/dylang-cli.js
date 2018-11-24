/* @dylang 1.0.0 */
'use strict';

function javaScriptGenerator(node) {
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
            var name = (node.callee ? node.callee.value : node.name) + "(";
            if (node.params) {
                name += node.params.map(javaScriptGenerator).join(",");
            }
            if (node.arguments) {
                name += node.arguments.map(javaScriptGenerator).join(",");
            }
            name += ")";
            return name;
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

function getNodeType(type) {
    if (!type) {
        throw new Error("Could not find the type of " + type.type + " (" + type.value + ")");
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
function cppGenerator(node, includeSemiColon) {
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
            var name = node.name + "(";
            if (node.params) {
                name += node.params.map(function (p) { return cppGenerator(p, false); }).join(",");
            }
            name += ")";
            if (includeSemiColon) {
                name += ";";
            }
            return name;
        case "Function":
            var returnType = getReturnType(node);
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

var TokenType;
(function (TokenType) {
    TokenType[TokenType["PAREN_START"] = 0] = "PAREN_START";
    TokenType[TokenType["PAREN_END"] = 1] = "PAREN_END";
    TokenType[TokenType["IDENTIFIER"] = 2] = "IDENTIFIER";
    TokenType[TokenType["OPERATOR"] = 3] = "OPERATOR";
    TokenType[TokenType["END"] = 4] = "END";
    TokenType[TokenType["STRING"] = 5] = "STRING";
    TokenType[TokenType["ASSIGNMENT"] = 6] = "ASSIGNMENT";
    TokenType[TokenType["VARIABLE"] = 7] = "VARIABLE";
    TokenType[TokenType["NUMBER"] = 8] = "NUMBER";
    TokenType[TokenType["DECIMAL"] = 9] = "DECIMAL";
    TokenType[TokenType["IF"] = 10] = "IF";
    TokenType[TokenType["START_BRACE"] = 11] = "START_BRACE";
    TokenType[TokenType["END_BRACE"] = 12] = "END_BRACE";
    TokenType[TokenType["NONE"] = 13] = "NONE";
    TokenType[TokenType["ELSE"] = 14] = "ELSE";
    TokenType[TokenType["SEPARATOR"] = 15] = "SEPARATOR";
    TokenType[TokenType["FUNCTION_DECLARATION"] = 16] = "FUNCTION_DECLARATION";
    TokenType[TokenType["RETURN"] = 17] = "RETURN";
})(TokenType || (TokenType = {}));

function parser(tokens) {
    var current = 0;
    function walk() {
        var token = tokens[current];
        switch (token.type) {
            case TokenType.NUMBER:
                current++;
                return {
                    type: "NumberLiteral",
                    value: token.value
                };
            case TokenType.DECIMAL:
                current++;
                return {
                    type: "DecimalLiteral",
                    value: token.value
                };
            case TokenType.STRING:
                current++;
                return {
                    type: "StringLiteral",
                    value: token.value
                };
            case TokenType.OPERATOR:
                current++;
                return {
                    type: "Operator",
                    value: token.value
                };
            case TokenType.RETURN:
                var rnode = {
                    type: "Return",
                    value: []
                };
                token = tokens[++current];
                while (token.type !== TokenType.END) {
                    if (!token || !token.type) {
                        throw new Error("Found infinite loop... bailing");
                    }
                    rnode.value.push(walk());
                    token = tokens[current];
                }
                current++;
                return rnode;
            case TokenType.FUNCTION_DECLARATION:
                current++;
                if (tokens[current].type !== TokenType.IDENTIFIER) {
                    throw new Error("Missing identifier after function declaration");
                }
                var fnode = {
                    type: "Function",
                    name: tokens[current],
                    body: []
                };
                var braceCount = 1;
                while (tokens[current].type !== TokenType.START_BRACE) {
                    if (!tokens[current]) {
                        throw new Error("Could not find the start of the function");
                    }
                    current++;
                }
                current++;
                while (tokens[current] && braceCount > 0) {
                    if (tokens[current].type === TokenType.END_BRACE) {
                        braceCount--;
                        current++;
                    }
                    else if (tokens[current].type === TokenType.START_BRACE) {
                        braceCount++;
                        current++;
                    }
                    else {
                        var val = walk();
                        if (val) {
                            fnode.body.push(val);
                        }
                    }
                }
                return fnode;
            case TokenType.VARIABLE:
                var node = {
                    type: "Variable",
                    name: token.value,
                    valueType: token.valueType,
                    value: []
                };
                token = tokens[++current];
                if (token.type === TokenType.ASSIGNMENT) {
                    token = tokens[++current];
                    while (token.type !== TokenType.END) {
                        node.value.push(walk());
                        token = tokens[current];
                    }
                    current++;
                }
                return node;
            case TokenType.IDENTIFIER:
                current++;
                var idnode = {
                    type: "Identifier",
                    value: tokens[current - 1].value
                };
                if (tokens[current].type === TokenType.PAREN_START) {
                    current++;
                    var idcenode = {
                        type: "CallExpression",
                        name: tokens[current - 2].value,
                        params: []
                    };
                    idcenode.params.push(walk());
                    return idcenode;
                }
                return idnode;
            case TokenType.SEPARATOR:
                current++;
                return {
                    type: "Separator"
                };
            case TokenType.IF:
                var inode = {
                    type: "IfStatement",
                    conditional: [],
                    body: []
                };
                token = tokens[++current];
                while (token.type !== TokenType.START_BRACE) {
                    inode.conditional.push(walk());
                    token = tokens[current];
                }
                token = tokens[++current];
                while (token.type !== TokenType.END_BRACE) {
                    inode.body.push(walk());
                    token = tokens[current];
                }
                token = tokens[++current];
                return inode;
            case TokenType.ELSE:
                var enode = {
                    type: "ElseStatement",
                    body: []
                };
                token = tokens[++current];
                while (token.type !== TokenType.START_BRACE) {
                    token = tokens[++current];
                }
                current++;
                while (token.type !== TokenType.END_BRACE) {
                    enode.body.push(walk());
                    token = tokens[current];
                }
                token = tokens[++current];
                return enode;
            case TokenType.END:
            case TokenType.START_BRACE:
            case TokenType.END_BRACE:
            case TokenType.PAREN_START:
            case TokenType.PAREN_END:
                current++;
                return;
        }
        throw new TypeError("Invalid Type: " + token ? token.type : token);
    }
    var ast = {
        type: "Program",
        body: []
    };
    while (current < tokens.length) {
        ast.body.push(walk());
    }
    return ast;
}

function traverser(ast, visitor) {
  function traverseArray(array, parent) {
    array.forEach(function (child) {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    if (!node || !node.type) {
      return;
    }

    var methods = visitor[node.type];

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

function transformer(ast) {
    var newAst = {
        type: "Program",
        body: []
    };
    ast._context = newAst.body;
    traverser(ast, {
        NumberLiteral: {
            enter: function (node, parent) {
                parent._context.push({
                    type: "NumberLiteral",
                    value: node.value
                });
            }
        },
        DecimalLiteral: {
            enter: function (node, parent) {
                parent._context.push({
                    type: "DecimalLiteral",
                    value: node.value
                });
            }
        },
        StringLiteral: {
            enter: function (node, parent) {
                parent._context.push({
                    type: "StringLiteral",
                    value: node.value
                });
            }
        },
        Operator: {
            enter: function (node, parent) {
                parent._context.push({
                    type: "Operator",
                    value: node.value
                });
            }
        },
        Identifier: {
            enter: function (node, parent) {
                parent._context.push({
                    type: "Identifier",
                    value: node.value
                });
            }
        },
        Separator: {
            enter: function (node, parent) {
                parent._context.push(node);
            }
        },
        Return: {
            enter: function (node, parent) {
                node._context = [];
                parent._context.push(node);
            }
        },
        Variable: {
            enter: function (node, parent) {
                var expression = {
                    type: "Variable",
                    name: {
                        type: "Identifier",
                        value: node.name
                    },
                    value: []
                };
                node._context = expression.value;
                if (node.value !== "CallExpression") {
                    expression = {
                        type: "Assignment",
                        expression: expression
                    };
                }
                if (!node.value) {
                    expression = {
                        type: "Variable",
                        name: node.name
                    };
                }
                parent._context.push(expression);
            }
        },
        Function: {
            enter: function (node, parent) {
                var expression = {
                    type: "Function",
                    name: node.name,
                    body: node.body
                };
                node._context = [];
                parent._context.push(expression);
            }
        },
        IfStatement: {
            enter: function (node, parent) {
                var expression = {
                    type: "IfStatement",
                    conditional: node.conditional,
                    body: []
                };
                node._context = expression.body;
                parent._context.push(expression);
            }
        },
        ElseStatement: {
            enter: function (node, parent) {
                var expression = {
                    type: "ElseStatement",
                    body: []
                };
                node._context = expression.body;
                parent._context.push(expression);
            }
        },
        CallExpression: {
            enter: function (node, parent) {
                var expression = {
                    type: "CallExpression",
                    callee: {
                        type: "Identifier",
                        value: node.name
                    },
                    arguments: [],
                    expression: null
                };
                node._context = expression.arguments;
                parent._context.push(expression);
            }
        }
    });
    return newAst;
}

function handleSqwiggleStartBrace(_a) {
    var cursor = _a.cursor;
    return {
        tokens: [
            {
                type: TokenType.START_BRACE
            }
        ],
        cursor: cursor + 1
    };
}

function handleFunctionDeclaration(_a) {
    var cursor = _a.cursor;
    return {
        tokens: [
            {
                type: TokenType.FUNCTION_DECLARATION
            }
        ],
        cursor: cursor + 2
    };
}

function lookAhead(needle, row) {
    for (var i = 0; row[i] !== " " && i < row.length; i++) {
        if (needle[i] !== row[i]) {
            return false;
        }
    }
    return true;
}
function tokenize(input) {
    var tokens = [];
    var rows = input.split("\n");
    var isComment = false;
    for (var i = 0, rowsLength = rows.length; i < rowsLength; i++) {
        var colLength = rows[i].length;
        var current = 0;
        var parenCount = 0;
        while (current < colLength) {
            var currentElement = rows[i][current];
            var currentRow = rows[i].slice(current);
            if (isComment && currentElement !== "*") {
                current++;
                continue;
            }
            else if (isComment &&
                currentElement === "*" &&
                rows[i][current + 1] === "/") {
                isComment = false;
                current += 2;
                continue;
            }
            if (currentElement === "/" && rows[i][current + 1] === "/") {
                break;
            }
            if (currentElement === "/" && rows[i][current + 1] === "*") {
                current += 2;
                isComment = true;
                continue;
            }
            if (/\s/.test(currentElement)) {
                current++;
                continue;
            }
            if (lookAhead("return", currentRow)) {
                current += 6;
                tokens.push({
                    type: TokenType.RETURN
                });
                continue;
            }
            if (/[0-9]/.test(currentElement)) {
                var value = rows[i][current];
                current++;
                while (/[0-9]/.test(rows[i][current])) {
                    value += rows[i][current];
                    current++;
                }
                // Check if decimal number
                if (rows[i][current] === ".") {
                    value += ".";
                    current++;
                    while (/[0-9]/.test(rows[i][current])) {
                        value += rows[i][current];
                        current++;
                    }
                    tokens.push({
                        type: TokenType.DECIMAL,
                        value: parseFloat(value)
                    });
                    continue;
                }
                // If not decimal, add it as an int
                tokens.push({
                    type: TokenType.NUMBER,
                    value: parseInt(value, 10)
                });
                continue;
            }
            if (currentElement === "{") {
                var _a = handleSqwiggleStartBrace({
                    cursor: current
                }), t = _a.tokens, cursor = _a.cursor;
                t.forEach(function (p) { return tokens.push(p); });
                current = cursor;
                continue;
            }
            if (currentElement === "}") {
                current++;
                tokens.push({
                    type: TokenType.END_BRACE
                });
                continue;
            }
            if (lookAhead("fn", currentRow)) {
                var _b = handleFunctionDeclaration({
                    cursor: current
                }), t = _b.tokens, cursor = _b.cursor;
                t.forEach(function (p) { return tokens.push(p); });
                current = cursor;
                continue;
            }
            if (lookAhead("if", currentRow)) {
                current += 2;
                tokens.push({
                    type: TokenType.IF
                });
                continue;
            }
            if (lookAhead("else", currentRow)) {
                current += 4;
                tokens.push({
                    type: TokenType.ELSE
                });
                continue;
            }
            if (lookAhead("int", currentRow) ||
                lookAhead("decimal", currentRow) ||
                lookAhead("string", currentRow) ||
                lookAhead("let", currentRow)) {
                var variableType = "";
                var variableName = "";
                while (current < colLength && rows[i][current] !== " ") {
                    variableType += rows[i][current];
                    current++;
                }
                // Skip 4 to ignore spacing
                current++;
                while (current < colLength && /[a-z]/i.test(rows[i][current])) {
                    variableName += rows[i][current];
                    current++;
                }
                if (!variableName) {
                    throw new Error("Undeclared variable being used on line " + (i + 1) + ":" + current);
                }
                tokens.push({
                    type: TokenType.VARIABLE,
                    valueType: variableType,
                    value: variableName
                });
                continue;
            }
            if (currentElement === "=") {
                if (rows[i][current + 1] === "=") {
                    current += 2;
                    tokens.push({
                        type: TokenType.OPERATOR,
                        value: "=="
                    });
                    continue;
                }
                current++;
                tokens.push({
                    type: TokenType.ASSIGNMENT
                });
                continue;
            }
            if (currentElement === "'") {
                var value = "";
                while (rows[i][++current] !== "'") {
                    if (current >= colLength) {
                        throw new SyntaxError("Expecting a closing ' on line " + (i + 1) + ":" + current);
                    }
                    value += rows[i][current];
                }
                current++;
                tokens.push({
                    type: TokenType.STRING,
                    value: value
                });
                continue;
            }
            if (currentElement === "(") {
                current++;
                parenCount++;
                tokens.push({
                    type: TokenType.PAREN_START,
                    value: currentElement
                });
                continue;
            }
            if (currentElement === ")") {
                if (parenCount === 0) {
                    throw new Error("Expecting ( on line " + (i + 1) + ":" + current);
                }
                current++;
                parenCount--;
                tokens.push({
                    type: TokenType.PAREN_END,
                    value: currentElement
                });
                continue;
            }
            var characters = /[a-z\.]/i;
            if (characters.test(currentElement)) {
                var value = currentElement;
                current++;
                while (rows[i][current] && characters.test(rows[i][current])) {
                    value += rows[i][current];
                    current++;
                }
                tokens.push({
                    type: TokenType.IDENTIFIER,
                    value: value
                });
                continue;
            }
            var signs = /[\+\-\*\/\%\<\>\!]/i;
            if (currentElement.match(signs)) {
                current++;
                var operator = currentElement.match(/[\!\<\>]/);
                if (operator && rows[i][current] === "=") {
                    current++;
                    tokens.push({
                        type: TokenType.OPERATOR,
                        value: operator[0] + "="
                    });
                    continue;
                }
                tokens.push({
                    type: TokenType.OPERATOR,
                    value: currentElement
                });
                continue;
            }
            if (currentElement.match(",")) {
                current++;
                tokens.push({
                    type: TokenType.SEPARATOR
                });
                continue;
            }
            throw new TypeError("Invalid symbol " +
                rows[i][current] +
                " given on line " +
                (i + 1) +
                ":" +
                current);
        }
        if (tokens.length > 0) {
            tokens.push({
                type: TokenType.END
            });
        }
    }
    if (isComment) {
        throw new Error("A multi-line comment was started, but never closed");
    }
    return tokens;
}

function logError(values, elem, type, index) {
    var hint = values
        .map(function (e) {
        if (e.value) {
            return e.value;
        }
        return e.token;
    })
        .join(" ");
    return new TypeError(elem.type + " [" + elem.token + "] is being assigned to a " + type + " near [" + hint + "]. (" + (index + 1) + ":0)");
}
function typeChecker (tokens) {
    var items = tokens.body;
    var variableTable = {};
    function walk(token, index) {
        // If no type exists, continue
        if (!token || !token.valueType) {
            return;
        }
        var type = token.valueType;
        var values = token.value;
        // Add variable to global variable table
        // If the variable exists, throw error.
        // Only allow immutable variables
        if (variableTable[token.name]) {
            throw new Error("Immutable variable [" + token.name + "] reassigned. (" + (index + 1) + ":0)");
        }
        variableTable[token.name] = type;
        // Let is a dynamic type, so we'll skip type checking
        if (type === "let") {
            return;
        }
        for (var i = 0; i < values.length; i++) {
            var elem = values[i];
            if (elem.type === "Operator" &&
                elem.type === "Variable" &&
                elem.type === "CallExpression") {
                // We currently won't check types for these expressions
                continue;
            }
            if (elem.type === "Identifier") {
                var identifierType = variableTable[elem.value];
                if (identifierType !== type) {
                    throw new TypeError("\n            Variable [" + elem.value + "] of type " + type + " cannot be assigned to " + identifierType + ". (" + (index +
                        1) + ":0)");
                }
                continue;
            }
            switch (elem.type) {
                case "NumberLiteral":
                    if (type !== "int") {
                        throw logError(values, elem, type, index);
                    }
                    break;
                case "DecimalLiteral":
                    if (type !== "decimal") {
                        throw logError(values, elem, type, index);
                    }
                    break;
                case "StringLiteral":
                    if (type !== "string") {
                        throw logError(values, elem, type, index);
                    }
                    break;
            }
        }
    }
    items.map(walk);
}

function getGenerator(type) {
    var fixedType = type ? type.toLowerCase() : "";
    switch (fixedType) {
        case "js":
            return javaScriptGenerator;
        case "cpp":
            return cppGenerator;
    }
    throw new Error("Invalid generator output type given.");
}
var dylang = (function (code, flags) {
    if (flags === void 0) { flags = { output: "js" }; }
    var t = tokenize(code);
    var p = parser(t);
    typeChecker(p);
    var tr = transformer(p);
    var g = getGenerator(flags && flags.output)(tr);
    return g;
});

var program = require("commander");
var fs = require("fs");
var exec = require("child_process").exec;
function cli(args) {
    if (!args.input) {
        console.log("Missing input path (-i or --input=)");
        process.exit(400);
    }
    if (!args.output) {
        console.log("Missing output path (-out or --output=)");
        process.exit(400);
    }
    var outputPath = args.output;
    var inputPath = args.input;
    fs.readFile(inputPath, { encoding: "utf-8" }, function (err, data) {
        if (!err) {
            var output = dylang(data, { output: args.generate || "js" });
            fs.writeFile(outputPath, output, function (err) {
                if (err) {
                    return console.log(err);
                }
                exec("clang++ -std=c++11 " + outputPath, function (err, stdout, stderr) {
                    console.log(stdout);
                    console.log(stderr);
                    exec("rm " + outputPath);
                });
            });
        }
        else {
            console.log(err);
            process.exit(500);
        }
    });
}
program
    .version(require("../package.json").version)
    .option("-i, --input <input>", "input file")
    .option("-o, --output <input>", "output file")
    .option("-g, --generate <input>", "what file format to generate [cpp, js]")
    .parse(process.argv);
cli(program);
