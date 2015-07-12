Asyncplify.concat = function (sources) {
	return new Asyncplify(Concat, sources);	
};

Asyncplify.prototype.concat = function (sources) {
	return new Asyncplify(Concat, [this].concat(sources));	
};

function Concat(sources, sink) {
	this.isSubscribing = true;
	this.sink = sink;
	this.sink.source = this;
	this.source = null;
	this.sources = (sources || []).concat();
	
	if (!this.sources.length) { 
		this.sink.end(null);
	} else {
		while (this.sources.length && !this.source)
			this.sources.shift()._subscribe(this);
		this.isSubscribing = false;
	}
}

Concat.prototype = {
	close: function () {
		this.sink = null;
		this.sources.length = 0;
		if (this.source) this.source.close();
		this.source = null;
	},
	emit: function (value) {
		this.sink.emit(value);
	},
	end: function (err) {
		this.source = null;
		
		if (err || !this.sources.length) {
			this.sources.length = 0;
			this.sink.end(err);
		} else if (!this.isSubscribing) {
			this.isSubscribing = true;
			this.sources.shift()._subscribe(this);
			this.isSubscribing = false;
		}
	}
};