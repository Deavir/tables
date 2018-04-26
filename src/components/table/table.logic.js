export default class Table {
	constructor(table, changeFunc) {
		this.tableElement = table;
		this.inputIsActive = false;
		this.inputElement = document.createElement('input');
		this.activeElement = null;
		this.handleDblClick = this.handleDblClick.bind(this);
		this.enterSubmit = this.enterSubmit.bind(this);
		this.handleSelect = this.handleSelect.bind(this);
		this.change = changeFunc;

		this.inputElement.classList.add('cell-input');

		this.init();
	}

	enterSubmit (event) {
		if (event.key === 'Enter') {
			console.log('enter');
			this.removeInput();
		}
	}

	handleDblClick(event) {

		if (event.target.nodeName === 'TD') {
			
			this.inputIsActive = true;
			this.activeElement = event.target;

			const coords = this.getCoords(event.target);

			document.body.appendChild(this.inputElement);

			this.inputElement.value = event.target.dataset.value;

			this.inputElement.style.top = coords.top + 'px';
			this.inputElement.style.left = coords.left + 'px';

			// +1 px for table css fix
			this.inputElement.style.height = event.target.offsetHeight + 1 + 'px';
			this.inputElement.style.width = event.target.offsetWidth + 1 + 'px';

			this.inputElement.focus();

		}
	}

	removeInput(){
		console.log(this.inputElement);
		this.change(this.activeElement.dataset.x, this.activeElement.dataset.y, this.inputElement.value);
		document.body.removeChild(this.inputElement);
		this.inputIsActive = false;
	}

	handleSelect(event){

		if (event.target.nodeName === 'TD') {

			if (this.inputIsActive) {
				this.removeInput();
			};
			if (this.activeElement) {
				this.activeElement.style.backgroundColor = '#fff';
				this.activeElement = null;
			};
			this.activeElement = event.target;
			event.target.style.backgroundColor = '#f6f6f6';

		}
	}

	getCoords(elem) {
		let box = elem.getBoundingClientRect();

		let body = document.body;
		let docEl = document.documentElement;

		let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
		let scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

		let clientTop = docEl.clientTop || body.clientTop || 0;
		let clientLeft = docEl.clientLeft || body.clientLeft || 0;

		let top = box.top + scrollTop - clientTop;
		let left = box.left + scrollLeft - clientLeft;

		return {
			top: top,
			left: left
		};
	}
	
	init() {
		this.tableElement.addEventListener('dblclick', this.handleDblClick);
		this.inputElement.addEventListener('keyup', this.enterSubmit);
		this.tableElement.addEventListener('click', this.handleSelect);
	}
}