export default function tokenize(input) {
  const tokens = [];

  const rows = input.split("\n");
  let isComment = false;

  const rowsLength = rows.length;
  for(let i = 0; i < rowsLength; i++) {

    const colLength = rows[i].length;
    let current = 0;
    while(current < colLength) {
      const currentElement = rows[i][current];

      if(isComment && currentElement !== "#") {
        current++;
        continue;
      } else if(isComment && currentElement === "#") {
        isComment = false;
        current++;
        continue;
      }  

      if(currentElement === "#") {
        if(rows[i][++current] === "#") {
          current++;
          isComment = true;
          continue;
        }
        
        break;
      }

      if(/\s/.test(currentElement)) {
        current++;
        continue;
      }

      if(/[0-9]/.test(currentElement)) {
        let value = "";
        
        while(/[0-9]/.test(rows[i][current])) {
          value += rows[i][current];
          current++;
        }
        current++;
        
        tokens.push({
          type: "number",
          value: parseInt(value, 10)
        });
        
        continue;
      }

    if(currentElement === "$") {
      let variableName = "";
      
      while(/[a-z]/i.test(rows[i][++current])) {
        if(current >= colLength) {
          throw new TypeError("Unexpected end of input in row " + (i + 1));
        }

        variableName += rows[i][current];
      }
      
      tokens.push({
        type: "variable",
        value: variableName
      });
      
      continue;
    }
    
    if(currentElement === "=") {
      current++;

      tokens.push({
        type: "assignment"
      });

      continue;
    }
    
    if(currentElement === "'") {
      let value = "";
      
      while(rows[i][++current] !== "'") {
        if(current >= colLength) {
          throw new SyntaxError("Expecting a closing ' in row " + (i + 1));
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
    
    if(currentElement === "(") {
      current++;

      tokens.push({
        type: "paren",
        value: currentElement
      });
      
      continue;
    }
    
    if(currentElement === ")") {
      current++;

      tokens.push({
        type: "paren",
        value: currentElement
      });
      
      continue;
    }
    
    const characters = /[a-z\.]/i;
    if(characters.test(currentElement)) {
      let value = currentElement;
      
      while(characters.test(rows[i][++current])) {
        value += rows[i][current];
      }
      current++;
      
      tokens.push({
        type: "name",
        value: value
      });
      
      continue;
    }

    throw new TypeError("Invalid symbol " + rows[i][current] + " given in row: " + (i + 1));
    }
  }
  console.error(tokens)
  return tokens;
}