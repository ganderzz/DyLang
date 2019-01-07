import { TokenType } from "../Enums/Token";
import { handleSqwiggleStartBrace } from "./Functions/sqwiggleStartBrace";
import { IToken } from "../Interfaces/IToken";
import { handleFunctionDeclaration } from "./Functions/functionDeclaration";

function lookAhead(needle, row) {
  for (let i = 0; row[i] !== " " && i < row.length; i++) {
    if (needle[i] !== row[i]) {
      return false;
    }
  }

  return true;
}

export function tokenize(input: string) {
  let tokens: IToken<any>[] = [];

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
      } else if (
        isComment &&
        currentElement === "*" &&
        rows[i][current + 1] === "/"
      ) {
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

      if (currentElement === ":") {
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
        const { tokens: t, cursor } = handleSqwiggleStartBrace({
          cursor: current
        });

        t!.forEach(p => tokens.push(p));
        current = cursor!;
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
        const { tokens: t, cursor } = handleFunctionDeclaration({
          cursor: current
        });

        t!.forEach(p => tokens.push(p));
        current = cursor!;
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

      if (
        lookAhead("int", currentRow) ||
        lookAhead("decimal", currentRow) ||
        lookAhead("string", currentRow) ||
        lookAhead("let", currentRow)
      ) {
        let variableType = "";
        let variableName = "";

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
          throw new Error(
            "Undeclared variable being used on line " + (i + 1) + ":" + current
          );
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

      if (currentElement === '"') {
        let value = "";
        let quoteCount = 1;
        current++;

        while (quoteCount > 0) {
          if (current > colLength) {
            throw new SyntaxError(
              "Expecting a closing ' on line " +
                (i + 1) +
                ":" +
                current +
                " near " +
                rows[i]
            );
          }

          if (rows[i][current] === '"' && rows[i][current - 1] !== "\\") {
            quoteCount--;
          } else {
            value += rows[i][current++];
          }
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
          value: value
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
      console.log(rows[i][current], current, rows[i]);

      throw new TypeError(
        "Invalid symbol " +
          rows[i][current] +
          " given on line " +
          (i + 1) +
          ":" +
          current +
          " around " +
          rows[i]
      );
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
