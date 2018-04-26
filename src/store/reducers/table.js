import * as actionsTypes from '../actions/actionTypes';

const nameInitialState = {
    cells: [],
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
                    newCells[newCells.length - 1][i] = {type: null, value: '', display: '', x: newCells.length - 1, y: i};
                }
                collsToAdd--;
            }
            while( rowsToAdd > 0 ){
                const rows = newCells[0].length;
                newCells.forEach( (col, index) => {
                    col.push({type: null, value: '', display: '', x: rows, y: index});
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
            updatedCells[action.row][action.col]['value'] = action.value;

            return {
                ...state,
                cells: updatedCells
            }
        default:
            return state
    }
}

export default reducer;