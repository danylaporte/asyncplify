Asyncplify.prototype.expand = function (selector) {
	return new Asyncplify(Expand, selector, this);
};

function Expand(mapper, sink, source) {
	this.error = null;
	this.items = [];
	this.mapper = mapper || identity;
	this.selectPending = false;
	this.sink = sink;
	this.sink.source = this;
    this.source = null;
	this.value = undefined;

    source._subscribe(this);
}

Expand.prototype = {
	close: function () {
		if (this.source) this.source.close();
		this.mapper = noop;
		this.source = null;
		this.sink = NoopSink.instance;
	},
    emit: function (value) {
		this.sink.emit(value);

		var source = this.mapper(value);

		if (source) {
			var item = new ExpandItem(this);
			this.items.push(item);
			source._subscribe(item);
		}
    },
    end: function (err) {
		this.source = null;

		if (err) {
			for (var i = 0; i < this.items.length; i++)
				this.items[i].close();

			this.items.length = 0;
		}

		if (!this.items.length) {
			this.mapper = noop;
			this.sink.end(err);
		}
	}
};

function ExpandItem(parent) {
	this.parent = parent;
	this.source = null;
}

ExpandItem.prototype = {
	close: function () {
		if (this.source) this.source.close();
		this.source = null;
	},
	emit: function (v) {
		this.parent.emit(v);
	},
	end: function (err) {
		this.source = null;
		removeItem(this.parent.items, this);
		
		if (err) {
			for (var i = 0; i < this.parent.items.length; i++)
				this.parent.items[i].close();
				
			this.parent.items.length = 0;
		}
		
		if (!this.parent.items.length && !this.source) {
			this.parent.mapper = noop;
			this.parent.sink.end(err);
		}
	}
};