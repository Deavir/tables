import React, { Component } from "react";
import { connect } from "react-redux";
import { drawCells } from "./store/actions/table";
import Table from "./components/table/table";
import ToolBar from "./components/toolBar/toolBar";
import classes from "./App.scss";

class App extends Component {

    componentDidMount() {
        this.props.drawTable(this.props.colls, this.props.rows);
    }

    render() {
        return (
            <div className={classes.App}>
                <ToolBar />
                <Table />
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        drawTable: (colls, rows) => {
            dispatch(drawCells(colls, rows));
        }
    };
};
const mapStateToProps = state => {
    return {
        table: state.table.cells,
        colls: state.table.default.colls,
        rows: state.table.default.rows,
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
