export default function(tokens) {
  const items = tokens.body;
  const variableTable = {};

  function walk(token) {
    // If no type exists, continue
    if (!token || !token.valueType || token.valueType === "let") {
      return;
    }

    const type = token.valueType;
    const values = token.value;

    variableTable[token.name] = type;

    for (let i = 0; i < values.length; i++) {
      const elem = values[i];
      if (
        elem.type === "Operator" &&
        elem.type === "Variable" &&
        elem.type === "CallExpression"
      ) {
        // We currently won't check types for these expressions
        continue;
      }

      if (elem.type === "Identifier") {
        const identifierType = variableTable[elem.value];

        if (identifierType !== type) {
          throw new TypeError(`
            Variable [${elem.value}] of type ${type} cannot be assigned to ${identifierType}.`);
        }
        continue;
      }

      const hint = values
        .map(e => {
          if (e.value) {
            return e.value;
          }

          return e.token;
        })
        .join(" ");

      switch (elem.type) {
        case "NumberLiteral":
          if (type !== "int") {
            throw new TypeError(
              `Integer value is being assigned to a non-int variable near (${hint}).`
            );
          }
          break;

        case "DecimalLiteral":
          if (type !== "decimal") {
            throw new TypeError(
              `Decimal value is being assigned to a non-decimal variable near (${hint}).`
            );
          }
          break;

        case "StringLiteral":
          if (type !== "string") {
            throw new TypeError(
              `String value is being assigned to a non-string variable near (${hint}).`
            );
          }
          break;
      }
    }
  }

  items.map(walk);
}
