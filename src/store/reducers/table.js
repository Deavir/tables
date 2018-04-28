import * as actionsTypes from "../actions/actionTypes";
import { toColumnName, toColumnNum, CURRENCY } from "../actions/table";

const nameInitialState = {
    cells: [],
    activeCell: {
        col: null,
        row: null,
        name: "Cell"
    },
    default: {
        rows: 10,
        colls: 10
    }
};

const sliceProps = val => {
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

const toCurrency = (number, type) => {
    number = number.toFixed(2).replace(/./g, function(c, i, a) {
        return i && c !== "." && (a.length - i) % 3 === 0 ? " " + c : c;
    });
    number = type + number;
    number = number.replace(".", ",");
    return number ? number : 'error';
};

const reducer = (state = nameInitialState, action) => {
    switch (action.type) {
        case actionsTypes.DRAW_CELLS:
            const newCells = [...state.cells];

            const collsQuantity = state.cells.length;
            const rowsQuantity = state.cells[0] ? state.cells[0].length : 0;

            let collsToAdd = action.colls - collsQuantity;
            let rowsToAdd = action.rows - rowsQuantity;

            while (collsToAdd > 0) {
                newCells.push([]);
                for (let i = 0; i < rowsQuantity; i++) {
                    newCells[newCells.length - 1][i] = {
                        type: i === 0 ? "th-horizontal" : { type: null },
                        value: "",
                        ref: [],
                        display: "",
                        x: newCells.length - 1,
                        y: i
                    };
                }
                collsToAdd--;
            }
            while (rowsToAdd > 0) {
                const rows = newCells[0].length;
                newCells.forEach((col, index) => {
                    let type = { type: null };
                    if (index === 0) type = "th-horizontal";
                    if (rows === 0) type = "th-vertical";

                    col.push({
                        type: type,
                        ref: [],
                        value: "",
                        display: "",
                        x: toColumnName(rows),
                        y: index
                    });
                });
                rowsToAdd--;
            }

            if (collsToAdd < 0) {
                newCells.splice(action.colls, Math.abs(collsToAdd));
            }

            if (rowsToAdd < 0) {
                while (rowsToAdd < 0) {
                    newCells.forEach(col => {
                        col.pop();
                    });

                    rowsToAdd++;
                }
            }

            return {
                ...state,
                cells: newCells
            };

        case actionsTypes.CHANGE_VALUE:
            let updatedCells = [...state.cells];
            action.col = toColumnNum(action.col);

            const takeValue = (row, col) => {
                return updatedCells[row][toColumnNum(col)].funcValue
                    ? updatedCells[row][toColumnNum(col)].funcValue
                    : updatedCells[row][toColumnNum(col)].value;
            };

            const putProp = (row, col, propName, propValue) => {
                updatedCells[row][col][propName] = propValue;
            };

            const addRef = (toRow, toCol, addRow, addCol) => {
                updatedCells[toRow][toColumnNum(toCol)].ref = updatedCells[
                    toRow
                ][toColumnNum(toCol)].ref.filter(item => {
                    const newRef = {
                        row: addRow,
                        col: addCol
                    };
                    if (item === newRef) false;
                    else true;
                });
                updatedCells[toRow][toColumnNum(toCol)].ref.push({
                    row: addRow,
                    col: addCol
                });
            };

            const checkSameTypes = props => {

                const type = updatedCells[props[0].row][toColumnNum(props[0].col)].funcValueType ?
                updatedCells[props[0].row][toColumnNum(props[0].col)].funcValueType :
                updatedCells[props[0].row][toColumnNum(props[0].col)].type.type;

                return props.every( prop => { return updatedCells[prop.row][toColumnNum(prop.col)].type.type === type || 
                updatedCells[prop.row][toColumnNum(prop.col)].funcValueType === type});
            }

            const checkRefs = (row, col) => {
                const refArr = updatedCells[row][col].ref;
                if (refArr.length > 0) {
                    refArr.forEach(ref => {
                        checkCell(ref.row, ref.col);
                    });
                }
            };

            const checkCell = (row, col) => {
                const funcType = updatedCells[row][col].type.funcType;
                const props = sliceProps(updatedCells[row][col].value);
                let display = updatedCells[row][col].value;

                if (funcType == "SUM") {
                    let sum = 0;
                    props.forEach(prop => {
                        const val = +takeValue(prop.row, prop.col);
                        addRef(prop.row, prop.col, row, col);
                        sum += val;
                    });

                    updatedCells[row][col].funcValueType = 'number';
                    putProp(row, col, "funcValue", sum);

                    if(updatedCells[props[0].row][toColumnNum(props[0].col)].type.type === 'currency' || updatedCells[props[0].row][toColumnNum(props[0].col)].funcValueType === 'currency'){
                        updatedCells[row][col].funcValueType = 'currency';
                        const quantity = sum / CURRENCY["₴"];
                        sum = toCurrency(quantity, "₴");
                    }

                    display = sum;
                    putProp(row, col, "display", sum);
                    if(!checkSameTypes(props)) {
                        putProp(row, col, "display", 'error: different types');
                    };
                    checkRefs(row, col);
                }
                return display;
            };

            let display = action.value;

            if (action.valueType.type === "function") {
                updatedCells[action.row][action.col].value = action.value;
                updatedCells[action.row][action.col].type.funcType =
                    action.valueType.funcType;
                display = checkCell(action.row, action.col);
            } else {
                updatedCells[action.row][action.col] === "currency"
                    ? false
                    : (updatedCells[action.row][action.col][
                          "funcValue"
                      ] = null);
            }

            if (action.valueType.type === "currency") {
                const quantity =
                    +action.valueType.funcValue /
                    CURRENCY[action.valueType.currencyType];
                const type = action.valueType.currencyType;

                putProp(
                    action.row,
                    action.col,
                    "funcValue",
                    action.valueType.funcValue
                );

                if (!quantity) display = "error";
                else display = toCurrency(quantity, type);
            }

            updatedCells[action.row][action.col]["value"] = action.value;
            updatedCells[action.row][action.col]["type"] = action.valueType;
            updatedCells[action.row][action.col]["display"] = display;

            checkRefs(action.row, action.col);

            return {
                ...state,
                cells: updatedCells
            };
        case actionsTypes.CHANGE_ACTIVE_ELEMENT:
            return {
                ...state,
                activeCell: {
                    row: action.row,
                    col: action.col,
                    name: action.name
                }
            };
        default:
            return state;
    }
};

export default reducer;
