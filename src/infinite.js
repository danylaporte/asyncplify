Asyncplify.infinite = function () {
    return new Asyncplify(Infinite);
}

function Infinite(_, on) {
	this.on = on;
    this.state = RUNNING;
	
	on.source = this;
	this.do();
}

Infinite.prototype = {
	do: function () {
		while (this.state === RUNNING) {
			this.on.emit();
		}
	},
    setState: function (state) {
		if (this.state !== state && this.state !== CLOSED) {
			this.state = state;
			if (state === RUNNING) this.do();
		}
	}
};