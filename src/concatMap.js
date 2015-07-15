Asyncplify.prototype.concatMap = function (mapper) {
	return new Asyncplify(ConcatMap, mapper, this);
};

function ConcatMap(mapper, sink, source) {
	this.isSubscribing = false;
	this.items = [];
	this.mapItem = null;
	this.mapper = mapper || identify;
	this.sink = sink;
	this.sink.source = this;
	this.source = null;
	this.state = Asyncplify.states.RUNNING;

	source._subscribe(this);
}

ConcatMap.prototype = {
	childEnd: function (err) {
		this.mapItem = null;

		if (err || (!this.items.length && !this.source)) {
			this.items.length = 0;
			if (this.source) this.source.setState(Asyncplify.states.CLOSED);
			this.source = null;
			this.sink.end(err);
		} else if (!this.isSubscribing) {
			this.subscribe();
		}
	},
	emit: function (value) {
		this.items.push(this.mapper(value));
		this.subscribe();
	},
	end: function (err) {
		this.source = null;
		
		if (err || (!this.mapItem && !this.items.length)) {
			if (this.mapItem) this.mapItem.setState(Asyncplify.states.CLOSED);
			this.mapItem = null;
			this.items.length = 0;
			this.sink.end(err);
		}
	},
	setState: function (state) {
		if (this.state !== state && this.state !== Asyncplify.states.CLOSED) {
			this.state = state;
			if (this.mapItem) this.mapItem.setState(state);
			if (this.source) this.source.setState(state);
			this.subscribe();
		}
	},
	subscribe: function () {
		while (!this.mapItem && this.items.length && this.state === Asyncplify.states.RUNNING) {
			this.isSubscribing = true;
			this.mapItem = new FlatMapItem(this);
			this.items.shift()._subscribe(this.mapItem);
			this.isSubscribing = false;
		}
	}
};