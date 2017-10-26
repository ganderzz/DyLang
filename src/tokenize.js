import Token from "./Enums/Token";

function lookAhead(needle, row) {
  const elem = row.split("");

  for (let i = 0; row[i] !== " " && i < row.length; i++) {
    if (needle[i] !== row[i]) {
      return false;
    }
  }

  return true;
}

export default function tokenize(input) {
  const tokens = [];

  const rows = input.split("\n");
  let isComment = false;

  for (let i = 0, rowsLength = rows.length; i < rowsLength; i++) {
    const colLength = rows[i].length;
    let current = 0;
    let parenCount = 0;

    while (current < colLength) {
      const currentElement = rows[i][current];
      const currentRow = rows[i].slice(current);

      if (isComment && currentElement !== "#") {
        current++;
        continue;
      } else if (isComment && currentElement === "#") {
        isComment = false;
        current++;
        continue;
      }

      if (currentElement === "#") {
        if (rows[i][++current] === "#") {
          current++;
          isComment = true;
          continue;
        }

        break;
      }

      if (/\s/.test(currentElement)) {
        current++;
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
            type: Token.DECIMAL,
            value: parseFloat(value)
          });

          continue;
        }

        // If not decimal, add it as an int
        tokens.push({
          type: Token.NUMBER,
          value: parseInt(value, 10)
        });

        continue;
      }

      if (currentElement === "{") {
        current++;

        tokens.push({
          type: Token.START_BRACE,
        });

        continue;
      }

      if (currentElement === "}") {
        current++;

        tokens.push({
          type: Token.END_BRACE,
        });

        continue;
      }

      if (lookAhead("if", currentRow)) {
        current += 2;

        tokens.push({
          type: Token.IF
        });

        continue;
      }

      if (lookAhead("else", currentRow)) {
        current += 4;

        tokens.push({
          type: Token.ELSE
        });

        continue;
      }
      
      if (lookAhead("int", currentRow) || 
          lookAhead("decimal", currentRow) ||
          lookAhead("string", currentRow) ||
          lookAhead("let", currentRow) ) {
        let variableType = "";
        let variableName = "";

        while(current < colLength && rows[i][current] !== " ") {
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
          type: Token.VARIABLE,
          valueType: variableType,
          value: variableName
        });

        continue;
      }

      if (currentElement === "=") {
        if (rows[i][current + 1] === "=") {
          current += 2;

          tokens.push({
            type: Token.OPERATOR,
            value: "=="
          });
          continue;
        }

        if (tokens[tokens.length - 1].type !== Token.VARIABLE) {
          throw new Error(
            "Cannot assign value to non variable on line " +
              (i + 1) +
              ":" +
              current
          );
        }

        current++;

        tokens.push({
          type: Token.ASSIGNMENT
        });

        continue;
      }

      if (currentElement === "'") {
        let value = "";

        while (rows[i][++current] !== "'") {
          if (current >= colLength) {
            throw new SyntaxError(
              "Expecting a closing ' on line " + (i + 1) + ":" + current
            );
          }

          value += rows[i][current];
        }
        current++;

        tokens.push({
          type: Token.STRING,
          value: value
        });
        continue;
      }

      if (currentElement === "(") {
        current++;
        parenCount++;

        tokens.push({
          type: Token.PAREN,
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
          type: Token.PAREN,
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
          type: Token.IDENTIFIER,
          value: value
        });

        continue;
      }

      const signs = /[\+\-\*\/\%\<\>\!]/i;
      if (currentElement.match(signs)) {
        current++;

        if (currentElement === "!" && rows[i][current] === "=") {
          current++;

          tokens.push({
            type: Token.OPERATOR,
            value: "!="
          });

          continue;
        }

        tokens.push({
          type: Token.OPERATOR,
          value: currentElement
        });

        continue;
      }

      if (currentElement.match(",")) {
        current++;

        tokens.push({
          type: Token.SEPARATOR
        });

        continue;
      }

      throw new TypeError(
        "Invalid symbol " +
          rows[i][current] +
          " given on line " +
          (i + 1) +
          ":" +
          current
      );
    }

    if (tokens.length > 0) {
      tokens.push({
        type: Token.END
      });
    }
  }

  if (isComment) {
    throw new Error("A multi-line comment was started, but never closed");
  }

  return tokens;
}
