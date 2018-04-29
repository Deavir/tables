import * as actionTypes from "./actionTypes";
import { tellType } from "../utilities";

export const drawCells = (rows, colls) => ({
    type: actionTypes.DRAW_CELLS,
    colls: colls + 1,
    rows: rows + 1
});

export const switchCurrencyType = (type) => ({
    type: actionTypes.SWITCH_CURRENCY_TYPE,
    currType: type
});

export const changeValue = (x, y, val) => {
    const type = tellType(val);

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

export const switchCurrencyMode = () => ({
    type: actionTypes.SWITCH_CURRENCY_MODE
});

export const switchNumberMode = () => ({
    type: actionTypes.SWITCH_NUMBER_MODE
});
