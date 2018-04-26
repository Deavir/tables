import * as actionsTypes from '../actions/actionTypes';
import { toColumnName, toColumnNum } from '../actions/table';

const nameInitialState = {
    cells: [],
    default: {
        rows: 10,
        colls: 10
    },
    types: {
        link: {},
        money: {},
        number: {},
        string: {}
    }
}

const reducer = (state = nameInitialState, action) => {
    switch (action.type) {
        case actionsTypes.DRAW_CELLS:

            const newCells = [...state.cells];

            const collsQuantity = state.cells.length;
            const rowsQuantity = state.cells[0] ? state.cells[0].length : 0;

            let collsToAdd = action.colls - collsQuantity;
            let rowsToAdd = action.rows - rowsQuantity;

            while( collsToAdd > 0 ) {
                newCells.push([]);
                for (let i = 0; i < rowsQuantity; i++) {
                    newCells[newCells.length - 1][i] = {type: i === 0 ? 'th-horizontal' : null, value: '', display: '', x: newCells.length - 1, y: i};
                }
                collsToAdd--;
            }
            while( rowsToAdd > 0 ){
                const rows = newCells[0].length;
                newCells.forEach( (col, index) => {

                    let type = null;
                    if(index === 0) type = 'th-horizontal';
                    if(rows === 0) type = 'th-vertical';

                    col.push({type: type, value: '', display: '', x: toColumnName(rows), y: index});
                });
                rowsToAdd--;
            }

            if( collsToAdd < 0 ) {
                newCells.splice(action.colls, Math.abs(collsToAdd)); 
            }

            if( rowsToAdd < 0 ){
                while( rowsToAdd < 0 ){
                    newCells.forEach(col => {
                        col.pop();
                    })

                    rowsToAdd++;
                }
            }

            return{
                ...state,
                cells: newCells
            }
        case actionsTypes.CHANGE_VALUE:

            let updatedCells = [...state.cells];
            console.log(`'${action.col}' '${action.row}' '${action.value}'`)
            updatedCells[action.row][toColumnNum(action.col)]['value'] = action.value;
            updatedCells[action.row][toColumnNum(action.col)]['type'] = action.valueType;

            return {
                ...state,
                cells: updatedCells
            }
        default:
            return state
    }
}

export default reducer;