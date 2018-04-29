import isURL from "validator/lib/isUrl";

//Transforms integer nuber into column Name. Example: 1 => A, 2 => B...
export const toColumnName = num => {
    for (var ret = "", a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
};

//Transforms column Name into integer number. Example: A => 1, B => 2...
export const toColumnNum = name => {
    var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        i,
        j,
        result = 0;

    for (i = 0, j = name.length - 1; i < name.length; i += 1, j -= 1) {
        result += Math.pow(base.length, j) * (base.indexOf(name[i]) + 1);
    }

    return result;
};

//Defines type using value
export const tellType = val => {

    const regExp = /\=([A-Z]+)\((([A-Z]+\d+)\:?)+\).*(?<!\:\))$/;
    const linkRegExp = /\=HYPERLINK\((.+)\)/;

    const match = regExp.exec(val);
    const linkMatch = linkRegExp.exec(val);

    if (linkMatch) return ({
        type: "function",
        funcType: 'HYPERLINK',
        link: linkMatch[1]
    });

    if (match) return ({
        type: "function",
        funcType: match[1]
    });

    if (!isNaN(val)) return ({ 
        type: "number" 
    });

    return ({ 
        type: "string" 
    });
};

//Transforms string like "=FUNCTION(A1:A2)" into object with col and row property.
export const sliceProps = val => {
    const propRegExp = /(([A-Z]+)(\d+))/;
    let props = val.split("(")[1];
    props = props.split("");
    props.pop();
    props = props.join("");
    props = props.split(":");

    return props.map(prop => {
        const propMatch = propRegExp.exec(prop);
        return {
            col: propMatch[2],
            row: propMatch[3]
        };
    });
};

//Transforms numbers into its currency уquivalent string
export const toCurrency = (number, type) => {
    number = number.toFixed(2).replace(/./g, function(c, i, a) {
        return i && c !== "." && (a.length - i) % 3 === 0 ? " " + c : c;
    });
    number = type + number;
    number = number.replace(".", ",");
    return number ? number : 'error';
};

//Values convert currency relatively to hryvna 
export const CURRENCY = {
    "$": 27,
    "€": 30,
    "₴": 1
};