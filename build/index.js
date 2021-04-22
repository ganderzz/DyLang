var dylang = (() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    compile: () => compile
  });

  // src/Generator/javascript.ts
  function javaScriptGenerator(node) {
    if (!node) {
      return "";
    }
    switch (node.type) {
      case "Program":
        return `(function(){${node.body.map(javaScriptGenerator).join("")}})();`;
      case "Assignment":
      case "ExpressionStatement":
        return javaScriptGenerator(node.expression);
      case "CallExpression":
        let name = (node.callee ? node.callee.value : node.name) + "(";
        if (node.params) {
          name += node.params.map(javaScriptGenerator).join(",");
        }
        if (node.arguments) {
          name += node.arguments.map(javaScriptGenerator).join(",");
        }
        name += ")";
        return name;
      case "Return":
        return `return ${node.value.map(javaScriptGenerator).join(" ")};`;
      case "Function":
        return `function ${node.name.value}() {${node.body.map(javaScriptGenerator).join(" ")}}`;
      case "Variable":
        if (node.value.length > 0) {
          return `var ${javaScriptGenerator(node.name)}=${node.value.map(javaScriptGenerator).join(" ")};`;
        }
        return javaScriptGenerator(node.name);
      case "IfStatement":
        return `if(${node.conditional.map(javaScriptGenerator).join(" ")}){${node.body.map(javaScriptGenerator).join(" ")}}`;
      case "ElseStatement":
        return `else{${node.body.map(javaScriptGenerator).join(" ")}}`;
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

  // src/Generator/cpp.ts
  function getNodeType(type) {
    if (!type) {
      throw new Error(`Could not find the type of ${type.type} (${type.value})`);
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
  var stl = `void print(std::string args) { std::cout << args << std::endl; }`;
  function cppGenerator(node, includeSemiColon = true) {
    if (!node) {
      return;
    }
    switch (node.type) {
      case "Program":
        return "#include <iostream> \n" + stl + node.body.map(cppGenerator).join(" ");
      case "Assignment":
      case "ExpressionStatement":
        return cppGenerator(node.expression);
      case "CallExpression":
        let name = cppGenerator(node.callee) + "(";
        if (node.arguments) {
          name += node.arguments.map((p) => cppGenerator(p, false)).join(",");
        }
        name += ")";
        if (includeSemiColon) {
          name += ";";
        }
        return name;
      case "Function":
        const returnType = getNodeType({type: node.returnType, value: ""});
        return `${returnType} ${node.name.value}() {${node.body.map(cppGenerator).join(" ")}}`;
      case "Return":
        return `return ${node.value.map(cppGenerator).join(" ")};`;
      case "Variable":
        if (node.value.length > 0) {
          return `${getNodeType(node.value[0])} ${node.name}=${node.value.map(cppGenerator).join(" ")};`;
        }
        return cppGenerator(node.name);
      case "IfStatement":
        return `if(${node.conditional.map((p) => cppGenerator(p, false)).join(" ")}){${node.body.map(cppGenerator).join(" ")}}`;
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

  // src/Enums/Token.ts
  var TokenType;
  (function(TokenType2) {
    TokenType2[TokenType2["PAREN_START"] = 0] = "PAREN_START";
    TokenType2[TokenType2["PAREN_END"] = 1] = "PAREN_END";
    TokenType2[TokenType2["IDENTIFIER"] = 2] = "IDENTIFIER";
    TokenType2[TokenType2["OPERATOR"] = 3] = "OPERATOR";
    TokenType2[TokenType2["END"] = 4] = "END";
    TokenType2[TokenType2["STRING"] = 5] = "STRING";
    TokenType2[TokenType2["ASSIGNMENT"] = 6] = "ASSIGNMENT";
    TokenType2[TokenType2["VARIABLE"] = 7] = "VARIABLE";
    TokenType2[TokenType2["NUMBER"] = 8] = "NUMBER";
    TokenType2[TokenType2["DECIMAL"] = 9] = "DECIMAL";
    TokenType2[TokenType2["IF"] = 10] = "IF";
    TokenType2[TokenType2["BRACE_START"] = 11] = "BRACE_START";
    TokenType2[TokenType2["BRACE_END"] = 12] = "BRACE_END";
    TokenType2[TokenType2["NONE"] = 13] = "NONE";
    TokenType2[TokenType2["ELSE"] = 14] = "ELSE";
    TokenType2[TokenType2["SEPARATOR"] = 15] = "SEPARATOR";
    TokenType2[TokenType2["FUNCTION_DECLARATION"] = 16] = "FUNCTION_DECLARATION";
    TokenType2[TokenType2["RETURN"] = 17] = "RETURN";
    TokenType2[TokenType2["TYPE_DECLARATION"] = 18] = "TYPE_DECLARATION";
  })(TokenType || (TokenType = {}));

  // src/parser.ts
  function parser(tokens) {
    let current = 0;
    function walk() {
      let token = tokens[current];
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
          const rnode = {
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
          let fnode = {
            type: "Function",
            name: tokens[current],
            arguments: [],
            body: [],
            returnType: "auto"
          };
          current++;
          while (tokens[current].type !== TokenType.BRACE_START) {
            if (!tokens[current]) {
              throw new Error("Could not find the start of the function");
            }
            if (tokens[current].type === TokenType.PAREN_START) {
              current++;
              fnode.arguments.push(walk());
            } else if (tokens[current].type === TokenType.TYPE_DECLARATION) {
              fnode.returnType = tokens[current].value;
              current++;
            } else {
              current++;
            }
          }
          current++;
          let braceCount = 1;
          while (tokens[current] && braceCount > 0) {
            if (tokens[current].type === TokenType.BRACE_END) {
              braceCount--;
              current++;
            } else if (tokens[current].type === TokenType.BRACE_START) {
              braceCount++;
              current++;
            } else {
              const val = walk();
              if (val) {
                fnode.body.push(val);
              }
            }
          }
          return fnode;
        case TokenType.VARIABLE:
          let node = {
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
          const idnode = {
            type: "Identifier",
            value: tokens[current - 1].value
          };
          if (tokens[current].type === TokenType.PAREN_START) {
            current++;
            const idcenode = {
              type: "CallExpression",
              callee: idnode,
              arguments: [],
              expression: null
            };
            idcenode.arguments.push(walk());
            return idcenode;
          }
          return idnode;
        case TokenType.SEPARATOR:
          current++;
          return {
            type: "Separator"
          };
        case TokenType.IF:
          let inode = {
            type: "IfStatement",
            conditional: [],
            body: []
          };
          token = tokens[++current];
          while (token.type !== TokenType.BRACE_START) {
            inode.conditional.push(walk());
            token = tokens[current];
          }
          token = tokens[++current];
          while (token.type !== TokenType.BRACE_END) {
            inode.body.push(walk());
            token = tokens[current];
          }
          token = tokens[++current];
          return inode;
        case TokenType.ELSE:
          let enode = {
            type: "ElseStatement",
            body: []
          };
          token = tokens[++current];
          while (token.type !== TokenType.BRACE_START) {
            token = tokens[++current];
          }
          current++;
          while (token.type !== TokenType.BRACE_END) {
            enode.body.push(walk());
            token = tokens[current];
          }
          token = tokens[++current];
          return enode;
        case TokenType.END:
        case TokenType.BRACE_START:
        case TokenType.BRACE_END:
        case TokenType.PAREN_START:
        case TokenType.PAREN_END:
          current++;
          return;
      }
      throw new TypeError("Invalid Type: " + token ? token.type : token);
    }
    let ast = {
      type: "Program",
      body: []
    };
    while (current < tokens.length) {
      ast.body.push(walk());
    }
    return ast;
  }

  // src/Utilities/traverser.ts
  function traverser(ast, visitor) {
    function traverseArray(array, parent) {
      array.forEach((child) => {
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
          traverseArray(node.arguments, node);
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

  // src/transformer.ts
  function transformer(ast) {
    let newAst = {
      type: "Program",
      body: []
    };
    ast._context = newAst.body;
    traverser(ast, {
      NumberLiteral: {
        enter(node, parent) {
          parent._context.push(node);
        }
      },
      DecimalLiteral: {
        enter(node, parent) {
          parent._context.push(node);
        }
      },
      StringLiteral: {
        enter(node, parent) {
          parent._context.push(node);
        }
      },
      Operator: {
        enter(node, parent) {
          parent._context.push(node);
        }
      },
      Identifier: {
        enter(node, parent) {
          parent._context.push(node);
        }
      },
      Separator: {
        enter(node, parent) {
          parent._context.push(node);
        }
      },
      Return: {
        enter(node, parent) {
          node._context = [];
          parent._context.push(node);
        }
      },
      Variable: {
        enter(node, parent) {
          let expression = {
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
              expression
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
        enter(node, parent) {
          node._context = [];
          parent._context.push(node);
        }
      },
      IfStatement: {
        enter(node, parent) {
          let expression = {
            type: "IfStatement",
            conditional: node.conditional,
            body: []
          };
          node._context = expression.body;
          parent._context.push(expression);
        }
      },
      ElseStatement: {
        enter(node, parent) {
          let expression = {
            type: "ElseStatement",
            body: []
          };
          node._context = expression.body;
          parent._context.push(expression);
        }
      },
      CallExpression: {
        enter(node, parent) {
          let expression = {
            type: "CallExpression",
            callee: node.callee,
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

  // src/Tokenize/Functions/sqwiggleStartBrace.ts
  function handleSqwiggleStartBrace({cursor}) {
    return {
      tokens: [
        {
          type: TokenType.BRACE_START
        }
      ],
      cursor: cursor + 1
    };
  }

  // src/Tokenize/Functions/functionDeclaration.ts
  function handleFunctionDeclaration({
    cursor
  }) {
    return {
      tokens: [
        {
          type: TokenType.FUNCTION_DECLARATION
        }
      ],
      cursor: cursor + 2
    };
  }

  // src/Enums/Syntax.ts
  var Syntax = {
    int: "int",
    string: "string",
    decimal: "decimal",
    variable: "let",
    colon: ":",
    forwardSlash: "/",
    backwardSlash: "\\",
    rightBace: "{",
    leftBrace: "}",
    leftParen: "(",
    rightParen: ")",
    function: "fn",
    if: "if",
    else: "else",
    return: "return",
    equals: "=",
    quote: '"'
  };

  // src/Tokenize/index.ts
  function lookAhead(needle, row) {
    for (let i = 0; row[i] !== " " && i < row.length; i++) {
      if (needle[i] !== row[i]) {
        return false;
      }
    }
    return true;
  }
  function tokenize(input) {
    let tokens = [];
    const rows = input.split("\n");
    let isComment = false;
    for (let i = 0, rowsLength = rows.length; i < rowsLength; i++) {
      const colLength = rows[i].length;
      let current = 0;
      let parenCount = 0;
      while (current < colLength) {
        const currentElement = rows[i][current];
        const currentRow = rows[i].slice(current);
        if (isComment && currentElement !== "*") {
          current++;
          continue;
        } else if (isComment && currentElement === "*" && rows[i][current + 1] === Syntax.forwardSlash) {
          isComment = false;
          current += 2;
          continue;
        }
        if (currentElement === Syntax.forwardSlash && rows[i][current + 1] === Syntax.forwardSlash) {
          break;
        }
        if (currentElement === Syntax.forwardSlash && rows[i][current + 1] === "*") {
          current += 2;
          isComment = true;
          continue;
        }
        if (/\s/.test(currentElement)) {
          current++;
          continue;
        }
        if (lookAhead(Syntax.return, currentRow)) {
          current += 6;
          tokens.push({
            type: TokenType.RETURN
          });
          continue;
        }
        if (currentElement === Syntax.colon) {
          current++;
          let type = "";
          if (/\s/.test(rows[i][current])) {
            current++;
          }
          while (!/\s/.test(rows[i][current])) {
            if (rows[i][current] === "{" || rows[i][current] === ",") {
              break;
            }
            type += rows[i][current++];
          }
          tokens.push({
            type: TokenType.TYPE_DECLARATION,
            value: type.length === 0 ? "auto" : type
          });
          continue;
        }
        if (/[0-9]/.test(currentElement)) {
          let value = rows[i][current];
          current++;
          while (/[0-9]/.test(rows[i][current])) {
            value += rows[i][current];
            current++;
          }
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
          tokens.push({
            type: TokenType.NUMBER,
            value: parseInt(value, 10)
          });
          continue;
        }
        if (currentElement === Syntax.rightBace) {
          const {tokens: t, cursor} = handleSqwiggleStartBrace({
            cursor: current
          });
          t.forEach((p) => tokens.push(p));
          current = cursor;
          continue;
        }
        if (currentElement === Syntax.leftBrace) {
          current++;
          tokens.push({
            type: TokenType.BRACE_END
          });
          continue;
        }
        if (lookAhead(Syntax.function, currentRow)) {
          const {tokens: t, cursor} = handleFunctionDeclaration({
            cursor: current
          });
          t.forEach((p) => tokens.push(p));
          current = cursor;
          continue;
        }
        if (lookAhead(Syntax.if, currentRow)) {
          current += 2;
          tokens.push({
            type: TokenType.IF
          });
          continue;
        }
        if (lookAhead(Syntax.else, currentRow)) {
          current += 4;
          tokens.push({
            type: TokenType.ELSE
          });
          continue;
        }
        if (lookAhead(Syntax.int, currentRow) || lookAhead(Syntax.decimal, currentRow) || lookAhead(Syntax.string, currentRow) || lookAhead(Syntax.variable, currentRow)) {
          let variableType = "";
          let variableName = "";
          while (current < colLength && rows[i][current] !== " ") {
            variableType += rows[i][current];
            current++;
          }
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
        if (currentElement === Syntax.equals) {
          if (rows[i][current + 1] === Syntax.equals) {
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
        if (currentElement === Syntax.quote) {
          let value = "";
          let quoteCount = 1;
          current++;
          while (quoteCount > 0) {
            if (current > colLength) {
              throw new SyntaxError("Expecting a closing ' on line " + (i + 1) + ":" + current + " near " + rows[i]);
            }
            if (rows[i][current] === Syntax.quote && rows[i][current - 1] !== "\\") {
              quoteCount--;
            } else {
              value += rows[i][current++];
            }
          }
          current++;
          tokens.push({
            type: TokenType.STRING,
            value
          });
          continue;
        }
        if (currentElement === Syntax.leftParen) {
          current++;
          parenCount++;
          tokens.push({
            type: TokenType.PAREN_START,
            value: currentElement
          });
          continue;
        }
        if (currentElement === Syntax.rightParen) {
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
        const characters = /[a-z\.]/i;
        if (characters.test(currentElement)) {
          let value = currentElement;
          current++;
          while (rows[i][current] && characters.test(rows[i][current])) {
            value += rows[i][current];
            current++;
          }
          tokens.push({
            type: TokenType.IDENTIFIER,
            value
          });
          continue;
        }
        const signs = /[\+\-\*\/\%\<\>\!]/i;
        if (currentElement.match(signs)) {
          current++;
          const operator = currentElement.match(/[\!\<\>]/);
          if (operator && rows[i][current] === "=") {
            current++;
            tokens.push({
              type: TokenType.OPERATOR,
              value: `${operator[0]}=`
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
        throw new TypeError("Invalid symbol " + rows[i][current] + " given on line " + (i + 1) + ":" + current + " around " + rows[i]);
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

  // src/typeChecker.ts
  function logError(values, elem, type, index) {
    const hint = values.map((e) => {
      if (e.value) {
        return e.value;
      }
      return e.token;
    }).join(" ");
    return new TypeError(`${elem.type} [${elem.token}] is being assigned to a ${type} near [${hint}]. (${index + 1}:0)`);
  }
  function typeChecker_default(tokens) {
    const items = tokens.body;
    const variableTable = {};
    function walk(token, index) {
      if (!token || !token.valueType) {
        return;
      }
      const type = token.valueType;
      const values = token.value;
      if (variableTable[token.name]) {
        throw new Error(`Immutable variable [${token.name}] reassigned. (${index + 1}:0)`);
      }
      variableTable[token.name] = type;
      if (type === "let") {
        return;
      }
      for (let i = 0; i < values.length; i++) {
        const elem = values[i];
        if (elem.type === "Operator" && elem.type === "Variable" && elem.type === "CallExpression") {
          continue;
        }
        if (elem.type === "Identifier") {
          const identifierType = variableTable[elem.value];
          if (identifierType !== type) {
            throw new TypeError(`
            Variable [${elem.value}] of type ${type} cannot be assigned to ${identifierType}. (${index + 1}:0)`);
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

  // src/index.ts
  function getGenerator(type) {
    const fixedType = type ? type.toLowerCase() : "";
    switch (fixedType) {
      case "js":
        return javaScriptGenerator;
      case "cpp":
        return cppGenerator;
    }
    throw new Error("Invalid generator output type given.");
  }
  var compile = (code, flags = {output: "js"}) => {
    const tokens = tokenize(code);
    const parsed = parser(tokens);
    typeChecker_default(parsed);
    const transforms = transformer(parsed);
    const generatedCode = getGenerator(flags && flags.output)(transforms);
    return generatedCode;
  };
  return src_exports;
})();
