Asyncplify.concat = function (sources) {
	return new Asyncplify(Concat, sources);
};

Asyncplify.prototype.concat = function (sources) {
	return new Asyncplify(Concat, [this].concat(sources));
};

function Concat(sources, sink) {
	this.isSubscribing = false;
	this.sink = sink;
	this.sink.source = this;
	this.source = null;
	this.sources = (sources || []).concat();
	this.state = Asyncplify.states.RUNNING;

	if (this.sources.length)
		this.subscribe();
	else
		this.sink.end(null);
}

Concat.prototype = {
	emit: function (value) {
		this.sink.emit(value);
	},
	end: function (err) {
		this.source = null;

		if (err || !this.sources.length) {
			this.sources.length = 0;
			this.sink.end(err);
		} else {
			this.subscribe();
		}
	},
	setState: function (state) {
		if (this.state !== state && this.state !== Asyncplify.states.CLOSED) {
			this.state = state;
			if (this.source) this.source.setState(state);
			this.subscribe();
		}
	},
	subscribe: function () {
		if (!this.isSubscribing) {
			while (this.sources.length && !this.source && this.state === Asyncplify.states.RUNNING) {
				this.isSubscribing = true;
				this.sources.shift()._subscribe(this);
				this.isSubscribing = false;
			}
		}
	}
};