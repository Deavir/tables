import React from "react";
import ReactDOM from "react-dom";

import { 
    combineReducers, 
    createStore,
    applyMiddleware 
} from "redux";

import thunk from "redux-thunk";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App";

import tableReducer from "./store/reducers/table";

const rootReducer = combineReducers({ table: tableReducer });
const store = createStore(rootReducer);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);
