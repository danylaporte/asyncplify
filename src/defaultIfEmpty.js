Asyncplify.prototype.defaultIfEmpty = function (value) {
    return new Asyncplify(DefaultIfEmpty, value, this);
};

function DefaultIfEmpty(value, sink, source) {
    this.hasValue = false;
    this.sink = sink;
    this.sink.source = this;
    this.source = null;
    this.value = value;

    source._subscribe(this);
}

DefaultIfEmpty.prototype = {
    emit: function (value) {
        this.hasValue = true;
        this.sink.emit(value);
    },
    end: function (err) {
        this.source = null;

        if (!this.hasValue && !err)
            this.sink.emit(this.value);

        this.sink.end(err);
    },
    setState: function (state) {
        if (this.source) this.source.setState(state);
    }
};