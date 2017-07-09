export default function(tokens) {
  const items = tokens.body;

  function walk(token) {
    // If no type exists, continue
    if (!token || !token.valueType || token.valueType === "let") {
      return;
    }

    const type = token.valueType;
    const values = token.value;

    for (let i = 0; i < values.length; i++) {
      const elem = values[i];
      if (
        elem.type === "Identifier" &&
        elem.type === "Operator" &&
        elem.type === "Variable" &&
        elem.type === "CallExpression"
      ) {
          // We currently won't check types for these expressions
        continue;
      }

      const hint = values.map(e => e.token).join(" ");

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
              `Decimal value is being assigned to a non-int variable near (${hint}).`
            );
          }
          break;

        case "StringLiteral":
          if (type !== "string") {
            throw new TypeError(
              `String value is being assigned to a non-int variable near (${hint}).`
            );
          }
          break;
      }
    }
  }

  items.map(walk);
}
