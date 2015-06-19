Asyncplify.infinite = function () {
    return new Asyncplify(Infinite);
};

function Infinite(_, on) {
	this.on = on;
    this.state = RUNNING;
	
	on.source = this;
	this.do();
}

Infinite.prototype = {
	do: function () {
		try {
			this.doEmit();
		} catch (ex) {
			this.doEnd(ex);
		}
	},
	doEmit: function () {
		while (this.state === RUNNING) {
			this.on.emit();
		}
	},
	doEnd: function (error) {
		if (this.state === RUNNING) {
			this.state = CLOSED;
			this.on.end(error);
		}
	},
    setState: function (state) {
		if (this.state !== state && this.state !== CLOSED) {
			this.state = state;
			if (state === RUNNING) this.do();
		}
	}
};