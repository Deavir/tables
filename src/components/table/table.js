import React, { Component } from "react";
import { changeValue, changeActiveElement } from "../../store/actions/table";
import { connect } from "react-redux";
import TableClickHandler from "./table.logic";
import "./table.css";

class Table extends Component {
    constructor(props) {
        super(props);
        this.tableClickHandler = null;
    }

    componentDidMount() {
        this.tableClickHandler = new TableClickHandler(
            this.table,
            this.props.changeValue,
            this.props.changeActiveEl
        );
    }
    render() {
        return (
            <table ref={ref => (this.table = ref)}>
                <tbody>
                    {this.props.table.map((col, index) => (
                        <tr key={col[0].x + index}>
                            {col.map((cell, index) => {
                                if (cell.type === "th-horizontal")
                                    return (
                                        <th key={cell.x + index}>{cell.x}</th>
                                    );
                                if (cell.type === "th-vertical")
                                    return (
                                        <th key={cell.x + index}>
                                            {cell.y !== 0 && cell.y}
                                        </th>
                                    );
                                return (
                                    <td
                                        key={cell.x + index}
                                        data-y={cell.y}
                                        data-type={cell.type.funcType}
                                        data-x={cell.x}
                                        data-value={cell.value}
                                    >
                                        {cell.display}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
        ("");
    }
}

const mapStateToProps = state => {
    return {
        table: state.table.cells
    };
};
const mapDispatchToProps = dispatch => {
    return {
        changeValue: (x, y, value) => {
            dispatch(changeValue(x, y, value));
        },
        changeActiveEl: (x, y) => {
            dispatch(changeActiveElement(x, y));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Table);
