Asyncplify.infinite = function () {
    return new Asyncplify(Infinite);
};

function Infinite(_, sink) {
	this.sink = sink;
	this.sink.source = this;

	while (this.sink)
		this.sink.emit();
}

Infinite.prototype.setState = function (state) {
	if (state === Asyncplify.states.CLOSED)
		this.sink = null;
};