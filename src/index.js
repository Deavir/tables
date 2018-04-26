import React from "react";
import ReactDOM from "react-dom";
import { combineReducers, createStore } from "redux";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";

import tableReducer from "./store/reducers/table";

const rootReducer = combineReducers({ table: tableReducer });

const store = createStore(
    rootReducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);
