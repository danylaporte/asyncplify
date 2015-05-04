Asyncplify.prototype.transduce = function (transformer, source, cb) {
    return new Asyncplify(Transduce, transformer, this)
}

function Transduce(transformer, on, source) {
	this.acc = null;
    this.on = on;
    this.source = null;
	this.transformer = transformer(this);
	this.transformer['@@transducer/init']();

    on.source = this;
    source._subscribe(this);
}

Transduce.prototype = {
	'@@transducer/init': function (acc) {
		this.acc = acc;
	},
	'@@transducer/step': function (acc, value) {
		this.on.emit(value);
		return value;	
	},
	'@@transducer/result': function (acc) {
		this.on.end(acc);
	},
    emit: function (value) {
        this.acc = this.transformer["@@transducer/step"](this.acc, value);
    },
    end: function (err) {
		err ? this.transformer["@@transducer/result"](this.acc) : this.on.end(err);
    },
    setState: setStateThru
}