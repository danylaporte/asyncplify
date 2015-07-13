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

	source._subscribe(this);
}

ConcatMap.prototype = {
	childEnd: function (err) {
		this.mapItem = null;

		if (err || (!this.items.length && !this.source)) {
			this.items.length = 0;
			if (this.source) this.source.close();
			this.source = null;
			this.sink.end(err);
		} else if (!this.isSubscribing) {
			this.subscribe();
		}
	},
	close: function () {
		this.sink = NoopSink.instance;
		this.items.length = 0;
		if (this.mapItem) this.mapItem.close();
		if (this.source) this.source.close();
		this.source = this.mapItem = null;
	},
	emit: function (value) {
		this.items.push(this.mapper(value));
		if (!this.mapItem) this.subscribe();
	},
	end: function (err) {
		this.source = null;
		
		if (err || (!this.mapItem && !this.items.length)) {
			if (this.mapItem) this.mapItem.close();
			this.mapItem = null;
			this.items.length = 0;
			this.sink.end(err);
		}
	},
	subscribe: function () {
		while (this.items.length && !this.mapItem) {
			this.isSubscribing = true;
			this.mapItem = new FlatMapItem(this);
			this.items.shift()._subscribe(this.mapItem);
			this.isSubscribing = false;
		}
	}
};