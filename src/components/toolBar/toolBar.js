import React, { Component } from 'react';
import classes from './toolBar.scss';
import { connect } from "react-redux";
import { drawCells } from "../../store/actions/table";
import { FaMoney, FaHashtag, FaChain } from "react-icons/lib/fa";

class toolBar extends Component {
    state = {
        rows: 10,
        colls: 10
    };
    draw() {
        this.props.drawTable(this.state.colls, this.state.rows);
    }
    render() {
        return (
            <div className={classes.ToolBar}>
                <div className={classes.Tools}>
                    <button><FaMoney /></button>
                    <button><FaHashtag /></button>
                    <button><FaChain /></button>
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
                    <span>Fx </span><input type="text" placeholder='Value...'/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        table: state.table.cells
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        drawTable: (colls, rows) => {
            dispatch(drawCells(colls, rows));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(toolBar);
