Asyncplify.prototype.expand = function (selector) {
	return new Asyncplify(Expand, selector, this);
};

//TODO Add isSubscribing to expand
//TODO Better implement pause 

function Expand(mapper, sink, source) {
	this.error = null;
	this.items = [];
	this.mapper = mapper || identity;
	this.selectPending = false;
	this.sink = sink;
	this.sink.source = this;
	this.state = Asyncplify.states.RUNNING;
    this.source = null;
	this.subscribables = [];
	this.value = undefined;

    source._subscribe(this);
}

Expand.prototype = {
    emit: function (value) {
		if (this.state !== Asyncplify.states.CLOSED) {
			this.sink.emit(value);
	
			var source = this.mapper(value);
	
			if (source) {
				var item = new ExpandItem(this);
				this.items.push(item);
				source._subscribe(item);
			}
		}
    },
    end: function (err) {
		this.source = null;

		if (err) {
			for (var i = 0; i < this.items.length; i++)
				this.items[i].setState(Asyncplify.states.CLOSED);

			this.items.length = 0;
		}

		if (!this.items.length) {
			this.mapper = noop;
			this.sink.end(err);
		}
	},
	setState: function (state) {
		this.state = state;
		
		if (this.source) this.source.setState(state);
		
		for (var i = 0; i < this.items.length; i++)
			this.items[i].setState(state);
	}
};

function ExpandItem(parent) {
	this.parent = parent;
	this.source = null;
}

ExpandItem.prototype = {
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
	},
	setState: function (state) {
		if (this.source) this.source.setState(state);
	}
};