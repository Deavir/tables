import React, { Component } from "react";
import { connect } from "react-redux";
import { drawCells } from "./store/actions/table";
import Table from "./components/table/table";
import classes from "./App.scss";

class App extends Component {
    state = {
        rows: 10,
        colls: 10
    };
    componentDidMount() {
        this.props.drawTable(this.state.colls, this.state.rows);
    }
    draw() {
        this.props.drawTable(this.state.colls, this.state.rows);
    }
    render() {
        console.log(this.props.table);
        return (
            <div className={classes.App}>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        this.draw();
                    }}
                >
                    Colls
                    <input
                        value={this.state.colls}
                        onChange={e => {
                            this.setState({ colls: +e.target.value });
                        }}
                    />
                    Rows
                    <input
                        value={this.state.rows}
                        onChange={e => {
                            this.setState({ rows: +e.target.value });
                        }}
                    />
                    <button type="submit">Draw</button>
                </form>
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
        table: state.table.cells
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
