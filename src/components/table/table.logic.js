import axios from 'axios'; 

export default class Table {
    constructor(table, changeFunc, changeActiveFunc) {
        this.tableElement = table;
        this.activeElement = null;
        this.handleSelect = this.handleSelect.bind(this);
        this.iframe = document.createElement("iframe");
        this.error = document.createElement("div");
        this.change = changeFunc;
        this.changeActiveFunc = changeActiveFunc;

        this.error.append("Failed to load the page");
        this.error.className = "error";

        this.init();
    }

    handleSelect(event) {
        if (event.target.nodeName === "TD") {
            if (this.activeElement) {
                this.activeElement.style.backgroundColor = "#fff";
                this.activeElement = null;
            }
            this.changeActiveFunc(
                event.target.dataset.x,
                event.target.dataset.y
            );
            document.getElementById("main-input").focus();
            this.activeElement = event.target;
            event.target.style.backgroundColor = "#f6f6f6";
        }
    }

    handleMouseEnter(e) {
        if (event.target.nodeName === "TD" && event.target.dataset.type === "HYPERLINK") {
            let value = event.target.dataset.value;
            const linkRegExp = /\=HYPERLINK\((.+)\)/;
            const match = linkRegExp.exec(value);
            value = match[1];
            this.iframe.src = value;
            document.body.appendChild(this.iframe);
        }
    }

    checkIframeLoad() {
        console.log(this.iframe.querySelector('body'));
        if (this.iframe.document.body.children.length === 0) {
            document.body.removeChild(this.iframe);
            document.body.appendChild(this.error);
        }
    }

    handleMouseLeave(e) {
        if (event.target.nodeName === "TD" && event.target.dataset.type === "HYPERLINK") {
            console.log('leave');
        }
    }

    init() {
        this.tableElement.addEventListener("click", this.handleSelect);
        this.iframe.onload = (e) => this.checkIframeLoad(e);
        this.tableElement.addEventListener("mouseenter", (e) => this.handleMouseEnter(e), true);
        this.tableElement.addEventListener("mouseleave", (e) => this.handleMouseLeave(e), true);
    }
}
