import * as actionTypes from './actionTypes';

export const drawCells = ( rows, colls ) => ({
    type: actionTypes.DRAW_CELLS,
    colls,
    rows
})
export const changeValue = ( x, y, val ) => ({
    type: actionTypes.CHANGE_VALUE,
    value: val,
    col: x,
    row: y
})