export default function tokenize(input) {
  const tokens = [];

  const rows = input.split("\n");
  let isComment = false;

  const rowsLength = rows.length;
  for (let i = 0; i < rowsLength; i++) {
    const colLength = rows[i].length;
    let current = 0;
    let parenCount = 0;

    while (current < colLength) {
      const currentElement = rows[i][current];

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

        current++
        while (/[0-9]/.test(rows[i][current])) {
          value += rows[i][current];
          current++;
        }

        tokens.push({
          type: "number",
          value: parseInt(value, 10)
        });

        continue;
      }

      if (currentElement === "$") {
        let variableName = "";

        while (/[a-z]/i.test(rows[i][++current])) {
          if (current >= colLength) {
            throw new TypeError(
              "Unexpected end of variable on line " + (i + 1) + ":" + current
            );
          }

          variableName += rows[i][current];
        }

        if (!variableName) {
          throw new Error(
            "Undeclared variable being used on line " + (i + 1) + ":" + current
          );
        }

        tokens.push({
          type: "variable",
          value: variableName
        });

        continue;
      }

      if (currentElement === "=") {
        if (tokens[tokens.length - 1].type !== "variable") {
          throw new Error(
            "Cannot assign value on line " + (i + 1) + ":" + current
          );
        }

        current++;

        tokens.push({
          type: "assignment"
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
          type: "string",
          value: value
        });
        continue;
      }

      if (currentElement === "(") {
        current++;
        parenCount++;

        tokens.push({
          type: "paren",
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
          type: "paren",
          value: currentElement
        });

        continue;
      }

      const characters = /[a-z\.]/i;
      if (characters.test(currentElement)) {
        let value = currentElement;

        while (characters.test(rows[i][++current])) {
          value += rows[i][current];
        }
        //current++;

        tokens.push({
          type: "name",
          value: value
        });

        continue;
      }
      
      const signs = /[\+\-\*\/\%]/i;
      if (currentElement.match(signs)) {
        current++;

        tokens.push({
          type: "operator",
          value: currentElement
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
    
    tokens.push({
      type: "end"
    });
  }

  if (isComment) {
    throw new Error("A multi-line comment was started, but never closed");
  }

  return tokens;
}
