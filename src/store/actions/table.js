import * as actionTypes from './actionTypes';
import isURL from 'validator/lib/isUrl';

const tellType = val => {
    if(val.includes('=HYPERLINK')){
        let arr = val.split('(');
        val = arr[1]
    }
    if(!isNaN(val)) {
        return 'number';
    }
    if(isURL(val)){
        return 'url'
    }
    return 'string';
}

export const toColumnName = num => {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
        ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;
}

export const toColumnNum = name => {
    var base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', i, j, result = 0;

    for (i = 0, j = name.length - 1; i < name.length; i += 1, j -= 1) {
        result += Math.pow(base.length, j) * (base.indexOf(name[i]) + 1);
    }

    return result;
};

export const drawCells = ( rows, colls ) => ({
    type: actionTypes.DRAW_CELLS,
    colls,
    rows
})
export const changeValue = ( x, y, val ) => {
    const type = tellType(val); 

    if (type === 'url') {
        val = `=HYPERLINK(${val})`;
    }

    console.log(toColumnName(x) + y);

    return {
        type: actionTypes.CHANGE_VALUE,
        valueType: type,
        value: val,
        col: x,
        row: y
    }
}