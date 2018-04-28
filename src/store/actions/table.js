import * as actionTypes from "./actionTypes";
import isURL from "validator/lib/isUrl";

export const CURRENCY = {
    "$": 27,
    "€": 30,
    "₴": 1
};

const tellType = val => {
    const regExp = /\=([A-Z]+)\((([A-Z]+\d+)\:?)+\).*(?<!\:\))$/;
    const match = regExp.exec(val);

    if (match) {
        if (match[1] === "SUM") {
            return {
                type: "function",
                funcType: "SUM"
            };
        }
    }
    if (!isNaN(val)) {
        return { type: "number" };
    }
    return { type: "string" };
};

export const toColumnName = num => {
    for (var ret = "", a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
};

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

export const drawCells = (rows, colls) => ({
    type: actionTypes.DRAW_CELLS,
    colls: colls + 1,
    rows: rows + 1
});

export const changeValue = (x, y, val, type) => {
    if (!type) type = tellType(val);
    if (type) {
        switch (type.currencyType) {
            case "$":
                type.funcValue = val * CURRENCY[type.currencyType];
            case "€":
                type.funcValue = val * CURRENCY[type.currencyType];
            case "₴":
                type.funcValue = val * CURRENCY[type.currencyType];
        }
    }

    return {
        type: actionTypes.CHANGE_VALUE,
        valueType: type,
        value: val,
        col: x,
        row: y
    };
};
export const changeActiveElement = (col, row) => {
    const name = col + row;
    return {
        type: actionTypes.CHANGE_ACTIVE_ELEMENT,
        col,
        row,
        name
    };
};
