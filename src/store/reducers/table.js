import * as actionsTypes from "../actions/actionTypes";
import { toColumnName, toColumnNum, CURRENCY } from "../actions/table";
import isURL from "validator/lib/isUrl";

const nameInitialState = {
    cells: [],
    activeCell: {
        col: null,
        row: null,
        name: "Cell"
    },
    currentCurrency: "$",
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

    let updatedCells = [];

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
            updatedCells = [...state.cells];
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

                const propCell = updatedCells[props[0].row][toColumnNum(props[0].col)];

                const type = propCell.funcValueType ?
                propCell.funcValueType :
                propCell.type.type;

                return props.every( prop => { 
                    const propToCheck = updatedCells[prop.row][toColumnNum(prop.col)];
                    return (propToCheck.type.type === type || propToCheck.funcValueType === type) && !propToCheck.error
                });
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
                let display = updatedCells[row][col].value;

                // SUM
                if (funcType === "SUM") {

                    const props = sliceProps(updatedCells[row][col].value);
                    let sum = 0;
                    props.forEach(prop => {
                        const val = +takeValue(prop.row, prop.col);
                        addRef(prop.row, prop.col, row, col);
                        sum += val;
                    });

                    updatedCells[row][col].funcValueType = 'number';
                    putProp(row, col, "funcValue", sum);

                    if(updatedCells[props[0].row][toColumnNum(props[0].col)].type.type === 'currency' || updatedCells[props[0].row][toColumnNum(props[0].col)].funcValueType === 'currency'){

                        const primaryCurrType = updatedCells[row][col].type.currencyType;

                        updatedCells[row][col].funcValueType = "currency";
                        updatedCells[row][col].type.currencyType = primaryCurrType ? updatedCells[row][col].type.currencyType : "₴";

                        const currType = updatedCells[row][col].type.currencyType;

                        const quantity = sum / CURRENCY[currType];
                        sum = toCurrency(quantity, currType);
                    }

                    display = sum;
                    putProp(row, col, "display", sum);
                    updatedCells[row][col].error = false;
                    if(!checkSameTypes(props)) {
                        putProp(row, col, "display", "*error*");
                        display = "*error*";
                        updatedCells[row][col].error = true;
                    };
                    checkRefs(row, col);
                }

                //AVERAGE
                if (funcType === "AVERAGE") {

                    const props = sliceProps(updatedCells[row][col].value);
                    let sum = 0;
                    props.forEach(prop => {
                        const val = +takeValue(prop.row, prop.col);
                        addRef(prop.row, prop.col, row, col);
                        sum += val;
                    });

                    sum = sum / props.length;

                    updatedCells[row][col].funcValueType = 'number';
                    putProp(row, col, "funcValue", sum);

                    if(updatedCells[props[0].row][toColumnNum(props[0].col)].type.type === 'currency' || updatedCells[props[0].row][toColumnNum(props[0].col)].funcValueType === 'currency'){

                        const primaryCurrType = updatedCells[row][col].type.currencyType;

                        updatedCells[row][col].funcValueType = "currency";
                        updatedCells[row][col].type.currencyType = primaryCurrType ? updatedCells[row][col].type.currencyType : "₴";

                        const currType = updatedCells[row][col].type.currencyType;

                        const quantity = sum / CURRENCY[currType];
                        sum = toCurrency(quantity, currType);
                    }

                    display = sum;
                    putProp(row, col, "display", sum);
                    updatedCells[row][col].error = false;
                    if(!checkSameTypes(props)) {
                        putProp(row, col, "display", "*error*");
                        display = "*error*";
                        updatedCells[row][col].error = true;
                    };
                    checkRefs(row, col);
                }

                //CONCAT
                if (funcType === "CONCAT") {

                    const props = sliceProps(updatedCells[row][col].value);
                    let sum = "";

                    props.forEach(prop => {
                        const col = toColumnNum(prop.col)
                        const val = String(updatedCells[prop.row][col].display);
                        addRef(prop.row, prop.col, row, col);
                        sum += val;
                    });

                    updatedCells[row][col].funcValueType = "string";
                    putProp(row, col, "funcValue", sum);

                    display = sum;
                    putProp(row, col, "display", sum);
                    checkRefs(row, col);
                }

                //HYPERLINK
                if (funcType === "HYPERLINK") {

                    const cell = updatedCells[row][col];

                    if(!cell.value.includes("=HYPERLINK")){
                        action.value = `=HYPERLINK(${updatedCells[row][col].value})`;
                        console.log(updatedCells[row][col].value);
                    }
                    if(isURL(cell.type.link)){
                        display = `link(${cell.type.link})`;
                    } else {
                        display = "link is not valid"
                    }
                }
                return display;
            };

            let display = action.value;

            if (action.valueType.type === "function") {

                if(action.valueType.link) updatedCells[action.row][action.col].type.link = action.valueType.link;
                updatedCells[action.row][action.col].value = action.value;
                updatedCells[action.row][action.col].type.funcType =
                    action.valueType.funcType;
                display = checkCell(action.row, action.col);
            } else {
                updatedCells[action.row][action.col].type.type === "currency"
                    ? false
                    : (updatedCells[action.row][action.col][
                          "funcValue"
                      ] = null);
            }

            if(action.valueType.type === "number"){
                if (updatedCells[action.row][action.col].type.type === 'currency') {
                    action.valueType.type = "currency";
                }
            }

            if (action.valueType.type === "currency") {
                const val = action.valueType.funcValue ? 
                    action.valueType.funcType :
                    action.value * CURRENCY[updatedCells[action.row][action.col].type.currencyType];

                const quantity =
                    +val /
                    CURRENCY[updatedCells[action.row][action.col].type.currencyType];
                const type = updatedCells[action.row][action.col].type.currencyType;
                const funcVal = +val;

                putProp(
                    action.row,
                    action.col,
                    "funcValue",
                    funcVal
                );

                if (!quantity) display = "";
                else display = toCurrency(quantity, type);
            }


            updatedCells[action.row][action.col]["value"] = action.value;
            updatedCells[action.row][action.col]["type"].type = action.valueType.type;
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
        case actionsTypes.SWITCH_CURRENCY_MODE:

            const row = state.activeCell.row;
            const col = toColumnNum(state.activeCell.col);
            updatedCells = [...state.cells];

            const activeCell = updatedCells[row][col];



            if (activeCell.type.type === 'number') {

                const isEmpty = !(activeCell.value);

                activeCell.type.type = 'currency';
                activeCell.type.currencyType = state.currentCurrency;
                activeCell.funcValue = activeCell.value * CURRENCY[state.currentCurrency]; 

                activeCell.display = isEmpty ? '' : toCurrency(+activeCell.value, activeCell.type.currencyType);
            }


            if (activeCell.type.type === 'function' && activeCell.funcValueType === 'number') {

                activeCell.funcValueType = 'currency';
                activeCell.type.currencyType = state.currentCurrency;
                activeCell.funcValue = +activeCell.funcValue * CURRENCY[activeCell.type.currencyType];

                activeCell.display = toCurrency(+activeCell.funcValue, activeCell.type.currencyType);
            }

            updatedCells[row][col] = activeCell;

            return {
                ...state,
                cells: updatedCells
            }
        case actionsTypes.SWITCH_NUMBER_MODE:
            const numRow = state.activeCell.row;
            const numCol = toColumnNum(state.activeCell.col);
            updatedCells = [...state.cells];

            const activeNumCell = updatedCells[numRow][numCol];

            console.log(activeNumCell);

            if (activeNumCell.type.type === "currency") {

                activeNumCell.type = { type: "number" }
                activeNumCell.funcValue = null
            }

            updatedCells[numRow][numCol] = activeNumCell;

            return {
                ...state,
                cells: updatedCells
            }

        case actionsTypes.SWITCH_CURRENCY_TYPE:
            updatedCells = [...state.cells];
            const cellRow = state.activeCell.row;
            const cellCol = toColumnNum(state.activeCell.col);
            const cell = updatedCells[cellRow][cellCol];

            updatedCells[cellRow][cellCol].funcValue = cell.value * CURRENCY[action.currType];

            const value = cell.funcValue ? 
                +cell.funcValue / CURRENCY[action.currType] :
            cell.value;

            if( updatedCells[cellRow][cellCol].type.type === "function" ) {
                updatedCells[cellRow][cellCol].funcValueType = "currency";
            } else {
                updatedCells[cellRow][cellCol].type.type = "currency";
            }

            updatedCells[cellRow][cellCol].type.currencyType = action.currType;
            updatedCells[cellRow][cellCol].display = toCurrency(+value, action.currType);

            return {
                ...state,
                currentCurrrency: action.currType,
                cells: updatedCells
            }
        default:
            return state;
    }
};

export default reducer;
