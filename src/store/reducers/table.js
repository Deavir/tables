import * as actionsTypes from "../actions/actionTypes";
import { toColumnName, toColumnNum, CURRENCY, sliceProps, toCurrency } from "../utilities";
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

const drawCells = (state, action) => {

    const newCells = [...state.cells];

    const collsQuantity = state.cells.length;
    const rowsQuantity = state.cells[0] ? state.cells[0].length : 0;

    let collsToAdd = action.colls - collsQuantity;
    let rowsToAdd = action.rows - rowsQuantity;

    const emptyObj = {
        value: "",
        ref: [],
        display: ""
    }

    while (collsToAdd > 0) {
        newCells.push([]);
        for (let index = 0; index < rowsQuantity; index++) {

            let type = { type: "empty" };
            if (index === 0) type = "th-horizontal";

            newCells[newCells.length - 1][index] = {
                type, ...emptyObj,
                x: newCells.length - 1,
                y: index                  
            };
        }
        collsToAdd--;
    }

    while (rowsToAdd > 0) {
        const rows = newCells[0].length;
        newCells.forEach((col, index) => {

            let type = { type: "empty" };
            if (index === 0) type = "th-horizontal";
            if (rows === 0) type = "th-vertical";

            col.push({
                type, ...emptyObj,
                x: toColumnName(rows),
                y: index
            });

        });
        rowsToAdd--;
    }

    if (rowsToAdd < 0) {
        while (rowsToAdd < 0) {
            newCells.forEach(col => {col.pop()});
            rowsToAdd++;
        }
    }

    if (collsToAdd < 0) {
        newCells.splice(action.colls, Math.abs(collsToAdd));
    }

    return {
        ...state,
        cells: newCells
    };
}
const changeValue = (state, action) => {

    const newCells = [...state.cells];
    action.col = toColumnNum(action.col);

    const takeValue = (row, col) => {
        return newCells[row][toColumnNum(col)].funcValue
            ? newCells[row][toColumnNum(col)].funcValue
            : newCells[row][toColumnNum(col)].value;
    };

    const putProp = (row, col, propName, propValue) => {
        newCells[row][col][propName] = propValue;
    };

    const addRef = (toRow, toCol, addRow, addCol) => {

        toCol = toColumnNum(toCol);

        //prevents function from adding same refs several times
        const cell = newCells[toRow][toCol];
        const filteredRef = cell.ref.filter(item => {
            const newRef = {
                row: addRow,
                col: addCol
            };
            if (item === newRef) false;
            else true;
        });

        newCells[toRow][toCol].ref = filteredRef;
        newCells[toRow][toCol].ref.push({
            row: addRow,
            col: addCol
        });
    };

    const checkSameTypes = props => {

        const row = props[0].row;
        const col = toColumnNum(props[0].col);

        const propCell = newCells[row][col];

        const type = propCell.funcValueType ?
        propCell.funcValueType :
        propCell.type.type;

        return props.every( prop => { 

            const row = prop.row
            const col = toColumnNum(prop.col)

            const propToCheck = newCells[row][col],
                typeIsEqual = propToCheck.type.type === type,
                funcTypeIsEqual = propToCheck.funcValueType === type,
                propIsEmpty = propToCheck.type.type === "empty",
                propsHasError = propToCheck.error;

            return ((typeIsEqual || funcTypeIsEqual) && !propsHasError && !propIsEmpty)
        });
    }

    const checkRefs = (row, col) => {
        const refArr = newCells[row][col].ref;
        if (refArr.length > 0) {
            refArr.forEach(ref => {
                checkCell(ref.row, ref.col);
            });
        }
    };

    const checkCell = (row, col) => {

        let display = newCells[row][col].value;
        const funcType = newCells[row][col].type.funcType;

        //SUM function

        const SUM = () => {

            const props = sliceProps(newCells[row][col].value);

            let sum = props.reduce((sum, prop) => {
                addRef(prop.row, prop.col, row, col);
                return sum + +takeValue(prop.row, prop.col);
            }, 0);

            putProp(row, col, "funcValueType", "number");
            putProp(row, col, "funcValue", sum);



            const firstPropCell = newCells[props[0].row][toColumnNum(props[0].col)];
            const typeIsCurrency = firstPropCell.type.type === "currency";
            const funcValueTypeIsCurrency = firstPropCell.funcValueType === "currency";

            if ( typeIsCurrency || funcValueTypeIsCurrency ) {

                putProp(row, col, "funcValueType", "currency");

                const primaryCurrType = newCells[row][col].type.currencyType;
                if ( !primaryCurrType ) newCells[row][col].type.currencyType = "₴";

                const currType = newCells[row][col].type.currencyType;
                const convertedMoney = sum / CURRENCY[currType];
                sum = toCurrency(convertedMoney, currType);
            }



            display = sum;
            putProp(row, col, "display", display);
            putProp(row, col, "error", false);

            if(!checkSameTypes(props)) {

                display = "*error*";
                putProp(row, col, "display", display);
                putProp(row, col, "error", true);
            };

            checkRefs(row, col);
        }

        //AVERAGE function

        const AVERAGE = () => {

            const props = sliceProps(newCells[row][col].value);

            let sum = props.reduce((sum, prop) => {
                addRef(prop.row, prop.col, row, col);
                return sum + +takeValue(prop.row, prop.col);
            }, 0);

            sum = sum / props.length;

            putProp(row, col, "funcValueType", "number");
            putProp(row, col, "funcValue", sum);



            const firstPropCell = newCells[props[0].row][toColumnNum(props[0].col)];
            const typeIsCurrency = firstPropCell.type.type === "currency";
            const funcValueTypeIsCurrency = firstPropCell.funcValueType === "currency";

            if ( typeIsCurrency || funcValueTypeIsCurrency ) {

                putProp(row, col, "funcValueType", "currency");

                const primaryCurrType = newCells[row][col].type.currencyType;
                if ( !primaryCurrType ) newCells[row][col].type.currencyType = "₴";

                const currType = newCells[row][col].type.currencyType;
                const convertedMoney = sum / CURRENCY[currType];
                sum = toCurrency(convertedMoney, currType);
            }



            display = sum;
            putProp(row, col, "display", display);
            putProp(row, col, "error", false);

            if(!checkSameTypes(props)) {
                
                display = "*error*";
                putProp(row, col, "display", display);
                putProp(row, col, "error", true);
            };

            checkRefs(row, col);
        }

        //CONCAT function
        
        const CONCAT = () => {

            const props = sliceProps(newCells[row][col].value);
            let sum = props.reduce((sum, prop) => {

                addRef(prop.row, prop.col, row, col);
                const cell = newCells[prop.row][toColumnNum(prop.col)];
                const string = String(cell.display);
                return sum + string;

            }, "");

            putProp(row, col, "funcValueType", "string");
            putProp(row, col, "funcValue", sum);

            display = sum;
            putProp(row, col, "display", sum);
            checkRefs(row, col);

        }

        //HYPERLINK function

        const HYPERLINK = () => {

            const cell = newCells[row][col];
            const linkIsURL = isURL(cell.type.link);

            if (linkIsURL) display = `link(${cell.type.link})`;
            else display = "link is not valid";
        }



        if (funcType === "SUM") {
            SUM();
        }

        if (funcType === "AVERAGE") {
            AVERAGE();
        }

        if (funcType === "CONCAT") {
            CONCAT();
        }

        if (funcType === "HYPERLINK") {
            HYPERLINK();
        }
        return display;
    };

    const cell = newCells[action.row][action.col];
    const cellTypeIsCurrency = cell.type.type === "currency";
    let type = action.valueType.type;
    let display = action.value;

    if (type === "function") {

        const value = action.value;
        const funcType = action.valueType.funcType;
        const link = action.valueType.link;

        if (link) newCells[action.row][action.col].type.link = link;

        newCells[action.row][action.col].value = value;
        newCells[action.row][action.col].type.funcType = funcType;

        display = checkCell(action.row, action.col);

    } else { if (!cellTypeIsCurrency) putProp(action.row, action.col, "funcValue", null); }



    if (type === "number" && cellTypeIsCurrency) type = "currency";

    if (type === "currency") {

        const typeObj = action.valueType;
        const currency = cell.type.currencyType;

        let val = typeObj.funcType;
        if (!typeObj.funcValue)
            val = action.value * CURRENCY[currency];

        const convertedMoney = +val / CURRENCY[currency];
        const currencyType = currency;

        putProp(action.row, action.col, "funcValue", +val);

        if (convertedMoney) display = toCurrency(convertedMoney, currencyType);
        else display = "";
    }


    newCells[action.row][action.col]["value"] = action.value;
    newCells[action.row][action.col]["type"].type = type;
    newCells[action.row][action.col]["display"] = display;

    checkRefs(action.row, action.col);

    return {
        ...state,
        cells: newCells
    };
}
const changeActiveElement = (state, action) => {
    return {
        ...state,
        activeCell: {
            row: action.row,
            col: action.col,
            name: action.name
        }
    };
}
const switchCurrencyMode = (state, action) => {

    const row = state.activeCell.row;
    const col = toColumnNum(state.activeCell.col);
    const newCells = [...state.cells];
    const activeCell = newCells[row][col];
    const currentCurrency = state.currentCurrency;
    const activeCellCurrency = activeCell.type.currencyType;


    if (activeCell.type.type === 'number') {
        const isEmpty = !(activeCell.value);

        activeCell.type.type = 'currency';
        activeCell.type.currencyType = currentCurrency;
        activeCell.funcValue = activeCell.value * CURRENCY[currentCurrency]; 
        activeCell.display = isEmpty ? '' : toCurrency(+activeCell.value, activeCellCurrency);
    }

    if (activeCell.type.type === 'function' && activeCell.funcValueType === 'number') {

        activeCell.funcValueType = 'currency';
        activeCell.type.currencyType = currentCurrency;
        activeCell.funcValue = +activeCell.funcValue * CURRENCY[activeCellCurrency];
        activeCell.display = toCurrency(+activeCell.funcValue, activeCellCurrency);
    }

    newCells[row][col] = activeCell;

    return {
        ...state,
        cells: newCells
    }
}
const switchNumberMode = (state, action) => {

    const row = state.activeCell.row;
    const col = toColumnNum(state.activeCell.col);
    const newCells = [...state.cells];
    const activeNumCell = newCells[row][col];

    if (activeNumCell.type.type === "currency") {

        activeNumCell.type = { type: "number" }
        activeNumCell.funcValue = null
    }

    newCells[row][col] = activeNumCell;

    return {
        ...state,
        cells: newCells
    }
}
const switchCurrencyType = (state, action) => {

    const newCells = [...state.cells];
    const row = state.activeCell.row;
    const col = toColumnNum(state.activeCell.col);
    const cell = newCells[row][col];

    newCells[row][col].funcValue = cell.value * CURRENCY[action.currType];

    if( cell.type.type === "function" ) {
        newCells[row][col].funcValueType = "currency";
    } else {
        newCells[row][col].type.type = "currency";
    }

    const convertedMoney = +cell.funcValue / CURRENCY[action.currType];
    newCells[row][col].type.currencyType = action.currType;
    newCells[row][col].display = toCurrency(+convertedMoney, action.currType);

    return {
        ...state,
        currentCurrrency: action.currType,
        cells: newCells
    }
}

const reducer = (state = nameInitialState, action) => {
    switch (action.type) {
        case actionsTypes.DRAW_CELLS: return drawCells(state, action);
        case actionsTypes.CHANGE_VALUE: return changeValue(state, action);
        case actionsTypes.CHANGE_ACTIVE_ELEMENT: return changeActiveElement(state, action);
        case actionsTypes.SWITCH_CURRENCY_MODE: return switchCurrencyMode(state, action);
        case actionsTypes.SWITCH_NUMBER_MODE: return switchNumberMode(state, action);
        case actionsTypes.SWITCH_CURRENCY_TYPE: return switchCurrencyType(state, action);
        default: return state;
    }
};

export default reducer;
