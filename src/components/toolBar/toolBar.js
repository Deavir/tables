import React, { Component } from "react";
import classes from "./toolBar.scss";
import { connect } from "react-redux";
import { drawCells, changeValue } from "../../store/actions/table";
import { toColumnNum } from "../../store/actions/table";
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
                e
                    ? e.target.value
                    : this.props.table[this.props.activeElement.row][
                          toColumnNum(this.props.activeElement.col)
                      ].value,
                type
            );
        }
    }
    render() {
        let value = "";
        let typeIsCurrency = false;

        if (this.props.table.length !== 0 && this.props.activeElement.col) {
            typeIsCurrency =
                this.props.table[this.props.activeElement.row][
                    toColumnNum(this.props.activeElement.col)
                ].type.type === "currency";
            value = this.props.table[this.props.activeElement.row][
                toColumnNum(this.props.activeElement.col)
            ].value;
        }
        return (
            <div className={classes.ToolBar}>
                <div className={classes.Tools}>
                    <button
                        className={classes.Money}
                        onClick={() =>
                            this.handleChange(null, {
                                type: "currency",
                                currencyType: this.state.currency
                            })
                        }
                    >
                        <FaMoney />
                    </button>
                    <div className={classes.Select}>
                        <select
                            onChange={e => {
                                if (typeIsCurrency) {
                                    this.handleChange(null, {
                                        type: "currency",
                                        currencyType: e.target.value
                                    });
                                }
                                this.setState({ currency: e.target.value });
                            }}
                        >
                            <option value="$">$</option>
                            <option value="€">€</option>
                            <option value="₴">₴</option>
                        </select>
                    </div>
                    <button
                        onClick={() =>
                            this.handleChange(null, {
                                type: "number"
                            })
                        }
                    >
                        <FaHashtag />
                    </button>
                    <button>
                        <FaChain />
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
                            this.handleChange(
                                e,
                                typeIsCurrency
                                    ? {
                                          type: "currency",
                                          currencyType: this.state.currency
                                      }
                                    : null
                            )
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
        activeElement: state.table.activeCell
    };
};
const mapDispatchToProps = dispatch => {
    return {
        drawTable: (colls, rows) => {
            dispatch(drawCells(colls, rows));
        },
        changeValue: (col, row, val, type) => {
            dispatch(changeValue(col, row, val, type));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(toolBar);
