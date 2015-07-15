Asyncplify.prototype.transduce = function (transformer, source, cb) {
    return new Asyncplify(Transduce, transformer, this);
};

function Transduce(transformer, sink, source) {
	this.acc = null;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
	this.transformer = transformer(this);
	this.transformer['@@transducer/init']();

    source._subscribe(this);
}

Transduce.prototype = {
	'@@transducer/init': function (acc) {
		this.acc = acc;
	},
	'@@transducer/step': function (acc, value) {
		this.sink.emit(value);
		return value;	
	},
	'@@transducer/result': function (acc) {
        this.source = null;
		this.sink.end(acc);
	},
    emit: function (value) {
        this.acc = this.transformer["@@transducer/step"](this.acc, value);
    },
    end: function (err) {
		err ? this.transformer["@@transducer/result"](this.acc) : this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};