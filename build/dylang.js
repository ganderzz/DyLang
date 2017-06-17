/* @dylang 1.0.0 */
!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r():"function"==typeof define&&define.amd?define(r):e.dylang=r()}(this,function(){"use strict";function e(r){switch(r.type){case"Program":return r.body.map(e).join("");case"ExpressionStatement":return e(r.expression)+"\n";case"CallExpression":return e(r.callee)+"("+r.arguments.map(e)+")";case"Assignment":return e(r.expression);case"Variable":return r.value.length>0?"var "+e(r.name)+" = "+r.value.map(e)+"\n":e(r.name);case"Identifier":return r.name;case"NumberLiteral":return r.value;case"StringLiteral":return'"'+r.value+'"'}}function r(e){function r(){var t=e[n];switch(t.type){case"number":return n++,{type:"NumberLiteral",token:t.value};case"string":return n++,{type:"StringLiteral",token:t.value};case"variable":var a={type:"Variable",name:t.value,value:[]};return"assignment"===(t=e[++n]).type&&(t=e[++n],a.value.push(r())),a;case"paren":if("("===t.value){var i={type:"CallExpression",name:(t=e[++n]).value,params:[]};for(t=e[++n];"paren"!==t.type||"paren"===t.type&&")"!==t.value;)i.params.push(r()),t=e[n];return n++,i}}throw new TypeError("Invalid Type: "+t.type)}for(var n=0,t={type:"Program",body:[]};n<e.length;)t.body.push(r());return t}function n(e,r){function n(e,r){e.forEach(function(e){t(e,r)})}function t(e,t){if(e){var a=r[e.type];switch(a&&a.enter&&a.enter(e,t),e.type){case"Program":n(e.body,e);break;case"CallExpression":n(e.params,e);break;case"Variable":n(e.value,e);break;case"StringLiteral":case"NumberLiteral":break;default:throw new TypeError(e+" is invalid in traverser")}a&&a.exit&&a.exit(e,t)}}t(e,null)}function t(e){var r={type:"Program",body:[]};return e._context=r.body,n(e,{NumberLiteral:{enter:function(e,r){r._context.push({type:"NumberLiteral",value:e.token})}},StringLiteral:{enter:function(e,r){r._context.push({type:"StringLiteral",value:e.token})}},Variable:{enter:function(e,r){var n={type:"Variable",name:{type:"Identifier",name:e.name},value:[]};e._context=n.value,"CallExpression"!==e.value&&(n={type:"Assignment",expression:n}),e.value||(n={type:"Variable",name:e.name}),r._context.push(n)}},CallExpression:{enter:function(e,r){var n={type:"CallExpression",callee:{type:"Identifier",name:e.name},arguments:[]};e._context=n.arguments,"CallExpression"!==r.type&&(n={type:"ExpressionStatement",expression:n}),r._context.push(n)}}}),r}function a(e){for(var r=[],n=e.split("\n"),t=!1,a=n.length,i=0;i<a;i++){for(var s=n[i].length,o=0,l=0;o<s;){var u=n[i][o];if(t&&"#"!==u)o++;else if(t&&"#"===u)t=!1,o++;else{if("#"===u){if("#"===n[i][++o]){o++,t=!0;continue}break}if(/\s/.test(u))o++;else if(/[0-9]/.test(u)){for(var p="";/[0-9]/.test(n[i][o]);)p+=n[i][o],o++;o++,r.push({type:"number",value:parseInt(p,10)})}else if("$"!==u)if("="!==u)if("'"!==u)if("("!==u)if(")"!==u){var f=/[a-z\.]/i;if(!f.test(u))throw new TypeError("Invalid symbol "+n[i][o]+" given on line "+(i+1)+":"+o);for(var c=u;f.test(n[i][++o]);)c+=n[i][o];o++,r.push({type:"name",value:c})}else{if(o++,0===l)throw new Error("Expecting ( on line "+(i+1)+":"+o);l--,r.push({type:"paren",value:u})}else o++,l++,r.push({type:"paren",value:u});else{for(var v="";"'"!==n[i][++o];){if(o>=s)throw new SyntaxError("Expecting a closing ' on line "+(i+1)+":"+o);v+=n[i][o]}o++,r.push({type:"string",value:v})}else{if("variable"!==r[r.length-1].type)throw new Error("Cannot assign value on line "+(i+1)+":"+o);o++,r.push({type:"assignment"})}else{for(var y="";/[a-z]/i.test(n[i][++o]);){if(o>=s)throw new TypeError("Unexpected end of variable on line "+(i+1)+":"+o);y+=n[i][o]}if(!y)throw new Error("Undeclared variable being used on line "+(i+1)+":"+o);r.push({type:"variable",value:y})}}}if(l>0)throw new Error("Expecting ) on line "+(i+1))}if(t)throw new Error("A multi-line comment was started, but never closed");return r}return function(n){return e(t(r(a(n))))}});
