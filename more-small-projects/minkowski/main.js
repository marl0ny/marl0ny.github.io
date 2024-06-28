/* Complex data type ********************************************************/

class Complex {
    real;
    imag;
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }
    conj() {
        return new Complex(this.real, -this.imag);
    }
    get abs2() {
        return this.real*this.real + this.imag*this.imag;
    }
    get abs() {
        return Math.sqrt(this.abs2);
    }
    get arg() {
        if (this.real === 0.0) {
            if (this.imag >= 0.0) {
                return Math.PI/2.0;
            } else {
                return -Math.PI/2.0;
            }
        } else {
            let val = Math.atan(this.imag/this.real);
            if (this.real < 0.0) {
                if (this.imag >= 0.0) {
                    return Math.PI + val;
                } else {
                    return -Math.PI + val;
                }
            }
            return val;
        }
    }
}

/* Unfortunately, there is no operator overloading in Javascript,
so complex mathematical operations must be done using named functions.*/

const abs = (z) => {
    if (z instanceof Complex)
        return z.abs;
    else if (typeof(z) === 'number')
        return Math.abs(z);
};

const complexAdd = (z, w) => new Complex(z.real + w.real, z.imag + w.imag);

const complexSub = (z, w) => new Complex(z.real - w.real, z.imag - w.imag);

const complexMul = (z, w) => new Complex(z.real*w.real - z.imag*w.imag,
                                         z.real*w.imag + z.imag*w.real);

const complexDiv = (z, w) => {
    let invW = mul(real(1.0/w.abs2), w.conj());
    return complexMul(z, invW);
}

const complexPow = (z, w) => {
    if (z.imag === 0.0 && w.imag === 0.0)
        return new Complex(Math.pow(z.real, w.real), 0.0);
    else
        return exp(mul(log(z), w));
}

function add(z, w) {
    if (typeof(z) === 'number' && typeof (w) === 'number') {
        return z + w;
    } else if (typeof(z) === 'number' && (w instanceof Complex)) {
        return complexAdd(real(z), w);
    } else if ((z instanceof Complex) && typeof(w) === 'number') {
        return complexAdd(z, real(w));
    } else if ((z instanceof Complex) && (w instanceof Complex)) {
        return complexAdd(z, w);
    }
}

function sub(z, w) {
    if (typeof(z) === 'number' && typeof(w) === 'number') {
        return z - w;
    } else if (typeof(z) === 'number' && (w instanceof Complex)) {
        return complexSub(real(z), w);
    } else if ((z instanceof Complex) && typeof(w) === 'number') {
        return complexSub(z, real(w));
    } else if ((z instanceof Complex) && (w instanceof Complex)) {
        return complexSub(z, w);
    }
}

function mul(z, w) {
    if (typeof(z) === 'number' && typeof(w) === 'number') {
        return z*w;
    } else if (typeof(z) === 'number' && (w instanceof Complex)) {
        return complexMul(real(z), w);
    } else if ((z instanceof Complex) && typeof(w) === 'number') {
        return complexMul(z, real(w));
    } else if ((z instanceof Complex) && (w instanceof Complex)) {
        return complexMul(z, w);
    }
}

function div(z, w) {
    if (typeof(z) === 'number' && typeof(w) === 'number') {
        return z/w;
    } else if (typeof(z) === 'number' && (w instanceof Complex)) {
        return complexDiv(real(z), w);
    } else if ((z instanceof Complex) && typeof(w) === 'number') {
        return complexDiv(z, real(w));
    } else if ((z instanceof Complex) && (w instanceof Complex)) {
        return complexDiv(z, w);
    }
}

function pow(z, w) {
    if (typeof(z) === 'number' && typeof(w) === 'number') {
        return Math.pow(z, w);
    } else if (typeof(z) === 'number' && (w instanceof Complex)) {
        return complexPow(real(z), w);
    } else if ((z instanceof Complex) && typeof(w) === 'number') {
        return complexPow(z, real(w));
    } else if ((z instanceof Complex) && (w instanceof Complex)) {
        return complexPow(z, w);
    }
}

const real = r => new Complex(r, 0.0);

const imag = r => new Complex(0.0, r);
 
const exp = z => {
    if (z instanceof Complex) {
        return new Complex(Math.exp(z.real)*Math.cos(z.imag),
                           Math.exp(z.real)*Math.sin(z.imag));
    } else if (typeof(z) === 'number') {
        return Math.exp(z);
    }
}

const cos = z => {
    if (z instanceof Complex) {
        return mul(real(0.5), 
            add(exp(mul(imag(1.0), z)), exp(mul(imag(-1.0), z))));
    } else if (typeof(z) === 'number') {
        return Math.cos(z);
    } 
}

const sin = z => {
    if (z instanceof Complex) {
        return mul(imag(-0.5), 
            sub(exp(mul(imag(1.0), z)), exp(mul(imag(-1.0), z))));
    } else if (typeof(z) === 'number') {
        return Math.sin(z);
    } 
}

const tan = z => sin(z)/cos(z);


const cosh = z => {
    if (z instanceof Complex) {
        return mul(real(0.5), add(exp(z), exp(mul(real(-1.0), z))));
    } else if (typeof(z) === 'number') {
        return Math.cosh(z);
    } 
}

const sinh = z => {
    if (z instanceof Complex) {
        return mul(real(0.5), sub(exp(z), exp(mul(real(-1.0), z))));
    } else if (typeof(z) === 'number') {
        return Math.sinh(z);
    } 
}

const tanh = z => sinh(z)/cosh(z);

const log = z => {
    if (z instanceof Complex)
        return new Complex(Math.log(z.abs), z.arg);
    else (typeof(z) === 'number')
        return Math.log(z);
}

const negate = z => {
    if (z instanceof Complex) {
        return new Complex(-z.real, -z.imag);
    } else if (typeof(z) === 'number') {
        return -z;
    }
}

const step = z => {
    if (z instanceof Complex) {
        return (z.real >= 0.0)? 1.0: 0.0;
    }
    return (z >= 0.0)? 1.0: 0.0;
}

const lorentzTransform = (angle, r) => {
    return {
        t: add(mul(cosh(angle), r.t), mul(sinh(angle), r.x)),
        x: add(mul(sinh(angle), r.t), mul(cosh(angle), r.x)),
    }
}


/* Parsing ******************************************************************/

/*
References:

Wikipedia - Shunting Yard Algorithm
https://en.wikipedia.org/wiki/Shunting_yard_algorithm

TODO:

 - Need to properly handle expressions that start with the "-" character, i.e.
"-12 + x" or "10 * (-7 + 100*x)"

- Also need to fix that when the - or + operator appear directly after a
numerical value without any spaces inbetween it gets merged into that 
same value.

- Handle negative powers

- An infinite loop appears to occur when entering "." on its own. Decimal
numbers seem to work fine.

- Check if parenthesis match before computing the expression stack. This
may avoid an infinite loop.

*/
const LETTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
const OPS = '^/*+-';
const NUMBER_CHARACTERS_LIST = (() => {
    let vals = [];
    for (let i = 0; i < 10; i++)
        vals.push(String(i));
    // Include characters used in expressing floating point expressions
    for (let c of ['e', '-', '+', '.']) {
        vals.push(c);
    }
    return vals;
})();
const FUNCTIONS = {
    abs: abs, 
    exp: exp,
    sin: sin, cos: cos, tan: tan,
    // acos: Math.acos, asin: Math.asin, atan: Math.atan,
    sinh: sinh, cosh: cosh, tanh: tanh,
    // asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh,
    log: log,
    step: step
};


const PRECEDENCE_RANK = (() => {
    let precedenceRank = {};
    Object.keys(FUNCTIONS).forEach(e => precedenceRank[e] = 3);
    OPS.split('').forEach(e => {
        switch(e) {
            case '^':
                precedenceRank[e] = 2;
                break;
            case '/': case '*':
                precedenceRank[e] = 1;
                break;
            case '+': case '-':
                precedenceRank[e] = 0;
                break;
            default:
                break;
        }
    });
    return precedenceRank;
})();

function precedenceOf(c) {
    return PRECEDENCE_RANK[c];
}

function isSingleCharacterNumber(c) {
    return '1234567890'.split('').find(e => e === c);
}

function isValidNumericalCharacter(c) {
    return NUMBER_CHARACTERS_LIST.find(e => c === e);
}

function isSingleCharacterOp(c) {
    return OPS.split('').find(e => c === e);
}

function isALetter(c) {
    return LETTERS.split('').find(e => e === c);
}

function isBannedCharacter(c) {
    return !(isValidNumericalCharacter(c) || isSingleCharacterOp(c)
        || isALetter(c) || c === ' ');
}

function isParenthesis(c) {
    return c === '(' || c === ')';
}

function isLeftParenthesis(c) {
    return c === '(';
}

function isRightParenthesis(c) {
    return c === ')';
}

function isDecimalPoint(c) {
    return c === '.';
}

function parseVariable(inputStr, startIndex) {
    let variable = '';
    let j = startIndex;
    for (; (isSingleCharacterNumber(inputStr[j]) 
            || isALetter(inputStr[j])) && j < inputStr.length;
         j++) {
        variable += inputStr[j];
    }
    return {parsedVariable: variable, endIndex: j};
}

function parseInteger(inputStr, startIndex) {
    let valStr = '';
    let j = startIndex;
    for (; isSingleCharacterNumber(inputStr[j]) && j < inputStr.length;
         j++) {
        valStr += inputStr[j];
    }
    return {parsedNumber: valStr, endIndex: j};
}

function parseAfterExponent(inputStr, 
        valStrBeforeExponent, indexAfterExponent) {
    let j = indexAfterExponent;
    let valStr = valStrBeforeExponent + 'e';
    if (j === inputStr.length) {
        return {parseSuccess: false, parsedNumber: valStr, endIndex: j};
    }
    if (isSingleCharacterNumber(inputStr[j])) {
        let {parsedNumber: valStr2, endIndex: k} = parseInteger(inputStr, j);
        return {
            parseSuccess: true, parsedNumber: valStr + valStr2, endIndex: k};
    } else if (inputStr[j] === '+' || inputStr[j] === '-') {
        valStr += inputStr[j];
        j++;
        if (j === inputStr.length)
            return {parseSuccess: false, 
                    parsedNumber: valStr, endIndex: j};
    }

    if (isSingleCharacterNumber(inputStr[j])) {
        let {parsedNumber: valStr2, endIndex: k} = parseInteger(inputStr, j);
        if (k !== inputStr.length && inputStr[k] === '.')
            return {parseSuccess: false, 
                parsedNumber: valStr + valStr2, endIndex: k};
        return {
            parseSuccess: true, parsedNumber: valStr + valStr2, endIndex: k};   
    }
    return {parseSuccess: false, parsedNumber: valStr, endIndex: j};
}


function parseAfterDecimal(inputStr, valStrBeforeDecimal, indexAfterDecimal) {
    let j = indexAfterDecimal;
    let valStr = valStrBeforeDecimal + '.';
    // if (j === inputStr.length)
    //    return {parseSuccess: false, parsedNumber: null, endIndex: -1};
    if (isSingleCharacterNumber(inputStr[j])) {
        let {parsedNumber: valStr2, endIndex: k} = parseInteger(inputStr, j); 
        j = k;
        valStr += valStr2;
    }
    // If it's the end of the input string, early return.
    if (j === inputStr.length) 
        return {parseSuccess: true, parsedNumber: valStr, endIndex: j};
    if (isSingleCharacterOp(inputStr[j]) 
        || isRightParenthesis(inputStr[j])
        || inputStr[j] === ' ') {
        return {parseSuccess: true, 
                parsedNumber: valStr, endIndex: j};
    } else if (inputStr[j] === 'e') {
        return parseAfterExponent(inputStr, valStr, j + 1);
    }
    return {parseSuccess: false, parsedNumber: null, endIndex: -1};
}

function parseNumber(inputStr, startIndex) {

    // Parse an integer
    let {parsedNumber: valStr, endIndex: j} 
        = parseInteger(inputStr, startIndex);

    // If it's the end of the input string, early return.
    if (j === inputStr.length) 
        return {parseSuccess: true, parsedNumber: valStr, endIndex: j};

    // If a space, ')', or operator directly follows the string
    // of numbers, then it is an integer value, so return it.
    if (isSingleCharacterOp(inputStr[j]) 
        || isRightParenthesis(inputStr[j])
        || inputStr[j] === ' ') {
        return {parseSuccess: true, 
                parsedNumber: valStr, endIndex: j};
    // Else if there is a '.' or an 'e' directly after the string of
    // numbers, then we're dealing with a floating point value.
    } else if (inputStr[j] === 'e') {
        return parseAfterExponent(inputStr, valStr, j + 1);
    } else if (isDecimalPoint(inputStr[j])) {
        return parseAfterDecimal(inputStr, valStr, j + 1);
    // Any other character returns a failure.
    } else {
        return {parseSuccess: false, parsedNumber: null, endIndex: -1};
    }
}

/* Handle unary operators by placing zero before them.
*/
function handleUnaryOperators(expr) {
    if (expr[0] === '-' || expr[0] === '+')
        expr.unshift('0');
    for (let i = 0; i < expr.length-1; i++) {
        if (expr[i] === '(' && (expr[i+1] === '-' || expr[i+1] === '+')) {
            let newExpr = [];
            expr.forEach((e, j) => {if (j <= i) newExpr.push(e)});
            newExpr.push('0');
            expr.forEach((e, j) => {if (j >= i+1) newExpr.push(e)});
            expr = newExpr;
        }
    }
    return expr;
}

function checkIfParenthesesAreBalanced(inputStr) {
    let leftParenthesesStack = [];
    for (let i = 0; i < inputStr.length; i++) {
        if (isLeftParenthesis(inputStr[i])) {
            leftParenthesesStack.push(inputStr[i]);
        } else if (isRightParenthesis(inputStr[i])) {
            if (leftParenthesesStack.length === 0)
                return false;
            leftParenthesesStack.pop();
        }
    }
    return (leftParenthesesStack.length === 0)? true: false;
}

function getExpressionStack(inputStr) {
    if (!checkIfParenthesesAreBalanced(inputStr)) {
        console.error("Unbalanced parentheses");
        return [];
    }
    let expr = [];
    let i = 0;
    while (i < inputStr.length) {
        let c = inputStr[i];
        if (isSingleCharacterNumber(c)) {
            let {parseSuccess: success, parsedNumber: val, endIndex: endIndex}
                = parseNumber(inputStr, startIndex=i);
            if (!success) {
                console.error("Invalid numerical value");
                return [];
            }
            i = endIndex;
            expr.push(val);
        } else if (isALetter(c)) {
            let {parsedVariable: val, endIndex: endIndex}
                = parseVariable(inputStr, startIndex=i);
            i = endIndex;
            expr.push(val);
        } else if (isSingleCharacterOp(c) || isParenthesis(c)) {
            expr.push(c);
            i++;
        } else if (c === ' ') {
            i++;
        } else {
            console.error("Invalid expression");
            return [];
        }
    }
    expr = handleUnaryOperators(expr);
    expr.reverse();
    return expr;
}

function handleOperators(opNew, operatorStack, rpnList) {
    if (operatorStack.length > 0) {
        while (operatorStack.length > 0) {
            let opPrev = operatorStack.pop();
            if (isLeftParenthesis(opPrev) 
                || precedenceOf(opNew) > precedenceOf(opPrev)) {
                operatorStack.push(opPrev);
                operatorStack.push(opNew);
                break;
            } else {
                rpnList.push(opPrev);
                if (operatorStack.length === 0) {
                    operatorStack.push(opNew);
                    break;
                }
            }
        }
        /* let opPrev = operatorStack.pop();
        if (precedenceOf(opNew) <= precedenceOf(opPrev)) {
            while (operatorStack.length > 0 &&
                precedenceOf(opNew) <= precedenceOf(opPrev)) {
                rpnList.push(opPrev);
                opPrev = operatorStack.pop();
            }
            if (precedenceOf(opNew) <= precedenceOf(opPrev)) {
                rpnList.push(opPrev);
                operatorStack.push(opNew);
            } else {
                operatorStack.push(opPrev);
                operatorStack.push(opNew);
            }
        } else {
            operatorStack.push(opPrev);
            operatorStack.push(opNew);
        }*/
    } else { // Operator stack is empty
        operatorStack.push(opNew);
    }
}

function shuntingYard(exprStack) {
    let rpnList = []; // Reverse polish notation list
    let operatorStack = [];
    while (exprStack.length > 0) {
        let c = exprStack.pop();
        if (!isNaN(parseFloat(c))) { // Values
            rpnList.push(c);
        } else if (isLeftParenthesis(c)) {
            operatorStack.push(c);
        } else if (isRightParenthesis(c)) { 
            let e = operatorStack.pop();
            while(!isLeftParenthesis(e)) {
                rpnList.push(e);
                e = operatorStack.pop();
            }
        } else if (isSingleCharacterOp(c)) { // Operator
            handleOperators(c, operatorStack, rpnList);
        } else if (isALetter(c[0])) { // Variables and functions
            if (Object.keys(FUNCTIONS).find(e => e === c))
                handleOperators(c, operatorStack, rpnList);
            else
                rpnList.push(c);
        }
    }
    while (operatorStack.length) {
        rpnList.push(operatorStack.pop());
    }
    return rpnList;
}

function computeRPNExpression(rpnList, variables={}) {
    let rpnStack = [];
    while(rpnList.length > 0) {
        let e = rpnList.shift();
        if (!isNaN(parseFloat(e))) {
            rpnStack.push(parseFloat(e));
        } else if (isSingleCharacterOp(e)) {
            let opR = rpnStack.pop();
            let opL = rpnStack.pop();
            let val;
            switch (e) {
                case '+':
                    val = add(opL, opR);
                    break;
                case '-':
                    val = sub(opL, opR);
                    break;
                case '*':
                    val = mul(opL, opR);
                    break;
                case '/':
                    val = div(opL, opR);
                    break;
                case '^':
                    val = pow(opL, opR);
                    break;
                default:
                    break;
            }
            // console.log(opL, e, opR, ' = ', val);
            rpnStack.push(val);
        } else if (isALetter(e[0])) {
            if (Object.keys(FUNCTIONS).find(f => f === e)) {
                let val = rpnStack.pop();
                rpnStack.push(FUNCTIONS[e](val));
            } else {
                for (let k of Object.keys(variables)) {
                    if (k === e)
                        rpnStack.push(variables[k]); 
                }
            }
        }
    }
    return rpnStack.pop();
}

function turnRPNExpressionToString(rpnList) {
    let rpnStack = [];
    while(rpnList.length > 0) {
        let e = rpnList.shift();
        if (!isNaN(parseFloat(e))) {
            // rpnStack.push(e);
            rpnStack.push(`r2C(${parseFloat(e).toExponential()})`);
        } else if (isSingleCharacterOp(e)) {
            let opR = rpnStack.pop();
            let opL = rpnStack.pop();
            let val;
            switch (e) {
                case '+':
                    val = `add(${opL}, ${opR})`;
                    break;
                case '-':
                    val = `sub(${opL}, ${opR})`;
                    break;
                case '*':
                    val = `mul(${opL}, ${opR})`;
                    break;
                case '/':
                    val = `div(${opL}, ${opR})`;
                    break;
                case '^':
                    val = `powC(${opL}, ${opR})`;
                    // val = `pow(${opL}, ${opR})`;
                    break;
                default:
                    break;
            }
            // console.log(opL, e, opR, ' = ', val);
            rpnStack.push(val);
        } else if (isALetter(e[0])) {
            if (Object.keys(FUNCTIONS).find(f => f === e)) {
                let val = rpnStack.pop();
                // rpnStack.push(`${e}(${val})`);
                rpnStack.push(`${e}C(${val})`);
            } else {
                rpnStack.push(e);
            }
        }
    }
    return rpnStack.pop();
}

function getRPNExprList(exprStr) {
    let exprStack = getExpressionStack(exprStr);
    return shuntingYard(exprStack);
}

function getVariablesFromRPNList(rpnList) {
    let variables = new Set();
    for (let e of rpnList) {
        if (isALetter(e.toString()[0]) 
            && !Object.keys(FUNCTIONS).includes(e)) {
            variables.add(e);
        }
    }
    return variables;
}

function computeExprStr(exprStr, variables={}) {
    let rpnList = getRPNExprList(exprStr);
    console.log(rpnList);
    let val = computeRPNExpression(rpnList, variables);
    return val;
}


class Node {
    _val;
    nodes = [];
    constructor(val, ...args) {
        this._val = val;
        for (let e of args) {
            if (e instanceof Node)
                this.nodes.push(e);
            else
                this.nodes.push(new Node(e));
        }
    }
    get val() {
        return this._val;
    }
    add(node) {
        this.nodes.push(node);
    }
    contains(symbol) {
        if (this.val === symbol) {
            return true;
        } else {
            for (let e of this.nodes) {
                if (e.contains(symbol))
                    return true;
            }
            return false;
        }
    }
}

function stringifyNode(node) {
    if (isSingleCharacterOp(node.val)) {
        let opL = node.nodes[0];
        let opR = node.nodes[1];
        let strL = stringifyNode(opL);
        let strR = stringifyNode(opR);
        if (isSingleCharacterOp(opL.val)
            && precedenceOf(opL.val) < precedenceOf(node.val))
            strL = `(${strL})`;
        if (isSingleCharacterOp(opR.val)
            && precedenceOf(opR.val) < precedenceOf(node.val))
            strR = `(${strR})`;
        return `${strL}${node.val}${strR}`;
    } else if (Object.keys(FUNCTIONS).find(f => f === node.val)) {
        if (node.nodes.length === 1) {
            let strVal = stringifyNode(node.nodes[0]);
            return `${node.val}(${strVal})`;
        }
    } else {
        return `${node.val}`;
    }
}

function evaluate(operator, ...args) {
    if (Object.keys(FUNCTIONS).find(f => f === operator)) {
        return FUNCTIONS[operator](args[0]);
    }
    switch(operator) {
        case '+':
            return args[0] + args[1];
        case '-':
            return args[0] - args[1];
        case '*':
            return args[0]*args[1];
        case '/':
            return args[0]/args[1];
        case '^':
            return Math.pow(args[0], args[1]);
    }
    return 0.0;
}

function simplifyTopLevel(exprTree) {
    if (isSingleCharacterOp(exprTree.val)
        || Object.keys(FUNCTIONS).find(f => f === exprTree.val)) {
        if (exprTree.nodes.every(e => !isNaN(parseFloat(e.val)))) {
            console.log(exprTree.val, exprTree.nodes);
            return new Node(evaluate(exprTree.val, 
                                     ...exprTree.nodes.map(e => e.val)));
        }
        if (exprTree.val === '+') {
            if (exprTree.nodes.every(e => e.val === 0.0))
                return new Node(0.0);
            if (exprTree.nodes[0].val === 0.0)
                return exprTree.nodes[1];
            else if (exprTree.nodes[1].val === 0.0)
                return exprTree.nodes[0];
            return exprTree;
        } else if (exprTree.val === '-') {
            if (exprTree.nodes.every(e => e.val === 0.0))
                return new Node(0.0);
            if (exprTree.nodes[0].val === 0.0)
                return new Node('*', -1.0, exprTree.nodes[1]);
            else if (exprTree.nodes[1].val === 0.0)
                return exprTree.nodes[0];
            return exprTree;
        } else if (exprTree.val === '*') {
            // TODO: check if there are any denominator values that
            // produces a zero.
            if (exprTree.nodes.some(e => e.val === 0.0))
                return new Node(0.0);
            if (exprTree.nodes[1].val === 1.0)
                return exprTree.nodes[0];
            else if (exprTree.nodes[0].val === 1.0)
                return exprTree.nodes[1];
            return exprTree;
        } else if (exprTree.val === '^') {
            let powVal = parseFloat(exprTree.nodes[1].val);
            if (powVal === 1.0) {
                return exprTree.nodes[0];
            } else if (powVal === 0.0) {
                return new Node(1.0);
            }
        } else if (exprTree.val === '/') {
            let num = exprTree.nodes[0];
            if (parseFloat(num.val) === 0.0)
                return new Node(0.0);
        }
        return exprTree;
    }
    return exprTree;
}

function simplify(exprTree) {
    exprTree.nodes = exprTree.nodes.map(e => simplify(e));
    return simplifyTopLevel(exprTree);
}

function derivative(exprTreeParam, variable) {
    let exprTree = simplify(exprTreeParam);
    if (!exprTree.contains(variable)) {
        return new Node(0.0);
    } else {
        if (exprTree.val === '+' || exprTree.val === '-') {
            return simplify(new Node(
                exprTree.val, 
                derivative(exprTree.nodes[0], variable),
                derivative(exprTree.nodes[1], variable)));
        } else if (exprTree.val === '*') {
            let opL1 = exprTree.nodes[0];
            let opR1 = exprTree.nodes[1];
            let opL2 = new Node('*', derivative(opL1, variable), opR1);
            let opR2 = new Node('*', opL1, derivative(opR1, variable));
            return simplify(new Node('+', opL2, opR2));
        } else if (exprTree.val === '^' 
                   && Number.isInteger(exprTree.nodes[1].val)) {
            let n = Number.parseInt(exprTree.nodes[1].val);
            let opL = new Node('*', n, new Node('^', exprTree.nodes[0], n-1));
            let opR = derivative(exprTree.nodes[0], variable);
            return simplify(new Node('*', opL, opR));

        } else if (exprTree.val === '/') {
            let num0 = exprTree.nodes[0];
            let den0 = exprTree.nodes[1];
            let numFinal1 = derivative(exprTree.nodes[0], variable);
            let opL = new Node('/', numFinal1, den0);
            let opRPart1 = new Node('^', den0, -2);
            let opRPart2 = new Node('*', num0, derivative(den0, variable));
            let opR = new Node('*', opRPart1, opRPart2);
            return simplify(new Node('-', opL, opR));
        } else if (Object.keys(FUNCTIONS).find(f => f === exprTree.val)) {
            let arg = exprTree.nodes[0];
            let ddVarArg = derivative(arg, variable);
            let ddVarFunc = new Node(0.0);
            if (exprTree.val === 'sin') {
                ddVarFunc = new Node('cos', arg);
            } else if (exprTree.val === 'cos') {
                ddVarFunc = new Node('*', 
                                     new Node(-1.0), new Node('sin', arg));
            } else if (exprTree.val === 'exp') {
                ddVarFunc = new Node('exp', arg);
            } else if (exprTree.val === 'log') {
                ddVarFunc = new Node('/', new Node(1.0), arg);
            } else if (exprTree.val === 'tan') {
                let tanSq = new Node('^', 
                                     new Node('tan', arg), new Node(2.0));
                ddVarFunc = new Node('+', new Node(1.0), tanSq);
            } // TODO: abs and the hyperbolic functions
            return new Node('*', ddVarFunc, ddVarArg);
        } else if (exprTree.val === variable) {
            return new Node(1);
        }
    }
    return simplify(exprTree);
}

function turnRPNExpressionToTree(rpnListParam) {
    let rpnList = rpnListParam.map(e => e);
    let rpnStack = [];
    while(rpnList.length > 0) {
        let e = rpnList.shift();
        if (!isNaN(parseFloat(e))) {
            rpnStack.push(new Node(parseFloat(e)));
        } else if (isSingleCharacterOp(e)) {
            let opR = rpnStack.pop();
            let opL = rpnStack.pop();
            rpnStack.push(new Node(e, opL, opR));
        } else if (isALetter(e[0])) {
            if (Object.keys(FUNCTIONS).find(f => f === e)) {
                let val = rpnStack.pop();
                rpnStack.push(new Node(e, val));
            } else {
                rpnStack.push(new Node(e));
            }
        }
    }
    return rpnStack.pop();
}

// let inputStr = '3 - 4*6/12 + 21';
// let inputStr = '3 * (7 + 12) - 8';
let inputStr = 'a*x*x + exp(exp(-b*x + c))'
let a = 1.0, b = 2.0, c = -10.0, d = 1.0, x = 10.0;
console.log(inputStr, ' = ', eval(inputStr));
let exprStack = getExpressionStack(inputStr);
let rpnList = shuntingYard(exprStack);
console.log(rpnList);
console.log(computeRPNExpression(
    rpnList.map(e => e), variables={a: a, b: b, c: c, d: d, x: x}));
console.log(turnRPNExpressionToString(rpnList.map(e => e)));

let inputStr2 = 'cos(exp(-a*x^2))';
console.log(inputStr2, ' = ', eval(inputStr2));
let tree = turnRPNExpressionToTree(getRPNExprList(inputStr2));
console.log('original: ', stringifyNode(tree));
console.log('derivative: ', stringifyNode((derivative(tree, 'x'))));

/* Domain colouring *********************************************************/

/* Complex-valued functions visualized using domain coloring:

Wikipedia - Domain coloring
https://en.wikipedia.org/wiki/Domain_coloring

Wikipedia - Hue
https://en.wikipedia.org/wiki/Hue

https://en.wikipedia.org/wiki/Hue#/media/File:HSV-RGB-comparison.svg

*/
function argToColor(arg) {
    const pi = Math.PI;
    let maxCol = 1.0;
    let minCol = 50.0/255.0;
    let colRange = maxCol - minCol;
    if (arg <= pi/3.0 && arg >= 0.0) {
        return {red: maxCol,
                green: minCol + colRange*arg/(pi/3.0),
                blue: minCol};
    } else if (arg > pi/3.0 && arg <= 2.0*pi/3.0) {
        return {red: maxCol - colRange*(arg - pi/3.0)/(pi/3.0),
                green: maxCol, 
                blue: minCol};
    } else if (arg > 2.0*pi/3.0 && arg <= pi) {
        return {red: minCol,
                green: maxCol,
                blue: minCol + colRange*(arg - 2.0*pi/3.0)/(pi/3.0)};
    } else if (arg < 0.0 && arg > -pi/3.0) {
        return {red: maxCol, 
                green: minCol,
                blue: minCol - colRange*arg/(pi/3.0)};
    } else if (arg <= -pi/3.0 && arg > -2.0*pi/3.0) {
        return {red: maxCol + (colRange*(arg + pi/3.0)/(pi/3.0)),
                green: minCol, 
                blue: maxCol};
    } else if (arg <= -2.0*pi/3.0 && arg >= -pi) {
        return {red: minCol,
                green: minCol - (colRange*(arg + 2.0*pi/3.0)/(pi/3.0)), 
                blue: maxCol};
    }
    else {
        return {red: minCol, green: maxCol, blue: maxCol};
    }
}

/* WebGL wrapper functions and classes **************************************/

let gCanvas = document.getElementById("sketchCanvas");
let gClientWidth = document.documentElement.clientWidth;
let gClientHeight = document.documentElement.clientHeight;
gCanvas.width = gClientWidth;
gCanvas.height = 0.9*gClientHeight;
// gCanvas.width = 2.0*gCanvas.height;


const gl = ((canvas) => {
    let gl = canvas.getContext("webgl2");
    if (gl === null) {
        gl = canvas.getContext("webgl");
        if (gl === null) {
            let msg = "Your browser does not support WebGL.";
            alert(msg);
            throw msg;
        }
        let ext = gl.getExtension('OES_texture_float');
        let ext2 = gl.getExtension('OES_texture_float_linear');
        if (ext === null && ext2 === null) {
            let msg = "Your browser does not support "
                      + "the necessary WebGL extensions.";
            alert(msg);
            throw msg;
        }
    } else {
        let ext = gl.getExtension('EXT_color_buffer_float');
        if (ext === null) {
            let msg = "Your browser does not support "
                       + "the necessary WebGL extensions.";
            alert(msg);
            throw msg;
        }
    }
    return gl;
})(gCanvas);


class IScalar {
    value;
    constructor(val) {
        this.value = val;
    }
}

class AbstractVec {
    ind;
    get x() { return this.ind[0]; }
    get y() { return this.ind[1]; }
    get z() { return this.ind[2]; }
    get w() { return this.ind[3]; }
    get r() { return this.ind[0]; }
    get g() { return this.ind[1]; }
    get b() { return this.ind[2]; }
    get a() { return this.ind[3]; }
    get s() { return this.ind[0]; }
    get t() { return this.ind[1]; }
    get p() { return this.ind[2]; }
    get q() { return this.ind[3]; }
    set x(x) { this.ind[0] = x; }
    set y(y) { this.ind[1] = y; }
    set z(z) { this.ind[2] = z; }
    set w(w) { this.ind[3] = w; }
    set r(r) { this.ind[0] = r; }
    set g(g) { this.ind[1] = g; }
    set b(b) { this.ind[2] = b; }
    set a(a) { this.ind[3] = a; }
    set s(s) { this.ind[0] = s; }
    set t(t) { this.ind[1] = t; }
    set p(p) { this.ind[2] = p; }
    set q(q) { this.ind[3] = q; }
}

class Vec2 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Float32Array(2);
        if (args.length !== 2)
            throw "Two elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseFloat(args[i]);
        }
    }
} 

class Vec3 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Float32Array(3);
        if (args.length !== 3)
            throw "Three elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseFloat(args[i]);
        }
    }
}

class Vec4 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Float32Array(4);
        if (args.length !== 4)
            throw "Four elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseFloat(args[i]);
        }
    }
}


class IVec2 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Int32Array(2);
        if (args.length !== 2)
            throw "Two elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseInt(args[i]);
        }
    }
}

class IVec3 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Int32Array(3);
        if (args.length !== 3)
            throw "Three elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseInt(args[i]);
        }
    }
}

class IVec4 extends AbstractVec {
    constructor(...args) {
        super();
        this.ind = new Int32Array(4);
        if (args.length !== 4)
            throw "Four elements required.";
        for (let i = 0; i < this.ind.length; i++) {
            this.ind[i] = parseInt(args[i]);
        }
    }
}

class TextureParams {
    format;
    width;
    height;
    generateMipmap;
    wrapS;
    wrapT;
    minFilter;
    magFilter;
    // sampleCount;
    constructor(
        format, 
        width, height, 
        generateMipmap=true,
        wrapS=gl.REPEAT, wrapT=gl.REPEAT,
        minFilter=gl.NEAREST, magFilter=gl.NEAREST,
        // sampleCount=0
        ) {
        this.format = format;
        this.width = width;
        this.height = height;
        this.generateMipmap = generateMipmap;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.minFilter = minFilter;
        this.magFilter = magFilter;
        // this.sampleCount = sampleCount;
    }
}

let gFramesCount = 0;

function acquireNewFrame() {
    let frame_id = gFramesCount;
    gFramesCount++;
    return frame_id;
}

function toBase(sized) {
    switch (sized) {
        case gl.RGBA32F: case gl.RGBA32I: case gl.RGBA32UI: case gl.RGBA16F:
        case gl.RGBA16I: case gl.RGBA16UI: case gl.RGBA8I: case gl.RGBA8UI:
        case gl.RGBA8:
            return gl.RGBA;
        case gl.RGB32F: case gl.RGB32I: case gl.RGB32UI: case gl.RGB16F:
        case gl.RGB16I: case gl.RGB16UI: case gl.RGB8I: case gl.RGB8UI:
        case gl.RGB8:
            return gl.RGB;
        case gl.RG32F: case gl.RG32I: case gl.RG32UI: case gl.RG16F:
        case gl.RG16I: case gl.RG16UI: case gl.RG8I: case gl.RG8UI:
            return gl.RG;
        case gl.R32F: case gl.R32I: case gl.R32UI: case gl.R16F: case gl.R16I:
        case gl.R16UI: case gl.R8: case gl.R8UI:
            return gl.RED;
    }
    return 0;
}

function toType(sized) {
    switch (sized) {
        case gl.RGBA32F: case gl.RGB32F: case gl.RG32F: case gl.R32F:
            return gl.FLOAT;
        case gl.RGBA32I: case gl.RGB32I: case gl.RG32I: case gl.R32I:
            return gl.INT;
        case gl.RGBA32UI: case gl.RGB32UI: case gl.RG32UI: case gl.R32UI:
            return gl.UNSIGNED_INT;
        case gl.RGBA16F: case gl.RGB16F: case gl.RG16F: case gl.R16F:
            return gl.HALF_FLOAT;
        case gl.RGBA16I: case gl.RGB16I: case gl.RG16I: case gl.R16I:
            return gl.SHORT;
        case gl.RGBA16UI: case gl.RGB16UI: case gl.RG16UI: case gl.R16UI:
            return gl.UNSIGNED_SHORT;
        case gl.RGBA8: case gl.RGB8: case gl.RG8: case gl.R8:
            return gl.UNSIGNED_BYTE;
        case gl.RGBA8UI: case gl.RGB8UI: case gl.RG8UI: case gl.R8UI:
            return gl.UNSIGNED_BYTE;
    }
    return 0;
}

function compileShader(ref, source) {
    let source2 = "#version 300 es\n" + source;
    gl.shaderSource(ref, source2);
    gl.compileShader(ref)
    // let status = gl.getShaderiv(ref, gl.COMPILE_STATUS);
    let infoLog = gl.getShaderInfoLog(ref);
    if (infoLog !== null && infoLog !== '')
        console.log(infoLog);
    /* if (status == false) {
        console.err(`Shader compilation failed ${infoLog}`);
    }*/
}

function shaderFromSource(source, type) {
    const reference = gl.createShader(type)
    if (reference === 0) {
        console.error(
            `Unable to create shader (error code ${gl.getError()})`);
        return 0;
    }
    compileShader(reference, source);
    return reference;
}

function unbind() {
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
}

const QUAD_VERTEX_SHADER = `
#if __VERSION__ <= 120
attribute vec3 position;
varying vec2 UV;
#else
in vec3 position;
out highp vec2 UV;
#endif
void main() {
    gl_Position = vec4(position.xyz, 1.0);
    UV = position.xy/2.0 + vec2(0.5, 0.5);
}
`

const getQuadVertices = () => new Float32Array(
    [-1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, -1.0, 0.0]);

const getQuadElements = () => new Int32Array([0, 1, 2, 0, 2, 3]);

let gQuadObjects = {
    isInitialized: false, vao: 0, vbo: 0, ebo: 0
};

gQuadObjects.init = () => {
    if (!gQuadObjects.isInitialized) {
        // TODO: Initialize vertex array object, if possible.
        // Initialize vertex buffer object
        gQuadObjects.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gQuadObjects.vbo);
        let vertices = getQuadVertices();
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        // Initialize element buffer object
        gQuadObjects.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gQuadObjects.ebo);
        let elements = getQuadElements();
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        gQuadObjects.isInitialized = true;
    }
}

class Quad {
    _id;
    _params;
    _texture;
    _fbo;
    constructor(textureParams) {
        this._id = acquireNewFrame();
        this._params = textureParams;
        this._initTexture();
        this._initBuffer();
        unbind();
    }
    get id() {
        return this._id;
    }
    static makeProgramFromPath(fragmentShaderPath) {
        console.log(`Compiling ${fragmentShaderPath}.\n`); // TODO!
    }
    static makeProgramFromSource(fragmentShaderSource) {
        let vsRef = shaderFromSource(QUAD_VERTEX_SHADER, gl.VERTEX_SHADER);
        let fsRef = shaderFromSource(fragmentShaderSource,
                                     gl.FRAGMENT_SHADER);
        let program = gl.createProgram();
        if (program === 0) {
            console.err("Unable to create program.");
        }
        gl.attachShader(program, vsRef);
        gl.attachShader(program, fsRef);
        // gl.GetProgramiv(program, gl.LINK_STATUS, &status)
        gl.linkProgram(program);
        let infoLog = gl.getProgramInfoLog(program);
        if (infoLog !== null && infoLog !== '')
            console.log(infoLog);
        gl.useProgram(program);
        return program;

    }
    _initTexture() {
        if (this._id === 0) {
            this._texture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            return;
        }
        let params = this._params;
        // console.log(this._id);
        gl.activeTexture(gl.TEXTURE0 + this._id);
        this._texture = gl.createTexture();
        /* console.log(this._texture);
        console.log(params.format,
                    toBase(params.format), toType(params.format));
        console.log(gl.RGBA32F, gl.RGBA, gl.FLOAT);*/
        gl.bindTexture(gl.TEXTURE_2D, this._texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, params.format, 
                        params.width, params.height, 0,
                        toBase(params.format), toType(params.format),
                        null);
        /* if (params.sampleCount === 0) {
            gl.bindTexture(gl.TEXTURE_2D, this._texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, params.format, 
                          params.width, params.height, 0,
                          toBase(params.format), toType(params.format),
                          null);
        } else {
            gl.bindTexture(gl.TEXTURE_2D_MULTISAMPLE, this._texture);
            gl.texImage2DMultisample(gl.TEXTURE_2D_MULTISAMPLE,
                                     params.sampleCount, params.format,
                                     params.width, params.height, true);
        }*/
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, params.wrapS);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, params.wrapT);
        gl.texParameteri(gl.TEXTURE_2D, 
            gl.TEXTURE_MIN_FILTER, params.minFilter);
        gl.texParameteri(gl.TEXTURE_2D, 
            gl.TEXTURE_MAG_FILTER, params.magFilter);
        if (params.generateMipmap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }
    _initBuffer() {
        gQuadObjects.init();
        if (this._id !== 0) {
            let params = this._params;
            this._fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                    gl.TEXTURE_2D, this._texture, 0);
            /* if (params.sampleCount === 0)
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                        gl.TEXTURE_2D, this._texture, 0);
            else
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                        gl.TEXTURE_2D_MULTISAMPLE,
                                        this._texture, 0);*/
        } 
    }
    _bind(program) {
        gl.useProgram(program);
        // gl.BindVertexArray(s_quad_objects.vao)
        gl.bindBuffer(gl.ARRAY_BUFFER, gQuadObjects.vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gQuadObjects.ebo);
        if (gQuadObjects.vao === 0) {
            let vertices = getQuadVertices();
            let elements = getQuadElements();
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        }
        if (this._id !== 0) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        let attrib = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 12, 0);
    }
    draw(program, uniforms) {
        this._bind(program);
        for (let name of Object.keys(uniforms)) {
            let loc = gl.getUniformLocation(program, name);
            let val = uniforms[name];
            if (typeof(val) === 'number') {
                gl.uniform1f(loc, val);
            } else if (val instanceof IScalar) {
                gl.uniform1i(loc, val.value);
            } else if (typeof(val) === 'boolean') {
                gl.uniform1i(loc, (val === true)? 1: 0);
            } else if (val instanceof Vec4) {
                gl.uniform4f(loc, val.x, val.y, val.z, val.w);
            } else if (val instanceof Vec2) {
                gl.uniform2f(loc, val.x, val.y);
            } else if (val instanceof IVec2) {
                gl.uniform2i(loc, val.x, val.y);
            } else if (val instanceof IVec4) {
                gl.uniform4i(loc, val.x, val.y, val.z, val.w);
            } else if (val instanceof Vec3) {
                console.log(name, loc, val.x, val.y, val.z);
                gl.uniform3f(loc, val.x, val.y, val.z);
            } else if (val instanceof IVec3) {
                gl.uniform3i(loc, val.x, val.y, val.z);
            } else if (val instanceof Complex) {
                gl.uniform2f(loc, val.real, val.imag);
            } else if (val instanceof Quad) {
                gl.uniform1i(loc, val.id);
            }
        }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, null);
        unbind();
    }
    substituteArray(arr) {
        // TODO
    }
    fillArray(arr) {
        // TODO
    }

}

function withDimensions(width, height, callback, ...args) {
    gl.viewport(0, 0, width, height);
    callback(args);
}

/* Shader strings for handling the user defined expression ******************/

const QUAD_FRAG_IF_DEFS = `
#if (__VERSION__ >= 330) || (defined(GL_ES) && __VERSION__ >= 300)
#define texture2D texture
#else
#define texture texture2D
#endif

#if (__VERSION__ > 120) || defined(GL_ES)
precision highp float;
#endif
    
#if __VERSION__ <= 120
varying vec2 UV;
#define fragColor gl_FragColor
#else
in vec2 UV;
out vec4 fragColor;
#endif
`;

const GLSL_COMPLEX = `
#define complex vec2
const float PI = 3.141592653589793;

const complex IMAG_UNIT = complex(0.0, 1.0); 

float absSquared(complex z) {
    return z.x*z.x + z.y*z.y;
}

complex absC(complex z) {
    return complex(sqrt(absSquared(z)), 0.0);
}

complex stepC(complex z) {
    return complex((z.x > 0.0)? 1.0: 0.0, 0.0);
}

complex conj(complex z) {
    return complex(z[0], -z[1]);
}

complex inv(complex z) {
    return conj(z)/absSquared(z);
}

float arg(complex z) {
    return atan(z.y, z.x);
}

complex r2C(float r) {
    return complex(float(r), 0.0);
}

complex mul(complex z, complex w) {
    return complex(z.x*w.x - z.y*w.y, z.x*w.y + z.y*w.x);
}

complex add(complex z, complex w) {
    return z + w;
}

complex sub(complex z, complex w) {
    return z - w;
}

complex div(complex z, complex w) {
    return mul(z, inv(w));
}

complex expC(complex z) {
    return exp(z.x)*complex(cos(z.y), sin(z.y));

}

complex cosC(complex z) {
    return 0.5*(expC(mul(IMAG_UNIT, z)) + expC(mul(-IMAG_UNIT, z)));
}

complex sinC(complex z) {
    return mul(expC(mul(IMAG_UNIT, z)) - expC(mul(-IMAG_UNIT, z)),
               -0.5*IMAG_UNIT);
}

complex tanC(complex z) {
    return sinC(z)/cosC(z); 
}

complex logC(complex z) {
    // if (z.y == 0.0)
    //     return complex(log(z.x), 0.0);
    return complex(log(absC(z)[0]), arg(z));
}

complex coshC(complex z) {
    return 0.5*(expC(z) + expC(-z));
}

complex sinhC(complex z) {
    return 0.5*(expC(z) - expC(-z));
}

complex tanhC(complex z) {
    return sinhC(z)/coshC(z);
}

complex powC(complex z, complex w) { 
    return expC(mul(logC(z), w));
}
`;

const GLSL_LORENTZ_2D = `
vec2 transform(complex angle, vec2 r0) {
    float t = r0[0], x = r0[1];
    return vec2(
        (coshC(angle)*t + sinhC(angle)*x).x,
        (sinhC(angle)*t + coshC(angle)*x).x
    );
}`;

const GLSL_DOMAIN_COLORING = `
vec3 argumentToColor(float argVal) {
    float maxCol = 1.0;
    float minCol = 50.0/255.0;
    float colRange = maxCol - minCol;
    if (argVal <= PI/3.0 && argVal >= 0.0) {
        return vec3(maxCol,
                    minCol + colRange*argVal/(PI/3.0), minCol);
    } else if (argVal > PI/3.0 && argVal <= 2.0*PI/3.0){
        return vec3(maxCol - colRange*(argVal - PI/3.0)/(PI/3.0),
                    maxCol, minCol);
    } else if (argVal > 2.0*PI/3.0 && argVal <= PI){
        return vec3(minCol, maxCol,
                    minCol + colRange*(argVal - 2.0*PI/3.0)/(PI/3.0));
    } else if (argVal < 0.0 && argVal > -PI/3.0){
        return vec3(maxCol, minCol,
                    minCol - colRange*argVal/(PI/3.0));
    } else if (argVal <= -PI/3.0 && argVal > -2.0*PI/3.0){
        return vec3(maxCol + (colRange*(argVal + PI/3.0)/(PI/3.0)),
                    minCol, maxCol);
    } else if (argVal <= -2.0*PI/3.0 && argVal >= -PI){
        return vec3(minCol,
                    minCol - (colRange*(argVal + 2.0*PI/3.0)/(PI/3.0)), 
                    maxCol);
    }
    else {
        return vec3(minCol, maxCol, maxCol);
    }
}
`;

const TEX_TO_VIEW_COORDS = `
uniform float scale;
uniform vec2 offset;
uniform vec2 viewDimensions;

vec2 texToViewCoords(vec2 r) {
    return scale*vec2(viewDimensions.x*r.x - 0.5 - offset.x,
                      viewDimensions.y*r.y - 0.5 - offset.y);
}
`

const GRID_LINES = `
uniform vec2 d;
uniform complex angle;
uniform float intVal;

float gridLines(vec2 uv) {
    complex a = angle;
    vec2 c = transform(-a, texToViewCoords(uv));
    vec2 downLeft 
        = transform(-a, texToViewCoords(uv + vec2(-d[0], -d[1])/2.0));
    vec2 downRight
        = transform(-a, texToViewCoords(uv + vec2(d[0], -d[1])/2.0));
    vec2 upLeft 
        = transform(-a, texToViewCoords(uv + vec2(-d[0], d[1])/2.0));
    vec2 upRight 
        = transform(-a, texToViewCoords(uv + vec2(d[0], d[1])/2.0));
    float minX = min(upLeft.x, downLeft.x);
    float maxX = max(upRight.x, downRight.x);
    float minY = min(downLeft.y, downRight.y);
    float maxY = max(upLeft.y, upRight.y);
    if (mod(maxX, intVal) == 0.0 || mod(minX, intVal) == 0.0
        || mod(minY, intVal) == 0.0 || mod(maxY, intVal) == 0.0
        || mod(c.x, intVal) == 0.0 || mod(c.y, intVal) == 0.0) {
        return 0.5;
    }
    if (mod(maxX, intVal) <= mod(minX, intVal))
        return 1.0;
    if (mod(maxY, intVal) <= mod(minY, intVal))
        return 1.0;
    return 0.0;
}

void main() {
    float c = gridLines(UV);
    fragColor = vec4(c);
}
`;

const MAIN_FUNC_SIMPLE_OUT = `
uniform complex angle;

void main() {
    complex z = function(transform(-angle, texToViewCoords(UV)));
    fragColor = vec4(z, z);
}
`;

const MAIN_FUNC_DISPLAY = `
uniform sampler2D tex;
uniform sampler2D gridTex;


void show1DSlice() {
    float x = UV.x;
    float y = UV.y;
    float miniWindowHeight = 0.2;
    complex z = texture2D(tex, vec2(x, miniWindowHeight)).xy;
    if (y < miniWindowHeight) {
        if (y > 0.85*miniWindowHeight*absC(z)[0])
            fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        else
            fragColor = vec4(argumentToColor(arg(z)), 1.0);
    }

}

void main() {
    complex z = texture2D(tex, UV).xy;
    vec3 col = absC(z)[0]*argumentToColor(arg(z));
    fragColor = vec4(min(col.r, 1.0), min(col.g, 1.0), min(col.b, 1.0), 1.0);
    float gridColor = texture2D(gridTex, UV).x;
    fragColor += 0.5*vec4(gridColor, gridColor, gridColor, 0.0);
    show1DSlice();
}
`;

/* More shaders *************************************************************/

const COMPLEX_1D_SLICE = `
#pragma vscode_glsllint_stage: frag
uniform sampler2D tex;

void main() {
    float x = UV.x;
    float y = UV.y;
    complex z = texture2D(tex, vec2(x, 0.5)).xy;
    if (y > absC(z)[0])
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    else
        fragColor = vec4(argumentToColor(arg(z)), 1.0); 
}
`

const SPLIT_VIEW = `
uniform sampler2D tex1;
uniform sampler2D tex2;

void main() {
    float x = UV.x;
    if (x > 0.0 && x < 0.5) {
        fragColor = texture2D(tex1, vec2(2.0*x, y));
    } else {
        fragColor = texture2D(tex2, vec2(2.0*(x - 0.5), y));
    }
}
`;

// let complexProgram = Quad.makeProgramFromSource(COMPLEX_MATH_SHADER);
// console.log(complexProgram);

/****************************************************************************/

let gPixelOrigin = {x: Number.parseInt(gCanvas.width/2.0),
                    y: Number.parseInt(gCanvas.height/4.0)};
let gDistancePerPixel = 1.0/gCanvas.width; 
let gAngle = 0.0;
let gScale = 1.0;
// let gAngleExprString = "";

let gOffset = new Vec2(0.0, 0.0);
let gUserStr = `sin(4*pi*x)*sin(4*pi*t)*exp(i*pi*t)`;
/* let gUserStr = `(`;
for (let i = -10.0; i < 10.0; i+=1.0) {
    gUserStr += ` + exp(-100.0*(x - (${i}))^2)`;
}
for (let i = -10.0; i < 10.0; i+=1.0) {
    gUserStr += ` + exp(-100.0*(t - (${i}))^2)`;
}
gUserStr += `)*exp(-i*t*10.0)`*/
console.log(gUserStr);
let gUserStrChanged = false;
let gUserExprInput = document.getElementById("userExprInput");
gUserExprInput.value = gUserStr;
gUserExprInput.addEventListener("input",
    () => {
        let newStr = gUserExprInput.value;
        if (newStr !== gUserStr) {
            gUserStr = newStr;
            gUserStrChanged = true;
            // console.log(computeExprStr(gUserStr,
            // {x: 1.0, y: 1.0, t: 0.0, pi: Math.PI}));
        }
    }
);

document.getElementById("angle").addEventListener("input",
    e => {
        gAngle = e.target.value/200.0;
        let vPrime = lorentzTransform(gAngle, {x: 0.0, t: 1.0});
        // console.log(`v = ${vPrime.x/vPrime.t}c`);
        document.getElementById("speedDisplay").innerHTML
            = `v = ${Number.parseFloat(vPrime.x/vPrime.t).toFixed(2)}c`;
        drawCanvas();
    }
);

let gShouldTranslateTime = false;
document.getElementById("translateTime").addEventListener("click", e=> {
    gShouldTranslateTime = !gShouldTranslateTime;
});

let gMousePositions = [];

const mousePositionsHandler = (xf, yf) => {
    if (xf > 0.0 && xf < 1.0 && yf > 0.0 && yf < 1.0) {
        if (gMousePositions.length > 0) {
            let last = gMousePositions.pop();
            let dx = xf - last.x;
            let dy = yf - last.y;
            last.x = xf;
            last.y = yf;
            gOffset.x += dx;
            gOffset.y -= dy;
            gMousePositions.push(last);
            gMousePositions.push(new Vec2(xf, yf));
            // console.log(gOffset.x, gOffset.y);
            drawCanvas();
        } else {
            gMousePositions.push(new Vec2(xf, yf));
        }
        if (gMousePositions.length > 2)
            gMousePositions.shift();
    }
}

gCanvas.addEventListener("mousemove", e => {
    if (e.buttons !== 0) {
        // console.log(e);
        console.log(gOffset);
        let xf = ((e.clientX - gCanvas.offsetLeft)/
            gCanvas.width);
        let yf = ((e.clientY - gCanvas.offsetTop)/
            gCanvas.height);
        mousePositionsHandler(xf, yf);
    }
});

gCanvas.addEventListener("mouseup", () => {
    gMousePositions = [];
});

gCanvas.addEventListener("wheel", e => {
    let xf = ((e.clientX - gCanvas.offsetLeft)/
            gCanvas.width);
        let yf = ((e.clientY - gCanvas.offsetTop)/
            gCanvas.height);
    console.log(xf, yf);
    if ((gScale + e.deltaY/200.0) > 0.1) {
        console.log(e.deltaY);
        gScale += e.deltaY/200.0;
        // gOffset.x /= gScale;
        // gOffset.y /= gScale;
        drawCanvas();
    }
    // console.log(e.deltaY);
});

let doubleTouches = [];

gCanvas.addEventListener("touchmove", e => {
    let touches = e.changedTouches;
    let touchCount = touches.length;
    if (touchCount === 1) {
        let yf = (touches[0].pageY - gCanvas.offsetTop)/gCanvas.height;
        let xf = (touches[0].pageX - gCanvas.offsetLeft)/gCanvas.width;
        mousePositionsHandler(xf, yf);
    } else if (touchCount >= 2) {
        let doubleTouch = [];
        for (let i = 0; i < 2; i++) {
            let x = (touches[i].pageX - gCanvas.offsetLeft)/gCanvas.width;
            let y = (touches[i].pageX - gCanvas.offsetTop)/gCanvas.height;
            doubleTouch.push(new Vec2(x, y));
        }
        if (doubleTouches.length === 0) {
            doubleTouches.push(doubleTouch);
            return;
        }
        let doubleTouchLast = doubleTouches.pop();
        let lengthLast 
            = Math.sqrt(Math.pow(doubleTouchLast[1].x 
                                 - doubleTouchLast[0].x, 2)
                        + Math.pow(doubleTouchLast[1].y 
                                   - doubleTouchLast[0].y, 2));
        let length 
            = Math.sqrt(Math.pow(doubleTouch[1].x - doubleTouch[0].x, 2)
                        + Math.pow(doubleTouch[1].y - doubleTouch[0].y, 2));
        let center = new Vec2(
            (doubleTouch[1].x + doubleTouch[0].x)/2.0,
            (doubleTouch[1].y + doubleTouch[0].y)/2.0);
        let scaleFactor = length/lengthLast;
        // gOffset.x += 
        // gOffset.x = 0.0;
        // gOffset.y = 0.0;
        gScale /= scaleFactor;
        doubleTouches.push(doubleTouch);
        drawCanvas();
    }
    console.log(touches);
});

gCanvas.addEventListener("touchend", () => {
    gMousePositions = [];
    doubleTouches = [];
});

function getNumberLabelledShaderLines() {
    let numberedLines = {};
    let i = 1;
    for (let e of GRID_LINES_SHADER.split('\n')) {
        i++;
        numberedLines[i] = e;
    }
    return numberedLines;
}

let MAIN_VIEW_PROGRAM = Quad.makeProgramFromSource(
    QUAD_FRAG_IF_DEFS + GLSL_COMPLEX + GLSL_DOMAIN_COLORING
    + MAIN_FUNC_DISPLAY
);
const GRID_LINES_SHADER 
    = QUAD_FRAG_IF_DEFS+ GLSL_COMPLEX + GLSL_LORENTZ_2D 
    + GLSL_DOMAIN_COLORING + TEX_TO_VIEW_COORDS + GRID_LINES;

let numberedLines = getNumberLabelledShaderLines(GRID_LINES_SHADER);
let GRID_LINES_PROGRAM = Quad.makeProgramFromSource(GRID_LINES_SHADER);
console.log(GRID_LINES_PROGRAM);
/*let SLICE_1D_PROGRAM = Quad.makeProgramFromSource(
    QUAD_FRAG_IF_DEFS + GLSL_COMPLEX + GLSL_DOMAIN_COLORING
    + COMPLEX_1D_SLICE
);*/ 


let gUserUniforms = {};
function createUserSlider(varName) {
    let userSliders = document.getElementById("userSliders");
    let sliderDiv = document.createElement("div");
    let slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-100.0";
    slider.max = "100.0";
    slider.name = `variable-${varName}`;
    slider.value = "10.0";
    let label = document.createElement("label");
    label.for = slider.name;
    label.style = "color:white; font-family:Arial, Helvetica, sans-serif";
    label.textContent = `${varName} = ${1}`;
    if (Object.keys(gUserUniforms).includes(varName)) {
        label.textContent = `${varName} = ${gUserUniforms[varName].real}`;
        slider.value = `${10.0*gUserUniforms[varName].real}`;
    }
    sliderDiv.appendChild(slider);
    sliderDiv.appendChild(label);
    userSliders.appendChild(sliderDiv);
    slider.addEventListener("input",
    e => {
        let value = e.target.value/10.0;
        if (Object.keys(gUserUniforms).includes(varName)) {
            gUserUniforms[varName] = new Complex(value, 0.0);
        }
        // console.log(value);
        label.textContent = `${varName} = ${value}`;
        gUserStrChanged = true;
    });
}
gl.enable(gl.SAMPLE_COVERAGE);
gl.sampleCoverage(1.0, false);

let t = new TextureParams(gl.RGBA32F, gCanvas.width, gCanvas.height,
                          generateMipmap=true,
                          wrapS=gl.CLAMP_TO_EDGE, wrapT=gl.CLAMP_TO_EDGE,
                          minFilter=gl.NEAREST, magFilter=gl.NEAREST);
let gMainQuad = new Quad(t);
let gDrawQuad = new Quad(t);
let gGridQuad = new Quad(t);
// let gProgram = null;

let gVariableSet = new Set();

function drawCanvas() {
    let rpnList = getRPNExprList(gUserStr);
    let variables = getVariablesFromRPNList(rpnList);
    console.log(variables);
    for (let v of ['i', 'x', 'pi', 't'])
        variables.delete(v);
    let variablesLst = [];
    variables.forEach(e => variablesLst.push(e));
    console.log(variablesLst);
    let userUniformsStr = variablesLst.reduce(
        (a, e) => a + `uniform complex ${e};\n`, ``);
    console.log(userUniformsStr);
    let exprString = turnRPNExpressionToString(rpnList.map(e => e));
    console.log(exprString);
    let uniforms = {};
    variablesLst.forEach(e => uniforms[e] = new Complex(1.0, 0.0));
    for (let e of Object.keys(uniforms)) {
        if (Object.keys(gUserUniforms).includes(e))
            uniforms[e] = gUserUniforms[e];
    }
    gUserUniforms = {...uniforms, ...gUserUniforms};
    let variablesSet = new Set(variablesLst);
    {
        let b1 = [];
        variablesSet.forEach(e => b1.push(gVariableSet.has(e)));
        let b2 = [];
        gVariableSet.forEach(e => b2.push(variablesSet.has(e)));
        if (!(b1.every(e => e) && b2.every(e => e))) {
            if (!(b1.length === b2.length && b1.length === 0)) {
                let userSliders = document.getElementById("userSliders");
                userSliders.innerHTML = ``;
                for (let e of Object.keys(uniforms)) {
                    createUserSlider(e);
                }
                gVariableSet = variablesSet;
            }
        } 
    }
    let userExpr = `complex function (vec2 uv) {`
        + `    complex i = IMAG_UNIT;`
        + `    complex pi = complex(PI, 0.0);`
        + `    complex t = complex(uv[1], 0.0);`
        + `    complex x = complex(uv[0], 0.0);`
        + `    return ${exprString};`
        + `}`;
    let computeUserExprShader = (QUAD_FRAG_IF_DEFS
        + GLSL_COMPLEX + GLSL_LORENTZ_2D + GLSL_DOMAIN_COLORING
        + userUniformsStr + userExpr + TEX_TO_VIEW_COORDS
        + MAIN_FUNC_SIMPLE_OUT
    );
    let program = Quad.makeProgramFromSource(computeUserExprShader);
    let viewDimensions = new Vec2(1.0, gCanvas.height/gCanvas.width);
    let complexAngle = new Complex(gAngle, 0.0);
    let offset = new Vec2(gOffset.x*viewDimensions.x,
                          gOffset.y*viewDimensions.y);
    withDimensions(gCanvas.width, gCanvas.height, () => {
        gDrawQuad.draw(program, {...uniforms,
                                 viewDimensions: viewDimensions,
                                 angle: complexAngle,
                                 offset: offset,
                                 scale: gScale});
        let intVal = Math.pow(2, 
                              Math.round(Math.log(gScale)/Math.log(2.0))
                              )/8.0;
        // console.log('intVal', intVal);
        gGridQuad.draw(GRID_LINES_PROGRAM, {
            viewDimensions: viewDimensions,
            intVal: intVal,
            angle: complexAngle, offset: offset, scale: gScale,
            d: new Vec2(1.0/gCanvas.width, 1.0/gCanvas.height),
        });
        gMainQuad.draw(MAIN_VIEW_PROGRAM,
                       {tex: gDrawQuad, gridTex: gGridQuad});
    });
}
drawCanvas();

function animate() {
    if (gUserStrChanged) {
        drawCanvas();
        gUserStrChanged = false;
    }
    if (gShouldTranslateTime) {
        gOffset.t -= 0.001;
        drawCanvas();
    }
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);


/* let gContext = gCanvas.getContext("2d");

function drawCanvas(exprString) {
    // let lambda00 = Math.cos, lambda01 = e => -Math.sin(e);
    // let lambda10 = Math.sin, lambda11 = Math.cos;
    let lambda00 = Math.cosh, lambda01 = e => Math.sinh(e);
    let lambda10 = Math.sinh, lambda11 = Math.cosh;
    console.log("Drawing canvas.");
    let rectSize = 8;
    gContext.clearRect(0.0, gCanvas.height/2.0,
        gCanvas.width, gCanvas.height/2.0);
    gContext.beginPath();
    gContext.strokeStyle = 'rgba(213, 58, 0, 1)';
    console.log(exprString);
    for (let j = 0; j < gCanvas.width; j++) {
        let t0 = 0.0;
        let x0 = (j - gPixelOrigin.x)*gDistancePerPixel;
        let t = real(lambda00(-gAngle)*t0 + lambda01(-gAngle)*x0);
        let x = real(lambda10(-gAngle)*t0 + lambda11(-gAngle)*x0);
        let pi = real(Math.PI);
        let i = imag(1.0);
        let yVal = eval(`${exprString}`);
        let pixelYVal = gCanvas.height*0.75 - gCanvas.height*yVal.real/5.0;
        // console.log(pixelYVal)
        if (j === 0)
            gContext.moveTo(0, pixelYVal);
        gContext.lineTo(j, pixelYVal);
        gContext.moveTo(j, pixelYVal);
    }
    gContext.stroke();
    gContext.closePath();
    for (let i_ = 0; i_ < gCanvas.height/2; i_ += rectSize) {
        for (let j = 0; j < gCanvas.width; j += rectSize) {
            let t0 = (i_ - gPixelOrigin.y)*gDistancePerPixel;
            let x0 = (j - gPixelOrigin.x)*gDistancePerPixel;
            let t = real(lambda00(-gAngle)*t0 + lambda01(-gAngle)*x0);
            let x = real(lambda10(-gAngle)*t0 + lambda11(-gAngle)*x0);
            let pi = real(Math.PI);
            let i = imag(1.0);
            let val = eval(`${exprString}`);
            if (i_ === 100 && j === 100) {
                console.log(x, t, val);
            }
            let cVal = (typeof(val) === 'number')? real(val): val;
            let col = argToColor(cVal.arg);
            gContext.fillStyle 
                = `rgb(${Math.floor(255.0*(cVal.abs*col.red))}, `
                + `${Math.floor(255.0*(cVal.abs*col.green))}, `
                + `${Math.floor(255.0*(cVal.abs*col.blue))})`;
            gContext.fillRect(j, gCanvas.height/2 - i_, rectSize, rectSize);
        }
    }
}

function animate() {
    if (gUserStrChanged === true) {
        let rpnList = getRPNExprList(gUserStr);
        let testVal = computeExprStr(gUserStr, 
            {x: real(1.0), y: real(1.0), t: real(0.0),
             pi: real(Math.PI), i: imag(1.0)});
        console.log(String(testVal))
        if (String(testVal) !== 'undefined' && !(isNaN(testVal.real)) 
            && testVal !== null) {
            console.log("Test value: ",testVal);
            drawCanvas(turnRPNExpressionToString(rpnList.map(e => e)));
            gAngleExprString = turnRPNExpressionToString(rpnList.map(e => e));
            console.log(gAngleExprString);
        }
        gUserStrChanged = false;
    }
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
*/
// i*exp(-1000.0*t^2) 
// - exp(-1000.0*x^2)+ exp(-1000.0*(x-0.25)^2) 
// + exp(-1000.0*(x+0.25)^2) 
// + exp(-1000.0*(t+0.25)^2)
// + i*exp(-1000.0*(t - 0.25)^2)

// expC(sub(complex(0e+0, 0.0), 
//          mul(complex(1e-1, 0.0), powC(add(sub(complex(0e+0, 0.0), 
// div(t, complex(4e+0, 0.0))), x),
//                                       complex(2e+0, 0.0))
//             )
//         )
//     )