import React, { Component } from "react";
import classes from "./toolBar.scss";
import { connect } from "react-redux";
import { drawCells, changeValue, switchCurrencyMode, switchCurrencyType, switchNumberMode } from "../../store/actions/table";
import { toColumnNum, toColumnName } from "../../store/actions/table";
import { FaMoney, FaHashtag, FaChain } from "react-icons/lib/fa";

class toolBar extends Component {
    state = {
        rows: 10,
        colls: 10,
        currency: "$"
    };
    draw() {
        this.props.drawTable(this.state.colls, this.state.rows);
    }
    handleChange(e, type) {
        if (this.props.activeElement.name !== "Cell") {
            this.props.changeValue(
                this.props.activeElement.col,
                this.props.activeElement.row,
                e.target.value
            );
        }
    }
    render() {
        
        let value = "";
        let selectValue = this.props.curr;
        let buttonActive = false;
        let numberButtonActive = false;
        let selectDisabled = true;
        let actCol = null;
        let actRow = null;

        if(this.props.activeElement.col){
            actCol = toColumnNum(this.props.activeElement.col);
            actRow = this.props.activeElement.row;
            const activeCell = this.props.table[actRow][actCol];
            value = activeCell.value;

            if (activeCell.type.type === 'currency') {
                numberButtonActive = true;
                selectValue = activeCell.type.currencyType;
                selectDisabled = false;
            }
            if (activeCell.type.type === 'function') {
                if (activeCell.type.funcType === 'SUM' || activeCell.type.funcType === 'AVERAGE') {
                    selectValue = activeCell.type.currencyType;
                    selectDisabled = false;
                }
            }
            if (activeCell.type.type === 'number') {
                buttonActive = true;
            }
        }
        return (
            <div className={classes.ToolBar}>
                <div className={classes.Tools}>
                    <button
                        className={classes.Money}
                        disabled={!buttonActive}
                        onClick={() =>
                            this.props.switchCurrencyMode(this.props.activeElement.col, actRow, value)
                        }
                    >
                        <FaMoney />
                    </button>
                    <div className={classes.Select}>
                        <select
                            onChange={e => {
                                this.props.switchCurrencyType(this.props.activeElement.col, actRow, value, e.target.value);
                            }}
                            value={ selectValue }
                            disabled = { selectDisabled }
                        >
                            <option value="$">$</option>
                            <option value="€">€</option>
                            <option value="₴">₴</option>
                        </select>
                    </div>
                    <button
                        disabled={!numberButtonActive}
                        onClick={() => {
                            this.props.switchNumberMode(this.props.activeElement.col, actRow, value)
                        }}
                    >
                        <FaHashtag />
                    </button>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            this.draw();
                        }}
                    >
                        Colls:
                        <input
                            value={this.state.colls}
                            onChange={e => {
                                this.setState({ colls: +e.target.value });
                            }}
                        />
                        Rows:
                        <input
                            value={this.state.rows}
                            onChange={e => {
                                this.setState({ rows: +e.target.value });
                            }}
                        />
                        <button type="submit">Update</button>
                    </form>
                </div>
                <div className={classes.Value}>
                    <span>{this.props.activeElement.name}</span>
                    <input
                        type="text"
                        id="main-input"
                        value={value}
                        onChange={e =>
                            this.handleChange(e)
                        }
                        placeholder={
                            this.props.activeElement.name === "Cell"
                                ? "Choose cell..."
                                : "Value..."
                        }
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        table: state.table.cells,
        activeElement: state.table.activeCell,
        curr: state.table.currentCurrency
    };
};
const mapDispatchToProps = dispatch => {
    return {
        drawTable: (colls, rows) => {
            dispatch(drawCells(colls, rows));
        },
        changeValue: (col, row, val) => {
            dispatch(changeValue(col, row, val));
        },
        switchCurrencyMode: (col, row, val) => {
            dispatch(switchCurrencyMode());
            dispatch(changeValue(col, row, val));
        },
        switchNumberMode: (col, row, val) => {
            dispatch(switchNumberMode());
            dispatch(changeValue(col, row, val));
        },
        switchCurrencyType: (col, row, val, type) => {
            dispatch(switchCurrencyType(type));
            dispatch(changeValue(col, row, val));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(toolBar);
