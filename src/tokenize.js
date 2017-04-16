export default function tokenize(input) {
  let current = 0;
  const tokens = [];
  
  while(current < input.length) {
    const currentElement = input[current];
    
    if(currentElement === "#") {
      current++;
      if(input[current] === "#") {
        current++;
        while(input[current++] !== "#") {}
      } else {
        while(input[current++] !== "\n") {}
      }
      
      continue;
    }
    
    if(/\s/.test(currentElement)) {
      current++;
      continue;
    }
    
    if(/[0-9]/.test(currentElement)) {
      let value = "";
      
      while(/[0-9]/.test(input[current])) {
        value += input[current];
        current++;
      }
      
      tokens.push({
        type: "number",
        value: parseInt(value, 10)
      });
      
      continue;
    }
    
    if(currentElement === "$") {
       current++;
      
      let variableName = "";
      
      while(/[a-z]/i.test(input[current])) {
        variableName += input[current];
        current++;
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
      current++;
      
      while(input[current] !== "'") {
        value += input[current];
        current++;
      }
      current++;
      
      tokens.push({
        type: "string",
        value: value
      });
      continue;
    }
    
    if(currentElement === "(") {
      tokens.push({
        type: "paren",
        value: currentElement
      });
      
      current++;
      continue;
    }
    
    if(currentElement === ")") {
      tokens.push({
        type: "paren",
        value: currentElement
      });
      
      current++;
      continue;
    }
    
    const characters = /[a-z\.]/i;
    if(characters.test(currentElement)) {
      let value = currentElement;
      
      while(characters.test(input[++current])) {
        value += input[current];
      }
      
      tokens.push({
        type: "name",
        value: value
      });
      
      continue;
    }
  }
  
  return tokens;
}