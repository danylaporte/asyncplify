Asyncplify.prototype.expand = function (selector) {
	return new Asyncplify(Expand, selector, this);
};

function Expand(selector, on, source) {
	this.error = null;
	this.items = [];
    this.on = on;
	this.selector = selector;
	this.selectPending = false;
    this.source = null;
	this.state = RUNNING;
	this.value = undefined;

    on.source = this;
    source._subscribe(this);
}

Expand.prototype = {
	callEnd: function () {
		if (this.error || (!this.source && !this.items.length && !this.selectPending)) {
			if (this.error) this.setState(CLOSED);
			this.state === CLOSED;
			this.on.end(this.error);
		}
	},
	do: function () {
		if (this.state !== RUNNING) return;

		this.doSelect();
		this.callEnd();
	},
	doSelect: function () {
		if (!this.selectPending) return;
		var value = this.value;
		
		this.value = undefined;
		this.selectPending = false;
		
		var source = this.selector(value);

		if (source) {
			var item = new ExpandItem(this);
			this.items.push(item);
			source._subscribe(item);
		}
	},
    emit: function (value) {
		this.on.emit(value);
		this.selectPending = true;
		this.value = value;
		
		if (this.state === RUNNING) this.doSelect();
    },
    end: function (err) {
		this.source = null;
		this.error = this.error || err;
		this.callEnd();
	},
    setState: function (state) {
		if (this.state !== state && this.state !== CLOSED) {
			this.state = state;

			if (this.source) this.source.setState(state);

			for (var i = this.items.length - 1; i > -1 && this.state === state; i--) {
				this.items[i].setState(state);
			}

			this.doSelect();
		}
	}
};

function ExpandItem(on) {
	this.on = on;
	this.source = null;
}

ExpandItem.prototype = {
	emit: emitThru,
	end: function (err) {
		removeItem(this.on.items, this);
		this.on.error = this.on.error || err;
		this.on.callEnd();
	},
	setState: setStateThru
};