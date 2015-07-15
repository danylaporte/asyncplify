Asyncplify.prototype.sum = function (mapper, source, cb) {
    return new Asyncplify(Sum, mapper || identity, this);
};

function Sum(mapper, sink, source) {
    this.hasValue = false;
    this.mapper = mapper;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.value = 0;

    source._subscribe(this);
}

Sum.prototype = {
    emit: function (value) {
        this.value += this.mapper(value) || 0;
        this.hasValue = true;
    },
    end: function (err) {
        this.source = null;
        if (!err && this.hasValue && this.sink) this.sink.emit(this.value);
        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};