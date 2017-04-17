export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }
export function divide(a, b) { return a / b; }
export function print(...input) { console.log(input.join(" ")); }
export function writeTo(elem, input) { elem.innerHTML = input; }

window.add = add;
window.subtract = subtract;
window.multiple = multiply;
window.divide = divide;
window.print = print;
window.writeTo = writeTo;