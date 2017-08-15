const hasValidValues = (values) => {
    const usableValues = values.filter(item => {
        switch(item.type) {
            case "DecimalLiteral":
            case "NumberLiteral":
            case "StringLiteral":
            case "Operator":
                return true;
        }

        return false;
    });

    return usableValues.length === values.length;
};

const getValue = (item) => {
    if (item.value) {
        return item.value;
    }

    if (item.token) {
        return item.token;
    }
};

const hasOperator = (values) => {
    return values.filter(item => item.type === "Operator").length > 0;
};

const hasDefinedVariable = (values, variableHash) => {
    return values.filter((item, i) => variableHash[item.value]).length > 0;
};

const walker = (ast, variableHash) => {
    if (ast.type === "Assignment") {
        const expression = ast.expression;
        const values = expression.value;

        if (hasValidValues(values) && hasOperator(values)) {
            const newValue = {
                type: values[0].type,
                value: eval(values.map(item => getValue(item)).join(""))
            };

            ast.expression.value = [newValue];
            variableHash[expression.name.value] = newValue;
        } else if(hasValidValues(values) && values.length === 1) {
            variableHash[expression.name.value] = values[0];
        }
    }
    
    if (ast.type === "IfStatement") {
        ast.body = ast.body.map(item => walker(item, variableHash));
        
        const conditional = ast.conditional;
        if (hasValidValues(conditional) && hasOperator(conditional)) {
            ast.conditional = [{
                type: "NumberLiteral",
                value: eval(ast.conditional.map(item => getValue(item)).join("")) ? 1 : 0
            }];
        } else if (hasDefinedVariable(conditional, variableHash)) {
            ast.conditional = conditional.map(item => {
                if (variableHash[item.value]) {
                    return variableHash[item.value];
                }

                return item;
            });
        }
    }

    if (ast.type === "Identifier" && hasDefinedVariable([ast], variableHash)) {
        return variableHash[ast.value];
    }

    if (ast.type === "ExpressionStatement") {
        ast.expression.arguments = ast.expression.arguments.map(item => walker(item, variableHash));
    }
    
    return ast;
};

export const optimizer = (ast) => {
    const variableHash = {};
    ast.body = ast.body.map(item => walker(item, variableHash));

    return ast;
}