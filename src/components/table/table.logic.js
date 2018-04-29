

export default class Table {
    constructor(table, changeFunc, changeActiveFunc) {
        this.tableElement = table;
        this.activeElement = null;
        this.handleSelect = this.handleSelect.bind(this);
        this.change = changeFunc;
        this.changeActiveFunc = changeActiveFunc;

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

    init() {
        this.tableElement.addEventListener("click", this.handleSelect);
    }
}
