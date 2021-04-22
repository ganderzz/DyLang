function logError(values, elem, type, index) {
  const hint = values
    .map((e) => {
      if (e.value) {
        return e.value;
      }

      return e.token;
    })
    .join(" ");

  return new TypeError(`${elem.type} [${elem.token}] is being assigned to a ${type} near [${hint}]. (${index + 1}:0)`);
}

export default function (tokens) {
  const items = tokens.body;
  const variableTable = {};

  function walk(token, index) {
    // If no type exists, continue
    if (!token || !token.valueType) {
      return;
    }

    const type = token.valueType;
    const values = token.value;

    // Add variable to global variable table
    // If the variable exists, throw error.
    // Only allow immutable variables
    if (variableTable[token.name]) {
      throw new Error(`Immutable variable [${token.name}] reassigned. (${index + 1}:0)`);
    }
    variableTable[token.name] = type;

    // Let is a dynamic type, so we'll skip type checking
    if (type === "let") {
      return;
    }

    for (let i = 0; i < values.length; i++) {
      const elem = values[i];

      if (elem.type === "Operator" && elem.type === "Variable" && elem.type === "CallExpression") {
        // We currently won't check types for these expressions
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
